<script setup lang="ts">
// 照片輪播(about-photo-carousel):多張 5 秒淡入淡出自動切換+金色圓點;單張退化為靜態圖
const props = defineProps<{ photos: string[]; alt: string }>()

const current = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function goTo(index: number) {
  current.value = index
  restartTimer()
}

function restartTimer() {
  if (timer) clearInterval(timer)
  if (props.photos.length < 2) return
  timer = setInterval(() => {
    current.value = (current.value + 1) % props.photos.length
  }, 5000)
}

onMounted(restartTimer)
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <img v-if="photos.length === 1" class="about-photo" :src="photos[0]" :alt="alt" />
  <div v-else class="about-photo photo-carousel">
    <img
      v-for="(photo, i) in photos"
      :key="photo"
      class="photo-carousel-img"
      :class="{ active: i === current }"
      :src="photo"
      :alt="`${alt} ${i + 1}`"
      :loading="i === 0 ? undefined : 'lazy'"
    />
    <div class="photo-carousel-dots">
      <button
        v-for="(photo, i) in photos"
        :key="`dot-${photo}`"
        class="photo-carousel-dot"
        :class="{ active: i === current }"
        :aria-label="`第 ${i + 1} 張照片`"
        @click="goTo(i)"
      ></button>
    </div>
  </div>
</template>
