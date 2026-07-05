/**
 * 動態內容逃逸與地圖白名單(單一來源,見 content-sanitization spec)。
 * 所有來自資料庫、插入 DOM 的文字一律經過 escapeHtml;
 * 地圖 iframe 只能由 resolveMapEmbedSrc 驗證過的網址組成。
 */

/** 同舊站 h():逃逸 & < >(null/undefined 視為空字串) */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Google Maps 嵌入網址白名單(prefix 比對,scheme+host+path 皆固定) */
export const MAP_EMBED_WHITELIST = [
  'https://www.google.com/maps/embed',
  'https://maps.google.com/maps',
] as const

/**
 * 解析 contact.map_embed 為可安全嵌入的 iframe src。
 * - 值應為 Google Maps 嵌入網址(階段一已遷移)
 * - 相容尚未遷移的舊 iframe HTML:僅取出 src 驗證,其餘內容一律丟棄
 * - 非白名單網域回傳 null,呼叫端顯示安全預設訊息
 */
export function resolveMapEmbedSrc(value: string | null | undefined): string | null {
  let src = (value ?? '').trim()
  const legacy = src.match(/<iframe[^>]*\ssrc="([^"]+)"/i)
  if (legacy?.[1]) src = legacy[1]
  return MAP_EMBED_WHITELIST.some((prefix) => src.startsWith(prefix)) ? src : null
}
