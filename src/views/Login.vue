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
            :disabled="countdown === 0 && !canSendCode"
            @click="handleSendCodeClick"
          >
            {{ codeButtonText }}
          </button>
        </div>
      </div>

      <!-- 极验滑块验证容器 -->
      <div v-if="showGeetestContainer" id="geetest-captcha-container" class="mb-5"></div>

      <!-- 协议同意 -->
      <div class="mb-5">
        <div class="flex items-start cursor-pointer" @click="toggleAgreement">
          <div
            class="w-4 h-4 border border-gray-400 rounded-sm flex items-center justify-center mr-1 mt-0.5 flex-shrink-0 transition-colors duration-200"
            :class="{ 'bg-[#3cb371] border-[#3cb371]': isAgreed }"
          >
            <span v-if="isAgreed" class="text-white text-[10px] font-bold">✓</span>
          </div>
          <span class="text-gray-300 text-xs leading-6 flex-1">
            已阅读并同意
            <span class="text-[#3cb371] mx-0.5">《用户服务协议》</span>
            <span class="text-[#3cb371] mx-0.5">《隐私权政策》</span>
          </span>
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

// 极验相关
const geetestCaptcha = ref(null)
const geetestValidateData = ref(null)
const showGeetestContainer = ref(false)

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

const canSendCode = computed(() => phoneNumber.value.length === 11 && isAgreed.value && countdown.value === 0)
const canLogin = computed(() => verificationCode.value.length === 6)
const codeButtonText = computed(() => countdown.value > 0 ? `${countdown.value}s` : '发送')

const toggleAgreement = () => {
  isAgreed.value = !isAgreed.value
}

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

// 初始化极验滑块验证
const initGeetest = () => {
  // 显示极验容器
  showGeetestContainer.value = true

  window.initGeetest4(
    {
      captchaId: import.meta.env.VITE_GEETEST_LOGIN_ID
    },
    (captcha) => {
      geetestCaptcha.value = captcha

      captcha.appendTo('#geetest-captcha-container')

      captcha.onSuccess(() => {
        geetestValidateData.value = captcha.getValidate()
        captcha.reset()
        // 验证成功后发送验证码
        sendVerifyCodeWithCaptcha()
      })

      captcha.onError(() => {
        showToast('验证失败，请重试')
      })
    }
  )
}

// 点击发送验证码按钮 - 先触发滑块验证
const handleSendCodeClick = () => {
  if (!canSendCode.value) return
  if (!validatePhone(phoneNumber.value)) {
    showToast('请输入正确的手机号')
    return
  }

  // 如果已经有验证数据，直接发送
  if (geetestValidateData.value) {
    sendVerifyCodeWithCaptcha()
    return
  }

  // 显示极验容器并初始化
  showGeetestContainer.value = true
  initGeetest()
}

// 带滑块验证的发送验证码
const sendVerifyCodeWithCaptcha = async () => {
  if (!geetestValidateData.value) {
    showToast('请先完成滑块验证')
    return
  }

  if (!validatePhone(phoneNumber.value)) {
    showToast('请输入正确的手机号')
    return
  }

  try {
    await sendVerificationCode({
      phone: phoneNumber.value,
      ...geetestValidateData.value
    })
    startCountdown()
    // 清空验证数据，下次需要重新验证
    geetestValidateData.value = null
    // 隐藏极验容器
    showGeetestContainer.value = false
  } catch (error) {
    console.error('发送验证码失败:', error)
    showToast(error.message || '验证码发送失败，请重试')
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
      localStorage.setItem('userInfo', JSON.stringify(result.userInfo || {}))
    }
    router.replace('/')
  } catch (error) {
    console.error('登录失败:', error)
    showToast(error.message || '登录失败，请重试')
    verificationCode.value = ''
  }
}

onMounted(async () => {
  if (!window.initGeetest4) {
    await import('https://static.geetest.com/v4/gt4.js')
  }
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  // 销毁极验实例
  if (geetestCaptcha.value?.destroy) {
    geetestCaptcha.value.destroy()
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
