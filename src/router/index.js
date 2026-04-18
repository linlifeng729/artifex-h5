import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home/index.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      hideNavBar: true,
    },
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/Chat/ChatRoom.vue'),
    meta: {
      keepAlive: true,
    },
  },
  {
    path: '/nft-detail/:id',
    name: 'NftDetail',
    component: () => import('@/views/Home/components/NftDetail.vue')
  },
  {
    path: '/paymentProcess',
    name: 'PaymentProcess',
    component: () => import('@/views/paymentProcess.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全局前置守卫：记录来源页面（用于登录后回跳）
router.beforeEach((to, from) => {
  if (from.name && from.name !== 'Login') {
    sessionStorage.setItem('loginRedirectFrom', from.fullPath);
  }
  return true;
});

export default router;
