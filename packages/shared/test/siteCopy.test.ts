import { describe, expect, it } from 'vitest'
import {
  SITE_COPY,
  SITE_COPY_DEFAULTS,
  SITE_COPY_GROUPS,
  getCopy,
  type SiteContent,
} from '../src/siteCopy'

const row = (key: string, value: string | null): SiteContent => ({
  key,
  value,
  updated_at: '2026-07-06T00:00:00Z',
})

describe('SITE_COPY 清單', () => {
  it('key 不重複', () => {
    const keys = SITE_COPY.map((def) => def.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('每筆皆有非空預設值與合法分組', () => {
    for (const def of SITE_COPY) {
      expect(def.defaultValue.trim()).not.toBe('')
      expect(SITE_COPY_GROUPS).toContain(def.group)
      expect(def.label.trim()).not.toBe('')
    }
  })
})

describe('getCopy:DB 值 || 預設值', () => {
  it('DB 有值時回傳 DB 值', () => {
    const rows = [row('home_hero_title', '客製主標')]
    expect(getCopy(rows, 'home_hero_title')).toBe('客製主標')
  })

  it('查無 key 時 fallback 至預設值', () => {
    expect(getCopy([], 'home_hero_title')).toBe(SITE_COPY_DEFAULTS.home_hero_title)
  })

  it('值為空字串或空白時 fallback 至預設值', () => {
    expect(getCopy([row('home_hero_title', '')], 'home_hero_title')).toBe(
      SITE_COPY_DEFAULTS.home_hero_title,
    )
    expect(getCopy([row('home_hero_title', '   ')], 'home_hero_title')).toBe(
      SITE_COPY_DEFAULTS.home_hero_title,
    )
  })

  it('值為 null 時 fallback 至預設值', () => {
    expect(getCopy([row('footer_brand_desc', null)], 'footer_brand_desc')).toBe(
      SITE_COPY_DEFAULTS.footer_brand_desc,
    )
  })

  it('rows 為 null/undefined 時安全 fallback(前台請求失敗不開天窗)', () => {
    expect(getCopy(null, 'about_kicker')).toBe(SITE_COPY_DEFAULTS.about_kicker)
    expect(getCopy(undefined, 'about_kicker')).toBe(SITE_COPY_DEFAULTS.about_kicker)
  })

  it('保留 DB 值原樣(含換行,渲染端自行處理)', () => {
    const value = '第一行\n第二行'
    expect(getCopy([row('home_hero_verse', value)], 'home_hero_verse')).toBe(value)
  })
})
