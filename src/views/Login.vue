<template>
  <div id="login" class="w-screen min-h-screen bg-black relative overflow-hidden flex flex-col">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 pointer-events-none">
      <div
        v-for="(item, index) in cubes"
        :key="index"
        class="cube absolute rounded-md opacity-70 animate-float"
        :class="getCubeClass(index)"
        :style="item.style"
      >
        <img v-if="item.image" :src="item.image" alt="" class="w-full h-full rounded-md" />
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="flex-1 px-6 py-[90px] flex flex-col">
      <!-- 标题 -->
      <div class="mb-[60px]">
        <span class="block text-[32px] font-bold leading-tight mb-1" style="background: linear-gradient(to right, #60a5fa, #a855f7, #f472b6); -webkit-background-clip: text; background-clip: text; color: transparent;">登录 Artifex</span>
        <span class="block text-[32px] font-bold leading-tight" style="background: linear-gradient(to right, #60a5fa, #a855f7, #f472b6); -webkit-background-clip: text; background-clip: text; color: transparent;">发现有趣</span>
      </div>
      <!-- 手机号输入区域 -->
      <div class="mb-5">
        <div class="group relative text-white bg-white/5 border border-white/10 rounded-lg flex items-center backdrop-blur-sm shadow-md transition-all duration-300 px-4 focus-within:border-[#3cb371] focus-within:bg-white/10 focus-within:shadow-green-500/20">
          <input
            v-model="phoneNumber"
            type="tel"
            class="w-full h-12 bg-transparent border-none text-white text-base p-0 outline-none placeholder:text-gray-400 placeholder:text-sm"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </div>
      </div>

      <!-- 验证码输入区域 -->
      <div class="mb-5">
        <div class="flex gap-3">
          <div class="flex-1 group relative text-white bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm shadow-md transition-all duration-300 px-4 focus-within:border-[#3cb371] focus-within:bg-white/10 focus-within:shadow-green-500/20">
            <input
              v-model="verificationCode"
              type="tel"
              class="w-full h-12 bg-transparent border-none text-white text-base p-0 outline-none placeholder:text-gray-400 placeholder:text-sm"
              placeholder="请输入验证码"
              maxlength="6"
            />
          </div>
          <button
            class="w-[75px] h-12 bg-[#3cb371] border-none text-white text-sm font-medium flex items-center justify-center rounded-lg shadow-md transition-all duration-300 active:scale-95"
            :class="{
              'bg-white/20 !text-white shadow-none': countdown > 0,
              'opacity-50 cursor-not-allowed': countdown === 0 && !canSendCode
            }"
            :disabled="!canSendCode || isSendingCode"
            @click="handleSendCodeClick"
          >
            {{ codeButtonText }}
          </button>
        </div>
      </div>

      <!-- 登录按钮 -->
      <div class="mb-[120px]">
        <button
          class="w-full h-12 bg-[#3cb371] border-none rounded-lg text-white text-base font-medium flex items-center justify-center shadow-md transition-all duration-300 active:scale-95"
          :class="{ 'bg-gray-600 text-gray-400 cursor-not-allowed': !canLogin }"
          :disabled="!canLogin"
          @click="handleLogin"
        >
          登录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { sendVerificationCode, login } from '@/api/auth'

const router = useRouter()

const phoneNumber = ref('')
const isAgreed = ref(true)
const countdown = ref(0)
const timer = ref(null)
const verificationCode = ref('')
const isSendingCode = ref(false)

// 极验相关
let geetestCaptcha = null
let geetestReady = false  // 标记极验实例是否已 ready
let geetestInitPromise = null

const cubes = ref([
  { style: { left: '8%', top: '12%', transform: 'rotateX(45deg) rotateY(25deg)', background: 'linear-gradient(135deg, #4a9eff, #6b73ff)' }, image: '' },
  { style: { right: '8%', top: '18%', transform: 'rotateX(-30deg) rotateY(45deg)', background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)' }, image: '' },
  { style: { left: '5%', top: '50%', transform: 'rotateX(20deg) rotateY(-60deg)', background: 'linear-gradient(135deg, #fd79a8, #fdcb6e)' }, image: '' },
  { style: { left: '45%', top: '8%', transform: 'rotateX(60deg) rotateY(-20deg)', background: 'linear-gradient(135deg, #a55eea, #26de81)' }, image: '' },
  { style: { right: '5%', top: '45%', transform: 'rotateX(-40deg) rotateY(55deg)', background: 'linear-gradient(135deg, #a29bfe, #6c5ce7)' }, image: '' },
  { style: { left: '50%', top: '35%', transform: 'rotateX(35deg) rotateY(-25deg)', background: 'linear-gradient(135deg, #e17055, #ff7675)' }, image: '' },
  { style: { left: '12%', bottom: '20%', transform: 'rotateX(-45deg) rotateY(60deg)', background: 'linear-gradient(135deg, #feca57, #ff9ff3)' }, image: '' },
  { style: { right: '12%', bottom: '25%', transform: 'rotateX(30deg) rotateY(-45deg)', background: 'linear-gradient(135deg, #48dbfb, #0abde3)' }, image: '' },
  { style: { left: '40%', bottom: '12%', transform: 'rotateX(-60deg) rotateY(30deg)', background: 'linear-gradient(135deg, #1dd1a1, #55a3ff)' }, image: '' },
  { style: { right: '25%', top: '8%', transform: 'rotateX(40deg) rotateY(-30deg)', background: 'linear-gradient(135deg, #00b894, #00cec9)' }, image: '' }
])

const getCubeClass = (index) => {
  const classes = []
  if ((index + 1) % 4 === 1) classes.push('w-[30px] h-[30px]', 'opacity-50')
  else if ((index + 1) % 6 === 1) classes.push('w-[50px] h-[50px]', 'opacity-80')
  else if ((index + 1) % 8 === 1) classes.push('w-5 h-5', 'opacity-40')
  else classes.push('w-10 h-10')

  if ((index + 1) % 3 === 1) classes.push('animation-delay-1000')
  else if ((index + 1) % 3 === 2) classes.push('animation-delay-3000')
  else classes.push('animation-delay-5000')

  if ((index + 1) % 5 === 0) classes.push('animation-delay-2000')
  if ((index + 1) % 7 === 0) classes.push('animation-delay-4000')

  return classes
}

const canSendCode = computed(() => phoneNumber.value.length === 11 && isAgreed.value && countdown.value === 0 && !isSendingCode.value)
const canLogin = computed(() => verificationCode.value.length === 6)
const codeButtonText = computed(() => countdown.value > 0 ? `${countdown.value}s` : '发送')

const validatePhone = (phone) => /^1[3-9]\d{9}$/.test(phone)

const startCountdown = () => {
  countdown.value = 60
  timer.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer.value)
      timer.value = null
    }
  }, 1000)
}

// 初始化极验实例（使用 bind 模式）
const initGeetest = () => {
  if (geetestInitPromise) return geetestInitPromise
  if (window.initGeetest4 && !geetestCaptcha) {
    geetestInitPromise = new Promise((resolve, reject) => {
      window.initGeetest4(
        {
          captchaId: import.meta.env.VITE_GEETEST_LOGIN_ID,
          product: 'bind',
          language: 'zh-cn'
        },
        (captcha) => {
          geetestCaptcha = captcha
          geetestReady = false

          // 监听验证码资源加载完成
          geetestCaptcha.onReady(() => {
            geetestReady = true
            resolve(true)
          })

          // 验证成功回调（用户完成滑块验证后触发）
          geetestCaptcha.onSuccess(() => {
            const validateData = geetestCaptcha.getValidate()
            if (validateData) {
              sendCodeWithCaptcha(validateData)
            } else {
              showToast('验证失败，请重试')
              resetGeetest()
            }
          })

          // 验证出错回调
          geetestCaptcha.onError((error) => {
            console.error('极验验证出错', error)
            showToast('验证服务异常，请重试')
            resetGeetest()
          })
        }
      )
    }).catch((err) => {
      console.error('极验初始化失败', err)
      geetestCaptcha = null
      geetestReady = false
      reject(err)
    })
    return geetestInitPromise
  } else if (geetestCaptcha) {
    return Promise.resolve(true)
  } else {
    return Promise.reject(new Error('极验脚本未加载'))
  }
}

// 重置极验实例状态
const resetGeetest = () => {
  if (geetestCaptcha && geetestCaptcha.reset) {
    geetestCaptcha.reset()
    // 重置后实例仍处于 ready 状态，可直接再次 showCaptcha
    geetestReady = true
  } else {
    geetestReady = false
  }
}

// 使用验证数据发送短信验证码
const sendCodeWithCaptcha = async (validateData) => {
  if (!validateData) {
    showToast('验证数据无效，请重试')
    resetGeetest()
    return
  }
  if (!validatePhone(phoneNumber.value)) {
    showToast('手机号格式不正确')
    resetGeetest()
    return
  }

  isSendingCode.value = true
  try {
    await sendVerificationCode({
      phone: phoneNumber.value,
      ...validateData
    })
    startCountdown()
    // 发送成功后重置极验，以便下次重新验证
    resetGeetest()
  } catch (error) {
    // 发送失败，重置极验，让用户可以重新点击发送按钮再次验证
    resetGeetest()
  } finally {
    isSendingCode.value = false
  }
}

// 点击发送按钮：校验手机号后直接拉起极验弹窗
const handleSendCodeClick = async () => {
  if (!canSendCode.value) return
  if (!validatePhone(phoneNumber.value)) {
    showToast('请输入正确的手机号')
    return
  }

  try {
    // 确保极验已初始化
    await initGeetest()
    
    // 检查实例是否就绪（bind 模式下需要等待 onReady 完成）
    if (!geetestReady) {
      // 如果尚未 ready，等待一小段时间（实际 onReady 已在 init 中 resolve 时设置）
      await new Promise(resolve => setTimeout(resolve, 100))
      if (!geetestReady) {
        showToast('验证组件加载中，请稍后重试')
        return
      }
    }
    
    // 调用 showCaptcha() 拉起滑块验证弹窗（官方 bind 模式标准用法）
    geetestCaptcha.showCaptcha()
  } catch (error) {
    console.error('极验初始化失败', error)
    showToast('验证服务加载失败，请刷新页面重试')
  }
}

const handleLogin = async () => {
  if (!canLogin.value) return
  if (!validatePhone(phoneNumber.value)) {
    showToast('请输入正确的手机号')
    return
  }
  try {
    const result = await login({
      phone: phoneNumber.value,
      verificationCode: verificationCode.value
    })
    if (result.token) {
      localStorage.setItem('token', result.token)
      localStorage.setItem('userInfo', JSON.stringify(result.user))

      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect')
      if (redirect && redirect.startsWith('/')) {
        router.replace(redirect)
        return
      }
      const fromRedirect = sessionStorage.getItem('loginRedirectFrom')
      sessionStorage.removeItem('loginRedirectFrom')
      router.replace(fromRedirect || '/')
    }
  } catch (error) {
    verificationCode.value = ''
  }
}

// 加载极验脚本（使用标准 script 标签方式）
const loadGeetestScript = () => {
  return new Promise((resolve, reject) => {
    if (window.initGeetest4) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://static.geetest.com/v4/gt4.js'
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('极验脚本加载失败'))
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  // 预初始化极验实例（不调用 showCaptcha，仅加载资源）
  try {
    await loadGeetestScript()
    await initGeetest()
  } catch (err) {
    console.warn('极验预初始化失败，将在点击发送时重试', err)
  }
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  // 销毁极验实例
  if (geetestCaptcha && geetestCaptcha.destroy) {
    geetestCaptcha.destroy()
    geetestCaptcha = null
  }
})
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px) rotateX(45deg) rotateY(25deg); }
  50% { transform: translateY(-10px) rotateX(65deg) rotateY(45deg); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animation-delay-1000 { animation-delay: -1s; }
.animation-delay-2000 { animation-delay: -2s; }
.animation-delay-3000 { animation-delay: -3s; }
.animation-delay-4000 { animation-delay: -4s; }
.animation-delay-5000 { animation-delay: -5s; }
</style>