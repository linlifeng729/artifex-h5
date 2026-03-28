import axios from 'axios'
import { showToast } from 'vant'

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
    if (data.success) {
      return data.data || data
    }
    return Promise.reject(data)
  },
  (error) => {
    let errorMsg = '网络异常，请稍后重试'

    if (error.response) {
      const status = error.response.status
      switch (status) {
        case 400:
          errorMsg = '请求参数错误'
          break
        case 401:
          localStorage.removeItem('token')
          window.location.href = '/login'
          return Promise.reject(error)
        case 403:
          errorMsg = '暂无权限操作'
          break
        case 404:
          errorMsg = '请求地址不存在'
          break
        case 408:
          errorMsg = '请求超时'
          break
        case 429:
          errorMsg = '请求过于频繁，请稍后重试'
          break
        case 500:
          errorMsg = '服务器内部错误'
          break
        case 502:
          errorMsg = '网关错误'
          break
        case 503:
          errorMsg = '服务不可用'
          break
        case 504:
          errorMsg = '网关超时'
          break
        default:
          errorMsg = `请求失败 (${status})`
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      if (error.code === 'ECONNABORTED') {
        errorMsg = '请求超时，请稍后重试'
      } else {
        errorMsg = '网络连接失败，请检查网络'
      }
    }

    showToast(error.response.data.message || errorMsg)
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
