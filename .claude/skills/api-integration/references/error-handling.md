# 错误处理规范

本文档定义 Artifex-H5 项目中接口错误的处理模式。

## 目录

- [错误分类](#错误分类)
- [HTTP 拦截器处理](#http-拦截器处理)
- [业务错误处理](#业务错误处理)
- [组件级错误处理](#组件级错误处理)
- [常见错误场景](#常见错误场景)

---

## 错误分类

### Level 1: HTTP 状态码错误（拦截器处理）

| HTTP 状态码 | 含义 | 处理方式 |
|-------------|------|----------|
| 401 | Token 过期/无效 | 清除 token，跳转登录页 |
| 403 | 无权限 | 提示用户无权限 |
| 404 | 接口不存在 | 提示系统异常 |
| 500 | 服务器错误 | 提示服务异常 |
| 网络错误 | 请求失败 | 提示网络异常 |

### Level 2: 业务错误码（代码逻辑处理）

| 业务场景 | 错误码示例 | 处理方式 |
|----------|------------|----------|
| 余额不足 | `code: 1001` | 提示余额不足，引导充值 |
| 库存不足 | `code: 1002` | 提示已被购买 |
| 重复购买 | `code: 1003` | 提示已拥有该藏品 |
| 风控拦截 | `code: 2001` | 提示交易受限 |

### Level 3: 前端校验错误（表单验证）

| 错误类型 | 示例 | 处理方式 |
|----------|------|----------|
| 必填项 | 手机号为空 | 输入框提示 |
| 格式错误 | 手机号格式不对 | 输入框提示 |
| 长度超限 | 验证码超过6位 | 自动截断/提示 |

---

## HTTP 拦截器处理

在 `src/utils/request.js` 中统一处理：

```javascript
// 响应拦截器
http.interceptors.response.use(
  (response) => {
    const { data } = response
    // 业务错误码判断
    if (data.code !== 0 && data.success !== true) {
      return Promise.reject(new Error(data.message || '操作失败'))
    }
    return data
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Token 过期
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          window.location.href = '/login'
          return Promise.reject(new Error('登录已过期，请重新登录'))
        case 403:
          return Promise.reject(new Error('无权限访问'))
        case 404:
          return Promise.reject(new Error('接口不存在'))
        case 500:
          return Promise.reject(new Error('服务器异常'))
        default:
          return Promise.reject(new Error('网络异常，请稍后重试'))
      }
    }
    // 网络错误（无响应）
    return Promise.reject(new Error('网络连接失败，请检查网络'))
  }
)
```

---

## 业务错误处理

### 通用模式

```javascript
import { showToast } from 'vant'

/**
 * 统一的错误处理函数
 * @param {Error|string} error - 错误对象或错误信息
 * @param {Object} options - 配置选项
 * @param {boolean} [options.showTip=true] - 是否显示提示
 * @param {Function} [options.onTokenExpired] - Token 过期回调
 */
export const handleApiError = (error, options = {}) => {
  const { showTip = true, onTokenExpired } = options
  const message = error.message || String(error)

  // Token 过期特殊处理
  if (message.includes('登录已过期')) {
    onTokenExpired?.()
    return
  }

  if (showTip) {
    showToast(message)
  }
}
```

### 支付场景

```javascript
/**
 * 支付错误处理
 * @param {string} code - 业务错误码
 * @param {string} message - 错误信息
 */
export const handlePayError = (code, message) => {
  const errorTips = {
    1001: '余额不足，请先充值',
    1002: '该藏品已被他人购买',
    1003: '您已拥有该藏品',
    2001: '交易存在风险，请稍后重试',
  }
  showToast(errorTips[code] || message || '支付失败')
}

// 使用示例
const handlePay = async () => {
  try {
    const res = await createWechatPayOrder({ orderId })
    // 调起支付
    wx.chooseWXPay({ ...res.data })
  } catch (error) {
    // 业务错误码优先
    if (error.code) {
      handlePayError(error.code, error.message)
    } else {
      showToast(error.message || '支付创建失败')
    }
  }
}
```

### 列表加载场景

```javascript
const loadNftList = async () => {
  loading.value = true
  empty.value = false
  error.value = null

  try {
    const res = await getNftList({ page: page.value, pageSize: 20 })
    if (res.data.list.length === 0) {
      empty.value = true
    } else {
      nftList.value = [...nftList.value, ...res.data.list]
    }
  } catch (error) {
    error.value = error.message
    showToast(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}
```

---

## 组件级错误处理

### 标准 try-catch 结构

```javascript
import { showToast, showLoadingToast, closeToast } from 'vant'

const submitForm = async () => {
  // 1. 表单校验
  if (!phone.value) {
    showToast('请输入手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    showToast('手机号格式不正确')
    return
  }

  // 2. 显示 loading
  showLoadingToast({ message: '提交中...', forbidClick: true })

  try {
    // 3. 调用接口
    const res = await submitOrder(formData)

    // 4. 成功处理
    showToast('提交成功')
    router.push('/success')

  } catch (error) {
    // 5. 错误处理 - 业务错误码优先
    if (error.code) {
      // 业务错误
      showToast(error.message || '操作失败')
    } else if (error.message) {
      // 系统错误
      showToast(error.message)
    } else {
      showToast('系统异常')
    }
  } finally {
    // 6. 关闭 loading（无论成功失败）
    closeToast()
  }
}
```

### 禁止的错误处理方式

```javascript
// ❌ 错误：吞掉错误不处理
const badExample = async () => {
  try {
    await apiCall()
  } catch (e) {
    // 什么也不做
  }
}

// ❌ 错误：只 console.error 不给用户反馈
const badExample2 = async () => {
  try {
    await apiCall()
  } catch (e) {
    console.error(e)  // 开发调试可以，但用户看不到
    showToast('操作失败')  // 应该有具体错误信息
  }
}

// ❌ 错误：暴露内部错误详情给用户
const badExample3 = async () => {
  try {
    await apiCall()
  } catch (e) {
    showToast(`错误: ${e.stack}`)  // 暴露内部信息
  }
}

// ✅ 正确：统一错误处理 + 用户友好提示
const goodExample = async () => {
  try {
    await apiCall()
    showToast('操作成功')
  } catch (e) {
    handleApiError(e)
  }
}
```

---

## 常见错误场景

### 场景 1: 分页加载失败重试

```javascript
const loadMore = async () => {
  if (loading.value || !hasMore.value) return

  page.value++
  loading.value = true

  try {
    const res = await getNftList({ page: page.value })
    nftList.value.push(...res.data.list)
    hasMore.value = res.data.list.length === 20
  } catch (e) {
    page.value--  // 回滚页码
    showToast('加载失败，点击重试')
  } finally {
    loading.value = false
  }
}
```

### 场景 2: 表单提交防抖

```javascript
import { debounce } from 'lodash-es'

const submitForm = debounce(async () => {
  if (submitting.value) return
  submitting.value = true

  try {
    await saveUserInfo(formData)
    showToast('保存成功')
  } catch (e) {
    showToast(e.message || '保存失败')
  } finally {
    submitting.value = false
  }
}, 500, { leading: true, trailing: false })
```

### 场景 3: 支付回调处理

```javascript
// 支付结果轮询
const pollPayResult = async (orderId) => {
  const maxAttempts = 10
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      const res = await getPayResult({ orderId })
      if (res.data.status === 'paid') {
        showToast('支付成功')
        router.push('/order-detail/' + orderId)
        return
      }
    } catch (e) {
      // 轮询中忽略错误，继续尝试
    }

    attempts++
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  showToast('支付结果查询超时，请稍后查看')
}
```

### 场景 4: 文件上传错误

```javascript
const uploadImage = async (file) => {
  if (file.size > 5 * 1024 * 1024) {
    showToast('图片大小不能超过 5MB')
    return
  }

  const formData = new FormData()
  formData.append('file', file)

  try {
    showLoadingToast({ message: '上传中...' })
    const res = await uploadFile(formData)
    showToast('上传成功')
    return res.data.url
  } catch (e) {
    showToast(e.message || '上传失败')
    return null
  }
}
```
