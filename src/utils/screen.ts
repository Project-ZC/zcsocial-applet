// 屏幕信息工具函数

export interface ScreenInfo {
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

// 获取屏幕信息
export const getScreenInfo = (): ScreenInfo => {
  try {
    const systemInfo = uni.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 0;
    
    return {
      screenWidth: systemInfo.screenWidth || 375,
      screenHeight: systemInfo.screenHeight || 667,
      windowWidth: systemInfo.windowWidth || 375,
      windowHeight: systemInfo.windowHeight || 667,
      pixelRatio: systemInfo.pixelRatio || 2,
      statusBarHeight: statusBarHeight,
      safeArea: systemInfo.safeArea || {
        left: 0,
        right: systemInfo.screenWidth || 375,
        top: statusBarHeight,
        bottom: systemInfo.screenHeight || 667,
        width: systemInfo.screenWidth || 375,
        height: (systemInfo.screenHeight || 667) - statusBarHeight
      }
    };
  } catch (error) {
    console.error('获取屏幕信息失败:', error);
    // 返回默认值
    return {
      screenWidth: 375,
      screenHeight: 667,
      windowWidth: 375,
      windowHeight: 667,
      pixelRatio: 2,
      statusBarHeight: 20,
      safeArea: {
        left: 0,
        right: 375,
        top: 20,
        bottom: 667,
        width: 375,
        height: 647
      }
    };
  }
};

// 获取屏幕宽度
export const getScreenWidth = (): number => {
  return getScreenInfo().screenWidth;
};

// 获取屏幕高度
export const getScreenHeight = (): number => {
  return getScreenInfo().screenHeight;
};

// 获取窗口宽度
export const getWindowWidth = (): number => {
  return getScreenInfo().windowWidth;
};

// 获取窗口高度
export const getWindowHeight = (): number => {
  return getScreenInfo().windowHeight;
};

// 获取状态栏高度
export const getStatusBarHeight = (): number => {
  return getScreenInfo().statusBarHeight;
};

// 获取安全区域信息
export const getSafeArea = () => {
  return getScreenInfo().safeArea;
};

// 判断是否为小屏幕设备
export const isSmallScreen = (): boolean => {
  const width = getScreenWidth();
  return width < 375;
};

// 判断是否为大屏幕设备
export const isLargeScreen = (): boolean => {
  const width = getScreenWidth();
  return width > 414;
};

// 获取设备像素比
export const getPixelRatio = (): number => {
  return getScreenInfo().pixelRatio;
};

// 将px转换为rpx
export const pxToRpx = (px: number): number => {
  const screenWidth = getScreenWidth();
  return (px / 750) * screenWidth;
};

// 将rpx转换为px
export const rpxToPx = (rpx: number): number => {
  const screenWidth = getScreenWidth();
  return (rpx * 750) / screenWidth;
};

// 获取响应式尺寸
export const getResponsiveSize = (small: number, medium: number, large: number): number => {
  const width = getScreenWidth();
  if (width < 375) {
    return small;
  } else if (width > 414) {
    return large;
  } else {
    return medium;
  }
}; 