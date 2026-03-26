// 微信 OpenID 存储 key
export const WX_MP_OPENID_KEY = 'WX_MP_OPENID_KEY'
export const WX_OA_OPENID_KEY = 'WX_OA_OPENID_KEY'
export const WX_OA_CONFIG_URL_KEY = 'WX_OA_CONFIG_URL_KEY'

// JSAPI 支付状态存储 key
export const JSAPI_PAY = 'JSAPI_PAY'

// 微信 Open 授权域名
export const WX_OPEN_DOMAIN = 'https://open.weixin.qq.com'

// 支付方式枚举
export const PAYMENT_TYPE = {
  WeChat: 'WeChat',
  Alipay: 'Alipay'
}

/**
 * 支付渠道枚举
 * 对应后端 pay_channel 字段
 */
export const PAY_CHANNEL = {
  /** 支付宝扫码支付 */
  ALIPAY: 'alipay',
  /** 支付宝H5支付 */
  ALIPAY_H5: 'alipay_h5',
  /** 微信Native扫码支付 */
  WECHAT_PAY: 'wechat_pay',
  /** 微信小程序支付 */
  WECHAT_MP: 'wechat_mp',
  /** 微信公众号/JSAPI支付 */
  WECHAT_OA: 'wechat_oa',
}