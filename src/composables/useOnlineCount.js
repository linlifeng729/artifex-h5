import { io } from 'socket.io-client';
import { ref, readonly } from 'vue';

const WS_PATH = import.meta.env.VITE_WS_PATH;
const RECONNECT_INTERVAL = 3000;

/** @type {import('socket.io-client').Socket | null} */
let countSocket = null;
/** @type {ReturnType<typeof setTimeout> | null} */
let countReconnectTimer = null;
/** @type {number} */
const onlineCount = ref(0);
/** @type {boolean} */
let initialized = false;

function getStoredToken() {
  return localStorage.getItem('token');
}

function connectForOnlineCount() {
  if (countSocket?.connected) return;

  clearTimeout(countReconnectTimer);
  const token = getStoredToken();

  countSocket = io(WS_PATH, {
    namespace: WS_PATH,
    transports: ['websocket'],
    reconnection: false,
    auth: { token },
  });

  countSocket.on('connect', () => {
    countSocket.emit('chat:join', { token });
  });

  countSocket.on('chat:join_ack', () => {});

  countSocket.on('chat:online_count', (payload) => {
    onlineCount.value = payload.onlineCount ?? 0;
  });

  countSocket.on('disconnect', () => {
    countReconnectTimer = setTimeout(connectForOnlineCount, RECONNECT_INTERVAL);
  });
}

function disconnectOnlineCount() {
  clearTimeout(countReconnectTimer);
  if (countSocket) {
    countSocket.disconnect();
    countSocket = null;
  }
}

/**
 * useOnlineCount — 在线人数 composable（App 级别单例）
 *
 * socket 在 App.vue 中初始化，之后常驻。
 * 各组件调用此 composable 只读取 onlineCount，不参与连接管理。
 *
 * @returns {{ onlineCount: Readonly<import('vue').Ref<number>> }}
 */
export function useOnlineCount() {
  return {
    onlineCount: readonly(onlineCount),
  };
}

/**
 * 在 App 根组件中调用一次，初始化在线人数 socket。
 * 多次调用无副作用。
 */
export function initOnlineCount() {
  if (initialized) return;
  initialized = true;
  connectForOnlineCount();
}

/**
 * 退出登录或需要完全清理时调用（通常不需要）
 */
export function destroyOnlineCount() {
  initialized = false;
  disconnectOnlineCount();
}
