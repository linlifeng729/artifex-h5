<template>
  <div class="min-h-screen flex items-center justify-center" style="background: linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);">
    <div class="text-base font-bold text-center" style="background: linear-gradient(to right, #ff7e5f, #feb47b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
      正在发起支付，请稍等
    </div>
  </div>
  <PaymentComponent ref="paymentComponentRef" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import PaymentComponent from '@/components/paymentComponent.vue'
import { getOpenId } from '@/api/payment'
import { WX_OA_OPENID_KEY, JSAPI_PAY } from '@/utils/constants'

const route = useRoute()
const paymentComponentRef = ref(null)

/**
 * 微信静默授权后，通过 code 获取 openid，并继续 JSAPI 支付流程
 */
function initPage() {
  const { code } = route.query
  if (!code) {
    showToast('授权参数缺失，支付失败')
    window.location.href = '/'
    return
  }

  getOpenId({ code }).then((res) => {
    if (res?.openid) {
      sessionStorage.setItem(WX_OA_OPENID_KEY, res.openid)
      const paymentInfo = JSON.parse(sessionStorage.getItem(JSAPI_PAY) || '{}')
      paymentComponentRef.value?.wechatOaPayment(paymentInfo)
    }
  }).catch(() => {
    showToast('获取授权失败，请重试')
    window.location.href = '/'
  })
}

onMounted(initPage)
</script>

