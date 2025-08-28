# 屏幕信息工具函数

## 功能概述

提供了一套完整的屏幕信息获取和处理的工具函数，包括屏幕尺寸、安全区域、单位转换等功能。

## 主要功能

### 1. 基本信息获取

```typescript
import { getScreenInfo, getScreenWidth, getScreenHeight } from '@/utils/screen'

// 获取完整的屏幕信息
const screenInfo = getScreenInfo()
console.log(screenInfo.screenWidth) // 屏幕宽度
console.log(screenInfo.screenHeight) // 屏幕高度
console.log(screenInfo.windowWidth) // 窗口宽度
console.log(screenInfo.windowHeight) // 窗口高度
console.log(screenInfo.pixelRatio) // 设备像素比
console.log(screenInfo.statusBarHeight) // 状态栏高度

// 单独获取某个值
const width = getScreenWidth()
const height = getScreenHeight()
```

### 2. 安全区域信息

```typescript
import { getSafeArea } from '@/utils/screen'

const safeArea = getSafeArea()
console.log(safeArea.left) // 左边界
console.log(safeArea.right) // 右边界
console.log(safeArea.top) // 上边界
console.log(safeArea.bottom) // 下边界
console.log(safeArea.width) // 安全区域宽度
console.log(safeArea.height) // 安全区域高度
```

### 3. 设备类型判断

```typescript
import { isSmallScreen, isLargeScreen } from '@/utils/screen'

if (isSmallScreen()) {
  console.log('这是小屏幕设备')
}

if (isLargeScreen()) {
  console.log('这是大屏幕设备')
}
```

### 4. 单位转换

```typescript
import { pxToRpx, rpxToPx } from '@/utils/screen'

// px 转 rpx
const rpx = pxToRpx(100) // 将100px转换为rpx

// rpx 转 px
const px = rpxToPx(100) // 将100rpx转换为px
```

### 5. 响应式尺寸

```typescript
import { getResponsiveSize } from '@/utils/screen'

// 根据屏幕大小返回不同的尺寸
const fontSize = getResponsiveSize(12, 14, 16)
// 小屏幕返回12，中等屏幕返回14，大屏幕返回16
```

## 使用示例

### 在组件中使用

```vue
<template>
  <view class="container" :style="{ width: screenWidth + 'px' }">
    <text :style="{ fontSize: responsiveFontSize + 'px' }">
      响应式文本
    </text>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getScreenWidth, getResponsiveSize } from '@/utils/screen'

const screenWidth = ref(getScreenWidth())
const responsiveFontSize = computed(() => {
  return getResponsiveSize(12, 14, 16)
})
</script>
```

### 在样式中使用

```scss
.container {
  width: 100%;
  max-width: 750rpx; // 使用rpx单位
  
  @media screen and (max-width: 375px) {
    // 小屏幕样式
    padding: 10rpx;
  }
  
  @media screen and (min-width: 414px) {
    // 大屏幕样式
    padding: 20rpx;
  }
}
```

## 注意事项

1. **异步获取**: 某些情况下可能需要异步获取屏幕信息
2. **平台差异**: 不同平台的屏幕信息可能有差异
3. **动态变化**: 屏幕旋转时可能需要重新获取信息
4. **错误处理**: 函数已包含错误处理，会返回默认值

## 测试页面

访问 `/pages/screen-info/screen-info` 页面可以查看完整的屏幕信息。

## 类型定义

```typescript
interface ScreenInfo {
  screenWidth: number;
  screenHeight: number;
  windowWidth: number;
  windowHeight: number;
  pixelRatio: number;
  statusBarHeight: number;
  safeArea: {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
  };
}
``` 