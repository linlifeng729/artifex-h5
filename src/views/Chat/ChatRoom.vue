<template>
  <div class="chat-room">
    <van-nav-bar title="聊天室" fixed />
    <div class="pt-[46px] pb-[140px]">
      <van-list
        ref="messageListRef"
        :finished="historyFinished"
        :loading="historyLoading"
        finished-text="没有更多了"
        @load="loadMoreHistory"
      >
        <MessageList
          :messages="messages"
          :currentUserId="currentUserId"
        />
      </van-list>
    </div>
    <LoginPrompt
      v-if="!isLogin"
      @click-login="goToLogin"
    />
    <MessageInput
      v-else
      @send="handleSend"
      :disabled="sending"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import {
  connectChat,
  disconnectChat,
  sendChatMessage,
  requestHistory,
  reAuthenticate,
  getStoredToken,
  isConnected,
} from '@/utils/chat-ws';
import MessageList from './components/MessageList.vue';
import MessageInput from './components/MessageInput.vue';
import LoginPrompt from './components/LoginPrompt.vue';
import { WSErrorCode } from '@/utils/chat-types';

const router = useRouter();

const messages = ref([]);
const currentUserId = ref(null);
const isLogin = ref(false);
const sending = ref(false);
const historyLoading = ref(false);
const historyFinished = ref(false);
const nextBeforeId = ref(null);
const messageListRef = ref(null);

// ========== 生命周期 ==========

onMounted(() => {
  connectChat({
    onJoinAck: (payload) => {
      currentUserId.value = payload.userId;
      isLogin.value = payload.isLogin;
      requestHistory(null, 20);
    },
    onMessage: (msg) => addMessage(msg),
    onHistory: ({ list, hasMore, nextBeforeId: nextId }) => {
      messages.value = [...list.reverse(), ...messages.value];
      nextBeforeId.value = nextId;
      if (!hasMore) {
        historyFinished.value = true;
      }
      historyLoading.value = false;
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
  });
});

onUnmounted(() => {
  disconnectChat();
});

// ========== 登录状态监听 ==========

watch(isLogin, (newVal, oldVal) => {
  if (oldVal === false && newVal === true) {
    reAuthenticate(getStoredToken());
  }
});

// ========== 事件处理 ==========

function addMessage(msg) {
  messages.value.push(msg);
  scrollToBottom();
}

async function handleSend(content) {
  if (sending.value) return;
  sending.value = true;
  try {
    const messageId = sendChatMessage(content);
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
      isLogin.value = false;
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

function scrollToBottom() {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollToBottom();
    }
  });
}

function goToLogin() {
  router.push({
    path: '/login',
    query: { redirect: router.currentRoute.value.fullPath },
  });
}
</script>
