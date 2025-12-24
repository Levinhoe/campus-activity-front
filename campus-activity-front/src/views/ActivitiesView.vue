<template>
  <div class="page">
    <div class="card">
      <div style="display:flex; justify-content: space-between; align-items: center; gap: 12px;">
        <div>
          <h2 class="section-title" style="margin:0;">活动列表</h2>
          <p class="meta" style="margin:4px 0 0;">搜索/筛选活动，点击可查看详情与报名</p>
        </div>
        <button class="btn" @click="fetchList" :disabled="loading">
          {{ loading ? '加载中...' : '刷新' }}
        </button>
      </div>

      <div style="display:flex; gap: 12px; flex-wrap: wrap; margin: 14px 0 6px;">
        <input
          class="input"
          v-model="keyword"
          placeholder="搜索标题/类型"
          style="min-width: 200px;"
        />
        <input
          class="input"
          v-model="type"
          placeholder="类型"
          style="width: 140px;"
        />
        <input
          class="input"
          type="date"
          v-model="timeFrom"
          placeholder="开始日期"
          style="width: 180px;"
        />
        <input
          class="input"
          type="date"
          v-model="timeTo"
          placeholder="结束日期"
          style="width: 180px;"
        />
        <select class="input" v-model="status" style="width: 160px;">
          <option value="">全部状态</option>
          <option :value="'ENROLLING'">报名中</option>
          <option :value="'NOT_STARTED'">未开始</option>
          <option :value="'ENDED'">已结束</option>
        </select>
        <button class="btn btn-primary" @click="onSearch" :disabled="loading">
          {{ loading ? '查询中...' : '查询' }}
        </button>
        <button class="btn" @click="onReset" :disabled="loading">重置</button>
      </div>

      <div v-if="loading" class="meta" style="margin-top: 6px;">加载中...</div>
      <div v-else-if="errorMsg" class="error">{{ errorMsg }}</div>

      <div v-else style="margin-top: 10px; display: flex; flex-direction: column; gap: 12px;">
        <div v-if="items.length === 0" class="empty">暂无数据</div>

        <div
          v-for="item in items"
          :key="item.id || item.activityId"
          class="card"
          style="padding: 14px;"
        >
          <div style="display:flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 260px;">
              <div style="display:flex; align-items: center; gap: 10px;">
                <div style="font-size: 18px; font-weight: 700;">{{ item.title || item.name }}</div>
                <span class="tag">{{ statusText(item.status) }}</span>
              </div>
              <div class="meta" style="margin: 6px 0;">
                <span style="margin-right: 12px;">分类：<strong>{{ item.category || item.type || '-' }}</strong></span>
                <span style="margin-right: 12px;">地点：<strong>{{ item.location || '-' }}</strong></span>
                <span>容量：<strong>{{ (item.signedCount ?? item.enrolledCount ?? 0) }}/{{ item.capacity ?? item.limit ?? '-' }}</strong></span>
              </div>
              <div class="meta">
                <span style="margin-right: 12px;">开始：<strong>{{ item.startTime || item.beginTime }}</strong></span>
                <span>报名截止：<strong>{{ item.signupEnd || item.deadline }}</strong></span>
              </div>
            </div>

            <div style="display:flex; align-items: center; gap: 10px;">
              <button class="btn btn-primary" @click="goDetail(item)">查看详情</button>
            </div>
          </div>
        </div>

        <div style="display:flex; gap: 10px; align-items: center; justify-content: flex-end;">
          <button class="btn" :disabled="page <= 1 || loading" @click="prevPage">上一页</button>
          <div class="meta">第 {{ page }} / {{ totalPages }} 页（共 {{ totalElements }} 条）</div>
          <button class="btn" :disabled="page >= totalPages || loading" @click="nextPage">下一页</button>

          <select class="input" v-model.number="size" @change="onChangeSize" style="width: 120px;">
            <option :value="5">5 条/页</option>
            <option :value="10">10 条/页</option>
            <option :value="20">20 条/页</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchActivities } from '@/api/activity'

const router = useRouter()

const loading = ref(false)
const errorMsg = ref('')

const keyword = ref('')
const status = ref('') // '', ENROLLING, NOT_STARTED, ENDED
const type = ref('')
const timeFrom = ref('')
const timeTo = ref('')

const page = ref(1)
const size = ref(10)

const items = ref([])

const totalPages = ref(1)
const totalElements = ref(0)

const fetchList = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const params = {
      page: page.value,
      size: size.value,
      type: type.value || undefined,
      timeFrom: timeFrom.value || undefined,
      timeTo: timeTo.value || undefined,
      status: status.value || undefined,
      keyword: keyword.value || undefined,
    }

    const res = await fetchActivities(params)
    const data = res || {}

    items.value = data.records || []
    totalElements.value = data.total ?? 0
    totalPages.value = Math.max(1, Math.ceil((totalElements.value || 0) / size.value))
  } catch (e) {
    errorMsg.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const onSearch = async () => {
  page.value = 1
  await fetchList()
}

const onReset = async () => {
  keyword.value = ''
  status.value = ''
  type.value = ''
  timeFrom.value = ''
  timeTo.value = ''
  page.value = 1
  size.value = 10
  await fetchList()
}

const prevPage = async () => {
  if (page.value > 1) {
    page.value--
    await fetchList()
  }
}

const nextPage = async () => {
  if (page.value < totalPages.value) {
    page.value++
    await fetchList()
  }
}

const onChangeSize = async () => {
  page.value = 1
  await fetchList()
}

const goDetail = (item) => {
  const id = item?.id ?? item?.activityId
  if (!id) {
    alert('活动ID缺失，无法查看详情')
    return
  }
  router.push(`/activities/${id}`)
}

const statusText = (s) => {
  if (s === 1 || s === 'ENROLLING') return '可报名'
  if (s === 0 || s === 'NOT_STARTED') return '未开始'
  if (s === 2 || s === 'ENDED') return '已结束'
  return `状态${s ?? '-'}`
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.error { color: #d43f3a; margin-top: 6px; }
</style>
