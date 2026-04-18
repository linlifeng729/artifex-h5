<template>
  <div class="flex justify-center items-center my-2 px-3">
    <span class="text-xs text-white/40 px-3 py-1 rounded-full" style="background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.08);">{{ text }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
});

const text = computed(() => {
  if (props.message.type === 'join') {
    return `${props.message.nickname} 进入了聊天室`;
  } else if (props.message.type === 'leave') {
    return `${props.message.nickname} 离开了聊天室`;
  }
  return props.message.content || '';
});
</script>
