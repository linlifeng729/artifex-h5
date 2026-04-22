<template>
  <div class="flex gap-[10px] mb-3 px-3" :class="isSelf ? 'flex-row-reverse' : ''">
    <div class="w-[38px] h-[38px] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style="background: linear-gradient(135deg, #667eea, #764ba2); box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);">
      <img v-if="avatar" :src="avatar" alt="avatar" class="w-full h-full object-cover" @error="onAvatarError" />
      <span v-else class="text-sm font-semibold text-white">{{ nickname?.slice(0, 1) }}</span>
    </div>
    <div class="max-w-[72%] flex flex-col gap-1" :class="isSelf ? 'items-end' : ''">
      <div class="text-[11px] text-white/45 px-1">{{ nickname }}</div>
      <div
        class="inline-block px-3 py-2.5 rounded-2xl text-[15px] leading-[1.45] break-all whitespace-pre-wrap"
        :style="isSelf
          ? 'background: linear-gradient(135deg, #3cb371, #2e8b57); color: white; box-shadow: 0 2px 8px rgba(60, 179, 113, 0.25);'
          : 'background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.12);'"
      >
        {{ content }}
      </div>
      <div class="text-[10px] text-white/25 px-1" :class="isSelf ? 'text-right' : ''">{{ formattedTime }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

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

const avatarLoadError = ref(false);

const isSelf = computed(() => {
  return props.message.userId && props.currentUserId === props.message.userId;
});
const nickname = computed(() => props.message.nickname);
const content = computed(() => props.message.content);
const avatar = computed(() => {
  if (avatarLoadError.value) return null;
  return props.message.avatar || null;
});

const formattedTime = computed(() => {
  const ts = props.message.sendTime || props.message.timestamp;
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
});

watch(() => props.message.avatar, () => {
  avatarLoadError.value = false;
});

function onAvatarError(e) {
  e.target.style.display = 'none';
  avatarLoadError.value = true;
}
</script>
