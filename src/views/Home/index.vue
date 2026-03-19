<template>
  <div class="min-h-screen text-white" style="background: linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding-bottom: 90px; padding-top: 75px;">
    <TopHeader v-model="currentTabValue" :tabs="headerTabs" />

    <div class="mx-4 my-3">
      <div class="flex items-center relative" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 24px; padding: 12px 16px; gap: 8px; backdrop-filter: blur(10px);">
        <input 
          class="flex-1 bg-transparent border-none outline-none text-white"
          style="font-size: 14px; min-height: 30px;"
          v-model="searchKeyword" 
          placeholder="🔍 搜索藏品名称"
          @clear="handleClearSearch" 
        />
        <div v-if="searchKeyword" class="flex-shrink-0 flex items-center justify-center rounded-full cursor-pointer transition-opacity" style="width: 24px; height: 24px; background: rgba(255, 255, 255, 0.6); opacity: 0.7;" @click="handleClearSearch">
          <span class="text-white font-bold" style="font-size: 12px;">✕</span>
        </div>
      </div>
    </div>

    <MarketOverview v-if="currentTabValue === 'bourse'" :searchKeyword="debouncedSearchKeyword" ref="marketOverviewRef" />

    <MyAssets v-if="currentTabValue === 'collection'" :searchKeyword="debouncedSearchKeyword" ref="myAssetsRef" />

    <BottomNav />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { debounce } from 'lodash-es'
import TopHeader from '@/components/TopHeader.vue'
import BottomNav from '@/components/BottomNav.vue'
import MarketOverview from '@/views/Home/components/MarketOverview.vue'
import MyAssets from '@/views/Home/components/MyAssets.vue'

const currentTabValue = ref('bourse')

const headerTabs = ref([
  { name: '交易所', value: 'bourse' },
  { name: '我的资产', value: 'collection' }
])

const searchKeyword = ref('')
const debouncedSearchKeyword = ref('')

const marketOverviewRef = ref(null)
const myAssetsRef = ref(null)

const debouncedSearch = debounce((keyword) => {
  debouncedSearchKeyword.value = keyword
}, 500)

watch(searchKeyword, (newValue) => {
  debouncedSearch(newValue)
}, { immediate: false })

const handleClearSearch = () => {
  searchKeyword.value = ''
  debouncedSearchKeyword.value = ''
}

const refreshCurrentTab = () => {
  if (currentTabValue.value === 'bourse' && marketOverviewRef.value) {
    marketOverviewRef.value.refresh()
  } else if (currentTabValue.value === 'collection' && myAssetsRef.value) {
    myAssetsRef.value.refresh()
  }
}

defineExpose({
  refreshCurrentTab
})
</script>

<style scoped>
</style>
