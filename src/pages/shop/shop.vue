<!-- 店铺 -->
<template>
  <pageWrapper :showTabbar="true">
    <!-- 店铺切换组件 -->
    <ShopSwitcher
      ref="shopSwitcherRef"
      v-if="state.shopList.length > 0 && userStore.checkShopPermission()"
      :shops="state.shopList"
      @shopChange="handleShopSelect"
    />
    <div class="shop">
      <!-- 店铺基本信息 -->
      <view class="shop-info-card z-glass-card" v-if="userStore.checkShopPermission()">
        <view class="shop-header" @click="navigateTo('/pages/shop/shopDetail/shopDetail')">
          <up-image
            class="shop-logo"
            :src="getDownloadUrl(shopInfo.logo)"
            mode="aspectFill"
            width="140rpx"
            height="140rpx"
          ></up-image>
          <view class="shop-basic-info">
            <text class="shop-name">{{ shopInfo.name }}</text>
            <view class="shop-intro">
              {{ shopInfo.address || '暂无地址' }}
            </view>
            <view class="shop-date">营业时间：{{ shopInfo.openTime }} - {{ shopInfo.closeTime }}</view>
          </view>

          <view class="shop-address">
            <view class="shop-status">
              <BusinessStatus :state="shopInfo.state" />
            </view>
            <view @click.stop>
              <up-button type="primary" shape="circle" size="small" class="shop-status-btn" @click="toggleShopStatus">
                {{ shopInfo.state == 'open' ? '休息' : '营业' }}
              </up-button>
            </view>
          </view>
        </view>
        <view class="shop-switch-section" @click="openShopModal" v-if="userStore.checkPermission('shop/switch')">
          <view class="shop-switch-btn">
            <view class="btn-content">
              <!-- <up-icon
								class="switch-icon"
								name="shop"
								size="20"
								color="var(--primary-6)"
							></up-icon> -->
              <text class="btn-text">切换店铺</text>
              <up-icon class="arrow-icon" name="arrow-down" size="16" color="var(--primary-6)"></up-icon>
            </view>
            <view class="shop-count">{{ state.shopList.length }}家店铺</view>
          </view>
        </view>
      </view>

      <!-- 无权限提示 -->
      <view v-else class="no-permission-card z-glass-card">
        <view class="no-permission-content">
          <up-icon name="lock" size="60" color="#999"></up-icon>
          <text class="no-permission-text">您暂无店铺管理权限</text>
          <text class="no-permission-desc">请联系管理员开通相关权限</text>
        </view>
      </view>

      <up-subsection
        :list="state.list"
        class="shop-subsection"
        :current="state.currentTab"
        @change="handleTabChange"
        v-if="userStore.checkShopPermission()"
      ></up-subsection>
      <view class="z-glass-card" v-show="state.currentTab === 0 && userStore.checkShopPermission()">
        <up-cell-group v-for="main in filteredCellList" :key="main.title">
          <view class="z-cell-title">{{ main.title }}</view>
          <up-cell
            v-for="item in main.children"
            :key="item.title"
            :title="item.title"
            :isLink="item.showArrow"
            @click="itemClick(item)"
          >
            <template #icon>
              <view class="z-cell-left-icon">{{ item.img }}</view>
            </template>
          </up-cell>
        </up-cell-group>
      </view>

      <view v-show="state.currentTab === 1 && userStore.checkShopPermission()">
        <!-- <view class="order-content"></view> -->
        <!-- 包含用户信息的订单卡片 -->
        <!-- <OrderCard
					v-for="order in state.sampleOrders"
					:key="order.orderNumber"
					:order-info="order"
					@order-click="handleOrderClick"
					@action-click="handleActionClick"
				/> -->
        <Order />
      </view>
    </div>
  </pageWrapper>
</template>

<script lang="ts" setup>
import { cloneDeep } from 'lodash-es';
import { onMounted, reactive, ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import pageWrapper from '@/components/page/index.vue';
import BusinessStatus from '@/components/business-status/index.vue';
import ShopSwitcher from '@/components/shop-switcher/index.vue';
import Order from './components/order.vue';
import { getDownloadUrl } from '@/api/common/upload';
import { useUserStore, useShopStore } from '@/stores';
import { ActionType, OrderStatus } from '@/enums/order';
import { getShopList, getShopConfigList, editShopConfig } from '@/api/shopManage';

const userStore = useUserStore();
const shopStore = useShopStore();

const shopSwitcherRef = ref<any>(null);

const state = reactive({
  currentTab: 0,
  list: ['店铺系统', '订单'],
  shopList: [] as any, // 店铺列表
  cellList: [
    {
      title: '店铺系统',
      permission: 'shop/shopSystem',
      children: [
        {
          title: '店铺详情',
          icon: 'star-fill',
          url: '/pages/shop/shopDetail/shopDetail',
          showArrow: true,
          img: '🏪',
        },
        {
          title: '报名审核',
          icon: 'star-fill',
          url: '',
          showArrow: true,
          img: '✅',
        },
        {
          title: '店铺订单',
          icon: 'star-fill',
          url: '/pages/shop/merchant/orders',
          showArrow: true,
          img: '📋',
        },
        {
          title: '数据分析',
          icon: 'star-fill',
          url: '',
          showArrow: true,
          img: '📊',
        },
        {
          title: '店铺二维码',
          icon: 'star-fill',
          url: '',
          type: 'qrcode',
          showArrow: true,
          img: '📱',
        },
      ],
    },
    {
      title: '店铺管理',
      children: [
        {
          title: '点单管理',
          icon: 'setting-fill',
          url: '/pages/shop/shopMenu/shopMenu',
          showArrow: true,
          img: '🍷',
          permission: 'shop/shopMenu',
        },
        {
          title: '游戏管理',
          icon: 'setting-fill',
          url: '/pages/shop/shopGames/shopGames',
          showArrow: true,
          img: '🎮',
          permission: 'shop/shopGames',
        },
        {
          title: '桌位管理',
          icon: 'setting-fill',
          url: '/pages/shop/tableManage/tableManage',
          showArrow: true,
          img: '🪑',
          permission: 'shop/tableManage',
        },
        {
          title: '门票设置',
          icon: 'setting-fill',
          url: '/pages/shop/ticketSettings/ticketSettings',
          showArrow: true,
          img: '🎫',
          permission: 'shop/ticketSettings',
        },
        {
          title: '员工管理',
          icon: 'setting-fill',
          url: '/pages/shop/shopStaff/shopStaff',
          showArrow: true,
          img: '👨‍👩‍👧‍👦',
          permission: 'shop/shopStaff',
        },
      ],
    },
  ],
  // 示例订单数据
  sampleOrders: [
    {
      orderNumber: 'ORD20241201001',
      status: OrderStatus.PENDING_ACCEPT,
      productImage: 'https://via.placeholder.com/120x120/FF6B6B/FFFFFF?text=奶茶',
      productName: '珍珠奶茶',
      productSpec: '大杯 / 少糖 / 加珍珠',
      price: 18.0,
      quantity: 2,
      totalAmount: 36.0,
      createTime: Date.now() - 1000 * 60 * 30, // 30分钟前
      userNickname: '小明',
      userPhoneTail: '8888',
      tableNumber: 'A12',
      actions: [
        {
          type: ActionType.ACCEPT,
          text: '接单',
        },
        {
          type: ActionType.CANCEL,
          text: '拒绝',
        },
      ],
    },
    {
      orderNumber: 'ORD20241201002',
      status: OrderStatus.PREPARING,
      productImage: 'https://via.placeholder.com/120x120/4ECDC4/FFFFFF?text=咖啡',
      productName: '拿铁咖啡',
      productSpec: '中杯 / 正常糖 / 加奶',
      price: 25.0,
      quantity: 1,
      totalAmount: 25.0,
      createTime: Date.now() - 1000 * 60 * 15, // 15分钟前
      payTime: Date.now() - 1000 * 60 * 14, // 14分钟前
      userNickname: '小红',
      userPhoneTail: '6666',
      tableNumber: 'B08',
      actions: [
        {
          type: ActionType.CONFIRM,
          text: '完成制作',
        },
      ],
    },
    {
      orderNumber: 'ORD20241201003',
      status: OrderStatus.DELIVERING,
      productImage: 'https://via.placeholder.com/120x120/45B7D1/FFFFFF?text=果汁',
      productName: '鲜榨橙汁',
      productSpec: '大杯 / 无糖 / 加冰',
      price: 22.0,
      quantity: 3,
      totalAmount: 66.0,
      createTime: Date.now() - 1000 * 60 * 45, // 45分钟前
      payTime: Date.now() - 1000 * 60 * 44, // 44分钟前
      deliveryTime: Date.now() - 1000 * 60 * 5, // 5分钟前
      userNickname: '小李',
      userPhoneTail: '9999',
      tableNumber: 'C15',
      actions: [
        {
          type: ActionType.CONFIRM,
          text: '确认送达',
        },
      ],
    },
    {
      orderNumber: 'ORD20241201004',
      status: OrderStatus.COMPLETED,
      productImage: 'https://via.placeholder.com/120x120/96CEB4/FFFFFF?text=茶',
      productName: '柠檬茶',
      productSpec: '中杯 / 微糖 / 加柠檬片',
      price: 16.0,
      quantity: 1,
      totalAmount: 16.0,
      createTime: Date.now() - 1000 * 60 * 120, // 2小时前
      payTime: Date.now() - 1000 * 60 * 119, // 1小时59分钟前
      deliveryTime: Date.now() - 1000 * 60 * 90, // 1小时30分钟前
      userNickname: '小王',
      userPhoneTail: '7777',
      tableNumber: 'D03',
      actions: [
        {
          type: ActionType.RATE,
          text: '评价',
        },
        {
          type: ActionType.REORDER,
          text: '再来一单',
        },
      ],
    },
  ],
});

let shopInfo = ref<any>({});

// 根据权限过滤功能列表
const filteredCellList = computed(() => {
  return (
    state.cellList
      // 先按分组级权限过滤
      .filter((main: any) => !main.permission || userStore.checkPermission(main.permission))
      .map(main => ({
        ...main,
        children: main.children.filter(item => !item.permission || userStore.checkPermission(item.permission)),
      }))
      .filter(main => main.children.length > 0)
  );
});

// 处理订单点击
const handleOrderClick = (orderInfo: any) => {
  uni.showToast({
    title: `点击了订单：${orderInfo.orderNumber}`,
    icon: 'none',
  });
};

// 处理操作按钮点击
const handleActionClick = (action: any, orderInfo: any) => {
  uni.showToast({
    title: `执行操作：${action.text}`,
    icon: 'none',
  });

  // 这里可以添加具体的业务逻辑
  console.log('Action:', action.type, 'Order:', orderInfo.orderNumber);
};

const handleTabChange = (index: number) => {
  state.currentTab = index;
};

const openShopModal = () => {
  console.log(shopInfo.value, 1234);
  shopSwitcherRef.value.openShopModal(shopInfo.value);
};

const GetShopConfigList = async () => {
  try {
    let params = {
      shopId: '',
      //   pageNum: 1,
      //   pageSize: 999,
      // id: userStore.userInfo?.id
    };
    const res = await getShopConfigList(params);
    if (res.data && Array.isArray(res.data) && res.data.length) {
      shopInfo.value = cloneDeep(res.data[0]) || {};
      // 将店铺数据添加到店铺列表中
      state.shopList = res.data || [];
      // 设置当前店铺ID
      if (state.shopList.length > 0 && !shopInfo.value.shopId) {
        shopInfo.value.shopId = state.shopList[0].shopId;
      }
    }
  } catch (error) {
    console.error('获取店铺配置失败:', error);
  }
};

// 处理店铺选择
const handleShopSelect = (shop: any) => {
  console.log('切换到店铺:', shop.name);
  // shopInfo.value.id = shopId;
  // 根据店铺ID更新当前店铺信息
  for (const key in shopInfo.value) {
    shopInfo.value[key] = shop[key];
  }
};

const itemClick = (item: any) => {
  if (item.url) {
    navigateTo(item.url);
  } else if (item.type == 'qrcode') {
    uni.showModal({
      title: '店铺二维码',
      content: shopInfo.value.name + '的二维码功能开发中，敬请期待！',
      showCancel: false,
      confirmText: '知道了',
    });
  } else {
    uni.showToast({
      title: '功能开发中',
      icon: 'none',
    });
  }
};
const navigateTo = (url: string) => {
  const shopId = shopInfo.value?.shopId || '';
  url &&
    uni.navigateTo({
      url: `${url}?shopId=${shopId}`,
    });
};

// 切换店铺营业状态
const toggleShopStatus = async () => {
  const state = shopInfo.value.state == 'open' ? 'close' : 'open';
  try {
    const res = await editShopConfig({
      shopId: shopInfo.value.shopId,
      state,
    });
    // 实际项目中，这里应该调用接口修改店铺状态
    shopInfo.value.state = state;
    uni.showToast({
      title: shopInfo.value.state == 'open' ? '已设为营业中' : '已设为休息',
      icon: 'success',
    });
  } catch (error) {
    console.error('切换店铺状态失败:', error);
  }
};

onMounted(() => {
  GetShopConfigList();
});

// 下拉刷新监听
onShow(async () => {
  try {
    await GetShopConfigList();
  } catch (error) {
    console.error('刷新店铺配置失败:', error);
  }
});
</script>

<style lang="scss" scoped>
.shop {
  padding: $up-box-pd;
  :deep(.shop-subsection) {
    margin: $up-box-mg 0;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .tags {
    flex-wrap: wrap;
    margin-top: 8rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
  .edit-btn {
    margin: 0 auto;
    margin-top: 20rpx;
  }

  /* 店铺基本信息卡片 */
  .shop-info-card {
    padding: $up-box-pd;
    .shop-intro,
    .shop-date {
      color: $u-content-color;
      font-size: $up-font-sm;
      margin-top: 6rpx;
    }
  }

  /* 无权限提示卡片 */
  .no-permission-card {
    padding: 60rpx $up-box-pd;
    text-align: center;

    .no-permission-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20rpx;

      .no-permission-text {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .no-permission-desc {
        font-size: 28rpx;
        color: #999;
      }
    }
  }

  .shop-header {
    display: flex;
    align-items: center;
    padding: 0;
  }

  .shop-logo {
    width: 60rpx;
    height: 60rpx;
    border-radius: 8rpx;
    margin-right: 12rpx;
  }

  .shop-basic-info {
    flex: 1;
  }

  .shop-name {
    font-size: $up-font-lg;
    font-weight: bold;
    color: #333;
    margin-bottom: 5rpx;
  }

  .shop-status {
    display: inline-block;
    padding: 4rpx 12rpx;
    border-radius: 20rpx;
    font-size: $up-font-sm;
    color: white;
    margin-left: 6rpx;
    margin-bottom: 10rpx;
    position: absolute;
    right: 16rpx;
    top: 16rpx;
    :deep(.u-tag) {
      border: none;
    }
    .shop-stats {
      display: flex;
      justify-content: space-around;
      padding: 10rpx 0;
      border-top: 1rpx solid #f0f0f0;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-number {
      font-size: $up-font-md;
      font-weight: bold;
      color: #333;
      margin-bottom: 5rpx;
    }

    .stat-label {
      font-size: $up-font-sm;
      color: #999;
    }
  }
  .shop-status-btn {
    margin-top: 40rpx;
  }

  .shop-switch-section {
    display: flex;
    align-items: center;
    justify-content: center;

    .shop-switch-btn {
      background: linear-gradient(135deg, var(--primary-1) 0%, var(--primary-2) 100%);
      border: 1px solid var(--primary-3);
      border-radius: 16rpx;
      padding: 8rpx 24rpx;
      min-width: 200rpx;
      box-shadow: 0 4rpx 12rpx rgba(34, 114, 251, 0.1);
      transition: all 0.3s ease;
      cursor: pointer;

      &:active {
        transform: scale(0.98);
        box-shadow: 0 2rpx 8rpx rgba(34, 114, 251, 0.15);
      }

      .btn-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12rpx;

        .switch-icon {
          flex-shrink: 0;
        }

        .btn-text {
          font-size: 28rpx;
          font-weight: 600;
          color: var(--primary-6);
          letter-spacing: 1rpx;
        }

        .arrow-icon {
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
      }

      .shop-count {
        text-align: center;
        margin-top: 6rpx;
        font-size: 20rpx;
        color: var(--text-2);
        opacity: 0.8;
      }
    }
  }
}
</style>
