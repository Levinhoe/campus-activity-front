<template>
  <div class="page" style="max-width: 640px;">
    <div class="card">
      <h2 class="section-title" style="margin-bottom: 14px;">注册</h2>

      <div style="display:flex; gap:10px; margin-bottom: 10px;">
        <button
          class="btn"
          :class="{ 'btn-primary': role === 'STUDENT' }"
          type="button"
          @click="switchRole('STUDENT')"
        >
          学生注册
        </button>
        <button
          class="btn"
          :class="{ 'btn-primary': role === 'ADMIN' }"
          type="button"
          @click="switchRole('ADMIN')"
        >
          管理员注册
        </button>
      </div>

      <div class="form-grid">
        <div class="form-row">
          <label>账号</label>
          <input class="input" v-model="form.account" placeholder="请输入账号" />
        </div>
        <div class="form-row">
          <label>密码</label>
          <input class="input" type="password" v-model="form.password" placeholder="请输入密码" />
        </div>
        <div class="form-row">
          <label>姓名</label>
          <input class="input" v-model="form.name" placeholder="请输入姓名" />
        </div>
        <div class="form-row" v-if="role === 'STUDENT'">
          <label>学号</label>
          <input class="input" v-model="form.studentNo" placeholder="请输入学号" />
        </div>
        <div class="form-row">
          <label>电话</label>
          <input class="input" v-model="form.phone" placeholder="请输入联系电话" />
        </div>
      </div>

      <div style="display:flex; gap: 10px; margin-top: 14px;">
        <button class="btn btn-primary" @click="doRegister">注册</button>
        <button class="btn" @click="$router.push('/login')">返回登录</button>
      </div>

      <p v-if="err" class="error">{{ err }}</p>
      <p v-if="ok" class="ok">{{ ok }}</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { apiRegister } from '../api/auth'

const role = ref('STUDENT')
const form = reactive({ account:'', password:'', name:'', studentNo:'', phone:'', role: 'STUDENT' })
const err = ref('')
const ok = ref('')

async function doRegister() {
  err.value = ''
  ok.value = ''
  try {
    // 管理员不传 studentNo，避免空值触发唯一约束
    const payload = {
      account: form.account,
      password: form.password,
      name: form.name,
      phone: form.phone,
      role: role.value,
    }
    if (role.value === 'STUDENT') {
      payload.studentNo = form.studentNo
    }

    await apiRegister(payload)
    ok.value = role.value === 'ADMIN'
      ? '管理员注册成功，请返回登录'
      : '学生注册成功，请返回登录'
  } catch (e) {
    err.value = e?.message || '注册失败'
  }
}

function switchRole(r) {
  role.value = r
}
</script>

<style scoped>
.error { color: #d43f3a; margin-top: 12px; }
.ok { color: #1e9c62; margin-top: 12px; }
</style>
