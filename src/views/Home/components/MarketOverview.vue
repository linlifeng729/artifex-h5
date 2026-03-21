<template>
  <div class="market-overview">
    <div class="flex items-center justify-center gap-6 p-3 mx-4 my-3 rounded-2xl backdrop-blur-sm border border-white/30 bg-white/10">
      <div 
        v-for="(tab, index) in selectorTabs" 
        :key="index"
        class="text-sm whitespace-nowrap cursor-pointer transition-colors duration-300"
        :class="index === activeTabIndex ? 'text-white font-medium' : 'text-white/60'"
        @click="handleTabClick(index)"
      >
        {{ tab }}
      </div>
    </div>

    <div class="bg-white/10 border border-white/30 rounded-2xl mx-4 my-3 p-0">
      <LoadingState :visible="loading" />
      
      <div v-if="!loading && filteredNftList.length > 0">
        <div 
          v-for="(nft, index) in filteredNftList" 
          :key="nft.id" 
          class="flex items-center justify-between h-[75px] px-3 py-3 border-b border-white/30 cursor-pointer hover:bg-white/5 transition-colors"
          :class="{ 'border-b-0': index === filteredNftList.length - 1 }"
          @click="handleItemClick(nft)"
        >
          <div class="flex items-center gap-2 h-full">
            <div 
              class="w-10 h-10 rounded-full shrink-0 bg-cover bg-center bg-no-repeat border border-white/30"
              :style="{ backgroundImage: `url(${nft.image})` }"
            >
            </div>
            <div class="flex flex-col gap-0.5">
              <div class="text-sm text-white font-medium">{{ nft.name }}</div>
              <div class="text-xs text-white/60">数量:{{ nft.availableCount }}</div>
            </div>
          </div>
          <div class="flex flex-col items-end justify-around h-full ml-3">
            <div class="text-sm text-white font-medium">{{ formatPrice(nft.minPrice) }}</div>
          </div>
        </div>
      </div>
      
      <EmptyState 
        :visible="!loading && filteredNftList.length === 0"
        description="没有找到相关藏品，换个关键词试试吧"
        icon="🔍"
      />
    </div>
    <CategoryDrawer ref="categoryDrawerRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getNftList } from '@/api/nft'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import CategoryDrawer from './CategoryDrawer.vue'
import { showToast } from 'vant'

const props = defineProps({
  searchKeyword: {
    type: String,
    default: ''
  }
})

const nftList = ref([])
const loading = ref(false)
const activeTabIndex = ref(0)
const marketStats = ref({
  totalCount: 0
})

const selectorTabs = ref(['推荐', '在售', '求购', '出租', '求租', '拍卖'])

const filteredNftList = computed(() => {
  return nftList.value
})

watch(() => props.searchKeyword, (newKeyword) => {
  loadNftList(newKeyword)
}, { immediate: false })

const loadNftList = async (searchKeyword = '') => {
  try {
    loading.value = true
    const params = {
      page: 1,
      limit: 50,
      sort: 'latest'
    }
    
    if (searchKeyword && searchKeyword.trim()) {
      params.name = searchKeyword.trim()
    }
    
    const response = await getNftList(params)
    
    if (response && Array.isArray(response)) {
      nftList.value = response
      marketStats.value.totalCount = response.length
    } else if (response && response.list && Array.isArray(response.list)) {
      nftList.value = response.list
      marketStats.value.totalCount = response.total || response.list.length
    } else {
      nftList.value = []
      marketStats.value.totalCount = 0
    }
  } catch (error) {
    nftList.value = []
    marketStats.value.totalCount = 0
  } finally {
    loading.value = false
  }
}

const handleTabClick = (index) => {
  const comingSoonTabs = ['求购', '出租', '求租', '拍卖']
  const tabName = selectorTabs.value[index]
  
  if (comingSoonTabs.includes(tabName)) {
    showToast('功能即将上线，敬请期待')
    return
  }
  
  activeTabIndex.value = index
  loadNftList(props.searchKeyword)
}

const categoryDrawerRef = ref(null)

const handleItemClick = (nft) => {
  categoryDrawerRef.value?.openDrawer({ id: nft.id, name: nft.name })
}

const formatPrice = (price) => {
  if (!price) return '¥0.00'
  const numPrice = parseFloat(price) / 100
  if (isNaN(numPrice)) return '¥0.00'
  return `¥${numPrice.toFixed(2)}`
}

onMounted(() => {
  loadNftList(props.searchKeyword)
})

defineExpose({
  loadNftList: (keyword) => loadNftList(keyword || props.searchKeyword),
  refresh: () => loadNftList(props.searchKeyword)
})
</script>

<style scoped>
.market-overview {
  width: 100%;
}
</style>
