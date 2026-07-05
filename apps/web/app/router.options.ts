import type { RouterConfig } from '@nuxt/schema'

// 同舊站 showPage():每次換頁一律 window.scrollTo({top:0,behavior:'smooth'})
// (不回復 savedPosition;舊站沒有捲動位置記憶)
export default <RouterConfig>{
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash }
    return { top: 0, behavior: 'smooth' }
  },
}
