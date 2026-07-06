<script setup lang="ts">
const api = useApi()
const { copy } = useSiteCopy()
const { data: ann, pending } = useLazyAsyncData('announcements', () =>
  api.announcements.listPublished(),
)

const filters = ['全部', '課程', '法會', '公告']
// 同舊站:activeFilter 為 session 全域,離開再回來仍套用上次選的分類
const activeFilter = useState('news-filter', () => '全部')

// 跑馬燈與月曆內容分離:後台「網站文案 > 跑馬燈內容」每行一則;
// 留空時沿用舊行為(自動輪播最新公告標題前 6 筆)。內容重複兩份以無縫循環。
const marqueeItems = computed(() => {
  const custom = copy('news_marquee')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  return custom.length ? custom : (ann.value ?? []).slice(0, 6).map((n) => n.title)
})
const list = computed(() =>
  activeFilter.value === '全部'
    ? (ann.value ?? [])
    : (ann.value ?? []).filter((n) => n.tag === activeFilter.value),
)
</script>

<template>
  <div>
    <div class="banner">
      <div class="banner-en">LATEST NEWS</div>
      <h1>最新公告</h1>
      <p>課程招生 · 法會活動 · 道場消息</p>
    </div>
    <div class="marquee-bar">
      <div class="marquee-label">最新消息</div>
      <div class="marquee-track">
        <div class="marquee-inner">
          <template v-for="dup in 2">
            <span
              v-for="(text, i) in marqueeItems"
              :key="`${dup}-${i}`"
              style="
                display: inline-flex;
                align-items: center;
                gap: 12px;
                padding: 0 30px;
                color: #f2e4c8;
                font-size: 15px;
              "
              ><span style="color: #c9a24b; font-size: 10px">◆</span>{{ text }}</span
            >
          </template>
        </div>
      </div>
    </div>
    <div class="news-list-wrap" style="max-width: 980px; margin: 0 auto; padding: 48px 40px 80px">
      <div class="filters">
        <button
          v-for="f in filters"
          :key="f"
          class="filter-btn"
          :class="{ active: activeFilter === f }"
          @click="activeFilter = f"
        >
          {{ f }}
        </button>
      </div>
      <div v-if="pending" class="loading">讀取中…</div>
      <NewsCalendar v-else :announcements="list" />
    </div>
  </div>
</template>
