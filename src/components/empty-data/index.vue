<template>
  <view class="empty-data" :style="{ width: props.width, height: props.height }">
    <up-empty
      v-bind="attrs"
      :text="props.text"
      :icon="props.icon"
      :mode="props.mode"
      :icon-size="props.iconSize"
      :width="props.iconWidth"
      :height="props.iconHeight"
    >
      <div class="subtext" v-if="$slots.subtext || props.subtext">
        <text>{{ props.subtext }}</text>
        <slot name="subtext"></slot>
      </div>

      <slot></slot>
    </up-empty>
  </view>
</template>

<script lang="ts" setup>
import { useAttrs, defineProps } from 'vue';

defineOptions({
  name: 'EmptyData',
  options: {
    styleIsolation: 'shared',
  },
});

const attrs = useAttrs();
const props = withDefaults(
  defineProps<{
    width?: string;
    height?: string;
    text?: string;
    icon?: string;
    mode?: string;
    iconWidth?: string;
    iconHeight?: string;
    iconSize?: string;
  }>(),
  {
    width: '100%',
    height: '100%',
    text: '暂无数据',
    icon: '/static/images/no-data.png',
    mode: '',
    iconWidth: '80',
    iconHeight: '80',
    iconSize: '50',
  }
);
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.empty-data {
  padding: 40rpx;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
}

.subtext {
  font-size: $up-font-sm;
  color: var(--text-3);
  margin-top: 10rpx;
  text-align: center;
}

:deep(.u-empty__text) {
  margin-top: 12rpx;
  color: var(--text-2) !important;
}
</style>
