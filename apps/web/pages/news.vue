<script setup lang="ts">
const api = useApi()
const { data: ann, pending } = useLazyAsyncData('announcements', () =>
  api.announcements.listPublished(),
)

const filters = ['全部', '課程', '法會', '公告']
// 同舊站:activeFilter 為 session 全域,離開再回來仍套用上次選的分類
const activeFilter = useState('news-filter', () => '全部')

// 同舊站:跑馬燈取前 6 筆,內容重複兩份以無縫循環
const marqueeItems = computed(() => (ann.value ?? []).slice(0, 6))
const list = computed(() =>
  activeFilter.value === '全部'
    ? (ann.value ?? [])
    : (ann.value ?? []).filter((n) => n.tag === activeFilter.value),
)

// 同舊站:date 以 '.' 拆為 日 / 年.月
function dateParts(date: string | null) {
  const parts = (date || '').split('.')
  return { day: parts[2] || '', ym: parts.slice(0, 2).join('.') }
}
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
              v-for="n in marqueeItems"
              :key="`${dup}-${n.id}`"
              style="
                display: inline-flex;
                align-items: center;
                gap: 12px;
                padding: 0 30px;
                color: #f2e4c8;
                font-size: 15px;
              "
              ><span style="color: #c9a24b; font-size: 10px">◆</span>{{ n.title }}</span
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
      <div>
        <div v-if="pending" class="loading">讀取中…</div>
        <template v-else-if="list.length">
          <div
            v-for="n in list"
            :key="n.id"
            class="news-list-item fadein"
            style="
              display: flex;
              gap: 28px;
              padding: 26px 4px;
              border-bottom: 1px solid rgba(201, 162, 75, 0.25);
              align-items: flex-start;
            "
          >
            <div class="news-list-date" style="flex-shrink: 0; width: 100px; text-align: center">
              <div
                style="
                  font-family: 'Noto Serif TC', serif;
                  font-size: 22px;
                  color: #3a211c;
                  line-height: 1.1;
                "
              >
                {{ dateParts(n.date).day }}
              </div>
              <div style="font-size: 12px; color: #b8893a; letter-spacing: 0.1em; margin-top: 2px">
                {{ dateParts(n.date).ym }}
              </div>
            </div>
            <div class="news-list-tag" style="flex-shrink: 0; padding-top: 3px">
              <span
                style="font-size: 12px; padding: 4px 12px; background: #3a211c; color: #c9a24b"
                >{{ n.tag }}</span
              >
            </div>
            <div class="news-list-body" style="flex: 1">
              <div
                style="
                  font-family: 'Noto Serif TC', serif;
                  font-size: 19px;
                  color: #2a1a16;
                  margin-bottom: 7px;
                "
              >
                {{ n.title }}
              </div>
              <p style="font-size: 14px; color: #8a6f55; line-height: 1.9; margin: 0">
                {{ n.content || '' }}
              </p>
            </div>
          </div>
        </template>
        <div v-else class="empty-msg">此分類目前尚無公告。</div>
      </div>
    </div>
  </div>
</template>
