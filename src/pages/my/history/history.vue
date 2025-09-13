<template>
  <pageWrapper>
    <view class="container">
      <!-- 页面标题 -->
      <view class="page-header z-glass-card">
        <view class="header-content">
          <text class="page-title">浏览历史</text>
          <text class="page-subtitle">你最近浏览过的店铺</text>
        </view>
        <view>
          <up-button type="error" size="small" @click="clearAllHistory" v-if="state.historyList.length > 0">
            清空
          </up-button>
        </view>
      </view>
      <!-- 店铺列表 -->
      <view class="shop-list">
        <up-list height="100%" v-if="state.historyList.length > 0">
          <up-list-item v-for="(shop, index) in state.historyList" :key="shop.id">
            <view class="history-item">
              <shop-card :shop-info="shop" @itemClick="viewShopDetail(shop)" />
              <view class="remove-btn">
                <up-button type="error" size="mini" @click="removeHistory(index)">移除</up-button>
              </view>
            </view>
          </up-list-item>
        </up-list>
      </view>

      <!-- 空状态 -->
      <emptyData
        height="60vh"
        v-if="!state.loading && state.historyList.length === 0"
        text="暂无浏览历史"
        subtext="去发现更多有趣的店铺吧"
      ></emptyData>
    </view>
  </pageWrapper>
</template>

<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from 'vue';
import { getAllShopHistory, deleteShopHistory } from '@/api/history';
import ShopCard from '@/components/shop-card/index.vue';
import { PAGE_LIST } from '@/consts/page';

// 统一状态管理
const state = reactive({
  // 浏览历史列表
  historyList: [] as any[],
  // 加载状态
  loading: false,
});

// 清空所有浏览历史
const clearAllHistory = async () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有浏览历史吗？',
    success: async res => {
      if (res.confirm) {
        try {
          state.loading = true;
          // 批量删除所有历史记录
          for (const item of state.historyList) {
            await deleteShopHistory({ shopId: item.shopId });
          }
          state.historyList = [];
          uni.showToast({
            title: '已清空浏览历史',
            icon: 'success',
          });
        } catch (error) {
          console.error('清空浏览历史失败:', error);
          uni.showToast({
            title: '清空失败，请重试',
            icon: 'error',
          });
        } finally {
          state.loading = false;
        }
      }
    },
  });
};

// 移除单个浏览记录
const removeHistory = async (index: number) => {
  const shop = state.historyList[index];
  uni.showModal({
    title: '确认移除',
    content: '确定要移除这条浏览记录吗？',
    success: async res => {
      if (res.confirm) {
        try {
          // 调用删除接口
          await deleteShopHistory({ shopId: shop.shopId });
          // 从列表中移除
          state.historyList.splice(index, 1);
          uni.showToast({
            title: '已移除',
            icon: 'success',
          });
        } catch (error) {
        } finally {
        }
      }
    },
  });
};

// 查看店铺详情
const viewShopDetail = (shop: any) => {
  uni.navigateTo({
    url: `${PAGE_LIST.INDEX_SHOP_DETAIL}?shopId=${shop.shopId}`,
  });
};

// 获取浏览历史列表
const GetShopHistoryList = async () => {
  try {
    state.loading = true;
    const res = await getAllShopHistory({});
    let list = [];
    if (res.data?.length) {
      for (const item of res.data) {
        list.push({
          ...item.shopConfig,
        });
      }
    }
    state.historyList = list || [];
  } catch (error) {
  } finally {
    state.loading = false;
  }
};

// 页面加载时执行
onMounted(() => {
  console.log('浏览历史页面加载完成');
  GetShopHistoryList();

  // 监听店铺信息更新事件
  uni.$on('refreshShopList', () => {
    console.log('收到店铺信息更新事件，刷新列表');
    GetShopHistoryList();
  });
});

// 页面卸载时移除事件监听
onUnmounted(() => {
  uni.$off('refreshShopList');
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
  margin: $up-box-mg 0;
  padding: $up-box-pd;
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
  color: var(--text-1);
  margin-bottom: 8rpx;
}

.page-subtitle {
  font-size: 26rpx;
  color: var(--text-2);
}

/* 店铺列表 */

.history-item {
  position: relative;
}

.remove-btn {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  z-index: 10;
}
</style>
