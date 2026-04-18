<template>
  <div class="fixed bottom-0 left-0 right-0 flex items-center justify-between px-4 z-[100] pb-safe" style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border-top: 1px solid rgba(255, 255, 255, 0.3);">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style="background: rgba(60, 179, 113, 0.2); border: 1px solid rgba(60, 179, 113, 0.3);">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="#fff" stroke-width="2"/>
        </svg>
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-sm font-semibold leading-tight" style="color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,0.6);">登录后可参与聊天</span>
        <span class="text-xs leading-tight" style="color: rgba(255,255,255,0.8); text-shadow: 0 1px 4px rgba(0,0,0,0.5);">未登录用户只能浏览消息</span>
      </div>
    </div>
    <button
      class="px-[18px] py-1.5 rounded-full text-sm font-medium text-white flex-shrink-0 transition-opacity"
      style="background: linear-gradient(135deg, #3cb371, #2e8b57); box-shadow: 0 2px 8px rgba(60, 179, 113, 0.3);"
      @click="$emit('click-login')"
    >
      去登录
    </button>
  </div>
</template>

<script setup>
defineEmits(['click-login']);
</script>

<style scoped>
.pb-safe {
  padding: 20px;
}
</style>
