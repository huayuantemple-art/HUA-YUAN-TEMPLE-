<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { Profile } from '@huayuan/shared'
import AppDrawer from '../components/AppDrawer.vue'
import { useDrawer } from '../composables/useDrawer'
import { supabase } from '../lib/supabase'
import { toast } from '../lib/toast'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const { visible, open, openDrawer, closeDrawer } = useDrawer()

const profiles = ref<Profile[]>([])
const loading = ref(true)

async function fetchProfiles() {
  loading.value = true
  const { data } = await supabase.from('profiles').select('*').order('created_at')
  profiles.value = (data as Profile[] | null) ?? []
  loading.value = false
}

onMounted(fetchProfiles)

const form = reactive({ email: '', password: '' })

function openNew() {
  Object.assign(form, { email: '', password: '' })
  openDrawer()
}

/** 建立/刪除一律走 Edge Function(前端不持有 service_role) */
async function invokeAccounts(body: Record<string, string>): Promise<void> {
  const { error } = await supabase.functions.invoke('admin-accounts', { body })
  if (error) {
    let message = error.message
    try {
      const ctx = (error as { context?: Response }).context
      if (ctx) message = ((await ctx.json()) as { error?: string }).error ?? message
    } catch {
      // 回應非 JSON 時保留原訊息
    }
    throw new Error(message)
  }
}

async function save() {
  const email = form.email.trim()
  if (!email || form.password.length < 8) {
    toast('請填入 Email 與至少 8 碼密碼', true)
    return
  }
  try {
    await invokeAccounts({ action: 'create', email, password: form.password })
  } catch (error) {
    toast('建立失敗：' + (error as Error).message, true)
    return
  }
  toast('帳號已建立')
  closeDrawer()
  await fetchProfiles()
}

function deletable(p: Profile): boolean {
  return p.role !== 'super_admin' && p.id !== auth.profile?.id
}

async function del(p: Profile) {
  if (!confirm('確定刪除此帳號？')) return
  try {
    await invokeAccounts({ action: 'delete', user_id: p.id })
  } catch (error) {
    toast('刪除失敗：' + (error as Error).message, true)
    return
  }
  toast('已刪除')
  await fetchProfiles()
}
</script>

<template>
  <div>
    <div class="row-between">
      <div class="text-muted" style="font-size: 14px">
        管理後台登入帳號；新增之子帳號角色為 admin
      </div>
      <button class="btn btn-dark" @click="openNew">＋ 新增帳號</button>
    </div>

    <div class="card">
      <div class="th" style="grid-template-columns: 1fr 120px 130px 110px">
        <span>Email</span><span>角色</span><span>建立時間</span>
        <span style="text-align: right">操作</span>
      </div>
      <div v-if="loading" class="loading">讀取中…</div>
      <div v-else-if="!profiles.length" class="empty">尚無帳號</div>
      <template v-else>
        <div
          v-for="p in profiles"
          :key="p.id"
          class="tr"
          style="grid-template-columns: 1fr 120px 130px 110px"
        >
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
            {{ p.email }}
          </span>
          <span>
            <span class="badge" :class="p.role === 'super_admin' ? 'b-warn' : 'b-draft'">
              {{ p.role === 'super_admin' ? '超級管理員' : '管理員' }}
            </span>
          </span>
          <span class="text-muted" style="font-size: 12px">
            {{ p.created_at ? p.created_at.slice(0, 10) : '—' }}
          </span>
          <span class="tbl-act">
            <button v-if="deletable(p)" class="btn-del" @click="del(p)">刪除</button>
            <span v-else class="text-muted" style="font-size: 13px">—</span>
          </span>
        </div>
      </template>
    </div>

    <AppDrawer title="新增帳號" :visible="visible" :open="open" @close="closeDrawer">
      <div class="fr">
        <label class="lbl">Email</label>
        <input v-model="form.email" class="inp" type="email" placeholder="admin@example.com" />
      </div>
      <div class="fr">
        <label class="lbl">初始密碼（至少 8 碼）</label>
        <input v-model="form.password" class="inp" type="password" placeholder="請設定初始密碼" />
      </div>
      <template #save>
        <button class="btn btn-gold" @click="save">建立帳號</button>
      </template>
    </AppDrawer>
  </div>
</template>
