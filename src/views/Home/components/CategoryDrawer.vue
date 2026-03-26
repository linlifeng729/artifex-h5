<template>
  <van-popup
    v-model:show="showDrawer"
    position="bottom"
    :style="drawerStyle"
    @close="handleClose"
  >
    <div class="flex flex-col h-full">
      <DrawerHeader
        :title="categoryName"
        :show-left="false"
        @right="handleClose"
      />

      <!-- 排序切换 -->
      <div class="flex gap-2 px-4 py-3 border-b border-white/10 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <div
          v-for="option in sortOptions"
          :key="option.value"
          class="px-3 py-1.5 text-xs rounded-full cursor-pointer whitespace-nowrap transition-all border"
          :class="sortType === option.value
            ? 'bg-green-500/20 text-white border-green-500/50'
            : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'"
          @click="handleSortChange(option.value)"
        >
          {{ option.label }}
        </div>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto p-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded">
        <LoadingState :visible="loading && page === 1" />

        <EmptyState
          v-if="!loading && finished && nftList.length === 0"
          description="暂无相关商品"
          icon="📦"
        />

        <div v-if="!loading && nftList.length > 0" class="grid grid-cols-2 gap-3">
          <div
            v-for="item in nftList"
            :key="item.id"
            class="bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:bg-white/10 hover:border-green-500/30 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
            style="box-shadow: 0 4px 12px rgba(0,0,0,0.2);"
            @click="handleItemClick(item)"
          >
            <div
              class="w-full aspect-square bg-white/5 bg-cover bg-center"
              :style="{ backgroundImage: `url(${item.image || '/placeholder.png'})` }"
            />
            <div class="p-2.5 flex items-center justify-between gap-2">
              <div class="text-xs text-white font-medium truncate">{{ item.nickname }}</div>
              <div class="text-sm text-green-400 font-semibold shrink-0">{{ item.price }}</div>
            </div>
          </div>
        </div>

        <div v-if="loading && page > 1" class="flex justify-center py-4 text-white/50 text-xs">
          <van-loading size="16px" color="#3cb371">加载中...</van-loading>
        </div>
        <div v-if="finished && nftList.length > 0" class="text-center py-4 text-white/30 text-xs">
          — 没有更多了 —
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Popup as VanPopup, Loading as VanLoading } from 'vant'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import DrawerHeader from '@/components/DrawerHeader.vue'
import { getNftInstanceList } from '@/api/nft'

const router = useRouter()
const showDrawer = ref(false)
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const sortType = ref('latest')
const nftList = ref([])
const categoryId = ref(null)
const categoryName = ref(null)

const sortOptions = [
  { label: '最新', value: 'latest' },
  { label: '价格从低到高', value: 'price_low_to_high' },
  { label: '价格从高到低', value: 'price_high_to_low' }
]

const drawerStyle = {
  height: '90%',
  background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  borderTopLeftRadius: '20px',
  borderTopRightRadius: '20px',
  overflow: 'hidden'
}

const mapApiData = (items) => items.map(item => ({
  id: item.id,
  name: item.nft?.name,
  nickname: item.owner?.nickname,
  image: item.nft?.image || item.image || '',
  price: `¥${((item.price || 0) / 100).toFixed(2)}`,
  remark: item.remark || ''
}))

const loadData = async () => {
  if (loading.value || finished.value) return

  loading.value = true
  try {
    const data = await getNftInstanceList({
      nftTypeId: categoryId.value,
      page: page.value,
      limit: 10,
      sort: sortType.value
    })

    const list = Array.isArray(data) ? data : (data?.list ?? [])
    if (page.value === 1) {
      nftList.value = mapApiData(list)
    } else {
      nftList.value.push(...mapApiData(list))
    }

    const totalPages = data?.totalPages ?? 1
    finished.value = page.value >= totalPages || list.length < 10
    page.value++
  } catch (error) {
    console.error('加载商品数据失败:', error)
    finished.value = true
  } finally {
    loading.value = false
  }
}

const resetState = () => {
  page.value = 1
  finished.value = false
  nftList.value = []
  categoryId.value = ''
  categoryName.value = ''
}

const openDrawer = async (category) => {
  resetState()
  categoryId.value = category.id
  categoryName.value = category.name
  showDrawer.value = true
  await loadData()
}

const handleSortChange = async (value) => {
  if (sortType.value === value) return
  sortType.value = value
  page.value = 1
  finished.value = false
  nftList.value = []
  await loadData()
}

const handleClose = () => {
  showDrawer.value = false
  resetState()
}

const handleItemClick = (item) => {
  router.push(`/nft-detail/${item.id}`)
}

defineExpose({ openDrawer })
</script>

<style scoped>
</style>
