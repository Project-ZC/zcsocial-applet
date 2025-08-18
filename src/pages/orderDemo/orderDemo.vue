<template>
  <view class="order-demo-page">
    <up-navbar title="订单卡片演示" :show-back="true" />
    
    <view class="content">
      <view class="section-title">订单卡片示例</view>
      
      <!-- 包含用户信息的订单卡片 -->
      <order-card
        v-for="order in sampleOrders"
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
import { ActionType, OrderStatus } from '@/enums/order';
import type { ActionButton, OrderInfo } from '@/types/order';

// 示例订单数据
const sampleOrders: OrderInfo[] = [
  {
    orderNumber: 'ORD20241201001',
    status: OrderStatus.PENDING_ACCEPT,
    productImage: 'https://via.placeholder.com/120x120/FF6B6B/FFFFFF?text=奶茶',
    productName: '珍珠奶茶',
    productSpec: '大杯 / 少糖 / 加珍珠',
    price: 18.00,
    quantity: 2,
    totalAmount: 36.00,
    createTime: Date.now() - 1000 * 60 * 30, // 30分钟前
    userNickname: '小明',
    userPhoneTail: '8888',
    tableNumber: 'A12',
    actions: [
      {
        type: ActionType.ACCEPT,
        text: '接单'
      },
      {
        type: ActionType.CANCEL,
        text: '拒绝'
      }
    ]
  },
  {
    orderNumber: 'ORD20241201002',
    status: OrderStatus.PREPARING,
    productImage: 'https://via.placeholder.com/120x120/4ECDC4/FFFFFF?text=咖啡',
    productName: '拿铁咖啡',
    productSpec: '中杯 / 正常糖 / 加奶',
    price: 25.00,
    quantity: 1,
    totalAmount: 25.00,
    createTime: Date.now() - 1000 * 60 * 15, // 15分钟前
    payTime: Date.now() - 1000 * 60 * 14, // 14分钟前
    userNickname: '小红',
    userPhoneTail: '6666',
    tableNumber: 'B08',
    actions: [
      {
        type: ActionType.CONFIRM,
        text: '完成制作'
      }
    ]
  },
  {
    orderNumber: 'ORD20241201003',
    status: OrderStatus.DELIVERING,
    productImage: 'https://via.placeholder.com/120x120/45B7D1/FFFFFF?text=果汁',
    productName: '鲜榨橙汁',
    productSpec: '大杯 / 无糖 / 加冰',
    price: 22.00,
    quantity: 3,
    totalAmount: 66.00,
    createTime: Date.now() - 1000 * 60 * 45, // 45分钟前
    payTime: Date.now() - 1000 * 60 * 44, // 44分钟前
    deliveryTime: Date.now() - 1000 * 60 * 5, // 5分钟前
    userNickname: '小李',
    userPhoneTail: '9999',
    tableNumber: 'C15',
    actions: [
      {
        type: ActionType.CONFIRM,
        text: '确认送达'
      }
    ]
  },
  {
    orderNumber: 'ORD20241201004',
    status: OrderStatus.COMPLETED,
    productImage: 'https://via.placeholder.com/120x120/96CEB4/FFFFFF?text=茶',
    productName: '柠檬茶',
    productSpec: '中杯 / 微糖 / 加柠檬片',
    price: 16.00,
    quantity: 1,
    totalAmount: 16.00,
    createTime: Date.now() - 1000 * 60 * 120, // 2小时前
    payTime: Date.now() - 1000 * 60 * 119, // 1小时59分钟前
    deliveryTime: Date.now() - 1000 * 60 * 90, // 1小时30分钟前
    userNickname: '小王',
    userPhoneTail: '7777',
    tableNumber: 'D03',
    actions: [
      {
        type: ActionType.RATE,
        text: '评价'
      },
      {
        type: ActionType.REORDER,
        text: '再来一单'
      }
    ]
  }
];

// 处理订单点击
const handleOrderClick = (orderInfo: OrderInfo) => {
  uni.showToast({
    title: `点击了订单：${orderInfo.orderNumber}`,
    icon: 'none'
  });
};

// 处理操作按钮点击
const handleActionClick = (action: ActionButton, orderInfo: OrderInfo) => {
  uni.showToast({
    title: `执行操作：${action.text}`,
    icon: 'none'
  });
  
  // 这里可以添加具体的业务逻辑
  console.log('Action:', action.type, 'Order:', orderInfo.orderNumber);
};

defineOptions({
  styleIsolation: "shared",
});
</script>

<style lang="scss" scoped>
.order-demo-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  
  .content {
    padding: 20rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 20rpx;
      padding: 0 10rpx;
    }
  }
}
</style> 