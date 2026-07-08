<script setup lang="ts">
import { escapeHtml } from '@huayuan/shared'

const api = useApi()
const { copyHtml } = useSiteCopy()
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
// 內文分層(比照紙本設計):無句號的短句為標語行(第三大字),含句號者為內文段落(最小字)
const contentLines = computed(() =>
  (about.value?.content || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean),
)
const mottoLines = computed(() => contentLines.value.filter((line) => !line.includes('。')))
// 段落再依句號斷句:一個句號視為一句,每句獨立一行置中
const paragraphs = computed(() =>
  contentLines.value
    .filter((line) => line.includes('。'))
    .map((line) =>
      line
        .split('。')
        .map((sentence) => sentence.trim())
        .filter(Boolean)
        .map((sentence) => sentence + '。'),
    ),
)
// 輪播照片:image_urls 為主,空時退回舊單張欄位 image_url
const aboutPhotos = computed(() => {
  const urls = (about.value?.image_urls ?? []).map((url) => url.trim()).filter(Boolean)
  if (urls.length) return urls
  const single = about.value?.image_url?.trim()
  return single ? [single] : []
})

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
      <!-- eslint-disable-next-line vue/no-v-html -- copyHtml 已 escapeHtml,僅換行轉受控 <br> -->
      <p v-html="copyHtml('about_banner_verse')"></p>
    </div>
    <section class="about-intro">
      <div class="about-copy-panel">
        <!-- eslint-disable vue/no-v-html -- 內容已 escapeHtml,僅插入受控 <br>(同舊站) -->
        <h2 class="about-headline" v-html="headlineHtml"></h2>
        <!-- eslint-enable vue/no-v-html -->
        <div v-if="mottoLines.length" class="about-motto">
          <div v-for="(line, i) in mottoLines" :key="i">{{ line }}</div>
        </div>
        <div class="about-paragraphs">
          <p v-for="(sentences, i) in paragraphs" :key="i">
            <span v-for="(sentence, j) in sentences" :key="j" class="about-sentence">{{
              sentence
            }}</span>
          </p>
        </div>
      </div>
      <div
        v-if="!aboutPhotos.length"
        class="about-photo"
      >
        道場意境照片
      </div>
      <PhotoCarousel v-else :photos="aboutPhotos" alt="道場照片" />
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
