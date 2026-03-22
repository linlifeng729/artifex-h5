# 请求/响应类型定义规范

本文档定义 Artifex-H5 项目中接口请求参数和响应数据的类型定义规范。

## 目录

- [规范原则](#规范原则)
- [JSDoc 类型定义](#jsdoc-类型定义)
- [常见类型模板](#常见类型模板)
- [请求参数规范](#请求参数规范)
- [响应数据规范](#响应数据规范)

---

## 规范原则

1. **就近注释**：类型定义紧跟函数定义
2. **命名统一**：使用一致的命名规范
3. **可选字段标注**：`[fieldName]` 表示可选
4. **默认值说明**：在注释中说明默认值

---

## JSDoc 类型定义

### 基础类型

```javascript
// 原始类型
@param {string} name - 名称
@param {number} price - 价格
@param {boolean} isActive - 是否启用
@param {string[]} tags - 标签数组
@param {Object} metadata - 元数据

// 带默认值
@param {string} [keyword=''] - 搜索关键词（默认空）
@param {number} [page=1] - 页码（默认第1页）
@param {number} [pageSize=20] - 每页数量（默认20）
```

### 复杂类型

```javascript
/**
 * @typedef {Object} PaginationParams
 * @property {number} [page=1] - 页码
 * @property {number} [pageSize=20] - 每页数量
 */

/**
 * @typedef {Object} NftItem
 * @property {string} id - NFT ID
 * @property {string} name - 名称
 * @property {string} imageUrl - 图片地址
 * @property {number} price - 价格（单位：分）
 * @property {string} category - 分类
 * @property {'on_sale'|'sold'|'reserved'} status - 状态
 * @property {string} creator - 创建者
 * @property {number} createdAt - 创建时间戳
 */

/**
 * @typedef {Object} ListResponse
 * @property {Object[]} list - 数据列表
 * @property {number} total - 总数
 * @property {number} page - 当前页
 * @property {number} pageSize - 每页数量
 */
```

---

## 常见类型模板

### 列表接口

```javascript
/**
 * 获取 NFT 列表
 * @param {Object} params - 请求参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页数量
 * @param {string} [params.keyword] - 搜索关键词
 * @param {string} [params.category] - 分类筛选
 * @param {string} [params.sortBy='createdAt'] - 排序字段
 * @param {'asc'|'desc'} [params.sortOrder='desc'] - 排序方向
 *
 * @typedef {Object} NftListResponse
 * @property {NftItem[]} list - NFT 列表
 * @property {number} total - 总数
 * @property {number} page - 当前页
 * @property {number} pageSize - 每页数量
 *
 * @returns {Promise<{ code: 0, data: NftListResponse }>}
 */
export const getNftList = (params) => {
  return http.get('/nft/list', { params })
}
```

### 详情接口

```javascript
/**
 * 获取 NFT 详情
 * @param {string} nftId - NFT ID
 *
 * @typedef {Object} NftDetailResponse
 * @property {string} id - NFT ID
 * @property {string} name - 名称
 * @property {string} description - 描述
 * @property {string} imageUrl - 主图
 * @property {string[]} gallery - 画廊图片列表
 * @property {number} price - 价格
 * @property {string} category - 分类
 * @property {'on_sale'|'sold'|'reserved'} status - 状态
 * @property {CreatorInfo} creator - 创建者信息
 * @property {OwnerInfo} owner - 拥有者信息
 * @property {number} totalSupply - 总发行量
 * @property {number} remaining - 剩余数量
 * @property {Object} metadata - 链上元数据
 * @property {number} createdAt - 创建时间
 *
 * @returns {Promise<{ code: 0, data: NftDetailResponse }>}
 */
export const getNftDetail = (nftId) => {
  return http.get(`/nft/detail/${nftId}`)
}
```

### 创建接口

```javascript
/**
 * 创建微信支付订单
 * @param {Object} data - 请求参数
 * @param {string} data.nftId - NFT ID
 * @param {string} data.payMethod - 支付方式（wechat/alipay）
 *
 * @typedef {Object} CreateOrderResponse
 * @property {string} orderId - 订单号
 * @property {string} payUrl - 支付链接/二维码
 * @property {number} expireTime - 订单过期时间戳
 *
 * @returns {Promise<{ code: 0, data: CreateOrderResponse }>}
 */
export const createWechatPayOrder = (data) => {
  return http.post('/wechatPay/createOrder', data)
}
```

### 登录接口

```javascript
/**
 * 用户登录
 * @param {Object} data - 请求参数
 * @param {string} data.phone - 手机号
 * @param {string} data.code - 验证码
 *
 * @typedef {Object} LoginResponse
 * @property {string} token - 登录令牌
 * @property {UserInfo} userInfo - 用户信息
 * @property {number} expireTime - 过期时间戳
 *
 * @typedef {Object} UserInfo
 * @property {string} id - 用户ID
 * @property {string} phone - 手机号
 * @property {string} nickname - 昵称
 * @property {string} avatar - 头像
 * @property {number} balance - 余额（单位：分）
 *
 * @returns {Promise<{ code: 0, data: LoginResponse }>}
 */
export const login = (data) => {
  return http.post('/auth/login', data)
}
```

---

## 请求参数规范

### 分页参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `page` | number | 否 | 1 | 页码，从1开始 |
| `pageSize` | number | 否 | 20 | 每页数量，最大100 |

### 排序参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `sortBy` | string | 否 | `createdAt` | 排序字段 |
| `sortOrder` | string | 否 | `desc` | `asc` 或 `desc` |

### ID 参数

统一使用 `{entity}Id` 格式：

```javascript
// ✅ 正确
{ nftId: 'xxx' }
{ orderId: 'xxx' }
{ userId: 'xxx' }

// ❌ 错误
{ id: 'xxx' }
{ nft_id: 'xxx' }
{ NftId: 'xxx' }
```

### 枚举值

在类型定义中明确枚举值：

```javascript
/**
 * @typedef {Object} NftFilter
 * @property {string} [category] - 分类（art/music/video）
 * @property {'on_sale'|'sold'|'reserved'} [status] - 状态
 * @property {number} [minPrice] - 最低价格
 * @property {number} [maxPrice] - 最高价格
 */
```

---

## 响应数据规范

### 成功响应

```javascript
// 标准成功
{ code: 0, data: {...} }

// 分页列表
{
  code: 0,
  data: {
    list: [...],
    total: 100,
    page: 1,
    pageSize: 20
  }
}

// 无数据的成功
{ code: 0, data: null }

// 布尔结果
{ code: 0, data: true }
```

### 失败响应

```javascript
// 业务错误
{ code: 1001, message: '余额不足' }

// 参数错误
{ code: 400, message: '参数错误' }

// 系统错误
{ code: 500, message: '服务器异常' }
```

### 统一响应包装

在 API 函数中对响应数据进行统一处理：

```javascript
/**
 * 响应数据标准化处理
 * @param {Object} res - 原始响应
 * @returns {Object} 标准化后的数据
 */
const normalizeResponse = (res) => {
  if (res.code !== 0) {
    throw new Error(res.message || '请求失败')
  }
  return res.data
}

// 使用示例
export const getNftList = async (params) => {
  const res = await http.get('/nft/list', { params })
  return normalizeResponse(res)
}
```

### 时间格式

| 场景 | 格式 | 示例 |
|------|------|------|
| 前端展示 | ISO 8601 / 时间戳 | `2024-01-15T10:30:00Z` / `1705311000000` |
| 请求参数 | 时间戳 | `1705311000000` |
| 相对时间 | 计算属性 | `formatTime(data.createdAt)` |

---

## 类型导出规范

在 `src/api/xxx.js` 文件中集中定义类型：

```javascript
// src/api/payment.js

// ============== 类型定义 ==============

/**
 * @typedef {Object} CreateWechatPayOrderParams
 * @property {string} nftId - NFT ID
 * @property {string} payMethod - 支付方式
 */

/**
 * @typedef {Object} CreateWechatPayOrderResult
 * @property {string} orderId - 订单号
 * @property {string} payUrl - 支付链接
 * @property {number} expireTime - 过期时间
 */

// ============== API 函数 ==============

/**
 * 创建微信支付订单
 * @param {CreateWechatPayOrderParams} data
 * @returns {Promise<CreateWechatPayOrderResult>}
 */
export const createWechatPayOrder = (data) => {
  return http.post('/wechatPay/createOrder', data)
}

/**
 * 创建支付宝订单
 * @param {CreateWechatPayOrderParams} data
 * @returns {Promise<CreateWechatPayOrderResult>}
 */
export const createAlipayOrder = (data) => {
  return http.post('/alipay/createOrder', data)
}

/**
 * 查询支付结果
 * @param {Object} params
 * @param {string} params.orderId - 订单号
 * @returns {Promise<{ status: 'pending'|'paid'|'expired' }>}
 */
export const getPayResult = (params) => {
  return http.get('/pay/result', { params })
}
```
