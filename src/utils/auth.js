/**
 * 认证状态管理工具函数
 */

/**
 * 获取当前登录 token
 * @returns {string | null}
 */
export function getToken() {
  return localStorage.getItem('token');
}

/**
 * 检查用户是否已登录
 * @returns {boolean}
 */
export function isLoggedIn() {
  return !!getToken();
}

/**
 * 获取当前用户信息
 * @returns {object | null}
 */
export function getUserInfo() {
  const raw = localStorage.getItem('userInfo');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * 清除登录状态（退出登录）
 */
export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
}

/**
 * 解析 URL 中的 redirect 参数
 * 用于登录页登录成功后回跳
 * @returns {string} 跳转目标路径，默认为首页 /
 */
export function getRedirectUrl() {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  if (redirect && redirect.startsWith('/')) {
    return redirect;
  }
  return '/';
}
