<template>
  <div class="page">
    <div class="card">
      <h2 class="section-title" style="margin:0 0 8px;">活动报表</h2>
      <p class="meta">活动 ID：{{ activityId }}</p>
      <div style="margin-top: 10px; display:flex; gap:10px;">
        <button class="btn" @click="load">刷新</button>
        <button class="btn" @click="onExport">导出 CSV</button>
      </div>
    </div>

    <div class="card" v-if="loading">加载中...</div>
    <div class="card" v-else-if="errorMsg" style="color:#d43f3a;">{{ errorMsg }}</div>

    <div class="card" v-else>
      <h3 style="margin-top:0;">核心指标</h3>
      <div class="meta">报名总数：{{ report?.totalRegistrations ?? '-' }}</div>
      <div class="meta">通过人数：{{ report?.approved ?? '-' }}</div>
      <div class="meta">实际参与：{{ report?.attended ?? '-' }}</div>
      <div class="meta">迟到：{{ report?.late ?? '-' }}｜缺勤：{{ report?.absent ?? '-' }}</div>
      <div class="meta">平均评分：{{ report?.avgScore ?? '-' }}</div>
      <div class="meta">评分分布：{{ report?.scoreDistribution || '-' }}</div>

      <h3>建议列表</h3>
      <div v-if="!report?.suggestions || report.suggestions.length === 0" class="empty">暂无建议</div>
      <ul v-else>
        <li v-for="(s, idx) in report.suggestions" :key="idx">{{ s }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { adminReport, adminReportExport } from '@/api/activity'

const route = useRoute()
const activityId = route.params.id

const loading = ref(false)
const errorMsg = ref('')
const report = ref(null)

const load = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    report.value = await adminReport(activityId)
  } catch (e) {
    errorMsg.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const onExport = async () => {
  try {
    await adminReportExport(activityId, 'csv')
    alert('已触发导出（如后端返回下载链接请按需处理）')
  } catch (e) {
    alert(e?.message || '导出失败')
  }
}

load()
</script>
