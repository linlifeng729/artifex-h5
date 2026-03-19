# Artifex-H5 项目开发规范

Artifex 移动端 NFT 数字藏品交易平台 H5 应用。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 (Composition API) | ^3.5.30 |
| 构建工具 | Vite | ^7.0.0 |
| UI 组件库 | Vant | ^4.9.22 |
| CSS 方案 | Tailwind CSS v4 + 原生 CSS | ^4.2.1 |
| 路由 | Vue Router | ^4.6.4 |
| HTTP 客户端 | Axios | ^1.13.6 |
| 工具库 | Lodash-es | ^4.17.23 |

## 项目结构

```
src/
├── api/                    # API 模块（按业务域拆分）
│   ├── auth.js             # 用户认证（登录、验证码）
│   ├── nft.js              # NFT 商品类型（列表、详情）
│   ├── nft.js      # NFT 商品实例（上下架、我的资产）
│   └── index.js            # 统一导出入口
├── components/             # 通用组件
│   ├── TopHeader.vue        # 顶部导航栏
│   ├── BottomNav.vue        # 底部导航
│   ├── LoadingState.vue     # 加载状态
│   └── EmptyState.vue       # 空状态占位
├── router/                # 路由配置
│   └── index.js
├── utils/                 # 工具函数
│   └── request.js          # Axios 封装（含拦截器）
├── views/                 # 页面视图
│   ├── Home/               # 首页（含多个子组件）
│   │   ├── index.vue       # 首页容器（交易所/我的资产）
│   │   └── components/
│   │       ├── MarketOverview.vue  # 交易所行情
│   │       ├── MyAssets.vue        # 我的资产
│   │       ├── CategoryList.vue    # 商品分类（开发中）
│   │       └── CategoryDrawer.vue  # 分类侧边抽屉
│   └── Login.vue           # 登录页（含极验滑块）
├── assets/css/
│   └── style.css           # 全局样式（Tailwind 入口 + 覆盖样式）
├── App.vue                 # 根组件
└── main.js                 # 应用入口
```

## 开发命令

```bash
npm run dev        # 开发服务器
npm run dev:prod   # 生产模式开发服务器
npm run build      # 生产构建
npm run preview    # 预览构建产物
```

## 核心规范

### 路径别名
使用 `@` 指向 `src` 目录：
```javascript
import { http } from '@/utils/request'
import TopHeader from '@/components/TopHeader.vue'
```

### API 请求层
所有 API 统一封装在 `src/api/` 下，按业务域拆分模块（auth、nft、nftInstances 等）。
使用 `src/utils/request.js` 封装的 `http` 对象：
- 自动携带 `Authorization: Bearer {token}`
- 响应成功判断：`data.code === 0 || data.success`
- 401 自动跳转登录页

### 响应数据规范
- 成功：`{ code: 0, data: {...} }` 或 `{ success: true, data: {...} }`
- 失败：`{ code: 非0, message: '错误信息' }`
- HTTP 401：Token 过期，自动清除 token 并跳转 `/login`

### 环境变量
| 变量名 | 说明 |
|--------|------|
| `VITE_API_PREFIX` | API 基础路径（代理前缀） |
| `VITE_GEETEST_LOGIN_ID` | 极验登录 captchaId |

### UI 规范
- 视觉风格：深色玻璃态（Glassmorphism），深色背景 + 毛玻璃效果
- 主色调：`#3cb371`（极客绿）
- 辅助色：蓝紫渐变用于标题装饰
- 图标：使用 emoji 代替图片资源
- 字体：系统字体栈，移动端优先

### 组件规范
- 使用 `<script setup>` 语法
- Props 使用 `defineProps`，带类型和默认值
- 暴露方法用 `defineExpose`
- 异步操作需处理 loading 状态
- 定时器在 `onUnmounted` 中清理
- 错误通过 `showToast` 反馈给用户

## 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 交易所 / 我的资产 Tab |
| `/login` | 登录页 | 手机号 + 验证码登录 |
| `/:pathMatch(.*)*` | 404 重定向 | 兜底到首页 |

## 认证流程

1. 登录页输入手机号 → 点击"发送"触发极验滑块验证
2. 滑块验证通过 → 调用 `/auth/send/verificationcode` 发送验证码
3. 用户输入 6 位验证码 → 调用 `/auth/login` 登录
4. 登录成功返回 `token`，存储到 `localStorage`
5. 后续请求自动在请求头中携带 `Authorization: Bearer {token}`
6. Token 失效（401）→ 自动清除 token 并重定向到登录页

## 常见任务

### 新增 API 模块
1. 在 `src/api/` 创建 `xxx.js`
2. 从 `@/utils/request` 导入 `http`
3. 导出命名函数（附 JSDoc 注释）
4. 在 `src/api/index.js` 中统一导出

### 新增页面
1. 在 `src/views/` 下创建 `.vue` 文件
2. 在 `src/router/index.js` 中添加路由（懒加载）
3. 404 兜底路由放在路由数组末尾

### 新增通用组件
1. 在 `src/components/` 创建 PascalCase 命名文件
2. 使用 `<script setup>` + `defineProps/defineEmits/defineExpose`
3. 状态组件支持 `visible` prop 控制显示

### 修改 UI 样式
- Tailwind 类名用于快速布局和间距
- `<style scoped>` 用于组件私有样式
- `src/assets/css/style.css` 用于全局覆盖（如极验样式）
