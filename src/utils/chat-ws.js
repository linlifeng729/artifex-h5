import { io } from 'socket.io-client';

const WS_PATH = import.meta.env.VITE_WS_PATH;
const RECONNECT_INTERVAL = 3000;
const HEARTBEAT_INTERVAL = 15000;
const MAX_RECONNECT_ATTEMPTS = 10;

let socket = null;
let heartbeatTimer = null;
let reconnectAttempts = 0;
let currentUserId = null;
let currentSocketId = null;
let isLogin = false;
let pendingMessages = [];
let isIntentionalDisconnect = false;
let reconnectTimer = null;

/**
 * 从 localStorage 读取当前登录 token
 * @returns {string | null}
 */
export function getStoredToken() {
  return localStorage.getItem('token');
}

/**
 * 从 localStorage 读取当前用户信息
 * @returns {object | null}
 */
export function getStoredUser() {
  const raw = localStorage.getItem('userInfo');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * 建立聊天室 WebSocket 连接
 * @param {object} callbacks
 */
export function connectChat(callbacks) {
  const {
    onJoinAck,
    onMessage,
    onHistory,
    onSystem,
    onOnlineCount,
    onError,
    onConnected,
    onDisconnected,
  } = callbacks;

  if (socket?.connected) {
    socket.disconnect();
  }

  isIntentionalDisconnect = false;
  clearTimeout(reconnectTimer);

  const token = getStoredToken();

  socket = io(WS_PATH, {
    namespace: WS_PATH,
    transports: ['polling', 'websocket'],
    reconnection: false,
    auth: {
      token,
    },
  });

  socket.on('connect', () => {
    reconnectAttempts = 0;
    onConnected?.();
    startHeartbeat();
    socket.emit('chat:join', { token });
  });

  socket.on('connect_error', (err) => {
    stopHeartbeat();
    onDisconnected?.('connect_error');
  });

  socket.on('disconnect', (reason) => {
    stopHeartbeat();
    if (!isIntentionalDisconnect) {
      reconnectAttempts++;
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectTimer = setTimeout(() => connectChat(callbacks), RECONNECT_INTERVAL);
      }
    }
    onDisconnected?.(reason);
  });

    socket.on('chat:join_ack', (payload) => {
    currentUserId = payload.userId;
    currentSocketId = payload.socketId;
    isLogin = payload.isLogin;

    const localToken = getStoredToken();
    if (!payload.isLogin && localToken) {
      upgradeToLogin(localToken);
      return;
    }

    const pending = [...pendingMessages];
    pendingMessages = [];
    pending.forEach((item) => {
      doSendMessage(item.content, item.messageId);
    });

    onJoinAck?.(payload);
  });

  socket.on('chat:message', (payload) => {
    onMessage?.(payload);
  });

  socket.on('chat:history_ack', (payload) => {
    onHistory?.(payload);
  });

  socket.on('chat:system', (payload) => {
    onSystem?.(payload);
  });

  socket.on('chat:online_count', (payload) => {
    onOnlineCount?.(payload.onlineCount);
  });

  socket.on('chat:error', (error) => {
    onError?.(error);
  });
}

/**
 * 携带登录 token 重新发起连接认证（登录升级）
 * @param {string} token JWT token
 */
function upgradeToLogin(token) {
  if (socket?.connected) {
    socket.emit('chat:join', { token });
  }
}

/**
 * 发送聊天消息
 * @param {string} content 消息内容
 * @param {string} messageId 消息 UUID
 */
function doSendMessage(content, messageId) {
  if (!socket?.connected) return false;
  socket.emit('chat:send', { content, messageId });
  return true;
}

/**
 * 发送聊天消息（外部调用入口）
 * @param {string} content 消息内容
 * @returns {string | null} messageId
 */
export function sendChatMessage(content) {
  if (!socket?.connected) return null;
  const messageId = crypto.randomUUID();
  const sent = doSendMessage(content, messageId);
  if (!sent) {
    pendingMessages.push({ content, messageId });
  }
  return messageId;
}

/**
 * 请求历史消息
 * @param {number | null} beforeId 游标
 * @param {number} limit 每页数量
 */
export function requestHistory(beforeId, limit = 20) {
  if (!socket?.connected) return;
  socket.emit('chat:history', { beforeId, limit });
}

/**
 * 主动触发重新认证（供外部调用，如登录成功后）
 * @param {string} token JWT token
 */
export function reAuthenticate(token) {
  if (!token) return;
  if (socket?.connected) {
    socket.emit('chat:join', { token });
  }
}

/**
 * 发送心跳
 */
function sendHeartbeat() {
  if (socket?.connected) {
    socket.emit('chat:heartbeat');
  }
}

/**
 * 开始心跳定时器
 */
function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
}

/**
 * 停止心跳定时器
 */
function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

/**
 * 断开连接（外部显式调用，如退出登录）
 */
export function disconnectChat() {
  isIntentionalDisconnect = true;
  pendingMessages = [];
  stopHeartbeat();
  clearTimeout(reconnectTimer);
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentUserId = null;
  currentSocketId = null;
  isLogin = false;
}

/**
 * 获取当前用户身份（用于消息气泡左右区分）
 */
export function getCurrentUserId() {
  return currentUserId;
}

/**
 * 获取当前登录状态
 */
export function getIsLogin() {
  return isLogin;
}

/**
 * 检查当前是否已连接
 */
export function isConnected() {
  return socket?.connected ?? false;
}
