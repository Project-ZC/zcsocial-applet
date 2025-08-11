<template>
  <!-- 左侧分类导航 -->
  <scroll-view scroll-y="true" class="tabs">
    <view
      class="row"
      :class="[index === showClassifyIndex ? 'active' : '']"
      v-for="(item, index) in data"
      :key="index"
      @tap="tapClassify(index)"
    >
      {{ item.title }}
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref } from "vue";

// 定义接口
interface ClassifyItem {
  title: string;
}

// 定义props
interface Props {
  data: ClassifyItem[];
}

const props = withDefaults(defineProps<Props>(), {
  data: () => []
});

// 定义事件
const emit = defineEmits<{
  change: [index: number];
}>();

// 响应式数据
const showClassifyIndex = ref(0);

// 方法
const tapClassify = (index: number) => {
  showClassifyIndex.value = index;
  emit('change', index);
};
</script>

<style lang="scss" scoped>
.tabs {
  width: 25%;
  height: 100vh;
  background-color: #f5f5f5;
  
  .row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3c3c3c;
    padding: 20rpx;
    box-sizing: border-box;
    position: relative;
    font-size: 28rpx;
    transition: all 0.3s ease;
    
    &.active {
      background-color: #ffffff;
      color: #2d2d2d;
      font-weight: 600;
      font-size: 30rpx;
      
      &::after {
        content: "";
        display: block;
        width: 6rpx;
        height: 60%;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 0;
        background-color: #007aff;
        border-radius: 3rpx;
      }
    }
    
    &:not(.active):hover {
      background-color: #f0f0f0;
    }
  }
}
</style>
