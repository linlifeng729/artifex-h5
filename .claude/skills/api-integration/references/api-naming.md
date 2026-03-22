# API 命名规范

本文档定义 Artifex-H5 项目中 API 函数、接口端点的命名规范。

## 目录

- [文件命名](#文件命名)
- [函数命名](#函数命名)
- [接口端点命名](#接口端点命名)
- [参数命名](#参数命名)
- [类型命名](#类型命名)

---

## 文件命名

使用 **kebab-case** 小写字母 + 连字符：

```
src/api/
├── auth.js           # ✅ 用户认证
├── nft.js            # ✅ NFT 相关
├── payment.js        # ✅ 支付
├── order-tracking.js # ✅ 订单追踪
├── user-profile.js   # ❌ 不要用 userProfile.js
```

| 模块 | 文件名 | 说明 |
|------|--------|------|
| 登录/验证码 | `auth.js` | Authentication |
| NFT 类型/实例 | `nft.js` | NFT 相关 |
| 支付 | `payment.js` | 微信/支付宝 |
| 订单 | `order.js` | 订单管理 |

---

## 函数命名

使用 **camelCase** 小写字母开头的驼峰命名：

### 命名模式

| 操作类型 | 命名模式 | 示例 |
|----------|----------|------|
| 获取列表 | `get{Entity}List` | `getNftList`, `getOrderList` |
| 获取详情 | `get{Entity}Detail` | `getNftDetail`, `getOrderDetail` |
| 创建 | `create{Entity}` | `createOrder`, `createWechatPayOrder` |
| 更新 | `update{Entity}` | `updateUserInfo`, `updateNftPrice` |
| 删除 | `delete{Entity}` | `deleteNft`, `deleteOrder` |
| 提交/发送 | `submit{Entity}` | `submitVerificationCode` |
| 获取 | `fetch{Entity}` | `fetchUserAssets` |

### 命名示例

```javascript
// ✅ 正确
export const getNftList = (params) => http.get('/nft/list', { params })
export const getNftDetail = (id) => http.get(`/nft/detail/${id}`)
export const createWechatPayOrder = (data) => http.post('/wechatPay/createOrder', data)
export const createAlipayOrder = (data) => http.post('/alipay/createOrder', data)
export const sendVerificationCode = (data) => http.post('/auth/send/verificationcode', data)
export const loginWithCode = (data) => http.post('/auth/login', data)

// ❌ 错误
export const get_nft_list = (params) => http.get('/nft/list', { params })
export const GetNftList = (params) => http.get('/nft/list', { params })
export const fetchList = (params) => http.get('/nft/list', { params })  // 缺少实体名
```

### 业务动作命名

| 动作 | 命名 | 示例 |
|------|------|------|
| 上架 | `listNft` | `listNft({ nftId, price })` |
| 下架 | `delistNft` | `delistNft({ nftId })` |
| 购买 | `purchaseNft` | `purchaseNft({ nftId })` |
| 转账 | `transferNft` | `transferNft({ nftId, to })` |

---

## 接口端点命名

### RESTful 规范

| 方法 | 端点模式 | 说明 |
|------|----------|------|
| GET | `/nft/list` | 获取列表 |
| GET | `/nft/detail/{id}` | 获取详情 |
| POST | `/nft/create` | 创建 |
| PUT | `/nft/update/{id}` | 更新 |
| DELETE | `/nft/delete/{id}` | 删除 |

### 业务特定端点

```
POST /auth/login                    # 登录
POST /auth/send/verificationcode    # 发送验证码
POST /wechatPay/createOrder        # 微信支付下单
POST /alipay/createOrder           # 支付宝下单
GET  /nft/market/list              # 市场 NFT 列表
GET  /nft/assets/mine              # 我的资产
```

---

## 参数命名

### 请求参数

| 参数类型 | 命名规范 | 示例 |
|----------|----------|------|
| 分页 | `page`, `pageSize` | `{ page: 1, pageSize: 20 }` |
| ID | `{entity}Id` | `nftId`, `orderId`, `userId` |
| 搜索 | `keyword`, `searchKey` | `{ keyword: 'xxx' }` |
| 排序 | `sortBy`, `sortOrder` | `{ sortBy: 'price', sortOrder: 'asc' }` |
| 筛选 | `{field}` | `{ category: 'art', status: 'on_sale' }` |

### JSDoc 参数类型

```javascript
/**
 * 获取 NFT 列表
 * @param {Object} params - 请求参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页数量
 * @param {string} [params.keyword] - 搜索关键词
 * @param {string} [params.category] - 分类
 * @returns {Promise<NftListResponse>}
 */
export const getNftList = (params) => http.get('/nft/list', { params })
```

---

## 类型命名

### TypeScript 类型（JS 中使用 JSDoc）

```javascript
/**
 * @typedef {Object} NftItem
 * @property {string} id - NFT ID
 * @property {string} name - 名称
 * @property {string} imageUrl - 图片地址
 * @property {number} price - 价格
 * @property {string} category - 分类
 */

/**
 * @typedef {Object} NftListResponse
 * @property {NftItem[]} list - NFT 列表
 * @property {number} total - 总数
 * @property {number} page - 当前页
 * @property {number} pageSize - 每页数量
 */

/**
 * @typedef {Object} CreateOrderRequest
 * @property {string} nftId - NFT ID
 * @property {string} payMethod - 支付方式
 */

/**
 * @typedef {Object} CreateOrderResponse
 * @property {string} orderId - 订单号
 * @property {string} payUrl - 支付链接
 */
```

### 简化的类型定义约定

如果不需要完整 JSDoc，至少在注释中标注：

```javascript
// Response: { code: 0, data: { orderId, payUrl } }
export const createOrder = (data) => http.post('/order/create', data)
```
