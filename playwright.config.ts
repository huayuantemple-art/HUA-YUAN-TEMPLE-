import { defineConfig } from '@playwright/test'

// QA(tasks 8.1–8.4)預設對 production 部署驗證;可用環境變數改指本地 dev server
export const WEB_URL = process.env.WEB_URL ?? 'https://huayuan-web.vercel.app'
export const ADMIN_URL = process.env.ADMIN_URL ?? 'https://huayuan-admin-delta.vercel.app'
export const OLD_SITE_URL =
  process.env.OLD_SITE_URL ?? 'https://huayuantemple-art.github.io/HUA-YUAN-TEMPLE-'

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 1,
  reporter: [['list']],
  use: { locale: 'zh-TW', viewport: { width: 1280, height: 800 } },
  projects: [
    { name: 'web', testDir: 'e2e/web', use: { baseURL: WEB_URL } },
    { name: 'admin', testDir: 'e2e/admin', use: { baseURL: ADMIN_URL } },
    { name: 'rls', testDir: 'e2e/rls' },
    { name: 'rwd', testDir: 'e2e/rwd', use: { baseURL: WEB_URL } },
    { name: 'visual', testDir: 'e2e/visual' },
  ],
})
