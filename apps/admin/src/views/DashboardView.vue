<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { badgeClass } from '../lib/badge'
import { useDataStore } from '../stores/data'
import { useUiStore } from '../stores/ui'

const router = useRouter()
const data = useDataStore()
const ui = useUiStore()

const stat = (n: number) => (data.loaded ? String(n) : '—')
const recent = computed(() => data.announcements.slice(0, 5))

// 同舊站快速操作:導頁後自動開「新增」抽屜
function quickNew(view: 'announcements' | 'courses' | 'documents') {
  ui.requestDrawer(view)
  void router.push({ name: view })
}
</script>

<template>
  <div>
    <div class="stats-grid">
      <div class="stat">
        <div class="stat-lbl">公告</div>
        <span class="stat-val">{{ stat(data.announcements.length) }}</span>
        <span class="stat-sub">則</span>
      </div>
      <div class="stat">
        <div class="stat-lbl">課程</div>
        <span class="stat-val">{{ stat(data.courses.length) }}</span>
        <span class="stat-sub">門</span>
      </div>
      <div class="stat">
        <div class="stat-lbl">影音</div>
        <span class="stat-val">{{ stat(data.videos.length) }}</span>
        <span class="stat-sub">部</span>
      </div>
      <div class="stat">
        <div class="stat-lbl">佛法文檔</div>
        <span class="stat-val">{{ stat(data.documents.length) }}</span>
        <span class="stat-sub">份</span>
      </div>
      <div class="stat">
        <div class="stat-lbl">報名總數</div>
        <span class="stat-val">{{ stat(data.registrations.length) }}</span>
        <span class="stat-sub">人</span>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1.6fr 1fr; gap: 18px">
      <div class="card card-pad">
        <div class="row-between" style="margin-bottom: 14px">
          <div class="sec-title">最近公告</div>
          <span class="edit-link" @click="router.push({ name: 'announcements' })">管理全部 →</span>
        </div>
        <div v-if="!data.loaded" class="loading">讀取中…</div>
        <div v-else-if="!recent.length" class="empty">尚無公告</div>
        <template v-else>
          <div
            v-for="n in recent"
            :key="n.id"
            style="
              display: flex;
              align-items: center;
              gap: 14px;
              padding: 11px 0;
              border-bottom: 1px solid #f0ece3;
            "
          >
            <span style="font-size: 13px; color: #a89b86; width: 76px; flex-shrink: 0">
              {{ n.date || '—' }}
            </span>
            <span class="badge b-draft" style="flex-shrink: 0">{{ n.tag }}</span>
            <span
              style="
                font-size: 14px;
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              "
            >
              {{ n.title }}
            </span>
            <span class="badge" :class="badgeClass(n.status)">{{ n.status }}</span>
          </div>
        </template>
      </div>

      <div class="card card-pad">
        <div class="sec-title mb-2">快速操作</div>
        <div class="quick-list">
          <div class="quick-item" @click="quickNew('announcements')">
            <div class="quick-icon">✦</div>
            <div style="flex: 1; font-size: 14px">新增公告</div>
            <span style="color: #c9bca8">›</span>
          </div>
          <div class="quick-item" @click="quickNew('courses')">
            <div class="quick-icon">✎</div>
            <div style="flex: 1; font-size: 14px">新增課程</div>
            <span style="color: #c9bca8">›</span>
          </div>
          <div class="quick-item" @click="quickNew('documents')">
            <div class="quick-icon">▤</div>
            <div style="flex: 1; font-size: 14px">新增佛法文檔</div>
            <span style="color: #c9bca8">›</span>
          </div>
          <div class="quick-item" @click="router.push({ name: 'registrations' })">
            <div class="quick-icon">✓</div>
            <div style="flex: 1; font-size: 14px">查看報名資料</div>
            <span style="color: #c9bca8">›</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
