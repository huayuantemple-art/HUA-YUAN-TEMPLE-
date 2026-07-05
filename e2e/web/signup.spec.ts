import { test, expect } from '@playwright/test'

// 8.1 報名兩步驟流程(選課 → 表單);不實際送出,避免在正式資料庫留測試報名
test('報名流程:選課 → 表單,驗證擋下不完整送出', async ({ page }) => {
  await page.goto('/signup')

  // 第一步:課程列表(招生中課程來自 courses 表)
  await expect(page.locator('text=目前開放報名的課程')).toBeVisible()
  const openCourse = page.locator('.course-card:not(.full)').first()
  await expect(openCourse).toBeVisible()
  await openCourse.click()

  // 第二步:報名表單
  await expect(page.locator('text=填寫報名資料')).toBeVisible()

  // 空白送出 → 姓名/電話必填驗證擋下
  await page.locator('button.submit-btn').click()
  await expect(page.locator('text=請填寫姓名')).toBeVisible()
  await expect(page.locator('text=請填寫聯絡電話')).toBeVisible()

  // 填必填但不勾隱私權同意 → 仍被擋下(task 4.3)
  await page.locator('input.inp[type="text"]').fill('測試')
  await page.locator('input.inp[type="tel"]').fill('0912345678')
  await page.locator('button.submit-btn').click()
  await expect(page.locator('text=請勾選同意隱私權條款後再送出')).toBeVisible()

  // Email 格式驗證(task 4.2)
  await page.locator('input.inp[type="email"]').fill('not-an-email')
  await page.locator('button.submit-btn').click()
  await expect(page.locator('text=Email 格式不正確')).toBeVisible()

  // 可返回重選課程
  await page.locator('text=← 重新選擇課程').click()
  await expect(page.locator('text=目前開放報名的課程')).toBeVisible()
})
