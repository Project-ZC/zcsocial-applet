<template>
  <pageWrapper>
    <view class="container">
      <!-- 页面标题 -->
      <view class="page-header z-glass-card">
        <view class="header-content">
          <text class="page-title">浏览历史</text>
          <text class="page-subtitle">你最近浏览过的店铺</text>
        </view>
        <view class="clear-all" @click="clearAllHistory">
          <text class="clear-text">清空</text>
        </view>
      </view>

      <!-- 店铺列表 -->
      <scroll-view scroll-y="true" class="history-list">
        <view class="shop-card z-glass-card" v-for="(shop, index) in state.historyList" :key="shop.id">
          <!-- 店铺封面 -->
          <view class="shop-cover">
            <up-image
              class="cover-image"
              :src="shop.coverImage"
              mode="aspectFill"
              width="100%"
              height="100%"
            ></up-image>
            <view class="visit-time">
              <text class="time-text">{{ shop.visitTime }}</text>
            </view>
          </view>

          <!-- 店铺信息 -->
          <view class="shop-info">
            <!-- 店铺头部 -->
            <view class="shop-header">
              <view class="shop-logo">
                <up-image :src="shop.logo" width="160rpx" height="160rpx"></up-image>
              </view>
              <view class="shop-basic">
                <text class="shop-name">{{ shop.name }}</text>
                <view class="shop-tags">
                  <text class="tag" v-for="tag in shop.tags" :key="tag">{{ tag }}</text>
                </view>
              </view>
              <view class="shop-status" :class="shop.status">
                <text class="status-text">{{ shop.statusText }}</text>
              </view>
            </view>

            <!-- 店铺详情 -->
            <view class="shop-details">
              <view class="detail-item">
                <text class="detail-icon">📍</text>
                <text class="detail-text">{{ shop.address }}</text>
              </view>
              <view class="detail-item">
                <text class="detail-icon">🕒</text>
                <text class="detail-text">{{ shop.businessHours }}</text>
              </view>
              <view class="detail-item">
                <text class="detail-icon">💰</text>
                <text class="detail-text">人均 ¥{{ shop.averagePrice }}</text>
              </view>
            </view>

            <!-- 店铺亮点 -->
            <view class="shop-highlights">
              <text class="highlight-item" v-for="highlight in shop.highlights" :key="highlight">
                {{ highlight }}
              </text>
            </view>

            <!-- 操作按钮 -->
            <view class="shop-actions">
              <view class="action-btn default">
                <up-button size="small" @click="removeHistory(index)">移除</up-button>
              </view>
              <view class="action-btn">
                <up-button type="primary" size="small" @click="viewShopDetail(shop)">查看详情</up-button>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 空状态 -->
      <view v-if="state.historyList.length === 0" class="empty-state z-glass-card">
        <text class="empty-text">暂无浏览历史</text>
        <text class="empty-subtitle">去发现更多有趣的店铺吧</text>
      </view>
    </view>
  </pageWrapper>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';

// 定义店铺历史记录类型
interface ShopHistory {
  id: string;
  name: string;
  logo: string;
  coverImage: string;
  visitTime: string;
  tags: string[];
  status: 'open' | 'closed';
  statusText: string;
  address: string;
  businessHours: string;
  averagePrice: number;
  highlights: string[];
}

// 统一状态管理
const state = reactive({
  // 浏览历史列表
  historyList: [
    {
      id: '1',
      name: '醉美酒吧',
      logo: '/static/images/shop-logo1.png',
      coverImage: '/static/images/shop-cover1.jpg',
      visitTime: '今天 20:30',
      tags: ['静吧', '鸡尾酒', '约会'],
      status: 'open' as const,
      statusText: '营业中',
      address: '朝阳区三里屯SOHO 3号楼2层',
      businessHours: '18:00-02:00',
      averagePrice: 150,
      highlights: ['专业调酒师', '浪漫氛围', '精选音乐'],
    },
    {
      id: '2',
      name: '派对领地',
      logo: '/static/images/shop-logo2.png',
      coverImage: '/static/images/shop-cover2.jpg',
      visitTime: '昨天 21:15',
      tags: ['嗨吧', '音乐', '派对'],
      status: 'open' as const,
      statusText: '营业中',
      address: '海淀区中关村大街1号',
      businessHours: '19:00-03:00',
      averagePrice: 180,
      highlights: ['DJ现场', '舞池', '主题派对'],
    },
    {
      id: '3',
      name: '夜色酒廊',
      logo: '/static/images/shop-logo3.png',
      coverImage: '/static/images/shop-cover3.jpg',
      visitTime: '前天 19:45',
      tags: ['酒廊', '轻松', '商务'],
      status: 'closed' as const,
      statusText: '已打烊',
      address: '西城区西单北大街88号',
      businessHours: '17:30-01:30',
      averagePrice: 120,
      highlights: ['商务洽谈', '安静环境', '精致小食'],
    },
    {
      id: '4',
      name: '静吧小憩',
      logo: '/static/images/shop-logo4.png',
      coverImage: '/static/images/shop-cover4.jpg',
      visitTime: '3天前 18:20',
      tags: ['清吧', '安静', '阅读'],
      status: 'open' as const,
      statusText: '营业中',
      address: '东城区王府井大街168号',
      businessHours: '16:00-00:00',
      averagePrice: 90,
      highlights: ['免费WiFi', '图书角', '咖啡茶饮'],
    },
  ] as ShopHistory[],
});

// 清空所有浏览历史
const clearAllHistory = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有浏览历史吗？',
    success: res => {
      if (res.confirm) {
        state.historyList = [];
        uni.showToast({
          title: '已清空浏览历史',
          icon: 'success',
        });
      }
    },
  });
};

// 移除单个浏览记录
const removeHistory = (index: number) => {
  uni.showModal({
    title: '确认移除',
    content: '确定要移除这条浏览记录吗？',
    success: res => {
      if (res.confirm) {
        state.historyList.splice(index, 1);
        uni.showToast({
          title: '已移除',
          icon: 'success',
        });
      }
    },
  });
};

// 查看店铺详情
const viewShopDetail = (shop: ShopHistory) => {
  uni.navigateTo({
    url: `/pages/index/shopDetail/showDetail?id=${shop.id}`,
  });
};

// 页面加载时执行
onMounted(() => {
  console.log('浏览历史页面加载完成');
});

defineOptions({
  options: {
    styleIsolation: 'shared',
  },
});
</script>

<style lang="scss" scoped>
.container {
  padding: 0 $up-box-pd;
}

/* 页面头部 */
.page-header {
  margin: 24rpx 0;
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.page-subtitle {
  font-size: 26rpx;
  color: #666;
}

.clear-all {
  padding: 12rpx 24rpx;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 12rpx;
  cursor: pointer;

  &:active {
    background: rgba(244, 67, 54, 0.2);
  }
}

.clear-text {
  font-size: 26rpx;
  color: #f44336;
  font-weight: 500;
}

/* 历史列表 */
.history-list {
  height: calc(100vh - 200rpx);
}

.shop-card {
  margin-bottom: 24rpx;
  overflow: hidden;
}

/* 店铺封面 */
.shop-cover {
  position: relative;
  height: 240rpx;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.visit-time {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: rgba(0, 0, 0, 0.6);
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.time-text {
  font-size: 22rpx;
  color: white;
}

/* 店铺信息 */
.shop-info {
  padding: 32rpx;
}

/* 店铺头部 */
.shop-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.shop-logo {
  width: 160rpx;
  height: 160rpx;
  margin-right: 24rpx;
  ::v-deep .u-image {
    width: 100%;
    height: 100%;
  }
}

.shop-basic {
  flex: 1;
}

.shop-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.shop-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag {
  background: rgba(58, 169, 232, 0.1);
  color: #3aa9e8;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
}

.shop-status {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  align-self: flex-start;

  &.open {
    background: rgba(76, 175, 80, 0.1);

    .status-text {
      color: #4caf50;
    }
  }

  &.closed {
    background: rgba(158, 158, 158, 0.1);

    .status-text {
      color: #9e9e9e;
    }
  }
}

.status-text {
  font-size: 22rpx;
  font-weight: 500;
}

/* 店铺详情 */
.shop-details {
  margin-bottom: 24rpx;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.detail-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
  width: 32rpx;
}

.detail-text {
  font-size: 26rpx;
  color: #666;
  flex: 1;
}

/* 店铺亮点 */
.shop-highlights {
  margin-bottom: 24rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.highlight-item {
  background: rgba(255, 193, 7, 0.1);
  color: #ff9800;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

/* 操作按钮 */
.shop-actions {
  display: flex;
  gap: 16rpx;
  justify-content: flex-end;
}

.action-btn {
  ::v-deep .u-button {
    padding: 0 20rpx;
  }
  &.default {
    ::v-deep .u-button {
      background: rgba(0, 0, 0, 0.05);
      color: #666;
    }
  }
}

/* 空状态 */
.empty-state {
  margin-top: 200rpx;
  padding: 80rpx 40rpx;
  text-align: center;
}

.empty-text {
  display: block;
  font-size: 36rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.empty-subtitle {
  display: block;
  font-size: 28rpx;
  color: #999;
}
</style>
