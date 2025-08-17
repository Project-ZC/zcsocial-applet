<template>
<view class="empty-data">
   <up-empty v-bind="attrs" :text="props.text" :icon="props.icon" :mode="props.mode">

    <div class="subtext" v-if="$slots.subtext">
      <slot name="subtext"></slot>

    </div>

    <slot></slot>
   </up-empty>
</view>
</template>

<script lang="ts" setup>
import { useAttrs, defineProps } from 'vue';

const attrs = useAttrs();
const props = withDefaults(defineProps(), {
  text: '暂无数据',
  icon: '/static/images/no-data.png',
  mode: '',
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';
.subtext{
  font-size: $up-font-sm;
  color: #999;
  margin-top: 10rpx;
}

</style>
