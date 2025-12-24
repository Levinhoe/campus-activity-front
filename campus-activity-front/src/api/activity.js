import http from './http'

// 学生活动
export const fetchActivities = (params) => http.get('/activities', { params })
export const fetchActivityDetail = (id) => http.get(`/activities/${id}`)
export const fetchActivityStats = (id) => http.get(`/activities/${id}/stats`)
export const registerForActivity = (id, payload) =>
  http.post(`/activities/${id}/registrations`, payload)
export const cancelActivityRegistration = (id) =>
  http.post(`/activities/${id}/registrations/cancel`)
export const fetchActivityRegistrations = (id, params) =>
  http.get(`/activities/${id}/registrations`, { params })
export const fetchSurveyTemplate = (id) => http.get(`/activities/${id}/survey/template`)
export const submitSurvey = (id, data) => http.post(`/activities/${id}/survey/submit`, data)

// 管理员活动
export const adminCreateActivity = (data) => http.post('/admin/activities', data)
// 状态更新：使用 POST 以规避部分服务对 PATCH/CORS 的限制
export const adminUpdateStatus = (id, data) => http.post(`/admin/activities/${id}/status`, data)
// 管理端：列表/报名名单分开，避免与创建接口冲突
export const adminListActivities = (params) => http.get('/admin/activities', { params })
// 报名名单有些后端写POST，这里保持POST 兼容
export const adminRegistrations = (id, params) =>
  http.post(`/admin/activities/${id}/registrations`, params)
export const adminApproveRegistration = (registrationId, data) =>
  http.post(`/admin/registrations/${registrationId}/approve`, data)
export const adminRejectRegistration = (registrationId, data) =>
  http.post(`/admin/registrations/${registrationId}/reject`, data)
export const adminDeleteActivity = (id) => http.delete(`/admin/activities/${id}`)
export const adminCheckin = (id, data) => http.post(`/admin/activities/${id}/checkin`, data)
export const adminCheckout = (id, data) => http.post(`/admin/activities/${id}/checkout`, data)
export const adminReport = (id) => http.get(`/admin/activities/${id}/report`)
export const adminReportExport = (id, format = 'csv') =>
  http.get(`/admin/activities/${id}/report/export`, { params: { format } })
