import { PDF_BUCKET, storagePublicUrl, type Api } from '@huayuan/shared'

/** 前台共用 api(anon 身分;由 plugins/api.ts 以 per-app instance 提供) */
export function useApi(): Api {
  return useNuxtApp().$api
}

/** 佛法文檔 PDF 公開網址(bucket/組法的單一來源在 packages/shared) */
export function usePdfUrl(): (filename: string) => string {
  const { public: pub } = useRuntimeConfig()
  return (filename: string) => storagePublicUrl(pub.supabaseUrl, PDF_BUCKET, filename)
}
