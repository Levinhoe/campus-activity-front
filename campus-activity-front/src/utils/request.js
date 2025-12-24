// src/utils/request.js
import axios from 'axios'

const request = axios.create({
  baseURL: '',       // ✅ 不要写 /api，避免 /api/api 重复
  timeout: 10000,
})

// ✅ 请求拦截：自动带 token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ✅ 响应拦截：统一返回后端 JSON（最关键）
request.interceptors.response.use(
  (resp) => resp.data,
  (err) => Promise.reject(err)
)

export default request
