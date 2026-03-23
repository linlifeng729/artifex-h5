<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { isIOS } from '@/utils'
import { WX_MP_OPENID_KEY, WX_OA_CONFIG_URL_KEY } from '@/utils/constants'

const route = useRoute()

function initPage() {
  // openid（微信小程序）
  if (route.query.mpOpenid) sessionStorage.setItem(WX_MP_OPENID_KEY, String(route.query.mpOpenid))

  // IOS 使用初次进入页面的 URL 进行签名（微信公众号）
  if (isIOS()) sessionStorage.setItem(WX_OA_CONFIG_URL_KEY, location.href.split('#')[0])
}

onMounted(initPage)
</script>

<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
