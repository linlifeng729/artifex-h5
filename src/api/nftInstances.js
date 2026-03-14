/**
 * NFT商品实例相关API
 */
import { http } from '@/utils/request'

/**
 * 上架商品
 * @param {Object} data - 商品数据
 * @param {number} data.nftId - NFT类型ID
 * @param {number} data.price - 价格
 * @param {string} data.status - 状态
 * @param {string} [data.nftNumber] - NFT编号
 * @param {string} data.remark - 备注
 * @returns {Promise} 上架结果
 */
export function createNftInstance(data) {
  return http.post('/nft-instances', data)
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