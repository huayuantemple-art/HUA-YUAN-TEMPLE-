import { createApi } from '@huayuan/shared'

/**
 * api 以 Nuxt plugin 建立(per-app instance)。
 * 不用 module-level 單例:那會在 Nitro server 上跨請求共享
 * (LoadingTracker 的 listener/計數會互相干擾、累積不釋放)。
 */
export default defineNuxtPlugin(() => {
  const { public: pub } = useRuntimeConfig()
  return {
    provide: {
      api: createApi({ url: pub.supabaseUrl, anonKey: pub.supabaseAnonKey }),
    },
  }
})
