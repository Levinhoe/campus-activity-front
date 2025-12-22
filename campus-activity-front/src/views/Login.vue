<template>
  <div style="padding:24px;max-width:400px;">
    <h2>登录</h2>

    <div>
      <label>账号：</label>
      <input v-model="account" />
    </div>
    <div style="margin-top:10px;">
      <label>密码：</label>
      <input type="password" v-model="password" />
    </div>

    <div style="margin-top:16px;">
      <button @click="doLogin">登录</button>
      <button style="margin-left:10px;" @click="$router.push('/register')">去注册</button>
    </div>

    <pre style="color:red">{{ err }}</pre>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const account = ref('')
const password = ref('')
const err = ref('')
const auth = useAuthStore()
const router = useRouter()

async function doLogin() {
  err.value = ''
  try {
    await auth.login(account.value, password.value)
    router.push('/')
  } catch (e) {
    err.value = e.message || '登录失败'
  }
}
</script>
