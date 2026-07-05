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

export interface About {
  id: number
  headline: string | null
  content: string | null
  value1: string | null
  value2: string | null
  value3: string | null
}

export interface Contact {
  id: number
  venue_name: string | null
  address: string | null
  phone: string | null
  email: string | null
  hours: string | null
  transport: string | null
  /** 只儲存 Google Maps 嵌入網址(不存原始 HTML,見 content-sanitization spec) */
  map_embed: string | null
  venue_name2: string | null
  address2: string | null
  phone2: string | null
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
  note: string | null
  created_at: string
}

/** 匿名報名時寫入的欄位 */
export type NewRegistration = Omit<Registration, 'id' | 'created_at'>
