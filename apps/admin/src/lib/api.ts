import { createApi } from '@huayuan/shared'
import { supabase } from './supabase'

/** 後台 api:帶登入者 JWT 呼叫,RLS 依 profiles 角色授權 */
export const api = createApi({
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  getAccessToken: async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
})
