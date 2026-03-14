/**
 * 用户认证相关API
 */
import { http } from '@/utils/request'

/**
 * 发送验证码
 * @param {Object} data - 请求参数
 * @returns {Promise} 请求结果
 */
export function sendVerificationCode(data = {}) {
  return http.post('/auth/send/verificationcode', data)
}

/**
 * 用户登录
 * @param {Object} data - 登录参数
 * @param {string} data.phone - 手机号
 * @param {string} data.verificationCode - 验证码
 * @returns {Promise} 登录结果
 */
export function login(data) {
  return http.post('/auth/login', data)
}
