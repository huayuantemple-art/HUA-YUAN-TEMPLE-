import { describe, expect, it } from 'vitest'
import {
  IMAGE_BUCKET,
  PDF_BUCKET,
  storagePublicUrl,
  storageSafeObjectPath,
  versionedStoragePublicUrl,
} from '../src/storage'

describe('storagePublicUrl', () => {
  it('組出 Supabase Storage 公開物件網址,檔名經 URL 編碼', () => {
    expect(storagePublicUrl('https://x.supabase.co', PDF_BUCKET, '心經 註解.pdf')).toBe(
      'https://x.supabase.co/storage/v1/object/public/pdfs/%E5%BF%83%E7%B6%93%20%E8%A8%BB%E8%A7%A3.pdf',
    )
  })

  it('容忍 supabaseUrl 結尾斜線', () => {
    expect(storagePublicUrl('https://x.supabase.co/', 'docs', 'a.pdf')).toBe(
      'https://x.supabase.co/storage/v1/object/public/docs/a.pdf',
    )
  })

  it('可產生 images bucket 破快取公開網址', () => {
    expect(
      versionedStoragePublicUrl('https://x.supabase.co', IMAGE_BUCKET, 'about-image.webp', 123),
    ).toBe('https://x.supabase.co/storage/v1/object/public/images/about-image.webp?v=123')
  })
})

describe('storageSafeObjectPath', () => {
  it('將中文檔名轉成 Supabase Storage 可接受的 ASCII key', () => {
    expect(storageSafeObjectPath('1.大般若波羅蜜多經卷第五百七十四.docx', 'docx')).toBe(
      '1.docx',
    )
  })

  it('清理空白與特殊符號並保留副檔名', () => {
    expect(storageSafeObjectPath('Heart Sutra #1.pdf', 'pdf')).toBe('heart-sutra-1.pdf')
  })

  it('無可用 ASCII stem 時使用 fallback', () => {
    expect(storageSafeObjectPath('心經註解.pdf', 'pdf', 'document-123')).toBe('document-123.pdf')
  })
})
