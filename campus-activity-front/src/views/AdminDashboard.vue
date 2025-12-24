<template>
  <div class="page">
    <div class="card">
      <h2 class="section-title" style="margin:0;">管理员中心</h2>
      <p class="meta">快速入口</p>
      <div style="display:flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
        <button class="btn btn-primary" @click="$router.push('/admin/activities')">活动列表</button>
        <button class="btn" @click="$router.push('/admin/activities/create')">创建活动</button>
      </div>
    </div>
  </div>
</template>
