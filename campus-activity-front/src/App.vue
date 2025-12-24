<template>
  <div class="page-wrapper">
    <div v-if="showNav" class="layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="brand">校园活动</div>
        </div>
        <nav class="sidebar-nav">
          <router-link v-if="!token" to="/login">登录</router-link>
          <router-link v-if="!token" to="/register">注册</router-link>
          <router-link to="/activities">活动列表</router-link>
          <router-link v-if="role !== 'ADMIN'" to="/me/registrations">我的报名</router-link>
          <router-link v-if="role !== 'ADMIN'" to="/me">个人中心</router-link>
          <router-link v-if="role !== 'ADMIN'" to="/me/notifications">通知</router-link>
          <router-link v-if="role === 'ADMIN'" to="/admin/review">报名审核</router-link>
          <router-link v-if="role === 'ADMIN'" to="/admin/activities">活动管理</router-link>
        </nav>
      </aside>

      <main class="main-area">
        <header class="topbar">
          <div />
          <div class="profile" v-if="token">
            <img :src="safeAvatar" alt="" class="avatar" @error="handleAvatarError" />
            <div class="profile-info">
              <div class="profile-name">{{ profile.nickname || profile.name || '学生' }}</div>
              <div class="profile-role">{{ roleLabel }}</div>
            </div>
            <button class="btn" @click="logout" style="margin-left:10px;">退出</button>
          </div>
        </header>
        <router-view />
      </main>
    </div>
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiMe } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const token = ref(localStorage.getItem('token'))
const role = ref(localStorage.getItem('role') || '')
const profile = ref({})
const avatarCache = ref(localStorage.getItem('avatarCache') || '')

const defaultAvatar =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none"><rect width="80" height="80" rx="40" fill="%23e8f1ff"/><circle cx="40" cy="32" r="14" fill="%234f8bff"/><path d="M16 69c1.5-12 12-21 24-21s22.5 9 24 21" stroke="%234f8bff" stroke-width="4" stroke-linecap="round"/></svg>'
const fileBase = import.meta.env.VITE_FILE_BASE || import.meta.env.VITE_API_ORIGIN || 'http://localhost:8080'

const safeAvatar = computed(() => {
  const raw = profile.value?.avatar || profile.value?.avatarUrl || avatarCache.value
  if (!raw) return defaultAvatar
  if (/^https?:/i.test(raw)) return raw
  const path = raw.startsWith('/') ? raw : `/${raw}`
  // 直接走后端静态资源域，避免 /api 代理触发鉴权
  return `${fileBase}${path}`
})

const handleAvatarError = (e) => {
  e.target.src = defaultAvatar
}

const syncAuth = () => {
  token.value = localStorage.getItem('token')
  role.value = localStorage.getItem('role') || ''
}

const loadProfile = async () => {
  if (!token.value) return
  try {
    const res = await apiMe()
    profile.value = res || {}
    const ava = res?.avatar || res?.avatarUrl
    if (ava) {
      avatarCache.value = ava
      localStorage.setItem('avatarCache', ava)
    }
    if (!role.value && (res?.role || res?.roleCode)) {
      localStorage.setItem('role', res.role || res.roleCode)
      role.value = res.role || res.roleCode
    }
  } catch (e) {
    console.warn('获取个人信息失败', e)
  }
}

onMounted(() => {
  window.addEventListener('storage', syncAuth)
  window.addEventListener('auth-changed', () => {
    syncAuth()
    loadProfile()
  })
  loadProfile()
})

onUnmounted(() => {
  window.removeEventListener('storage', syncAuth)
  window.removeEventListener('auth-changed', syncAuth)
})

const roleLabel = computed(() => (role.value === 'ADMIN' ? '管理员' : '学生'))
const showNav = computed(() => route.path !== '/login')

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('avatarCache')
  profile.value = {}
  syncAuth()
  router.push('/login')
}
</script>
