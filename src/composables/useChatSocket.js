import { io } from 'socket.io-client'
import { ref, readonly } from 'vue'
import { useAuthStore } from '@/stores/auth'

const WS_PATH = import.meta.env.VITE_WS_PATH
const RECONNECT_INTERVAL = 3000
const HEARTBEAT_INTERVAL = 15000
const MAX_RECONNECT_ATTEMPTS = 10
const PENDING_KEY = 'chat_pending_messages'

function loadPending() {
  try {
    return JSON.parse(sessionStorage.getItem(PENDING_KEY) || '[]')
  } catch {
    return []
  }
}

function savePending(messages) {
  if (messages.length > 0) {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(messages))
  } else {
    sessionStorage.removeItem(PENDING_KEY)
  }
}

/**
 * @typedef {Object} ChatSocketOptions
 * @property {(payload: object) => void} [onJoinAck]
 * @property {(msg: object) => void} [onMessage]
 * @property {(payload: object) => void} [onHistory]
 * @property {(payload: object) => void} [onSystem]
 * @property {(count: number) => void} [onOnlineCount]
 * @property {(error: object) => void} [onError]
 * @property {() => void} [onConnected]
 * @property {(reason: string) => void} [onDisconnected]
 */

/**
 * useChatSocket — 聊天 WebSocket composable
 *
 * 自动管理 socket 生命周期（连接/心跳/重连/断开），
 * 组件卸载时自动清理，无需手动 disconnect。
 *
 * @returns {{
 *   connect: (options: ChatSocketOptions) => void,
 *   sendMessage: (content: string) => string | null,
 *   requestHistory: (beforeId: number | null, limit?: number) => void,
 *   reAuthenticate: (token: string) => void,
 *   disconnect: () => void,
 *   isConnected: () => boolean,
 *   onlineCount: Readonly<import('vue').Ref<number>>,
 *   currentUserId: Readonly<import('vue').Ref<string | null>>,
 *   isLogin: Readonly<import('vue').Ref<boolean>>,
 * }}
 */
export function useChatSocket() {
  let socket = null
  let heartbeatTimer = null
  let reconnectAttempts = 0
  let pendingMessages = loadPending()
  let isIntentionalDisconnect = false
  let reconnectTimer = null

  const currentUserId = ref(null)
  const isLogin = ref(false)
  const onlineCount = ref(0)

  let _callbacks = null

  function _emit(type, payload) {
    _callbacks?.[type]?.(payload)
  }

  function sendHeartbeat() {
    if (socket?.connected) {
      socket.emit('chat:heartbeat')
    }
  }

  function startHeartbeat() {
    stopHeartbeat()
    heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)
  }

  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  function doSendMessage(content, messageId) {
    if (!socket?.connected) return false
    socket.emit('chat:send', { content, messageId })
    return true
  }

  /**
   * @param {ChatSocketOptions} callbacks
   */
  function connect(callbacks) {
    _callbacks = callbacks

    disconnect(true)

    isIntentionalDisconnect = false
    clearTimeout(reconnectTimer)
    reconnectAttempts = 0

    // token 从 Pinia authStore 获取
    const authStore = useAuthStore()
    const token = authStore.token

    socket = io(WS_PATH, {
      namespace: WS_PATH,
      transports: ['polling', 'websocket'],
      reconnection: false,
      auth: { token },
    })

    socket.on('connect', () => {
      reconnectAttempts = 0
      _emit('onConnected')
      startHeartbeat()
      socket.emit('chat:join', { token })
    })

    socket.on('connect_error', () => {
      stopHeartbeat()
      _emit('onDisconnected', 'connect_error')
    })

    socket.on('disconnect', (reason) => {
      stopHeartbeat()
      if (!isIntentionalDisconnect) {
        reconnectAttempts++
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectTimer = setTimeout(() => connect(callbacks), RECONNECT_INTERVAL)
        }
      }
      _emit('onDisconnected', reason)
    })

    socket.on('chat:join_ack', (payload) => {
      currentUserId.value = payload.userId
      isLogin.value = payload.isLogin

      const localToken = authStore.token
      if (!payload.isLogin && localToken) {
        if (socket?.connected) {
          socket.emit('chat:join', { token: localToken })
        }
        return
      }

      const pending = [...loadPending(), ...pendingMessages]
      pendingMessages = []
      savePending([])
      pending.forEach((item) => {
        doSendMessage(item.content, item.messageId)
      })

      _emit('onJoinAck', payload)
    })

    socket.on('chat:message', (payload) => {
      _emit('onMessage', payload)
    })

    socket.on('chat:history_ack', (payload) => {
      _emit('onHistory', payload)
    })

    socket.on('chat:system', (payload) => {
      _emit('onSystem', payload)
    })

    socket.on('chat:online_count', (payload) => {
      onlineCount.value = payload.onlineCount ?? 0
      _emit('onOnlineCount', payload.onlineCount)
    })

    socket.on('chat:error', (error) => {
      _emit('onError', error)
    })
  }

  /**
   * @param {string} content
   * @returns {string | null}
   */
  function sendMessage(content) {
    if (!socket?.connected) return null
    const messageId = crypto.randomUUID()
    const sent = doSendMessage(content, messageId)
    if (!sent) {
      pendingMessages.push({ content, messageId })
      savePending(pendingMessages)
    }
    return messageId
  }

  /**
   * @param {number | null} beforeId
   * @param {number} [limit]
   */
  function requestHistory(beforeId, limit = 20) {
    if (!socket?.connected) return
    socket.emit('chat:history', { beforeId, limit })
  }

  function reAuthenticate() {
    const token = useAuthStore().token
    if (!token) return
    if (socket?.connected) {
      socket.emit('chat:join', { token })
    }
  }

  function disconnect(silent = false) {
    isIntentionalDisconnect = true
    if (!silent) {
      pendingMessages = []
      savePending([])
    }
    stopHeartbeat()
    clearTimeout(reconnectTimer)
    if (socket) {
      socket.removeAllListeners()
      socket.disconnect()
      socket = null
    }
    if (!silent) {
      currentUserId.value = null
      isLogin.value = false
      _callbacks = null
    }
  }

  function isConnected() {
    return socket?.connected ?? false
  }

  return {
    connect,
    sendMessage,
    requestHistory,
    reAuthenticate,
    disconnect,
    isConnected,
    onlineCount: readonly(onlineCount),
    currentUserId: readonly(currentUserId),
    isLogin: readonly(isLogin),
  }
}
