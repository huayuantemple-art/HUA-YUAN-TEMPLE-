<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import { useDialog, type DataTableColumns } from 'naive-ui'
import type { Profile } from '@huayuan/shared'
import AdminDataTable from '../components/AdminDataTable.vue'
import AppDrawer from '../components/AppDrawer.vue'
import { useDrawer } from '../composables/useDrawer'
import { supabase } from '../lib/supabase'
import { toast } from '../lib/toast'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const { visible, open, openDrawer, closeDrawer } = useDrawer()
const dialog = useDialog()

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
  dialog.warning({
    title: '確認刪除帳號',
    content: `確定刪除「${p.email}」？此操作無法復原。`,
    positiveText: '刪除',
    negativeText: '取消',
    autoFocus: false,
    positiveButtonProps: { type: 'error', secondary: true },
    negativeButtonProps: { secondary: true },
    async onPositiveClick() {
      try {
        await invokeAccounts({ action: 'delete', user_id: p.id })
      } catch (error) {
        toast('刪除失敗：' + (error as Error).message, true)
        return
      }
      toast('已刪除')
      await fetchProfiles()
    },
  })
}

const columns: DataTableColumns<Profile> = [
  {
    title: 'Email',
    key: 'email',
    ellipsis: { tooltip: true },
  },
  {
    title: '角色',
    key: 'role',
    width: 120,
    render: (row) =>
      h(
        'span',
        { class: ['badge', row.role === 'super_admin' ? 'b-warn' : 'b-draft'] },
        row.role === 'super_admin' ? '超級管理員' : '管理員',
      ),
  },
  {
    title: '建立時間',
    key: 'created_at',
    width: 130,
    render: (row) =>
      h(
        'span',
        { class: 'text-xs text-muted' },
        row.created_at ? row.created_at.slice(0, 10) : '—',
      ),
  },
  {
    title: '操作',
    key: 'actions',
    width: 110,
    align: 'right',
    render: (row) =>
      deletable(row)
        ? h('button', { type: 'button', class: 'btn-del', onClick: () => del(row) }, '刪除')
        : h('span', { class: 'text-[13px] text-muted' }, '—'),
  },
]
</script>

<template>
  <div>
    <div class="row-between">
      <div class="text-muted text-sm">管理後台登入帳號；新增之子帳號角色為 admin</div>
      <button class="btn btn-dark" @click="openNew">＋ 新增帳號</button>
    </div>

    <AdminDataTable
      :columns="columns"
      :data="profiles"
      :loading="loading"
      item-label="帳號"
      empty-text="尚無帳號"
    />

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
