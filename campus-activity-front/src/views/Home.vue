<template>
  <div style="padding:24px;">
    <h2>首页（需要登录）</h2>
    <div>当前用户：{{ auth.user?.name }}（{{ auth.user?.roleCode }}）</div>

    <button style="margin-top:12px;" @click="loadMe">刷新我的信息</button>
    <button style="margin-left:12px;" @click="logout">退出登录</button>

    <pre>{{ auth.user }}</pre>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

async function loadMe() {
  await auth.fetchMe()
}
function logout() {
  auth.logout()
  router.push('/login')
}

onMounted(loadMe)
</script>
