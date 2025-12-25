import http from './http'

// 学生 - 报名
export const registerActivity = (activityId, payload) =>
  http.post(`/activities/${activityId}/registrations`, payload)

export const cancelRegistration = (activityId) =>
  http.post(`/activities/${activityId}/registrations/cancel`)

export const fetchMyRegistrations = (params) =>
  http.get('/me/registrations', { params })

// 活动报名名单 / 统计
export const fetchActivityRegistrations = (activityId, page = 1, size = 10, status) =>
  http.get(`/activities/${activityId}/registrations`, { params: { page, size, status } })

export const fetchActivityStats = (activityId) =>
  http.get(`/activities/${activityId}/stats`)

// 学生自助签到
export const studentCheckin = (activityId, payload = {}) => {
  const checkStatus = payload.checkStatus || payload.status || 'NORMAL'
  return http.post('/me/checkin', { activityId, checkStatus, ...payload })
}
