<template>
  <header class="fixed top-0 left-0 right-0 flex justify-between items-center z-[999] h-[75px] px-4" style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255, 255, 255, 0.3);">
    <!-- 左侧菜单图标 -->
    <div class="grid grid-cols-3 gap-0.5 w-[18px] h-[18px]">
      <div class="w-1 h-1 rounded-full bg-white" v-for="i in 9" :key="i"></div>
    </div>

    <!-- 中间 Tab 切换 -->
    <div class="flex rounded-full p-1" style="background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3);">
      <div
        v-for="tab in props.tabs"
        :key="tab.value"
        class="px-4 py-1 text-sm cursor-pointer transition-all duration-300 rounded-2xl"
        :class="activeTabValue === tab.value ? 'text-white font-medium' : 'text-white/60'"
        :style="activeTabValue === tab.value ? 'background: rgba(255, 255, 255, 0.25); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);' : ''"
        @click="handleTabChange(tab.value)"
      >
        {{ tab.name }}
      </div>
    </div>

    <!-- 右侧图标 -->
    <div class="flex items-center gap-3">
      <div style="font-size: 20px; filter: drop-shadow(0 1px 4px rgba(245, 222, 179, 0.3));">🎁</div>
      <div style="font-size: 20px; position: relative;" @click="goToChat">
        <span>💬</span>
        <div class="text-white text-center font-medium absolute -top-1 -right-1" style="background: linear-gradient(135deg, #ff4757, #ff3742); border-radius: 12px; padding: 2px 6px; font-size: 10px; min-width: 16px; box-shadow: 0 2px 6px rgba(255, 71, 87, 0.3); border: 1px solid rgba(255, 255, 255, 0.2);">{{ onlineCount }}</div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useOnlineCount } from '@/composables/useOnlineCount'

const router = useRouter()
const { onlineCount } = useOnlineCount()

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

const activeTabValue = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  activeTabValue.value = newValue
})

const handleTabChange = (tabValue) => {
  activeTabValue.value = tabValue
  emit('update:modelValue', tabValue)
}

const goToChat = () => {
  router.push('/chat')
}
</script>
