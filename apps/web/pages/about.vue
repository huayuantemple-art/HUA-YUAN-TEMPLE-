<script setup lang="ts">
import { escapeHtml } from '@huayuan/shared'

const api = useApi()
const { data: about } = useLazyAsyncData('about', () => api.about.get())

// 同舊站:headline 逃逸後將全形空白換成 <br>(僅插入受控標籤,內容已逃逸)
const headlineHtml = computed(() => escapeHtml(about.value?.headline || '').replace('　', '<br>'))

const values = computed(() =>
  about.value
    ? [
        {
          char: '慈',
          name: about.value.value1 || '慈悲利他',
          desc: '以慈悲心待人，以利他行入世，將佛法的溫度帶入社會。',
        },
        {
          char: '智',
          name: about.value.value2 || '智慧明燈',
          desc: '研讀經典、深入法義，以般若智慧照破無明煩惱。',
        },
        {
          char: '淨',
          name: about.value.value3 || '清淨自在',
          desc: '持戒修定，淨化身心，於喧囂中安住一份自在清涼。',
        },
      ]
    : [],
)
</script>

<template>
  <div>
    <div class="banner about-banner">
      <div class="banner-en">ABOUT US</div>
      <h1>華圓覺苑簡介</h1>
      <p>
        華開舜若因緣多 <br />
        勝境無窮更得安
      </p>
    </div>
    <div
      class="about-intro"
      style="
        max-width: 1000px;
        margin: 0 auto;
        padding: 70px 40px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 56px;
        align-items: center;
      "
    >
      <div>
        <div class="sec-en about-section-kicker" style="margin-bottom: 12px">
          弘揚淨土 持戒念佛
        </div>
        <!-- eslint-disable vue/no-v-html -- 內容已 escapeHtml,僅插入受控 <br>(同舊站) -->
        <h2
          class="about-headline"
          style="
            font-family: 'Noto Serif TC', serif;
            font-weight: 500;
            font-size: 32px;
            margin: 0 0 24px;
            letter-spacing: 0.08em;
            color: #3a211c;
            line-height: 1.5;
          "
          v-html="headlineHtml"
        ></h2>
        <p class="about-copy" style="font-size: 15px; color: #6b5a48; line-height: 2.1; margin: 0">
          {{ about?.content || '' }}
        </p>
      </div>
      <div
        class="about-photo"
        style="
          aspect-ratio: 4/5;
          background: linear-gradient(150deg, #e7dcc4, #d6c7a4);
          border: 1px solid rgba(201, 162, 75, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a3906a;
          font-size: 14px;
          letter-spacing: 0.2em;
        "
      >
        道場意境照片
      </div>
    </div>
    <div class="sec-dark">
      <div class="sec-dark-inner">
        <div
          style="
            font-size: 12px;
            letter-spacing: 0.4em;
            color: #c9a24b;
            margin-bottom: 36px;
            text-align: center;
          "
        >
          我們的理念
        </div>
        <div class="grid3">
          <div v-for="v in values" :key="v.char" class="value-item fadein">
            <div class="value-char">{{ v.char }}</div>
            <div class="value-name">{{ v.name }}</div>
            <p class="value-desc">{{ v.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
