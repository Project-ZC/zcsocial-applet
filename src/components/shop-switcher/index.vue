<template>
  <up-popup
    :custom-style="{ position: 'fixed' }"
    @touchmove.stop.prevent=""
    :show="showModal"
    mode="center"
    @close="closeModal"
    title="选择店铺"
    height="70%"
  >
    <view class="shop-modal z-modal z-modal-lg" v-if="currentShop">
      <view class="modal-header">
        <text class="modal-title">选择店铺</text>
        <view class="close-btn" @click="closeModal">
          <up-icon name="close" size="20"></up-icon>
        </view>
      </view>
      <view class="search-section">
        <view class="search-box">
          <up-icon name="search" size="20" color="var(--text-3)"></up-icon>
          <input
            class="search-input"
            v-model="searchKeyword"
            @confirm="handleSearch"
            @clear="handleSearch"
            placeholder="搜索店铺名称"
          />
          <view class="clear-btn" v-if="searchKeyword" @click="clearSearch">
            <up-icon name="close" size="16" color="var(--text-3)"></up-icon>
          </view>
        </view>
      </view>
      <scroll-view scroll-y show-scrollbar class="shop-list">
        <view class="modal-body">
          <view
            class="shop-item"
            v-for="shop in filteredShops"
            :key="shop.shopConfig.shopId"
            @click="selectShop(shop)"
            :class="{
              active: currentShop?.shopConfig.shopId === shop.shopConfig.shopId,
            }"
          >
            <view class="shop-item-info">
              <view class="shop-item-name">
                {{ shop.shopConfig.name }}
                <text v-if="currentShop?.shopConfig.shopId === shop.shopConfig.shopId" class="current-shop-tag">
                  当前
                </text>
              </view>
              <view class="shop-item-details">
                <text class="shop-address">{{ shop.shopConfig.address || '暂无地址' }}</text>
                <view class="shop-status-item">
                  <BusinessStatus :state="shop.shopConfig.status" />
                </view>
              </view>
            </view>
            <view class="shop-item-arrow" v-if="currentShop?.shopConfig.shopId === shop.shopConfig.shopId">
              <up-icon name="checkbox-mark" size="20" color="#007AFF"></up-icon>
            </view>
          </view>
          <emptyData v-if="filteredShops.length === 0" text="暂无店铺数据" />
        </view>
      </scroll-view>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { getShopConfigList } from '@/api/shopManage';
interface Shop {
  shopConfig: {
    shopId: string;
    name: string;
    address?: string;
    status: 'open' | 'close' | 'close_manual';
    [key: string]: any;
  };
  roleList: number[];
}

interface Props {
  shops?: Shop[];
}

const props = withDefaults(defineProps<Props>(), {
  shops: () => [],
});

const emit = defineEmits<{
  'update:currentShopId': [shopId: string];
  shopChange: [shop: Shop];
}>();

const showModal = ref(false);
const searchKeyword = ref('');
// const shopList = ref<any[]>([]);

// const GetShopConfigList = async () => {
// 	try {
// 		let params = {
// 			//   pageNum: 1,
// 			//   pageSize: 999,
// 			// id: userStore.userInfo?.id
// 		};
// 		const res = await getShopConfigList(params);
// 		console.log(res);
// 		if (res.data?.length) {
// 			// 将店铺数据添加到店铺列表中
// 			state.shopList = res.data || [];
// 			// 设置当前店铺ID
// 			if (state.shopList.length > 0 && !shopInfo.value.id) {
// 				shopInfo.value.id = state.shopList[0].id;
// 			}
// 		}
// 	} catch (error) {}
// };

const currentShop = ref(null);
const filteredShops = ref<Shop[]>([]);

const handleSearch = () => {
  if (!searchKeyword.value) {
    filteredShops.value = props.shops;
  } else {
    filteredShops.value = props.shops.filter(shop =>
      shop.shopConfig.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    );
  }
};

const openShopModal = (shopInfo: any) => {
  showModal.value = true;
  currentShop.value = { ...shopInfo };
  handleSearch();
};
const closeModal = () => {
  showModal.value = false;
  searchKeyword.value = '';
  currentShop.value = null;
};
const clearSearch = () => {
  searchKeyword.value = '';
  handleSearch();
};

const selectShop = (shop: Shop) => {
  currentShop.value = { ...shop };
  emit('shopChange', shop);
  closeModal();
};

defineExpose({
  openShopModal,
});
</script>

<style lang="scss" scoped>
.shop-modal {
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  .search-section {
    padding: 20rpx 20rpx;
    border-bottom: 1rpx solid var(--border-1);

    .search-box {
      display: flex;
      align-items: center;
      background: var(--bg-1);
      border-radius: 12rpx;
      padding: 20rpx;

      .search-input {
        flex: 1;
        margin-left: 20rpx;
        font-size: 28rpx;
        color: var(--text-1);
        background: transparent;
        border: none;
        outline: none;

        &::placeholder {
          color: var(--text-3);
        }
      }

      .clear-btn {
        width: 40rpx;
        height: 40rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #e0e0e0;
      }
    }
  }

  .shop-list {
    flex: 1;

    .shop-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 30rpx;
      border-bottom: 1rpx solid var(--border-1);

      &:last-child {
        border-bottom: none;
      }

      &.active {
        background: var(--bg-1);
        .shop-item-name {
          color: var(--primary-6);
          font-weight: 600;
        }
      }

      .shop-item-info {
        flex: 1;
        overflow: hidden;

        .shop-item-name {
          font-size: 32rpx;
          font-weight: 600;
          color: var(--text-1);
          margin-bottom: 8rpx;
          display: flex;
          align-items: center;
          gap: 12rpx;

          .current-shop-tag {
            font-size: 20rpx;
            color: #007aff;
            background: rgba(0, 122, 255, 0.1);
            padding: 4rpx 12rpx;
            border-radius: 12rpx;
            font-weight: normal;
          }
        }

        .shop-item-details {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 24rpx;
          color: var(--text-2);

          .shop-address {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-right: 20rpx;
          }

          .shop-status-item {
            display: flex;
            align-items: center;
          }
        }
      }
      .shop-item-arrow {
        margin-left: 20rpx;
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100rpx 0;

      image {
        width: 200rpx;
        height: 200rpx;
        margin-bottom: 30rpx;
        opacity: 0.6;
      }

      text {
        font-size: 28rpx;
        color: var(--text-3);
      }
    }
  }
}
</style>
