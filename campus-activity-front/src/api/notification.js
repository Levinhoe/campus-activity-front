import http from './http'

export const fetchNotifications = (params) =>
  http.get('/me/notifications', { params })

export const markNotificationRead = (id) =>
  http.post(`/me/notifications/${id}/read`)

export const deleteNotification = (id) =>
  http.delete(`/me/notifications/${id}`)

// 管理端通知（如果后端有单独接口，优先使用）
export const fetchAdminNotifications = (params) =>
  http.get('/admin/notifications', { params })

export const markAdminNotificationRead = (id) =>
  http.post(`/admin/notifications/${id}/read`)

export const deleteAdminNotification = (id) =>
  http.delete(`/admin/notifications/${id}`)
