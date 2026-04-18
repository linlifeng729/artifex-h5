<template>
  <div class="login-prompt">
    <div class="login-prompt__content">
      <div class="login-prompt__icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="#fff" stroke-width="2"/>
        </svg>
      </div>
      <div class="login-prompt__text">
        <span class="login-prompt__title">登录后可参与聊天</span>
        <span class="login-prompt__desc">未登录用户只能浏览消息</span>
      </div>
    </div>
    <button class="login-prompt__btn" @click="$emit('click-login')">
      去登录
    </button>
  </div>
</template>

<script setup>
defineEmits(['click-login']);
</script>

<style scoped>
.login-prompt {
  @apply fixed bottom-0 left-0 right-0 flex items-center justify-between p-3 bg-[rgba(0,0,0,0.85)] backdrop-blur-[10px] border-t border-[rgba(255,255,255,0.1)] z-[100];
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
}

.login-prompt__content {
  @apply flex items-center gap-2;
}

.login-prompt__icon {
  @apply flex items-center justify-center w-9 h-9 rounded-full bg-[rgba(60,179,113,0.2)] flex-shrink-0;
}

.login-prompt__text {
  @apply flex flex-col gap-0.5;
}

.login-prompt__title {
  @apply text-sm font-medium text-white leading-tight;
}

.login-prompt__desc {
  @apply text-xs text-[rgba(255,255,255,0.5)] leading-tight;
}

.login-prompt__btn {
  @apply px-5 py-2 bg-[#3cb371] border-none rounded-[20px] text-sm font-medium text-white cursor-pointer flex-shrink-0 transition-opacity;
}

.login-prompt__btn:active {
  opacity: 0.8;
}
</style>
