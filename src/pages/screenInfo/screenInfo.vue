<template>
  <view class="screen-info">
    <view class="header">
      <text class="title">屏幕信息</text>
    </view>
    
    <view class="content">
      <view class="info-section">
        <text class="section-title">基本信息</text>
        <view class="info-item">
          <text class="label">屏幕宽度:</text>
          <text class="value">{{ screenInfo.screenWidth }}px</text>
        </view>
        <view class="info-item">
          <text class="label">屏幕高度:</text>
          <text class="value">{{ screenInfo.screenHeight }}px</text>
        </view>
        <view class="info-item">
          <text class="label">窗口宽度:</text>
          <text class="value">{{ screenInfo.windowWidth }}px</text>
        </view>
        <view class="info-item">
          <text class="label">窗口高度:</text>
          <text class="value">{{ screenInfo.windowHeight }}px</text>
        </view>
        <view class="info-item">
          <text class="label">设备像素比:</text>
          <text class="value">{{ screenInfo.pixelRatio }}</text>
        </view>
        <view class="info-item">
          <text class="label">状态栏高度:</text>
          <text class="value">{{ screenInfo.statusBarHeight }}px</text>
        </view>
      </view>
      
      <view class="info-section">
        <text class="section-title">安全区域</text>
        <view class="info-item">
          <text class="label">左边界:</text>
          <text class="value">{{ screenInfo.safeArea.left }}px</text>
        </view>
        <view class="info-item">
          <text class="label">右边界:</text>
          <text class="value">{{ screenInfo.safeArea.right }}px</text>
        </view>
        <view class="info-item">
          <text class="label">上边界:</text>
          <text class="value">{{ screenInfo.safeArea.top }}px</text>
        </view>
        <view class="info-item">
          <text class="label">下边界:</text>
          <text class="value">{{ screenInfo.safeArea.bottom }}px</text>
        </view>
        <view class="info-item">
          <text class="label">安全区域宽度:</text>
          <text class="value">{{ screenInfo.safeArea.width }}px</text>
        </view>
        <view class="info-item">
          <text class="label">安全区域高度:</text>
          <text class="value">{{ screenInfo.safeArea.height }}px</text>
        </view>
      </view>
      
      <view class="info-section">
        <text class="section-title">设备类型</text>
        <view class="info-item">
          <text class="label">小屏幕设备:</text>
          <text class="value">{{ isSmallScreen ? '是' : '否' }}</text>
        </view>
        <view class="info-item">
          <text class="label">大屏幕设备:</text>
          <text class="value">{{ isLargeScreen ? '是' : '否' }}</text>
        </view>
      </view>
      
      <view class="info-section">
        <text class="section-title">单位转换</text>
        <view class="info-item">
          <text class="label">100px = </text>
          <text class="value">{{ pxToRpx(100) }}rpx</text>
        </view>
        <view class="info-item">
          <text class="label">100rpx = </text>
          <text class="value">{{ rpxToPx(100) }}px</text>
        </view>
      </view>
      
      <view class="info-section">
        <text class="section-title">响应式尺寸</text>
        <view class="info-item">
          <text class="label">小屏尺寸:</text>
          <text class="value">{{ responsiveSize(12, 14, 16) }}px</text>
        </view>
      </view>
      
      <view class="button-section">
        <button class="refresh-btn" @tap="refreshInfo">刷新信息</button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import {
    getResponsiveSize,
    getScreenInfo,
    isLargeScreen,
    isSmallScreen,
    pxToRpx,
    rpxToPx
} from '@/utils/screen'
import { computed, ref } from 'vue'

const screenInfo = ref(getScreenInfo())

const refreshInfo = () => {
  screenInfo.value = getScreenInfo()
  uni.showToast({
    title: '信息已刷新',
    icon: 'success',
    duration: 1000
  })
}

const responsiveSize = computed(() => {
  return getResponsiveSize(12, 14, 16)
})
</script>

<style lang="scss" scoped>
.screen-info {
  min-height: 100vh;
  background-color: #f5f5f5;
  
  .header {
    background: #fff;
    padding: 20rpx;
    text-align: center;
    border-bottom: 1rpx solid #eee;
    
    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
  }
  
  .content {
    padding: 20rpx;
    
    .info-section {
      background: #fff;
      border-radius: 12rpx;
      padding: 30rpx;
      margin-bottom: 20rpx;
      
      .section-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 20rpx;
        border-bottom: 1rpx solid #eee;
        padding-bottom: 10rpx;
      }
      
      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15rpx 0;
        border-bottom: 1rpx solid #f5f5f5;
        
        &:last-child {
          border-bottom: none;
        }
        
        .label {
          font-size: 28rpx;
          color: #666;
        }
        
        .value {
          font-size: 28rpx;
          color: #007aff;
          font-weight: bold;
        }
      }
    }
    
    .button-section {
      .refresh-btn {
        width: 100%;
        height: 80rpx;
        background: #007aff;
        color: #fff;
        border: none;
        border-radius: 40rpx;
        font-size: 32rpx;
        
        &:active {
          opacity: 0.8;
        }
      }
    }
  }
}
</style> 