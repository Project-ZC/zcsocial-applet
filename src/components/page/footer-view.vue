<template>
  <view class="footer" :style="{ height: props.footerH + 'px' }">
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  footerH: {
    type: Number;
    default: 80;
  };
}>();
</script>

<style lang="scss" scoped>
@import '@/uni.scss';
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: var(--bg-1);
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid var(--border-1);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 2;
  box-sizing: border-box;
}
</style>
