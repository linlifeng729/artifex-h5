import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, sendVerificationCode as sendCodeApi } from '@/api/auth'

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || null)
  const userInfo = ref(JSON.parse(localStorage.getItem(USER_INFO_KEY) || 'null'))

  const isLoggedIn = computed(() => !!token.value)

  function setToken(newToken) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  function setUserInfo(info) {
    userInfo.value = info
    if (info) {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
    } else {
      localStorage.removeItem(USER_INFO_KEY)
    }
  }

  function login(phone, verificationCode) {
    return loginApi({ phone, verificationCode }).then((result) => {
      if (result.token) {
        setToken(result.token)
        setUserInfo(result.user)
      }
      return result
    })
  }

  function sendVerificationCode(data) {
    return sendCodeApi(data)
  }

  function logout() {
    setToken(null)
    setUserInfo(null)
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    setToken,
    setUserInfo,
    login,
    sendVerificationCode,
    logout,
  }
})
