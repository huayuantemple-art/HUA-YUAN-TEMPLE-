import { ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  Announcement,
  Course,
  DharmaSection,
  DocumentRow,
  Registration,
  Sutra,
  Video,
} from '@huayuan/shared'
import { api } from '../lib/api'

/** 同舊站全域 state + loadAll():登入後一次載入內容表 */
export const useDataStore = defineStore('data', () => {
  const announcements = ref<Announcement[]>([])
  const courses = ref<Course[]>([])
  const videos = ref<Video[]>([])
  const documents = ref<DocumentRow[]>([])
  const sutras = ref<Sutra[]>([])
  const dharmaSections = ref<DharmaSection[]>([])
  const registrations = ref<Registration[]>([])
  const loaded = ref(false)

  async function keepSuccessful<T>(label: string, promise: Promise<T[]>): Promise<T[] | null> {
    try {
      return await promise
    } catch (error) {
      console.error(`loadAll ${label} failed`, error)
      return null
    }
  }

  async function loadAll(): Promise<void> {
    const [a, c, v, d, s, dh, r] = await Promise.all([
      keepSuccessful('announcements', api.announcements.listAll()),
      keepSuccessful('courses', api.courses.listAll()),
      keepSuccessful('videos', api.videos.listAll()),
      keepSuccessful('documents', api.documents.listAll()),
      keepSuccessful('sutras', api.sutras.listAll()),
      keepSuccessful('dharmaSections', api.dharmaSections.listAll()),
      keepSuccessful('registrations', api.registrations.listAll()),
    ])

    if (a) announcements.value = a
    if (c) courses.value = c
    if (v) videos.value = v
    if (d) documents.value = d
    if (s) sutras.value = s
    if (dh) dharmaSections.value = dh
    if (r) registrations.value = r
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
  async function reloadSutras(): Promise<void> {
    sutras.value = await api.sutras.listAll()
  }
  async function reloadDharmaSections(): Promise<void> {
    dharmaSections.value = await api.dharmaSections.listAll()
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
    sutras,
    dharmaSections,
    registrations,
    loaded,
    loadAll,
    reloadAnnouncements,
    reloadCourses,
    reloadVideos,
    reloadDocuments,
    reloadSutras,
    reloadDharmaSections,
    fetchRegistrations,
  }
})
