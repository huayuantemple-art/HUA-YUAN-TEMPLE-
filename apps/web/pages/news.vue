<script setup lang="ts">
import { sortAnnouncementsByDate } from '@huayuan/shared'

useSeoMeta({
  title: '最新公告 · 華圓覺苑',
  description:
    '華圓覺苑最新法會、課程與活動公告，掌握道場近期消息與報名資訊。',
  ogTitle: '最新公告 · 華圓覺苑',
  ogDescription:
    '華圓覺苑最新法會、課程與活動公告，掌握道場近期消息與報名資訊。',
})

const api = useApi()
const { data: ann, pending } = useLazyAsyncData(
  'announcements',
  () => api.announcements.listPublished(),
  { transform: sortAnnouncementsByDate },
)

const filters = ['全部', '課程', '法會', '公告']
// 同舊站:activeFilter 為 session 全域,離開再回來仍套用上次選的分類
const activeFilter = useState('news-filter', () => '全部')

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
    <NewsMarquee :announcements="ann ?? []" />
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
      <NewsList v-else :announcements="list" />
    </div>
  </div>
</template>
