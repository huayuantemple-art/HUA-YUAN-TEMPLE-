<script setup lang="ts">
import { Analytics } from '@vercel/analytics/vue'
import { toastState } from './lib/toast'
</script>

<template>
  <Analytics />
  <router-view />
  <div
    class="toast"
    :class="{ show: toastState.shown }"
    :style="{ background: toastState.isErr ? '#8B2020' : 'var(--brown)' }"
  >
    {{ toastState.message }}
  </div>
</template>
