/**
 * 判断当前设备是否为电脑
 * @returns {boolean}
 */
export function isPC() {
  const userAgent = navigator.userAgent || navigator.vendor
  return /Win|Mac|X11/i.test(userAgent) && !/Mobile/i.test(userAgent)
}

/**
 * 判断当前环境是否为微信浏览器
 * @returns {boolean}
 */
export function isWechatBrowser() {
  const ua = window.navigator.userAgent
  return /micromessenger/i.test(ua) && !isWechatMiniProgram()
}

/**
 * 判断当前环境是否为微信小程序
 * @returns {boolean}
 */
export function isWechatMiniProgram() {
  const ua = window.navigator.userAgent
  return /miniProgram/i.test(ua)
}

/**
 * 判断当前环境是否为微信环境
 * @returns {boolean}
 */
export function isWechat() {
  return isWechatMiniProgram() || isWechatBrowser()
}

/**
 * 判断当前设备是否为 iOS 设备
 * @returns {boolean}
 */
export function isIOS() {
  const ua = window.navigator.userAgent
  return /iPad|iPhone|iPod/i.test(ua)
}

/**
 * 拉起微信小程序
 * @param {String} path 微信小程序页面路径
 * @param {Object} query 传递给微信小程序的参数
 */
export function openWechatMiniProgram(path, query = {}) {
  const WX_MP_APP_ID = import.meta.env.VITE_WX_MP_APP_ID
  const queryStr = new URLSearchParams(query).toString()
  location.href = `weixin://dl/business?appid=${WX_MP_APP_ID}&query=${queryStr}&path=${path}`
}
