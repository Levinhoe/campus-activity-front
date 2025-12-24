<template>
  <div class="page">
    <div class="card">
      <div style="display:flex; justify-content: space-between; align-items: center; gap: 12px;">
        <div>
          <h2 class="section-title" style="margin:0;">活动管理</h2>
          <p class="meta">筛选状态 / 类型，支持修改活动状态</p>
        </div>
        <button class="btn btn-primary" @click="$router.push('/admin/activities/create')">新建活动</button>
      </div>
      <div style="display:flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
        <select class="input" v-model="status" style="width: 140px;">
          <option value="">全部状态</option>
          <option value="NOT_STARTED">未开始</option>
          <option value="ENROLLING">报名中</option>
          <option value="ENDED">已结束</option>
        </select>
        <input class="input" v-model="type" placeholder="类型" style="width: 180px;" />
        <button class="btn btn-primary" @click="load">查询</button>
      </div>
    </div>

    <div class="card">
      <div v-if="loading" class="meta">加载中...</div>
      <div v-else-if="list.length === 0" class="empty">暂无活动</div>
      <div v-else style="display:grid; gap: 10px;">
        <div
          v-for="item in list"
          :key="item.id"
          class="card"
          style="padding: 12px;"
        >
          <div style="display:flex; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
            <div>
              <div style="font-weight:700; font-size:16px;">{{ item.name || item.title }}</div>
              <div class="meta">
                类型：<strong>{{ item.type }}</strong>
                ｜ 当前状态：<strong>{{ renderStatus(item.status) }}</strong>
              </div>
              <div class="meta">时间：<strong>{{ item.startTime }}</strong> ~ <strong>{{ item.endTime }}</strong></div>
              <div class="meta">地点：<strong>{{ item.location }}</strong></div>
            </div>
            <div style="display:flex; gap:8px; align-items:center; flex-wrap: wrap;">
              <div class="meta">切换状态：</div>
              <button
                class="btn"
                :class="{ 'btn-primary': item.status === 'NOT_STARTED' }"
                @click="changeStatus(item, 'NOT_STARTED')"
                :disabled="savingId===item.id"
              >未开始</button>
              <button
                class="btn"
                :class="{ 'btn-primary': item.status === 'ENROLLING' }"
                @click="changeStatus(item, 'ENROLLING')"
                :disabled="savingId===item.id"
              >报名中</button>
              <button
                class="btn"
                :class="{ 'btn-primary': item.status === 'ENDED' }"
                @click="changeStatus(item, 'ENDED')"
                :disabled="savingId===item.id"
              >已结束</button>
              <button class="btn" @click="$router.push(`/admin/activities/${item.id}/registrations`)">报名审核</button>
              <button class="btn" @click="$router.push(`/admin/activities/${item.id}/attendance`)">签到/签退</button>
              <button class="btn" @click="$router.push(`/admin/activities/${item.id}/report`)">报表</button>
              <button class="btn" style="color:#d43f3a;" @click="remove(item)" :disabled="savingId===item.id">删除</button>
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
import { adminListActivities, adminDeleteActivity, adminUpdateStatus } from '@/api/activity'

const list = ref([])
const loading = ref(false)
const savingId = ref(null)
const status = ref('')
const type = ref('')
const page = ref(1)
const size = ref(10)
const total = ref(0)
const totalPages = ref(0)

const renderStatus = (s) => {
  if (s === 'NOT_STARTED') return '未开始'
  if (s === 'ENROLLING') return '报名中'
  if (s === 'ENDED') return '已结束'
  return s || '未知'
}

const load = async () => {
  loading.value = true
  try {
    const res = await adminListActivities({
      status: status.value || undefined,
      type: type.value || undefined,
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

const changeStatus = async (item, targetStatus) => {
  savingId.value = item.id
  try {
    await adminUpdateStatus(item.id, { status: targetStatus })
    item.status = targetStatus
    alert('状态已更新为：' + renderStatus(targetStatus))
  } catch (e) {
    alert(e?.message || '更新状态失败')
  } finally {
    savingId.value = null
  }
}

const remove = async (item) => {
  const ok = window.confirm(`确认删除活动【${item.name || item.title || item.id}】吗？`)
  if (!ok) return
  try {
    savingId.value = item.id
    await adminDeleteActivity(item.id)
    await load()
  } catch (e) {
    alert(e?.message || '删除失败')
  } finally {
    savingId.value = null
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

onMounted(load)
</script>
