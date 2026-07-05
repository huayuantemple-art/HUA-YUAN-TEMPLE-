import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface SupabaseConfig {
  url: string
  anonKey: string
}

/**
 * Supabase client 工廠。
 * 設定值由呼叫端自環境變數注入(web: NUXT_PUBLIC_*、admin: VITE_*),
 * 金鑰不寫死於程式碼(見 platform-architecture spec)。
 */
export function createSupabaseClient(config: SupabaseConfig): SupabaseClient {
  if (!config.url || !config.anonKey) {
    throw new Error('Supabase 設定缺漏:需要 url 與 anonKey(請確認環境變數)')
  }
  return createClient(config.url, config.anonKey)
}
