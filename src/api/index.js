/**
 * API统一入口
 */

// 用户认证相关
export { sendVerificationCode, login } from './auth'

// NFT商品类型相关
export { getNftList, getNftDetail } from './nft'

// NFT商品实例相关
export { createNftInstance, getNftInstanceList, getNftInstanceDetail, getMyNftInstances } from './nftInstances'

// 版本更新相关
export { checkVersion, versionUtils } from './update'