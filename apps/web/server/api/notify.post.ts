import { escapeHtml } from '@huayuan/shared'

interface WebhookBody {
  type?: string
  table?: string
  record?: Record<string, unknown>
}

function row(label: string, value: unknown): string {
  const v = value === null || value === undefined || value === '' ? '—' : String(value)
  return (
    `<tr><td style="padding:4px 14px 4px 0;color:#8a7a68;white-space:nowrap;vertical-align:top">` +
    `${escapeHtml(label)}</td><td style="padding:4px 0;color:#3a211c">${escapeHtml(v)}</td></tr>`
  )
}

// 接收 Supabase 資料庫 Webhook(新報名 / 新提問),寄一封通知 Email。
// 需在 Vercel 設定環境變數:NUXT_RESEND_API_KEY、NUXT_NOTIFY_EMAIL、NUXT_NOTIFY_SECRET。
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  // 以網址上的 token 驗證,避免端點被任意呼叫
  const token = String(getQuery(event).token ?? '')
  if (!config.notifySecret || token !== config.notifySecret) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }

  const body = await readBody<WebhookBody>(event)
  const table = body?.table ?? ''
  const rec = body?.record ?? {}

  let subject = ''
  let rowsHtml = ''
  if (table === 'registrations') {
    subject = `【新報名】${rec.name ?? ''}｜${rec.course_name ?? ''}`
    rowsHtml =
      row('課程', rec.course_name) +
      row('姓名', rec.name) +
      row('電話', rec.phone) +
      row('Email', rec.email) +
      row('年齡', rec.age) +
      row('性別', rec.gender) +
      row('上課地點', rec.venue) +
      row('學佛背景', rec.dharma_background) +
      row('得知管道', rec.referral_source) +
      row('期待', rec.expectation) +
      row('備註', rec.note) +
      row('報名時間', rec.created_at)
  } else if (table === 'contact_messages') {
    subject = `【新提問】${rec.name ?? ''}`
    rowsHtml =
      row('姓名', rec.name) +
      row('聯絡方式', rec.contact) +
      row('提問內容', rec.message) +
      row('提問時間', rec.created_at)
  } else {
    subject = `【新資料】${table}`
    rowsHtml = row('內容', JSON.stringify(rec))
  }

  // 尚未設定 Resend 時靜默略過,避免 Supabase Webhook 端顯示失敗
  if (!config.resendApiKey || !config.notifyEmail) {
    return { ok: false, reason: 'notify not configured' }
  }

  const html =
    `<div style="font-family:'Noto Sans TC',Arial,sans-serif;font-size:15px;line-height:1.8;color:#3a211c">` +
    `<h2 style="margin:0 0 14px;font-size:18px;color:#4a3728">${escapeHtml(subject)}</h2>` +
    `<table style="border-collapse:collapse">${rowsHtml}</table>` +
    `<p style="margin:18px 0 0;color:#8a7a68;font-size:13px">請登入後台查看與管理完整資料。</p></div>`

  await $fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: {
      from: 'HuaYuan Temple <onboarding@resend.dev>',
      to: config.notifyEmail,
      subject,
      html,
    },
  })

  return { ok: true }
})
