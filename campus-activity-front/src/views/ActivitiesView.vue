<template>
  <div>
    <h2>活动列表</h2>

    <div style="margin:10px 0;">
      <input v-model="keyword" placeholder="搜索标题关键字" />
      <select v-model="status">
        <option value="">全部状态</option>
        <option value="0">草稿</option>
        <option value="1">报名中</option>
        <option value="2">已结束</option>
        <option value="3">已取消</option>
      </select>
      <button @click="load">查询</button>
      <button @click="$router.push('/my')" style="margin-left:10px;">我的报名</button>
    </div>

    <div v-for="a in list" :key="a.activityId" style="border:1px solid #ddd;padding:12px;margin:10px 0;">
      <div><b>{{ a.title }}</b>（{{ a.category || '未分类' }}）</div>
      <div>地点：{{ a.location || '-' }}</div>
      <div>开始：{{ a.startTime }}</div>
      <div>报名截止：{{ a.signupEnd }}</div>
      <div>人数：{{ a.signedCount }}/{{ a.capacity }}</div>
      <button @click="$router.push(`/activities/${a.activityId}`)">查看详情</button>
    </div>

    <div style="margin-top: 12px;">
      <button :disabled="page===0" @click="page--; load()">上一页</button>
      <span style="margin:0 10px;">第 {{ page + 1 }} 页</span>
      <button :disabled="(page+1)>=totalPages" @click="page++; load()">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listActivities } from '@/api/activity'

const list = ref([])
const page = ref(0)
const size = ref(10)
const totalPages = ref(1)

const keyword = ref('')
const status = ref('')

const load = async () => {
  const res = await listActivities({
    page: page.value,
    size: size.value,
    keyword: keyword.value || undefined,
    status: status.value === '' ? undefined : Number(status.value)
  })
  list.value = res.data.content
  totalPages.value = res.data.totalPages
}

onMounted(load)
</script>
