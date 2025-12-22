import axios from 'axios'
import router from '@/router'

const request = axios.create({
  baseURL: '/api', // 通过 vite 代理转发到后端
  timeout: 10000
})

// 请求拦截器：自动带 token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一处理业务错误
request.interceptors.response.use(
  (response) => {
    const res = response.data

    // 你后端用的是 ApiResult
    if (res.code !== 0) {
      // 未登录 / token 失效
      if (res.code === 401) {
        localStorage.removeItem('token')
        router.push('/login')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return res
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default request
