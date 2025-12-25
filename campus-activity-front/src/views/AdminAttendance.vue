<template>
  <div class="page" style="max-width: 820px;">
    <div class="card">
      <h2 class="section-title" style="margin:0 0 6px;">签到</h2>
      <p class="meta">活动 ID：{{ activityId }}</p>
    </div>

    <div class="card">
      <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
        <div class="form-row">
          <label>学号 *</label>
          <input class="input" v-model="checkin.studentNo" />
        </div>
        <div class="form-row">
          <label>状态</label>
          <select class="input" v-model="checkin.status">
            <option value="NORMAL">正常</option>
            <option value="LATE">迟到</option>
            <option value="ABSENT">缺勤</option>
          </select>
        </div>
      </div>
      <div style="margin-top: 10px;">
        <button class="btn btn-primary" @click="doCheckin" :disabled="loadingIn">
          {{ loadingIn ? '提交中...' : '提交签到' }}
        </button>
      </div>
    </div>

    <div class="card">
      <h3 style="margin:0 0 8px;">最近记录</h3>
      <div v-if="logs.length === 0" class="empty">暂无记录</div>
      <div v-else style="display:flex; flex-direction: column; gap:6px;">
        <div v-for="(l, idx) in logs" :key="idx" class="meta">{{ l }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { adminCheckin } from '@/api/activity'

const route = useRoute()
const activityId = route.params.id

const checkin = ref({ studentNo: '', status: 'NORMAL' })
const loadingIn = ref(false)
const logs = ref([])

const doCheckin = async () => {
  if (!checkin.value.studentNo) {
    alert('请输入学号')
    return
  }
  loadingIn.value = true
  try {
    await adminCheckin(activityId, checkin.value)
    logs.value.unshift(
      `签到：${checkin.value.studentNo} [${checkin.value.status}] @ ${new Date().toLocaleString()}`
    )
    if (logs.value.length > 20) logs.value.pop()
    checkin.value.studentNo = ''
    checkin.value.status = 'NORMAL'
  } catch (e) {
    alert(e?.message || '签到失败')
  } finally {
    loadingIn.value = false
  }
}
</script>
