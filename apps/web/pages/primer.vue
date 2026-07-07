<script setup lang="ts">
const api = useApi()
const { copy } = useSiteCopy()
const { data: docs, pending: docsPending } = useLazyAsyncData('documents', () =>
  api.documents.listPublished(),
)
const { data: sutras, pending: sutrasPending } = useLazyAsyncData('sutras', () =>
  api.sutras.listPublished(),
)
const list = computed(() => docs.value ?? [])
// 線上閱讀與下方佛法文檔一一對應:僅列有對應文檔的經文(document_id 由後台自動連動);
// 心經等無對應文檔者不列入,首頁 /sutra 專屬入口不受影響
const readingList = computed(() =>
  (sutras.value ?? []).filter((sutra) => sutra.document_id !== null),
)

function documentExtension(filename: string): string {
  return filename.split('.').pop()?.toUpperCase() || '檔案'
}

function documentDownloadName(name: string, filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase()
  return extension ? `${name}.${extension}` : name
}

function documentDownloadUrl(name: string, filename: string): string {
  const params = new URLSearchParams({
    path: filename,
    name: documentDownloadName(name, filename),
  })
  return `/api/download?${params.toString()}`
}
</script>

<template>
  <div>
    <div class="banner">
      <div class="banner-en">DHARMA PRIMER</div>
      <h1>法寶略節</h1>
      <p>{{ copy('primer_banner_quote') }}</p>
    </div>
    <div class="primer-wrap" style="max-width: 1080px; margin: 0 auto; padding: 60px 40px 80px">
      <div
        style="
          font-family: 'Noto Serif TC', serif;
          font-size: 24px;
          color: #3a211c;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        "
      >
        線上閱讀
      </div>
      <div style="width: 48px; height: 2px; background: #c9a24b; margin-bottom: 34px"></div>
      <div
        v-if="sutrasPending"
        class="loading"
      >
        讀取中…
      </div>
      <div
        v-else-if="readingList.length"
        class="primer-reading-grid"
        style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px"
      >
        <NuxtLink
          v-for="sutra in readingList"
          :key="sutra.id"
          class="dharma-card"
          :to="`/sutra/${sutra.id}`"
          style="text-align: left; display: block"
        >
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 16px;
            "
          >
            <div
              style="
                width: 46px;
                height: 46px;
                border: 1px solid #c9a24b;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Noto Serif TC', serif;
                color: #c9a24b;
                font-size: 18px;
              "
            >
              經
            </div>
            <span
              style="
                font-size: 11px;
                padding: 3px 10px;
                background: rgba(110, 140, 80, 0.15);
                color: #5f7a3e;
              "
              >{{ copy('primer_reading_badge') }}</span
            >
          </div>
          <div class="dharma-name">{{ sutra.title }}</div>
          <p class="dharma-desc">{{ sutra.translator || copy('primer_reading_fallback_desc') }}</p>
          <div class="dharma-more" style="margin-top: 14px">閱讀經文 →</div>
        </NuxtLink>
      </div>
      <div v-else class="empty-msg">目前尚無經文，敬請期待。</div>

      <div
        style="
          margin-top: 52px;
          font-family: 'Noto Serif TC', serif;
          font-size: 24px;
          color: #3a211c;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        "
      >
        佛法文檔下載
      </div>
      <div style="width: 48px; height: 2px; background: #c9a24b; margin-bottom: 34px"></div>
      <div>
        <div v-if="docsPending" class="loading">讀取中…</div>
        <template v-else-if="list.length">
          <div v-for="d in list" :key="d.id" class="doc-item fadein">
            <div class="doc-icon">▤</div>
            <div class="doc-info">
              <div class="doc-name">{{ d.name }}</div>
              <div class="doc-desc">{{ d.description || '' }}</div>
            </div>
            <a
              class="doc-dl"
              :href="documentDownloadUrl(d.name, d.filename)"
              >下載 {{ documentExtension(d.filename) }} ↓</a
            >
          </div>
        </template>
        <div v-else class="empty-msg">目前尚無文檔，敬請期待。</div>
      </div>
    </div>
  </div>
</template>
