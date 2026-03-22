---
name: api-integration
description: Artifex-H5 项目接口联调工作流规范。当需要进行前后端接口联调、调用 GetApiDoc/GetApiDescription/GetApiMock 等 MCP 工具、生成 API 调用代码、定义请求/响应类型、处理接口错误时使用此 SKILL。技术栈：Vue 3 + Axios + Vant 4。
---

# API 联调工作流

本 SKILL 提供 Artifex-H5 项目的完整接口联调工作流程，包括文档加载、接口查询、代码生成、Mock 测试和错误处理。

## 工作流程概览

```
┌─────────────────────────────────────────────────────────┐
│  1. 加载接口文档 → 2. 查询接口详情 → 3. 生成联调代码     │
│                                                     ↓    │
│  5. Mock 测试验证 ← 4. 代码健壮性检查                    │
└─────────────────────────────────────────────────────────┘
```

## 1. 加载接口文档

### 使用 GetApiDoc 工具

当用户提供接口文档路径（YAML/JSON/HTML/Markdown）时，立即调用：

```
GetApiDoc(
  apiFilePath: "/path/to/api.yaml",      // 接口文档绝对路径
  apiFileType: "yaml",                    // yaml | json | html | markdown
  pageType: "H5",                         // H5 | PC | 小程序
  projectBaseDir: "D:/linlifeng/artifex-h5",
  relativePath: ["src/api/xxx.js"],       // 相关文件路径
  prompt: "用户输入的完整内容",
  useStreaming: true,                     // 大文件启用流式
  streamingThreshold: 5242880              // 5MB 阈值
)
```

### 触发关键词

- "加载接口文档"、"导入接口文档"
- "接口联调"、"前后端联调"
- "使用 XX 文档联调 XX 接口"
- 包含 `.yaml` / `.json` / `swagger` / `openapi` 等文件格式

## 2. 查询接口详情

### 使用 GetApiDescription 工具

文档加载后，使用具体接口名称或路径查询：

```
GetApiDescription(
  inputApiNames: ["createOrder", "/payment/create"],  // 接口名或路径数组
  methodType: "post",                                   // get | post | put | delete | patch
  apiType: "create",                                    // list | detail | create | update | delete | other
  framework: "vue3",                                    // vue2 | vue3 | angular | react | other
  pageType: "H5",
  projectBaseDir: "D:/linlifeng/artifex-h5",
  relativePath: ["src/api/payment.js"],
  prompt: "用户输入的完整内容"
)
```

### 触发关键词

- "联调接口 XX"、"调用接口 XX"
- "接口详情"、"接口信息"、"API 详情"
- "如何调用 XX 接口"、"XX 接口怎么用"

## 3. 生成联调代码

### API 模块组织规范

按业务域拆分，文件命名使用 **kebab-case**：

```
src/api/
├── auth.js          # 用户认证（登录、验证码）
├── nft.js           # NFT 类型/实例
├── payment.js       # 支付相关
└── index.js         # 统一导出
```

### 函数命名规范

参见 [references/api-naming.md](references/api-naming.md)

### 代码模板

```javascript
/**
 * 创建微信支付订单
 * @param {CreateWechatPayOrderRequest} data - 请求参数
 * @returns {Promise<CreateWechatPayOrderResponse>}
 */
export const createWechatPayOrder = (data) => {
  return http.post('/wechatPay/createOrder', data)
}
```

### 组件中调用

```javascript
import { createWechatPayOrder } from '@/api'

const handlePay = async () => {
  loading.value = true
  try {
    const res = await createWechatPayOrder({ orderId: 'xxx' })
    // 处理成功逻辑
  } catch (error) {
    // 错误处理，参见 references/error-handling.md
    showToast(error.message || '支付创建失败')
  } finally {
    loading.value = false
  }
}
```

## 4. Mock 测试验证

### 使用 GetApiMock 工具

在接口联调代码完成后，生成 Mock 数据验证健壮性：

```
GetApiMock(
  endpointId: "createWechatPayOrder",           // 接口端点 ID
  codeContent: "完整的 API 函数代码",             // 需要检查的代码
  methodType: "post",
  apiType: "create",
  framework: "vue3",
  pageType: "H5",
  projectBaseDir: "D:/linlifeng/artifex-h5",
  relativePath: ["src/api/payment.js"],
  prompt: "用户输入的完整内容"
)
```

### 测试场景

| 场景 | 说明 |
|------|------|
| `normal` | 正常业务流程 |
| `empty` | 空数据和默认值 |
| `boundary` | 边界条件（最大长度、负数等） |
| `error` | 异常情况和错误码处理 |

### 健壮性检查清单

- [ ] 空数据返回处理
- [ ] 网络超时处理
- [ ] 401/403/500 等 HTTP 错误处理
- [ ] 业务错误码处理（code !== 0）
- [ ] 数据解密/解密失败处理
- [ ] 分页数据边界处理

## 5. 类型定义规范

参见 [references/request-response.md](references/request-response.md)

## 6. 错误处理规范

参见 [references/error-handling.md](references/error-handling.md)

## 快速参考

### 响应格式

```javascript
// 成功
{ code: 0, data: {...} } 或 { success: true, data: {...} }

// 失败
{ code: 非0, message: '错误信息' }
```

### HTTP 拦截器行为

- 请求自动携带：`Authorization: Bearer {token}`
- 401 响应：自动清除 token，跳转 `/login`
- 响应判断：`data.code === 0 || data.success`

### 项目特定配置

| 配置项 | 值 |
|--------|-----|
| API 路径前缀 | `VITE_API_PREFIX` (环境变量) |
| Token 存储 | `localStorage.token` |
| 用户信息 | `localStorage.userInfo` (JSON) |
