<template>
  <view class="status-container">
    <text class="status-dot" :class="props.state"></text>
    <up-tag plain v-if="props.state == 'open'" plainFill size="mini" type="success" :text="statusText"></up-tag>
    <up-tag plain v-else-if="props.state == 'close'" plainFill size="mini" type="error" :text="statusText"></up-tag>
    <up-tag
      plain
      v-else-if="props.state == 'close_manual'"
      plainFill
      type="warning"
      size="mini"
      :text="statusText"
    ></up-tag>
    <up-tag
      plain
      v-else
      plainFill
      text="未知状态"
      bgColor="var(--text-3)"
      color="#fff"
      size="mini"
      borderColor="transparent"
    ></up-tag>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useShopStore } from '@/stores';

const shopStore = useShopStore();
const props = defineProps<{
  state: string;
}>();
const statusText = computed(() => {
  return shopStore.getShopStatusText(props.state);
});

defineOptions({
  options: {
    styleIsolation: 'shared',
  },
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';
.status-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
:deep(.u-tag) {
  border: 0 !important;
  background: transparent !important;
}
.status-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  margin-right: 0;

  &.open {
    background-color: var(--success-6);
  }
  &.close {
    background-color: var(--danger-6);
  }
  &.close_manual {
    background-color: var(--warning-6);
  }
}
</style>
