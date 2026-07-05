import fs from 'node:fs'
import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import { WEB_URL, OLD_SITE_URL } from '../../playwright.config'

// 8.3 視覺回歸:舊站(GitHub Pages 單檔分頁)vs 新站(Nuxt 路由)逐頁截圖比對。
// 兩站讀同一個 Supabase,動態內容一致;差異率超過門檻即視為可見差異(bug)。
const THRESHOLD = 0.05 // 允許 5% 像素差(抗鋸齒/字型 hinting 的正常誤差)
const OUT_DIR = 'test-results/visual'

declare global {
  interface Window {
    showPage?: (name: string) => void
  }
}

const CASES: Array<{ name: string; oldPage: string; newPath: string }> = [
  { name: 'home', oldPage: 'home', newPath: '/' },
  { name: 'news', oldPage: 'news', newPath: '/news' },
  { name: 'primer', oldPage: 'primer', newPath: '/primer' },
  { name: 'video', oldPage: 'video', newPath: '/video' },
  { name: 'course', oldPage: 'course', newPath: '/course' },
  { name: 'contact', oldPage: 'contact', newPath: '/contact' },
  { name: 'about', oldPage: 'about', newPath: '/about' },
  { name: 'dharma', oldPage: 'dharma', newPath: '/dharma' },
  { name: 'sutra', oldPage: 'sutra', newPath: '/sutra' },
]

async function stabilize(page: Page) {
  await page.addStyleTag({
    content:
      '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}',
  })
  await page.evaluate(() => document.fonts.ready)
  // 觸發 lazy 內容後回到頂端
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight)
    await new Promise((r) => setTimeout(r, 400))
    window.scrollTo(0, 0)
  })
}

async function shoot(page: Page, file: string): Promise<PNG> {
  const buf = await page.screenshot({ fullPage: true, path: file })
  return PNG.sync.read(buf)
}

function padTo(png: PNG, width: number, height: number): PNG {
  if (png.width === width && png.height === height) return png
  const out = new PNG({ width, height })
  PNG.bitblt(png, out, 0, 0, png.width, png.height, 0, 0)
  return out
}

test.describe.configure({ mode: 'serial' })

for (const { name, oldPage, newPath } of CASES) {
  test(`視覺比對:${name}(舊 showPage('${oldPage}') vs 新 ${newPath})`, async ({ page }) => {
    fs.mkdirSync(OUT_DIR, { recursive: true })

    await page.goto(`${OLD_SITE_URL}/index.html`, { waitUntil: 'networkidle' })
    await page.evaluate((n) => window.showPage?.(n), oldPage)
    await page.waitForLoadState('networkidle')
    await stabilize(page)
    const oldShot = await shoot(page, path.join(OUT_DIR, `${name}-old.png`))

    await page.goto(`${WEB_URL}${newPath}`, { waitUntil: 'networkidle' })
    await stabilize(page)
    const newShot = await shoot(page, path.join(OUT_DIR, `${name}-new.png`))

    const width = Math.max(oldShot.width, newShot.width)
    const height = Math.max(oldShot.height, newShot.height)
    const a = padTo(oldShot, width, height)
    const b = padTo(newShot, width, height)
    const diff = new PNG({ width, height })
    const diffPixels = pixelmatch(a.data, b.data, diff.data, width, height, { threshold: 0.1 })
    fs.writeFileSync(path.join(OUT_DIR, `${name}-diff.png`), PNG.sync.write(diff))

    const ratio = diffPixels / (width * height)
    console.log(`[visual] ${name}: diff ${(ratio * 100).toFixed(2)}%(${width}×${height})`)
    expect(
      ratio,
      `${name} 視覺差異 ${(ratio * 100).toFixed(2)}% 超過 ${THRESHOLD * 100}%`,
    ).toBeLessThan(THRESHOLD)
  })
}
