import type { AxiosInstance } from 'axios'
import { createHttpClient, type HttpClient, type HttpClientOptions } from './http'
import type {
  About,
  Announcement,
  Contact,
  Course,
  DocumentRow,
  NewRegistration,
  Registration,
  Sutra,
  Video,
} from '../types'

/** 泛用 CRUD(PostgREST 語法),各表 repository 據此組成 */
function tableRepo<Row extends { id: number }>(http: AxiosInstance, table: string) {
  return {
    /** 依條件查詢;params 直接對應 PostgREST query string */
    async list(params: Record<string, string> = {}): Promise<Row[]> {
      const { data } = await http.get<Row[]>(`/${table}`, {
        params: { select: '*', ...params },
      })
      return data
    },
    async create(row: Partial<Row>): Promise<Row> {
      const { data } = await http.post<Row[]>(`/${table}`, row, {
        headers: { Prefer: 'return=representation' },
      })
      return data[0] as Row
    },
    async update(id: number, patch: Partial<Row>): Promise<Row | null> {
      const { data } = await http.patch<Row[]>(`/${table}`, patch, {
        params: { id: `eq.${id}` },
        headers: { Prefer: 'return=representation' },
      })
      return data[0] ?? null
    },
    async remove(id: number): Promise<void> {
      await http.delete(`/${table}`, { params: { id: `eq.${id}` } })
    },
  }
}

/** 單列設定表(about / contact,固定 id=1,後台以 upsert 儲存) */
function singletonRepo<Row extends { id: number }>(http: AxiosInstance, table: string) {
  return {
    async get(): Promise<Row | null> {
      const { data } = await http.get<Row[]>(`/${table}`, {
        params: { select: '*', id: 'eq.1' },
      })
      return data[0] ?? null
    },
    /**
     * upsert 至固定 id=1:先 UPDATE,列不存在時才 INSERT。
     * 不用 PostgREST 的 POST + merge-duplicates:那需要 INSERT 權限,
     * 而 RLS 只授予 admin UPDATE(見 database-security spec 1.5)
     */
    async upsert(row: Partial<Row>): Promise<Row | null> {
      const { data } = await http.patch<Row[]>(`/${table}`, row, {
        params: { id: 'eq.1' },
        headers: { Prefer: 'return=representation' },
      })
      if (data[0]) return data[0]
      const { data: inserted } = await http.post<Row[]>(
        `/${table}`,
        { id: 1, ...row },
        { headers: { Prefer: 'return=representation' } },
      )
      return inserted[0] ?? null
    },
  }
}

export type ApiOptions = HttpClientOptions

/** 前後台共用的 api repository 層:所有 Supabase 讀寫集中於此 */
export function createApi(options: ApiOptions) {
  const { http, loading }: HttpClient = createHttpClient(options)

  const announcements = tableRepo<Announcement>(http, 'announcements')
  const courses = tableRepo<Course>(http, 'courses')
  const videos = tableRepo<Video>(http, 'videos')
  const documents = tableRepo<DocumentRow>(http, 'documents')
  const sutras = tableRepo<Sutra>(http, 'sutras')
  const registrationsBase = tableRepo<Registration>(http, 'registrations')

  return {
    http,
    loading,
    announcements: {
      ...announcements,
      /** 前台:僅已發布,新→舊(同舊站排序) */
      listPublished: () => announcements.list({ status: 'eq.已發布', order: 'created_at.desc' }),
      listAll: () => announcements.list({ order: 'created_at.desc' }),
    },
    courses: {
      ...courses,
      /** 前台:招生中/額滿,舊→新(同舊站 ascending 排序) */
      listPublic: () => courses.list({ status: 'in.(招生中,額滿)', order: 'created_at.asc' }),
      listAll: () => courses.list({ order: 'created_at.desc' }),
    },
    videos: {
      ...videos,
      listPublished: () => videos.list({ status: 'eq.已發布', order: 'created_at.desc' }),
      listAll: () => videos.list({ order: 'created_at.desc' }),
    },
    documents: {
      ...documents,
      /** 前台:已發布,舊→新(同舊站 ascending 排序) */
      listPublished: () => documents.list({ status: 'eq.已發布', order: 'created_at.asc' }),
      listAll: () => documents.list({ order: 'created_at.desc' }),
    },
    sutras: {
      ...sutras,
      /** 前台:僅已發布,依法寶略節序號排序 */
      listPublished: () => sutras.list({ status: 'eq.已發布', order: 'seq.asc' }),
      getPublished: async (id: number): Promise<Sutra | null> => {
        const rows = await sutras.list({ id: `eq.${id}`, status: 'eq.已發布', limit: '1' })
        return rows[0] ?? null
      },
      getHeartSutra: async (): Promise<Sutra | null> => {
        const rows = await sutras.list({
          title: 'eq.般若波羅蜜多心經',
          status: 'eq.已發布',
          limit: '1',
        })
        return rows[0] ?? null
      },
      listAll: () => sutras.list({ order: 'seq.asc' }),
    },
    about: singletonRepo<About>(http, 'about'),
    contact: singletonRepo<Contact>(http, 'contact'),
    registrations: {
      /** 後台:檢視/匯出(RLS 僅 admin 可讀);可帶 PostgREST 條件如 course_id=eq.N */
      listAll: (params: Record<string, string> = {}) =>
        registrationsBase.list({ order: 'created_at.desc', ...params }),
      /**
       * 匿名報名:return=minimal — anon 依 RLS 無 SELECT 權限,
       * 要求 representation 會被拒(42501)
       */
      async create(row: NewRegistration): Promise<void> {
        await http.post('/registrations', row, { headers: { Prefer: 'return=minimal' } })
      },
    },
  }
}

export type Api = ReturnType<typeof createApi>
