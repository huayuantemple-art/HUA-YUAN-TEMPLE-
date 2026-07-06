<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import { useDialog, type DataTableColumns } from 'naive-ui'
import type { Course, CourseStatus } from '@huayuan/shared'
import AdminDataTable from '../components/AdminDataTable.vue'
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
const dialog = useDialog()

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

function del(course: Course) {
  dialog.warning({
    title: '確認刪除課程',
    content: `確定刪除「${course.name}」？此操作無法復原。`,
    positiveText: '刪除',
    negativeText: '取消',
    autoFocus: false,
    positiveButtonProps: { type: 'error', secondary: true },
    negativeButtonProps: { secondary: true },
    async onPositiveClick() {
      await removeCourse(course.id)
    },
  })
}

async function removeCourse(id: number) {
  try {
    await api.courses.remove(id)
  } catch (error) {
    toast('刪除失敗：' + (error as Error).message, true)
    return
  }
  data.courses = data.courses.filter((x) => x.id !== id)
  toast('已刪除')
}

const columns: DataTableColumns<Course> = [
  {
    title: '課程名稱',
    key: 'name',
    ellipsis: { tooltip: true },
  },
  {
    title: '時間',
    key: 'schedule',
    width: 130,
    render: (row) => h('span', { class: 'text-[13px] text-muted' }, row.schedule || '—'),
  },
  {
    title: '程度',
    key: 'level',
    width: 80,
    render: (row) => h('span', { class: 'text-[13px] text-muted' }, row.level || '—'),
  },
  {
    title: '狀態',
    key: 'status',
    width: 86,
    render: (row) => h('span', { class: ['badge', badgeClass(row.status)] }, row.status),
  },
  {
    title: '操作',
    key: 'actions',
    width: 110,
    align: 'right',
    render: (row) =>
      h('span', { class: 'inline-flex items-center justify-end gap-[10px] whitespace-nowrap' }, [
        h(
          'button',
          {
            type: 'button',
            class:
              'edit-link appearance-none border-0 bg-transparent p-0 font-[inherit] leading-[inherit]',
            onClick: () => openEdit(row),
          },
          '編輯',
        ),
        h('span', { class: 'divider' }, '|'),
        h('button', { type: 'button', class: 'btn-del', onClick: () => del(row) }, '刪除'),
      ]),
  },
]

onMounted(() => {
  if (ui.consumeDrawer('courses')) setTimeout(openNew, 100)
})
</script>

<template>
  <div>
    <div class="row-between">
      <div class="text-muted text-sm">管理顯示於前台與報名頁的課程</div>
      <button class="btn btn-dark" @click="openNew">＋ 新增課程</button>
    </div>

    <AdminDataTable
      :columns="columns"
      :data="data.courses"
      :loading="!data.loaded"
      item-label="課程"
      count-unit="門"
      empty-text="尚無課程"
    />

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
