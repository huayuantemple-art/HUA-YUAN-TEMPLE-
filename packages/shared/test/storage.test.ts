import { describe, expect, it } from 'vitest'
import {
  IMAGE_BUCKET,
  PDF_BUCKET,
  storagePublicUrl,
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
