import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'

const routes = [
  { path: '/', component: Home, meta: { requiresAuth: true } },
  { path: '/login', component: Login },
  { path: '/register', component: Register },

  { path: '/activities', component: () => import('@/views/ActivitiesView.vue') },
  { path: '/activities/:id', component: () => import('@/views/ActivityDetail.vue') },
  { path: '/my', component: () => import('@/views/MyRegistrations.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
