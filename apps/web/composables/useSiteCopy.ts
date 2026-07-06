import { escapeHtml, getCopy, type SiteCopyKey } from '@huayuan/shared'

/**
 * 全站文案(site-copy-cms):一次撈 site_content(跨頁共用同一 asyncData key),
 * 查無 key、值為空或請求失敗時 fallback 至 shared 預設值 — 頁面永不開天窗
 */
export function useSiteCopy() {
  const api = useApi()
  const { data } = useLazyAsyncData('site-copy', () => api.siteContent.list())

  /** 單行文案:模板以 {{ }} 插值(Vue 內建逃逸) */
  const copy = (key: SiteCopyKey): string => getCopy(data.value, key)

  /** 多行文案:escapeHtml 後換行轉 <br>,供 v-html 使用(僅插入受控標籤) */
  const copyHtml = (key: SiteCopyKey): string =>
    escapeHtml(copy(key)).replace(/\n/g, '<br>')

  return { copy, copyHtml }
}
