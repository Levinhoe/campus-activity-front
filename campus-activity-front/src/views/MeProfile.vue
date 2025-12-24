<template>
  <div class="page" style="max-width: 760px;">
    <div class="card">
      <h2 class="section-title" style="margin:0 0 10px;">个人中心</h2>
      <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
        <div class="form-row">
          <label>昵称</label>
          <input class="input" v-model="profile.nickname" placeholder="请输入昵称" />
        </div>
        <div class="form-row">
          <label>头像</label>
          <div style="display:flex; align-items:center; gap:10px;">
            <img
              v-if="profile.avatar"
              :src="profile.avatar"
              alt="avatar"
              style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:1px solid #eee;"
            />
            <input type="file" accept="image/*" @change="onAvatarChange" />
          </div>
          <p class="meta">支持 jpg/png，上传成功后会自动保存到个人资料</p>
        </div>
      </div>
      <div style="display:flex; gap: 10px; margin-top: 12px;">
        <button class="btn btn-primary" @click="saveProfile" :disabled="saving">
          {{ saving ? '保存中...' : '保存资料' }}
        </button>
      </div>
    </div>

    <div class="card">
      <h3 style="margin:0 0 8px;">修改密码</h3>
      <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
        <div class="form-row">
          <label>原密码</label>
          <input class="input" type="password" v-model="pwd.oldPassword" />
        </div>
        <div class="form-row">
          <label>新密码</label>
          <input class="input" type="password" v-model="pwd.newPassword" />
        </div>
      </div>
      <div style="margin-top: 10px; display:flex; gap:10px;">
        <button class="btn btn-primary" @click="savePwd" :disabled="savingPwd">
          {{ savingPwd ? '提交中...' : '提交' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { apiMe, apiUpdateProfile, apiUpdatePassword } from '@/api/auth'
import { uploadAvatar } from '@/api/file'

const profile = reactive({ nickname: '', avatar: '' })
const saving = ref(false)

const pwd = reactive({ oldPassword: '', newPassword: '' })
const savingPwd = ref(false)

const loadProfile = async () => {
  try {
    const res = await apiMe()
    profile.nickname = res?.nickname || res?.name || ''
    profile.avatar = res?.avatar || res?.avatarUrl || ''
  } catch (e) {
    console.error(e)
  }
}

const onAvatarChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  const fd = new FormData()
  // 同时兼容后端字段名 file/avatar
  fd.append('file', file)
  fd.append('avatar', file)
  try {
    const url = await uploadAvatar(fd)
    // 后端可能返回字符串或 { url: '...' }
    const finalUrl = typeof url === 'string' ? url : url?.url || url?.data || ''
    if (!finalUrl) throw new Error('上传结果为空')
    profile.avatar = finalUrl
    await saveProfile(true)
    // 通知全局导航立即刷新头像
    localStorage.setItem('avatarCache', finalUrl)
    window.dispatchEvent(new Event('auth-changed'))
  } catch (err) {
    alert(err?.message || '上传失败')
  } finally {
    e.target.value = ''
  }
}

const saveProfile = async (fromUpload = false) => {
  saving.value = true
  try {
    await apiUpdateProfile({
      nickname: profile.nickname,
      avatar: profile.avatar || profile.avatarUrl,
    })
    if (!fromUpload) {
      alert('保存成功')
    }
  } catch (e) {
    alert(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const savePwd = async () => {
  savingPwd.value = true
  try {
    await apiUpdatePassword({ oldPassword: pwd.oldPassword, newPassword: pwd.newPassword })
    alert('修改成功，请重新登录')
  } catch (e) {
    alert(e?.message || '修改失败')
  } finally {
    savingPwd.value = false
  }
}

onMounted(loadProfile)
</script>
