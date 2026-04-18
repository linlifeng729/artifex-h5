<template>
  <div class="message-list" ref="containerRef">
    <div
      v-for="(msg, index) in messages"
      :key="msg.messageId || msg.seq || index"
    >
      <SystemMessage
        v-if="msg.messageType === 2"
        :message="msg"
      />
      <UserMessage
        v-else
        :message="msg"
        :currentUserId="currentUserId"
      />
    </div>
    <div v-if="messages.length === 0" class="message-list__empty">
      <span>暂无消息，快来发起聊天吧~</span>
    </div>
  </div>
</template>

<script setup>
import SystemMessage from './SystemMessage.vue';
import UserMessage from './UserMessage.vue';

defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
  currentUserId: {
    type: String,
    default: null,
  },
});
</script>

<style scoped>
.message-list {
  @apply pt-3 min-h-full;
}

.message-list__empty {
  @apply flex justify-center items-center py-10 text-sm text-[rgba(255,255,255,0.35)];
}
</style>
