<template>
  <div class="flex items-center justify-between p-4 relative border-b border-white/10">
    <!-- 左侧按钮 -->
    <div v-if="!showLeft" class="w-7" />
    <button
      v-else
      class="w-7 h-7 flex items-center justify-center bg-white/10 rounded-full border-none cursor-pointer transition-colors active:bg-white/20"
      @click="handleLeftClick"
    >
      <svg  width="16" height="16" viewBox="0 0 20 20" fill="none">
        <path d="M12.5 15L7.5 10L12.5 5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- 标题 -->
    <h3 class="text-base font-medium" :class="gradientClass">
      {{ title }}
    </h3>

    <!-- 右侧按钮 -->
    <div v-if="!showRight" class="w-7" />
    <button
      v-else
      class="w-7 h-7 flex items-center justify-center bg-white/10 rounded-full border-none cursor-pointer hover:bg-white/20 transition-colors"
      @click="handleRightClick"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 4L12 12M4 12L12 4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  gradient: {
    type: Boolean,
    default: true
  },
  showLeft: {
    type: [Boolean, String],
    default: 'back'
  },
  showRight: {
    type: Boolean,
    default: true
  },
  leftIcon: {
    type: String,
    default: 'back'
  }
})

const emit = defineEmits(['left', 'right'])

const gradientClass = props.gradient
  ? 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent'
  : 'text-white'

const handleLeftClick = () => {
  emit('left')
}

const handleRightClick = () => {
  emit('right')
}
</script>
