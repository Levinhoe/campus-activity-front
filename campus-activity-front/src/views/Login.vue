<template>
  <div class="page login-wrapper">
    <div class="card login-card">
      <h2 class="section-title" style="margin-bottom: 14px;">登录</h2>

      <div class="form-grid">
        <div class="form-row">
          <label>账号</label>
          <input class="input" v-model="form.account" placeholder="请输入账号" />
        </div>

        <div class="form-row">
          <label>密码</label>
          <input class="input" v-model="form.password" type="password" placeholder="请输入密码" />
        </div>

        <div style="display:flex; gap: 10px; margin-top: 6px;">
          <button class="btn btn-primary" @click="onLogin">登录</button>
          <button class="btn" @click="goRegister">去注册</button>
        </div>
      </div>

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiLogin, apiMe } from '@/api/auth'

const router = useRouter()
const errorMsg = ref('')

const form = reactive({
  account: '',
  password: '',
})

function extractToken(res) {
  // 兼容各种封装情况
  if (typeof res === 'string') return res
  if (res?.data && typeof res.data === 'string') return res.data
  return (
    res?.token ||
    res?.accessToken ||
    res?.access_token ||
    res?.jwt ||
    res?.data?.token ||
    res?.data?.accessToken ||
    res?.data?.access_token ||
    res?.data?.jwt ||
    res?.data?.data?.token ||
    res?.data?.data?.accessToken ||
    res?.data?.data?.access_token ||
    res?.data?.data?.jwt ||
    res?.data?.data?.data?.token ||
    null
  )
}

function extractRole(res) {
  return (
    res?.role ||
    res?.roleCode ||
    res?.data?.role ||
    res?.data?.roleCode ||
    res?.data?.data?.role ||
    res?.data?.data?.roleCode ||
    null
  )
}

async function onLogin() {
  errorMsg.value = ''

  try {
    // 兼容后端使用 username/account 两种字段名
    const res = await apiLogin({
      account: form.account,
      username: form.account,
      password: form.password,
    })

    const token = extractToken(res)

    if (!token) {
      console.log('登录响应(res)=', res)
      errorMsg.value = '登录失败（未获取到 token），请稍后重试'
      return
    }

    localStorage.setItem('token', token)

    // 先尝试从登录响应解析角色
    let role = extractRole(res)

    // 拉取用户信息，记录角色（若登录响应没有提供）
    try {
      if (!role) {
        const me = await apiMe()
        role =
          me?.role ||
          me?.roleCode ||
          me?.data?.role ||
          me?.data?.roleCode ||
          ''
      }
    } catch (e) {
      console.warn('获取用户信息失败，角色默认学生', e)
    }

    // 兜底：无角色时默认学生
    if (!role) {
      role = 'STUDENT'
    }
    localStorage.setItem('role', role)
    window.dispatchEvent(new Event('auth-changed'))

    const redirect = router.currentRoute.value.query.redirect
    const target =
      redirect ||
      (localStorage.getItem('role') === 'ADMIN' ? '/admin' : '/activities')

    router.replace(target)
  } catch (e) {
    console.error(e)
    errorMsg.value = e?.response?.data?.message || e?.message || '登录失败'
  }
}

function goRegister() {
  router.push('/register')
}
</script>

<style scoped>
.error { color: #d43f3a; margin-top: 12px; }
</style>
