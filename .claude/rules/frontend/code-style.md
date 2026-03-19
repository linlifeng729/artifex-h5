# 前端代码风格规范

## 缩进与格式

- **缩进**：2 空格（不得使用 Tab）
- **字符串**：单引号优先（模板字符串仅在必要时使用）
- **分号**：每条语句末尾加分号
- **末尾逗号**：多行对象/数组最后一项保留尾随逗号

## 命名约定

### 文件
| 类型 | 规则 | 示例 |
|------|------|------|
| Vue 组件 | PascalCase | `MarketOverview.vue` |
| JS 模块 | kebab-case | `request.js` |
| API 模块 | kebab-case | `nft-instances.js` |
| CSS 样式 | kebab-case | `style.css` |

### 变量
| 类型 | 规则 | 示例 |
|------|------|------|
| 普通变量 | camelCase | `searchKeyword` |
| 布尔值 | is/has/can 前缀 | `isLoading`、`canSubmit`、`hasError` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 计时器 | xxxTimer 后缀 | `countdownTimer` |
| ref 对象 | xxxRef 后缀（可选，统一 ref() 命名） | `marketOverviewRef` |

### 组件（模板中）
使用 PascalCase：
```html
<MarketOverview />
<TopHeader />
<EmptyState />
```

## 导入顺序（必须严格遵守）

```javascript
// 1. Vue 核心
import { ref, reactive, computed, watch } from 'vue'
import { onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

// 2. 第三方库 - Vue 生态除外
import { debounce, throttle } from 'lodash-es'
import { showToast, showDialog, showLoadingToast, closeToast } from 'vant'

// 3. Vue Router
import { useRouter, useRoute } from 'vue-router'

// 4. 本项目工具/常量
import { http } from '@/utils/request'

// 5. 本项目 API
import { getNftList } from '@/api/nft'
import { login } from '@/api/auth'

// 6. 本项目组件
import TopHeader from '@/components/TopHeader.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
```

每组之间空一行分隔。

## Vue 模板规范

### 属性顺序
1. `v-if` / `v-show`
2. `v-for`（避免与 `v-if` 同级使用，需列表数据先过滤）
3. `v-model`
4. `ref`
5. `v-bind` / `:prop`
6. 事件 `@click`
7. 其他指令

### 指令使用
- `v-if` vs `v-show`：频繁切换用 `v-show`，条件很少变化用 `v-if`
- `v-for` 必须配合 `:key`，优先使用数据唯一 id
- `v-model` 双向绑定表单

### 模板中的表达式
- 避免模板中写复杂逻辑，封装为 computed 或 method
- 三元表达式控制在 2 层以内

## 注释规范

### JSDoc（必须为所有 API 函数添加）
```javascript
/**
 * 查询商品类型列表
 * @param {Object} params - 查询参数
 * @param {string} [params.status] - 状态 active|inactive
 * @param {string} params.page - 页码
 * @param {string} params.limit - 每页数量
 * @param {string} [params.sort] - 排序方式
 *   - latest: 最新发布
 *   - price_low_to_high: 价格升序
 *   - price_high_to_low: 价格降序
 * @returns {Promise} 商品类型列表
 */
export function getNftList(params) { ... }
```

### 行内注释
仅在代码意图不明显时添加，不解释"做什么"（代码本身已说明），而解释"为什么这样做"。

## localStorage 规范

```javascript
// 存储对象必须 JSON 序列化
localStorage.setItem('userInfo', JSON.stringify(userInfo))

// 读取时提供默认值防止 parse 报错
const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

// 删除
localStorage.removeItem('token')
localStorage.removeItem('userInfo')

// 禁止在 localStorage 中存储大量数据
// 禁止存储敏感明文信息（token 本身由后端控制生命周期）
```

## 函数规范

### async/await 使用
- 优先使用 `async/await`，避免 `.then().catch()` 链
- `try/catch` 包裹所有 async 调用
- `finally` 用于清理 loading 状态

### 函数命名
| 操作类型 | 命名模式 | 示例 |
|----------|----------|------|
| 事件处理 | handleXxx | `handleLogin`、`handleTabClick` |
| 加载数据 | loadXxx / fetchXxx | `loadNftList`、`fetchMyAssets` |
| 格式化 | formatXxx | `formatPrice`、`formatDate` |
| 校验 | validateXxx | `validatePhone` |
| 清除 | clearXxx / resetXxx | `handleClearSearch` |
| 切换 | toggleXxx | `toggleAgreement` |

## Props 定义规范

```javascript
// ✅ 正确：包含类型、默认值、说明
const props = defineProps({
  searchKeyword: {
    type: String,
    default: ''
  },
  visible: {
    type: Boolean,
    default: false
  },
  categoryId: {
    type: [String, Number],
    default: null
  }
})

// ❌ 错误：无类型无默认值
const props = defineProps(['searchKeyword'])
```

## Emits 定义规范

```javascript
// ✅ 正确
const emit = defineEmits(['update:show', 'confirm', 'cancel'])

// 触发
emit('update:show', false)
emit('confirm', selectedItem)
```

## Expose 定义规范

页面级组件暴露刷新方法供父组件调用：

```javascript
// 子组件
defineExpose({
  refresh: () => loadData(),
  loadData: (keyword) => loadData(keyword)
})

// 父组件
const marketOverviewRef = ref(null)
marketOverviewRef.value?.refresh()
```
