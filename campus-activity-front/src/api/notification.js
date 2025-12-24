import http from './http'

export const fetchNotifications = (params) =>
  http.get('/me/notifications', { params })

export const markNotificationRead = (id) =>
  http.post(`/me/notifications/${id}/read`)
