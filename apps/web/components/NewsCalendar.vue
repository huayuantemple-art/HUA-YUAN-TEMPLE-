<script setup lang="ts">
import { parseAnnouncementDate, type Announcement } from '@huayuan/shared'

const props = defineProps<{ announcements: Announcement[] }>()

interface CalItem {
  ann: Announcement
  year: number
  month: number
  day: number
}

// 僅收錄 date 可解析的公告;同日多則依 created_at 倒序
const items = computed<CalItem[]>(() =>
  props.announcements
    .map((ann) => {
      const parts = parseAnnouncementDate(ann.date)
      return parts ? { ann, ...parts } : null
    })
    .filter((item): item is CalItem => item !== null)
    .sort((a, b) => b.ann.created_at.localeCompare(a.ann.created_at)),
)

const byDay = computed(() => {
  const map = new Map<string, CalItem[]>()
  for (const item of items.value) {
    const key = `${item.year}-${item.month}-${item.day}`
    const list = map.get(key) ?? []
    list.push(item)
    map.set(key, list)
  }
  return map
})

// 初始月份 = 最新一筆可解析公告的年月;都不可解析時退回今天(客戶端才會修正,見 onMounted)
const first = items.value[0]
const viewYear = ref(first?.year ?? 2026)
const viewMonth = ref(first?.month ?? 1)

const selected = ref<{ year: number; month: number; day: number } | null>(null)

// 「今天」於 mounted 後在客戶端套用(僅作月格標記),避免 server 時區差異進 ISR 快取
const today = ref<{ year: number; month: number; day: number } | null>(null)
onMounted(() => {
  const now = new Date()
  today.value = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
  if (!first) {
    viewYear.value = today.value.year
    viewMonth.value = today.value.month
  }
})

function shiftMonth(delta: number) {
  const next = new Date(viewYear.value, viewMonth.value - 1 + delta, 1)
  viewYear.value = next.getFullYear()
  viewMonth.value = next.getMonth() + 1
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

// 月格:前置空格 + 當月天數(週日起始、7 欄)
const cells = computed(() => {
  const firstDow = new Date(viewYear.value, viewMonth.value - 1, 1).getDay()
  const daysInMonth = new Date(viewYear.value, viewMonth.value, 0).getDate()
  const list: (number | null)[] = Array.from({ length: firstDow }, () => null)
  for (let day = 1; day <= daysInMonth; day++) list.push(day)
  return list
})

function dayKey(day: number) {
  return `${viewYear.value}-${viewMonth.value}-${day}`
}
function hasNews(day: number) {
  return byDay.value.has(dayKey(day))
}
function isSelected(day: number) {
  const s = selected.value
  return !!s && s.year === viewYear.value && s.month === viewMonth.value && s.day === day
}
function isToday(day: number) {
  const t = today.value
  return !!t && t.year === viewYear.value && t.month === viewMonth.value && t.day === day
}
// 再點一次已選日期 = 取消選取,回到完整列表
function selectDay(day: number) {
  selected.value = isSelected(day)
    ? null
    : { year: viewYear.value, month: viewMonth.value, day }
}

function dateLabel(year: number, month: number, day: number) {
  return `${year} 年 ${month} 月 ${day} 日`
}

// 日曆下方列表:未選日期時列出全部(依日期倒序分組),選了日期只列該日
const groups = computed(() => {
  const s = selected.value
  if (s) {
    const anns = (byDay.value.get(`${s.year}-${s.month}-${s.day}`) ?? []).map((i) => i.ann)
    return [{ label: dateLabel(s.year, s.month, s.day), anns }]
  }
  const map = new Map<string, { label: string; anns: Announcement[]; sortKey: number }>()
  for (const item of items.value) {
    const key = `${item.year}-${item.month}-${item.day}`
    let group = map.get(key)
    if (!group) {
      group = {
        label: dateLabel(item.year, item.month, item.day),
        anns: [],
        sortKey: new Date(item.year, item.month - 1, item.day).getTime(),
      }
      map.set(key, group)
    }
    group.anns.push(item.ann)
  }
  const dated = [...map.values()].sort((a, b) => b.sortKey - a.sortKey)
  // date 無法解析的公告仍列於最末(不進月格,但不隱形)
  const undated = props.announcements.filter((ann) => !parseAnnouncementDate(ann.date))
  return undated.length ? [...dated, { label: '日期未定', anns: undated }] : dated
})
</script>

<template>
  <div class="news-cal fadein">
    <div class="news-cal-head">
      <button class="news-cal-nav" aria-label="上一月" @click="shiftMonth(-1)">‹</button>
      <div class="news-cal-title">{{ viewYear }} 年 {{ viewMonth }} 月</div>
      <button class="news-cal-nav" aria-label="下一月" @click="shiftMonth(1)">›</button>
    </div>
    <div class="news-cal-grid">
      <div v-for="w in WEEKDAYS" :key="w" class="news-cal-weekday">{{ w }}</div>
      <template v-for="(day, i) in cells">
        <div v-if="day === null" :key="`blank-${i}`" />
        <button
          v-else
          :key="`day-${day}`"
          class="news-cal-day"
          :class="{ selected: isSelected(day), today: isToday(day) }"
          @click="selectDay(day)"
        >
          <span class="news-cal-day-num">{{ day }}</span>
          <span v-if="hasNews(day)" class="news-cal-dot">◆</span>
        </button>
      </template>
    </div>
    <div class="news-cal-detail">
      <div v-if="selected" class="news-cal-detail-bar">
        <span>僅顯示所選日期</span>
        <button class="news-cal-clear" @click="selected = null">顯示全部 ×</button>
      </div>
      <template v-if="groups.some((g) => g.anns.length)">
        <div v-for="g in groups" :key="g.label" class="news-cal-group">
          <div class="news-cal-detail-date">{{ g.label }}</div>
          <div v-for="ann in g.anns" :key="ann.id" class="news-cal-detail-item">
            <span class="news-cal-detail-tag">{{ ann.tag }}</span>
            <div>
              <div class="news-cal-detail-title">{{ ann.title }}</div>
              <p class="news-cal-detail-content">{{ ann.content || '' }}</p>
            </div>
          </div>
        </div>
      </template>
      <div v-else-if="selected" class="empty-msg">此日期無公告。</div>
      <div v-else class="empty-msg">此分類目前尚無公告。</div>
    </div>
  </div>
</template>
