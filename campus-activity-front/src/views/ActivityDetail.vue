<template>
  <div class="page">
    <div class="card" v-if="loading">加载中...</div>
    <div class="card" v-else-if="errorMsg" style="color:#d43f3a;">{{ errorMsg }}</div>

    <div class="card" v-else>
      <button class="btn" style="margin-bottom:8px;" @click="goBack">返回</button>
      <div style="margin-bottom:12px; font-weight:800; font-size:18px; color:#1b263b; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <span class="tag">{{ statusDisplay }}</span>
        <span>活动名称：{{ detail.title || detail.name || '-' }}</span>
      </div>
      <div style="display:flex; justify-content: space-between; gap: 12px; align-items: flex-start; flex-wrap: wrap;">
        <div>
          <h2 class="section-title" style="margin:0;">{{ detail.title }}</h2>
          <div class="meta" style="margin-top: 6px;">
            <span style="margin-left:10px;">分类：<strong>{{ detail.category || '-' }}</strong></span>
            <span style="margin-left:10px;">地点：<strong>{{ detail.location || '-' }}</strong></span>
          </div>
          <div class="meta" style="margin-top: 4px;">
            活动时间：<strong>{{ detail.startTime }}</strong> ~ <strong>{{ detail.endTime }}</strong>
          </div>
          <div class="meta">
            报名时间：<strong>{{ stats?.enrollStart || '-' }}</strong> ~ <strong>{{ stats?.enrollDeadline || '-' }}</strong>
          </div>
        </div>
        <div v-if="!readOnly && !isAdmin" style="display:flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <button
            v-if="stats?.currentUserRegistered"
            class="btn"
            :disabled="btnLoading"
            @click="onCancel"
          >
            {{ btnLoading ? '处理中...' : '取消报名' }}
          </button>
          <button
            v-else
            class="btn btn-primary"
            :disabled="btnLoading || disableReason !== ''"
            @click="onRegister"
          >
            {{ btnLoading ? '处理中...' : (disableReason || '报名') }}
          </button>
          <button class="btn" @click="goBack">返回列表</button>
          <!-- 查看报名名单按钮删除，避免功能重复 -->
        </div>
      </div>

      <div style="margin-top: 12px; display:flex; gap: 12px; flex-wrap: wrap;">
        <div class="tag">容量 {{ stats?.capacity ?? '-' }} / 已报 {{ stats?.enrolledCount ?? '-' }}</div>
        <div class="tag" v-if="stats?.isFull">已满员</div>
        <div class="tag" v-if="stats">服务器时间 {{ stats.serverTime }}</div>
      </div>

      <div style="margin-top: 14px; color: #2c3e50; line-height: 1.6; white-space: pre-wrap;">
        {{ detail.description || '暂无描述' }}
      </div>

      <div v-if="!stats?.currentUserRegistered && !readOnly && !isAdmin" class="card" style="margin-top:12px; background:#f8fbff;">
        <h4 style="margin:0 0 6px;">报名信息</h4>
        <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
          <div class="form-row">
            <label>姓名</label>
            <input class="input" v-model="regForm.name" placeholder="请输入姓名" />
          </div>
          <div class="form-row">
            <label>学号</label>
            <input class="input" v-model="regForm.studentNo" placeholder="请输入学号" />
          </div>
          <div class="form-row">
            <label>联系方式</label>
            <input class="input" v-model="regForm.phone" placeholder="请输入联系方式" />
          </div>
        </div>
      </div>

      <div class="meta" style="margin-top: 12px;" v-if="disableReason && !stats?.currentUserRegistered">
        当前不可报名：{{ disableReason }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchActivityDetail } from '@/api/activity'
import {
  fetchActivityStats,
  registerActivity,
  cancelRegistration,
} from '@/api/registration'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const btnLoading = ref(false)
const errorMsg = ref('')
const detail = ref({})
const stats = ref(null)
const token = ref(localStorage.getItem('token'))
const role = ref(localStorage.getItem('role') || '')
const regForm = ref({ name: '', studentNo: '', phone: '' })
const readOnly = computed(() => route.query.readonly === '1' || route.query.readonly === 'true')
const isAdmin = computed(() => (role.value || '').toUpperCase() === 'ADMIN')

const fetchDetail = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const id = route.params.id
    if (!id || id === 'undefined') {
      throw new Error('活动ID缺失')
    }
    const res = await fetchActivityDetail(id)
    detail.value = res?.data ?? res
    await fetchStats()
  } catch (e) {
    errorMsg.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const id = route.params.id
    if (!id || id === 'undefined') return
    stats.value = await fetchActivityStats(id)
  } catch (e) {
    console.error(e)
  }
}

const now = computed(() => {
  if (!stats.value?.serverTime) return Date.now()
  const t = new Date(stats.value.serverTime).getTime()
  return Number.isNaN(t) ? Date.now() : t
})

const disableReason = computed(() => {
  if (!stats.value) return '加载中'
  const s = stats.value
  const n = now.value
  const end = new Date(s.enrollDeadline).getTime()

  if (Number.isFinite(end) && n > end) return '已截止'
  if (s.isFull) return '已满员'
  return ''
})

const statusDisplay = computed(() => {
  const s = stats.value
  if (!s) return statusText(detail.value?.status)
  const n = now.value
  const end = new Date(s.enrollDeadline).getTime()
  if (s.isFull) return '已满员'
  if (Number.isFinite(end) && n > end) return '已截止'
  return '可报名'
})

const onRegister = async () => {
  if (!token.value) {
    alert('请先登录')
    router.push('/login')
    return
  }
  if (disableReason.value) {
    alert(disableReason.value)
    return
  }
  if (!regForm.value.name || !regForm.value.studentNo || !regForm.value.phone) {
    alert('请填写姓名、学号、联系方式')
    return
  }
  btnLoading.value = true
  try {
    const id = route.params.id
    await registerActivity(id, {
      realName: regForm.value.name,
      studentNo: regForm.value.studentNo,
      phone: regForm.value.phone,
    })
    await fetchStats()
    alert('报名成功')
  } catch (e) {
    const msg = mapError(e)
    alert(msg)
  } finally {
    btnLoading.value = false
  }
}

const onCancel = async () => {
  btnLoading.value = true
  try {
    const id = route.params.id
    await cancelRegistration(id)
    await fetchStats()
    alert('已取消报名')
  } catch (e) {
    alert(e?.message || '取消失败')
  } finally {
    btnLoading.value = false
  }
}

const goBack = () => {
  if (route.query.from === 'my-registrations') {
    router.push('/me/registrations')
    return
  }
  router.push('/activities')
}

const goAdmin = () => {
  router.push(`/admin/activities/${route.params.id}/registrations`)
}

const statusText = (status) => {
  if (status === 1) return '可报名'
  if (status === 0) return '未开始'
  if (status === 2) return '已结束'
  return `状态 ${status ?? '-'}`
}

const mapError = (e) => {
  const code = e?.code
  if (code === 42001) return '请勿重复报名'
  if (code === 42002) return '已满员'
  if (code === 42003) return '报名尚未开始'
  if (code === 42004) return '报名已截止'
  if (code === 40001) return '未登录，请先登录'
  if (code === 40002) return '无权限'
  return e?.message || '操作失败'
}

onMounted(() => {
  fetchDetail()
})
</script>
