<script setup lang="ts">
import { resolveMapEmbedSrc } from '@huayuan/shared'

const api = useApi()
const { data: contact, pending } = useLazyAsyncData('contact', () => api.contact.get())

// 地圖只從白名單網址組 iframe(content-sanitization spec);非白名單/未設定顯示安全預設
const mapSrc = computed(() => resolveMapEmbedSrc(contact.value?.map_embed))
</script>

<template>
  <div>
    <div class="banner">
      <div class="banner-en">CONTACT</div>
      <h1>聯絡我們</h1>
      <p>歡迎來訪 · 與我們連結</p>
    </div>
    <div
      class="rwd-contact-grid"
      style="
        max-width: 1000px;
        margin: 0 auto;
        padding: 70px 40px 80px;
        display: grid;
        grid-template-columns: 1fr 1.1fr;
        gap: 48px;
      "
    >
      <div>
        <div class="sec-en" style="margin-bottom: 12px">聯絡資訊</div>
        <div>
          <div v-if="pending" class="loading">讀取中…</div>
          <div v-else-if="!contact" class="empty-msg">聯絡資訊載入中，請稍候。</div>
          <div v-else style="background: #3a211c; color: #f7efd9; padding: 36px 32px">
            <div class="contact-info-row">
              <div class="contact-label">地址</div>
              <div class="contact-val">{{ contact.address || '' }}</div>
            </div>
            <div class="contact-info-row">
              <div class="contact-label">電話</div>
              <div class="contact-val">{{ contact.phone || '' }}</div>
            </div>
            <div class="contact-info-row">
              <div class="contact-label">信箱</div>
              <div class="contact-val">{{ contact.email || '' }}</div>
            </div>
            <div class="contact-info-row">
              <div class="contact-label">時間</div>
              <div class="contact-val">{{ contact.hours || '' }}</div>
            </div>
            <div v-if="contact.transport" class="contact-info-row">
              <div class="contact-label">交通</div>
              <div class="contact-val">{{ contact.transport }}</div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="sec-en" style="margin-bottom: 20px">地圖位置</div>
        <div
          style="
            width: 100%;
            min-height: 280px;
            background: #e7dcc4;
            border: 1px solid rgba(201, 162, 75, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #8a6f55;
            font-size: 14px;
          "
        >
          <template v-if="pending || !contact">地圖載入中…</template>
          <iframe
            v-else-if="mapSrc"
            :src="mapSrc"
            width="100%"
            height="280"
            style="border: 0"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
          <div v-else style="padding: 40px; text-align: center; color: #8a6f55">
            地圖嵌入碼尚未設定
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
