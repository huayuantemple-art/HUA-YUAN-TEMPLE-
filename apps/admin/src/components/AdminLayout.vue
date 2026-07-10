<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SITE_URL } from '../lib/site'
import { useAuthStore } from '../stores/auth'
import { useDataStore } from '../stores/data'
import logoUrl from '../assets/huayuan-logo.png'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const data = useDataStore()

const NAV_CONTENT = [
  { name: 'dashboard', icon: '▦', label: '總覽' },
  { name: 'announcements', icon: '✦', label: '最新公告' },
  { name: 'courses', icon: '✎', label: '課程管理' },
  { name: 'registrations', icon: '✓', label: '報名資料' },
  { name: 'questions', icon: '?', label: '問題提問' },
  { name: 'videos', icon: '▷', label: '法師說法' },
  { name: 'documents', icon: '▤', label: '佛法文檔' },
  { name: 'sutras', icon: '經', label: '經文管理' },
] as const

const NAV_SETTINGS = [
  { name: 'site-copy', icon: '✎', label: '網站文案' },
  { name: 'about', icon: '⌂', label: '關於我們' },
  { name: 'contact', icon: '⌖', label: '聯絡與交通' },
] as const

const pageTitle = computed(() => (route.meta.title as string) ?? '')

// 同舊站 setDate():YYYY.MM.DD 週X
const p2 = (n: number) => String(n).padStart(2, '0')
const d = new Date()
const today = `${d.getFullYear()}.${p2(d.getMonth() + 1)}.${p2(d.getDate())} 週${
  ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
}`

onMounted(() => {
  if (!data.loaded) void data.loadAll()
})

// session 失效/他分頁登出 → 回登入頁
watch(
  () => auth.isAuthed,
  (authed) => {
    if (!authed) void router.push('/login')
  },
)

async function doLogout() {
  await auth.logout()
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="s-head">
        <img class="s-logo" :src="logoUrl" alt="華圓覺苑 logo" />
        <div>
          <div class="s-title">華圓覺苑</div>
          <div class="s-sub">管理後台</div>
        </div>
      </div>
      <nav class="s-nav">
        <div class="nav-group">內容管理</div>
        <div
          v-for="item in NAV_CONTENT"
          :key="item.name"
          class="nav-item"
          :class="{ active: route.name === item.name }"
          @click="router.push({ name: item.name })"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          {{ item.label }}
        </div>
        <div class="nav-group" style="margin-top: 8px">網站設定</div>
        <div
          v-for="item in NAV_SETTINGS"
          :key="item.name"
          class="nav-item"
          :class="{ active: route.name === item.name }"
          @click="router.push({ name: item.name })"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          {{ item.label }}
        </div>
        <!-- 帳號管理僅 super_admin 可見(admin-account-management spec) -->
        <template v-if="auth.isSuperAdmin">
          <div class="nav-group" style="margin-top: 8px">系統</div>
          <div
            class="nav-item"
            :class="{ active: route.name === 'accounts' }"
            @click="router.push({ name: 'accounts' })"
          >
            <span class="nav-icon">⚙</span>
            帳號管理
          </div>
        </template>
      </nav>
      <div class="s-foot">
        <div class="s-avatar">師</div>
        <div style="flex: 1; min-width: 0">
          <div class="s-name">管理員</div>
          <div class="s-email">{{ auth.session?.user.email ?? '—' }}</div>
        </div>
        <span class="logout" @click="doLogout">登出</span>
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="page-title">{{ pageTitle }}</div>
        <div class="topbar-r">
          <a :href="SITE_URL" target="_blank" class="preview-btn">↗ 預覽前台</a>
          <div class="text-muted" style="font-size: 13px">{{ today }}</div>
        </div>
      </header>
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>
