<template>
  <div class="system-message">
    <span class="system-message__text">{{ text }}</span>
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

<style scoped>
.system-message {
  @apply flex justify-center items-center my-2 px-3;
}

.system-message__text {
  @apply text-xs text-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.06)] px-2.5 py-1 rounded-full;
}
</style>
