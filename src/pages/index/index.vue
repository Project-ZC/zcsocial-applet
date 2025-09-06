<template>
  <pageWrapper :showTabbar="true">
    <up-sticky offset-top="0">
      <Navbar @searchResults="handleSearchResults" />
    </up-sticky>

    <!-- 广告组件 -->
    <advertisement
      v-if="false"
      :advertisement="advertisementData"
      @click="handleAdvertisementClick"
      @close="handleAdvertisementClose"
    />

    <view class="content">
      <!-- 搜索结果展示 -->
      <view v-if="showSearchResults" class="search-results">
        <view class="search-header">
          <view class="search-header-left">
            <text class="search-title">搜索结果</text>
            <text class="search-count">找到 {{ searchResults.length }} 个店铺</text>
          </view>
          <view class="search-close-btn" @click="closeSearchResults">
            <up-icon name="close" size="20" color="var(--text-3)" />
          </view>
        </view>
        <view class="search-list">
          <up-list height="100%" v-if="searchResults.length > 0">
            <up-list-item v-for="(item, index) in searchResults" :key="index">
              <shop-card :shop-info="item" @itemClick="handleShopClick(item)" />
            </up-list-item>
          </up-list>
          <emptyData v-else height="40vh" text="未找到相关店铺" />
        </view>
      </view>

      <!-- 默认内容 -->
      <view v-else>
        <view class="scan-box z-glass-card" @tap="handleScan">
          <up-image width="100" height="100" src="/static/images/scan-logo.png" />
          <view class="scan-text">
            <text>扫码进入店铺</text>
          </view>
        </view>
        <!-- <view class="title">已参与的活动</view>
        <view class="shop-list">
          <up-list height="100%" @scrolltolower="scrolltolower">
            <up-list-item v-for="(item, index) in activityList" :key="index">
              <activity-card :activity-info="item" />
            </up-list-item>
          </up-list>
        </view> -->
        <view class="title">浏览过的店铺</view>
        <view class="shop-list">
          <up-list height="100%" @scrolltolower="scrolltolower" v-if="shopList.length > 0">
            <up-list-item v-for="(item, index) in shopList" :key="index">
              <shop-card :shop-info="item" @itemClick="handleShopClick(item)" />
            </up-list-item>
          </up-list>
          <emptyData height="40vh" v-else text="暂无浏览过的店铺" subtext="去发现更多有趣的店铺吧" />
        </view>
      </view>
    </view>
  </pageWrapper>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { onPullDownRefresh, onLoad, onShow, onHide } from '@dcloudio/uni-app';
import Navbar from '@/components/navbar/navbar.vue';
import ShopCard from '@/components/shop-card/index.vue';
import ActivityCard from './components/activityCard.vue';
import Advertisement from '@/components/advertisement/index.vue';
import { getAllShopHistory } from '@/api/history';
// 搜索相关状态
const showSearchResults = ref(false);
const searchResults = ref([]);
const currentSearchKeyword = ref('');

// 广告数据
const advertisementData = ref({
  id: 'homepage_ad_001',
  image: '/static/images/advertisement-banner.jpg', // 你可以替换为实际的广告图片
  link: '/pages/shop/shop?shopId=1', // 点击跳转的链接，可以是内部页面或外部链接
});

const shopList = ref([
  // {
  // 	title: "海伦司小酒馆",
  // 	thumb:
  // 		"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
  // 	distance: "100m",
  // 	desc: "海伦司小酒馆111",
  // 	tags: ["标签1", "标签2"],
  // 	businessHours: "10:00-22:00",
  // 	status: "open",
  // },
  // {
  // 	title: "海伦司小酒馆",
  // 	thumb:
  // 		"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
  // 	distance: "100m",
  // 	desc: "海伦司小酒馆",
  // 	tags: ["标签1", "标签2"],
  // 	businessHours: "10:00-22:00",
  // 	status: "closed",
  // },
  // {
  // 	title: "海伦司小酒馆",
  // 	thumb:
  // 		"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
  // 	distance: "100m",
  // 	desc: "海伦司小酒馆",
  // 	tags: ["标签1", "标签2"],
  // 	businessHours: "10:00-22:00",
  // 	status: "close_manual",
  // },
  // {
  // 	title: "海伦司小酒馆",
  // 	thumb:
  // 		"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
  // 	distance: "100m",
  // 	desc: "海伦司小酒馆",
  // 	tags: ["标签1", "标签2"],
  // 	businessHours: "10:00-22:00",
  // 	status: "closed",
  // },
  // {
  // 	title: "海伦司小酒馆",
  // 	thumb:
  // 		"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
  // 	distance: "100m",
  // 	desc: "海伦司小酒馆",
  // 	tags: ["标签1", "标签2"],
  // 	businessHours: "10:00-22:00",
  // 	status: "closed",
  // },
  // {
  // 	title: "海伦司小酒馆",
  // 	thumb:
  // 		"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
  // 	distance: "100m",
  // 	desc: "海伦司小酒馆",
  // 	tags: ["标签1", "标签2"],
  // 	businessHours: "10:00-22:00",
  // 	status: "open",
  // },
  // {
  // 	title: "海伦司小酒馆",
  // 	thumb:
  // 		"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
  // 	distance: "100m",
  // 	desc: "海伦司小酒馆",
  // 	tags: ["标签1", "标签2"],
  // 	businessHours: "10:00-22:00",
  // 	status: "open",
  // },
]);
// const activityList = ref([
// 	{
// 		activityTitle: "毕业季狂欢节12",
// 		thumb:
// 			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
// 		startTime: "2025-06-12 10:00:00",
// 		endTime: "2025-06-19 23:59:59",
// 		status: "open",
// 		businessName: "海伦司小酒馆",
// 		tags: ["标签1", "标签2"],
// 		businessHours: "10:00-22:00",
// 	},
// 	{
// 		activityTitle: "毕业季狂欢节",
// 		thumb:
// 			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
// 		startTime: "2025-06-12 10:00:00",
// 		endTime: "2025-06-19 23:59:59",
// 		status: "closed",
// 		businessName: "海伦司小酒馆",
// 		tags: ["标签1", "标签2"],
// 		businessHours: "10:00-22:00",
// 	},
// 	{
// 		activityTitle: "毕业季狂欢节",
// 		thumb:
// 			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
// 		startTime: "2025-06-12 10:00:00",
// 		endTime: "2025-06-19 23:59:59",
// 		status: "open",
// 		businessName: "海伦司小酒馆",
// 		tags: ["标签1", "标签2"],
// 		businessHours: "10:00-22:00",
// 	},
// 	{
// 		activityTitle: "毕业季狂欢节",
// 		thumb:
// 			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
// 		startTime: "2025-06-12 10:00:00",
// 		endTime: "2025-06-19 23:59:59",
// 		status: "open",
// 		businessName: "海伦司小酒馆",
// 		tags: ["标签1", "标签2"],
// 		businessHours: "10:00-22:00",
// 	},
// ]);

const GetShopHistoryList = async () => {
  try {
    const res = await getAllShopHistory({});
    let list = [];
    if (res.data?.length) {
      for (const item of res.data) {
        list.push({
          ...item.shopConfig,
        });
      }
    }
    shopList.value = list || [];
  } catch (error) {}
};

const handleShopClick = (item: any) => {
  uni.navigateTo({
    url: `/pages/index/shopDetail/showDetail?shopId=${item.shopId}`,
  });
};

// 搜索相关方法
const handleSearchResults = (data: any) => {
  const { keyword, results, total } = data;

  if (keyword) {
    // 有搜索关键词，显示搜索结果
    showSearchResults.value = true;
    searchResults.value = results;
    currentSearchKeyword.value = keyword;
  } else {
    // 清空搜索，显示默认内容
    showSearchResults.value = false;
    searchResults.value = [];
    currentSearchKeyword.value = '';
  }
};

// 关闭搜索结果
const closeSearchResults = (type = true) => {
  showSearchResults.value = false;
  searchResults.value = [];
  currentSearchKeyword.value = '';
  type && GetShopHistoryList();
  // 通知navbar组件清空搜索框
  // 这里可以通过事件或者直接操作navbar组件的搜索框
  uni.$emit('clearSearchInput');
};

// 格式化搜索结果，适配shop-card组件的数据结构
const formatSearchResult = (item: any) => {
  return {
    ...item,
  };
};

// 处理广告点击
const handleAdvertisementClick = (advertisement: any) => {
  console.log('广告被点击:', advertisement);
  // 这里可以添加统计逻辑，比如上报广告点击事件
};

// 处理广告关闭
const handleAdvertisementClose = (advertisement: any) => {
  console.log('广告被关闭:', advertisement);
  // 这里可以添加统计逻辑，比如上报广告关闭事件
};

const handleScan = () => {
  uni.scanCode({
    onlyFromCamera: true, // 只允许从相机扫码
    scanType: ['qrCode'], // 只扫描二维码
    success: res => {
      console.log('扫码结果：', res);
      // 处理扫码结果
      const shopId = res.result;
      if (shopId) {
        // 跳转到店铺页面
        uni.navigateTo({
          url: `/pages/shop/shop?id=${shopId}`,
        });
      }
    },
    fail: err => {
      console.error('扫码失败：', err);
      uni.showToast({
        title: '扫码失败',
        icon: 'none',
      });
    },
  });
};
onMounted(() => {
  GetShopHistoryList();
});

// 页面显示时（从其他tabbar页面切换回来时）
onShow(() => {
  // 可以在这里刷新数据或执行其他逻辑
});

// 页面隐藏时（切换到其他tabbar页面时）
onHide(() => {
  // 清理搜索状态
  closeSearchResults(false);
  // 通知navbar组件清空搜索框
  uni.$emit('clearSearchInput');
});

// 下拉刷新监听
onPullDownRefresh(async () => {
  try {
    await GetShopHistoryList();
  } finally {
    uni.stopPullDownRefresh();
  }
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';
.content {
  padding: $up-box-pd;
  color: var(--text-1);
  .scan-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: $up-box-pd;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
    }

    .scan-text {
      font-weight: bold;
      margin-top: 16rpx;
      font-size: 32rpx;
      color: var(--text-1);
    }
  }
  .title {
    padding: 0;
    box-sizing: border-box;
    font-size: 34rpx;
    font-weight: bold;
    color: var(--text-1);
    margin: $up-box-mg 0 6rpx;
  }
  .shop-list {
    // padding: 20rpx;
    box-sizing: border-box;
    margin-top: 12rpx;
  }

  // 搜索结果样式
  .search-results {
    .search-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1px solid var(--border-1);
      margin-bottom: 20rpx;

      .search-header-left {
        display: flex;
        flex-direction: column;
        gap: 8rpx;
      }

      .search-title {
        font-size: 32rpx;
        font-weight: bold;
        color: var(--text-1);
      }

      .search-count {
        font-size: 24rpx;
        color: var(--text-3);
      }

      .search-close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
        background-color: var(--bg-2);
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.9);
          background-color: var(--bg-3);
        }
      }
    }

    .search-list {
      margin-top: 12rpx;
    }
  }
}
</style>
