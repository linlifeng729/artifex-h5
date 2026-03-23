<template>
  <van-overlay :show="qrCodeDialog.visible" :close-on-click-overlay="false">
    <div class="qr-dialog">
      <div class="qr-dialog-header">
        <span class="qr-dialog-title">微信扫码支付</span>
      </div>
      <div class="qr-dialog-body">
        <img :src="qrCodeDialog.imageUrl" alt="支付二维码" class="qr-code-img" />
      </div>
      <div class="qr-dialog-footer">
        <van-button type="primary" block @click="onQrConfirm">已完成支付</van-button>
        <van-button plain block @click="onQrCancel">取消</van-button>
      </div>
    </div>
  </van-overlay>
</template>

<script setup>
import { reactive } from 'vue'
import { showToast } from 'vant'
import QRCode from 'qrcode'
import wx from 'weixin-js-sdk'
import { isPC, isWechatMiniProgram, isWechatBrowser, openWechatMiniProgram } from '@/utils/index'
import { PaymentType, WX_MP_OPENID_KEY, WX_OA_OPENID_KEY, WX_OPEN_DOMAIN, JSAPI_PAY, PAY_CHANNEL } from '@/utils/constants'
import { createPayOrder } from '@/api/payment'
import { useRouter } from 'vue-router'

const router = useRouter()

const WX_OA_APP_ID = import.meta.env.VITE_WX_OA_APP_ID
const WX_MP_APP_ID = import.meta.env.VITE_WX_MP_APP_ID
const ALI_WEB_APP_ID = import.meta.env.VITE_ALI_WEB_APP_ID

const qrCodeDialog = reactive({
  visible: false,
  imageUrl: '',
})

function closeQrDialog() {
  qrCodeDialog.visible = false
}

function onQrConfirm() {
  closeQrDialog()
  router.go(0)
}

function onQrCancel() {
  closeQrDialog()
}

defineExpose({ startPaying, wechatMpPayment, wechatOaPayment, wechatQrCodePayment, alipayPayment })

/**
 * 开始支付流程
 */
function startPaying(paymentInfo) {
  const callbackUrl = `${location.origin}${location.pathname}`
  if (paymentInfo.paymentType === PaymentType.Alipay) {
    alipayPayment({ ...paymentInfo, callbackUrl })
  } else if (paymentInfo.paymentType === PaymentType.WeChat) {
    if (isPC()) {
      wechatQrCodePayment({ ...paymentInfo })
    } else if (isWechatMiniProgram()) {
      wechatMpPayment({ ...paymentInfo, callbackUrl })
    } else if (isWechatBrowser()) {
      wechatOaPayment({ ...paymentInfo, callbackUrl: `${location.pathname}` })
    } else {
      openWechatMiniProgram('pages/index/index')
    }
  }
}

/**
 * 发起微信小程序支付
 */
function wechatMpPayment(paymentInfo) {
  const createOrderParams = {
    appId: WX_MP_APP_ID,
    payChannel: PAY_CHANNEL.WECHAT_MP,
    goodsId: paymentInfo.goodsId,
    callbackUrl: paymentInfo.callbackUrl,
    description: paymentInfo.description,
    amount: paymentInfo.amount,
    openid: sessionStorage.getItem(WX_MP_OPENID_KEY),
  }
  createPayOrder(createOrderParams).then((res) => {
    wx.miniProgram.navigateTo({
      url: `/pages/paymentProcess/index?paymentInfo=${encodeURIComponent(JSON.stringify(res))}`,
      success() {
        showToast('正在发起支付，请稍等')
      },
      fail(error) {
        showToast(error?.message || '支付发起失败')
      }
    })
  }).catch((error) => {
    showToast(error?.message || '支付发起失败')
  })
}

/**
 * 发起微信公众号支付
 */
function wechatOaPayment(paymentInfo) {
  const openid = sessionStorage.getItem(WX_OA_OPENID_KEY)

  if (openid) {
    const createOrderParams = {
      appId: WX_OA_APP_ID,
      payChannel: PAY_CHANNEL.WECHAT_OA,
      goodsId: paymentInfo.goodsId,
      callbackUrl: paymentInfo.callbackUrl,
      description: paymentInfo.description,
      amount: paymentInfo.amount,
      openid,
    }

    createPayOrder(createOrderParams).then((res) => {
      const { timestamp, nonceStr, package: packageId, signType, paySign } = res
      const jsapiPayParams = {
        appId: WX_OA_APP_ID,
        timeStamp: timestamp,
        package: packageId,
        nonceStr,
        signType,
        paySign
      }

      if (typeof WeixinJSBridge !== 'undefined') {
        WeixinJSBridge.invoke(
          'getBrandWCPayRequest',
          jsapiPayParams,
          () => {
            location.replace(paymentInfo.callbackUrl)
          }
        )
      }
    }).catch((err) => {
      showToast(err?.message || '支付发起失败')
    })
  } else {
    sessionStorage.setItem(JSAPI_PAY, JSON.stringify(paymentInfo))
    location.href = `${WX_OPEN_DOMAIN}/connect/oauth2/authorize?appId=${WX_OA_APP_ID}&redirect_uri=${encodeURIComponent(`${location.origin}/paymentProcess`)}&response_type=code&scope=snsapi_base&state=${encodeURIComponent(JSAPI_PAY)}#wechat_redirect`
  }
}

/**
 * 发起微信二维码支付
 */
function wechatQrCodePayment(paymentInfo) {
  const createOrderParams = {
    appId: WX_OA_APP_ID,
    payChannel: PAY_CHANNEL.WECHAT_PAY,
    goodsId: paymentInfo.goodsId,
    description: paymentInfo.description,
    amount: paymentInfo.amount,
  }

  createPayOrder(createOrderParams).then((res) => {
    QRCode.toDataURL(res.paymentLink).then((url) => {
      qrCodeDialog.visible = true
      qrCodeDialog.imageUrl = url
    }).catch((error) => {
      showToast(error || '二维码生成失败')
    })
  }).catch((err) => {
    showToast(err?.message || '支付发起失败')
  })
}

/**
 * 发起支付宝支付
 */
function alipayPayment(paymentInfo) {
  const createOrderParams = {
    appId: ALI_WEB_APP_ID,
    payChannel: isPC() ? PAY_CHANNEL.ALIPAY : PAY_CHANNEL.ALIPAY_H5,
    goodsId: paymentInfo.goodsId,
    callbackUrl: paymentInfo.callbackUrl,
    description: paymentInfo.description,
    amount: paymentInfo.amount,
  }

  createPayOrder(createOrderParams).then((res) => {
    if (res.paymentLink) {
      const wrapper = document.createElement('div')
      wrapper.style.display = 'none'
      wrapper.innerHTML = res.paymentLink
      document.body.appendChild(wrapper)
      const form = wrapper.querySelector('form')
      if (form) {
        form.submit()
      }
      document.body.removeChild(wrapper)
    } else {
      showToast('支付发起失败')
    }
  }).catch((err) => {
    showToast(err?.message || '支付发起失败')
  })
}
</script>

<style scoped>
.qr-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 320px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.qr-dialog-header {
  padding: 16px 20px 12px;
  text-align: center;
}

.qr-dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.qr-dialog-body {
  padding: 8px 20px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 220px;
}

.qr-code-img {
  display: block;
  width: 200px;
  height: 200px;
}

.qr-code-loading {
  color: #969799;
  font-size: 14px;
}

.qr-dialog-footer {
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
