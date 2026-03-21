// 微信 OpenID 存储 key
export const WX_MP_OPENID_KEY = 'WX_MP_OPENID_KEY'
export const WX_OA_OPENID_KEY = 'WX_OA_OPENID_KEY'
export const WX_OA_CONFIG_URL_KEY = 'WX_OA_CONFIG_URL_KEY'
// JSAPI 支付状态存储 key
export const JSAPI_PAY = 'JSAPI_PAY'

// 微信支付接口路径
export const WECHAT_PAY_NATIVE = '/v3/pay/transactions/native'
export const WECHAT_PAY_JSAPI = '/v3/pay/transactions/jsapi'

// 支付方式枚举
export const PaymentType = {
  WeChat: 'WeChat',
  Alipay: 'Alipay'
}

// 支付宝订单接口枚举
export const OrderInterface = {
  AlipayWeb: 'alipay.trade.page.pay',
  AlipayWap: 'alipay.trade.wap.pay'
}
