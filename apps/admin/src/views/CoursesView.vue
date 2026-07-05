<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { Course, CourseStatus } from '@huayuan/shared'
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

const drawerTitle = ref('新增課程')
const form = reactive({
  id: null as number | null,
  name: '',
  schedule: '',
  level: '',
  description: '',
  status: '招生中' as CourseStatus,
})

function openNew() {
  drawerTitle.value = '新增課程'
  Object.assign(form, {
    id: null,
    name: '',
    schedule: '',
    level: '',
    description: '',
    status: '招生中',
  })
  openDrawer()
}

function openEdit(c: Course) {
  drawerTitle.value = '編輯課程'
  Object.assign(form, {
    id: c.id,
    name: c.name,
    schedule: c.schedule ?? '',
    level: c.level ?? '',
    description: c.description ?? '',
    status: c.status,
  })
  openDrawer()
}

async function save() {
  const p = {
    name: form.name.trim() || '（未命名課程）',
    schedule: form.schedule.trim(),
    level: form.level.trim(),
    description: form.description.trim(),
    status: form.status,
  }
  try {
    if (form.id) await api.courses.update(form.id, p)
    else await api.courses.create(p)
  } catch (error) {
    toast('儲存失敗：' + (error as Error).message, true)
    return
  }
  toast('課程已儲存')
  closeDrawer()
  await data.reloadCourses()
}

async function del(id: number) {
  if (!confirm('確定刪除此課程？')) return
  try {
    await api.courses.remove(id)
  } catch (error) {
    toast('刪除失敗：' + (error as Error).message, true)
    return
  }
  data.courses = data.courses.filter((x) => x.id !== id)
  toast('已刪除')
}

onMounted(() => {
  if (ui.consumeDrawer('courses')) setTimeout(openNew, 100)
})
</script>

<template>
  <div>
    <div class="row-between">
      <div class="text-muted" style="font-size: 14px">管理顯示於前台與報名頁的課程</div>
      <button class="btn btn-dark" @click="openNew">＋ 新增課程</button>
    </div>

    <div class="card">
      <div class="th" style="grid-template-columns: 1fr 130px 80px 86px 110px">
        <span>課程名稱</span><span>時間</span><span>程度</span><span>狀態</span>
        <span style="text-align: right">操作</span>
      </div>
      <div v-if="!data.loaded" class="loading">讀取中…</div>
      <div v-else-if="!data.courses.length" class="empty">尚無課程</div>
      <template v-else>
        <div
          v-for="c in data.courses"
          :key="c.id"
          class="tr"
          style="grid-template-columns: 1fr 130px 80px 86px 110px"
        >
          <span>{{ c.name }}</span>
          <span class="text-muted" style="font-size: 13px">{{ c.schedule || '—' }}</span>
          <span class="text-muted" style="font-size: 13px">{{ c.level || '—' }}</span>
          <span>
            <span class="badge" :class="badgeClass(c.status)">{{ c.status }}</span>
          </span>
          <span class="tbl-act">
            <span class="edit-link" @click="openEdit(c)">編輯</span>
            <span class="divider">|</span>
            <button class="btn-del" @click="del(c.id)">刪除</button>
          </span>
        </div>
      </template>
    </div>

    <AppDrawer :title="drawerTitle" :visible="visible" :open="open" @close="closeDrawer">
      <div class="fr">
        <label class="lbl">課程名稱</label>
        <input v-model="form.name" class="inp" placeholder="例：《心經》研讀班" />
      </div>
      <div class="fg g2">
        <div>
          <label class="lbl">上課時間</label>
          <input v-model="form.schedule" class="inp" placeholder="週二 19:30" />
        </div>
        <div>
          <label class="lbl">程度</label>
          <input v-model="form.level" class="inp" placeholder="初階 / 進階 / 兒童" />
        </div>
      </div>
      <div class="fr">
        <label class="lbl">課程說明</label>
        <textarea
          v-model="form.description"
          class="inp"
          rows="5"
          placeholder="課程簡介…"
        ></textarea>
      </div>
      <div class="fr">
        <label class="lbl">狀態</label>
        <select v-model="form.status" class="inp">
          <option>招生中</option>
          <option>額滿</option>
          <option>草稿</option>
        </select>
      </div>
      <template #save>
        <button class="btn btn-gold" @click="save">儲存課程</button>
      </template>
    </AppDrawer>
  </div>
</template>
