<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue'
import { useDialog, type DataTableColumns } from 'naive-ui'
import {
  DHARMA_GROUP_KEYS,
  DHARMA_GROUP_LABELS,
  type DharmaGroupKey,
  type DharmaSection,
  type DharmaSectionStatus,
} from '@huayuan/shared'
import AdminDataTable from '../components/AdminDataTable.vue'
import AppDrawer from '../components/AppDrawer.vue'
import { useDrawer } from '../composables/useDrawer'
import { api } from '../lib/api'
import { badgeClass } from '../lib/badge'
import { toast } from '../lib/toast'
import { useDataStore } from '../stores/data'

const data = useDataStore()
const { visible, open, openDrawer, closeDrawer } = useDrawer()
const dialog = useDialog()

const groupFilter = ref<'' | DharmaGroupKey>('')

/** 依章節枚舉順序 + seq 排列,達成「依章節分組」檢視;下拉可再聚焦單一章節 */
const listed = computed(() => {
  const rows = groupFilter.value
    ? data.dharmaSections.filter((row) => row.group_key === groupFilter.value)
    : data.dharmaSections
  return [...rows].sort(
    (a, b) =>
      DHARMA_GROUP_KEYS.indexOf(a.group_key) - DHARMA_GROUP_KEYS.indexOf(b.group_key) ||
      a.seq - b.seq,
  )
})

const drawerTitle = ref('新增小節')
const form = reactive({
  id: null as number | null,
  group_key: 'sanjie' as DharmaGroupKey,
  title: '',
  content: '',
  seq: 10,
  status: '草稿' as DharmaSectionStatus,
})

function nextSeq(group: DharmaGroupKey): number {
  const seqs = data.dharmaSections
    .filter((row) => row.group_key === group)
    .map((row) => row.seq)
  return Math.max(0, ...seqs) + 10
}

function openNew() {
  drawerTitle.value = '新增小節'
  const group = groupFilter.value || 'sanjie'
  Object.assign(form, {
    id: null,
    group_key: group,
    title: '',
    content: '',
    seq: nextSeq(group),
    status: '草稿',
  })
  openDrawer()
}

function openEdit(section: DharmaSection) {
  drawerTitle.value = '編輯小節'
  Object.assign(form, {
    id: section.id,
    group_key: section.group_key,
    title: section.title ?? '',
    content: section.content,
    seq: section.seq,
    status: section.status,
  })
  openDrawer()
}

async function save() {
  const payload = {
    group_key: form.group_key,
    title: form.title.trim() || null,
    content: form.content.trim(),
    seq: Number(form.seq) || nextSeq(form.group_key),
    status: form.status,
  }
  if (!payload.content) {
    toast('請填入小節內文', true)
    return
  }

  try {
    if (form.id) await api.dharmaSections.update(form.id, payload)
    else await api.dharmaSections.create(payload)
  } catch (error) {
    toast('儲存失敗：' + (error as Error).message, true)
    return
  }

  toast('小節已儲存')
  closeDrawer()
  await data.reloadDharmaSections()
}

function del(section: DharmaSection) {
  dialog.warning({
    title: '確認刪除小節',
    content: `確定刪除「${DHARMA_GROUP_LABELS[section.group_key]} · ${
      section.title ?? '經句框'
    }」？此操作無法復原。`,
    positiveText: '刪除',
    negativeText: '取消',
    autoFocus: false,
    positiveButtonProps: { type: 'error', secondary: true },
    negativeButtonProps: { secondary: true },
    async onPositiveClick() {
      await removeSection(section.id)
    },
  })
}

async function removeSection(id: number) {
  try {
    await api.dharmaSections.remove(id)
  } catch (error) {
    toast('刪除失敗：' + (error as Error).message, true)
    return
  }
  data.dharmaSections = data.dharmaSections.filter((section) => section.id !== id)
  toast('已刪除')
}

const columns: DataTableColumns<DharmaSection> = [
  {
    title: '章節',
    key: 'group_key',
    width: 96,
    render: (row) =>
      h('span', { class: ['badge', 'b-draft'] }, DHARMA_GROUP_LABELS[row.group_key]),
  },
  {
    title: '排序',
    key: 'seq',
    width: 76,
    render: (row) => h('span', { class: 'text-[13px] text-muted' }, row.seq),
  },
  {
    title: '小節',
    key: 'title',
    width: 190,
    ellipsis: { tooltip: true },
    render: (row) =>
      row.title
        ? h('span', row.title)
        : h('span', { class: 'text-[13px] text-muted' }, '（置中經句框）'),
  },
  {
    title: '內文',
    key: 'content',
    ellipsis: { tooltip: true },
    render: (row) =>
      h('span', { class: 'text-[13px] text-muted' }, row.content.split('\n')[0]),
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
</script>

<template>
  <div>
    <div class="row-between">
      <div class="flex items-center gap-[10px]">
        <select v-model="groupFilter" class="inp w-[180px]">
          <option value="">全部章節</option>
          <option v-for="key in DHARMA_GROUP_KEYS" :key="key" :value="key">
            {{ DHARMA_GROUP_LABELS[key] }}
          </option>
        </select>
        <div class="text-muted" style="font-size: 14px">
          調整 seq、狀態或內文後，前台「入佛門法要」頁會依資料庫內容呈現。
        </div>
      </div>
      <button class="btn btn-dark" @click="openNew">＋ 新增小節</button>
    </div>

    <AdminDataTable
      :columns="columns"
      :data="listed"
      :loading="!data.loaded"
      :reset-key="groupFilter"
      item-label="小節"
      count-unit="則"
      empty-text="尚無小節，點擊「新增小節」開始新增"
    />

    <AppDrawer :title="drawerTitle" :visible="visible" :open="open" @close="closeDrawer">
      <div class="fr">
        <label class="lbl">章節</label>
        <select v-model="form.group_key" class="inp">
          <option v-for="key in DHARMA_GROUP_KEYS" :key="key" :value="key">
            {{ DHARMA_GROUP_LABELS[key] }}
          </option>
        </select>
      </div>
      <div class="fr">
        <label class="lbl">排序 seq</label>
        <input v-model.number="form.seq" class="inp" type="number" min="1" step="1" />
      </div>
      <div class="fr">
        <label class="lbl">小節標題</label>
        <input v-model="form.title" class="inp" placeholder="例：一、釋名；留空＝置中經句框" />
      </div>
      <div class="fr">
        <label class="lbl">內文</label>
        <textarea
          v-model="form.content"
          class="inp dharma-content-input"
          rows="12"
          placeholder="純文字；每行一段。「標題｜說明」一行成一條列項（①②…開頭排成雙欄格線）；行首「＊」顯示為粗體"
        ></textarea>
      </div>
      <div class="fr">
        <label class="lbl">狀態</label>
        <select v-model="form.status" class="inp">
          <option>已發布</option>
          <option>草稿</option>
        </select>
      </div>
      <template #save>
        <button class="btn btn-gold" @click="save">儲存小節</button>
      </template>
    </AppDrawer>
  </div>
</template>

<style scoped>
.dharma-content-input {
  min-height: 300px;
  line-height: 1.8;
}
</style>
