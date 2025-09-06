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
      <view class="shop-info-card z-glass-card">
        <view class="shop-header">
          <up-image
            class="shop-logo"
            :src="getDownloadUrl(shopInfo.logo)"
            mode="aspectFill"
            width="140rpx"
            height="140rpx"
            @click="previewImage({ urls: [getDownloadUrl(shopInfo.logo)] })"
          ></up-image>
          <view class="shop-basic-info">
            <text class="shop-name">{{ shopInfo.name }}</text>
            <view class="shop-intro ovflow2">
              {{ shopInfo.address || '暂无地址' }}
            </view>
            <view class="shop-date">营业时间：{{ shopInfo.businessHours }}</view>
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
              <!-- <up-icon class="arrow-icon" name="arrow-down" size="20" color="var(--primary-6)"></up-icon> -->
              <view class="wd-icon wd-icon-switch-shop"></view>
            </view>
            <view class="shop-count">{{ state.shopList.length }}家店铺</view>
          </view>
        </view>
      </view>
      <!-- 无权限提示 -->
      <!-- <view v-else class="no-permission-card z-glass-card">
				<view class="no-permission-content">
					<up-icon name="lock" size="60" color="var(--text-3)"></up-icon>
					<text class="no-permission-text">您暂无店铺管理权限</text>
					<text class="no-permission-desc">请联系管理员开通相关权限</text>
				</view>
			</view> -->

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
              <view class="z-cell-left-icon">
                <view :class="`wd-icon wd-icon-${item.icon}`"></view>
                <!-- <up-image :src="item.img" width="20" height="20"></up-image> -->
              </view>
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
import { onShow, onPullDownRefresh, onHide } from '@dcloudio/uni-app';
import pageWrapper from '@/components/page/index.vue';
import BusinessStatus from '@/components/business-status/index.vue';
import ShopSwitcher from '@/components/shop-switcher/index.vue';
import Order from './components/order.vue';
import { getDownloadUrl } from '@/api/common/upload';
import { previewImage, getCurrentBusinessHours } from '@/utils/util';
import { useUserStore, useShopStore } from '@/stores';
import { ActionType, OrderStatus } from '@/enums/order';
import { getShopList, getShopConfigList, editShopConfig, getShopDetail } from '@/api/shopManage';
import { testRoleId } from '@/consts/auth';
import { uniCache } from '@/utils/storage';

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
          icon: 'shop-detail',
          url: '/pages/shop/shopDetail/shopDetail',
          showArrow: true,
          img: '/static/images/shop/shop-detail.png',
        },
        {
          title: '报名审核',
          icon: 'shop-audit',
          url: '',
          showArrow: true,
          img: '/static/images/shop/shop-audit.png',
        },
        {
          title: '店铺订单',
          icon: 'shop-order',
          url: '/pages/shop/merchant/orders',
          showArrow: true,
          img: '/static/images/shop/shop-order.png',
        },
        {
          title: '数据分析',
          icon: 'shop-analysis',
          url: '',
          showArrow: true,
          img: '/static/images/shop/shop-analysis.png',
        },
        {
          title: '店铺二维码',
          icon: 'shop-qrcode',
          url: '',
          type: 'qrcode',
          showArrow: true,
          img: '/static/images/shop/shop-qrcode.png',
        },
      ],
    },
    {
      title: '店铺管理',
      children: [
        {
          title: '点单管理',
          icon: 'shop-menu',
          url: '/pages/shop/shopMenu/shopMenu',
          showArrow: true,
          img: '/static/images/shop/shop-menu.png',
          permission: 'shop/shopMenu',
        },
        {
          title: '游戏管理',
          icon: 'shop-games',
          url: '/pages/shop/shopGames/shopGames',
          showArrow: true,
          img: '/static/images/shop/shop-games.png',
          permission: 'shop/shopGames',
        },
        {
          title: '桌位管理',
          icon: 'shop-table',
          url: '/pages/shop/tableManage/tableManage',
          showArrow: true,
          img: '/static/images/shop/shop-table.png',
          permission: 'shop/tableManage',
        },
        {
          title: '门票设置',
          icon: 'shop-ticket',
          url: '/pages/shop/ticketSettings/ticketSettings',
          showArrow: true,
          img: '/static/images/shop/shop-ticket.png',
          permission: 'shop/ticketSettings',
        },
        {
          title: '员工管理',
          icon: 'shop-staff',
          url: '/pages/shop/shopStaff/shopStaff',
          showArrow: true,
          img: '/static/images/shop/shop-staff.png',
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
  console.log('当前店铺信息:', shopInfo.value);
  // 传递完整的店铺对象，包含 shopConfig 和 userRole
  const currentShopData = state.shopList.find(shop => shop.shopConfig?.shopId === shopInfo.value?.shopId);
  shopSwitcherRef.value.openShopModal(currentShopData || {});
};

const GetShopConfigList = async () => {
  try {
    let params = {
      shopId: '',
      // pageNum: 1,
      // pageSize: 999,
      // id: userStore.userInfo?.id
    };
    const res = (await shopStore.GetMyShopList(params)) as any;
    if (res.data?.length) {
      // 获取上次缓存的店铺ID
      const lastSelectedShopId = uniCache.getItem('lastSelectedShopId');

      // 将店铺数据添加到店铺列表中
      state.shopList = res.data || [];

      // 优先选择上次缓存的店铺，如果没有缓存或店铺不存在，则选择第一个
      let selectedShop = null;
      if (lastSelectedShopId) {
        selectedShop = res.data.find(shop => shop.shopConfig?.shopId === lastSelectedShopId);
        if (selectedShop) {
        } else {
          selectedShop = res.data[0];
        }
      } else {
        selectedShop = res.data[0];
      }

      // 设置当前店铺信息
      shopInfo.value = cloneDeep(selectedShop.shopConfig) || {};

      shopInfo.value.businessHours = getCurrentBusinessHours(shopInfo.value.shippingTimeList)?.time;

      // 设置当前店铺ID
      if (state.shopList.length > 0 && !shopInfo.value?.shopId) {
        shopInfo.value.shopId = selectedShop.shopConfig?.shopId || '';
      }

      // 设置用户权限
      if (selectedShop.roleList && selectedShop.roleList.length > 0) {
        userStore.setPerms({ roleList: selectedShop.roleList });
      }
    } else {
      shopInfo.value = {};
      state.shopList = [];
      userStore.setPerms({});
    }
  } catch (error) {
    console.error('获取店铺配置失败:', error);
  }
};

// 处理店铺选择
const handleShopSelect = (shop: any) => {
  console.log('切换到店铺:', shop);
  // 更新当前店铺信息
  if (shop.shopConfig) {
    for (const key in shopInfo.value) {
      shopInfo.value[key] = shop.shopConfig[key];
    }
    // 更新用户权限
    if (shop.roleList && shop.roleList.length > 0) {
      let roleList = [...shop.roleList];
      if (testRoleId) {
        roleList = [testRoleId];
      }
      userStore.setPerms({ roleList });
    }

    // 缓存当前选中的店铺ID
    const currentShopId = shop.shopConfig.shopId;
    if (currentShopId) {
      uniCache.setItem('lastSelectedShopId', currentShopId);
      console.log('已缓存店铺ID:', currentShopId);
    }
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

// 每次显示页面时都刷新数据
onShow(async () => {
  try {
    await GetShopConfigList();
    // 监听店铺信息更新事件
    uni.$on('refreshShopList', () => {
      GetShopConfigList();
    });
    // 检查是否有店铺权限，如果没有则跳转到首页
    if (!userStore.checkShopPermission()) {
      console.log('用户无店铺权限，跳转到首页');
      return;
    }
  } catch (error) {}
});

onHide(() => {
  uni.$off('refreshShopList');
});

onPullDownRefresh(async () => {
  try {
    await GetShopConfigList();
  } catch (error) {
  } finally {
    uni.stopPullDownRefresh();
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
      color: var(--text-2);
      font-size: $up-font-sm;
    }

    .shop-date {
      margin-bottom: 10rpx;
    }
    .shop-intro {
      margin: 8rpx 0;
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
        color: var(--text-1);
      }

      .no-permission-desc {
        font-size: 28rpx;
        color: var(--text-3);
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
    color: var(--text-1);
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
      color: var(--text-1);
      margin-bottom: 5rpx;
    }

    .stat-label {
      font-size: $up-font-sm;
      color: var(--text-3);
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
      background: var(--btn-gradient-1);
      border: 1px solid var(--border-1);
      border-radius: 16rpx;
      padding: 8rpx 24rpx;
      min-width: 280rpx;
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
        .wd-icon-switch-shop {
          font-size: 36rpx;
          color: var(--text-1);
        }

        .switch-icon {
          flex-shrink: 0;
        }

        .btn-text {
          font-size: 28rpx;
          font-weight: 600;
          color: var(--text-1);
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
