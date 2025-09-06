<template>
  <view v-if="!isHidden" class="advertisement-container">
    <!-- 广告内容区域 -->
    <view class="advertisement-content" :style="{ height: height }">
      <view class="advertisement-image" @click="handleImageClick">
        <up-image :src="advertisement.image" width="100%" height="100%" mode="aspectFill"></up-image>
      </view>

      <!-- 关闭按钮 -->
      <view class="close-btn" @click="handleClose">
        <up-icon name="close" size="20" color="#fff"></up-icon>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { uniCache } from '@/utils/storage';
import { ref, onMounted } from 'vue';

interface Advertisement {
  image: string;
  link?: string;
  id?: string;
}

interface Props {
  advertisement: Advertisement;
  height?: string;
  storageKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  height: '200rpx',
  storageKey: 'advertisement_hidden',
});

const emit = defineEmits(['click', 'close']);

// 是否隐藏广告
const isHidden = ref(false);

// 处理图片点击
const handleImageClick = () => {
  emit('click', props.advertisement);

  // 如果有链接，进行跳转
  if (props.advertisement.link) {
    try {
      // 判断链接类型
      if (props.advertisement.link.startsWith('http')) {
        // 外部链接 - 这里可以根据需要实现webview页面
        console.log('外部链接:', props.advertisement.link);
        // 暂时使用复制到剪贴板的方式
        uni.setClipboardData({
          data: props.advertisement.link,
          success: () => {
            uni.showToast({
              title: '链接已复制到剪贴板',
              icon: 'success',
            });
          },
        });
      } else {
        // 内部页面
        uni.navigateTo({
          url: props.advertisement.link,
        });
      }
    } catch (error) {
      console.error('跳转失败:', error);
      uni.showToast({
        title: '跳转失败',
        icon: 'error',
      });
    }
  }
};

// 处理关闭
const handleClose = () => {
  isHidden.value = true;

  // 保存到本地存储，用户收起后不再展示
  uniCache.setItem(props.storageKey, true);

  emit('close', props.advertisement);
};

// 检查是否已经隐藏过
const checkHiddenStatus = () => {
  try {
    const hidden = uniCache.getItem(props.storageKey);
    if (hidden) {
      isHidden.value = true;
    }
  } catch (error) {
    console.error('获取广告隐藏状态失败:', error);
  }
};

// 组件挂载时检查隐藏状态
onMounted(() => {
  checkHiddenStatus();
});

defineOptions({
  options: {
    styleIsolation: 'shared',
  },
});
</script>

<style lang="scss" scoped>
.advertisement-container {
  width: 100%;
  position: relative;
}

.advertisement-content {
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 16rpx 16rpx;
}

.advertisement-image {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:active {
    transform: scale(0.98);
  }
}

.close-btn {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 60rpx;
  height: 60rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;

  &:active {
    transform: scale(0.9);
    background: rgba(0, 0, 0, 0.7);
  }
}
</style>
