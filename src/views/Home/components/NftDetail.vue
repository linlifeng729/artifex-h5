<template>
  <div class="min-h-screen pb-20" style="background: linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);">
    <!-- 顶部导航 -->
    <DrawerHeader
      title="商品详情"
      :show-right="false"
      @left="handleBack"
    />

    <!-- 内容区域 -->
    <div class="px-3 pt-4" v-if="!loading && detail">
      <!-- 商品图片 -->
      <div class="mb-4">
        <div
          class="w-full h-52 bg-cover bg-center rounded-xl relative border border-white/10 bg-white/5 bg-center"
          :style="{ backgroundImage: `url(${detail.nft?.image || '/placeholder.png'})` }"
        >
          <div
            v-if="detail.status"
            class="absolute top-2.5 right-2.5 px-2.5 py-1 text-[10px] font-medium text-white rounded-full"
            style="background: linear-gradient(135deg, #3cb371, #2ea55f);"
          >
            {{ getStatusText(detail.status) }}
          </div>
        </div>
      </div>

      <!-- 拥有者信息 -->
      <div class="bg-white/8 backdrop-blur-[10px] border border-white/10 rounded-xl p-4 mb-3">
        <div class="flex items-center gap-2.5">
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
            style="background: linear-gradient(135deg, #667eea, #764ba2);"
          >
            {{ getAvatarText(detail.owner?.nickname) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm text-white truncate">{{ detail.owner?.nickname || '未知用户' }}</div>
            <div class="text-[10px] text-white/50">当前持有者</div>
          </div>
          <div class="flex-shrink-0 text-right">
            <div class="text-[10px] text-white/50">编号</div>
            <div class="text-xs font-medium text-white">#{{ detail.nftNumber || '无' }}</div>
          </div>
        </div>
      </div>

      <!-- 商品信息卡片 -->
      <div class="bg-white/8 backdrop-blur-[10px] border border-white/10 rounded-xl p-4 mb-3">
        <div class="text-base font-medium text-white mb-3">{{ detail.nft?.name || '未知商品' }}</div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-white/60">价格</span>
          <span class="text-xl font-bold" style="background: linear-gradient(135deg, #3cb371, #7dd87d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
            ¥{{ ((detail.price || 0) / 100).toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- 支付方式选择 -->
      <div class="bg-white/8 backdrop-blur-[10px] border border-white/10 rounded-xl p-4 mb-3" v-if="detail.status === 'available'">
        <div class="text-[10px] font-medium text-white/50 uppercase tracking-wide mb-2">支付方式</div>
        <div class="flex items-center gap-2">
          <div
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all border"
            :class="paymentType === PaymentType.Alipay
              ? 'border-[#3cb371] bg-[#3cb371]/20 text-[#3cb371]'
              : 'border-white/20 text-white/50'"
            @click="paymentType = PaymentType.Alipay"
          >
            支付宝
          </div>
          <div
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all border"
            :class="paymentType === PaymentType.WeChat
              ? 'border-[#3cb371] bg-[#3cb371]/20 text-[#3cb371]'
              : 'border-white/20 text-white/50'"
            @click="paymentType = PaymentType.WeChat"
          >
            微信
          </div>
        </div>
      </div>

      <!-- 商品描述 -->
      <div class="bg-white/8 backdrop-blur-[10px] border border-white/10 rounded-xl p-4 mb-3" v-if="detail.remark">
        <div class="text-[10px] font-medium text-white/50 uppercase tracking-wide mb-2">商品描述</div>
        <div class="text-xs leading-relaxed text-white/80">{{ detail.remark }}</div>
      </div>
    </div>

    <!-- 底部购买按钮 -->
    <div
      class="fixed bottom-0 left-0 right-0 px-4 pt-4 pb-4"
      style="backdrop-filter: blur(12px); border-top: 1px solid rgba(255, 255, 255, 0.1);"
      v-if="!loading && detail"
    >
      <van-button
        v-if="detail.status === 'available'"
        type="primary"
        size="normal"
        block
        round
        :loading="purchasing"
        @click="handlePurchase"
      >
        立即购买
      </van-button>
      <van-button
        v-else-if="detail.status === 'sold'"
        type="default"
        size="normal"
        block
        round
        disabled
      >
        已售出
      </van-button>
      <van-button
        v-else
        type="default"
        size="normal"
        block
        round
        disabled
      >
        锁定中
      </van-button>
    </div>

    <PaymentComponent ref="paymentComponentRef" />

    <!-- 错误状态 -->
    <empty-state
      v-if="!loading && error"
      :visible="true"
      icon="❗"
      :description="error"
    >
      <template #action>
        <van-button type="primary" size="small" round @click="loadDetail">
          重新加载
        </van-button>
      </template>
    </empty-state>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Button as VanButton } from 'vant'
import EmptyState from '@/components/EmptyState.vue'
import PaymentComponent from '@/components/paymentComponent.vue'
import DrawerHeader from '@/components/DrawerHeader.vue'
import { getNftInstanceDetail } from '@/api/nft'
import { PaymentType } from '@/utils/constants'
import { isWechat } from '@/utils/index'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const error = ref(null)
const detail = ref(null)
const purchasing = ref(false)
const paymentType = ref(PaymentType.WeChat)
const paymentComponentRef = ref(null)

const loadDetail = async () => {
  const id = route.params.id
  if (!id) {
    error.value = '商品ID不存在'
    return
  }

  loading.value = true
  error.value = null

  try {
    const res = await getNftInstanceDetail(id)
    if (res) {
      detail.value = res
    } else {
      error.value = '商品不存在'
    }
  } catch (err) {
    console.error('加载商品详情失败:', err)
    error.value = '加载失败，请重试'
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.back()
}

const handlePurchase = async () => {
  if (purchasing.value || !detail.value) return

  purchasing.value = true
  try {
    const paymentInfo = {
      goodsId: detail.value.nft?.id,
      description: detail.value.nft?.name || 'NFT商品',
      amount: detail.value.price,
      paymentType: paymentType.value,
    }
    paymentComponentRef.value?.startPaying(paymentInfo)
  } finally {
    purchasing.value = false
  }
}

const getAvatarText = (nickname) => {
  if (!nickname) return '?'
  return nickname.slice(0, 2).toUpperCase()
}

const getStatusText = (status) => {
  const map = {
    available: '可购买',
    sold: '已售出',
    reserved: '预留中'
  }
  return map[status] || ''
}

onMounted(() => {
  initPage()
})

const initPage = () => {
  // 如果在微信环境，默认选择微信支付
  if (isWechat()) {
    paymentType.value = PaymentType.WeChat
  } else {
    paymentType.value = PaymentType.Alipay
  }
  loadDetail()
}
</script>
