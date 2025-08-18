<template>
  <view class="tabbar" v-if="tabList.length">
    <view
      v-for="(item, index) in tabList"
      :key="index"
      class="tab-item"
      :class="{ active: currentTab === index }"
      @click="switchTab(index, item.path)"
    >
      <image :src="currentTab === index ? item.iconActive : item.icon" class="tab-icon" />
      <text>{{ item.text }}</text>
    </view>
  </view>
  
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { uniCache } from '@/utils/storage'

const tabList = ref<any[]>([])

const currentTab = ref<number>(0)

const hasShopPermission = (user: any): boolean => {
  if (!user) return false
  let permObj = user.userInfo?.permObj || {}
  if (permObj['shop']) return true
  return false
}

const setupTabbar = () => {
  const user = uniCache.getItem('user')
  const canSeeShop = hasShopPermission(user)
  const allTabs = [
    { text: '首页', path: '/pages/index/index', icon: '/static/images/tabbar/home.png', iconActive: '/static/images/tabbar/home-active.png' },
    { text: '消息', path: '/pages/message/message', icon: '/static/images/tabbar/message.png', iconActive: '/static/images/tabbar/message-active.png' },
    { text: '店铺', path: '/pages/shop/shop', icon: '/static/images/tabbar/shop.png', iconActive: '/static/images/tabbar/shop-active.png', needPerm: 'shop' } as any,
    { text: '我的', path: '/pages/my/my', icon: '/static/images/tabbar/my.png', iconActive: '/static/images/tabbar/my-active.png' },
  ] as any
  tabList.value = allTabs.filter((tab: any) => !tab.needPerm || canSeeShop)
}
const updateActiveByRoute = () => {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1] as any
  const currentPath = '/' + (current?.route || '')
  const idx = tabList.value.findIndex(t => t.path === currentPath)
  if (idx >= 0) currentTab.value = idx
}

onMounted(() => {
  setupTabbar()
  updateActiveByRoute()
})
onShow(() => {
  setupTabbar()
  updateActiveByRoute()
})

const switchTab = (index: number, path: string) => {
  currentTab.value = index;
  uni.switchTab({ url: path })
}
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
  background-color: #ffffff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #eaeaea;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 99;
}

.tab-item {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;

  &.active {
    color: $u-main-color;
  }
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 2px;
}
</style>
