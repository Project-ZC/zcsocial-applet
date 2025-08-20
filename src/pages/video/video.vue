<template>
  <view class="video-container">
    <video
      :src="videoUrl"
      class="video-player"
      controls
      autoplay
      @ended="handleVideoEnd"
      @error="handleVideoError"
    ></video>
  </view>
</template>

<script>
export default {
  data() {
    return {
      videoUrl: ''
    };
  },
  onLoad(options) {
    if (options.url) {
      this.videoUrl = decodeURIComponent(options.url);
      // 进入全屏模式
      const videoContext = uni.createVideoContext('video', this);
      setTimeout(() => {
        videoContext.requestFullScreen();
      }, 100);
    } else {
      uni.showToast({
        title: '视频地址无效',
        icon: 'none'
      });
      this.handleBack();
    }
  },
  methods: {
    handleVideoEnd() {
      this.handleBack();
    },
    handleVideoError() {
      uni.showToast({
        title: '视频播放失败',
        icon: 'none'
      });
      this.handleBack();
    },
    handleBack() {
      uni.navigateBack({
        delta: 1
      });
    }
  }
};
</script>

<style lang="scss">
.video-container {
  width: 100vw;
  height: 100vh;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;

  .video-player {
    width: 100%;
    height: 100%;
  }
}
</style>