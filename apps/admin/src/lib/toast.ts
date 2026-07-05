import { reactive } from 'vue'

export const toastState = reactive({ message: '', isErr: false, shown: false })

let timer: ReturnType<typeof setTimeout> | undefined

/** 同舊站 toast():右下角顯示 2.4 秒,錯誤時深紅底 */
export function toast(message: string, isErr = false): void {
  toastState.message = message
  toastState.isErr = isErr
  toastState.shown = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    toastState.shown = false
  }, 2400)
}
