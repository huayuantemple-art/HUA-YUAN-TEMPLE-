import { test, expect } from '@playwright/test'

// 8.1 前台主要頁面:每頁可開啟且渲染關鍵內容(資料來自 Supabase,證明資料層正常)
const PAGES: Array<{ path: string; heading: string }> = [
  { path: '/news', heading: '最新公告' },
  { path: '/primer', heading: '法寶略節' },
  { path: '/video', heading: '法師說法' },
  { path: '/course', heading: '課程報名' },
  { path: '/contact', heading: '聯絡我們' },
  { path: '/about', heading: '關於我們' },
  { path: '/dharma', heading: '入佛門法要' },
  { path: '/sutra', heading: '般若波羅蜜多心經' },
]

test('首頁:hero 與動態公告區塊渲染', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/華圓覺苑/)
  await expect(page.locator('h1').first()).toBeVisible()
  // 動態區塊:最新公告卡片(來自 announcements 表,至少一筆已發布)
  await expect(page.locator('text=查看全部').first()).toBeVisible()
})

for (const { path, heading } of PAGES) {
  test(`頁面 ${path} 可開啟且包含「${heading}」`, async ({ page }) => {
    const resp = await page.goto(path)
    expect(resp?.status()).toBe(200)
    await expect(page.locator('body')).toContainText(heading)
  })
}

test('ISR/SSR:原始 HTML 即含資料庫內容(SEO 可索引)', async ({ request, baseURL }) => {
  const html = await (await request.get(`${baseURL}/course`)).text()
  // 課程名稱由 Supabase 提供;出現在未執行 JS 的原始 HTML 才算 SSR 成功
  expect(html).toContain('研讀班')
})

test('經文庫:法寶略節列表、動態閱讀頁與舊 /sutra 心經路徑正確', async ({ page }) => {
  await page.goto('/primer')
  await expect(page.locator('a[href="/sutra/1"]')).toContainText('大般若波羅蜜多經卷第五百七十四')

  await page.goto('/sutra/1')
  await expect(page.locator('h1')).toContainText('大般若波羅蜜多經卷第五百七十四')
  await expect(page.locator('body')).toContainText('第七曼殊室利分之一')

  await page.goto('/sutra')
  await expect(page.locator('h1')).toContainText('般若波羅蜜多心經')
  await expect(page.locator('body')).toContainText('觀自在菩薩')
})
