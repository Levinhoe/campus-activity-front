<template>
  <div>
    <h2>我的报名</h2>
    <div v-for="x in list" :key="x.activityId" style="border:1px solid #ddd;padding:12px;margin:10px 0;">
      <div><b>{{ x.title }}</b></div>
      <div>地点：{{ x.location }}</div>
      <div>开始：{{ x.startTime }}</div>
      <div>报名时间：{{ x.signedAt }}</div>
      <button @click="$router.push(`/activities/${x.activityId}`)">查看详情</button>
    </div>
    <button @click="$router.push('/activities')">返回活动列表</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { myRegistrations } from '@/api/activity'

const list = ref([])

const load = async () => {
  const res = await myRegistrations()
  list.value = res.data
}

onMounted(load)
</script>
