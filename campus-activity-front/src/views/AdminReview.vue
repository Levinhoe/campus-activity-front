<template>
  <div class="page">
    <div class="card">
      <div style="display:flex; justify-content: space-between; align-items: center; gap: 12px;">
        <div>
          <h2 class="section-title" style="margin:0;">活动报名审核</h2>
          <p class="meta">仅查看活动并进入对应的报名审核页</p>
        </div>
        <div style="display:flex; gap:10px; flex-wrap: wrap; align-items:center;">
          <select class="input" style="width:150px;" v-model="status" @change="reload">
            <option value="">全部状态</option>
            <option value="NOT_STARTED">未开始</option>
            <option value="ENROLLING">报名中</option>
            <option value="ENDED">已结束</option>
          </select>
          <input class="input" style="width:200px;" v-model="keyword" placeholder="按名称/类型过滤" />
          <button class="btn" @click="reload" :disabled="loading">查询</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div v-if="loading" class="meta">加载中...</div>
      <div v-else-if="list.length === 0" class="empty">暂无活动</div>
      <div v-else style="display:flex; flex-direction: column; gap: 10px;">
        <div v-for="item in list" :key="item.id" class="card" style="padding:12px;">
          <div style="display:flex; justify-content: space-between; gap:10px; flex-wrap: wrap;">
            <div>
              <div style="font-weight:700;">{{ item.name || item.title }}</div>
              <div class="meta">
                类型：{{ item.type }} ｜ 状态：{{ item.status }}
              </div>
              <div class="meta">时间：{{ item.startTime }} ~ {{ item.endTime }}</div>
            </div>
            <button class="btn btn-primary" @click="goReview(item.id)">进入报名审核</button>
          </div>
        </div>
      </div>

      <div style="margin-top: 12px; display:flex; gap: 10px; align-items: center; justify-content: flex-end;">
        <button class="btn" :disabled="page<=1 || loading" @click="prevPage">上一页</button>
        <div class="meta">第 {{ page }} / {{ totalPages }} 页（共 {{ total }} 条）</div>
        <button class="btn" :disabled="page>=totalPages || loading" @click="nextPage">下一页</button>
        <select class="input" style="width:120px;" v-model.number="size" @change="onChangeSize">
          <option :value="5">5 条/页</option>
          <option :value="10">10 条/页</option>
          <option :value="20">20 条/页</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminListActivities } from '@/api/activity'

const router = useRouter()
const list = ref([])
const loading = ref(false)
const status = ref('')
const keyword = ref('')
const page = ref(1)
const size = ref(10)
const total = ref(0)
const totalPages = ref(0)

const reload = async () => {
  loading.value = true
  try {
    const res = await adminListActivities({
      status: status.value || undefined,
      type: keyword.value || undefined,
      page: page.value,
      size: size.value,
    })
    const data = res || {}
    list.value = data.records || []
    total.value = data.total || 0
    totalPages.value = Math.max(1, Math.ceil((data.total || 0) / size.value))
  } catch (e) {
    alert(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const goReview = (id) => {
  router.push(`/admin/activities/${id}/registrations`)
}

const prevPage = async () => {
  if (page.value > 1) {
    page.value--
    await reload()
  }
}
const nextPage = async () => {
  if (page.value < totalPages.value) {
    page.value++
    await reload()
  }
}
const onChangeSize = async () => {
  page.value = 1
  await reload()
}

onMounted(reload)
</script>
