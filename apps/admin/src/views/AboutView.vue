<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { api } from '../lib/api'
import { uploadSiteImage } from '../lib/imageUpload'
import { toast } from '../lib/toast'

const form = reactive({
  headline: '',
  content: '',
  image_url: '',
  value1: '',
  value1_desc: '',
  value2: '',
  value2_desc: '',
  value3: '',
  value3_desc: '',
})
const uploadingImage = ref(false)

onMounted(async () => {
  const row = await api.about.get().catch(() => null)
  if (!row) return
  Object.assign(form, {
    headline: row.headline ?? '',
    content: row.content ?? '',
    image_url: row.image_url ?? '',
    value1: row.value1 ?? '',
    value1_desc: row.value1_desc ?? '',
    value2: row.value2 ?? '',
    value2_desc: row.value2_desc ?? '',
    value3: row.value3 ?? '',
    value3_desc: row.value3_desc ?? '',
  })
})

async function uploadImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  uploadingImage.value = true
  try {
    form.image_url = await uploadSiteImage(file, 'about-image', 'photo')
    toast('意境照片已上傳，請儲存變更')
  } catch (error) {
    toast('上傳失敗：' + (error as Error).message, true)
  } finally {
    uploadingImage.value = false
  }
}

async function save() {
  try {
    await api.about.upsert({ ...form, image_url: form.image_url || null })
  } catch {
    toast('儲存失敗', true)
    return
  }
  toast('關於我們已儲存')
}
</script>

<template>
  <div style="max-width: 720px">
    <div class="card card-pad mb-2">
      <div class="sec-title mb-3">道場簡介</div>
      <div class="fr">
        <label class="lbl">意境照片</label>
        <div class="image-field">
          <div v-if="form.image_url" class="image-thumb image-thumb-photo">
            <img :src="form.image_url" alt="" />
          </div>
          <div v-else class="image-placeholder">道場意境照片</div>
          <div class="image-actions">
            <input type="file" class="inp" accept="image/*" @change="uploadImage" />
            <button class="btn btn-outline btn-sm" type="button" @click="form.image_url = ''">
              清除照片
            </button>
            <div class="text-muted" style="font-size: 12px">
              {{ uploadingImage ? '上傳中…' : '自動壓縮為長邊 1600px' }}
            </div>
          </div>
        </div>
      </div>
      <div class="fr">
        <label class="lbl">主標題</label>
        <input v-model="form.headline" class="inp" />
      </div>
      <div class="fr">
        <label class="lbl">緣起內文</label>
        <textarea v-model="form.content" class="inp" rows="4"></textarea>
      </div>
    </div>
    <div class="card card-pad mb-2">
      <div class="sec-title mb-3">核心理念</div>
      <div class="fg g3">
        <div>
          <label class="lbl">慈</label>
          <input v-model="form.value1" class="inp" />
          <textarea v-model="form.value1_desc" class="inp mt-1" rows="4"></textarea>
        </div>
        <div>
          <label class="lbl">智</label>
          <input v-model="form.value2" class="inp" />
          <textarea v-model="form.value2_desc" class="inp mt-1" rows="4"></textarea>
        </div>
        <div>
          <label class="lbl">淨</label>
          <input v-model="form.value3" class="inp" />
          <textarea v-model="form.value3_desc" class="inp mt-1" rows="4"></textarea>
        </div>
      </div>
    </div>
    <button class="btn btn-gold" @click="save">儲存變更</button>
  </div>
</template>
