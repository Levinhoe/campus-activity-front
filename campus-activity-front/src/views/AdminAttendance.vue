<template>
  <div class="page" style="max-width: 760px;">
    <div class="card">
      <h2 class="section-title" style="margin:0 0 6px;">签到 / 签退</h2>
      <p class="meta">活动 ID：{{ activityId }}</p>
    </div>

    <div class="card">
      <h3 style="margin:0 0 8px;">签到</h3>
      <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
        <div class="form-row">
          <label>学号*</label>
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
      <h3 style="margin:0 0 8px;">签退（志愿类使用）</h3>
      <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
        <div class="form-row">
          <label>学号*</label>
          <input class="input" v-model="checkout.studentNo" />
        </div>
      </div>
      <div style="margin-top: 10px;">
        <button class="btn btn-primary" @click="doCheckout" :disabled="loadingOut">
          {{ loadingOut ? '提交中...' : '提交签退' }}
        </button>
      </div>
      <p v-if="checkoutResult" class="meta" style="margin-top:8px;">{{ checkoutResult }}</p>
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
import { adminCheckin, adminCheckout } from '@/api/activity'

const route = useRoute()
const activityId = route.params.id

const checkin = ref({ studentNo: '', status: 'NORMAL' })
const checkout = ref({ studentNo: '' })
const loadingIn = ref(false)
const loadingOut = ref(false)
const checkoutResult = ref('')
const logs = ref([])

const doCheckin = async () => {
  if (!checkin.value.studentNo) {
    alert('请填写学号')
    return
  }
  loadingIn.value = true
  try {
    await adminCheckin(activityId, checkin.value)
    logs.value.unshift(`签到：${checkin.value.studentNo} [${checkin.value.status}]`)
  } catch (e) {
    alert(e?.message || '签到失败')
  } finally {
    loadingIn.value = false
  }
}

const doCheckout = async () => {
  if (!checkout.value.studentNo) {
    alert('请填写学号')
    return
  }
  loadingOut.value = true
  try {
    const res = await adminCheckout(activityId, checkout.value)
    checkoutResult.value = res?.duration_minutes
      ? `签退成功，时长 ${res.duration_minutes} 分钟`
      : '签退成功'
    logs.value.unshift(`签退：${checkout.value.studentNo}`)
  } catch (e) {
    alert(e?.message || '签退失败')
  } finally {
    loadingOut.value = false
  }
}
</script>
