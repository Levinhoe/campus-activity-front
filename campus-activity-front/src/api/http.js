import axios from 'axios'

// 独立 axios 实例（新契约），基址指向 /api
const http = axios.create({
  baseURL: '/api', // 使用 Vite 代理，避免跨域/混源 Network Error
  timeout: 10000,
})

// 携带 token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 统一处理 Result<T> + 401/403 兜底
http.interceptors.response.use(
  (resp) => {
    const r = resp.data
    if (r && typeof r.code !== 'undefined') {
      if (r.code === 0) return r.data

      if (r.code === 40001) {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        const redirect = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.href = `/login?redirect=${redirect}`
      }
      if (r.code === 40002) {
        alert(r.message || '无权限')
      }

      const err = new Error(r.message || '请求失败')
      err.code = r.code
      err.data = r.data
      throw err
    }
    // 兼容非标准返回
    return r
  },
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      const redirect = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.href = `/login?redirect=${redirect}`
    }
    if (err?.response?.status === 403) {
      alert('无权限')
    }
    return Promise.reject(err)
  }
)

export default http
