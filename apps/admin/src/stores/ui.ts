import { ref } from 'vue'
import { defineStore } from 'pinia'

/** 跨頁 UI 狀態:總覽「快速操作」導頁後自動開抽屜(對應舊站 nav()+setTimeout) */
export const useUiStore = defineStore('ui', () => {
  const pendingDrawer = ref<string | null>(null)

  function requestDrawer(view: string): void {
    pendingDrawer.value = view
  }

  /** 目標頁 onMounted 取用一次;非本頁的請求不消耗 */
  function consumeDrawer(view: string): boolean {
    if (pendingDrawer.value !== view) return false
    pendingDrawer.value = null
    return true
  }

  return { pendingDrawer, requestDrawer, consumeDrawer }
})
