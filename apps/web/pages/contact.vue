<script setup lang="ts">
useSeoMeta({
  title: '聯絡與交通 · 華圓覺苑',
  description:
    '華圓覺苑地址、交通方式與聯絡電話，歡迎來電洽詢或親臨道場共修。',
  ogTitle: '聯絡與交通 · 華圓覺苑',
  ogDescription:
    '華圓覺苑地址、交通方式與聯絡電話，歡迎來電洽詢或親臨道場共修。',
})

import { resolveMapEmbedSrc } from '@huayuan/shared'
import type { Contact } from '@huayuan/shared'
import defaultContactIconUrl from '~/assets/img/huayuan-logo.png'

const api = useApi()
const { data: contact, pending } = useLazyAsyncData('contact', () => api.contact.get())

// 問題提問表單:姓名與內容必填,聯絡方式選填;送出只寫入(return=minimal),不讀回
const qForm = reactive({ name: '', contact: '', message: '' })
const qSubmitting = ref(false)
const qDone = ref(false)
const qError = ref('')

async function submitQuestion() {
  qError.value = ''
  if (!qForm.name.trim() || !qForm.message.trim()) {
    qError.value = '請填寫姓名與想詢問的內容。'
    return
  }
  qSubmitting.value = true
  try {
    await api.contactMessages.create({
      name: qForm.name.trim(),
      contact: qForm.contact.trim() || null,
      message: qForm.message.trim(),
    })
    qDone.value = true
    qForm.name = ''
    qForm.contact = ''
    qForm.message = ''
  } catch {
    qError.value = '送出失敗，請稍後再試，或直接以上方電話與我們聯繫。'
  } finally {
    qSubmitting.value = false
  }
}

// 地圖只從白名單網址組 iframe(content-sanitization spec);非白名單/未設定顯示安全預設
const mapSrc = computed(() => resolveMapEmbedSrc(contact.value?.map_embed))
const mapSrc2 = computed(() => resolveMapEmbedSrc(contact.value?.map_embed2))

function resolveContactIcon(iconUrl: string | null | undefined) {
  return iconUrl?.trim() || defaultContactIconUrl
}

function useDefaultContactIcon(event: Event) {
  const img = event.target as HTMLImageElement
  img.onerror = null
  img.src = defaultContactIconUrl
}

function venues(row: Contact | null) {
  if (!row) return []
  return [
    {
      name: row.venue_name,
      address: row.address,
      phone: row.phone,
      iconUrl: row.icon_url,
      transport: row.transport,
      map: mapSrc.value,
    },
    {
      name: row.venue_name2,
      address: row.address2,
      phone: row.phone2,
      iconUrl: row.icon_url2,
      transport: row.transport2,
      map: mapSrc2.value,
    },
  ].filter((venue) => venue.name || venue.address || venue.phone || venue.transport || venue.map)
}
</script>

<template>
  <div>
    <div class="banner">
      <div class="banner-en">CONTACT</div>
      <h1>聯絡我們</h1>
      <p>歡迎來訪 · 與我們連結</p>
    </div>
    <div class="contact-page">
      <div v-if="pending" class="loading">讀取中…</div>
      <div v-else-if="!contact" class="empty-msg">聯絡資訊載入中，請稍候。</div>
      <template v-else>
        <section class="contact-section contact-line-section">
          <h2 class="contact-section-title">加入 LINE</h2>
          <div class="contact-line">
            <img class="contact-line-qr" src="data:image/png;base64,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" alt="華圓覺苑官方 LINE QR Code" width="150" height="150" loading="lazy" />
            <div class="contact-line-body">
              <div class="contact-line-title">用 LINE 聯絡最方便</div>
              <p class="contact-line-note">
                手機請點下方按鈕直接加入好友；電腦請用手機掃描左方 QR 碼。
              </p>
              <a class="contact-line-btn" href="https://lin.ee/TfgwevK" target="_blank" rel="noopener">加入 LINE 好友</a>
            </div>
          </div>
        </section>

        <section class="contact-section">
          <h2 class="contact-section-title">聯絡資訊</h2>
          <div class="contact-venues">
            <div v-for="(venue, index) in venues(contact)" :key="index" class="contact-venue">
              <img
                class="contact-venue-icon"
                :src="resolveContactIcon(venue.iconUrl)"
                alt=""
                aria-hidden="true"
                loading="lazy"
                @error="useDefaultContactIcon"
              />
              <div class="contact-venue-body">
                <div class="contact-item-title">{{ venue.name || `道場地址 ${index + 1}` }}</div>
                <div v-if="venue.address" class="contact-address">{{ venue.address }}</div>
                <div v-if="venue.phone" class="contact-phone">{{ venue.phone }}</div>
              </div>
            </div>
          </div>
        </section>

        <section
          v-if="contact.transport || contact.transport2"
          class="contact-section contact-transport-section"
        >
          <h2 class="contact-section-title">交通方式</h2>
          <div class="contact-transport-list">
            <div v-if="contact.transport" class="contact-transport-row">
              <span class="contact-transport-tag">交通</span>
              <span>{{ contact.transport }}</span>
            </div>
            <div v-if="contact.transport2" class="contact-transport-row">
              <span class="contact-transport-tag">交通</span>
              <span>{{ contact.transport2 }}</span>
            </div>
          </div>
        </section>

        <section class="contact-section">
          <h2 class="contact-section-title">道場位置</h2>
          <div v-if="mapSrc || mapSrc2" class="contact-map-list">
            <iframe
              v-if="mapSrc"
              :src="mapSrc"
              width="100%"
              height="280"
              class="contact-map"
              loading="lazy"
              allowfullscreen
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
            <iframe
              v-if="mapSrc2"
              :src="mapSrc2"
              width="100%"
              height="280"
              class="contact-map"
              loading="lazy"
              allowfullscreen
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div v-else class="contact-map-empty">地圖嵌入碼尚未設定</div>
        </section>
      </template>

      <section class="contact-section contact-question">
        <div class="contact-question-head">
          <h2 class="contact-question-title">問題提問</h2>
          <div class="contact-question-rule"></div>
          <p class="contact-question-intro">有任何問題，歡迎留言或直接加入 LINE，我們會盡快與您聯繫。</p>
        </div>
        <div v-if="qDone" class="contact-form-done">
          已收到您的提問，我們會盡快與您聯繫。感恩！
        </div>
        <div v-else class="contact-form">
          <div class="contact-field">
            <label class="contact-label" for="q-name">姓名 <span class="req">*</span></label>
            <input id="q-name" v-model="qForm.name" class="contact-input" placeholder="請輸入您的稱呼" />
          </div>
          <div class="contact-field">
            <label class="contact-label" for="q-contact">聯絡方式（電話或 Email）</label>
            <input
              id="q-contact"
              v-model="qForm.contact"
              class="contact-input"
              placeholder="方便我們回覆您的電話或 Email"
            />
          </div>
          <div class="contact-field">
            <label class="contact-label" for="q-message">想詢問的內容 <span class="req">*</span></label>
            <textarea
              id="q-message"
              v-model="qForm.message"
              class="contact-input"
              rows="4"
              placeholder="請輸入您的問題…"
            ></textarea>
          </div>
          <div v-if="qError" class="contact-form-error">{{ qError }}</div>
          <button class="contact-submit" :disabled="qSubmitting" @click="submitQuestion">
            {{ qSubmitting ? '送出中…' : '送出提問' }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
