<script setup lang="ts">
const route = useRoute()
const api = useApi()
const id = Number(route.params.id)

if (!Number.isInteger(id) || id < 1) {
  throw createError({ statusCode: 404, statusMessage: '找不到經文' })
}

const { data: sutra } = await useAsyncData(`sutra-${id}`, () => api.sutras.getPublished(id))

if (!sutra.value) {
  throw createError({ statusCode: 404, statusMessage: '找不到經文' })
}
</script>

<template>
  <SutraReader v-if="sutra" :sutra="sutra" />
</template>
