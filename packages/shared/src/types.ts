/** 所有資料表的 TypeScript 型別(對應既有 Supabase schema,不改動欄位) */

export type AdminRole = 'super_admin' | 'admin'

export interface Profile {
  id: string
  email: string
  role: AdminRole
  created_at: string
}

export type AnnouncementStatus = '草稿' | '已發布' | '隱藏'

export interface Announcement {
  id: number
  title: string
  tag: string
  content: string | null
  date: string | null
  status: AnnouncementStatus
  created_at: string
}

export type CourseStatus = '草稿' | '招生中' | '額滿'

export interface Course {
  id: number
  name: string
  schedule: string | null
  level: string | null
  description: string | null
  status: CourseStatus
  created_at: string
}

export type VideoStatus = '草稿' | '已發布'

export interface Video {
  id: number
  title: string
  youtube_url: string | null
  status: VideoStatus
  created_at: string
}

export type DocumentStatus = '草稿' | '已發布'

export interface DocumentRow {
  id: number
  name: string
  description: string | null
  filename: string
  status: DocumentStatus
  created_at: string
}

export type SutraStatus = '草稿' | '已發布'

export interface Sutra {
  id: number
  seq: number
  title: string
  translator: string | null
  content: string
  status: SutraStatus
  /** 對應之佛法文檔(documents.id);null=無對應(如心經),不列入線上閱讀清單 */
  document_id: number | null
  created_at: string
}

export interface About {
  id: number
  headline: string | null
  content: string | null
  image_url: string | null
  value1: string | null
  value1_desc: string | null
  value2: string | null
  value2_desc: string | null
  value3: string | null
  value3_desc: string | null
}

export interface Contact {
  id: number
  venue_name: string | null
  address: string | null
  phone: string | null
  icon_url: string | null
  transport: string | null
  /** 只儲存 Google Maps 嵌入網址(不存原始 HTML,見 content-sanitization spec) */
  map_embed: string | null
  venue_name2: string | null
  address2: string | null
  phone2: string | null
  icon_url2: string | null
  transport2: string | null
  /** 第二組 Google Maps 嵌入網址 */
  map_embed2: string | null
}

export interface Registration {
  id: number
  course_id: number | null
  course_name: string | null
  name: string
  phone: string | null
  email: string | null
  /** 年齡(前端驗證 1~3 位數字) */
  age: string | null
  /** 性別:男/女 */
  gender: string | null
  /** 上課地點:華圓新莊講堂/華圓台東講堂 */
  venue: string | null
  /** 修學背景(單選) */
  dharma_background: string | null
  /** 如何得知本課程(複選,「、」串接) */
  referral_source: string | null
  /** 希望從課程中獲得什麼(複選,「、」串接) */
  expectation: string | null
  note: string | null
  created_at: string
}

/** 匿名報名時寫入的欄位 */
export type NewRegistration = Omit<Registration, 'id' | 'created_at'>
