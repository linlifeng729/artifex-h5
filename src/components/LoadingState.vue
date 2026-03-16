<template>
  <div v-if="visible" class="flex flex-col items-center justify-center text-center" style="padding: 60px 16px;">
    <span class="opacity-30 mb-3" style="font-size: 60px;">{{ icon }}</span>
    <span class="text-white" style="font-size: 16px;">{{ text }}</span>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: true
  },
  text: {
    type: String,
    default: '加载中...'
  },
  icon: {
    type: String,
    default: '⏳'
  }
})
</script>
