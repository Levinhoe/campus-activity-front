<template>
  <div class="page">
    <div class="card">
      <div style="display:flex; justify-content: space-between; align-items: center; gap: 12px;">
        <div>
          <h2 class="section-title" style="margin:0;">反馈通知</h2>
          <p class="meta" style="margin:4px 0 0;">查看不同活动收到的问卷/系统通知，可标记已读</p>
        </div>
        <div style="display:flex; gap:10px; align-items:center; flex-wrap: wrap;">
          <select class="input" style="width:160px;" v-model="type" @change="onChangeType">
            <option value="">全部类型</option>
            <option value="FEEDBACK">问卷反馈</option>
            <option value="SYSTEM">系统通知</option>
          </select>
          <button class="btn" @click="load" :disabled="loading">刷新</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div v-if="loading" class="meta">加载中...</div>
      <div v-else-if="list.length === 0" class="empty">暂无通知</div>
      <div v-else style="display:flex; flex-direction: column; gap: 10px;">
        <div
          v-for="item in list"
          :key="item.id || item.notificationId"
          class="card"
          style="padding: 12px; cursor: pointer;"
          @click="openDetail(item)"
        >
          <div style="display:flex; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
            <div>
              <div style="font-weight:700;">{{ displayTitle(item) }}</div>
              <div class="meta">{{ displayContent(item) }}</div>
              <div class="meta">
                活动：{{ item.activityTitle || item.activityName || item.activityId || '-' }}
                ｜ 时间：{{ item.createTime || item.createdAt }}
              </div>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <div class="tag" v-if="item.read">已读</div>
              <div class="tag" style="background:#ffe9e9; color:#d43f3a;" v-else>未读</div>
              <button class="btn" style="padding:6px 10px;" @click.stop="remove(item)">删除</button>
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

    <div v-if="selected" class="card" style="border: 1px solid var(--color-border); background:#fffaf3;">
      <div style="display:flex; justify-content: space-between; align-items:center; gap:10px;">
        <div>
          <h3 style="margin:0 0 6px;">{{ displayTitle(selected) }}</h3>
          <p class="meta" style="margin:0;">时间：{{ selected.createTime || selected.createdAt }}</p>
        </div>
        <button class="btn" @click="closeDetail">关闭</button>
      </div>
      <p class="meta" style="margin:10px 0;">{{ displayContent(selected) }}</p>
      <div class="meta" v-if="selectedDetail.rating !== null">评分：{{ selectedDetail.rating }}</div>
      <div class="meta">反馈：{{ selectedDetail.suggestion || '暂无' }}</div>
      <div style="margin-top:10px; display:flex; gap:10px; flex-wrap: wrap;">
        <button
          v-if="selected.activityId"
          class="btn btn-primary"
          @click="goActivity(selected.activityId)"
        >查看活动</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  fetchNotifications,
  markNotificationRead,
  fetchAdminNotifications,
  markAdminNotificationRead,
  deleteAdminNotification,
} from '@/api/notification'

const router = useRouter()
const list = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)
const totalPages = ref(1)
const loading = ref(false)
// 默认查看全部，若后端支持 FEEDBACK/SYSTEM 可切换
const type = ref('')
const selected = ref(null)
const selectedDetail = ref({ rating: null, suggestion: '' })
const removingId = ref(null)

const load = async () => {
  loading.value = true
  try {
    let res
    try {
      // 优先尝试管理端通知接口
      res = await fetchAdminNotifications({
        page: page.value,
        size: size.value,
        type: type.value || undefined,
      })
    } catch (err) {
      // 如果后端未提供管理端接口，则退回个人通知接口
      res = await fetchNotifications({
        page: page.value,
        size: size.value,
        type: type.value || undefined,
      })
    }
    const data = res || {}
    const records = data.records || []
    list.value = records.map((item) => ({
      ...item,
      read: item.read ?? item.isRead ?? item.hasRead ?? item.readFlag ?? false,
    }))
    total.value = data.total || 0
    totalPages.value = Math.max(1, Math.ceil((data.total || 0) / size.value))
  } catch (e) {
    alert(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const markRead = async (item) => {
  if (item.read) return
  const id = item.id || item.notificationId
  if (!id) return
  item.read = true
  try {
    // 后端未提供 admin/read 时直接调用个人通知的标记接口，避免 999 错误
    await markNotificationRead(id)
  } catch (e) {
    item.read = false
    alert(e?.message || '标记失败')
  }
}

const openDetail = async (item) => {
  selected.value = item
  // 尝试解析评分/建议
  let rating = item.ratingScore ?? item.score ?? null
  let suggestion = item.suggestion || item.feedback || ''
  const raw = item.payload || item.data
  if (typeof raw === 'string' && raw) {
    try {
      const parsed = JSON.parse(raw)
      if (parsed) {
        rating = rating ?? parsed.ratingScore ?? parsed.score ?? null
        suggestion = suggestion || parsed.suggestion || parsed.feedback || ''
      }
    } catch (_) {
      // raw 不是 JSON，直接作为建议兜底
      suggestion = suggestion || raw
    }
  }
  if (!suggestion && item.content) {
    suggestion = item.content
  }
  selectedDetail.value = { rating: rating ?? null, suggestion }
  await markRead(item)
}

const closeDetail = () => {
  selected.value = null
}

const goActivity = (id) => {
  router.push(`/activities/${id}`)
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

const onChangeType = async () => {
  page.value = 1
  await load()
}

const remove = async (item) => {
  const id = item.id || item.notificationId
  if (!id) return
  if (!window.confirm('确认删除这条通知吗？')) return
  removingId.value = id
  try {
    try {
      await deleteAdminNotification(id)
    } catch (_) {
      // 若管理员删除接口失败，回退到个人删除（若后端支持）
      await deleteAdminNotification(id)
    }
    await load()
  } catch (e) {
    alert(e?.message || '删除失败')
  } finally {
    removingId.value = null
  }
}

const displayTitle = (item) => {
  const t = (item?.title || '').toLowerCase()
  if (t.includes('survey feedback')) return '问卷反馈'
  if (t.includes('registration approved')) return '报名审核通过'
  if (t.includes('registration')) return '报名通知'
  return item?.title || '通知'
}

const displayContent = (item) => {
  const c = item?.content || item?.message || ''
  if (c.trim().toLowerCase() === 'student submitted feedback') return '学生提交了反馈'
  return c || '暂无内容'
}

onMounted(load)
</script>
