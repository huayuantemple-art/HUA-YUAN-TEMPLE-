<script setup lang="ts">
const api = useApi()
const pdfUrl = usePdfUrl()
const { data: docs, pending } = useLazyAsyncData('documents', () => api.documents.listPublished())
const list = computed(() => docs.value ?? [])
</script>

<template>
  <div>
    <div class="banner">
      <div class="banner-en">DHARMA PRIMER</div>
      <h1>入門佛法</h1>
      <p>循序漸進，建立正知正見</p>
    </div>
    <div style="max-width: 1080px; margin: 0 auto; padding: 60px 40px 80px">
      <div
        style="
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
        <div v-if="pending" class="loading">讀取中…</div>
        <template v-else-if="list.length">
          <div v-for="d in list" :key="d.id" class="doc-item fadein">
            <div class="doc-icon">▤</div>
            <div class="doc-info">
              <div class="doc-name">{{ d.name }}</div>
              <div class="doc-desc">{{ d.description || '' }}</div>
            </div>
            <a class="doc-dl" :href="pdfUrl(d.filename)" target="_blank" rel="noopener"
              >下載 PDF ↓</a
            >
          </div>
        </template>
        <div v-else class="empty-msg">目前尚無文檔，敬請期待。</div>
      </div>

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
        線上閱讀
      </div>
      <div style="width: 48px; height: 2px; background: #c9a24b; margin-bottom: 34px"></div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px">
        <NuxtLink class="dharma-card" to="/dharma" style="text-align: left; display: block">
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
              法
            </div>
            <span
              style="
                font-size: 11px;
                padding: 3px 10px;
                background: rgba(110, 140, 80, 0.15);
                color: #5f7a3e;
              "
              >可閱讀</span
            >
          </div>
          <div class="dharma-name">入佛門法要</div>
          <p class="dharma-desc">三皈依、五戒、三學，初入佛門之綱要。</p>
          <div class="dharma-more" style="margin-top: 14px">線上閱讀 →</div>
        </NuxtLink>
        <NuxtLink class="dharma-card" to="/sutra" style="text-align: left; display: block">
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
              >可閱讀</span
            >
          </div>
          <div class="dharma-name">般若波羅蜜多心經</div>
          <p class="dharma-desc">二百六十字攝盡般若精要，照見五蘊皆空。</p>
          <div class="dharma-more" style="margin-top: 14px">閱讀經文 →</div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
