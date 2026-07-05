import { ref } from 'vue'

/** 同舊站 openDrawer()/closeDrawer():backdrop 先現,10ms 後加 open 觸發滑入 */
export function useDrawer() {
  const visible = ref(false)
  const open = ref(false)

  function openDrawer(): void {
    visible.value = true
    setTimeout(() => {
      open.value = true
    }, 10)
  }

  function closeDrawer(): void {
    open.value = false
    visible.value = false
  }

  return { visible, open, openDrawer, closeDrawer }
}
