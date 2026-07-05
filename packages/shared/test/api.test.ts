import { describe, expect, it } from 'vitest'
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AxiosError, AxiosHeaders } from 'axios'
import { ApiError, createHttpClient } from '../src/api/http'
import { createApi } from '../src/api/repositories'

const BASE = { url: 'https://example.supabase.co', anonKey: 'test-anon-key' }

function fakeAdapter(
  handler: (config: InternalAxiosRequestConfig) => Partial<AxiosResponse> | Error,
): AxiosAdapter {
  return async (config) => {
    const result = handler(config)
    if (result instanceof Error) throw result
    const response: AxiosResponse = {
      data: result.data,
      status: result.status ?? 200,
      statusText: 'OK',
      headers: {},
      config,
      ...result,
    }
    if (response.status >= 400) {
      throw new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, response)
    }
    return response
  }
}

describe('createHttpClient:錯誤處理', () => {
  it('缺少設定時直接丟錯', () => {
    expect(() => createHttpClient({ url: '', anonKey: '' })).toThrow(/環境變數/)
  })

  it('PostgREST 錯誤(如 RLS 42501)轉為 ApiError,保留 status/code/message', async () => {
    const { http } = createHttpClient(BASE)
    http.defaults.adapter = fakeAdapter(() => ({
      status: 401,
      data: {
        code: '42501',
        message: 'new row violates row-level security policy for table "announcements"',
      },
    }))

    const error = await http.post('/announcements', { title: 'x' }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    const apiError = error as ApiError
    expect(apiError.status).toBe(401)
    expect(apiError.code).toBe('42501')
    expect(apiError.message).toContain('row-level security')
  })

  it('網路層錯誤(無 response)轉為 ApiError,status=0', async () => {
    const { http } = createHttpClient(BASE)
    http.defaults.adapter = fakeAdapter((config) => {
      return new AxiosError('Network Error', 'ERR_NETWORK', config)
    })

    const error = await http.get('/announcements').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(0)
  })
})

describe('createHttpClient:loading 狀態', () => {
  it('請求期間計數遞增,完成(成功或失敗)後歸零', async () => {
    const { http, loading } = createHttpClient(BASE)
    const seen: number[] = []
    loading.subscribe((n) => seen.push(n))

    http.defaults.adapter = fakeAdapter(() => ({ status: 200, data: [] }))
    await http.get('/announcements')

    http.defaults.adapter = fakeAdapter(() => ({ status: 500, data: { message: 'boom' } }))
    await http.get('/announcements').catch(() => undefined)

    expect(seen).toEqual([1, 0, 1, 0])
    expect(loading.active).toBe(0)
  })
})

describe('createHttpClient:認證標頭', () => {
  it('未登入時以 anon key 作為 Bearer;有 access token 時改用之', async () => {
    const auths: string[] = []
    const capture = fakeAdapter((config) => {
      auths.push(String(AxiosHeaders.from(config.headers).Authorization))
      return { status: 200, data: [] }
    })

    const anon = createHttpClient(BASE)
    anon.http.defaults.adapter = capture
    await anon.http.get('/x')

    const authed = createHttpClient({ ...BASE, getAccessToken: () => 'user-jwt' })
    authed.http.defaults.adapter = capture
    await authed.http.get('/x')

    expect(auths).toEqual(['Bearer test-anon-key', 'Bearer user-jwt'])
  })
})

describe('createApi:repository 行為', () => {
  it('registrations.create 使用 return=minimal(anon 無 SELECT 權限)', async () => {
    const api = createApi(BASE)
    let prefer = ''
    api.http.defaults.adapter = fakeAdapter((config) => {
      prefer = String(AxiosHeaders.from(config.headers).Prefer)
      return { status: 201, data: '' }
    })

    await api.registrations.create({
      course_id: 1,
      course_name: '禪修入門',
      name: '王小明',
      phone: '0912345678',
      email: null,
      note: null,
    })
    expect(prefer).toBe('return=minimal')
  })

  it('listPublished 只查已發布並依 created_at 由新到舊', async () => {
    const api = createApi(BASE)
    let params: Record<string, unknown> = {}
    api.http.defaults.adapter = fakeAdapter((config) => {
      params = { ...(config.params as Record<string, unknown>) }
      return { status: 200, data: [] }
    })

    await api.announcements.listPublished()
    expect(params).toEqual({ select: '*', status: 'eq.已發布', order: 'created_at.desc' })
  })

  it('about.upsert 帶 merge-duplicates 與固定 id=1', async () => {
    const api = createApi(BASE)
    let prefer = ''
    let body: Record<string, unknown> = {}
    api.http.defaults.adapter = fakeAdapter((config) => {
      prefer = String(AxiosHeaders.from(config.headers).Prefer)
      body = JSON.parse(String(config.data)) as Record<string, unknown>
      return { status: 200, data: [{ id: 1 }] }
    })

    await api.about.upsert({ headline: '新標題' })
    expect(prefer).toContain('resolution=merge-duplicates')
    expect(body).toEqual({ id: 1, headline: '新標題' })
  })
})
