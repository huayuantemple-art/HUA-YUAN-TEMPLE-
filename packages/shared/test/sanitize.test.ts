import { describe, expect, it } from 'vitest'
import { escapeHtml, resolveMapEmbedSrc } from '../src/sanitize'

describe('escapeHtml(同舊站 h() 語義)', () => {
  it('逃逸 & < >', () => {
    expect(escapeHtml('<script>alert("x")</script> & more')).toBe(
      '&lt;script&gt;alert("x")&lt;/script&gt; &amp; more',
    )
  })

  it('null / undefined 視為空字串', () => {
    expect(escapeHtml(null)).toBe('')
    expect(escapeHtml(undefined)).toBe('')
  })

  it('數字等非字串值轉為字串', () => {
    expect(escapeHtml(123)).toBe('123')
  })
})

describe('resolveMapEmbedSrc(地圖網域白名單)', () => {
  const GOOD = 'https://www.google.com/maps/embed?pb=!1m18!xxx'

  it('接受 Google Maps 嵌入網址', () => {
    expect(resolveMapEmbedSrc(GOOD)).toBe(GOOD)
    expect(resolveMapEmbedSrc('https://maps.google.com/maps?q=taipei&output=embed')).toContain(
      'maps.google.com',
    )
  })

  it('相容舊 iframe HTML:僅取出 src,丟棄其餘內容', () => {
    expect(
      resolveMapEmbedSrc(`<iframe width="600" src="${GOOD}" onload="alert(1)"></iframe>`),
    ).toBe(GOOD)
  })

  it('拒絕非白名單網域', () => {
    expect(resolveMapEmbedSrc('https://evil.example.com/maps/embed')).toBeNull()
    expect(resolveMapEmbedSrc('javascript:alert(1)')).toBeNull()
    expect(resolveMapEmbedSrc('<iframe src="https://evil.example.com/x"></iframe>')).toBeNull()
  })

  it('白名單 prefix 無法被子網域/路徑混淆繞過', () => {
    expect(resolveMapEmbedSrc('https://www.google.com.evil.com/maps/embed')).toBeNull()
    expect(resolveMapEmbedSrc('http://www.google.com/maps/embed')).toBeNull()
  })

  it('空值與空字串回傳 null', () => {
    expect(resolveMapEmbedSrc(null)).toBeNull()
    expect(resolveMapEmbedSrc(undefined)).toBeNull()
    expect(resolveMapEmbedSrc('')).toBeNull()
    expect(resolveMapEmbedSrc('   ')).toBeNull()
  })
})
