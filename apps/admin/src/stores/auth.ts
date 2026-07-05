import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from '@huayuan/shared'
import { supabase } from '../lib/supabase'

/**
 * 登入狀態與角色(admin-console / admin-account-management spec)。
 * 「登入但無 profiles 紀錄」視為無權限,直接登出(database-security 1.7 防呆)。
 */
export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const profile = ref<Profile | null>(null)
  const loginError = ref('')
  let initPromise: Promise<void> | null = null

  const isAuthed = computed(() => session.value !== null && profile.value !== null)
  const isSuperAdmin = computed(() => profile.value?.role === 'super_admin')

  async function loadProfile(): Promise<void> {
    const uid = session.value?.user.id
    if (!uid) {
      profile.value = null
      return
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
    profile.value = (data as Profile | null) ?? null
  }

  async function rejectWithoutProfile(): Promise<void> {
    await supabase.auth.signOut()
    session.value = null
    loginError.value = '此帳號無後台權限。'
  }

  /** 開機:讀既有 session 自動進入(同舊站),並監聽登出事件 */
  function init(): Promise<void> {
    initPromise ??= (async () => {
      const { data } = await supabase.auth.getSession()
      session.value = data.session
      if (session.value) {
        await loadProfile()
        if (!profile.value) await rejectWithoutProfile()
      }
      supabase.auth.onAuthStateChange((event, s) => {
        session.value = s
        if (event === 'SIGNED_OUT') profile.value = null
      })
    })()
    return initPromise
  }

  async function login(email: string, password: string): Promise<boolean> {
    loginError.value = ''
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      // 同舊站錯誤訊息
      loginError.value = '帳號或密碼錯誤，請重試。'
      return false
    }
    session.value = data.session
    await loadProfile()
    if (!profile.value) {
      await rejectWithoutProfile()
      return false
    }
    return true
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut()
    session.value = null
    profile.value = null
  }

  return { session, profile, loginError, isAuthed, isSuperAdmin, init, login, logout }
})
