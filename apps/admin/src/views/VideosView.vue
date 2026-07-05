<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { VideoStatus } from '@huayuan/shared'
import AppDrawer from '../components/AppDrawer.vue'
import { useDrawer } from '../composables/useDrawer'
import { api } from '../lib/api'
import { badgeClass } from '../lib/badge'
import { toast } from '../lib/toast'
import { useDataStore } from '../stores/data'

const data = useDataStore()
const { visible, open, openDrawer, closeDrawer } = useDrawer()

const form = reactive({
  title: '',
  youtube_url: '',
  status: '草稿' as VideoStatus,
})
const drawerTitle = ref('新增影片')

function openNew() {
  drawerTitle.value = '新增影片'
  Object.assign(form, { title: '', youtube_url: '', status: '草稿' })
  openDrawer()
}

async function save() {
  const p = {
    title: form.title.trim() || '（未命名影片）',
    youtube_url: form.youtube_url.trim(),
    status: form.status,
  }
  try {
    await api.videos.create(p)
  } catch (error) {
    toast('儲存失敗：' + (error as Error).message, true)
    return
  }
  toast('影片已儲存')
  closeDrawer()
  await data.reloadVideos()
}

/** 同舊站 patchVid():列表內欄位 onchange 即時單欄更新 */
async function patch(id: number, field: 'title' | 'youtube_url' | 'status', value: string) {
  try {
    await api.videos.update(id, { [field]: value })
  } catch (error) {
    toast('更新失敗：' + (error as Error).message, true)
    return
  }
  const v = data.videos.find((x) => x.id === id)
  if (v) {
    if (field === 'status') v.status = value as VideoStatus
    else v[field] = value
  }
  toast('已更新')
}

function inputValue(event: Event): string {
  return (event.target as HTMLInputElement | HTMLSelectElement).value
}

async function del(id: number) {
  if (!confirm('確定刪除此影片？')) return
  try {
    await api.videos.remove(id)
  } catch (error) {
    toast('刪除失敗：' + (error as Error).message, true)
    return
  }
  data.videos = data.videos.filter((x) => x.id !== id)
  toast('已刪除')
}
</script>

<template>
  <div>
    <div class="row-between">
      <div class="text-muted" style="font-size: 14px">貼上 YouTube 連結即可在前台影音專區播放</div>
      <button class="btn btn-dark" @click="openNew">＋ 新增影片</button>
    </div>

    <div v-if="data.loaded && !data.videos.length" class="card card-pad empty">
      尚無影片，點擊「新增影片」開始新增
    </div>
    <div v-for="v in data.videos" v-else :key="v.id" class="card mb-2" style="margin-bottom: 14px">
      <div style="padding: 18px 20px; display: flex; align-items: center; gap: 20px">
        <div
          style="
            width: 114px;
            height: 64px;
            flex-shrink: 0;
            border-radius: 8px;
            background: linear-gradient(135deg, #4a2a22, #241310);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--gold);
            font-size: 18px;
          "
        >
          ▷
        </div>
        <div style="flex: 1; min-width: 0">
          <label class="lbl mb-2">影片標題</label>
          <input
            class="inp"
            :value="v.title"
            style="margin-bottom: 10px"
            @change="patch(v.id, 'title', inputValue($event))"
          />
          <label class="lbl mb-2">YouTube 連結</label>
          <input
            class="inp"
            :value="v.youtube_url || ''"
            placeholder="https://youtu.be/…"
            @change="patch(v.id, 'youtube_url', inputValue($event))"
          />
        </div>
        <div
          style="
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 12px;
            flex-shrink: 0;
          "
        >
          <span class="badge" :class="badgeClass(v.status)">{{ v.status }}</span>
          <select
            class="inp btn-sm"
            style="width: auto"
            @change="patch(v.id, 'status', inputValue($event))"
          >
            <option :selected="v.status === '已發布'">已發布</option>
            <option :selected="v.status === '草稿'">草稿</option>
          </select>
          <button class="btn-del" @click="del(v.id)">刪除</button>
        </div>
      </div>
    </div>

    <AppDrawer :title="drawerTitle" :visible="visible" :open="open" @close="closeDrawer">
      <div class="fr">
        <label class="lbl">影片標題</label>
        <input v-model="form.title" class="inp" placeholder="例：《心經》的智慧 · 第一講" />
      </div>
      <div class="fr">
        <label class="lbl">YouTube 連結</label>
        <input v-model="form.youtube_url" class="inp" placeholder="https://youtu.be/…" />
      </div>
      <div class="fr">
        <label class="lbl">狀態</label>
        <select v-model="form.status" class="inp">
          <option>已發布</option>
          <option>草稿</option>
        </select>
      </div>
      <template #save>
        <button class="btn btn-gold" @click="save">儲存影片</button>
      </template>
    </AppDrawer>
  </div>
</template>
