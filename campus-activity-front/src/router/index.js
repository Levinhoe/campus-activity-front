import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import ActivitiesView from '@/views/ActivitiesView.vue'
import ActivityDetail from '@/views/ActivityDetail.vue'
import MyRegistrations from '@/views/MyRegistrations.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import AdminRegistrations from '@/views/AdminRegistrations.vue'
import AdminReview from '@/views/AdminReview.vue'
import MeProfile from '@/views/MeProfile.vue'
import Notifications from '@/views/Notifications.vue'
import Survey from '@/views/Survey.vue'
import AdminActivities from '@/views/AdminActivities.vue'
import AdminActivityForm from '@/views/AdminActivityForm.vue'
import AdminAttendance from '@/views/AdminAttendance.vue'
import AdminReport from '@/views/AdminReport.vue'

const routes = [
  // 默认进入登录页
  { path: '/', redirect: '/login' },

  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },

  {
    path: '/activities',
    name: 'Activities',
    component: ActivitiesView,
    meta: { requiresAuth: true },
  },
  {
    path: '/activities/:id',
    name: 'ActivityDetail',
    component: ActivityDetail,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/my',
    name: 'My',
    component: MyRegistrations,
    meta: { requiresAuth: true },
  },
  {
    path: '/me/registrations',
    name: 'MyRegistrations',
    component: MyRegistrations,
    meta: { requiresAuth: true },
  },
  {
    path: '/me',
    name: 'MeProfile',
    component: MeProfile,
    meta: { requiresAuth: true },
  },
  {
    path: '/me/notifications',
    name: 'Notifications',
    component: Notifications,
    meta: { requiresAuth: true },
  },
  {
    path: '/activities/:id/survey',
    name: 'Survey',
    component: Survey,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminDashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/activities',
    name: 'AdminActivities',
    component: AdminActivities,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/review',
    name: 'AdminReview',
    component: AdminReview,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/activities/create',
    name: 'AdminActivityCreate',
    component: AdminActivityForm,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/activities/:id/registrations',
    name: 'AdminActivityRegistrations',
    component: AdminRegistrations,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/activities/:id/attendance',
    name: 'AdminAttendance',
    component: AdminAttendance,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/activities/:id/report',
    name: 'AdminReport',
    component: AdminReport,
    props: true,
    meta: { requiresAuth: true },
  },

  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role') || ''

  // 需要登录但没有 token 时，统一跳到登录页
  if (to.meta.requiresAuth && !token) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  // 进入管理员路由时，如果前端已知不是管理员，可提前拦；否则留给接口做校验
  if (to.path.startsWith('/admin') && role && role !== 'ADMIN') {
    return next('/activities')
  }

  next()
})

export default router
