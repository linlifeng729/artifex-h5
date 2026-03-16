<template>
  <div v-if="visible" class="flex flex-col items-center justify-center text-center" style="padding: 210px 16px;">
    <div class="opacity-60 mb-3" style="font-size: 40px;">{{ icon }}</div>
    <span class="text-white/60 leading-relaxed font-normal" style="font-size: 16px;">{{ description }}</span>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '📦'
  }
})
</script>
