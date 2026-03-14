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
 * 查询商品类型详情
 * @param {number} id - 商品类型ID
 * @returns {Promise} 商品类型详情
 */
export function getNftDetail(id) {
  return http.get(`/nft/${id}`)
}