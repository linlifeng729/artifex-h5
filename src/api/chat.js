import { http } from '@/utils/request';

export function getChatHistory(params) {
  return http.get('/api/chat/messages', params);
}

export function getOnlineCount() {
  return http.get('/api/chat/online-count');
}
