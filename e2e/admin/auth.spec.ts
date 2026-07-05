import { test, expect } from '@playwright/test'

// 8.1 後台主要流程(未登入部分;登入後模組需管理員憑證,見 e2e/README)
test('未登入進入後台 → 導向登入頁', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.locator('text=管理後台登入')).toBeVisible()
})

test('受保護路由(公告管理)未登入 → 導向登入頁', async ({ page }) => {
  await page.goto('/announcements')
  await expect(page).toHaveURL(/\/login$/)
})

test('錯誤帳密登入 → 顯示錯誤訊息且停在登入頁', async ({ page }) => {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill('nobody@example.com')
  await page.locator('input[type="password"]').fill('wrong-password')
  await page.getByRole('button', { name: '登入' }).click()
  await expect(page.locator('.login-err')).not.toBeEmpty()
  await expect(page).toHaveURL(/\/login$/)
})
