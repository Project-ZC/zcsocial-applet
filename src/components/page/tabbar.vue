<template>
  <view class="tabbar" v-if="setupTabbar.length">
    <view
      v-for="(item, index) in setupTabbar"
      :key="index"
      class="tab-item"
      :class="{ active: currentTab === index }"
      @click="switchTab(index, item.path)"
    >
      <!-- <image
				:src="currentTab === index ? item.iconActive : item.icon"
				class="tab-icon"
			/> -->
      <up-icon
        v-if="item.icon"
        :name="item.icon"
        class="tab-icon"
        :color="currentTab === index ? '#007AFF' : 'var(--text-2)'"
        size="26"
      ></up-icon>

      <!-- <up-icon
				v-else
				custom-prefix="wd-icon"
				:name="`wd-icon-${item.wdIcon}`"
				class="tab-icon"
				:color="currentTab === index ? '#007AFF' : 'var(--text-2)'"
				size="24"
			></up-icon> -->
      <view v-else :class="`wd-icon wd-icon-${item.wdIcon}`" class="tab-icon"></view>
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { uniCache } from '@/utils/storage';
import { useUserStore } from '@/stores';
import { useShopStore } from '@/stores';

const userStore = useUserStore();
const shopStore = useShopStore();

const tabList = ref<any>([]);

const currentTab = ref<number>(0);

// 使用computed来响应式更新tabbar
const setupTabbar = computed(() => {
  // const canSeeShop = userStore.checkShopPermission();
  const allTabs = [
    {
      text: '首页',
      path: '/pages/index/index',
      // icon: "home-fill",
      wdIcon: 'home',
      type: 'home',
      // icon: "/static/images/tabbar/home.png",
      // iconActive: "/static/images/tabbar/home-active.png",
    },
    {
      text: '消息',
      path: '/pages/message/message',
      // icon: "chat-fill",
      wdIcon: 'message',
      type: 'message',
      // icon: "/static/images/tabbar/message.png",
      // iconActive: "/static/images/tabbar/message-active.png",
    },
    {
      text: '店铺',
      path: '/pages/shop/shop',
      wdIcon: 'shop',
      // icon: "/static/images/tabbar/shop.png",
      // iconActive: "/static/images/tabbar/shop-active.png",
      type: 'shop',
    } as any,
    {
      text: '我的',
      path: '/pages/my/my',
      // icon: "account-fill",
      wdIcon: 'my',
      type: 'my',
      // icon: "/static/images/tabbar/my.png",
      // iconActive: "/static/images/tabbar/my-active.png",
    },
  ] as any;

  return allTabs.filter((tab: any) => {
    if (shopStore.myShopListLen > 0) {
      return true; // 有店铺权限时显示所有tab
    }
    return tab.type !== 'shop'; // 无店铺权限时隐藏shop tab
  });
});

const updateActiveByRoute = () => {
  const pages = getCurrentPages();
  const current = pages[pages.length - 1] as any;
  const currentPath = '/' + (current?.route || '');
  const idx = tabList.value.findIndex(t => t.path === currentPath);
  if (idx >= 0) currentTab.value = idx;
};

onMounted(() => {
  // 初始化tabbar
  tabList.value = setupTabbar.value;
  updateActiveByRoute();
});

onShow(() => {
  // 每次显示页面时重新计算tabbar
  tabList.value = setupTabbar.value;
  updateActiveByRoute();
});

const switchTab = (index: number, path: string) => {
  currentTab.value = index;
  uni.switchTab({ url: path });
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: $up-tabbar-h;
  background-color: var(--bg-1);
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid var(--border-2);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 99;
}
.tab-text {
  color: var(--text-2);
}
:deep(.tab-icon) {
  // width: 44rpx;
  // height: 44rpx;
  margin-bottom: 4rpx;
  color: var(--text-2);
  font-size: 22px;
}
.tab-item {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: $up-font-sm;

  &.active {
    .tab-text,
    .tab-icon {
      color: $u-primary !important;
    }
  }
}
</style>
