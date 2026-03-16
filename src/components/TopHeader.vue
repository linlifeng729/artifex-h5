<template>
  <header class="fixed top-0 left-0 right-0 flex justify-between items-center z-[999]" style="height: 75px; padding: 0 16px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255, 255, 255, 0.3);">
    <div>
      <div style="display: grid; grid-template-columns: repeat(3, 4px); gap: 2px; width: 18px; height: 18px;">
        <div class="rounded-full bg-white" style="width: 4px; height: 4px;"></div>
        <div class="rounded-full bg-white" style="width: 4px; height: 4px;"></div>
        <div class="rounded-full bg-white" style="width: 4px; height: 4px;"></div>
        <div class="rounded-full bg-white" style="width: 4px; height: 4px;"></div>
        <div class="rounded-full bg-white" style="width: 4px; height: 4px;"></div>
        <div class="rounded-full bg-white" style="width: 4px; height: 4px;"></div>
        <div class="rounded-full bg-white" style="width: 4px; height: 4px;"></div>
        <div class="rounded-full bg-white" style="width: 4px; height: 4px;"></div>
        <div class="rounded-full bg-white" style="width: 4px; height: 4px;"></div>
      </div>
    </div>
    <div class="flex rounded-full backdrop-blur-sm" style="background: rgba(255, 255, 255, 0.15); padding: 4px; border: 1px solid rgba(255, 255, 255, 0.3);">
      <div 
        v-for="(tab, index) in props.tabs" 
        :key="index"
        class="cursor-pointer transition-all duration-300 rounded-2xl"
        :style="activeTabValue === tab.value ? 'text-white font-medium; background: rgba(255, 255, 255, 0.25); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);' : 'text-white/60;'"
        style="padding: 4px 16px; font-size: 14px;"
        @click="handleTabChange(tab.value)"
      >
        {{ tab.name }}
      </div>
    </div>
    <div class="flex items-center gap-3">
      <div style="font-size: 20px; filter: drop-shadow(0 1px 4px rgba(245, 222, 179, 0.3));">🎁</div>
      <div style="font-size: 20px; position: relative;">
        <span>💬</span>
        <div class="text-white text-center font-medium absolute -top-1 -right-1" style="background: linear-gradient(135deg, #ff4757, #ff3742); border-radius: 12px; padding: 2px 6px; font-size: 10px; min-width: 16px; box-shadow: 0 2px 6px rgba(255, 71, 87, 0.3); border: 1px solid rgba(255, 255, 255, 0.2);">{{ messageCount }}</div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'bourse'
  },
  tabs: {
    type: Array,
    default: () => [
      { name: '交易所', value: 'bourse' },
      { name: '我的资产', value: 'collection' }
    ]
  }
})

const emit = defineEmits(['update:modelValue'])

const messageCount = ref(24)
const activeTabValue = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  activeTabValue.value = newValue
})

const handleTabChange = (tabValue) => {
  activeTabValue.value = tabValue
  emit('update:modelValue', tabValue)
}

const fetchMessageCount = async () => {
  try {
    const response = await new Promise(resolve => {
      setTimeout(() => resolve({ count: 24 }), 1000)
    })
    messageCount.value = response.count
  } catch (error) {
    console.error('获取消息数量失败:', error)
    messageCount.value = 0
  }
}

fetchMessageCount()
</script>
