<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue'
import { useDialog, type DataTableColumns } from 'naive-ui'
import {
  PDF_BUCKET,
  storagePublicUrl,
  type DocumentRow,
  type DocumentStatus,
} from '@huayuan/shared'
import AdminDataTable from '../components/AdminDataTable.vue'
import AppDrawer from '../components/AppDrawer.vue'
import { useDrawer } from '../composables/useDrawer'
import { api } from '../lib/api'
import { badgeClass } from '../lib/badge'
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
  const extension = file.name.split('.').pop()?.toLowerCase()
  return extension === 'pdf' || extension === 'docx' ? extension : null
}

function documentStoragePath(file: File): string {
  const extension = documentFileExtension(file) ?? 'pdf'
  const fallback = `document-${Date.now()}.pdf`
  const filename = file.name.split(/[\\/]/).pop()?.trim() || fallback
  const safeName = filename.replace(/\s+/g, '-').replace(/[?#]/g, '')
  return safeName.toLowerCase().endsWith(`.${extension}`) ? safeName : `${safeName}.${extension}`
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
  try {
    if (form.id) await api.documents.update(form.id, p)
    else await api.documents.create(p)
  } catch (error) {
    toast('儲存失敗：' + (error as Error).message, true)
    return
  }
  toast('文檔已儲存')
  closeDrawer()
  await data.reloadDocuments()
}

function del(document: DocumentRow) {
  dialog.warning({
    title: '確認刪除文檔記錄',
    content: `確定刪除「${document.name}」？Storage 上的 PDF 不受影響。`,
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
  try {
    await api.documents.remove(id)
  } catch (error) {
    toast('刪除失敗：' + (error as Error).message, true)
    return
  }
  data.documents = data.documents.filter((x) => x.id !== id)
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
