<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { Announcement, AnnouncementStatus } from '@huayuan/shared'
import AppDrawer from '../components/AppDrawer.vue'
import { useDrawer } from '../composables/useDrawer'
import { api } from '../lib/api'
import { badgeClass } from '../lib/badge'
import { toast } from '../lib/toast'
import { useDataStore } from '../stores/data'
import { useUiStore } from '../stores/ui'

const data = useDataStore()
const ui = useUiStore()
const { visible, open, openDrawer, closeDrawer } = useDrawer()

const search = ref('')
const filter = ref('')

const list = computed(() => {
  const q = search.value.toLowerCase()
  return data.announcements.filter(
    (n) => (!q || n.title.toLowerCase().includes(q)) && (!filter.value || n.tag === filter.value),
  )
})

const drawerTitle = ref('新增公告')
const form = reactive({
  id: null as number | null,
  title: '',
  tag: '課程',
  date: '',
  content: '',
  status: '草稿' as AnnouncementStatus,
})

function openNew() {
  drawerTitle.value = '新增公告'
  Object.assign(form, { id: null, title: '', tag: '課程', date: '', content: '', status: '草稿' })
  openDrawer()
}

function openEdit(n: Announcement) {
  drawerTitle.value = '編輯公告'
  Object.assign(form, {
    id: n.id,
    title: n.title,
    tag: n.tag,
    date: n.date ?? '',
    content: n.content ?? '',
    status: n.status,
  })
  openDrawer()
}

async function save() {
  const p = {
    title: form.title.trim() || '（未命名）',
    tag: form.tag,
    date: form.date.trim(),
    content: form.content.trim(),
    status: form.status,
  }
  try {
    if (form.id) await api.announcements.update(form.id, p)
    else await api.announcements.create(p)
  } catch (error) {
    toast('儲存失敗：' + (error as Error).message, true)
    return
  }
  toast('公告已儲存')
  closeDrawer()
  await data.reloadAnnouncements()
}

async function del(id: number) {
  // @todo 使用符合style的modal dialog
  if (!confirm('確定刪除此公告？')) return
  try {
    await api.announcements.remove(id)
  } catch (error) {
    toast('刪除失敗：' + (error as Error).message, true)
    return
  }
  data.announcements = data.announcements.filter((x) => x.id !== id)
  toast('已刪除')
}

onMounted(() => {
  if (ui.consumeDrawer('announcements')) setTimeout(openNew, 100)
})
</script>

<template>
  <div>
    <div class="row-between">
      <div style="display: flex; gap: 10px">
        <input v-model="search" class="inp" placeholder="搜尋標題…" style="width: 220px" />
        <select v-model="filter" class="inp" style="width: 120px">
          <option value="">全部分類</option>
          <option>課程</option>
          <option>法會</option>
          <option>公告</option>
        </select>
      </div>
      <button class="btn btn-dark" @click="openNew">＋ 新增公告</button>
    </div>
<!--@todo 使用 ui framework table 還需要做分頁-->
    <div class="card">
      <div class="th" style="grid-template-columns: 110px 76px 1fr 86px 110px">
        <span>日期</span><span>分類</span><span>標題</span><span>狀態</span>
        <span style="text-align: right">操作</span>
      </div>
      <div v-if="!data.loaded" class="loading">讀取中…</div>
      <div v-else-if="!list.length" class="empty">尚無符合的公告</div>
      <template v-else>
        <div
          v-for="n in list"
          :key="n.id"
          class="tr"
          style="grid-template-columns: 110px 76px 1fr 86px 110px"
        >
          <span style="font-size: 13px; color: #6b5a48">{{ n.date || '—' }}</span>
          <span>
            <span class="badge" :class="badgeClass(n.tag)">{{ n.tag }}</span>
          </span>
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
            {{ n.title }}
          </span>
          <span>
            <span class="badge" :class="badgeClass(n.status)">{{ n.status }}</span>
          </span>
          <span class="tbl-act">
            <span class="edit-link" @click="openEdit(n)">編輯</span>
            <span class="divider">|</span>
            <button class="btn-del" @click="del(n.id)">刪除</button>
          </span>
        </div>
      </template>
    </div>
    <div class="text-muted mb-2" style="font-size: 13px; margin-top: 10px">
      共 {{ list.length }} 則公告
    </div>

    <AppDrawer :title="drawerTitle" :visible="visible" :open="open" @close="closeDrawer">
      <div class="fr">
        <label class="lbl">公告標題</label>
        <input v-model="form.title" class="inp" placeholder="請輸入標題…" />
      </div>
      <div class="fg g2">
        <div>
          <label class="lbl">分類</label>
          <select v-model="form.tag" class="inp">
            <option>課程</option>
            <option>法會</option>
            <option>公告</option>
          </select>
        </div>
        <div>
          <label class="lbl">發佈日期</label>
<!--          @todo 變更為date picker -->
          <input v-model="form.date" class="inp" placeholder="2026.05.10" />
        </div>
      </div>
      <div class="fr">
        <label class="lbl">公告內文</label>
        <textarea
          v-model="form.content"
          class="inp"
          rows="7"
          placeholder="輸入詳細內容…"
        ></textarea>
      </div>
      <div class="fr">
        <label class="lbl">狀態</label>
        <select v-model="form.status" class="inp">
          <option>已發布</option>
          <option>草稿</option>
          <option>隱藏</option>
        </select>
      </div>
      <template #save>
        <button class="btn btn-gold" @click="save">儲存公告</button>
      </template>
    </AppDrawer>
  </div>
</template>
