<template>
  <div class="flex justify-center items-center my-3 px-4">
    <span class="text-[10px] text-white/25">{{ formatted }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  timestamp: {
    type: Number,
    required: true,
  },
});

const formatted = computed(() => {
  const d = new Date(props.timestamp);
  const now = new Date();
  const time = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return time;
  const isThisYear = d.getFullYear() === now.getFullYear();
  if (isThisYear) return `${d.getMonth() + 1}/${d.getDate()} ${time}`;
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${time}`;
});
</script>
