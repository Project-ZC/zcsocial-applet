<template>
  <view class="theme-switch" @tap="toggleTheme">
    <van-icon :name="isDarkMode ? 'sunny-o' : 'moon-o'" size="24px" />
  </view>
</template>

<script lang="ts" setup>
import { useThemeStore } from '@/stores/theme'
import { computed } from 'vue'

const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.isDarkMode)

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<style lang="scss">
.theme-switch {
  position: fixed;
  right: 20rpx;
  top: 20rpx;
  z-index: 100;
  padding: 10rpx;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
  }
}

.dark-theme {
  .theme-switch {
    background-color: #1c1c1e;
    color: #fff;
  }
}
</style>