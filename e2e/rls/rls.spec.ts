import { test, expect, type APIRequestContext } from '@playwright/test'

// 8.2 RLS 驗證(對正式 Supabase 以 anon key 直呼 REST,對齊 scripts/security-verify.sh)
const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://cnsgjxqdyuondthmoqwf.supabase.co'
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? 'sb_publishable_MIlOAMxDIBzqRvDAxeOMCA_-YU-xQtW'

const HEADERS = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

function rest(path: string) {
  return `${SUPABASE_URL}/rest/v1/${path}`
}

// 寫入被拒的兩種合法表現:HTTP 4xx,或 RLS 濾成空集合(2xx + [])
async function expectDenied(promise: Promise<{ status(): number; text(): Promise<string> }>) {
  const resp = await promise
  if (resp.status() < 400) {
    expect(await resp.text()).toBe('[]')
  } else {
    expect(resp.status()).toBeGreaterThanOrEqual(400)
  }
}

const INSERT_PAYLOAD: Record<string, object> = {
  announcements: { title: 'pwn' },
  courses: { name: 'pwn' },
  videos: { title: 'pwn' },
  documents: { name: 'pwn', filename: 'pwn.pdf' },
  sutras: { seq: 9999, title: 'pwn', content: 'pwn' },
}

for (const t of ['announcements', 'courses', 'videos', 'documents', 'sutras']) {
  test(`匿名 INSERT ${t} 被拒`, async ({ request }) => {
    const resp = await request.post(rest(t), { headers: HEADERS, data: INSERT_PAYLOAD[t] })
    expect([401, 403]).toContain(resp.status())
  })
  test(`匿名 UPDATE ${t} 無任何列被改`, async ({ request }) => {
    await expectDenied(
      request.patch(rest(`${t}?id=gt.0`), { headers: HEADERS, data: { status: 'pwned' } }),
    )
  })
  test(`匿名 DELETE ${t} 無任何列被刪`, async ({ request }) => {
    await expectDenied(request.delete(rest(`${t}?id=gt.0`), { headers: HEADERS }))
  })
}

for (const t of ['about', 'contact']) {
  test(`匿名 UPDATE ${t} 無任何列被改`, async ({ request }) => {
    await expectDenied(
      request.patch(rest(`${t}?id=eq.1`), { headers: HEADERS, data: { address: 'pwn' } }),
    )
  })
  test(`匿名 DELETE ${t} 無任何列被刪`, async ({ request }) => {
    await expectDenied(request.delete(rest(`${t}?id=eq.1`), { headers: HEADERS }))
  })
}

test('匿名 UPDATE registrations 無任何列被改', async ({ request }) => {
  await expectDenied(
    request.patch(rest('registrations?id=gt.0'), { headers: HEADERS, data: { name: 'pwn' } }),
  )
})

test('匿名 DELETE registrations 無任何列被刪', async ({ request }) => {
  await expectDenied(request.delete(rest('registrations?id=gt.0'), { headers: HEADERS }))
})

test('匿名 SELECT registrations(個資)回空集合', async ({ request }) => {
  const resp = await request.get(rest('registrations?select=*'), { headers: HEADERS })
  expect(resp.status()).toBe(200)
  expect(await resp.text()).toBe('[]')
})

async function expectSelectOk(request: APIRequestContext, path: string) {
  const resp = await request.get(rest(path), { headers: HEADERS })
  expect(resp.status()).toBe(200)
}

for (const t of ['announcements', 'courses', 'about', 'contact', 'sutras']) {
  test(`匿名 SELECT ${t}(公開內容)正常`, async ({ request }) => {
    await expectSelectOk(request, `${t}?select=id&limit=1`)
  })
}

test('匿名 SELECT sutras 草稿回空集合', async ({ request }) => {
  const resp = await request.get(rest('sutras?select=id&status=eq.草稿'), { headers: HEADERS })
  expect(resp.status()).toBe(200)
  expect(await resp.text()).toBe('[]')
})

test('匿名 Storage 上傳 pdfs 被拒(task 7.1 RLS)', async ({ request }) => {
  const resp = await request.post(`${SUPABASE_URL}/storage/v1/object/pdfs/rls-test.pdf`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    data: 'x',
  })
  expect([400, 401, 403]).toContain(resp.status())
})

test('匿名 Storage 上傳 images 被拒(admin-content-coverage RLS)', async ({ request }) => {
  const resp = await request.post(`${SUPABASE_URL}/storage/v1/object/images/rls-test.webp`, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      'Content-Type': 'image/webp',
    },
    data: 'x',
  })
  expect([400, 401, 403]).toContain(resp.status())
})

test('匿名可走 images public object 讀取端點', async ({ request }) => {
  const resp = await request.get(`${SUPABASE_URL}/storage/v1/object/public/images/rls-test.webp`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  })
  expect(resp.status()).not.toBe(401)
  expect(resp.status()).not.toBe(403)
  if (resp.status() === 400) {
    const body = await resp.json()
    expect(body.statusCode).toBe('404')
    expect(body.message).toContain('Object not found')
  }
})
