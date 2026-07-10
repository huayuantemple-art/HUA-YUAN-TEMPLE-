<script setup lang="ts">
import { resolveMapEmbedSrc } from '@huayuan/shared'
import type { Contact } from '@huayuan/shared'
import defaultContactIconUrl from '~/assets/img/huayuan-logo.png'

const api = useApi()
const { data: contact, pending } = useLazyAsyncData('contact', () => api.contact.get())

// 學員提問表單:姓名與內容必填,聯絡方式選填;送出只寫入(return=minimal),不讀回
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

      <section class="contact-section">
        <h2 class="contact-section-title">學員提問</h2>
        <p class="contact-form-intro">有任何問題，歡迎留言，我們會盡快與您聯繫。</p>
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
