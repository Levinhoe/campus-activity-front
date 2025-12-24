<template>
  <div class="page" style="max-width: 900px;">
    <div class="card">
      <h2 class="section-title" style="margin:0 0 10px;">创建活动</h2>
      <p class="meta">请填写必填项，时间格式：yyyy-MM-dd HH:mm（示例：2025-12-25 14:00）</p>
    </div>

    <div class="card">
      <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
        <div class="form-row">
          <label>名称*</label>
          <input class="input" v-model="form.name" placeholder="活动名称" />
        </div>
        <div class="form-row">
          <label>类型*</label>
          <input class="input" v-model="form.type" placeholder="类型（如 社团/讲座）" />
        </div>
        <div class="form-row">
          <label>地点*</label>
          <input class="input" v-model="form.location" placeholder="地点" />
        </div>
        <div class="form-row">
          <label>人数上限*</label>
          <input class="input" type="number" v-model.number="form.capacity" placeholder="人数上限" />
        </div>
        <div class="form-row">
          <label>开始时间*</label>
          <input class="input" type="datetime-local" v-model="form.startTime" />
        </div>
        <div class="form-row">
          <label>结束时间*</label>
          <input class="input" type="datetime-local" v-model="form.endTime" />
        </div>
        <div class="form-row">
          <label>报名截止*</label>
          <input class="input" type="datetime-local" v-model="form.deadline" />
        </div>
      </div>

      <div class="form-row" style="margin-top:8px;">
        <label>海报</label>
        <div style="display:flex; gap:10px; align-items:center;">
          <img v-if="form.posterUrl" :src="form.posterUrl" alt="poster" style="width:120px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #eee;" />
          <input type="file" @change="onPosterChange" />
        </div>
      </div>
      <div class="form-row" style="margin-top:8px;">
        <label>描述</label>
        <textarea class="input" rows="3" v-model="form.description"></textarea>
      </div>

      <div style="margin-top: 10px; display:flex; gap:10px;">
        <button class="btn btn-primary" @click="onSubmit" :disabled="submitting">
          {{ submitting ? '提交中...' : '提交' }}
        </button>
        <button class="btn" @click="$router.push('/admin/activities')">返回列表</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminCreateActivity } from '@/api/activity'
import { uploadPoster } from '@/api/file'

const router = useRouter()
const submitting = ref(false)
const form = reactive({
  name: '',
  type: '',
  location: '',
  capacity: 100,
  startTime: '',
  endTime: '',
  deadline: '',
  posterUrl: '',
  description: '',
})

const onPosterChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  const fd = new FormData()
  fd.append('file', file)
  try {
    const url = await uploadPoster(fd)
    form.posterUrl = url
  } catch (err) {
    alert(err?.message || '上传失败')
  }
}

const fmt = (v) => {
  if (!v) return undefined
  // datetime-local to "yyyy-MM-dd HH:mm"
  return v.replace('T', ' ').slice(0, 16)
}

const onSubmit = async () => {
  if (!form.name || !form.type || !form.location) {
    alert('请填写名称、类型、地点')
    return
  }
  if (!form.capacity || Number.isNaN(Number(form.capacity))) {
    alert('请填写人数上限（数字）')
    return
  }
  if (!form.startTime || !form.endTime || !form.deadline) {
    alert('请填写开始/结束时间和报名截止时间')
    return
  }

  submitting.value = true
  try {
    const payload = {
      name: form.name,
      type: form.type,
      location: form.location,
      capacity: Number(form.capacity),
      startTime: fmt(form.startTime),
      endTime: fmt(form.endTime),
      deadline: fmt(form.deadline),
      posterUrl: form.posterUrl || undefined,
      description: form.description || undefined,
    }
    await adminCreateActivity(payload)
    alert('创建成功')
    router.push('/admin/activities')
  } catch (e) {
    alert(e?.message || '创建失败')
  } finally {
    submitting.value = false
  }
}
</script>
