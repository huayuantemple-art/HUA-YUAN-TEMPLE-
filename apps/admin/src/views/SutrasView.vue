<script setup lang="ts">
import { h, reactive, ref } from 'vue'
import { useDialog, type DataTableColumns } from 'naive-ui'
import type { Sutra, SutraStatus } from '@huayuan/shared'
import AdminDataTable from '../components/AdminDataTable.vue'
import AppDrawer from '../components/AppDrawer.vue'
import { useDrawer } from '../composables/useDrawer'
import { api } from '../lib/api'
import { badgeClass } from '../lib/badge'
import { toast } from '../lib/toast'
import { useDataStore } from '../stores/data'

const data = useDataStore()
const { visible, open, openDrawer, closeDrawer } = useDrawer()
const dialog = useDialog()

const drawerTitle = ref('新增經文')
const form = reactive({
  id: null as number | null,
  seq: 1,
  title: '',
  translator: '',
  content: '',
  status: '草稿' as SutraStatus,
})

function nextSeq(): number {
  return (Math.max(0, ...data.sutras.map((sutra) => sutra.seq)) || 0) + 1
}

function openNew() {
  drawerTitle.value = '新增經文'
  Object.assign(form, {
    id: null,
    seq: nextSeq(),
    title: '',
    translator: '',
    content: '',
    status: '草稿',
  })
  openDrawer()
}

function openEdit(sutra: Sutra) {
  drawerTitle.value = '編輯經文'
  Object.assign(form, {
    id: sutra.id,
    seq: sutra.seq,
    title: sutra.title,
    translator: sutra.translator ?? '',
    content: sutra.content,
    status: sutra.status,
  })
  openDrawer()
}

async function save() {
  const payload = {
    seq: Number(form.seq) || nextSeq(),
    title: form.title.trim() || '（未命名經文）',
    translator: form.translator.trim() || null,
    content: form.content.trim(),
    status: form.status,
  }
  if (!payload.content) {
    toast('請填入經文內文', true)
    return
  }

  try {
    if (form.id) await api.sutras.update(form.id, payload)
    else await api.sutras.create(payload)
  } catch (error) {
    toast('儲存失敗：' + (error as Error).message, true)
    return
  }

  toast('經文已儲存')
  closeDrawer()
  await data.reloadSutras()
}

function del(sutra: Sutra) {
  dialog.warning({
    title: '確認刪除經文',
    content: `確定刪除「${sutra.title}」？此操作無法復原。`,
    positiveText: '刪除',
    negativeText: '取消',
    autoFocus: false,
    positiveButtonProps: { type: 'error', secondary: true },
    negativeButtonProps: { secondary: true },
    async onPositiveClick() {
      await removeSutra(sutra.id)
    },
  })
}

async function removeSutra(id: number) {
  try {
    await api.sutras.remove(id)
  } catch (error) {
    toast('刪除失敗：' + (error as Error).message, true)
    return
  }
  data.sutras = data.sutras.filter((sutra) => sutra.id !== id)
  toast('已刪除')
}

const columns: DataTableColumns<Sutra> = [
  {
    title: '排序',
    key: 'seq',
    width: 76,
    render: (row) => h('span', { class: 'text-[13px] text-muted' }, row.seq),
  },
  {
    title: '經文',
    key: 'title',
    ellipsis: { tooltip: true },
    render: (row) =>
      h('span', { class: 'flex items-center gap-[10px]' }, [
        h(
          'span',
          {
            class:
              'flex size-7 shrink-0 items-center justify-center rounded-md bg-[#f2e4c8] text-xs text-[var(--gold)]',
          },
          '經',
        ),
        h('span', row.title),
      ]),
  },
  {
    title: '譯者',
    key: 'translator',
    ellipsis: { tooltip: true },
    render: (row) => h('span', { class: 'text-[13px] text-muted' }, row.translator || '—'),
  },
  {
    title: '段落',
    key: 'content',
    width: 80,
    render: (row) =>
      h('span', { class: 'text-[13px] text-muted' }, row.content.split(/\n+/).length),
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
</script>

<template>
  <div>
    <div class="row-between">
      <div class="text-muted" style="font-size: 14px">調整 seq、狀態或內文後，前台列表與閱讀頁會依資料庫內容呈現。</div>
      <button class="btn btn-dark" @click="openNew">＋ 新增經文</button>
    </div>

    <AdminDataTable
      :columns="columns"
      :data="data.sutras"
      :loading="!data.loaded"
      item-label="經文"
      count-unit="部"
      empty-text="尚無經文，點擊「新增經文」開始新增"
    />

    <AppDrawer :title="drawerTitle" :visible="visible" :open="open" @close="closeDrawer">
      <div class="fr">
        <label class="lbl">排序 seq</label>
        <input v-model.number="form.seq" class="inp" type="number" min="1" step="1" />
      </div>
      <div class="fr">
        <label class="lbl">標題</label>
        <input v-model="form.title" class="inp" placeholder="例：般若波羅蜜多心經" />
      </div>
      <div class="fr">
        <label class="lbl">譯者</label>
        <input v-model="form.translator" class="inp" placeholder="無譯者可留空" />
      </div>
      <div class="fr">
        <label class="lbl">內文</label>
        <textarea
          v-model="form.content"
          class="inp sutra-content-input"
          rows="16"
          placeholder="純文字內容；段落以換行分隔"
        ></textarea>
      </div>
      <div class="fr">
        <label class="lbl">狀態</label>
        <select v-model="form.status" class="inp">
          <option>已發布</option>
          <option>草稿</option>
        </select>
      </div>
      <template #save>
        <button class="btn btn-gold" @click="save">儲存經文</button>
      </template>
    </AppDrawer>
  </div>
</template>

<style scoped>
.sutra-content-input {
  min-height: 420px;
  line-height: 1.8;
}
</style>
