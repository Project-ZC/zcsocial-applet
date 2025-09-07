<template>
  <view class="merchant-orders-page" :class="{ 'dark-theme': isDarkMode }">
    <!-- 页面标题 -->
    <view class="page-header">
      <view class="title">商家订单管理</view>
      <view class="stats">
        <view class="stat-item">
          <text class="stat-number">{{ pendingAcceptCount }}</text>
          <text class="stat-label">待接单</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ preparingCount }}</text>
          <text class="stat-label">制作中</text>
        </view>
      </view>
    </view>

    <!-- 状态筛选标签 -->
    <view class="status-tabs">
      <view
        v-for="tab in statusTabs"
        :key="tab.status"
        class="tab-item"
        :class="{ active: currentStatus === tab.status }"
        @tap="switchStatus(tab.status)"
      >
        {{ tab.text }}
        <view class="tab-badge" v-if="tab.count > 0">{{ tab.count }}</view>
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="orders-list">
      <order-card
        v-for="order in filteredOrders"
        :key="order.orderNumber"
        :order-info="order"
        @order-click="handleOrderClick"
        @action-click="handleActionClick"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import OrderCard from '@/components/order-card/order-card.vue';
import { useThemeStore } from '@/stores/modules/theme';
import { ActionType, OrderStatus } from '@/enums/order';
import { computed, ref } from 'vue';

const themeStore = useThemeStore();
const isDarkMode = computed(() => themeStore.isDarkMode);

// 当前选中的状态
const currentStatus = ref<OrderStatus | 'all'>('all');

// 模拟商家订单数据
const orders = ref([
  {
    orderNumber: 'ORD20241201001',
    status: OrderStatus.PENDING_ACCEPT,
    productImage: '/static/images/logo.png',
    productName: '经典拿铁咖啡',
    productSpec: '大杯 / 热饮 / 加糖',
    price: 28.0,
    quantity: 1,
    totalAmount: 28.0,
    createTime: new Date().getTime() - 5 * 60 * 1000,
    payTime: new Date().getTime() - 3 * 60 * 1000,
    actions: [
      { type: ActionType.ACCEPT, text: '接取订单' },
      { type: ActionType.CANCEL, text: '拒绝订单' },
    ],
  },
  {
    orderNumber: 'ORD20241201002',
    status: OrderStatus.PREPARING,
    productImage: '/static/images/logo.png',
    productName: '美式咖啡 + 提拉米苏',
    productSpec: '中杯 / 冰饮 / 无糖 + 标准份',
    price: 45.0,
    quantity: 1,
    totalAmount: 45.0,
    createTime: new Date().getTime() - 20 * 60 * 1000,
    payTime: new Date().getTime() - 18 * 60 * 1000,
    actions: [{ type: ActionType.CANCEL, text: '取消订单' }],
  },
]);

// 计算各状态订单数量
const pendingAcceptCount = computed(
  () => orders.value.filter(order => order.status === OrderStatus.PENDING_ACCEPT).length
);

const preparingCount = computed(() => orders.value.filter(order => order.status === OrderStatus.PREPARING).length);

// 状态筛选标签
const statusTabs = computed(() => [
  {
    status: 'all' as const,
    text: '全部',
    count: orders.value.length,
  },
  {
    status: OrderStatus.PENDING_ACCEPT,
    text: '待接单',
    count: pendingAcceptCount.value,
  },
  {
    status: OrderStatus.PREPARING,
    text: '制作中',
    count: preparingCount.value,
  },
]);

// 根据状态筛选订单
const filteredOrders = computed(() => {
  if (currentStatus.value === 'all') {
    return orders.value;
  }
  return orders.value.filter(order => order.status === currentStatus.value);
});

// 切换状态
const switchStatus = (status: OrderStatus | 'all') => {
  currentStatus.value = status;
};

// 获取状态文本
const getStatusText = (status: OrderStatus | 'all') => {
  if (status === 'all') return '';
  const statusMap = {
    [OrderStatus.PENDING_ACCEPT]: '未接单',
    [OrderStatus.PREPARING]: '制作中',
  };
  return statusMap[status] || '';
};

// 处理订单点击
const handleOrderClick = (orderInfo: any) => {
  uni.showToast({
    title: `查看订单详情：${orderInfo.orderNumber}`,
    icon: 'none',
  });
};

// 处理操作按钮点击
const handleActionClick = (action: any, orderInfo: any) => {
  switch (action.type) {
    case ActionType.ACCEPT:
      handleAccept(orderInfo);
      break;
    case ActionType.CANCEL:
      handleCancel(orderInfo);
      break;
  }
};

// 处理接取订单
const handleAccept = (orderInfo: any) => {
  uni.showModal({
    title: '确认接单',
    content: `确认接取订单 ${orderInfo.orderNumber} 吗？`,
    success: res => {
      if (res.confirm) {
        const order = orders.value.find(o => o.orderNumber === orderInfo.orderNumber);
        if (order) {
          order.status = OrderStatus.PREPARING;
          order.actions = [{ type: ActionType.CANCEL, text: '取消订单' }];
        }
        uni.showToast({
          title: '订单已接取',
          icon: 'success',
        });
      }
    },
  });
};

// 处理取消/拒绝订单
const handleCancel = (orderInfo: any) => {
  const isPendingAccept = orderInfo.status === OrderStatus.PENDING_ACCEPT;
  const title = isPendingAccept ? '确认拒绝' : '确认取消';
  const content = isPendingAccept
    ? `确认拒绝订单 ${orderInfo.orderNumber} 吗？`
    : `确认取消订单 ${orderInfo.orderNumber} 吗？`;

  uni.showModal({
    title,
    content,
    success: res => {
      if (res.confirm) {
        const order = orders.value.find(o => o.orderNumber === orderInfo.orderNumber);
        if (order) {
          order.status = OrderStatus.CANCELLED;
          order.actions = [];
        }
        uni.showToast({
          title: isPendingAccept ? '订单已拒绝' : '订单已取消',
          icon: 'success',
        });
      }
    },
  });
};
</script>

<style lang="scss" scoped>
.merchant-orders-page {
  // 页面头部
  .page-header {
    background-color: var(--bg-2);
    padding: 20rpx;
    margin-bottom: 20rpx;

    .title {
      font-size: 36rpx;
      font-weight: 600;
      color: var(--text-1);
      margin-bottom: 30rpx;
      text-align: center;
    }

    .stats {
      display: flex;
      justify-content: space-around;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .stat-number {
          font-size: 48rpx;
          font-weight: 600;
          color: #1890ff;
          margin-bottom: 8rpx;
        }

        .stat-label {
          font-size: 24rpx;
          color: var(--text-2);
        }
      }
    }
  }

  // 状态筛选标签
  .status-tabs {
    display: flex;
    background-color: var(--bg-2);
    padding: 20rpx;
    margin-bottom: 20rpx;
    border-radius: 16rpx;

    .tab-item {
      flex: 1;
      text-align: center;
      padding: 16rpx 0;
      font-size: 28rpx;
      color: var(--text-2);
      border-radius: 20rpx;
      transition: all 0.3s ease;
      position: relative;

      &.active {
        background-color: #1890ff;
        color: #fff;
      }

      &:active {
        transform: scale(0.95);
      }

      .tab-badge {
        position: absolute;
        top: -8rpx;
        right: 20rpx;
        background-color: #ff4d4f;
        color: #fff;
        font-size: 20rpx;
        padding: 4rpx 8rpx;
        border-radius: 10rpx;
        min-width: 20rpx;
        text-align: center;
        line-height: 1;
      }
    }
  }

  // 订单列表
  .orders-list {
    padding: 0 20rpx;
  }
}
</style>
