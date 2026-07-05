/**
 * 帳號管理 Edge Function(admin-account-management spec)。
 * 先驗證呼叫者 JWT 對應 profiles.role = super_admin,才以 service_role
 * 建立/刪除 auth.users 與對應 profiles;service_role 只存在於此執行環境
 * (SUPABASE_SERVICE_ROLE_KEY 由 Supabase 平台注入,不進前端/版控)。
 */
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json(405, { error: 'method not allowed' })

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )

  // 驗證呼叫者:需為有效使用者 JWT,且 profiles 角色為 super_admin
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!token) return json(401, { error: 'unauthorized' })
  const { data: userData, error: userError } = await admin.auth.getUser(token)
  if (userError || !userData.user) return json(401, { error: 'unauthorized' })

  const { data: caller } = await admin
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle()
  if (caller?.role !== 'super_admin') return json(403, { error: 'forbidden' })

  let payload: { action?: string; email?: string; password?: string; user_id?: string }
  try {
    payload = await req.json()
  } catch {
    return json(400, { error: 'invalid json' })
  }

  if (payload.action === 'create') {
    const email = String(payload.email ?? '').trim()
    const password = String(payload.password ?? '')
    if (!email || password.length < 8) return json(400, { error: 'email 與至少 8 碼密碼為必填' })
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error || !created.user) return json(400, { error: error?.message ?? 'create failed' })
    const { error: profileError } = await admin
      .from('profiles')
      .insert({ id: created.user.id, email, role: 'admin' })
    if (profileError) {
      // 回滾,避免留下「有帳號但無 profile(無權限)」的孤兒
      await admin.auth.admin.deleteUser(created.user.id)
      return json(400, { error: profileError.message })
    }
    return json(200, { user_id: created.user.id })
  }

  if (payload.action === 'delete') {
    const userId = String(payload.user_id ?? '')
    if (!userId) return json(400, { error: 'user_id 為必填' })
    if (userId === userData.user.id) return json(400, { error: '不可刪除自己的帳號' })
    const { data: target } = await admin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
    // 保留既有最高權限帳號:super_admin 不可經此流程刪除
    if (target?.role === 'super_admin') return json(400, { error: '不可刪除 super_admin 帳號' })
    const { error } = await admin.auth.admin.deleteUser(userId) // profiles 由 on delete cascade 移除
    if (error) return json(400, { error: error.message })
    return json(200, { ok: true })
  }

  return json(400, { error: 'unknown action' })
})
