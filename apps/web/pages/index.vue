<script setup lang="ts">
const api = useApi()
const { copy, copyHtml } = useSiteCopy()
const { data: ann, pending: annPending } = useLazyAsyncData('announcements', () =>
  api.announcements.listPublished(),
)
const { data: videos, pending: vidPending } = useLazyAsyncData('videos', () =>
  api.videos.listPublished(),
)

// 同舊站:首頁公告取前 3 筆、影音取前 2 筆
const homeNews = computed(() => (ann.value ?? []).slice(0, 3))
const homeVideos = computed(() => (videos.value ?? []).slice(0, 2))
</script>

<template>
  <div>
    <!-- Hero -->
    <div
      class="hero-pad"
      style="
        padding: 96px 56px 92px;
        background: linear-gradient(180deg, #4a2a22, #3a211c);
        color: #f7efd9;
        text-align: center;
      "
    >
      <div
        class="hero-kicker"
        style="display: inline-flex; align-items: center; gap: 14px; margin-bottom: 26px"
      >
        <span
          class="hero-kicker-line"
          style="width: 50px; height: 1px; background: #c9a24b"
        ></span>
        <!-- eslint-disable vue/no-v-html -- copyHtml 已 escapeHtml,僅換行轉受控 <br> -->
        <span
          class="hero-kicker-text"
          style="font-size: 13px; letter-spacing: 0.4em; color: #c9a24b"
          v-html="copyHtml('home_hero_kicker')"
        ></span>
        <!-- eslint-enable vue/no-v-html -->

        <span
          class="hero-kicker-line"
          style="width: 50px; height: 1px; background: #c9a24b"
        ></span>
      </div>
      <h1
        class="hero-title"
        style="
          font-family: 'Noto Serif TC', serif;
          font-weight: 500;
          font-size: 60px;
          line-height: 1.5;
          margin: 0 0 24px;
          letter-spacing: 0.08em;
        "
      >
        {{ copy('home_hero_title') }}
      </h1>
      <!-- eslint-disable vue/no-v-html -- copyHtml 已 escapeHtml,僅換行轉受控 <br> -->
      <p
        class="hero-verse"
        style="
          font-size: 16px;
          line-height: 2.1;
          color: #d9c8a6;
          max-width: 580px;
          margin: 0 auto 40px;
        "
        v-html="copyHtml('home_hero_verse')"
      ></p>
      <!-- eslint-enable vue/no-v-html -->
      <div class="hero-btns" style="display: flex; gap: 16px; justify-content: center">
        <button class="btn-gold" @click="navigateTo('/course')">立即報名課程</button>
        <button
          class="btn-outline"
          style="color: #c9a24b; border-color: #c9a24b"
          @click="navigateTo('/about')"
        >
          認識道場
        </button>
      </div>
    </div>

    <!-- 最新公告 -->
    <div class="sec">
      <div class="sec-head">
        <div>
          <div class="sec-en">LATEST NEWS</div>
          <div class="sec-title">最新公告</div>
        </div>
        <NuxtLink class="more-link" to="/news">查看全部 →</NuxtLink>
      </div>
      <div>
        <div v-if="annPending" class="loading">讀取中…</div>
        <template v-else-if="homeNews.length">
          <div
            v-for="n in homeNews"
            :key="n.id"
            class="news-item fadein"
            @click="navigateTo('/news')"
          >
            <span class="news-date">{{ n.date || '—' }}</span>
            <span class="news-tag">{{ n.tag }}</span>
            <span class="news-title">{{ n.title }}</span>
          </div>
        </template>
        <div v-else class="empty-msg">目前尚無公告。</div>
      </div>
    </div>

    <!-- 法寶略節 -->
    <div class="sec-bg">
      <div class="sec-bg-inner">
        <div class="center" style="margin-bottom: 46px">
          <div class="sec-en">DHARMA PRIMER</div>
          <div class="sec-title">法寶略節</div>
          <p style="font-size: 15px; color: #8a6f55; margin: 8px 0 0">循序漸進，建立正知正見</p>
        </div>
        <div class="grid3">
          <NuxtLink class="dharma-card" to="/dharma">
            <div class="dharma-num">壹</div>
            <div class="dharma-name">{{ copy('home_primer_card1_title') }}</div>
            <p class="dharma-desc">{{ copy('home_primer_card1_desc') }}</p>
            <div class="dharma-more">線上閱讀 →</div>
          </NuxtLink>
          <NuxtLink class="dharma-card" to="/sutra">
            <div class="dharma-num">貳</div>
            <div class="dharma-name">{{ copy('home_primer_card2_title') }}</div>
            <p class="dharma-desc">{{ copy('home_primer_card2_desc') }}</p>
            <div class="dharma-more">閱讀經文 →</div>
          </NuxtLink>
          <NuxtLink class="dharma-card" to="/primer">
            <div class="dharma-num">參</div>
            <div class="dharma-name">{{ copy('home_primer_card3_title') }}</div>
            <p class="dharma-desc">{{ copy('home_primer_card3_desc') }}</p>
            <div class="dharma-more">前往下載 →</div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 法師說法 -->
    <div class="sec">
      <div class="sec-head">
        <div>
          <div class="sec-en">VIDEO TEACHING</div>
          <div class="sec-title">法師說法</div>
        </div>
        <NuxtLink class="more-link" to="/video">更多影片 →</NuxtLink>
      </div>
      <div class="grid2">
        <div v-if="vidPending" class="loading" style="grid-column: 1/-1">讀取中…</div>
        <template v-else-if="homeVideos.length">
          <a
            v-for="v in homeVideos"
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
        <div v-else class="empty-msg" style="grid-column: 1/-1">目前尚無影片。</div>
      </div>
    </div>
  </div>
</template>
