<script setup lang="ts">
import type { Announcement } from '@huayuan/shared'

// 最新公告改為列表式(取代原月曆檢視)。announcements 已由 news.vue 依分類篩選,
// 且來源 listPublished() 以 created_at 倒序排列,故此處維持傳入順序(最新在前)。
defineProps<{ announcements: Announcement[] }>()
</script>

<template>
  <div class="news-list fadein">
    <template v-if="announcements.length">
      <div v-for="ann in announcements" :key="ann.id" class="news-list-item">
        <div class="news-list-meta">
          <span class="news-list-date">{{ ann.date || '日期未定' }}</span>
          <span class="news-list-tag">{{ ann.tag }}</span>
        </div>
        <div class="news-list-body">
          <div class="news-list-title">{{ ann.title }}</div>
          <p v-if="ann.content" class="news-list-content">{{ ann.content }}</p>
        </div>
      </div>
    </template>
    <div v-else class="empty-msg">目前尚無公告。</div>
  </div>
</template>
