<template>
  <div class="page">
    <div class="card" style="padding: 18px 18px 12px;">
      <div style="display:flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
        <div>
          <h2 class="section-title" style="margin:0;">报名审核</h2>
          <p class="meta" style="margin:4px 0 0;">活动 ID：{{ activityId }}｜仅保留审核功能，界面简洁清晰</p>
        </div>
        <div style="display:flex; gap:10px; align-items:center; flex-wrap: wrap;">
          <select class="input" style="width:160px;" v-model="status" @change="onChangeStatus">
            <option value="">全部状态</option>
            <option value="PENDING">待审核</option>
            <option value="APPROVED">已通过</option>
            <option value="REJECTED">已驳回</option>
            <option value="CANCELED">已取消</option>
          </select>
          <button class="btn" @click="load" :disabled="loading">刷新</button>
        </div>
      </div>
    </div>

    <div class="card" v-if="forbidden">
      <p class="meta" style="color:#d43f3a;">无权限查看报名名单</p>
      <button class="btn" @click="goBack">返回详情</button>
    </div>

    <div class="card" v-else style="padding: 0;">
      <div v-if="loading" class="meta" style="padding: 18px;">加载中...</div>
      <div v-else-if="list.length === 0" class="empty" style="padding: 18px;">暂无报名记录</div>
      <div v-else>
        <div class="table">
          <div class="table-head">
            <div>用户</div>
            <div>报名时间</div>
            <div>状态</div>
            <div>操作</div>
          </div>
          <div
            class="table-row"
            v-for="item in list"
            :key="item.id || item.registrationId || item.userId + item.registrationTime"
          >
            <div class="user-cell">
              <img
                v-if="item.avatar"
                :src="item.avatar"
                alt=""
                class="avatar"
                style="width:42px; height:42px;"
              />
              <div>
                <div style="font-weight:700;">{{ item.nickname || item.realName || item.userId }}</div>
                <div class="meta">ID：{{ item.userId }}</div>
              </div>
            </div>
            <div class="meta">{{ item.registrationTime }}</div>
            <div>
              <span class="tag" :style="statusStyle(item.status)">
                {{ renderStatus(item.status) }}
              </span>
              <div class="meta" v-if="item.reason">原因：{{ item.reason }}</div>
            </div>
            <div class="actions">
              <button
                class="btn btn-primary"
                v-if="item.status === 'PENDING'"
                @click="approve(item)"
                :disabled="savingId === item.id"
              >通过</button>
              <button
                class="btn"
                v-if="item.status === 'PENDING'"
                @click="reject(item)"
                :disabled="savingId === item.id"
              >驳回</button>
              <span class="meta" v-else>—</span>
            </div>
          </div>
        </div>
      </div>

      <div style="padding: 12px 16px; display:flex; gap: 10px; align-items: center; justify-content: flex-end;">
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
import { useRoute, useRouter } from 'vue-router'
import { adminRegistrations, adminApproveRegistration, adminRejectRegistration } from '@/api/activity'

const route = useRoute()
const router = useRouter()
const activityId = route.params.id

const list = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)
const totalPages = ref(0)
const loading = ref(false)
const forbidden = ref(false)
const status = ref('')
const savingId = ref(null)

const renderStatus = (s) => {
  if (s === 'PENDING') return '待审核'
  if (s === 'APPROVED') return '已通过'
  if (s === 'REJECTED') return '已驳回'
  if (s === 'CANCELED') return '已取消'
  return s || '未知'
}

const statusStyle = (s) => {
  if (s === 'PENDING') return 'background:#fff5e6; color:#c36a00;'
  if (s === 'APPROVED') return 'background:#e7f6ed; color:#1e9c62;'
  if (s === 'REJECTED') return 'background:#ffe9e9; color:#d43f3a;'
  return 'background:#f3f4f6; color:#555;'
}

const load = async () => {
  loading.value = true
  forbidden.value = false
  try {
    const res = await adminRegistrations(activityId, {
      page: page.value,
      size: size.value,
      status: status.value || undefined,
    })
    const data = res || {}
    list.value = data.records || []
    total.value = data.total || 0
    totalPages.value = Math.max(1, Math.ceil((data.total || 0) / size.value))
  } catch (e) {
    if (e?.code === 40002) {
      forbidden.value = true
    } else if (e?.code === 40001) {
      router.push('/login')
      return
    } else {
      alert(e?.message || '加载失败')
    }
  } finally {
    loading.value = false
  }
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

const goBack = () => {
  router.push(`/activities/${activityId}`)
}

const approve = async (item) => {
  try {
    savingId.value = item.id
    const regId = item.id || item.registrationId || item.userId
    await adminApproveRegistration(regId)
    item.status = 'APPROVED'
  } catch (e) {
    alert(e?.message || '操作失败')
  } finally {
    savingId.value = null
  }
}

const reject = async (item) => {
  const reason = window.prompt('请输入驳回原因', '')
  if (reason === null) return
  try {
    savingId.value = item.id
    const regId = item.id || item.registrationId || item.userId
    await adminRejectRegistration(regId, { reason })
    item.status = 'REJECTED'
    item.reason = reason
  } catch (e) {
    alert(e?.message || '操作失败')
  } finally {
    savingId.value = null
  }
}

onMounted(load)
</script>

<style scoped>
.table {
  width: 100%;
  border-collapse: collapse;
}
.table-head, .table-row {
  display: grid;
  grid-template-columns: 2fr 1.3fr 1fr 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
}
.table-head {
  background: #f7f9fc;
  font-weight: 700;
  color: #1b263b;
  border-bottom: 1px solid #e7ecf2;
}
.table-row:nth-child(odd) {
  background: #fbfcff;
}
.table-row:nth-child(even) {
  background: #fff;
}
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
</style>
