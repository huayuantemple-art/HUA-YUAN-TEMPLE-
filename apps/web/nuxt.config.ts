import tailwindcss from '@tailwindcss/vite'

const tailwindPlugin = tailwindcss() as never

export default defineNuxtConfig({
  compatibilityDate: '2026-07-05',
  devtools: { enabled: false },

  modules: ['@vercel/analytics/nuxt'],

  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindPlugin] },
  build: { transpile: ['@huayuan/shared'] },

  // 由環境變數 NUXT_PUBLIC_SUPABASE_URL / NUXT_PUBLIC_SUPABASE_ANON_KEY 注入
  runtimeConfig: {
    public: {
      supabaseUrl: '',
      supabaseAnonKey: '',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-TW' },
      title: '華圓覺苑 · HUA YUAN TEMPLE',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@300;400;500;600;700&family=Noto+Sans+TC:wght@300;400;500&family=LXGW+WenKai+TC:wght@400;700&display=swap',
        },
      ],
    },
  },

  // ISR:公開頁 60 秒再生,兼顧 SEO 與後台更新後的內容新鮮度;
  // /signup 每次請求即時 SSR(報名課程狀態不快取)
  routeRules: {
    '/': { isr: 60 },
    '/news': { isr: 60 },
    '/primer': { isr: 60 },
    '/video': { isr: 60 },
    '/course': { isr: 60 },
    '/contact': { isr: 60 },
    '/about': { isr: 60 },
    '/sutra': { isr: 60 },
    '/sutra/**': { isr: 60 },
    '/signup': { isr: false },
  },
})
