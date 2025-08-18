<template>
  <view class="navigation" :style="{ background: bgcolor }">
    <view class="nav--bar-top" :style="{ height: menuButton.top + 'px' }"></view>
    <view class="nav-bar-inner">
      <view
        class="address-box"
        :style="{ height: menuButton.height + 'px' }"
        @tap="handleLocationClick"
      >
        <up-icon name="map" color="#000" />
        <text class="address">{{ currentAddress }}</text>
        <!-- <up-icon v-if="isLocating" name="loading" color="#000" /> -->
      </view>
      <view class="search-box" :style="{ width: screenInfo.screenWidth - menuButton.width - 80 + 'px' }">
        <up-search
          :clearabled="true"
          :showAction="false"
          placeholder="请输入Homebar名字"
        ></up-search>
      </view>
      <view
        class="base-box"
        :style="{ height: menuButton.height + 'px', width: menuButton.width + 'px' }"
      ></view>
    </view>
    <!-- 设置胶囊离内容距离 -->
    <!-- <view class="nav-bar-buttom" style="height: 8px"></view> -->
  </view>
</template>

<script lang="ts" setup>
import { getMapApiKey, isApiKeyConfigured, MAP_CONFIG } from "@/config/map";
import { getScreenInfo } from "@/utils/screen";
import { onMounted, ref } from "vue";

// 获取父组件传递的自定义属性值
const props = defineProps({
  bgcolor: {
    type: String,
    default: "#fff",
  },
  color: {
    type: String,
    default: "#000",
  },
});

// 获取不同机型胶囊按钮对应的属性值（宽高，胶囊距离顶部的距离）
const menuButton = ref(uni.getMenuButtonBoundingClientRect());
const prevLength = ref(0);
const currentAddress = ref();
const isLocating = ref(false);
const screenInfo = ref(getScreenInfo());

onMounted(() => {
  getPrevPage();
  getCurrentLocation();
  updateScreenInfo();
});

// 更新屏幕信息
const updateScreenInfo = () => {
  screenInfo.value = getScreenInfo();
};

// 获取跳转页面的路径，用于返回操作
const getPrevPage = () => {
  const page = getCurrentPages();
  prevLength.value = page.length;
  if (page.length == 2) {
    // 修复 TypeScript 错误，使用类型断言
    const currentPage = page[0] as any;
    uni.setStorageSync("prevPage", currentPage.$page?.fullPath || "");
  }
};

// 胶囊--返回
const clickBack = () => {
  if (prevLength.value > 2) {
    uni.navigateBack();
  } else {
    uni.switchTab({
      url: uni.getStorageSync("prevPage"),
      success: function () {
        const pages = getCurrentPages();
        const page = pages.pop();
        if (page) {
          // 使用类型断言处理 onLoad 方法
          const pageInstance = page as any;
          if (typeof pageInstance.onLoad === "function") {
            pageInstance.onLoad();
          }
        }
      },
    });
  }
};

// 胶囊--首页
const clickHome = () => {
  uni.switchTab({
    url: "/pages/index/index",
  });
};

// 获取当前位置
const getCurrentLocation = () => {
  isLocating.value = true;

  // 检查定位权限
  uni.getSetting({
    success: (res) => {
      if (res.authSetting["scope.userLocation"] === false) {
        // 用户拒绝了定位权限，引导用户开启
        uni.showModal({
          title: "需要定位权限",
          content: "为了提供更好的服务，需要获取您的位置信息",
          confirmText: "去设置",
          cancelText: "取消",
          success: (modalRes) => {
            if (modalRes.confirm) {
              uni.openSetting({
                success: (settingRes) => {
                  if (settingRes.authSetting["scope.userLocation"]) {
                    // 用户开启了定位权限，重新获取位置
                    getLocationData();
                  } else {
                    currentAddress.value = "";
                    isLocating.value = false;
                  }
                },
              });
            } else {
              currentAddress.value = "";
              isLocating.value = false;
            }
          },
        });
      } else {
        // 有权限或未设置，直接获取位置
        getLocationData();
      }
    },
    fail: () => {
      // 获取设置失败，直接尝试获取位置
      getLocationData();
    },
  });
};

// 获取位置数据
const getLocationData = () => {
  uni.getLocation({
    type: "gcj02", // 使用国测局坐标系
    success: function (res) {
      console.log("获取位置数据：", res);
      console.log("当前位置的经度：" + res.longitude);
      console.log("当前位置的纬度：" + res.latitude);

      // 使用逆地理编码获取地址信息
      reverseGeocoder(res.longitude, res.latitude);
    },
    fail: function (err) {
      console.error("获取位置失败：", err);
      currentAddress.value = "";
      isLocating.value = false;

      // 根据错误类型显示不同的提示
      let errorMessage = "定位失败，请检查定位权限";
      if (err.errMsg.includes("timeout")) {
        errorMessage = "定位超时，请重试";
      } else if (err.errMsg.includes("deny")) {
        errorMessage = "定位权限被拒绝";
      } else if (err.errMsg.includes("requiredPrivateInfos")) {
        errorMessage = "定位权限未配置，请联系开发者";
      }

      uni.showToast({
        title: errorMessage,
        icon: "none",
        duration: 2000,
      });
    },
  });
};

// 逆地理编码
const reverseGeocoder = (longitude: number, latitude: number) => {
  // 检查是否有配置的API密钥
  if (isApiKeyConfigured()) {
    // 使用腾讯地图API
    const apiKey = getMapApiKey();
    uni.request({
      url: `${MAP_CONFIG.TENCENT_MAP.GEOCODER_URL}?location=${latitude},${longitude}&key=${apiKey}`,
      success: (res: any) => {
        console.log("逆地理编码：", res);
        if (res.data.status === 0) {
          const result = res.data.result;
          const address =
            result.formatted_addresses?.recommend || result.address || "未知地址";
          currentAddress.value = result.address_component.city;
        } else {
          // API调用失败，使用备用方案
          useFallbackAddress(longitude, latitude);
        }
        isLocating.value = false;
      },
      fail: () => {
        // 网络请求失败，使用备用方案
        useFallbackAddress(longitude, latitude);
      },
    });
  } else {
    // 没有配置API密钥，使用备用方案
    useFallbackAddress(longitude, latitude);
  }
};

// 备用地址解析方案
const useFallbackAddress = (longitude: number, latitude: number) => {
  // 方法2：使用uni-app内置的逆地理编码（仅支持微信小程序）
  // #ifdef MP-WEIXIN
  // 使用类型断言处理微信小程序特有的API
  (uni as any).reverseGeocoder({
    location: {
      latitude: latitude,
      longitude: longitude,
    },
    success: (res: any) => {
      if (res.result && res.result.address) {
        currentAddress.value = res.result.address_component.city;
      } else {
        // 使用模拟数据
        setMockAddress(longitude, latitude);
      }
      isLocating.value = false;
    },
    fail: () => {
      // 使用模拟数据
      setMockAddress(longitude, latitude);
    },
  });
  // #endif

  // #ifndef MP-WEIXIN
  // 非微信小程序环境，使用模拟数据
  setMockAddress(longitude, latitude);
  // #endif
};

// 设置模拟地址（用于演示）
const setMockAddress = (longitude: number, latitude: number) => {
  // 根据经纬度范围设置不同的模拟地址
  setTimeout(() => {
    if (longitude > 116.3 && longitude < 116.5 && latitude > 39.9 && latitude < 40.0) {
      currentAddress.value = "北京市";
    } else if (
      longitude > 121.4 &&
      longitude < 121.5 &&
      latitude > 31.2 &&
      latitude < 31.3
    ) {
      currentAddress.value = "上海市";
    } else if (
      longitude > 113.2 &&
      longitude < 113.3 &&
      latitude > 23.1 &&
      latitude < 23.2
    ) {
      currentAddress.value = "广州市";
    } else if (
      longitude > 114.0 &&
      longitude < 114.1 &&
      latitude > 22.5 &&
      latitude < 22.6
    ) {
      currentAddress.value = "深圳市";
    } else {
      currentAddress.value = "";
    }
    isLocating.value = false;
  }, 1000);
};

// 处理定位点击
const handleLocationClick = () => {
  if (isLocating.value) return; // 如果正在定位，则不重复点击

  currentAddress.value = "";
  getCurrentLocation();

  // 显示提示
  uni.showToast({
    title: "正在定位...",
    icon: "loading",
    duration: 1000,
  });
};
</script>

<style lang="scss" scoped>
.navigation {
  .nav-bar-inner {
    height: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 8px;
    box-sizing: border-box;

    .address-box {
      display: flex;
      align-items: center;
      color: $u-main-color;
      font-size: $up-font-sm;
      cursor: pointer;
      transition: opacity 0.3s ease;

      &:active {
        opacity: 0.7;
      }

      .address {
        margin-left: 3rpx;
        font-size: $up-font-sm;
      }
    }

    .title {
      color: #000;
      font-weight: bold;
      font-size: 32rpx;
    }
  }

  .nav-bar-buttom {
    height: 10rpx;
  }
}
</style>
