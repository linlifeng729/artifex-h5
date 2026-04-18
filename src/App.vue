<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { initOnlineCount } from '@/composables/useOnlineCount';

const route = useRoute();
const shouldKeepAlive = computed(() => !route.meta.keepAlive);

onMounted(() => {
  initOnlineCount();
});
</script>

<template>
  <router-view v-slot="{ Component }">
    <keep-alive v-if="shouldKeepAlive" include>
      <component :is="Component" />
    </keep-alive>
    <component v-else :is="Component" />
  </router-view>
</template>
