/**
 * Supabase Storage 公開物件網址(單一來源)。
 * 前台下載連結與後台上傳/預覽(tasks 5.10/7.1)共用,避免 bucket 名稱與路徑組法分岔。
 */

/** 佛法文檔 PDF 存放的 bucket */
export const PDF_BUCKET = 'pdfs'

/** 站台圖片(關於頁照片、聯絡頁 icon 等)存放的 bucket */
export const IMAGE_BUCKET = 'images'

export function storagePublicUrl(supabaseUrl: string, bucket: string, path: string): string {
  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${encodeURIComponent(path)}`
}

export function storageSafeObjectPath(
  filename: string,
  extension: string,
  fallbackStem = 'document',
): string {
  const safeExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
  const rawName = filename.split(/[\\/]/).pop()?.trim() || ''
  const extensionPattern = new RegExp(`\\.${safeExtension}$`, 'i')
  const stem = rawName
    .replace(extensionPattern, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[._-]+|[._-]+$/g, '')

  return `${stem || fallbackStem}.${safeExtension}`
}

export function versionedStoragePublicUrl(
  supabaseUrl: string,
  bucket: string,
  path: string,
  version: number | string = Date.now(),
): string {
  return `${storagePublicUrl(supabaseUrl, bucket, path)}?v=${encodeURIComponent(String(version))}`
}
