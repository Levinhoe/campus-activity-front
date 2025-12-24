<template>
  <div class="page" style="max-width: 820px;">
    <div class="card">
      <h2 class="section-title" style="margin:0;">活动问卷</h2>
      <p class="meta">活动 ID：{{ activityId }}</p>
    </div>

    <div class="card" v-if="loading">加载中...</div>
    <div class="card" v-else-if="errorMsg" style="color:#d43f3a;">{{ errorMsg }}</div>

    <div class="card" v-else>
      <div class="form-grid">
        <div class="form-row">
          <label>评分（1-5）</label>
          <input class="input" type="number" v-model.number="score" min="1" max="5" />
        </div>
        <div class="form-row">
          <label>建议</label>
          <textarea class="input" rows="3" v-model="suggestion" placeholder="填写建议"></textarea>
        </div>
      </div>
      <div style="margin-top: 10px; display:flex; gap:10px;">
        <button class="btn btn-primary" @click="onSubmit" :disabled="submitting">
          {{ submitting ? '提交中...' : '提交' }}
        </button>
        <button class="btn" @click="goBack">返回详情</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchSurveyTemplate, submitSurvey } from '@/api/activity'

const route = useRoute()
const router = useRouter()
const activityId = route.params.id

const loading = ref(false)
const errorMsg = ref('')
const submitting = ref(false)

const score = ref(5)
const suggestion = ref('')

const loadTemplate = async () => {
  loading.value = true
  try {
    await fetchSurveyTemplate(activityId)
  } catch (e) {
    if (e?.code === 42007) {
      errorMsg.value = '已提交过问卷'
    } else {
      errorMsg.value = e?.message || '加载失败'
    }
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  submitting.value = true
  try {
    await submitSurvey(activityId, { score: score.value, suggestion: suggestion.value })
    alert('提交成功')
    router.push(`/activities/${activityId}`)
  } catch (e) {
    if (e?.code === 42007) {
      alert('已提交过问卷')
    } else {
      alert(e?.message || '提交失败')
    }
  } finally {
    submitting.value = false
  }
}

const goBack = () => router.push(`/activities/${activityId}`)

onMounted(loadTemplate)
</script>
