<script setup lang="ts">
import { escapeHtml } from '@huayuan/shared'

const api = useApi()
const { data: about } = useLazyAsyncData('about', () => api.about.get())

const defaultValues = [
  {
    char: '慈',
    name: '慈悲利他',
    desc: '以慈悲心待人，以利他行入世，將佛法的溫度帶入社會。',
  },
  {
    char: '智',
    name: '智慧明燈',
    desc: '研讀經典、深入法義，以般若智慧照破無明煩惱。',
  },
  {
    char: '淨',
    name: '清淨自在',
    desc: '持戒修定，淨化身心，於喧囂中安住一份自在清涼。',
  },
]

// 同舊站:headline 逃逸後將全形空白換成 <br>(僅插入受控標籤,內容已逃逸)
const headlineHtml = computed(() => escapeHtml(about.value?.headline || '').replace('　', '<br>'))
const contentHtml = computed(() => escapeHtml(about.value?.content || '').replace(/\n/g, '<br>'))
const aboutImageUrl = computed(() => about.value?.image_url?.trim() || '')

const values = computed(() =>
  defaultValues.map((fallback, index) => {
    const key = `value${index + 1}` as 'value1' | 'value2' | 'value3'
    const descKey = `${key}_desc` as 'value1_desc' | 'value2_desc' | 'value3_desc'
    return {
      char: fallback.char,
      name: escapeHtml(about.value?.[key] || fallback.name),
      desc: escapeHtml(about.value?.[descKey] || fallback.desc),
    }
  }),
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
        <div class="sec-en about-section-kicker" style="margin-bottom: 12px">弘揚淨土 持戒念佛</div>
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
        <!-- eslint-disable vue/no-v-html -- DB 文字已 escapeHtml,僅保留換行 -->
        <p
          class="about-copy"
          style="font-size: 15px; color: #6b5a48; line-height: 2.1; margin: 0"
          v-html="contentHtml"
        ></p>
      </div>
      <div
        v-if="!aboutImageUrl"
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
      <img
        v-else
        class="about-photo"
        :src="aboutImageUrl"
        alt="道場意境照片"
        style="
          width: 100%;
          aspect-ratio: 4/5;
          object-fit: cover;
          border: 1px solid rgba(201, 162, 75, 0.4);
          display: block;
        "
      />
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
            <!-- eslint-disable vue/no-v-html -- DB 文字已 escapeHtml -->
            <div class="value-name" v-html="v.name"></div>
            <p class="value-desc" v-html="v.desc"></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
