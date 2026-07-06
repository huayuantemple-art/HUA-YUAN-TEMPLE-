<script setup lang="ts">
const api = useApi()

const { data: sutra } = await useAsyncData('sutra-heart', () => api.sutras.getHeartSutra())

if (!sutra.value) {
  throw createError({ statusCode: 404, statusMessage: '找不到般若波羅蜜多心經' })
}
</script>

<template>
  <SutraReader v-if="sutra" :sutra="sutra" />
</template>
