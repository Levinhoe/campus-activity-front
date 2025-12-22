<template>
  <div v-if="d">
    <h2>{{ d.title }}</h2>
    <div>分类：{{ d.category || '-' }}</div>
    <div>地点：{{ d.location || '-' }}</div>
    <div>时间：{{ d.startTime }} ~ {{ d.endTime }}</div>
    <div>报名：{{ d.signupStart }} ~ {{ d.signupEnd }}</div>
    <div>人数：{{ d.signedCount }}/{{ d.capacity }}</div>
    <div style="margin:10px 0;">{{ d.description }}</div>

    <button v-if="!d.signedByMe" @click="doRegister">报名</button>
    <button v-else @click="doCancel">取消报名</button>

    <button style="margin-left:10px" @click="$router.push('/activities')">返回列表</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getActivityDetail, registerActivity, cancelActivity } from '@/api/activity'

const route = useRoute()
const d = ref(null)

const load = async () => {
  const res = await getActivityDetail(route.params.id)
  d.value = res.data
}

const doRegister = async () => {
  await registerActivity(route.params.id)
  alert('报名成功')
  await load()
}

const doCancel = async () => {
  await cancelActivity(route.params.id)
  alert('已取消报名')
  await load()
}

onMounted(load)
</script>
