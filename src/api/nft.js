/**
 * NFT商品类型相关API
 */
import { http } from '@/utils/request'

/**
 * 查询商品类型列表
 * @param {Object} params - 查询参数
 * @param {string} [params.status] - 状态 active|inactive
 * @param {string} [params.name] - 商品名称
 * @param {string} params.page - 页码
 * @param {string} params.limit - 每页数量
 * @param {string} [params.sort] - 排序方式
 *   - latest: 最新发布（默认排序）
 *   - price_low_to_high: 按最低价格从低到高排序
 *   - price_high_to_low: 按最低价格从高到低排序
 * @returns {Promise} 商品类型列表
 */
export function getNftList(params) {
  return http.get('/nft', params)
}

/**
 * 查询商品列表
 * @param {Object} params - 查询参数
 * @param {string} [params.status] - 状态 available|sold|reserved
 * @param {string} [params.sort] - 排序 latest|price_low_to_high|price_high_to_low
 * @param {string} params.page - 页码
 * @param {string} params.limit - 每页数量
 * @param {string} [params.nftTypeId] - 商品类型id，不传查询所有类型商品
 * @returns {Promise} 商品列表
 */
export function getNftInstanceList(params) {
  return http.get('/nft-instances', params)
}

/**
 * 查询商品详情
 * @param {number} id - 商品ID
 * @returns {Promise} 商品详情
 */
export function getNftInstanceDetail(id) {
  return http.get(`/nft-instances/${id}`)
}

/**
 * 查询当前登录用户上架的商品列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.limit] - 每页数量
 * @param {string} [params.name] - NFT名称搜索
 * @param {string} [params.status] - 状态筛选
 * @returns {Promise} 用户商品列表
 */
export function getMyNftInstances(params = {}) {
  return http.get('/nft-instances/my', params)
}