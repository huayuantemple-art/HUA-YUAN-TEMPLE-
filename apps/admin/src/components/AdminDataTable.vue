<script setup lang="ts" generic="Row extends DataTableRowData">
import { computed, ref, watch } from 'vue'
import {
  NDataTable,
  NPagination,
  type DataTableColumns,
  type DataTableCreateRowKey,
  type DataTableRowData,
} from 'naive-ui'

const props = withDefaults(
  defineProps<{
    columns: DataTableColumns<Row>
    data: Row[]
    loading?: boolean
    itemLabel: string
    countUnit?: string
    emptyText?: string
    resetKey?: string | number
    rowKey?: DataTableCreateRowKey<Row>
    pageSizes?: number[]
  }>(),
  {
    loading: false,
    countUnit: '則',
    emptyText: '尚無資料',
    resetKey: '',
    rowKey: undefined,
    pageSizes: () => [10, 20, 50],
  },
)

const page = ref(1)
const pageSize = ref(10)

const pageCount = computed(() => Math.max(1, Math.ceil(props.data.length / pageSize.value)))

const pagedData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return props.data.slice(start, start + pageSize.value)
})

const paginationPrefix = () => `共 ${props.data.length} ${props.countUnit}${props.itemLabel}`

watch(
  () => props.resetKey,
  () => {
    page.value = 1
  },
)

watch([() => props.data.length, pageSize], () => {
  if (page.value > pageCount.value) page.value = pageCount.value
})
</script>

<template>
  <div class="pb-[78px]">
    <div
      class="card [&_.n-data-table-th]:px-[22px] [&_.n-data-table-th]:py-3 [&_.n-data-table-th]:text-xs [&_.n-data-table-th]:font-normal [&_.n-data-table-th]:tracking-[0.06em] [&_.n-data-table-td]:px-[22px] [&_.n-data-table-td]:py-3.5 [&_.n-data-table-td]:text-sm [&_.n-data-table-td--last-col]:pr-[22px] [&_.n-data-table-th--last-col]:pr-[22px]"
    >
      <NDataTable
        :columns="columns"
        :data="pagedData"
        :loading="loading"
        :row-key="rowKey"
        :bordered="false"
        :single-line="false"
      >
        <template #empty>
          <slot name="empty">{{ emptyText }}</slot>
        </template>
      </NDataTable>
    </div>

    <div
      class="fixed right-0 bottom-4 left-[248px] z-30 flex justify-center  bg-[rgba(242,239,234,0.96)] px-[34px] py-4 backdrop-blur"
    >
      <NPagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :item-count="data.length"
        :page-sizes="pageSizes"
        :prefix="paginationPrefix"
        show-size-picker
      />
    </div>
  </div>
</template>
