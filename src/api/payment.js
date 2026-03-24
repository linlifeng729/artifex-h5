/**
 * 支付相关API
 */
import { http } from '@/utils/request'

/**
 * 创建支付订单（统一接口，支付宝/微信均使用此接口）
 * @param {Object} data - 订单参数
 * @param {string} data.appId - 应用ID（微信/支付宝）
 * @param {string} data.payChannel - 支付渠道（如 alipay / wechat_pay / wechat_mp / wechat_oa）
 * @param {string|number} data.goodsId - 商品ID
 * @param {string|number} data.goodsType - 商品类型
 * @param {string} [data.callbackUrl] - 回调地址（JSAPI场景需要）
 * @param {string} [data.description] - 订单描述
 * @param {number} data.amount - 支付金额（分）
 * @param {string} [data.openid] - 用户openid（JSAPI场景需要）
 * @returns {Promise}
 */
export function createPayOrder(data) {
  return http.post('/pay/createOrder', data)
}

/**
 * 通过微信授权 code 获取 openid
 * @param {Object} data - 请求参数
 * @param {string} data.code - 微信授权 code
 * @returns {Promise}
 */
export function getOpenId(data) {
  return http.get('/pay/wechatOA/openId', data)
}
