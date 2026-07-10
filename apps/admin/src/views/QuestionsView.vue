<script setup lang="ts">
import { h, onMounted, ref } from 'vue'
import { type DataTableColumns } from 'naive-ui'
import type { ContactMessage } from '@huayuan/shared'
import AdminDataTable from '../components/AdminDataTable.vue'
import { api } from '../lib/api'
import { badgeClass } from '../lib/badge'
import { toast } from '../lib/toast'

const rows = ref<ContactMessage[]>([])
const loading = ref(true)

async function fetchList() {
  loading.value = true
  try {
    rows.value = await api.contactMessages.listAll()
  } catch (error) {
    toast('讀取失敗：' + (error as Error).message, true)
  }
  loading.value = false
}

async function toggleStatus(row: ContactMessage) {
  const next = row.status === '已回覆' ? '未回覆' : '已回覆'
  try {
    await api.contactMessages.update(row.id, { status: next })
    row.status = next
    toast(next === '已回覆' ? '已標記為已回覆' : '已標記為未回覆')
  } catch (error) {
    toast('更新失敗：' + (error as Error).message, true)
  }
}

onMounted(fetchList)

const columns: DataTableColumns<ContactMessage> = [
  {
    title: '姓名',
    key: 'name',
    width: 120,
    ellipsis: { tooltip: true },
  },
  {
    title: '聯絡方式',
    key: 'contact',
    width: 170,
    ellipsis: { tooltip: true },
    render: (row) => h('span', { class: 'text-[13px] text-muted' }, row.contact || '—'),
  },
  {
    title: '提問內容',
    key: 'message',
    render: (row) => h('span', { class: 'text-[13px]' }, row.message),
  },
  {
    title: '時間',
    key: 'created_at',
    width: 110,
    render: (row) =>
      h('span', { class: 'text-xs text-muted' }, row.created_at ? row.created_at.slice(0, 10) : '—'),
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
      h(
        'button',
        {
          type: 'button',
          class:
            'edit-link appearance-none border-0 bg-transparent p-0 font-[inherit] leading-[inherit]',
          onClick: () => toggleStatus(row),
        },
        row.status === '已回覆' ? '標記未回覆' : '標記已回覆',
      ),
  },
]
</script>

<template>
  <div>
    <AdminDataTable
      :columns="columns"
      :data="rows"
      :loading="loading"
      item-label="提問"
      count-unit="則"
      empty-text="尚無學員提問"
    />
  </div>
</template>
