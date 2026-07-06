<script setup lang="ts">
import logoUrl from '~/assets/img/huayuan-logo.png'

const route = useRoute()
const menuOpen = ref(false)

const links = [
  { to: '/', label: '首頁' },
  { to: '/news', label: '最新公告' },
  { to: '/primer', label: '法寶略節' },
  { to: '/video', label: '法師說法' },
  { to: '/course', label: '課程報名' },
  { to: '/contact', label: '聯絡我們' },
  { to: '/about', label: '關於我們' },
]
</script>

<template>
  <nav class="nav">
    <NuxtLink class="nav-logo" to="/">
      <img class="nav-logo-img" :src="logoUrl" alt="華圓覺苑 logo" />
      <div>
        <div class="nav-title">華圓覺苑</div>
        <div class="nav-sub">HUA YUAN TEMPLE</div>
      </div>
    </NuxtLink>
    <div class="nav-links">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        :class="{ active: route.path === link.to }"
        >{{ link.label }}</NuxtLink
      >
    </div>
    <button class="hamburger" @click="menuOpen = true">
      <span></span><span></span><span></span>
    </button>
  </nav>

  <div class="mobile-menu" :class="{ open: menuOpen }">
    <button class="mobile-close" @click="menuOpen = false">✕</button>
    <NuxtLink v-for="link in links" :key="link.to" :to="link.to" @click="menuOpen = false">{{
      link.label
    }}</NuxtLink>
  </div>
</template>
