import request from '@/utils/request'

// 活动列表
export const listActivities = (params) => {
  return request({
    url: '/activities',
    method: 'get',
    params
  })
}

// 活动详情
export const getActivityDetail = (id) => {
  return request({
    url: `/activities/${id}`,
    method: 'get'
  })
}

// 报名
export const registerActivity = (id) => {
  return request({
    url: `/activities/${id}/register`,
    method: 'post'
  })
}

// 取消报名
export const cancelActivity = (id) => {
  return request({
    url: `/activities/${id}/cancel`,
    method: 'post'
  })
}

// 我的报名
export const myRegistrations = () => {
  return request({
    url: '/activities/me',
    method: 'get'
  })
}
