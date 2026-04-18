<template>
  <div ref="containerRef">
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
    <div v-if="messages.length === 0" class="flex justify-center items-center py-10 px-4">
      <span class="text-sm text-white/30">暂无消息，快来发起聊天吧~</span>
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
