<template>
  <!-- 状态筛选标签 -->
  <view class="tabs">
    <view
      v-for="(tab, index) in props.list"
      :key="tab.status"
      class="tab-item"
      :class="{ active: currentStatus === tab.status }"
      @tap="switchStatus(tab, index)"
    >
      <text class="tab-title">{{ tab.title }}</text>
      <view class="tab-badge"><up-badge :value="tab.count" /></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
const props = defineProps<{
  list: any[];
  modelValue: string;
}>();
const emit = defineEmits(['update:status', 'change']);
const currentStatus = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newVal: string) => {
    console.log('newVal', newVal);
    currentStatus.value = newVal;
  },
  { immediate: true }
);

// 切换状态
const switchStatus = (tab, index) => {
  currentStatus.value = tab.status;
  emit('update:status', tab.status);
  emit('change', tab, index);
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';
.tabs {
  display: flex;
  background-color: var(--bg-2);
  margin-bottom: $up-box-mg;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 16rpx 0;
    font-size: 28rpx;
    color: var(--text-2);
    border-radius: 8rpx;
    transition: all 0.3s ease;
    position: relative;

    &.active {
      background-color: var(--primary-6);
      color: #fff;
    }

    &:active {
      transform: scale(0.95);
    }

    .tab-badge {
      position: absolute;
      top: -8rpx;
      right: 20rpx;
      min-width: 20rpx;
      text-align: center;
      line-height: 1;
    }
  }
}
</style>
