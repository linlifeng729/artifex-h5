<template>
  <div ref="containerRef">
    <template v-for="(item, index) in renderedItems" :key="index">
      <TimeDivider v-if="item.type === 'time'" :timestamp="item.timestamp" />
      <template v-else>
        <SystemMessage
          v-if="item.msg.messageType === 2"
          :message="item.msg"
        />
        <UserMessage
          v-else
          :message="item.msg"
          :currentUserId="currentUserId"
        />
      </template>
    </template>
    <div v-if="messages.length === 0" class="flex justify-center items-center py-10 px-4">
      <span class="text-sm text-white/30">暂无消息，快来发起聊天吧~</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import SystemMessage from './SystemMessage.vue';
import UserMessage from './UserMessage.vue';
import TimeDivider from './TimeDivider.vue';

const TIME_GAP_MS = 5 * 60 * 1000;

const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
  currentUserId: {
    type: String,
    default: null,
  },
});

const renderedItems = computed(() => {
  const items = [];
  props.messages.forEach((msg, i) => {
    const prev = props.messages[i - 1];
    const msgTime = msg.sendTime || msg.timestamp || 0;
    const prevTime = prev ? (prev.sendTime || prev.timestamp || 0) : 0;
    if (!prev || (msgTime - prevTime) > TIME_GAP_MS) {
      items.push({ type: 'time', timestamp: msgTime || Date.now() });
    }
    items.push({ type: 'message', msg });
  });
  return items;
});
</script>
