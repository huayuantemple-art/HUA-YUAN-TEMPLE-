<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue'
import { NDatePicker, useDialog, type DataTableColumns } from 'naive-ui'
import type { Announcement, AnnouncementStatus } from '@huayuan/shared'
import AdminDataTable from '../components/AdminDataTable.vue'
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
const dialog = useDialog()

const search = ref('')
const filter = ref('')

const list = computed(() => {
  const q = search.value.toLowerCase()
  return data.announcements.filter(
    (n) => (!q || n.title.toLowerCase().includes(q)) && (!filter.value || n.tag === filter.value),
  )
})

const drawerTitle = ref('新增公告')
const form = reactive({
  id: null as number | null,
  title: '',
  tag: '課程',
  date: null as string | null,
  content: '',
  status: '草稿' as AnnouncementStatus,
})

function openNew() {
  drawerTitle.value = '新增公告'
  Object.assign(form, { id: null, title: '', tag: '課程', date: null, content: '', status: '草稿' })
  openDrawer()
}

function openEdit(n: Announcement) {
  drawerTitle.value = '編輯公告'
  Object.assign(form, {
    id: n.id,
    title: n.title,
    tag: n.tag,
    date: n.date ?? null,
    content: n.content ?? '',
    status: n.status,
  })
  openDrawer()
}

async function save() {
  const p = {
    title: form.title.trim() || '（未命名）',
    tag: form.tag,
    date: form.date?.trim() ?? '',
    content: form.content.trim(),
    status: form.status,
  }
  try {
    if (form.id) await api.announcements.update(form.id, p)
    else await api.announcements.create(p)
  } catch (error) {
    toast('儲存失敗：' + (error as Error).message, true)
    return
  }
  toast('公告已儲存')
  closeDrawer()
  await data.reloadAnnouncements()
}

function del(row: Announcement) {
  dialog.warning({
    title: '確認刪除公告',
    content: `確定刪除「${row.title}」？此操作無法復原。`,
    positiveText: '刪除',
    negativeText: '取消',
    autoFocus: false,
    positiveButtonProps: { type: 'error', secondary: true },
    negativeButtonProps: { secondary: true },
    async onPositiveClick() {
      await removeAnnouncement(row.id)
    },
  })
}

async function removeAnnouncement(id: number) {
  try {
    await api.announcements.remove(id)
  } catch (error) {
    toast('刪除失敗：' + (error as Error).message, true)
    return
  }
  data.announcements = data.announcements.filter((x) => x.id !== id)
  toast('已刪除')
}

const columns: DataTableColumns<Announcement> = [
  {
    title: '日期',
    key: 'date',
    width: 110,
    render: (row) => h('span', { class: 'text-[13px] text-[#6b5a48]' }, row.date || '—'),
  },
  {
    title: '分類',
    key: 'tag',
    width: 76,
    render: (row) => h('span', { class: ['badge', badgeClass(row.tag)] }, row.tag),
  },
  {
    title: '標題',
    key: 'title',
    ellipsis: { tooltip: true },
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
  if (ui.consumeDrawer('announcements')) setTimeout(openNew, 100)
})
</script>

<template>
  <div>
    <div class="row-between">
      <div class="flex gap-[10px]">
        <input v-model="search" class="inp w-[220px]" placeholder="搜尋標題…" />
        <select v-model="filter" class="inp w-[120px]">
          <option value="">全部分類</option>
          <option>課程</option>
          <option>法會</option>
          <option>公告</option>
        </select>
      </div>
      <button class="btn btn-dark" @click="openNew">＋ 新增公告</button>
    </div>
    <AdminDataTable
      :columns="columns"
      :data="list"
      :loading="!data.loaded"
      :reset-key="`${search}:${filter}`"
      item-label="公告"
      empty-text="尚無符合的公告"
    />

    <AppDrawer :title="drawerTitle" :visible="visible" :open="open" @close="closeDrawer">
      <div class="fr">
        <label class="lbl">公告標題</label>
        <input v-model="form.title" class="inp" placeholder="請輸入標題…" />
      </div>
      <div class="fg g2">
        <div>
          <label class="lbl">分類</label>
          <select v-model="form.tag" class="inp">
            <option>課程</option>
            <option>法會</option>
            <option>公告</option>
          </select>
        </div>
        <div>
          <label class="lbl">發佈日期</label>
          <NDatePicker
            v-model:formatted-value="form.date"
            class="w-full [&_.n-input]:[--n-padding-left:14px] [&_.n-input]:[--n-padding-right:14px] [&_.n-input]:font-[inherit]"
            value-format="yyyy.MM.dd"
            type="date"
            clearable
            placeholder="2026.05.10"
          />
        </div>
      </div>
      <div class="fr">
        <label class="lbl">公告內文</label>
        <textarea
          v-model="form.content"
          class="inp"
          rows="7"
          placeholder="輸入詳細內容…"
        ></textarea>
      </div>
      <div class="fr">
        <label class="lbl">狀態</label>
        <select v-model="form.status" class="inp">
          <option>已發布</option>
          <option>草稿</option>
          <option>隱藏</option>
        </select>
      </div>
      <template #save>
        <button class="btn btn-gold" @click="save">儲存公告</button>
      </template>
    </AppDrawer>
  </div>
</template>
