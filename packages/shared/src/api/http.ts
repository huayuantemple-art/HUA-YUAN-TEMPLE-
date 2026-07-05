import axios, { AxiosError, type AxiosInstance } from 'axios'

/** PostgREST 錯誤回應統一格式 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string | null
  readonly details: string | null
  readonly hint: string | null

  constructor(
    message: string,
    opts: { status: number; code?: string | null; details?: string | null; hint?: string | null },
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = opts.status
    this.code = opts.code ?? null
    this.details = opts.details ?? null
    this.hint = opts.hint ?? null
  }
}

export type LoadingListener = (activeCount: number) => void

/** 集中 loading 狀態:進行中的請求數,前後台以 subscribe 接 UI */
export interface LoadingTracker {
  readonly active: number
  subscribe(listener: LoadingListener): () => void
}

class Loading implements LoadingTracker {
  #count = 0
  #listeners = new Set<LoadingListener>()

  get active(): number {
    return this.#count
  }

  start(): void {
    this.#count += 1
    this.#emit()
  }

  end(): void {
    this.#count = Math.max(0, this.#count - 1)
    this.#emit()
  }

  subscribe(listener: LoadingListener): () => void {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }

  #emit(): void {
    for (const l of this.#listeners) l(this.#count)
  }
}

export interface HttpClientOptions {
  /** Supabase 專案 URL,如 https://xxx.supabase.co */
  url: string
  /** 公開 anon/publishable key */
  anonKey: string
  /** 登入後取得使用者 JWT(admin 用);未提供或回傳 null 時以 anon 身分呼叫 */
  getAccessToken?: () => string | null | Promise<string | null>
}

export interface HttpClient {
  http: AxiosInstance
  loading: LoadingTracker
}

function toApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0
    const body = error.response?.data as
      { message?: string; code?: string; details?: string; hint?: string } | undefined
    return new ApiError(body?.message ?? error.message, {
      status,
      code: body?.code ?? null,
      details: body?.details ?? null,
      hint: body?.hint ?? null,
    })
  }
  return new ApiError(error instanceof Error ? error.message : String(error), { status: 0 })
}

/** 以 axios 封裝 Supabase REST(PostgREST),集中錯誤處理與 loading 狀態 */
export function createHttpClient(options: HttpClientOptions): HttpClient {
  if (!options.url || !options.anonKey) {
    throw new Error('Supabase 設定缺漏:需要 url 與 anonKey(請確認環境變數)')
  }
  const loading = new Loading()
  const http = axios.create({
    baseURL: `${options.url.replace(/\/$/, '')}/rest/v1`,
    headers: { apikey: options.anonKey, 'Content-Type': 'application/json' },
  })

  http.interceptors.request.use(async (config) => {
    loading.start()
    const token = (await options.getAccessToken?.()) ?? options.anonKey
    config.headers.Authorization = `Bearer ${token}`
    return config
  })

  http.interceptors.response.use(
    (response) => {
      loading.end()
      return response
    },
    (error: unknown) => {
      loading.end()
      throw toApiError(error)
    },
  )

  return { http, loading }
}
