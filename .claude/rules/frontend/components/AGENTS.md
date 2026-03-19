# 组件使用规范

> 适用于 `src/components/` 下的所有通用组件，以及 `src/views/` 下所有业务组件。

## 1. 组件文件规范

- **文件名**：`PascalCase.vue`（如 `MarketOverview.vue`、`LoadingState.vue`）
- **模板中引用**：PascalCase（如 `<MarketOverview />`）
- **路径别名**：`@/components/xxx`

## 2. script setup 规范

### 必须包含的要素

```vue
<script setup>
// 按 @.claude/rules/frontend/code-style.md 中的导入顺序组织

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { showToast } from 'vant'

// Props
const props = defineProps({
  visible: { type: Boolean, default: true },
  text: { type: String, default: '加载中...' },
  icon: { type: String, default: '⏳' }
})

// Emits
const emit = defineEmits(['update:visible', 'confirm'])

// Expose（按需）
defineExpose({ refresh })
</script>
```

## 3. Props 定义

### 单值 Props
```javascript
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: '加载中...'
  },
  icon: {
    type: String,
    default: '⏳'
  }
})
```

### v-model Props
使用 `update:modelValue` 模式：

```javascript
const props = defineProps({
  modelValue: {
    type: String,
    default: 'bourse'
  }
})

const emit = defineEmits(['update:modelValue'])

// 使用
emit('update:modelValue', newValue)
```

模板中：`<Component v-model="currentTabValue" />`

### 数组/对象 Props
```javascript
const props = defineProps({
  tabs: {
    type: Array,
    default: () => [
      { name: '交易所', value: 'bourse' },
      { name: '我的资产', value: 'collection' }
    ]
  },
  categoryId: {
    type: [String, Number],
    default: null
  }
})
```

## 4. 状态组件规范

### LoadingState.vue
用于显示加载中状态：

```html
<LoadingState :visible="loading" text="加载中..." icon="⏳" />
```

Props：
| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | Boolean | true | 控制显示 |
| text | String | '加载中...' | 加载文本 |
| icon | String | '⏳' | emoji 图标 |

### EmptyState.vue
用于显示空数据占位：

```html
<EmptyState
  :visible="!loading && nftList.length === 0"
  description="您还没有任何藏品，快去市场看看吧"
  icon="📦"
/>
```

Props：
| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | Boolean | true | 控制显示 |
| description | String | '' | 空状态描述文本 |
| icon | String | '📦' | emoji 图标 |

## 5. 交互反馈规范

所有用户操作反馈统一使用 Vant `showToast`：

```javascript
import { showToast } from 'vant'

// 成功
showToast('操作成功')

// 失败（优先显示后端 message）
showToast(error.message || '操作失败')

// 提示
showToast('功能即将上线，敬请期待')
```

### 异步操作反馈
```javascript
const handleSubmit = async () => {
  try {
    showLoadingToast('提交中...')
    await submitData()
    showToast('提交成功')
  } catch (error) {
    showToast(error.message || '提交失败，请重试')
  } finally {
    closeToast()
  }
}
```

## 6. 通用组件清单

### TopHeader.vue
顶部导航栏组件，支持 Tab 切换。

```html
<TopHeader v-model="currentTabValue" :tabs="headerTabs" />
```

Props：
| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | String | 'bourse' | 当前选中 Tab 值 |
| tabs | Array | 见下方 | Tab 配置数组 |

Tabs 默认值：
```javascript
[
  { name: '交易所', value: 'bourse' },
  { name: '我的资产', value: 'collection' }
]
```

### BottomNav.vue
底部导航栏组件，固定 5 个导航项。

```html
<BottomNav />
```

无 Props。路由跳转通过 `useRouter` 实现。

### CategoryDrawer.vue
分类侧边抽屉（van-popup）。

```html
<CategoryDrawer
  v-model:show="drawerVisible"
  :category-id="selectedCategoryId"
  :category-name="selectedCategoryName"
  @sub-category-click="handleSubCategoryClick"
/>
```

Props：
| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| show | Boolean | false | 控制显示 |
| categoryId | String/Number | null | 一级分类 ID |
| categoryName | String | '' | 一级分类名称 |

Events：
| Event | 参数 | 说明 |
|-------|------|------|
| 'update:show' | Boolean | 关闭时触发 |
| 'sub-category-click' | Object | 点击二级分类时触发 |

## 7. 组件拆分原则

### 拆分时机
- 组件超过 200 行考虑拆分
- 多个视图共享的 UI 逻辑抽取为组件
- 同一组件被修改的诱因超过 2 个时考虑拆分

### 拆分方式
- 列表项单元抽取为独立组件（如 `NftListItem.vue`）
- 弹层/抽屉独立为组件（`CategoryDrawer.vue`）
- 状态 UI 独立为组件（`LoadingState.vue`、`EmptyState.vue`）

## 8. 样式规范

### scoped 使用
- 所有组件样式必须加 `scoped`
- 避免全局污染

### 样式顺序
```css
<style scoped>
/* 1. 布局 */
.selector-tabs {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 2. 尺寸 */
.crypto-list {
  width: 100%;
  height: 75px;
}

/* 3. 外观 */
.crypto-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 4. 动效 */
.selector-tab {
  transition: color 0.3s;
}

.category-card:active {
  transform: scale(0.98);
}

/* 5. 状态 */
.nav-item-active span {
  color: #FFD700;
}
</style>
```

### 覆盖第三方组件样式
使用 `:deep()` 选择器：

```css
<style scoped>
:deep(.van-popup) {
  background: rgba(26, 26, 46, 0.95) !important;
}
</style>
```

## 9. 组件测试自检清单

- [ ] Props 有类型声明和默认值
- [ ] v-model 双向绑定使用 `update:modelValue`
- [ ] 异步操作有 loading 状态反馈
- [ ] 空数据有 EmptyState 占位
- [ ] 定时器在 onUnmounted 中清理
- [ ] 错误通过 showToast 反馈
- [ ] 样式已加 scoped
