<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue'
import { useDialog, type DataTableColumns } from 'naive-ui'
import {
  PDF_BUCKET,
  storagePublicUrl,
  storageSafeObjectPath,
  type DocumentRow,
  type DocumentStatus,
  type Sutra,
} from '@huayuan/shared'
import AdminDataTable from '../components/AdminDataTable.vue'
import AppDrawer from '../components/AppDrawer.vue'
import { useDrawer } from '../composables/useDrawer'
import { api } from '../lib/api'
import { badgeClass } from '../lib/badge'
import { extractDocumentText } from '../lib/docText'
import { supabase } from '../lib/supabase'
import { toast } from '../lib/toast'
import { useDataStore } from '../stores/data'
import { useUiStore } from '../stores/ui'

const data = useDataStore()
const ui = useUiStore()
const { visible, open, openDrawer, closeDrawer } = useDrawer()
const dialog = useDialog()
const uploadingFile = ref(false)

// 檔案改存 Supabase Storage(task 5.10;bucket/組法單一來源在 packages/shared)
const pdfUrl = (filename: string) =>
  storagePublicUrl(import.meta.env.VITE_SUPABASE_URL, PDF_BUCKET, filename)
const pdfBase = pdfUrl('')

const drawerTitle = ref('新增佛法文檔')
const form = reactive({
  id: null as number | null,
  name: '',
  description: '',
  filename: '',
  status: '草稿' as DocumentStatus,
})

// 同舊站 updateDocPreview():輸入檔名即時預覽下載網址
const urlPreview = computed(() => {
  const fn = form.filename.trim()
  return fn ? pdfUrl(fn) : pdfBase + '…'
})

const DOCUMENT_FILE_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

function documentFileExtension(file: File): 'pdf' | 'docx' | null {
  return filenameExtension(file.name)
}

function filenameExtension(filename: string): 'pdf' | 'docx' | null {
  const extension = filename.split('.').pop()?.toLowerCase()
  return extension === 'pdf' || extension === 'docx' ? extension : null
}

// ── 同步線上閱讀(auto-sync-reading-from-documents)──
// 保留最近上傳檔的位元組供儲存時抽字;手填檔名(未經上傳按鈕)則自 storage 取檔
let pendingFileBytes: ArrayBuffer | null = null
let pendingFileExt: 'pdf' | 'docx' | null = null

function resetPendingFile() {
  pendingFileBytes = null
  pendingFileExt = null
}

async function extractTextForDocument(filename: string): Promise<string> {
  const extension = pendingFileExt ?? filenameExtension(filename)
  if (!extension) return ''
  let bytes = pendingFileBytes
  if (!bytes) {
    try {
      const res = await fetch(pdfUrl(filename))
      if (!res.ok) return ''
      bytes = await res.arrayBuffer()
    } catch {
      return ''
    }
  }
  return extractDocumentText(bytes, extension)
}

function linkedSutra(documentId: number): Sutra | undefined {
  return data.sutras.find((sutra) => sutra.document_id === documentId)
}

function documentStoragePath(file: File): string {
  const extension = documentFileExtension(file) ?? 'pdf'
  return storageSafeObjectPath(file.name, extension, `document-${Date.now()}`)
}

async function uploadDocumentFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const extension = documentFileExtension(file)
  if (!extension) {
    toast('請選擇 PDF 或 DOCX 檔', true)
    input.value = ''
    return
  }

  const path = documentStoragePath(file)
  uploadingFile.value = true
  try {
    const { error } = await supabase.storage.from(PDF_BUCKET).upload(path, file, {
      cacheControl: '3600',
      contentType: DOCUMENT_FILE_TYPES[extension],
      upsert: true,
    })
    if (error) throw error
    form.filename = path
    // 留存位元組,儲存時抽字建立線上閱讀內文
    pendingFileBytes = await file.arrayBuffer()
    pendingFileExt = extension
    toast('檔案已上傳')
  } catch (error) {
    toast('上傳失敗：' + (error as Error).message, true)
  } finally {
    uploadingFile.value = false
    input.value = ''
  }
}

function openNew() {
  drawerTitle.value = '新增佛法文檔'
  Object.assign(form, { id: null, name: '', description: '', filename: '', status: '草稿' })
  resetPendingFile()
  openDrawer()
}

function openEdit(d: DocumentRow) {
  drawerTitle.value = '編輯文檔'
  Object.assign(form, {
    id: d.id,
    name: d.name,
    description: d.description ?? '',
    filename: d.filename,
    status: d.status,
  })
  resetPendingFile()
  openDrawer()
}

async function save() {
  const p = {
    name: form.name.trim() || '（未命名文檔）',
    description: form.description.trim(),
    filename: form.filename.trim(),
    status: form.status,
  }
  if (!p.filename) {
    toast('請填入檔名或上傳檔案', true)
    return
  }
  const isNew = !form.id
  let created: DocumentRow | null = null
  try {
    if (form.id) await api.documents.update(form.id, p)
    else created = await api.documents.create(p)
  } catch (error) {
    toast('儲存失敗：' + (error as Error).message, true)
    return
  }

  // 同步線上閱讀:失敗不影響已儲存的文檔本體,單獨提示
  try {
    if (isNew && created) {
      const content = await extractTextForDocument(p.filename)
      const nextSeq = Math.max(0, ...data.sutras.map((sutra) => sutra.seq)) + 1
      await api.sutras.create({
        seq: nextSeq,
        title: p.name,
        translator: null,
        content,
        // 抽字失敗一律草稿,補內文後再發布(不讓空內文上前台)
        status: content ? p.status : '草稿',
        document_id: created.id,
      })
      toast(
        content
          ? '文檔已儲存，線上閱讀已同步'
          : '文檔已儲存；檔案抽不出文字（可能為掃描檔），線上閱讀已建立草稿，請至經文管理補內文後發布',
        !content,
      )
    } else if (form.id) {
      const sutra = linkedSutra(form.id)
      if (sutra) {
        // 空內文的經文不得因文檔發布而連動發布
        const nextStatus = p.status === '已發布' && !sutra.content.trim() ? '草稿' : p.status
        if (sutra.title !== p.name || sutra.status !== nextStatus) {
          await api.sutras.update(sutra.id, { title: p.name, status: nextStatus })
        }
      }
      toast('文檔已儲存，線上閱讀已同步')
    }
  } catch (error) {
    toast('文檔已儲存，但同步線上閱讀失敗：' + (error as Error).message, true)
  }
  closeDrawer()
  await Promise.all([data.reloadDocuments(), data.reloadSutras()])
}

function del(document: DocumentRow) {
  const sutra = linkedSutra(document.id)
  dialog.warning({
    title: '確認刪除文檔記錄',
    content: sutra
      ? `確定刪除「${document.name}」？將一併刪除對應的線上閱讀經文；Storage 上的檔案不受影響。`
      : `確定刪除「${document.name}」？Storage 上的 PDF 不受影響。`,
    positiveText: '刪除',
    negativeText: '取消',
    autoFocus: false,
    positiveButtonProps: { type: 'error', secondary: true },
    negativeButtonProps: { secondary: true },
    async onPositiveClick() {
      await removeDocument(document.id)
    },
  })
}

async function removeDocument(id: number) {
  const sutra = linkedSutra(id)
  try {
    await api.documents.remove(id)
    // 一併刪除對應經文,維持兩清單一致
    if (sutra) await api.sutras.remove(sutra.id)
  } catch (error) {
    toast('刪除失敗：' + (error as Error).message, true)
    await data.reloadSutras()
    return
  }
  data.documents = data.documents.filter((x) => x.id !== id)
  if (sutra) data.sutras = data.sutras.filter((x) => x.id !== sutra.id)
  toast('已刪除')
}

const columns: DataTableColumns<DocumentRow> = [
  {
    title: '文檔名稱',
    key: 'name',
    ellipsis: { tooltip: true },
    render: (row) =>
      h('span', { class: 'flex items-center gap-[10px]' }, [
        h(
          'span',
          {
            class:
              'flex size-7 shrink-0 items-center justify-center rounded-md bg-[#f2e4c8] text-xs text-[var(--gold)]',
          },
          '▤',
        ),
        h('span', row.name),
      ]),
  },
  {
    title: '說明',
    key: 'description',
    ellipsis: { tooltip: true },
    render: (row) => h('span', { class: 'text-[13px] text-muted' }, row.description || '—'),
  },
  {
    title: '檔名（pdfs/…）',
    key: 'filename',
    width: 160,
    ellipsis: { tooltip: true },
    render: (row) =>
      h(
        'a',
        {
          href: pdfUrl(row.filename),
          target: '_blank',
          class: 'text-xs text-[var(--gold)] no-underline',
          title: '開啟檔案',
        },
        `${row.filename} ↗`,
      ),
  },
  {
    title: '狀態',
    key: 'status',
    width: 86,
    render: (row) => h('span', { class: ['badge', badgeClass(row.status)] }, row.status),
  },
  {
    title: '操作',
    key: 'actions',
    width: 110,
    align: 'right',
    render: (row) =>
      h('span', { class: 'inline-flex items-center justify-end gap-[10px] whitespace-nowrap' }, [
        h(
          'button',
          {
            type: 'button',
            class:
              'edit-link appearance-none border-0 bg-transparent p-0 font-[inherit] leading-[inherit]',
            onClick: () => openEdit(row),
          },
          '編輯',
        ),
        h('span', { class: 'divider' }, '|'),
        h('button', { type: 'button', class: 'btn-del', onClick: () => del(row) }, '刪除'),
      ]),
  },
]

onMounted(() => {
  if (ui.consumeDrawer('documents')) setTimeout(openNew, 100)
})
</script>

<template>
  <div>
    <div class="row-between">
      <button class="btn btn-dark" @click="openNew">＋ 新增文檔</button>
    </div>

    <AdminDataTable
      :columns="columns"
      :data="data.documents"
      :loading="!data.loaded"
      item-label="文檔"
      count-unit="份"
      empty-text="尚無文檔，點擊「新增文檔」開始新增"
    />

    <AppDrawer :title="drawerTitle" :visible="visible" :open="open" @close="closeDrawer">
      <div class="fr">
        <label class="lbl">文檔名稱</label>
        <input v-model="form.name" class="inp" placeholder="例：般若波羅蜜多心經" />
      </div>
      <div class="fr">
        <label class="lbl">簡介說明</label>
        <textarea
          v-model="form.description"
          class="inp"
          rows="3"
          placeholder="簡短描述這份文檔的內容…"
        ></textarea>
      </div>
      <div class="fr">
        <label class="lbl" for="document-filename">檔名</label>
        <input
          id="document-filename"
          v-model="form.filename"
          class="inp"
          name="document-filename"
          placeholder="例：heart-sutra.pdf"
        />
        <div class="document-file-actions">
          <label
            class="btn btn-outline btn-sm cursor-pointer"
            :class="{ 'pointer-events-none opacity-60': uploadingFile }"
          >
            {{ uploadingFile ? '上傳中…' : '上傳 PDF / DOCX' }}
            <input
              class="hidden"
              type="file"
              accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
              :disabled="uploadingFile"
              @change="uploadDocumentFile"
            />
          </label>
          <span class="text-xs text-muted">上傳成功後會自動帶入檔名</span>
        </div>
        <div class="document-url-preview">
          下載網址將自動變為：<br />
          <code :title="urlPreview">
            {{ urlPreview }}
          </code>
        </div>
      </div>
      <div class="fr">
        <label class="lbl">狀態</label>
        <select v-model="form.status" class="inp">
          <option>已發布</option>
          <option>草稿</option>
        </select>
      </div>
      <div class="text-muted" style="font-size: 13px; line-height: 1.9">
        儲存後會自動同步「線上閱讀」：新增時自動抽取檔案文字建立經文（掃描檔抽不出文字則建草稿，請至經文管理補內文）；改名、狀態與刪除也會連動。
      </div>
      <template #save>
        <button class="btn btn-gold" @click="save">儲存文檔</button>
      </template>
    </AppDrawer>
  </div>
</template>

<style scoped>
.document-file-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.document-url-preview {
  max-width: 100%;
  margin-top: 8px;
  color: var(--muted);
  font-size: 12px;
}

.document-url-preview code {
  display: block;
  max-width: 100%;
  padding-top: 4px;
  color: var(--gold);
  font-size: 11px;
  line-height: 1.6;
  word-break: break-all;
}
</style>
