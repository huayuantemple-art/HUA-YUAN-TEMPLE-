<script setup lang="ts">
const api = useApi()
const { data: videos, pending } = useLazyAsyncData('videos', () => api.videos.listPublished())
const list = computed(() => videos.value ?? [])
</script>

<template>
  <div>
    <div class="banner">
      <div class="banner-en">VIDEO TEACHING</div>
      <h1>法師說法</h1>
    </div>
    <div class="sec">
      <div class="grid3">
        <div v-if="pending" class="loading" style="grid-column: 1/-1">讀取中…</div>
        <template v-else-if="list.length">
          <a
            v-for="v in list"
            :key="v.id"
            class="video-thumb fadein"
            :href="v.youtube_url || '#'"
            target="_blank"
            rel="noopener"
          >
            <div class="video-play">▶</div>
            <div class="video-label">{{ v.title }}</div>
          </a>
        </template>
        <div v-else class="empty-msg" style="grid-column: 1/-1">目前尚無影片，敬請期待。</div>
      </div>
    </div>
  </div>
</template>
