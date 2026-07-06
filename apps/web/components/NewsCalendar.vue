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

// 初始月份錨定「今天之後最近的公告月份」(行事曆語意:先看接下來要幹嘛),
// 沒有未來公告則退回最近的過去公告月份;完全沒有公告退回當月。
// ISR 60s 再生,setup 於 server 取日期的誤差最多一天,只在跨月邊界影響落點,可接受。
function anchorMonth(): { year: number; month: number } {
  const now = new Date()
  const todayKey = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const keyOf = (i: CalItem) => i.year * 10000 + i.month * 100 + i.day
  const sorted = [...items.value].sort((a, b) => keyOf(a) - keyOf(b))
  const pick = sorted.find((i) => keyOf(i) >= todayKey) ?? sorted[sorted.length - 1]
  return pick
    ? { year: pick.year, month: pick.month }
    : { year: now.getFullYear(), month: now.getMonth() + 1 }
}
const initial = anchorMonth()
const viewYear = ref(initial.year)
const viewMonth = ref(initial.month)

const selected = ref<{ year: number; month: number; day: number } | null>(null)
// 使用者手動切月/選日後,資料補到也不再自動跳月
const userTouched = ref(false)

// 「今天」於 mounted 後在客戶端套用(僅作月格標記),避免 server 時區差異進 ISR 快取
const today = ref<{ year: number; month: number; day: number } | null>(null)
onMounted(() => {
  const now = new Date()
  today.value = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
})

// 客戶端導頁進來時資料晚於 setup 才到,補到後重新錨定月份
watch(items, () => {
  if (userTouched.value) return
  const anchor = anchorMonth()
  viewYear.value = anchor.year
  viewMonth.value = anchor.month
})

function shiftMonth(delta: number) {
  userTouched.value = true
  const next = new Date(viewYear.value, viewMonth.value - 1 + delta, 1)
  viewYear.value = next.getFullYear()
  viewMonth.value = next.getMonth() + 1
  // 換月後下方列表改列新月份,原本選的日期已不在畫面上,一併清除
  selected.value = null
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
// 再點一次已選日期 = 取消選取,回到本月列表
function selectDay(day: number) {
  userTouched.value = true
  selected.value = isSelected(day)
    ? null
    : { year: viewYear.value, month: viewMonth.value, day }
}

function dateLabel(year: number, month: number, day: number) {
  return `${year} 年 ${month} 月 ${day} 日`
}

// 日曆下方列表與月曆對應:未選日期時列出「顯示中月份」的公告(依日序),選了日期只列該日
const groups = computed(() => {
  const s = selected.value
  if (s) {
    const anns = (byDay.value.get(`${s.year}-${s.month}-${s.day}`) ?? []).map((i) => i.ann)
    return [{ label: dateLabel(s.year, s.month, s.day), anns }]
  }
  const map = new Map<number, { label: string; anns: Announcement[] }>()
  const monthItems = items.value.filter(
    (item) => item.year === viewYear.value && item.month === viewMonth.value,
  )
  for (const item of monthItems) {
    let group = map.get(item.day)
    if (!group) {
      group = { label: dateLabel(item.year, item.month, item.day), anns: [] }
      map.set(item.day, group)
    }
    group.anns.push(item.ann)
  }
  const dated = [...map.entries()].sort((a, b) => a[0] - b[0]).map(([, group]) => group)
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
      <div v-else class="empty-msg">本月無公告，可用上方 ‹ › 切換月份查看。</div>
    </div>
  </div>
</template>
