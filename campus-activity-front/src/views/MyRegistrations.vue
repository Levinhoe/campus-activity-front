<template>
  <div class="page">
    <div class="card">
      <div style="display:flex; justify-content: space-between; align-items: center; gap: 12px;">
        <div>
          <h2 class="section-title" style="margin:0;">我的报名</h2>
          <p class="meta" style="margin:4px 0 0;">查看已报名活动，可取消报名</p>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <select class="input" style="width: 150px;" v-model="status" @change="onChangeStatus">
            <option value="">全部状态</option>
            <option value="PENDING">待审核</option>
            <option value="APPROVED">已通过</option>
            <option value="REJECTED">已驳回</option>
            <option value="CANCELED">已取消</option>
          </select>
          <button class="btn" @click="load">刷新</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div v-if="list.length === 0" class="empty">暂无报名记录</div>
      <div v-else style="display:flex; flex-direction: column; gap: 10px;">
        <div
          v-for="item in list"
          :key="item.activityId"
          class="card"
          style="padding: 12px;"
        >
          <div style="display:flex; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
            <div style="display:flex; gap:12px;">
              <img
                v-if="item.cover"
                :src="item.cover"
                alt="cover"
                style="width:80px; height:60px; object-fit: cover; border-radius: 8px; border:1px solid #eee;"
              />
              <div>
                <div style="font-weight:700; font-size:16px;">{{ item.title }}</div>
                <div class="meta">开始：<strong>{{ item.startTime }}</strong></div>
                <div class="meta">地点：<strong>{{ item.location }}</strong></div>
                <div class="meta">报名时间：<strong>{{ item.registrationTime }}</strong></div>
                <div class="meta">状态：<strong>{{ statusText(item.status) }}</strong></div>
                <div class="meta" v-if="item.reason">原因：{{ item.reason }}</div>
              </div>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <button class="btn btn-primary" @click="goDetail(item.activityId)">查看详情</button>
              <button
                v-if="item.status === 1 || item.status === 'PENDING' || item.status === 'APPROVED'"
                class="btn"
                :disabled="loadingId === item.activityId"
                @click="onCancel(item.activityId)"
              >
                {{ loadingId === item.activityId ? '取消中...' : '取消报名' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 12px; display:flex; gap: 10px; align-items: center; justify-content: flex-end;">
        <button class="btn" :disabled="page<=1 || loading" @click="prevPage">上一页</button>
        <div class="meta">第 {{ page }} / {{ totalPages }} 页（共 {{ total }} 条）</div>
        <button class="btn" :disabled="page>=totalPages || loading" @click="nextPage">下一页</button>
        <select class="input" style="width: 120px;" v-model.number="size" @change="onChangeSize">
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
import { fetchMyRegistrations, cancelRegistration } from '@/api/registration'

const router = useRouter()
const list = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)
const totalPages = ref(1)
const loading = ref(false)
const loadingId = ref(null)
const status = ref('')

const load = async () => {
  loading.value = true
  try {
    const res = await fetchMyRegistrations({
      page: page.value,
      size: size.value,
      status: status.value || undefined,
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

const onCancel = async (id) => {
  loadingId.value = id
  try {
    await cancelRegistration(id)
    await load()
  } catch (e) {
    alert(e?.message || '取消失败')
  } finally {
    loadingId.value = null
  }
}

const goDetail = (id) => {
  router.push({ path: `/activities/${id}`, query: { readonly: '1' } })
}

const prevPage = async () => {
  if (page.value > 1) {
    page.value--
    await load()
  }
}
const nextPage = async () => {
  if (page.value < totalPages.value) {
    page.value++
    await load()
  }
}
const onChangeSize = async () => {
  page.value = 1
  await load()
}

const onChangeStatus = async () => {
  page.value = 1
  await load()
}

const statusText = (s) => {
  if (s === 1 || s === 'APPROVED' || s === 'PENDING') return '已报名'
  if (s === 2 || s === 'CANCELED') return '已取消'
  if (s === 'REJECTED') return '已驳回'
  return s
}

onMounted(load)
</script>
