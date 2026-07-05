<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
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

/** 同舊站 exportCSV():UTF-8 BOM(Excel 相容)、同欄位與檔名格式 */
function exportCSV() {
  if (!data.registrations.length) {
    toast('沒有資料可匯出', true)
    return
  }
  const rows = [['姓名', '課程', '電話', 'Email', '備註', '報名時間']]
  data.registrations.forEach((r) =>
    rows.push([
      r.name,
      r.course_name || '',
      r.phone || '',
      r.email || '',
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
      <div style="display: flex; gap: 10px; align-items: center">
        <select v-model="courseFilter" class="inp" style="width: 220px">
          <option value="">全部課程</option>
          <option v-for="c in data.courses" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
        </select>
        <span class="text-muted" style="font-size: 13px"
          >共 {{ data.registrations.length }} 筆</span
        >
      </div>
      <button class="btn btn-outline btn-sm" @click="exportCSV">⬇ 匯出 CSV</button>
    </div>

    <div class="card">
      <div class="th" style="grid-template-columns: 1fr 1fr 130px 160px 110px">
        <span>姓名</span><span>課程</span><span>電話</span><span>Email</span><span>報名時間</span>
      </div>
      <div v-if="loading" class="loading">讀取中…</div>
      <div v-else-if="!data.registrations.length" class="empty">尚無報名資料</div>
      <template v-else>
        <div
          v-for="r in data.registrations"
          :key="r.id"
          class="tr"
          style="grid-template-columns: 1fr 1fr 130px 160px 110px"
        >
          <span>{{ r.name }}</span>
          <span class="text-muted" style="font-size: 13px">{{ r.course_name || '—' }}</span>
          <span class="text-muted" style="font-size: 13px">{{ r.phone || '—' }}</span>
          <span class="text-muted" style="font-size: 13px">{{ r.email || '—' }}</span>
          <span class="text-muted" style="font-size: 12px">
            {{ r.created_at ? r.created_at.slice(0, 10) : '—' }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>
