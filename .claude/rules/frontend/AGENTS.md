# Artifex-H5 前端规则系统

> 本项目技术栈：Vue 3 (Composition API) + Vite + Vant 4 + Tailwind CSS v4 + Axios + Vue Router 4

## 目录结构

```
src/
├── api/              # API 层规范
├── components/       # 通用组件规范
├── router/          # 路由规范
├── utils/           # 工具函数规范
├── views/           # 页面规范
└── assets/css/      # 样式规范
```

## 核心规范索引

| 规范 | 文件 |
|------|------|
| 代码风格 | @.claude/rules/frontend/code-style.md |
| 组件规范 | @.claude/rules/frontend/components/AGENTS.md |
| 工具函数 | @.claude/rules/frontend/utils/hook.md |
| 编码标准 | @.claude/STANDARDS.md |

## 1. Vue 3 组合式 API 核心规则

### script setup 必须遵循的结构

```javascript
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  searchKeyword: { type: String, default: '' }
})

// Emits
const emit = defineEmits(['update:show'])

// Expose（页面级组件需要暴露刷新方法供父组件调用）
defineExpose({
  refresh: () => loadData()
})

// 响应式状态
const loading = ref(false)
const nftList = ref([])

// 计算属性
const hasData = computed(() => nftList.value.length > 0)

// 方法
const loadData = async () => { ... }

// 生命周期
onMounted(() => { loadData() })

// 清理
onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
  timer.value = null
})
</script>
```

### ref vs reactive 选择原则
- **统一使用 `ref()`**：无论是原始类型还是对象/数组
- `ref()` 对象通过 `.value` 访问（模板中自动解包）
- 避免 `reactive()` + 解构（会丢失响应式）

### 计时器必须清理
```javascript
// ❌ 错误：计时器未清理
onMounted(() => {
  timer.value = setInterval(...)
})

// ✅ 正确：onUnmounted 中清理
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
})
```

## 2. API 层规范

### 按业务域拆分
- `src/api/auth.js` - 登录、验证码
- `src/api/nft.js` - NFT 类型列表/详情
- `src/api/nft.js` - NFT 实例上下架/我的资产
- `src/api/index.js` - 统一导出

### 请求工具 (`@/utils/request`)
```javascript
import { http } from '@/utils/request'
// http.get / http.post / http.put / http.delete
```

### 响应判断
- `data.code === 0 || data.success` → 成功
- 非 0 / HTTP 错误 → `Promise.reject`

### 401 处理
请求拦截器自动添加 `Authorization: Bearer {token}`，响应拦截器处理 401：
- 清除 `localStorage.token`
- `window.location.href = '/login'`

## 3. 状态组件使用规范

| 场景 | 组件 | 导入 |
|------|------|------|
| 加载中 | `<LoadingState :visible="loading" />` | `@/components/LoadingState` |
| 空数据 | `<EmptyState :visible="isEmpty" description="提示文案" />` | `@/components/EmptyState` |
| Toast 提示 | `showToast('消息')` | `vant` |
| 弹窗确认 | `showDialog({ title, message })` | `vant` |

## 4. 极验滑块验证规范

### 初始化
```javascript
// 在 onMounted 中动态加载极验 SDK
onMounted(async () => {
  if (!window.initGeetest4) {
    await import('https://static.geetest.com/v4/gt4.js')
  }
})
```

### 使用流程
1. 容器节点 `<div id="geetest-captcha-container" />` 准备好
2. 调用 `initGeetest4({ captchaId: envId }, callback)`
3. `captcha.appendTo('#geetest-captcha-container')`
4. 验证成功后 `captcha.getValidate()` 获取验证数据
5. 随验证码请求一起发送到后端
6. 组件销毁时 `captcha.destroy()`

## 5. localStorage 使用规范

```javascript
// 存
localStorage.setItem('token', result.token)
localStorage.setItem('userInfo', JSON.stringify(userInfo))

// 取
const token = localStorage.getItem('token')
const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

// 删（401 时）
localStorage.removeItem('token')
localStorage.removeItem('userInfo')
```

## 6. 路由规范

- 使用懒加载：`component: () => import('@/views/Page.vue')`
- 404 放在路由数组末尾：`path: '/:pathMatch(.*)*'`
- 页面切换用 `router.push()` 或 `router.replace()`
- 登录后用 `router.replace('/')` 替换历史记录（防止返回登录页）

## 7. 样式规范

- **Tailwind CSS**：布局、间距、响应式优先
- **`<style scoped>`**：组件私有样式
- **`src/assets/css/style.css`**：Tailwind 入口 + 全局覆盖（Vant 覆盖、极验样式等）
- 避免 `!important`，优先使用 Tailwind 的任意值变体（如 `[color:#xxx]`）
- 深色玻璃态主题：背景用 `rgba(255,255,255,0.1)` + `backdrop-filter: blur(10px)` + 白色半透明边框

## 8. 表单验证规范

```javascript
// 手机号
/^1[3-9]\d{9}$/

// 验证码：6位数字，maxlength="6" 限制
```

## 9. 错误处理规范

- 所有 async 函数使用 `try/catch`
- 错误提示通过 `showToast(error.message || '操作失败')`
- 禁止在用户界面暴露内部错误详情
- 在 `finally` 中关闭 loading 状态
- `console.error` 仅用于开发调试

## 10. 性能注意事项

- 列表渲染使用 `v-if` 避免不必要的 DOM 切换
- `lodash-es` 的 `debounce`/`throttle` 用于高频搜索输入
- 大列表考虑虚拟滚动（当前项目数据量较小，暂不需要）
- 图片使用 `backgroundImage` + `backgroundSize: cover` 实现填充
