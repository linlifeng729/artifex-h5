<template>
  <div class="my-assets">
    <div class="selector-tabs">
      <div 
        v-for="(tab, index) in selectorTabs" 
        :key="index"
        class="selector-tab"
        :class="{ 'selector-tab-active': index === activeTabIndex }"
        @click="handleTabClick(index)"
      >
        {{ tab }}
      </div>
    </div>

    <div class="crypto-list">
      <LoadingState :visible="loading" />

      <div v-if="!loading && nftList.length > 0" class="crypto-results">
        <div 
          v-for="(item, index) in nftList" 
          :key="item.id" 
          class="crypto-item"
        >
          <div class="crypto-left">
            <div 
              class="crypto-icon"
              :style="{ backgroundImage: `url(${item.nft?.image})` }"
            >
            </div>
            <div class="crypto-info">
              <div class="crypto-name">
                <span>{{ item.nft?.name }}</span>
              </div>
              <div class="crypto-desc">
                <span>编号: {{ item.nftNumber || '无' }}</span>
              </div>
              <div class="crypto-desc">
                <span>{{ item.remark }}</span>
              </div>
            </div>
          </div>
          <div class="crypto-right">
            <div class="crypto-price">{{ formatPrice(item?.price) }}</div>
            <div 
              class="crypto-change"
              :style="getStatusStyle(item, index)"
            >
              下架
            </div>
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
  if (!price) return '¥0'
  const numPrice = parseFloat(price)
  if (isNaN(numPrice)) return '¥0'
  return `¥${numPrice.toLocaleString()}`
}

const getStatusStyle = (item, index) => {
  const styles = [
    { background: 'linear-gradient(135deg, #FF6B6B, #EE5A24)', color: 'white' },
    { background: 'linear-gradient(135deg, #4ECDC4, #26DE81)', color: 'white' },
    { background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: 'white' },
    { background: 'linear-gradient(135deg, #9B59B6, #6C5CE7)', color: 'white' },
    { background: 'linear-gradient(135deg, #26DE81, #20BF6B)', color: 'white' },
    { background: 'linear-gradient(135deg, #95E1D3, #26DE81)', color: 'white' },
    { background: 'linear-gradient(135deg, #FF9F43, #E17055)', color: 'white' },
    { background: 'linear-gradient(135deg, #6C5CE7, #5A67D8)', color: 'white' },
    { background: 'linear-gradient(135deg, #FD79A8, #E84393)', color: 'white' },
    { background: 'linear-gradient(135deg, #FDCB6E, #F39C12)', color: 'white' },
    { background: 'linear-gradient(135deg, #FF7675, #D63031)', color: 'white' },
    { background: 'linear-gradient(135deg, #74B9FF, #0984E3)', color: 'white' },
    { background: 'linear-gradient(135deg, #A29BFE, #6C5CE7)', color: 'white' },
    { background: 'linear-gradient(135deg, #FD79A8, #FF7675)', color: 'white' },
    { background: 'linear-gradient(135deg, #55A3FF, #2D3436)', color: 'white' },
    { background: 'linear-gradient(135deg, #00B894, #00A085)', color: 'white' },
    { background: 'linear-gradient(135deg, #E84393, #D63031)', color: 'white' },
    { background: 'linear-gradient(135deg, #00CEC9, #00B894)', color: 'white' },
    { background: 'linear-gradient(135deg, #FDCB6E, #E17055)', color: 'white' },
    { background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)', color: 'white' }
  ]
  return styles[index % styles.length]
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
.my-assets {
  width: 100%;
}

.selector-tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 12px;
  margin: 12px 16px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
}

.selector-tab {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.3s;
}

.selector-tab-active {
  color: #ffffff;
  font-weight: 500;
}

.crypto-list {
  background: rgba(255, 255, 255, 0.1);
  padding: 0 16px;
  margin: 12px 16px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.crypto-item {
  height: 75px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.crypto-item:last-child {
  border-bottom: none;
}

.crypto-left {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
}

.crypto-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.crypto-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.crypto-name {
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
}

.crypto-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.crypto-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-around;
  height: 100%;
  margin-left: 12px;
}

.crypto-price {
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
}

.crypto-change {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}
</style>
