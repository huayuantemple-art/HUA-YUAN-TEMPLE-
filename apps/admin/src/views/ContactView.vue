<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { resolveMapEmbedSrc } from '@huayuan/shared'
import { api } from '../lib/api'
import { toast } from '../lib/toast'

function isSchemaCacheMiss(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const maybeResponse = error as { response?: { data?: { code?: string; message?: string } } }
  return (
    maybeResponse.response?.data?.code === 'PGRST204' ||
    maybeResponse.response?.data?.message?.includes('schema cache') === true
  )
}

const form = reactive({
  venue_name: '',
  address: '',
  phone: '',
  transport: '',
  map_embed: '',
  venue_name2: '',
  address2: '',
  phone2: '',
  transport2: '',
  map_embed2: '',
})

onMounted(async () => {
  const row = await api.contact.get().catch(() => null)
  if (!row) return
  Object.assign(form, {
    venue_name: row.venue_name ?? '',
    address: row.address ?? '',
    phone: row.phone ?? '',
    transport: row.transport ?? '',
    map_embed: row.map_embed ?? '',
    venue_name2: row.venue_name2 ?? '',
    address2: row.address2 ?? '',
    phone2: row.phone2 ?? '',
    transport2: row.transport2 ?? '',
    map_embed2: row.map_embed2 ?? '',
  })
})

function normalizeMapInput(input: string): string | null {
  // 地圖欄位只收網址(task 5.12):貼上完整 iframe 會自動取出 src,
  // 非 Google Maps 白名單網址一律拒存(content-sanitization spec)
  const map = input.trim()
  if (!map) return ''
  return resolveMapEmbedSrc(map)
}

async function save() {
  const map = normalizeMapInput(form.map_embed)
  const map2 = normalizeMapInput(form.map_embed2)
  if (map === null || map2 === null) {
    toast('地圖網址無效：僅接受 Google Maps 嵌入網址', true)
    return
  }

  try {
    await api.contact.upsert({
      venue_name: form.venue_name,
      address: form.address,
      phone: form.phone,
      transport: form.transport,
      map_embed: map,
      venue_name2: form.venue_name2,
      address2: form.address2,
      phone2: form.phone2,
      transport2: form.transport2,
      map_embed2: map2,
    })
  } catch (error) {
    if (isSchemaCacheMiss(error)) {
      toast('儲存失敗：資料庫聯絡資訊欄位尚未更新，請先套用最新 migration。', true)
      return
    }
    toast('儲存失敗', true)
    return
  }
  form.map_embed = map
  form.map_embed2 = map2
  toast('聯絡資訊已儲存')
}
</script>

<template>
  <div style="max-width: 720px">
    <div class="card card-pad mb-2">
      <div class="sec-title mb-3">聯絡資訊一</div>
      <div class="fg g2">
        <div>
          <label class="lbl">道場名稱</label>
          <input v-model="form.venue_name" class="inp" />
        </div>
        <div>
          <label class="lbl">道場地址</label>
          <input v-model="form.address" class="inp" />
        </div>
        <div>
          <label class="lbl">聯絡電話</label>
          <input v-model="form.phone" class="inp" />
        </div>
      </div>
      <div class="fr">
        <label class="lbl">交通方式</label>
        <textarea v-model="form.transport" class="inp" rows="3"></textarea>
      </div>
      <div class="fr">
        <label class="lbl">Google 地圖嵌入網址</label>
        <textarea
          v-model="form.map_embed"
          class="inp"
          rows="3"
          placeholder="https://www.google.com/maps/embed?..."
          style="font-family: monospace; font-size: 12px"
        ></textarea>
      </div>
      <p class="text-muted mb-2" style="font-size: 13px">
        貼上 Google Maps「嵌入地圖」的網址（iframe 的 src；貼上完整 iframe 亦會自動取出網址）
      </p>
    </div>

    <div class="card card-pad mb-2">
      <div class="sec-title mb-3">聯絡資訊二</div>
      <div class="fg g2">
        <div>
          <label class="lbl">道場名稱</label>
          <input v-model="form.venue_name2" class="inp" />
        </div>
        <div>
          <label class="lbl">道場地址</label>
          <input v-model="form.address2" class="inp" />
        </div>
        <div>
          <label class="lbl">聯絡電話</label>
          <input v-model="form.phone2" class="inp" />
        </div>
      </div>
      <div class="fr">
        <label class="lbl">交通方式</label>
        <textarea v-model="form.transport2" class="inp" rows="3"></textarea>
      </div>
      <div class="fr">
        <label class="lbl">Google 地圖嵌入網址</label>
        <textarea
          v-model="form.map_embed2"
          class="inp"
          rows="3"
          placeholder="https://www.google.com/maps/embed?..."
          style="font-family: monospace; font-size: 12px"
        ></textarea>
      </div>
    </div>

    <button class="btn btn-gold" @click="save">儲存變更</button>
  </div>
</template>
