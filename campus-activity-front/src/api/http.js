import axios from 'axios'

const http = axios.create({
  baseURL: '',
  timeout: 10000
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (res) => {
    const r = res.data
    // r = {code, message, data}
    if (r && typeof r.code !== 'undefined') {
      if (r.code === 0) return r.data
      if (r.code === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      return Promise.reject(new Error(r.message || '请求失败'))
    }
    return r
  },
  (err) => Promise.reject(err)
)

export default http
