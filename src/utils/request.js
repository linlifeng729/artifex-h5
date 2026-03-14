import axios from 'axios'

// API请求前缀 - 从环境变量读取
const API_PREFIX = import.meta.env.VITE_API_PREFIX

// 创建 axios 实例
const service = axios.create({
  baseURL: API_PREFIX,
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const { data } = response
    if (data.code === 0 || data.success) {
      return data.data || data
    }
    return Promise.reject(data)
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 封装 http 方法
export const http = {
  get(url, params) {
    return service({ url, method: 'GET', params })
  },
  post(url, data) {
    return service({ url, method: 'POST', data })
  },
  put(url, data) {
    return service({ url, method: 'PUT', data })
  },
  delete(url, params) {
    return service({ url, method: 'DELETE', params })
  }
}

export default http
