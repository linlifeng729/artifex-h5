<template>
  <div
    class="relative min-h-screen text-white flex flex-col"
    style="background: linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);"
  >
    <!-- 自定义毛玻璃导航栏 -->
    <header class="fixed top-0 left-0 right-0 z-[999] flex items-center justify-between p-4 border-b border-white/10 bg-white/10 backdrop-blur-md">
      <button class="w-7 h-7 flex items-center justify-center bg-white/10 rounded-full border-none cursor-pointer active:bg-white/20" @click="$router.back()">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <h3 class="text-base font-medium bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
        交流群
      </h3>

      <div class="flex items-center gap-3">
        <div style="font-size: 20px; filter: drop-shadow(0 1px 4px rgba(245, 222, 179, 0.3));">🎁</div>
      </div>
    </header>

    <!-- 消息列表 -->
    <div
      ref="scrollContainerRef"
      class="flex-1 overflow-y-auto pt-16 pb-[140px]"
    >
      <!-- 顶部哨兵：触发加载历史 -->
      <div ref="sentinelRef" class="h-0" />

      <div v-if="historyLoading" class="text-center py-2">
        <van-loading size="20" color="#999" />
      </div>
      <div v-if="historyFinished && messages.length > 0" class="text-center py-2">
        <span class="text-xs text-white/30">没有更多了</span>
      </div>

      <MessageList
        :messages="messages"
        :currentUserId="currentUserId"
      />

      <!-- 底部锚点：用于 scrollToBottom -->
      <div ref="bottomAnchorRef" />
    </div>

    <!-- 未登录提示条 -->
    <LoginPrompt
      v-if="!isLogin"
      @click-login="goToLogin"
    />
    <!-- 消息输入框 -->
    <MessageInput
      v-else
      @send="handleSend"
      :disabled="sending"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onActivated, onDeactivated, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useChatSocket } from '@/composables/useChatSocket';
import MessageList from './components/MessageList.vue';
import MessageInput from './components/MessageInput.vue';
import LoginPrompt from './components/LoginPrompt.vue';
import { WSErrorCode } from '@/utils/chat-types';

const MAX_MESSAGES = 200;

const router = useRouter();

const messages = ref([]);
const sending = ref(false);
const historyLoading = ref(false);
const historyFinished = ref(false);
const nextBeforeId = ref(null);
const scrollContainerRef = ref(null);
const sentinelRef = ref(null);
const bottomAnchorRef = ref(null);

let observer = null;

const {
  connect,
  disconnect,
  sendMessage,
  requestHistory,
  reAuthenticate,
  isConnected,
  currentUserId,
  isLogin,
} = useChatSocket();

// ========== WebSocket 回调配置 ==========

function getSocketCallbacks() {
  return {
    onJoinAck: () => {
      requestHistory(null, 20);
    },
    onMessage: (msg) => addMessage(msg),
    onHistory: ({ list, hasMore, nextBeforeId: nextId }) => {
      const container = scrollContainerRef.value;
      const prevScrollHeight = container?.scrollHeight ?? 0;

      messages.value = [...list.reverse(), ...messages.value];
      if (messages.value.length > MAX_MESSAGES) {
        messages.value = messages.value.slice(-MAX_MESSAGES);
      }
      nextBeforeId.value = nextId;
      if (!hasMore) {
        historyFinished.value = true;
      }
      historyLoading.value = false;

      nextTick(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - prevScrollHeight;
        }
      });
    },
    onSystem: (sys) => {
      messages.value.push({ ...sys, messageType: 2 });
    },
    onOnlineCount: () => {},
    onError: ({ code, message }) => handleWsError(code, message),
    onConnected: () => {
      historyLoading.value = false;
    },
    onDisconnected: () => {},
  };
}

// ========== 生命周期 ==========

onMounted(() => {
  initIntersectionObserver();
  connect(getSocketCallbacks());
});

onUnmounted(() => {
  observer?.disconnect();
  observer = null;
  disconnect();
});

onDeactivated(() => {
  disconnect();
});

onActivated(() => {
  initIntersectionObserver();
  connect(getSocketCallbacks());
});

// ========== IntersectionObserver ==========

function initIntersectionObserver() {
  if (observer) return;
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && isConnected() && !historyLoading.value && !historyFinished.value) {
        loadMoreHistory();
      }
    },
    { root: scrollContainerRef.value, rootMargin: '100px 0px' }
  );
  if (sentinelRef.value) {
    observer.observe(sentinelRef.value);
  }
}

// ========== 登录状态监听 ==========

watch(isLogin, (newVal, oldVal) => {
  if (oldVal === false && newVal === true) {
    reAuthenticate();
  }
});

// ========== 事件处理 ==========

function addMessage(msg) {
  messages.value.push(msg);
  if (messages.value.length > MAX_MESSAGES) {
    messages.value.shift();
  }
  scrollToBottom();
}

async function handleSend(content) {
  if (sending.value) return;
  sending.value = true;
  try {
    const messageId = sendMessage(content);
    if (!messageId) {
      showToast('发送失败，请检查网络');
    }
  } finally {
    sending.value = false;
  }
}

function handleWsError(code, message) {
  switch (code) {
    case WSErrorCode.NOT_LOGIN:
      showToast('请先登录后再发送消息');
      break;
    case WSErrorCode.TOKEN_EXPIRED:
      showToast('登录已过期，请重新登录');
      goToLogin();
      break;
    case WSErrorCode.RATE_LIMITED:
      showToast(message || '发送消息过于频繁，请稍后再试');
      break;
    case WSErrorCode.MESSAGE_EMPTY:
      showToast('消息内容不能为空');
      break;
    case WSErrorCode.MESSAGE_TOO_LONG:
      showToast('消息长度不能超过500字符');
      break;
    case WSErrorCode.SERVICE_UNAVAILABLE:
      showToast('服务暂不可用，请稍后重试');
      break;
    default:
      showToast(message || '发生未知错误');
  }
}

async function loadMoreHistory() {
  if (!isConnected() || historyLoading.value || historyFinished.value) {
    historyLoading.value = false;
    return;
  }
  historyLoading.value = true;
  requestHistory(nextBeforeId.value, 20);
}

function scrollToBottom(smooth = true) {
  nextTick(() => {
    bottomAnchorRef.value?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
      block: 'end',
    });
  });
}

function goToLogin() {
  router.push({
    path: '/login',
    query: { redirect: router.currentRoute.value.fullPath },
  });
}
</script>
