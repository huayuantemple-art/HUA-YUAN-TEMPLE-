<script setup lang="ts">
import { Analytics } from '@vercel/analytics/vue'
import { NConfigProvider, NDialogProvider } from 'naive-ui'
import { adminTheme } from './lib/theme'
import { toastState } from './lib/toast'
</script>

<template>
  <NConfigProvider :theme-overrides="adminTheme">
    <NDialogProvider>
      <Analytics />
      <router-view />
      <div
        class="toast"
        :class="{ show: toastState.shown }"
        :style="{ background: toastState.isErr ? '#8B2020' : 'var(--brown)' }"
      >
        {{ toastState.message }}
      </div>
    </NDialogProvider>
  </NConfigProvider>
</template>
