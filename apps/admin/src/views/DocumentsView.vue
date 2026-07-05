<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  PDF_BUCKET,
  storagePublicUrl,
  type DocumentRow,
  type DocumentStatus,
} from '@huayuan/shared'
import AppDrawer from '../components/AppDrawer.vue'
import { useDrawer } from '../composables/useDrawer'
import { api } from '../lib/api'
import { badgeClass } from '../lib/badge'
import { toast } from '../lib/toast'
import { useDataStore } from '../stores/data'
import { useUiStore } from '../stores/ui'

const data = useDataStore()
const ui = useUiStore()
const { visible, open, openDrawer, closeDrawer } = useDrawer()

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
    toast('請填入 PDF 檔名', true)
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

async function del(id: number) {
  if (!confirm('確定刪除此文檔記錄？（Storage 上的 PDF 不受影響）')) return
  try {
    await api.documents.remove(id)
  } catch (error) {
    toast('刪除失敗：' + (error as Error).message, true)
    return
  }
  data.documents = data.documents.filter((x) => x.id !== id)
  toast('已刪除')
}

onMounted(() => {
  if (ui.consumeDrawer('documents')) setTimeout(openNew, 100)
})
</script>

<template>
  <div>
    <div class="row-between">
      <div class="text-muted" style="font-size: 14px">
        PDF 上傳至 Supabase Storage <code>pdfs</code> bucket，此處管理顯示資訊
      </div>
      <button class="btn btn-dark" @click="openNew">＋ 新增文檔</button>
    </div>

    <div class="upload-zone mb-2">
      <div class="uz-icon">⬆</div>
      <p>PDF 請上傳至 Supabase Storage 的 <strong>pdfs</strong> bucket</p>
      <small>上傳後在下方填入檔名即可自動產生下載連結</small>
    </div>

    <div class="card">
      <div class="th" style="grid-template-columns: 1fr 1fr 160px 86px 110px">
        <span>文檔名稱</span><span>說明</span><span>檔名（pdfs/…）</span><span>狀態</span>
        <span style="text-align: right">操作</span>
      </div>
      <div v-if="!data.loaded" class="loading">讀取中…</div>
      <div v-else-if="!data.documents.length" class="empty">尚無文檔，點擊「新增文檔」開始新增</div>
      <template v-else>
        <div
          v-for="d in data.documents"
          :key="d.id"
          class="tr"
          style="grid-template-columns: 1fr 1fr 160px 86px 110px"
        >
          <span style="display: flex; align-items: center; gap: 10px">
            <span
              style="
                width: 28px;
                height: 28px;
                border-radius: 6px;
                background: #f2e4c8;
                color: var(--gold);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                flex-shrink: 0;
              "
            >
              ▤
            </span>
            <span>{{ d.name }}</span>
          </span>
          <span class="text-muted" style="font-size: 13px">{{ d.description || '—' }}</span>
          <span>
            <a
              :href="pdfUrl(d.filename)"
              target="_blank"
              style="font-size: 12px; color: var(--gold); text-decoration: none"
              title="開啟PDF"
            >
              {{ d.filename }} ↗
            </a>
          </span>
          <span>
            <span class="badge" :class="badgeClass(d.status)">{{ d.status }}</span>
          </span>
          <span class="tbl-act">
            <span class="edit-link" @click="openEdit(d)">編輯</span>
            <span class="divider">|</span>
            <button class="btn-del" @click="del(d.id)">刪除</button>
          </span>
        </div>
      </template>
    </div>

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
        <label class="lbl">PDF 檔名（存於 Supabase Storage 的 pdfs bucket）</label>
        <input v-model="form.filename" class="inp" placeholder="例：heart-sutra.pdf" />
        <div style="font-size: 12px; color: var(--muted); margin-top: 6px">
          下載網址將自動變為：<br />
          <code style="font-size: 11px; color: var(--gold)">{{ urlPreview }}</code>
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
