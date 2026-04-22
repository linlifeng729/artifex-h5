<template>
  <div class="fixed bottom-0 left-0 right-0 flex items-end gap-2 px-3 z-[100] pb-safe" style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border-top: 1px solid rgba(255, 255, 255, 0.3);">
    <div
      class="message-input__field flex-1 rounded-[20px] overflow-hidden transition-colors duration-200"
      :class="focused ? 'border-[1.5px]' : 'border'"
      :style="focused
        ? 'border-color: rgba(60, 179, 113, 0.5); background: rgba(255, 255, 255, 0.15);'
        : 'border-color: rgba(255, 255, 255, 0.2); background: rgba(255, 255, 255, 0.1);'"
    >
      <van-field
        ref="fieldRef"
        v-model="inputValue"
        type="textarea"
        :rows="1"
        autosize
        maxlength="500"
        placeholder="说点什么..."
        @keyup.enter.exact.prevent="handleSend"
        @focus="focused = true"
        @blur="focused = false"
      />
    </div>
    <button
      class="w-14 h-9 rounded-[18px] text-sm font-medium text-white flex-shrink-0 transition-opacity mb-0.5"
      :class="canSend ? '' : 'cursor-not-allowed'"
      :style="canSend
        ? 'background: linear-gradient(135deg, #3cb371, #2e8b57); box-shadow: 0 2px 8px rgba(60, 179, 113, 0.3);'
        : 'background: rgba(255, 255, 255, 0.15); color: rgba(255, 255, 255, 0.3); box-shadow: none;'"
      :disabled="!canSend"
      @click="handleSend"
    >
      发送
    </button>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { Field as VanField } from 'vant';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['send']);
const focused = ref(false);
const inputValue = ref('');
const fieldRef = ref(null);

const canSend = computed(() => {
  return (
    inputValue.value.trim().length > 0 &&
    inputValue.value.trim().length <= 500 &&
    !props.disabled
  );
});

function handleSend() {
  if (!canSend.value) return;
  const content = inputValue.value.trim();
  inputValue.value = '';
  emit('send', content);
  nextTick(() => {
    fieldRef.value?.focus();
  });
}
</script>

<style scoped>
.pb-safe {
  padding: 16px;
}
</style>
