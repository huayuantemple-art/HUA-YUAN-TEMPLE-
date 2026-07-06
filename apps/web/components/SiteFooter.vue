<script setup lang="ts">
const api = useApi()
const { copy } = useSiteCopy()
// 與聯絡頁共用 'contact' key(同舊站 _contact 快取,只取一次)
const { data: contact } = useLazyAsyncData('contact', () => api.contact.get())
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <div>
        <div class="footer-logo-text">華圓覺苑</div>
        <div style="font-size: 11px; letter-spacing: 0.3em; color: #c9a24b; margin-bottom: 14px">
          HUA YUAN MONASTERY
        </div>
        <p class="footer-desc">{{ copy('footer_brand_desc') }}</p>
      </div>
      <div>
        <div class="footer-title">快速連結</div>
        <div class="footer-links">
          <NuxtLink to="/">首頁</NuxtLink>
          <NuxtLink to="/news">最新公告</NuxtLink>
          <NuxtLink to="/primer">法寶略節</NuxtLink>
          <NuxtLink to="/video">法師說法</NuxtLink>
          <NuxtLink to="/course">課程報名</NuxtLink>
          <NuxtLink to="/about">關於我們</NuxtLink>
        </div>
      </div>
      <div>
        <div class="footer-title">聯絡資訊</div>
        <div style="font-size: 13px; line-height: 2.1; color: #9c7d52">
          <template v-if="contact">
            <div v-if="contact.venue_name">{{ contact.venue_name }}</div>
            <div v-if="contact.address">{{ contact.address }}</div>
            <div v-if="contact.phone">{{ contact.phone }}</div>
            <div v-if="contact.venue_name2">{{ contact.venue_name2 }}</div>
            <div v-if="contact.address2">{{ contact.address2 }}</div>
            <div v-if="contact.phone2">{{ contact.phone2 }}</div>
          </template>
        </div>
      </div>
    </div>
    <div class="footer-bottom">{{ copy('footer_copyright') }}</div>
  </footer>
</template>
