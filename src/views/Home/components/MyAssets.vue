<template>
  <div class="w-full">
    <div class="flex items-center justify-center gap-6 px-3 py-3 mx-4 my-3 rounded-2xl backdrop-blur-sm border border-white/30 bg-white/10">
      <div 
        v-for="(tab, index) in selectorTabs" 
        :key="index"
        class="text-sm text-white/60 whitespace-nowrap cursor-pointer transition-colors duration-300"
        :class="{ 'text-white font-medium': index === activeTabIndex }"
        @click="handleTabClick(index)"
      >
        {{ tab }}
      </div>
    </div>

    <div class="bg-white/10 px-4 mx-4 my-3 rounded-2xl border border-white/30">
      <LoadingState :visible="loading" />

      <div v-if="!loading && nftList.length > 0" class="crypto-results">
        <div 
          v-for="(item, index) in nftList" 
          :key="item.id" 
          class="h-[75px] flex justify-between items-center py-3 border-b border-white/30"
        >
          <div class="h-full flex items-center gap-2 min-w-0 flex-1">
            <div 
              class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-no-repeat bg-cover bg-center border border-white/30"
              :style="{ backgroundImage: `url(${item.nft?.image})` }"
            >
            </div>
            <div class="flex flex-col gap-0.5 min-w-0">
              <div class="text-sm text-white font-medium truncate">
                {{ item.nft?.name }}
              </div>
              <div class="text-xs text-white/60 truncate">
                {{ item.remark }}
              </div>
            </div>
          </div>
          <div class="h-full ml-3 flex-shrink-0 flex flex-col items-end justify-around">
            <div class="text-sm text-white font-medium">{{ formatPrice(item?.price) }}</div>
          </div>
        </div>
      </div>
      
      <EmptyState 
        :visible="!loading && nftList.length === 0"
        description="您还没有任何藏品，快去市场看看吧"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getMyNftInstances } from '@/api/nft'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
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

const selectorTabs = ref(['全部', '在售', '求购', '出租', '求租', '拍卖'])

watch(() => props.searchKeyword, (newKeyword) => {
  loadNftList(newKeyword)
}, { immediate: false })

const loadNftList = async (searchKeyword = '') => {
  try {
    loading.value = true
    const params = {
      page: 1,
      limit: 50
    }
    
    if (searchKeyword && searchKeyword.trim()) {
      params.name = searchKeyword.trim()
    }
    
    const response = await getMyNftInstances(params)

    if (Array.isArray(response?.list)) {
      nftList.value = response.list
    } else {
      nftList.value = []
    }
  } catch (error) {
    console.error(error)
    nftList.value = []
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
