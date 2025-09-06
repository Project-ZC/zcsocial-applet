<template>
  <view class="video-container">
    <video
      id="video"
      :src="videoUrl"
      class="video-player"
      controls
      autoplay
      @ended="handleVideoEnd"
      @error="handleVideoError"
    ></video>
  </view>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const videoUrl = ref<string>('');

const handleBack = () => {
  uni.navigateBack({
    delta: 1,
  });
};

const handleVideoEnd = () => {
  handleBack();
};

const handleVideoError = () => {
  uni.showToast({
    title: '视频播放失败',
    icon: 'none',
  });
  handleBack();
};

onLoad((options: any) => {
  if (options?.url) {
    videoUrl.value = decodeURIComponent(options.url);
    const proxy = getCurrentInstance()?.proxy as any;
    const videoContext = uni.createVideoContext('video', proxy);
    setTimeout(() => {
      // 进入全屏模式
      videoContext.requestFullScreen();
    }, 100);
  } else {
    uni.showToast({
      title: '视频地址无效',
      icon: 'none',
    });
    handleBack();
  }
});
</script>

<style lang="scss">
.video-container {
  width: 100vw;
  height: 100vh;
  background-color: var(--bg-1);
  display: flex;
  align-items: center;
  justify-content: center;

  .video-player {
    width: 100%;
    height: 100%;
  }
}
</style>
