<script setup lang="ts">
import type { Course } from '@huayuan/shared'
import { ApiError } from '@huayuan/shared'

definePageMeta({ layout: false })
useHead({ title: '課程報名 · 華圓覺苑' })

const api = useApi()

// 同舊站:課程於進頁後即時載入(不走 ISR 快取,狀態最新)
const {
  data: courses,
  pending,
  error: loadError,
} = useLazyAsyncData('signup-courses', () => api.courses.listPublic(), { server: false })

type Step = 'courses' | 'form' | 'done'
const step = ref<Step>('courses')
const selectedCourse = ref<Course | null>(null)

const form = reactive({ name: '', phone: '', email: '', note: '' })
const errors = reactive({ name: false, phone: false, email: false, privacy: false })
const agreePrivacy = ref(false)
const submitting = ref(false)

// 防濫用:honeypot(隱藏欄位)+ 成功送出頻率上限。
// 上限只擋機器人式連發,額度遠高於正常多人代報名;僅成功寫入才計數,
// 失敗/驗證錯誤不消耗額度 —— 正常流程無感(course-signup spec)。
// 注意:此為前端層防護,繞過瀏覽器直呼 REST 者僅受 RLS 限制(只能 INSERT);
// server-side rate limit 遞延至後續變更(見 tasks.md 4.4 註記)。
const honeypot = ref('')
const RATE_KEY = 'hy-signup-times'
const RATE_LIMIT = 10 // 10 分鐘內最多 10 次成功送出
const RATE_WINDOW_MS = 10 * 60 * 1000

function selectCourse(c: Course) {
  if (c.status === '額滿') return
  selectedCourse.value = c
  // 同舊站:選取後短暫停留再進入表單
  setTimeout(() => {
    step.value = 'form'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 200)
}

function backToCourses() {
  step.value = 'courses'
  selectedCourse.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function recentSubmits(): number[] {
  try {
    const now = Date.now()
    return (JSON.parse(localStorage.getItem(RATE_KEY) || '[]') as number[]).filter(
      (t) => now - t < RATE_WINDOW_MS,
    )
  } catch {
    return []
  }
}

function recordSubmit() {
  try {
    localStorage.setItem(RATE_KEY, JSON.stringify([...recentSubmits(), Date.now()]))
  } catch {
    // localStorage 不可用(無痕/隱私模式)時放行,不影響正常報名
  }
}

async function submitForm() {
  if (!selectedCourse.value || submitting.value) return

  // 驗證(同舊站:姓名/電話必填,Email 若填需符合格式)+ 隱私權同意
  errors.name = !form.name.trim()
  errors.phone = !form.phone.trim()
  const email = form.email.trim()
  errors.email = !!email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  errors.privacy = !agreePrivacy.value
  if (errors.name || errors.phone || errors.email || errors.privacy) return

  // honeypot 被填寫 → 視為機器人,顯示成功但不寫入(真人不會碰到隱藏欄位)
  if (honeypot.value) {
    step.value = 'done'
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  if (recentSubmits().length >= RATE_LIMIT) {
    alert('送出過於頻繁，請稍後再試。')
    return
  }

  submitting.value = true
  try {
    await api.registrations.create({
      course_id: selectedCourse.value.id,
      course_name: selectedCourse.value.name,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email,
      note: form.note.trim(),
    })
    recordSubmit()
    step.value = 'done'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    const message = e instanceof ApiError ? e.message : String(e)
    alert('送出失敗，請稍後再試。\n' + message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="signup-page">
    <header class="site-header">
      <h1>華圓覺苑</h1>
      <p>HUAYUAN BUDDHIST CENTER</p>
    </header>

    <div class="banner">
      <div class="banner-lotus">🪷</div>
      <h2>課程報名</h2>
      <p>選擇適合您的課程，填寫資料後送出<br />我們將於三個工作天內與您聯繫確認</p>
    </div>

    <main>
      <!-- Step 1: 課程列表 -->
      <div v-if="step === 'courses'">
        <div class="section-title">目前開放報名的課程</div>
        <div class="course-grid">
          <div v-if="pending" class="loading">
            <div class="spinner"></div>
            <br />載入課程中…
          </div>
          <div v-else-if="loadError" class="loading" style="color: #c04a3a">
            課程載入失敗，請稍後再試。
          </div>
          <div v-else-if="!(courses ?? []).length" class="loading">
            目前沒有開放報名的課程，請關注最新公告。
          </div>
          <template v-else>
            <div
              v-for="c in courses"
              :key="c.id"
              class="course-card"
              :class="{ full: c.status === '額滿', selected: selectedCourse?.id === c.id }"
              @click="selectCourse(c)"
            >
              <div class="check-mark">✓</div>
              <div class="course-card-head">
                <div class="course-name">{{ c.name }}</div>
                <span
                  class="course-badge"
                  :class="c.status === '招生中' ? 'badge-open' : 'badge-full'"
                  >{{ c.status }}</span
                >
              </div>
              <div class="course-meta">
                <span v-if="c.schedule">🕐 {{ c.schedule }}</span>
                <span v-if="c.level">📚 {{ c.level }}</span>
              </div>
              <div v-if="c.description" class="course-desc">{{ c.description }}</div>
              <div
                v-if="c.status === '額滿'"
                style="font-size: 12px; color: #a8742a; margin-top: 8px"
              >
                此課程已額滿，如需候補請來電洽詢
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Step 2: 填寫資料 -->
      <div v-else-if="step === 'form'">
        <div class="form-card">
          <div class="form-title">填寫報名資料</div>
          <div class="form-sub">
            所有資料僅用於課程聯繫，不會對外公開。<br />帶 * 號為必填欄位。
          </div>

          <div v-if="selectedCourse" class="selected-course-box">
            <div class="icon">✎</div>
            <div>
              <div class="selected-course-name">{{ selectedCourse.name }}</div>
              <div class="selected-course-meta">
                {{ selectedCourse.schedule || '' }}
                {{ selectedCourse.level ? '・' + selectedCourse.level : '' }}
              </div>
            </div>
          </div>

          <div class="field">
            <label class="lbl required">您的姓名</label>
            <input
              v-model="form.name"
              class="inp"
              :class="{ error: errors.name }"
              type="text"
              placeholder="請輸入真實姓名"
              maxlength="20"
            />
            <div v-show="errors.name" class="err-msg" style="display: block">請填寫姓名</div>
          </div>

          <div class="field">
            <label class="lbl required">聯絡電話</label>
            <input
              v-model="form.phone"
              class="inp"
              :class="{ error: errors.phone }"
              type="tel"
              placeholder="09xx-xxxxxx"
            />
            <div v-show="errors.phone" class="err-msg" style="display: block">請填寫聯絡電話</div>
          </div>

          <div class="field">
            <label class="lbl">電子信箱</label>
            <input
              v-model="form.email"
              class="inp"
              :class="{ error: errors.email }"
              type="email"
              placeholder="your@email.com"
            />
            <div class="field-hint">若希望收到報名確認信，請填寫</div>
            <div v-show="errors.email" class="err-msg" style="display: block">Email 格式不正確</div>
          </div>

          <div class="field">
            <label class="lbl">備註說明</label>
            <textarea
              v-model="form.note"
              class="inp"
              rows="3"
              placeholder="例：素食者、帶孩子同行、特殊需求…"
            ></textarea>
          </div>

          <!-- honeypot:一般使用者看不到也不會填;機器人填了即被攔下 -->
          <div class="hp-field" aria-hidden="true">
            <label
              >網站<input v-model="honeypot" type="text" tabindex="-1" autocomplete="off"
            /></label>
          </div>

          <div class="field">
            <label class="privacy-label">
              <input v-model="agreePrivacy" type="checkbox" />
              <span>我已閱讀並同意：所填個人資料僅用於課程報名與聯繫用途，不會對外公開。</span>
            </label>
            <div v-show="errors.privacy" class="err-msg" style="display: block">
              請勾選同意隱私權條款後再送出
            </div>
          </div>

          <button class="submit-btn" :disabled="submitting" @click="submitForm">
            {{ submitting ? '送出中…' : '送出報名 →' }}
          </button>
        </div>

        <div style="text-align: center">
          <a href="#" style="color: var(--muted); font-size: 14px" @click.prevent="backToCourses"
            >← 重新選擇課程</a
          >
        </div>
      </div>

      <!-- Step 3: 完成 -->
      <div v-else>
        <div class="success-box">
          <div class="success-icon">🙏</div>
          <h2>報名成功，感恩您的參與</h2>
          <p>
            您已成功報名 <strong>{{ selectedCourse?.name }}</strong>
          </p>
          <p>我們將於三個工作天內以電話或 Email 與您確認報名資訊</p>
          <p style="margin-top: 16px; font-size: 13px; color: #a89b86">南無阿彌陀佛</p>
          <NuxtLink to="/" class="back-link">← 返回華圓覺苑官網</NuxtLink>
        </div>
      </div>
    </main>

    <footer>&copy; 華圓覺苑 · <NuxtLink to="/">回首頁</NuxtLink></footer>
  </div>
</template>

<style scoped>
/* ══ 舊站 signup-form.html <style> 原樣移植(body/:root 改掛在 .signup-page)══ */
.signup-page {
  --gold: #c9a24b;
  --brown: #3a211c;
  --text: #2a2622;
  --muted: #8a7d68;
  --border: #e6e1d8;
  --bg: #f2efea;
  --white: #fff;
  font-family: 'Noto Sans TC', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* HEADER */
.site-header {
  background: var(--brown);
  padding: 18px 0;
  text-align: center;
}
.site-header h1 {
  font-family: 'Noto Serif TC', serif;
  font-size: 22px;
  color: #f2e4c8;
  letter-spacing: 0.12em;
}
.site-header p {
  font-size: 12px;
  color: #9c7d52;
  margin-top: 4px;
  letter-spacing: 0.18em;
}

/* HERO BANNER */
.banner {
  background: linear-gradient(135deg, #3a211c 0%, #5c2e20 100%);
  padding: 44px 20px;
  text-align: center;
}
.banner-lotus {
  font-size: 42px;
  margin-bottom: 14px;
  opacity: 0.8;
}
.banner h2 {
  font-family: 'Noto Serif TC', serif;
  font-size: 28px;
  color: #f2e4c8;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}
.banner p {
  font-size: 15px;
  color: #b89a6e;
  line-height: 1.8;
}

/* MAIN */
main {
  flex: 1;
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
  padding: 40px 20px 60px;
}

/* COURSE CARDS */
.section-title {
  font-family: 'Noto Serif TC', serif;
  font-size: 20px;
  color: var(--brown);
  letter-spacing: 0.06em;
  margin-bottom: 18px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--gold);
}
.course-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 40px;
}
.course-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px 22px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.course-card:hover {
  border-color: var(--gold);
  box-shadow: 0 4px 16px rgba(201, 162, 75, 0.12);
}
.course-card.selected {
  border-color: var(--gold);
  border-width: 2px;
  background: #fffcf4;
}
.course-card.full {
  opacity: 0.6;
  cursor: not-allowed;
}
.course-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.course-name {
  font-family: 'Noto Serif TC', serif;
  font-size: 16px;
  color: var(--brown);
}
.course-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 4px;
}
.badge-open {
  color: #2f7d4f;
  background: #e7f3ec;
}
.badge-full {
  color: #a8742a;
  background: #f6ecd9;
}
.course-meta {
  font-size: 13px;
  color: var(--muted);
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.course-desc {
  font-size: 13.5px;
  color: #5a4a3a;
  line-height: 1.7;
}
.check-mark {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--gold);
  color: var(--brown);
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: bold;
}
.course-card.selected .check-mark {
  display: flex;
}

/* FORM */
.form-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
}
.form-title {
  font-family: 'Noto Serif TC', serif;
  font-size: 20px;
  color: var(--brown);
  margin-bottom: 6px;
}
.form-sub {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 24px;
  line-height: 1.7;
}

.field {
  margin-bottom: 20px;
}
label.lbl {
  display: block;
  font-size: 13.5px;
  color: #5a4a3a;
  margin-bottom: 8px;
  font-weight: 500;
}
.required::after {
  content: ' *';
  color: #c04a3a;
}
input.inp,
textarea.inp {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  background: var(--white);
  color: var(--text);
  transition: border 0.2s;
}
input.inp:focus,
textarea.inp:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(201, 162, 75, 0.08);
}
textarea.inp {
  resize: vertical;
  line-height: 1.7;
}
.field-hint {
  font-size: 12px;
  color: var(--muted);
  margin-top: 6px;
}

/* SELECTED COURSE DISPLAY */
.selected-course-box {
  background: #fbf8f2;
  border: 1px solid var(--gold);
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.selected-course-box .icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #f2e4c8;
  color: var(--gold);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.selected-course-name {
  font-family: 'Noto Serif TC', serif;
  font-size: 15px;
  color: var(--brown);
}
.selected-course-meta {
  font-size: 12px;
  color: var(--muted);
}

/* 隱私權同意(新增需求 4.3,樣式沿用表單既有視覺) */
.privacy-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13.5px;
  color: #5a4a3a;
  line-height: 1.7;
  cursor: pointer;
}
.privacy-label input {
  margin-top: 4px;
  accent-color: var(--gold);
  flex-shrink: 0;
}

/* honeypot:移出視野,對真人不可見不可及 */
.hp-field {
  position: absolute;
  left: -9999px;
  top: -9999px;
  height: 0;
  overflow: hidden;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: var(--gold);
  color: var(--brown);
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Noto Serif TC', serif;
  letter-spacing: 0.06em;
  transition: opacity 0.2s;
}
.submit-btn:hover {
  opacity: 0.88;
}
.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* SUCCESS */
.success-box {
  text-align: center;
  padding: 50px 20px;
}
.success-icon {
  font-size: 52px;
  margin-bottom: 20px;
}
.success-box h2 {
  font-family: 'Noto Serif TC', serif;
  font-size: 24px;
  color: var(--brown);
  margin-bottom: 10px;
}
.success-box p {
  font-size: 15px;
  color: var(--muted);
  line-height: 1.8;
  margin-bottom: 6px;
}
.back-link {
  display: inline-block;
  margin-top: 24px;
  color: var(--gold);
  font-size: 14px;
  text-decoration: none;
}
.back-link:hover {
  text-decoration: underline;
}

/* LOADING */
.loading {
  text-align: center;
  padding: 40px;
  color: var(--muted);
}
.spinner {
  display: inline-block;
  width: 28px;
  height: 28px;
  border: 3px solid #e6e1d8;
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 10px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* FOOTER */
footer {
  background: var(--brown);
  color: #9c7d52;
  text-align: center;
  padding: 20px;
  font-size: 13px;
  letter-spacing: 0.08em;
}
footer a {
  color: var(--gold);
  text-decoration: none;
}

/* Error */
.err-msg {
  font-size: 13px;
  color: #c04a3a;
  margin-top: 8px;
  display: none;
}
.inp.error {
  border-color: #c04a3a;
}

@media (max-width: 600px) {
  .banner h2 {
    font-size: 22px;
  }
  .form-card {
    padding: 22px 18px;
  }
  .course-meta {
    gap: 10px;
  }
}
</style>
