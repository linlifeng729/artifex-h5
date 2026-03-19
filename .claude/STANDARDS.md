# Artifex-H5 编码标准

## 1. 格式化与缩进

- **缩进**：2 空格（不使用 Tab）
- **行尾**：无多余空白字符
- **文件编码**：UTF-8
- **单行最大长度**：120 字符（可适当超出）

## 2. 命名规范

### 文件命名
- Vue 组件：`PascalCase.vue`（如 `MarketOverview.vue`）
- JS 工具模块：`kebab-case.js`（如 `request.js`）
- API 模块：`kebab-case.js`（如 `auth.js`）

### 变量与函数
- 普通变量/函数：`camelCase`（如 `searchKeyword`、`handleLogin`）
- Props：`camelCase`，带类型声明和默认值
- 布尔值：`is`/`has`/`can` 前缀（如 `isLoading`、`canSubmit`）
- 常量：`UPPER_SNAKE_CASE`（如 `MAX_RETRY_COUNT`）
- Timer 变量：`xxxTimer` 后缀（如 `countdownTimer`）

### 组件命名
- 文件名：`PascalCase.vue`
- 模板中使用：PascalCase（如 `<MarketOverview />`）

## 3. Vue 3 组合式 API 规范

### script setup 结构顺序
```javascript
// 1. 导入
import { ref, computed, onMounted, watch } from 'vue'
import { showToast } from 'vant'
import { getNftList } from '@/api/nft'

// 2. Props / Emits / Expose
const props = defineProps({ ... })
const emit = defineEmits(['update:show'])
defineExpose({ refresh })

// 3. 响应式状态（ref/reactive）
const loading = ref(false)
const nftList = ref([])

// 4. 计算属性
const canLogin = computed(() => verificationCode.value.length === 6)

// 5. 方法
const handleLogin = async () => { ... }

// 6. 生命周期 + 副作用
onMounted(() => { ... })
watch(() => props.searchKeyword, (newVal) => { ... })

// 7. 清理（onUnmounted）
onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})
```

### 响应式 API 选择
- 原始类型（number/string/boolean）：`ref()`
- 对象/数组：`ref()`（比 `reactive()` 更安全，避免解构丢失响应式）
- 仅在组件间传递的大型对象且不需要解构时：可考虑 `reactive()`

### 定时器清理
```javascript
const timer = ref(null)

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
})
```

## 4. 导入顺序

```javascript
// 1. Vue 核心
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// 2. 第三方库（Vue 生态除外）
import axios from 'axios'
import { debounce } from 'lodash-es'
import { showToast, showDialog } from 'vant'

// 3. 路由
import { useRouter, useRoute } from 'vue-router'

// 4. 本项目工具/常量
import { http } from '@/utils/request'

// 5. 本项目 API
import { getNftList } from '@/api/nft'
import { login } from '@/api/auth'

// 6. 本项目组件
import TopHeader from '@/components/TopHeader.vue'
import EmptyState from '@/components/EmptyState.vue'

// 7. 本项目视图/页面（仅在必要时）
// import SomePage from '@/views/SomePage.vue'
```

## 5. API 层规范

### 文件结构（`src/api/xxx.js`）
```javascript
/**
 * [模块名称]相关API
 */
import { http } from '@/utils/request'

/**
 * 函数描述
 * @param {Object} params - 请求参数
 * @param {string} [params.xxx] - 参数说明（可选）
 * @returns {Promise} 请求结果
 */
export function getXxxList(params) {
  return http.get('/xxx', params)
}

export function getXxxDetail(id) {
  return http.get(`/xxx/${id}`)
}
```

### 在 `index.js` 中统一导出
```javascript
// src/api/index.js
export { getXxxList, getXxxDetail } from './xxx'
export { login, sendVerificationCode } from './auth'
// ...按模块分组，每组之间空行分隔
```

## 6. 错误处理规范

### 异步操作
```javascript
const loadData = async () => {
  try {
    loading.value = true
    const res = await getNftList(params)
    nftList.value = res?.list || res || []
  } catch (error) {
    console.error('加载失败:', error)
    showToast(error.message || '加载失败，请重试')
  } finally {
    loading.value = false
  }
}
```

### 禁用按钮防抖
```javascript
// 在异步操作完成前保持按钮禁用状态
const handleSubmit = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    await doSubmit()
  } finally {
    isSubmitting.value = false
  }
}
```

## 7. 样式规范

### Tailwind CSS 使用原则
- 优先使用 Tailwind 类名处理：布局（flex/grid）、间距（m-/p-）、颜色（text-/bg-）、响应式断点
- 避免在模板中写过多行内样式（超过 3 个 style 属性时考虑抽取样式类）
- 使用 `class` 而非 `className`

### scoped 样式
- 组件私有样式写在 `<style scoped>`
- 避免使用 `!important`
- 深层选择器（:deep()）仅在覆盖第三方组件样式时使用

### 全局样式
- `src/assets/css/style.css` 作为 Tailwind 入口文件
- Vant 组件样式覆盖、极验样式覆盖等全局规则放此处

## 8. 表单验证

### 手机号
```javascript
const validatePhone = (phone) => /^1[3-9]\d{9}$/.test(phone)
```

### 验证码
- 长度为 6 位数字
- `maxlength="6"` 限制输入

## 9. localStorage 使用规范

```javascript
// 存储
localStorage.setItem('token', result.token)
localStorage.setItem('userInfo', JSON.stringify(userInfo))

// 读取
const token = localStorage.getItem('token')
const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

// 清除
localStorage.removeItem('token')
localStorage.removeItem('userInfo')
```

## 10. JSDoc 注释规范

### API 函数
```javascript
/**
 * 查询商品类型列表
 * @param {Object} params - 查询参数
 * @param {string} [params.status] - 状态 active|inactive
 * @param {string} params.page - 页码
 * @param {string} params.limit - 每页数量
 * @param {string} [params.sort] - 排序方式 latest|price_low_to_high|price_high_to_low
 * @returns {Promise} 商品类型列表
 */
export function getNftList(params) { ... }
```

### 复杂工具函数
```javascript
/**
 * 格式化价格显示
 * @param {number|string} price - 价格值
 * @returns {string} 格式化后的价格字符串，如 "¥1,234"
 */
export function formatPrice(price) { ... }
```
