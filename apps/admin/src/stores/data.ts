import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Announcement, Course, DocumentRow, Registration, Video } from '@huayuan/shared'
import { api } from '../lib/api'

/** 同舊站全域 state + loadAll():登入後一次載入五張表 */
export const useDataStore = defineStore('data', () => {
  const announcements = ref<Announcement[]>([])
  const courses = ref<Course[]>([])
  const videos = ref<Video[]>([])
  const documents = ref<DocumentRow[]>([])
  const registrations = ref<Registration[]>([])
  const loaded = ref(false)

  async function loadAll(): Promise<void> {
    try {
      const [a, c, v, d, r] = await Promise.all([
        api.announcements.listAll(),
        api.courses.listAll(),
        api.videos.listAll(),
        api.documents.listAll(),
        api.registrations.listAll(),
      ])
      announcements.value = a
      courses.value = c
      videos.value = v
      documents.value = d
      registrations.value = r
    } catch (error) {
      // 同舊站:載入失敗時各表維持空陣列,列表顯示空狀態
      console.error('loadAll failed', error)
    }
    loaded.value = true
  }

  async function reloadAnnouncements(): Promise<void> {
    announcements.value = await api.announcements.listAll()
  }
  async function reloadCourses(): Promise<void> {
    courses.value = await api.courses.listAll()
  }
  async function reloadVideos(): Promise<void> {
    videos.value = await api.videos.listAll()
  }
  async function reloadDocuments(): Promise<void> {
    documents.value = await api.documents.listAll()
  }

  /** 同舊站 renderReg():每次進頁/切換課程篩選時重新查詢 */
  async function fetchRegistrations(courseId: string): Promise<void> {
    registrations.value = await api.registrations.listAll(
      courseId ? { course_id: `eq.${courseId}` } : {},
    )
  }

  return {
    announcements,
    courses,
    videos,
    documents,
    registrations,
    loaded,
    loadAll,
    reloadAnnouncements,
    reloadCourses,
    reloadVideos,
    reloadDocuments,
    fetchRegistrations,
  }
})
