<template>
  <div id="payment_component"></div>
</template>

<script setup>
import QRCode from 'qrcode'
import wx from 'weixin-js-sdk'
import { showToast, showConfirmDialog } from 'vant'
import { http } from '@/utils/request'
import { isPC, isWechatMiniProgram, isWechatBrowser, openWechatMiniProgram } from '@/utils/index'
import { PaymentType, OrderInterface, WECHAT_PAY_NATIVE, WECHAT_PAY_JSAPI, WX_MP_OPENID_KEY, WX_OA_OPENID_KEY, JSAPI_PAY } from '@/utils/constants'

const WX_OA_APP_ID = import.meta.env.VITE_WX_OA_APP_ID
const WX_MP_APP_ID = import.meta.env.VITE_WX_MP_APP_ID
const ALI_WEB_APP_ID = import.meta.env.VITE_ALI_WEB_APP_ID
const WX_OPEN_DOMAIN = 'https://open.weixin.qq.com'

defineExpose({ startPaying, wechatMpPayment, wechatOaPayment, wechatQrCodePayment, alipayPayment })

/**
 * 开始支付流程
 */
function startPaying(paymentInfo) {
  const callbackUrl = `${location.origin}${location.pathname}`
  if (paymentInfo.paymentType === PaymentType.Alipay) {
    if (isPC()) {
      alipayPayment({ ...paymentInfo, callbackUrl, orderInterface: OrderInterface.AlipayWeb })
    } else {
      alipayPayment({ ...paymentInfo, callbackUrl, orderInterface: OrderInterface.AlipayWap })
    }
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
    appid: WX_MP_APP_ID,
    orderInterface: WECHAT_PAY_JSAPI,
    goodsId: paymentInfo.goodsId,
    goodsType: paymentInfo.goodsType,
    callbackUrl: paymentInfo.callbackUrl,
    description: paymentInfo.description,
    amount: paymentInfo.amount,
    openid: sessionStorage.getItem(WX_MP_OPENID_KEY),
  }

  http.post('/wechatPay/createOrder', createOrderParams).then((res) => {
    wx.miniProgram.navigateTo({
      url: `/pages/paymentProcess/index?paymentInfo=${encodeURIComponent(JSON.stringify(res))}`,
      success() {
        showToast('正在发起支付，请稍等')
      },
      fail(error) {
        showToast(error || '支付发起失败')
      }
    })
  }).catch((err) => {
    showToast(err?.message || '支付发起失败')
  })
}

/**
 * 发起微信公众号支付
 */
function wechatOaPayment(paymentInfo) {
  const openid = sessionStorage.getItem(WX_OA_OPENID_KEY)

  if (openid) {
    const createOrderParams = {
      appid: WX_OA_APP_ID,
      orderInterface: WECHAT_PAY_JSAPI,
      goodsId: paymentInfo.goodsId,
      goodsType: paymentInfo.goodsType,
      callbackUrl: paymentInfo.callbackUrl,
      description: paymentInfo.description,
      amount: paymentInfo.amount,
      openid,
    }

    http.post('/wechatPay/createOrder', createOrderParams).then((res) => {
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
    location.href = `${WX_OPEN_DOMAIN}/connect/oauth2/authorize?appid=${WX_OA_APP_ID}&redirect_uri=${encodeURIComponent(`${location.origin}/paymentProcess`)}&response_type=code&scope=snsapi_base&state=${encodeURIComponent(JSAPI_PAY)}#wechat_redirect`
  }
}

/**
 * 发起微信二维码支付
 */
function wechatQrCodePayment(paymentInfo) {
  const createOrderParams = {
    appid: WX_OA_APP_ID,
    orderInterface: WECHAT_PAY_NATIVE,
    goodsId: paymentInfo.goodsId,
    goodsType: paymentInfo.goodsType,
    description: paymentInfo.description,
    amount: paymentInfo.amount,
  }

  http.post('/wechatPay/createOrder', createOrderParams).then((codeUrl) => {
    QRCode.toDataURL(codeUrl).then((url) => {
      showConfirmDialog({
        title: '微信扫码支付',
        message: `<img src="${url}" style="display:block;margin:0 auto;width:200px;height:200px;" />`,
        confirmButtonText: '已完成支付',
        cancelButtonText: '取消',
        showCancelButton: true,
        showClose: false,
        closeOnClickOverlay: false,
      }).then(() => {
        location.reload()
      }).catch(() => {
        // 用户取消
      })
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
    appid: ALI_WEB_APP_ID,
    goodsId: paymentInfo.goodsId,
    goodsType: paymentInfo.goodsType,
    callbackUrl: paymentInfo.callbackUrl,
    description: paymentInfo.description,
    amount: paymentInfo.amount,
    orderInterface: paymentInfo.orderInterface,
  }

  http.post('/alipay/createOrder', createOrderParams).then((html) => {
    document.write(html)
  }).catch((err) => {
    showToast(err?.message || '支付发起失败')
  })
}
</script>
