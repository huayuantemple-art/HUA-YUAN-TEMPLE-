import { createSupabaseClient } from '@huayuan/shared'

/** Supabase client:僅用於 Auth 與 profiles(資料讀寫走 lib/api.ts) */
export const supabase = createSupabaseClient({
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
})
