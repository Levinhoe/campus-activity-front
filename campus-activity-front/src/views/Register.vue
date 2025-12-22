<template>
  <div style="padding:24px;max-width:400px;">
    <h2>注册（学生）</h2>

    <div><label>账号：</label><input v-model="form.account" /></div>
    <div style="margin-top:10px;"><label>密码：</label><input type="password" v-model="form.password" /></div>
    <div style="margin-top:10px;"><label>姓名：</label><input v-model="form.name" /></div>
    <div style="margin-top:10px;"><label>学号：</label><input v-model="form.studentNo" /></div>
    <div style="margin-top:10px;"><label>电话：</label><input v-model="form.phone" /></div>

    <div style="margin-top:16px;">
      <button @click="doRegister">注册</button>
      <button style="margin-left:10px;" @click="$router.push('/login')">返回登录</button>
    </div>

    <pre style="color:red">{{ err }}</pre>
    <pre style="color:green">{{ ok }}</pre>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { apiRegister } from '../api/auth'

const form = reactive({ account:'', password:'', name:'', studentNo:'', phone:'' })
const err = ref('')
const ok = ref('')

async function doRegister() {
  err.value = ''
  ok.value = ''
  try {
    await apiRegister(form)
    ok.value = '注册成功，请返回登录'
  } catch (e) {
    err.value = e.message || '注册失败'
  }
}
</script>
