<template>
  <div class="user-message" :class="isSelf ? 'user-message--self' : 'user-message--other'">
    <div class="user-message__avatar">
      <img v-if="avatar" :src="avatar" alt="avatar" />
      <span v-else>{{ nickname?.slice(0, 1) }}</span>
    </div>
    <div class="user-message__body">
      <div class="user-message__nickname">{{ nickname }}</div>
      <div class="user-message__bubble">{{ content }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  currentUserId: {
    type: String,
    default: null,
  },
});

const isSelf = computed(() => {
  return props.message.userId && props.currentUserId === props.message.userId;
});
const nickname = computed(() => props.message.nickname);
const content = computed(() => props.message.content);
const avatar = computed(() => null);
</script>

<style scoped>
.user-message {
  @apply flex gap-2 mb-3 px-3;
}

.user-message--self {
  @apply flex-row-reverse;
}

.user-message__avatar {
  @apply w-9 h-9 rounded-full bg-gradient-to-br from-[#3cb371] to-[#2e8b57] flex items-center justify-center text-sm font-semibold text-white flex-shrink-0 overflow-hidden;
}

.user-message__avatar img {
  @apply w-full h-full object-cover;
}

.user-message__body {
  @apply max-w-[70%] flex flex-col gap-0.5;
}

.user-message--self .user-message__body {
  @apply items-end;
}

.user-message__nickname {
  @apply text-[11px] text-[rgba(255,255,255,0.5)] px-1;
}

.user-message__bubble {
  @apply inline-block px-3 py-2 rounded-xl text-[15px] leading-normal break-words whitespace-pre-wrap;
}

.user-message--other .user-message__bubble {
  @apply bg-[rgba(255,255,255,0.12)] text-white rounded-bl-sm;
}

.user-message--self .user-message__bubble {
  @apply bg-[#3cb371] text-white rounded-br-sm;
}
</style>
