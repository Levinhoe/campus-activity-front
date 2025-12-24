<template>
  <div class="page">
    <div class="card">
      <div style="display:flex; justify-content: space-between; align-items: center; gap: 12px;">
        <div>
          <h2 class="section-title" style="margin:0;">通知中心</h2>
          <p class="meta" style="margin:4px 0 0;">仅展示通知内容，不再区分未读/已读</p>
        </div>
        <button class="btn" @click="load" :disabled="loading">刷新</button>
      </div>
    </div>

    <div class="card">
      <div v-if="loading" class="meta">加载中...</div>
      <div v-else-if="list.length === 0" class="empty">暂时没有通知</div>
      <div v-else style="display:flex; flex-direction: column; gap: 10px;">
        <div
          v-for="item in list"
          :key="item.id || item.notificationId"
          class="card"
          style="padding: 12px;"
        >
          <div style="display:flex; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
            <div>
              <div style="font-weight:700;">{{ item.title || '通知' }}</div>
              <div class="meta">{{ item.content || item.message }}</div>
              <div class="meta">时间：{{ item.createTime || item.createdAt }}</div>
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
import { fetchNotifications, markNotificationRead } from '@/api/notification'

const list = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)
const totalPages = ref(1)
const loading = ref(false)

const load = async () => {
  loading.value = true
  try {
    const res = await fetchNotifications({ page: page.value, size: size.value })
    const data = res || {}
    const records = data.records || []
    list.value = records
    total.value = data.total || 0
    totalPages.value = Math.max(1, Math.ceil((data.total || 0) / size.value))
  } catch (e) {
    alert(e?.message || '加载失败')
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

onMounted(load)
</script>
