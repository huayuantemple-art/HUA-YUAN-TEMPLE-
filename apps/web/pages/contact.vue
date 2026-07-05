<script setup lang="ts">
import { resolveMapEmbedSrc } from '@huayuan/shared'
import type { Contact } from '@huayuan/shared'

const api = useApi()
const { data: contact, pending } = useLazyAsyncData('contact', () => api.contact.get())

// 地圖只從白名單網址組 iframe(content-sanitization spec);非白名單/未設定顯示安全預設
const mapSrc = computed(() => resolveMapEmbedSrc(contact.value?.map_embed))
const mapSrc2 = computed(() => resolveMapEmbedSrc(contact.value?.map_embed2))

function venues(row: Contact | null) {
  if (!row) return []
  return [
    {
      name: row.venue_name,
      address: row.address,
      phone: row.phone,
      transport: row.transport,
      map: mapSrc.value,
    },
    {
      name: row.venue_name2,
      address: row.address2,
      phone: row.phone2,
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
          <h1 class="contact-section-title">聯絡資訊</h1>
          <div class="contact-title-line"></div>
          <div class="contact-venues">
            <div v-for="(venue, index) in venues(contact)" :key="index" class="contact-venue">
              <div class="contact-icon" aria-hidden="true">⊕</div>
              <div>
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
          <div class="contact-title-line"></div>
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
          <div class="contact-title-line"></div>
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
    </div>
  </div>
</template>
