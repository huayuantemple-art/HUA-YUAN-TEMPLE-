<script setup lang="ts">
import { computed, reactive } from 'vue'
import {
  SITE_COPY,
  SITE_COPY_GROUPS,
  getCopy,
  type SiteCopyDef,
  type SiteCopyKey,
} from '@huayuan/shared'
import AppDrawer from '../components/AppDrawer.vue'
import { useDrawer } from '../composables/useDrawer'
import { api } from '../lib/api'
import { toast } from '../lib/toast'
import { useDataStore } from '../stores/data'

const data = useDataStore()
const { visible, open, openDrawer, closeDrawer } = useDrawer()

/** key 由 shared 清單定義,後台僅編輯值 — 不開放自由新增 key(site-copy-cms design 決策 3) */
const grouped = computed(() =>
  SITE_COPY_GROUPS.map((group) => ({
    group,
    defs: SITE_COPY.filter((def) => def.group === group),
  })).filter((entry) => entry.defs.length > 0),
)

/** DB 是否有非空值(否則前台 fallback 至預設文案) */
function hasDbValue(key: SiteCopyKey): boolean {
  const value = data.siteContent.find((row) => row.key === key)?.value
  return Boolean(value && value.trim())
}

/** 前台實際呈現的值(DB 值 || 預設值),列表預覽用 */
function effectiveValue(key: SiteCopyKey): string {
  return getCopy(data.siteContent, key)
}

const form = reactive({
  def: null as SiteCopyDef | null,
  value: '',
})

function openEdit(def: SiteCopyDef) {
  form.def = def
  form.value = hasDbValue(def.key as SiteCopyKey)
    ? (data.siteContent.find((row) => row.key === def.key)?.value ?? '')
    : ''
  openDrawer()
}

async function save() {
  if (!form.def) return
  try {
    await api.siteContent.upsert(form.def.key, form.value.trim())
  } catch (error) {
    toast('儲存失敗：' + (error as Error).message, true)
    return
  }
  // ISR 60s:明示延遲,管理者不誤判儲存失敗(design 決策 4)
  toast('文案已儲存，前台約一分鐘內更新')
  closeDrawer()
  await data.reloadSiteContent()
}
</script>

<template>
  <div style="max-width: 860px">
    <div class="text-muted" style="font-size: 14px; margin-bottom: 18px">
      文案項目由程式定義,此處編輯顯示的文字;留空即恢復預設文案。前台於儲存後約一分鐘內更新。
    </div>

    <div v-for="entry in grouped" :key="entry.group" class="card card-pad mb-2">
      <div class="sec-title mb-3">{{ entry.group }}</div>
      <div
        v-for="def in entry.defs"
        :key="def.key"
        style="
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 11px 0;
          border-bottom: 1px solid #f0ece3;
        "
      >
        <span style="font-size: 13px; color: #a89b86; width: 200px; flex-shrink: 0">
          {{ def.label }}
        </span>
        <span
          style="
            font-size: 14px;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          "
          :class="{ 'text-muted': !hasDbValue(def.key) }"
        >
          {{ effectiveValue(def.key).split('\n')[0] }}
        </span>
        <span v-if="!hasDbValue(def.key)" class="badge b-draft" style="flex-shrink: 0">預設</span>
        <span class="edit-link" style="flex-shrink: 0" @click="openEdit(def)">編輯</span>
      </div>
    </div>

    <AppDrawer
      :title="form.def?.label ?? '編輯文案'"
      :visible="visible"
      :open="open"
      @close="closeDrawer"
    >
      <div class="fr">
        <label class="lbl">文案內容</label>
        <textarea
          v-model="form.value"
          class="inp"
          :rows="form.def?.multiline ? 6 : 3"
          :placeholder="'留空＝使用預設文案'"
        ></textarea>
      </div>
      <div class="fr">
        <label class="lbl">預設文案(留空時顯示)</label>
        <div class="text-muted" style="font-size: 13px; line-height: 1.9; white-space: pre-wrap">{{
          form.def?.defaultValue
        }}</div>
      </div>
      <template #save>
        <button class="btn btn-gold" @click="save">儲存文案</button>
      </template>
    </AppDrawer>
  </div>
</template>
