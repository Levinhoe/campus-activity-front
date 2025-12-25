<template>
  <div class="page" style="max-width: 820px;">
    <div class="card">
      <h2 class="section-title" style="margin:0;">活动问卷</h2>
      <p class="meta">活动 ID：{{ activityId }}</p>
      <p class="meta" v-if="activityName">活动名称：<strong>{{ activityName }}</strong></p>
    </div>

    <div class="card" v-if="loading">加载中...</div>
    <div class="card" v-else-if="errorMsg" style="color:#d43f3a;">{{ errorMsg }}</div>

    <div class="card" v-else>
      <p class="meta" v-if="templateMissing" style="color:#c36a00; margin-top:0;">
        未找到后台模板，已使用默认问卷（评分+建议）
      </p>
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
import { fetchSurveyTemplate, submitSurvey, fetchActivityDetail } from '@/api/activity'

const route = useRoute()
const router = useRouter()
const activityId = route.params.id

const loading = ref(false)
const errorMsg = ref('')
const submitting = ref(false)
const templateMissing = ref(false)
const activityName = ref('')

const score = ref(5)
const suggestion = ref('')

const loadTemplate = async () => {
  loading.value = true
  try {
    // 拉取活动名称
    const detail = await fetchActivityDetail(activityId)
    activityName.value = detail?.title || detail?.name || ''
    await fetchSurveyTemplate(activityId)
  } catch (e) {
    if (e?.code === 42007) {
      errorMsg.value = '已提交过问卷'
    } else if ((e?.message || '').toLowerCase().includes('template')) {
      // 后端无模板时使用前端默认表单
      templateMissing.value = true
      errorMsg.value = ''
    } else {
      errorMsg.value = e?.message || '加载失败'
    }
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  if (templateMissing.value) {
    alert('后台未配置问卷模板，无法提交，请联系管理员。')
    return
  }
  submitting.value = true
  try {
    await submitSurvey(activityId, {
      ratingScore: score.value,
      score: score.value, // 兼容旧字段
      suggestion: suggestion.value,
    })
    alert('提交成功')
    router.push(`/activities/${activityId}`)
  } catch (e) {
    if (e?.code === 42007) {
      alert('已提交过问卷')
    } else if (e?.code === 43001 || (e?.message || '').toLowerCase().includes('template')) {
      alert('后台未配置问卷模板，无法提交，请联系管理员。')
    } else {
      alert(e?.message || '提交失败')
    }
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  if (route.query.from === 'my-registrations') {
    router.push('/me/registrations')
  } else {
    router.push(`/activities/${activityId}`)
  }
}

onMounted(loadTemplate)
</script>
