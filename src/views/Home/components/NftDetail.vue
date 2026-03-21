<template>
  <div class="min-h-screen pb-24" style="background: linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);">
    <!-- 顶部导航 -->
    <div class="sticky top-0 z-10 px-4 pb-3" style="background: linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding-top: env(safe-area-inset-top);">
      <div class="flex items-center justify-between h-10">
        <button
          class="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full border-none cursor-pointer transition-colors active:bg-white/20"
          @click="handleBack"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="text-sm font-medium text-white">商品详情</span>
        <div class="w-8"></div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="px-3 pt-4" v-if="!loading && detail">
      <!-- 商品图片 -->
      <div class="mb-4">
        <div
          class="w-full h-52 bg-cover bg-center rounded-xl relative border border-white/10 bg-white/5 bg-center"
          :style="{ backgroundImage: `url(${detail.nft?.image || '/placeholder.png'})` }"
        >
          <div
            v-if="detail.status === 'available'"
            class="absolute top-2.5 right-2.5 px-2.5 py-1 text-[10px] font-medium text-white rounded-full"
            style="background: linear-gradient(135deg, #3cb371, #2ea55f);"
          >
            可购买
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

      <!-- 商品描述 -->
      <div class="bg-white/8 backdrop-blur-[10px] border border-white/10 rounded-xl p-4 mb-3" v-if="detail.remark">
        <div class="text-[10px] font-medium text-white/50 uppercase tracking-wide mb-2">商品描述</div>
        <div class="text-xs leading-relaxed text-white/80">{{ detail.remark }}</div>
      </div>

      <!-- 拥有者信息 -->
      <div class="bg-white/8 backdrop-blur-[10px] border border-white/10 rounded-xl p-4 mb-3">
        <div class="text-[10px] font-medium text-white/50 uppercase tracking-wide mb-2">拥有者</div>
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
        </div>
      </div>

      <!-- 商品编号 -->
      <div class="bg-white/8 backdrop-blur-[10px] border border-white/10 rounded-xl p-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-0.5">
            <span class="text-[10px] text-white/50">编号</span>
            <span class="text-xs font-medium text-white">#{{ detail.nftNumber || '无' }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-[10px] text-white/50">状态</span>
            <span class="text-xs font-medium" :class="getStatusClass(detail.status)">
              {{ getStatusText(detail.status) }}
            </span>
          </div>
        </div>
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
import { showToast, Button as VanButton } from 'vant'
import EmptyState from '@/components/EmptyState.vue'
import { getNftInstanceDetail } from '@/api/nft'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const error = ref(null)
const detail = ref(null)
const purchasing = ref(false)

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
    showToast('购买功能开发中')
  } finally {
    purchasing.value = false
  }
}

const getAvatarText = (nickname) => {
  if (!nickname) return '?'
  return nickname.slice(0, 2).toUpperCase()
}

const getStatusClass = (status) => {
  const map = {
    available: 'text-[#3cb371]',
    sold: 'text-red-400',
    reserved: 'text-yellow-400'
  }
  return map[status] || 'text-white'
}

const getStatusText = (status) => {
  const map = {
    available: '可购买',
    sold: '已售出',
    reserved: '预留中'
  }
  return map[status] || '未知'
}

onMounted(() => {
  loadDetail()
})
</script>
