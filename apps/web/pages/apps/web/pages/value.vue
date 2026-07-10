<script setup lang="ts">
// 人生的價值頁:內容來自後台「網站文案」;此頁需 shared 的 life_value_* 文案 key。
const { copy } = useSiteCopy()

// 開頭引言:固定顯示,每行一句
const introLines = computed(() =>
  copy('life_value_intro')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean),
)

// 可展開段落:段與段以空行分隔;每段第一行為大標題,其餘各行為內文段落。
// 後台「網站文案 > 人生的價值」可自由增刪改,頁面自動重新拆解。
const sections = computed(() =>
  copy('life_value_sections')
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
      return { heading: lines[0] ?? '', paragraphs: lines.slice(1) }
    })
    .filter((section) => section.heading),
)

// 頁尾聯絡區塊:文字每行一句;LINE 網址存在時顯示 QR 圖(可掃描/點擊)
const contactLines = computed(() =>
  copy('life_value_contact')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean),
)
const lineUrl = computed(() => copy('life_value_line_url').trim())
</script>

<template>
  <div>
    <div class="banner about-banner">
      <div class="banner-en">THE VALUE OF LIFE</div>
      <h1>人生的價值</h1>
      <p>{{ copy('life_value_banner_verse') }}</p>
    </div>
    <section class="value-page">
      <div v-if="introLines.length" class="value-intro">
        <p v-for="(line, i) in introLines" :key="i">{{ line }}</p>
      </div>
      <div class="value-accordion">
        <details
          v-for="(section, i) in sections"
          :key="i"
          class="value-acc-item"
          :open="i === 0"
        >
          <summary class="value-acc-head">
            <span class="value-acc-title">{{ section.heading }}</span>
            <span class="value-acc-icon" aria-hidden="true"></span>
          </summary>
          <div class="value-acc-body">
            <p v-for="(para, j) in section.paragraphs" :key="j">{{ para }}</p>
          </div>
        </details>
      </div>

      <div v-if="contactLines.length || lineUrl" class="value-contact">
        <div v-if="contactLines.length" class="value-contact-text">
          <p v-for="(line, i) in contactLines" :key="i">{{ line }}</p>
        </div>
        <a
          v-if="lineUrl"
          class="value-contact-line"
          :href="lineUrl"
          target="_blank"
          rel="noopener"
        >
          <img :src="lineUrl" alt="LINE 官方帳號 QR Code" loading="lazy" />
          <span>掃描或點擊加入 LINE</span>
        </a>
      </div>
    </section>
  </div>
</template>
