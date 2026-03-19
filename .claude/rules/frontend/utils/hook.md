# 工具函数与 Hooks 规范

> 适用于 `src/utils/`、`src/api/` 以及业务组件中的工具函数、Hooks 封装。

## 1. API 工具 (`@/utils/request.js`)

### 核心功能
- 基于 Axios 封装
- 自动添加 `Authorization: Bearer {token}` 请求头
- 统一错误处理：401 → 清除 token → 跳转登录页
- 响应成功判断：`data.code === 0 || data.success`

### 使用方式
```javascript
import { http } from '@/utils/request'

// GET 请求
const res = await http.get('/nft', { page: 1, limit: 50 })

// POST 请求
const res = await http.post('/auth/login', { phone, verificationCode })

// PUT 请求
const res = await http.put(`/nft-instances/${id}`, data)

// DELETE 请求
const res = await http.delete('/nft-instances', { id })
```

### 响应数据结构约定
```javascript
// 成功
{ code: 0, data: {...}, message: '' }
// 或
{ success: true, data: {...} }

// 失败
{ code: 40001, message: '验证码错误' }
```

## 2. API 模块规范

### 文件命名
`src/api/` 下按业务域命名：
- `auth.js` - 用户认证
- `nft.js` - NFT 类型
- `nft.js` - NFT 实例
- `index.js` - 统一导出

### API 函数命名
| 函数名 | 说明 |
|--------|------|
| `getNftList` | 查询列表 |
| `getNftDetail` | 查询详情 |
| `createNftInstance` | 创建/上架 |
| `updateNftInstance` | 更新 |
| `deleteNftInstance` | 删除/下架 |
| `getMyNftInstances` | 查询我的资产 |

### 函数定义模板
```javascript
/**
 * [功能描述]
 * @param {Object} params - 请求参数
 * @param {string} [params.status] - 状态筛选
 * @param {string} params.page - 页码
 * @param {string} params.limit - 每页数量
 * @returns {Promise} [返回值描述]
 */
export function getNftList(params) {
  return http.get('/nft', params)
}
```

## 3. 数据格式化工具

### 价格格式化
```javascript
/**
 * 格式化价格显示
 * @param {number|string} price - 价格值
 * @returns {string} 格式化后的价格，如 "¥1,234"
 */
const formatPrice = (price) => {
  if (!price) return '¥0'
  const numPrice = parseFloat(price)
  if (isNaN(numPrice)) return '¥0'
  return `¥${numPrice.toLocaleString()}`
}
```

### 手机号验证
```javascript
/**
 * 验证手机号格式
 * @param {string} phone - 手机号
 * @returns {boolean} 是否合法
 */
const validatePhone = (phone) => /^1[3-9]\d{9}$/.test(phone)
```

## 4. 防抖工具（lodash-es）

```javascript
import { debounce } from 'lodash-es'

const debouncedSearch = debounce((keyword) => {
  debouncedSearchKeyword.value = keyword
}, 500)

watch(searchKeyword, (newValue) => {
  debouncedSearch(newValue)
})
```

注意：`debounce` 返回的函数不需要在 `onUnmounted` 中清理（它是纯函数）。

## 5. 计时器管理

### 标准模式
```javascript
const timer = ref(null)

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
})
```

### 倒计时场景
```javascript
const countdown = ref(0)
const timer = ref(null)

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

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
})
```

### setTimeout 清理
```javascript
const delayTimer = ref(null)

const showWithAutoHide = () => {
  delayTimer.value = setTimeout(() => {
    // 自动隐藏逻辑
  }, 3000)
}

onUnmounted(() => {
  if (delayTimer.value) {
    clearTimeout(delayTimer.value)
    delayTimer.value = null
  }
})
```

## 6. 数据处理工具

### 空值过滤
```javascript
const filterEmptyData = (obj) => {
  const result = {}
  Object.keys(obj).forEach(key => {
    if (obj[key] !== '' && obj[key] !== null && obj[key] !== undefined) {
      result[key] = obj[key]
    }
  })
  return result
}
```

### 列表数据兼容处理
API 返回格式可能不一致，需要兼容：

```javascript
const loadNftList = async () => {
  try {
    const response = await getNftList(params)

    // 兼容数组格式
    if (Array.isArray(response)) {
      nftList.value = response
    }
    // 兼容分页格式
    else if (response?.list) {
      nftList.value = response.list
      totalCount.value = response.total || response.list.length
    }
    // 兜底
    else {
      nftList.value = []
    }
  } catch (error) {
    nftList.value = []
  }
}
```

## 7. 环境变量使用

```javascript
// 获取 API 前缀
const API_PREFIX = import.meta.env.VITE_API_PREFIX

// 获取极验 captchaId
const captchaId = import.meta.env.VITE_GEETEST_LOGIN_ID
```

环境变量需在 `.env` 文件中定义：
```
VITE_API_PREFIX=/api
VITE_GEETEST_LOGIN_ID=your_geetest_id
```

## 8. 路由守卫（Token 校验）

当前项目在 `src/utils/request.js` 的响应拦截器中统一处理 401。
如需在路由层面校验登录状态，可在 `src/router/index.js` 中添加全局前置守卫：

```javascript
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})
```

## 9. 常用 Vant 工具函数

```javascript
import {
  showToast,        // 轻提示
  showLoadingToast, // 加载提示
  closeToast,       // 关闭轻提示
  showDialog,       // 弹出框
  showConfirmDialog // 确认对话框
} from 'vant'
```

### Toast 使用
```javascript
showToast('操作成功')
showToast({ message: '保存成功', position: 'bottom' })
showLoadingToast({ message: '加载中...', forbidClick: true })
closeToast()
```

### Dialog 使用
```javascript
showDialog({
  title: '确认删除',
  message: '删除后无法恢复，是否确认？',
  confirmButtonText: '删除',
  showCancelButton: true
}).then(() => {
  // 确认
}).catch(() => {
  // 取消
})
```

## 10. 极验 SDK 加载

```javascript
onMounted(async () => {
  if (!window.initGeetest4) {
    await import('https://static.geetest.com/v4/gt4.js')
  }
  initGeetest4({ captchaId }, (captcha) => {
    captcha.appendTo('#container')
    captcha.onSuccess(() => {
      const validate = captcha.getValidate()
      // 提交验证
    })
  })
})

// 销毁
onUnmounted(() => {
  if (geetestCaptcha.value?.destroy) {
    geetestCaptcha.value.destroy()
  }
})
```
