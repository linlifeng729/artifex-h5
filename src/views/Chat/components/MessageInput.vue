<template>
  <div class="message-input">
    <div class="message-input__field">
      <van-field
        v-model="inputValue"
        type="textarea"
        :rows="1"
        autosize
        maxlength="500"
        placeholder="说点什么..."
        @keyup.enter.exact.prevent="handleSend"
      />
    </div>
    <button
      class="message-input__send"
      :class="{ 'message-input__send--disabled': !canSend }"
      :disabled="!canSend"
      @click="handleSend"
    >
      发送
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Field as VanField } from 'vant';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['send']);

const inputValue = ref('');

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
}
</script>

<style scoped>
.message-input {
  @apply fixed bottom-0 left-0 right-0 flex items-end gap-2 p-2 bg-[rgba(28,28,30,0.95)] backdrop-blur-[10px] border-t border-[rgba(255,255,255,0.1)] z-[100];
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
}

.message-input__field {
  @apply flex-1 bg-[rgba(255,255,255,0.08)] rounded-[20px] overflow-hidden;
}

.message-input__field :deep(.van-field__control) {
  color: #ffffff;
  font-size: 15px;
  padding: 8px 14px;
  line-height: 1.4;
}

.message-input__field :deep(.van-field__control::placeholder) {
  color: rgba(255, 255, 255, 0.4);
}

.message-input__field :deep(.van-field__control-wrapper) {
  padding-bottom: 0;
}

.message-input__send {
  @apply w-14 h-9 bg-[#3cb371] border-none rounded-[18px] text-sm font-medium text-white cursor-pointer flex-shrink-0 transition-opacity mb-0.5;
}

.message-input__send:active:not(.message-input__send--disabled) {
  opacity: 0.8;
}

.message-input__send--disabled {
  @apply bg-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.3)] cursor-not-allowed;
}
</style>
