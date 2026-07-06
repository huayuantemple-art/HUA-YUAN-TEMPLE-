<script setup lang="ts">
const api = useApi()
const { copy } = useSiteCopy()
const { data: courses, pending } = useLazyAsyncData('courses', () => api.courses.listPublic())
const list = computed(() => courses.value ?? [])
</script>

<template>
  <div>
    <div class="banner">
      <div class="banner-en">COURSES</div>
      <h1>課程報名</h1>
      <p>歡迎報名參加，共沐法雨</p>
    </div>
    <div class="sec">
      <div>
        <div v-if="pending" class="loading">讀取中…</div>
        <template v-else-if="list.length">
          <div v-for="c in list" :key="c.id" class="course-row fadein">
            <div>
              <div class="course-name">{{ c.name }}</div>
              <div class="course-meta">
                {{ c.schedule || '' }} {{ c.level ? '｜ ' + c.level : '' }}
              </div>
              <div
                v-if="c.description"
                style="font-size: 13px; color: #8a6f55; margin-top: 6px; line-height: 1.8"
              >
                {{ c.description }}
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 14px; flex-shrink: 0">
              <span class="course-badge" :class="{ 'course-badge-full': c.status === '額滿' }">{{
                c.status
              }}</span>
              <NuxtLink
                v-if="c.status === '招生中'"
                to="/signup"
                class="btn-gold"
                style="padding: 10px 24px; font-size: 14px"
                >報名 →</NuxtLink
              >
            </div>
          </div>
        </template>
        <div v-else class="empty-msg">目前尚無開放報名的課程，請關注最新公告。</div>
      </div>
      <div
        style="
          margin-top: 48px;
          padding: 32px;
          background: #f0e7d4;
          border: 1px solid rgba(201, 162, 75, 0.3);
          text-align: center;
        "
      >
        <div
          style="
            font-family: 'Noto Serif TC', serif;
            font-size: 20px;
            color: #3a211c;
            margin-bottom: 12px;
          "
        >
          {{ copy('course_form_title') }}
        </div>
        <p style="font-size: 14px; color: #8a6f55; margin-bottom: 20px">
          {{ copy('course_form_note') }}
        </p>
        <NuxtLink to="/signup" class="btn-gold">前往報名 →</NuxtLink>
      </div>
    </div>
  </div>
</template>
