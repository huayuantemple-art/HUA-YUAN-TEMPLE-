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

// 「今天」於 mounted 後在客戶端套用,避免 server 時區差異進 ISR 快取
const today = ref<{ year: number; month: number; day: number } | null>(null)
onMounted(() => {
  const now = new Date()
  today.value = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
  if (!first) {
    viewYear.value = today.value.year
    viewMonth.value = today.value.month
  }
  if (today.value.year === viewYear.value && today.value.month === viewMonth.value) {
    selected.value = today.value
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
function selectDay(day: number) {
  selected.value = { year: viewYear.value, month: viewMonth.value, day }
}

const selectedItems = computed(() => {
  const s = selected.value
  if (!s) return []
  return byDay.value.get(`${s.year}-${s.month}-${s.day}`) ?? []
})
const selectedLabel = computed(() => {
  const s = selected.value
  return s ? `${s.year} 年 ${s.month} 月 ${s.day} 日` : ''
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
      <template v-if="selected">
        <div class="news-cal-detail-date">{{ selectedLabel }}</div>
        <template v-if="selectedItems.length">
          <div v-for="item in selectedItems" :key="item.ann.id" class="news-cal-detail-item">
            <span class="news-cal-detail-tag">{{ item.ann.tag }}</span>
            <div>
              <div class="news-cal-detail-title">{{ item.ann.title }}</div>
              <p class="news-cal-detail-content">{{ item.ann.content || '' }}</p>
            </div>
          </div>
        </template>
        <div v-else class="empty-msg">此日期無公告。</div>
      </template>
      <div v-else class="empty-msg">點選有標記的日期查看公告。</div>
    </div>
  </div>
</template>
