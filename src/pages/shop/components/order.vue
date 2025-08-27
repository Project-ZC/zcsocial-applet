<template>
  <vertical-tabs
    v-model="activeTab"
    :tabs="tabs"
    :active-color="activeColor"
    :inactive-color="inactiveColor"
    :indicator-color="indicatorColor"
    height="calc(100vh - 80rpx)"
    @change="handleTabChange"
    @click="handleTabClick"
  >
    <template #content>
      <order-card
        v-for="order in filteredOrders"
        :key="order.orderNumber"
        :order-info="order"
        @order-click="handleOrderClick"
        @action-click="handleOrderActionClick"
      />
    </template>
  </vertical-tabs>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import OrderCard from '@/components/order-card/order-card.vue';
import VerticalTabs from '@/components/vertical-tabs/vertical-tabs.vue';
import { ActionType as OrderActionType, OrderStatus } from '@/enums/order';

// 颜色配置
const activeColor = ref('#007aff');
const inactiveColor = ref('#666666');
const indicatorColor = ref('#007aff');
// 当前选中的状态
const currentStatus = ref<OrderStatus | 'all'>('all');
// 模拟订单数据
const orders = ref([
  {
    orderNumber: 'ORD20241201001',
    status: OrderStatus.PENDING_ACCEPT,
    productImage: '/static/images/logo.png',
    productName: 'diy酒品',
    productSpec: '大杯 / 加冰球 / 加柠檬 / 加薄荷 / 50°酒精',
    price: 28.0,
    quantity: 1,
    totalAmount: 28.0,
    createTime: new Date().getTime() - 30 * 60 * 1000,
    userNickname: '张三',
    userPhoneTail: '8888',
    tableNumber: 'A12',
    actions: [
      { type: OrderActionType.PAY, text: '接受订单' },
      { type: OrderActionType.CANCEL, text: '取消订单' },
    ],
  },
  {
    orderNumber: 'ORD20241201002',
    status: OrderStatus.PENDING_ACCEPT,
    productImage: '/static/images/logo.png',
    productName: '鸡尾酒',
    productSpec: '中杯',
    price: 22.0,
    quantity: 1,
    totalAmount: 22.0,
    createTime: new Date().getTime() - 2 * 60 * 60 * 1000,
    userNickname: '李四',
    userPhoneTail: '6666',
    tableNumber: 'B08',
    actions: [
      { type: OrderActionType.PAY, text: '接受订单' },
      { type: OrderActionType.CANCEL, text: '取消订单' },
    ],
  },
  {
    orderNumber: 'ORD20241201003',
    status: OrderStatus.PREPARING,
    productImage: '/static/images/logo.png',
    productName: '鸡尾酒',
    productSpec: '大杯',
    price: 45.0,
    quantity: 1,
    totalAmount: 45.0,
    createTime: new Date().getTime() - 3 * 60 * 60 * 1000,
    userNickname: '王五',
    userPhoneTail: '9999',
    tableNumber: 'C15',
    actions: [{ type: OrderActionType.CONFIRM, text: '完成制作' }],
  },
]);
// 标签数据
const tabs = ref([
  {
    title: '全部',
    badge: '3',
    type: 'all',
  },
  {
    title: '鸡尾酒',
    badge: '3',
    type: 'cocktail',
  },
  {
    title: '伏特加',
    type: 'vodka',
  },
  {
    title: '啤酒',
    type: 'beer',
  },
  {
    title: '葡萄酒',
    type: 'wine',
  },
]);
// 根据状态筛选订单
const filteredOrders = computed(() => {
  if (currentStatus.value === 'all') {
    return orders.value;
  }
  return orders.value.filter(order => order.status === currentStatus.value);
});
// 订单相关事件处理
const handleOrderClick = (order: any) => {
  console.log('订单点击:', order);
  uni.navigateTo({
    url: `/pages/order-detail/order-detail?id=${order.orderNumber}`,
  });
};

const handleOrderActionClick = (order: any, action: any) => {
  console.log('订单操作点击:', order, action);
  // 这里可以处理订单相关的操作
};

// 处理标签变化
const handleTabChange = (data: { index: number; tab: any }) => {
  console.log('标签变化:', data);
};

// 处理标签点击
const handleTabClick = (data: { index: number; tab: any }) => {
  console.log('标签点击:', data);
};
</script>

<style scoped lang="scss"></style>
