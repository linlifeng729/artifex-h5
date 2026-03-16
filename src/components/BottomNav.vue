<template>
  <nav class="fixed bottom-0 left-0 right-0 flex justify-around items-center z-[998]" style="background: rgba(255, 255, 255, 0.1); height: 90px; border-top: 1px solid rgba(255, 255, 255, 0.3); backdrop-filter: blur(10px);">
    <div 
      class="flex flex-col items-center cursor-pointer"
      style="gap: 4px;"
      :class="index === activeIndex ? 'nav-item-active' : ''"
      v-for="(item, index) in navItems" 
      :key="index"
      @click="handleNavClick(item, index)"
    >
      <template v-if="!item.isSpecial">
        <span class="text-white/60" style="font-size: 20px;">{{ item.icon }}</span>
        <span class="text-white/60" style="font-size: 10px;">{{ item.label }}</span>
      </template>
      
      <template v-else>
        <div class="flex items-center justify-center rounded-full" style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea, #764ba2); box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);">
          <span class="font-bold" style="color: #ffffff; font-size: 16px;">{{ item.icon }}</span>
        </div>
        <span class="text-white/60" style="font-size: 10px;">{{ item.label }}</span>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeIndex = ref(0)

const navItems = ref([
  { icon: '🏠', label: '首页', value: 'home' },
  { icon: '📊', label: 'WaveUP', value: 'waveup' },
  { icon: '💰', label: '上架', value: 'listing', isSpecial: true },
  { icon: '🔍', label: '探索', value: 'explore' },
  { icon: '👤', label: '我的', value: 'profile' }
])

const setActiveByCurrentPage = () => {
  const path = route.path
  
  if (path.includes('home')) {
    activeIndex.value = 0
  } else if (path.includes('waveup')) {
    activeIndex.value = 1
  } else if (path.includes('listing')) {
    activeIndex.value = 2
  } else if (path.includes('explore')) {
    activeIndex.value = 3
  } else if (path.includes('profile')) {
    activeIndex.value = 4
  }
}

onMounted(() => {
  setActiveByCurrentPage()
})

const handleNavClick = (item, index) => {
  activeIndex.value = index
  
  switch (item.value) {
    case 'home':
      router.push('/')
      break
    case 'waveup':
      router.push('/waveup')
      break
    case 'listing':
      router.push('/listing')
      break
    case 'explore':
      router.push('/explore')
      break
    case 'profile':
      router.push('/profile')
      break
  }
}
</script>

<style scoped>
.nav-item-active span{
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}
</style>
