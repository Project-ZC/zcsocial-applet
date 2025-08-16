<template>
<view class="empty-data">
   <up-empty v-bind="attrs" :text="props.text" :icon="props.icon" :mode="props.mode"></up-empty>
</view>
</template>

<script lang="ts" setup>
import { useAttrs, defineProps } from 'vue';

const attrs = useAttrs();
const props = withDefaults(defineProps(), {
  text: '暂无数据',
  icon: '/static/images/empty-staff.png',
  mode: '',
});
</script>

<style lang="scss" scoped>

</style>
