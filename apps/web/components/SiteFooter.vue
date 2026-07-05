<script setup lang="ts">
const api = useApi()
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
        <p class="footer-desc">承續千年法脈，弘揚正信佛法，接引現代學人。</p>
      </div>
      <div>
        <div class="footer-title">快速連結</div>
        <div class="footer-links">
          <NuxtLink to="/">首頁</NuxtLink>
          <NuxtLink to="/news">最新公告</NuxtLink>
          <NuxtLink to="/primer">入門佛法</NuxtLink>
          <NuxtLink to="/video">弘法影音</NuxtLink>
          <NuxtLink to="/course">課程報名</NuxtLink>
        </div>
      </div>
      <div>
        <div class="footer-title">聯絡資訊</div>
        <div style="font-size: 13px; line-height: 2.1; color: #9c7d52">
          <template v-if="contact"
            >{{ contact.address || '' }}<br />{{ contact.phone || '' }}<br />{{
              contact.email || ''
            }}</template
          >
        </div>
      </div>
    </div>
    <div class="footer-bottom">© 華圓覺苑 HUA YUAN MONASTERY · 南無阿彌陀佛</div>
  </footer>
</template>
