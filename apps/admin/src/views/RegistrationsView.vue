<script setup lang="ts">
import { h, onMounted, ref, watch } from 'vue'
import { type DataTableColumns } from 'naive-ui'
import type { Registration } from '@huayuan/shared'
import AdminDataTable from '../components/AdminDataTable.vue'
import { toast } from '../lib/toast'
import { useDataStore } from '../stores/data'

const data = useDataStore()
const courseFilter = ref('')
const loading = ref(true)

async function fetchList() {
  loading.value = true
  try {
    await data.fetchRegistrations(courseFilter.value)
  } catch (error) {
    toast('讀取失敗：' + (error as Error).message, true)
  }
  loading.value = false
}

onMounted(fetchList)
watch(courseFilter, fetchList)

const columns: DataTableColumns<Registration> = [
  {
    title: '姓名',
    key: 'name',
    ellipsis: { tooltip: true },
  },
  {
    title: '課程',
    key: 'course_name',
    ellipsis: { tooltip: true },
    render: (row) => h('span', { class: 'text-[13px] text-muted' }, row.course_name || '—'),
  },
  {
    title: '電話',
    key: 'phone',
    width: 130,
    render: (row) => h('span', { class: 'text-[13px] text-muted' }, row.phone || '—'),
  },
  {
    title: 'Email',
    key: 'email',
    width: 160,
    ellipsis: { tooltip: true },
    render: (row) => h('span', { class: 'text-[13px] text-muted' }, row.email || '—'),
  },
  {
    title: '年齡',
    key: 'age',
    width: 64,
    render: (row) => h('span', { class: 'text-[13px] text-muted' }, row.age || '—'),
  },
  {
    title: '性別',
    key: 'gender',
    width: 64,
    render: (row) => h('span', { class: 'text-[13px] text-muted' }, row.gender || '—'),
  },
  {
    title: '上課地點',
    key: 'venue',
    width: 120,
    ellipsis: { tooltip: true },
    render: (row) => h('span', { class: 'text-[13px] text-muted' }, row.venue || '—'),
  },
  {
    title: '報名時間',
    key: 'created_at',
    width: 110,
    render: (row) =>
      h(
        'span',
        { class: 'text-xs text-muted' },
        row.created_at ? row.created_at.slice(0, 10) : '—',
      ),
  },
]

/** 同舊站 exportCSV():UTF-8 BOM(Excel 相容)、同欄位與檔名格式 */
function exportCSV() {
  if (!data.registrations.length) {
    toast('沒有資料可匯出', true)
    return
  }
  const rows = [
    [
      '姓名',
      '課程',
      '電話',
      'Email',
      '年齡',
      '性別',
      '上課地點',
      '修學背景',
      '如何得知本課程',
      '課程期望',
      '備註',
      '報名時間',
    ],
  ]
  data.registrations.forEach((r) =>
    rows.push([
      r.name,
      r.course_name || '',
      r.phone || '',
      r.email || '',
      r.age || '',
      r.gender || '',
      r.venue || '',
      r.dharma_background || '',
      r.referral_source || '',
      r.expectation || '',
      r.note || '',
      r.created_at ? r.created_at.slice(0, 10) : '',
    ]),
  )
  const csv = rows
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `registrations_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
}
</script>

<template>
  <div>
    <div class="row-between">
      <div class="flex items-center gap-[10px]">
        <select v-model="courseFilter" class="inp w-[220px]">
          <option value="">全部課程</option>
          <option v-for="c in data.courses" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
        </select>
      </div>
      <button class="btn btn-outline btn-sm" @click="exportCSV">⬇ 匯出 CSV</button>
    </div>

    <AdminDataTable
      :columns="columns"
      :data="data.registrations"
      :loading="loading"
      :reset-key="courseFilter"
      :scroll-x="960"
      item-label="報名"
      count-unit="筆"
      empty-text="尚無報名資料"
    />
  </div>
</template>
