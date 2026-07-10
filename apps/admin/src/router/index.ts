import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AdminLayout from '../components/AdminLayout.vue'
import LoginView from '../views/LoginView.vue'

/** meta.title 同舊站 PAGE_TITLES */
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    {
      path: '/',
      component: AdminLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
          meta: { title: '總覽' },
        },
        {
          path: 'announcements',
          name: 'announcements',
          component: () => import('../views/AnnouncementsView.vue'),
          meta: { title: '最新公告管理' },
        },
        {
          path: 'courses',
          name: 'courses',
          component: () => import('../views/CoursesView.vue'),
          meta: { title: '課程管理' },
        },
        {
          path: 'registrations',
          name: 'registrations',
          component: () => import('../views/RegistrationsView.vue'),
          meta: { title: '報名資料' },
        },
        {
          path: 'questions',
          name: 'questions',
          component: () => import('../views/QuestionsView.vue'),
          meta: { title: '學員提問' },
        },
        {
          path: 'videos',
          name: 'videos',
          component: () => import('../views/VideosView.vue'),
          meta: { title: '法師說法管理' },
        },
        {
          path: 'documents',
          name: 'documents',
          component: () => import('../views/DocumentsView.vue'),
          meta: { title: '佛法文檔管理' },
        },
        {
          path: 'sutras',
          name: 'sutras',
          component: () => import('../views/SutrasView.vue'),
          meta: { title: '經文管理' },
        },
        {
          path: 'site-copy',
          name: 'site-copy',
          component: () => import('../views/SiteCopyView.vue'),
          meta: { title: '網站文案' },
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/AboutView.vue'),
          meta: { title: '關於我們' },
        },
        {
          path: 'contact',
          name: 'contact',
          component: () => import('../views/ContactView.vue'),
          meta: { title: '聯絡與交通' },
        },
        {
          path: 'accounts',
          name: 'accounts',
          component: () => import('../views/AccountsView.vue'),
          meta: { title: '帳號管理', superAdminOnly: true },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

/**
 * 路由守衛(task 5.4):未登入(或無 profile)一律導向登入;
 * meta.superAdminOnly 的頁面(帳號管理,task 6.3)僅 super_admin 可進
 */
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.init()
  if (to.meta.public) return auth.isAuthed ? '/' : true
  if (!auth.isAuthed) return '/login'
  if (to.meta.superAdminOnly && !auth.isSuperAdmin) return '/'
  return true
})
