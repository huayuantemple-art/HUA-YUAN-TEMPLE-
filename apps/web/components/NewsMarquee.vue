<script setup lang="ts">
import type { Announcement } from '@huayuan/shared'

const props = defineProps<{ announcements?: Announcement[] }>()
const { copy } = useSiteCopy()

// 跑馬燈內容:後台「網站文案 > 跑馬燈內容」每行一則;留空時沿用最新公告標題前 6 筆。
// 首頁與最新公告頁共用此元件,確保兩處內容完全一致。內容複製兩份以無縫循環。
const marqueeItems = computed(() => {
  const custom = copy('news_marquee')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  return custom.length ? custom : (props.announcements ?? []).slice(0, 6).map((n) => n.title)
})
</script>

<template>
  <div v-if="marqueeItems.length" class="marquee-bar">
    <div class="marquee-label">最新消息</div>
    <div class="marquee-track">
      <div class="marquee-inner">
        <template v-for="dup in 2">
          <span v-for="(text, i) in marqueeItems" :key="`${dup}-${i}`" class="marquee-item"
            ><span class="marquee-diamond">◆</span>{{ text }}</span
          >
        </template>
      </div>
    </div>
  </div>
</template>
