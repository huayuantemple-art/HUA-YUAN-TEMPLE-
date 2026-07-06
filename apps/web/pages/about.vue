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
    <section class="about-intro">
      <div class="about-copy-panel">
        <div class="sec-en about-section-kicker">弘揚淨土 持戒念佛</div>
        <!-- eslint-disable vue/no-v-html -- 內容已 escapeHtml,僅插入受控 <br>(同舊站) -->
        <h2 class="about-headline" v-html="headlineHtml"></h2>
        <!-- eslint-disable vue/no-v-html -- DB 文字已 escapeHtml,僅保留換行 -->
        <p class="about-copy" v-html="contentHtml"></p>
      </div>
      <div
        v-if="!aboutImageUrl"
        class="about-photo"
      >
        道場意境照片
      </div>
      <img
        v-else
        class="about-photo"
        :src="aboutImageUrl"
        alt="道場意境照片"
      />
    </section>
    <section class="about-values">
      <div class="about-values-inner">
        <div class="about-values-kicker">
          我們的理念
        </div>
        <div class="about-values-grid">
          <div v-for="v in values" :key="v.char" class="value-item fadein">
            <div class="value-char">{{ v.char }}</div>
            <!-- eslint-disable vue/no-v-html -- DB 文字已 escapeHtml -->
            <div class="value-name" v-html="v.name"></div>
            <p class="value-desc" v-html="v.desc"></p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
