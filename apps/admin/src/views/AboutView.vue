<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { api } from '../lib/api'
import { toast } from '../lib/toast'

const form = reactive({ headline: '', content: '', value1: '', value2: '', value3: '' })

onMounted(async () => {
  const row = await api.about.get().catch(() => null)
  if (!row) return
  Object.assign(form, {
    headline: row.headline ?? '',
    content: row.content ?? '',
    value1: row.value1 ?? '',
    value2: row.value2 ?? '',
    value3: row.value3 ?? '',
  })
})

async function save() {
  try {
    await api.about.upsert({ ...form })
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
<!--      @todo 上傳圖片的地方-->
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
<!--          @todo 還有各自的內文-->
          <label class="lbl">慈</label>
          <input v-model="form.value1" class="inp" />
        </div>
        <div>
          <label class="lbl">智</label>
          <input v-model="form.value2" class="inp" />
        </div>
        <div>
          <label class="lbl">淨</label>
          <input v-model="form.value3" class="inp" />
        </div>
      </div>
    </div>
    <button class="btn btn-gold" @click="save">儲存變更</button>
  </div>
</template>
