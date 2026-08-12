<script setup lang="ts">
useSeoMeta({
  title: '法寶略節 · 華圓覺苑',
  description:
    '精選佛法要義與經典略節，引導初學者循序親近漢傳佛教的核心教理。',
  ogTitle: '法寶略節 · 華圓覺苑',
  ogDescription:
    '精選佛法要義與經典略節，引導初學者循序親近漢傳佛教的核心教理。',
})

const { copy } = useSiteCopy()
</script>

<template>
  <div>
    <div class="banner">
      <div class="banner-en">DHARMA PRIMER</div>
      <h1>法寶略節</h1>
      <p>{{ copy('primer_banner_quote') }}</p>
    </div>
    <div class="primer-wrap" style="max-width: 1080px; margin: 0 auto; padding: 60px 40px 80px">
      <DharmaDocuments category="法寶略節" />
    </div>
  </div>
</template>
