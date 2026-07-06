<script setup lang="ts">
import {
  DHARMA_GROUP_LABELS,
  escapeHtml,
  type DharmaGroupKey,
  type DharmaSection,
} from '@huayuan/shared'

/** 章節為固定枚舉:錨點、圓形圖示與標題樣式綁章節(dharma-cms design 決策 2) */
const GROUP_META: Array<{ key: DharmaGroupKey; anchor: string; icon: string }> = [
  { key: 'intro', anchor: 'd-intro', icon: '' },
  { key: 'sanjie', anchor: 'd-sanjie', icon: '皈' },
  { key: 'wujie', anchor: 'd-wujie', icon: '戒' },
  { key: 'sanxue', anchor: 'd-sanxue', icon: '學' },
]

const api = useApi()
const { data: sections } = await useAsyncData('dharma-sections', () =>
  api.dharmaSections.listPublished(),
)

interface Entry {
  title: string
  desc: string
}

type Block =
  | { kind: 'text'; html: string }
  | { kind: 'grid'; entries: Entry[] }
  | { kind: 'items'; entries: Entry[] }

/** 逐行 escapeHtml 後以 <br /> 相連;行首「＊」呈現為粗體強調 */
function linesToHtml(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      line.startsWith('＊') ? `<strong>${escapeHtml(line.slice(1))}</strong>` : escapeHtml(line),
    )
    .join('<br />')
}

/**
 * 純文字行內慣例 → 版面區塊(慣例定義見 seed migration 檔頭):
 * 「標題｜說明」行為條列項,①②… 開頭者排成雙欄格線;其餘行合併為段落
 */
function parseBlocks(content: string): Block[] {
  const blocks: Block[] = []
  const textLines: string[] = []
  const flushText = () => {
    if (!textLines.length) return
    blocks.push({ kind: 'text', html: linesToHtml(textLines.join('\n')) })
    textLines.length = 0
  }
  for (const line of content.split('\n').map((l) => l.trim()).filter(Boolean)) {
    const sep = line.indexOf('｜')
    if (sep > 0) {
      flushText()
      const entry = { title: line.slice(0, sep).trim(), desc: line.slice(sep + 1).trim() }
      const kind = /^[①-⑳]/.test(entry.title) ? 'grid' : 'items'
      const last = blocks[blocks.length - 1]
      if (last && last.kind !== 'text' && last.kind === kind) last.entries.push(entry)
      else blocks.push({ kind, entries: [entry] })
    } else {
      textLines.push(line)
    }
  }
  flushText()
  return blocks
}

const groups = computed(() => {
  const rows: DharmaSection[] = sections.value ?? []
  return GROUP_META.map((meta) => ({
    ...meta,
    label: DHARMA_GROUP_LABELS[meta.key],
    rows: rows
      .filter((row) => row.group_key === meta.key)
      .sort((a, b) => a.seq - b.seq)
      .map((row) => ({ ...row, blocks: parseBlocks(row.content) })),
  })).filter((group) => group.rows.length > 0)
})
</script>

<template>
  <div>
    <div
      class="sutra-page-hero"
      style="
        padding: 60px 56px 50px;
        background: linear-gradient(180deg, #4a2a22, #3a211c);
        color: #f7efd9;
        text-align: center;
      "
    >
      <NuxtLink
        to="/primer"
        style="
          font-size: 13px;
          color: #c9a24b;
          text-decoration: none;
          letter-spacing: 0.1em;
          cursor: pointer;
        "
        >← 返回法寶略節</NuxtLink
      >
      <h1
        style="
          font-family: 'Noto Serif TC', serif;
          font-weight: 500;
          font-size: 42px;
          margin: 18px 0 10px;
          letter-spacing: 0.16em;
        "
      >
        入佛門法要
      </h1>
      <p style="font-size: 14px; color: #c9a24b; margin: 0; letter-spacing: 0.2em">
        初入佛門綱要 · 護持正法
      </p>
    </div>
    <div v-if="groups.length" class="sutra-nav">
      <div class="sutra-nav-inner">
        <a
          v-for="(group, gi) in groups"
          :key="group.key"
          :href="`#${group.anchor}`"
          :class="{ active: gi === 0 }"
          >{{ group.label }}</a
        >
      </div>
    </div>
    <div class="sutra-content-wrap" style="max-width: 860px; margin: 0 auto; padding: 60px 40px 80px">
      <template v-for="group in groups" :key="group.key">
        <div v-if="group.key === 'intro'" :id="group.anchor" class="sutra-quote">
          <div
            style="
              font-family: 'Noto Serif TC', serif;
              font-size: 12px;
              color: #b8893a;
              letter-spacing: 0.4em;
              margin-bottom: 20px;
              text-align: center;
            "
          >
            序 · 經文
          </div>
          <template v-for="row in group.rows" :key="row.id">
            <div
              v-if="row.title"
              style="
                font-size: 13px;
                color: #b8893a;
                letter-spacing: 0.2em;
                margin-bottom: 14px;
                text-align: center;
              "
            >
              {{ row.title }}
            </div>
            <!-- eslint-disable vue/no-v-html -- linesToHtml 已逐行 escapeHtml,僅插入受控 <br>/<strong> -->
            <p
              style="
                font-family: 'Noto Serif TC', serif;
                font-size: 17px;
                line-height: 2.6;
                color: #2a1a16;
                margin: 0;
                letter-spacing: 0.04em;
                text-align: justify;
              "
              v-html="linesToHtml(row.content)"
            ></p>
          </template>
        </div>
        <div v-else :id="group.anchor" class="sutra-section">
          <div class="sutra-section-head">
            <div class="sutra-icon">{{ group.icon }}</div>
            <h2
              style="
                font-family: 'Noto Serif TC', serif;
                font-size: 28px;
                color: #3a211c;
                margin: 0;
                letter-spacing: 0.16em;
              "
            >
              {{ group.label }}
            </h2>
          </div>
          <div class="sutra-card">
            <template v-for="(row, ri) in group.rows" :key="row.id">
              <div v-if="row.title && ri > 0" class="sutra-divider"></div>
              <!-- title 為 null → 置中經句框 -->
              <!-- eslint-disable-next-line vue/no-v-html -- linesToHtml 已逐行 escapeHtml -->
              <div v-if="!row.title" class="sutra-box" v-html="linesToHtml(row.content)"></div>
              <template v-else>
                <div class="sutra-subtitle">{{ row.title }}</div>
                <template v-for="(block, bi) in row.blocks" :key="bi">
                  <!-- eslint-disable-next-line vue/no-v-html -- block.html 由 linesToHtml 產生,已逐行 escapeHtml -->
                  <p v-if="block.kind === 'text'" class="sutra-text" v-html="block.html"></p>
                  <div
                    v-else-if="block.kind === 'grid'"
                    class="sutra-inline-grid"
                    style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 22px"
                  >
                    <div
                      v-for="entry in block.entries"
                      :key="entry.title"
                      style="
                        padding: 10px 14px;
                        background: rgba(201, 162, 75, 0.05);
                        border: 1px solid rgba(201, 162, 75, 0.2);
                      "
                    >
                      <div
                        style="
                          font-family: 'Noto Serif TC', serif;
                          font-size: 14px;
                          color: #3a211c;
                          margin-bottom: 3px;
                        "
                      >
                        {{ entry.title }}
                      </div>
                      <div style="font-size: 12px; color: #8a6f55; line-height: 1.8">
                        {{ entry.desc }}
                      </div>
                    </div>
                  </div>
                  <template v-else>
                    <div
                      v-for="(entry, ei) in block.entries"
                      :key="entry.title"
                      class="sutra-item"
                      :style="
                        ei === block.entries.length - 1 && ri < group.rows.length - 1
                          ? { marginBottom: '22px' }
                          : undefined
                      "
                    >
                      <div class="sutra-item-title">{{ entry.title }}</div>
                      <p class="sutra-item-desc">{{ entry.desc }}</p>
                    </div>
                  </template>
                </template>
              </template>
            </template>
          </div>
        </div>
      </template>
      <p v-if="!groups.length" class="sutra-text" style="text-align: center">
        法要內容整理中，敬請期待。
      </p>
    </div>
  </div>
</template>
