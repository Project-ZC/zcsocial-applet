<template>
  <view class="order-card-box">
    <view class="order-card z-glass-card" @tap="handleOrderClick">
      <!-- 订单头部 -->
      <view class="order-header">
        <view class="order-number">
          <text class="label">订单号：</text>
          <text class="value">{{ orderInfo.orderNumber }}</text>
        </view>
        <view class="order-status" :class="getStatusClass(orderInfo.status)">
          {{ getStatusText(orderInfo.status) }}
        </view>
      </view>

      <!-- 商品信息 -->
      <view class="product-info">
        <image class="product-image" :src="orderInfo.productImage" mode="aspectFill" />
        <view class="product-details">
          <view class="product-name">{{ orderInfo.productName }}</view>
          <view class="product-spec">{{ orderInfo.productSpec }}</view>
          <view class="product-price">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ orderInfo.price }}</text>
            <text class="quantity">x{{ orderInfo.quantity }}</text>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="order-details">
        <!-- 用户信息 -->
        <view class="detail-item" v-if="orderInfo.userNickname">
          <text class="label">用户昵称：</text>
          <text class="value">{{ orderInfo.userNickname }}</text>
        </view>
        <view class="detail-item" v-if="orderInfo.userPhoneTail">
          <text class="label">手机尾号：</text>
          <text class="value">{{ orderInfo.userPhoneTail }}</text>
        </view>
        <view class="detail-item" v-if="orderInfo.tableNumber">
          <text class="label">桌子号：</text>
          <text class="value table-number">{{ orderInfo.tableNumber }}</text>
        </view>

        <!-- 时间信息 -->
        <view class="detail-item">
          <text class="label">下单时间：</text>
          <text class="value">{{ formatTime(orderInfo.createTime) }}</text>
        </view>
        <view class="detail-item" v-if="orderInfo.payTime">
          <text class="label">支付时间：</text>
          <text class="value">{{ formatTime(orderInfo.payTime) }}</text>
        </view>
        <view class="detail-item" v-if="orderInfo.deliveryTime">
          <text class="label">配送时间：</text>
          <text class="value">{{ formatTime(orderInfo.deliveryTime) }}</text>
        </view>

        <!-- 金额信息 -->
        <view class="detail-item">
          <text class="label">总金额：</text>
          <text class="value total-price">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ orderInfo.totalAmount }}</text>
          </text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="order-actions" v-if="orderInfo.actions && orderInfo.actions.length > 0">
        <up-button
          v-for="action in orderInfo.actions"
          :key="action.type"
          class="action-btn"
          :class="getActionClass(action.type)"
          @tap.stop="handleAction(action)"
        >
          {{ action.text }}
        </up-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { ActionButton, OrderInfo } from '@/types/order';
import { ActionType, OrderStatus } from '@/enums/order';
import { computed, withDefaults } from 'vue';

const props = withDefaults(
  defineProps<{
    orderInfo: OrderInfo;
  }>(),
  {}
);

const emit = defineEmits<{
  orderClick: [orderInfo: OrderInfo];
  actionClick: [action: ActionButton, orderInfo: OrderInfo];
}>();

// 获取状态样式类
const getStatusClass = (status: OrderStatus) => {
  const statusMap = {
    [OrderStatus.PENDING_PAYMENT]: 'status-pending',
    [OrderStatus.PAID]: 'status-paid',
    [OrderStatus.PENDING_ACCEPT]: 'status-pending-accept',
    [OrderStatus.PREPARING]: 'status-preparing',
    [OrderStatus.DELIVERING]: 'status-delivering',
    [OrderStatus.COMPLETED]: 'status-completed',
    [OrderStatus.CANCELLED]: 'status-cancelled',
    [OrderStatus.REFUNDING]: 'status-refunding',
    [OrderStatus.REFUNDED]: 'status-refunded',
  };
  return statusMap[status] || 'status-default';
};

// 获取状态文本
const getStatusText = (status: OrderStatus) => {
  const statusMap = {
    [OrderStatus.PENDING_PAYMENT]: '待支付',
    [OrderStatus.PAID]: '已支付',
    [OrderStatus.PENDING_ACCEPT]: '未接单',
    [OrderStatus.PREPARING]: '制作中',
    [OrderStatus.DELIVERING]: '配送中',
    [OrderStatus.COMPLETED]: '已完成',
    [OrderStatus.CANCELLED]: '已取消',
    [OrderStatus.REFUNDING]: '退款中',
    [OrderStatus.REFUNDED]: '已退款',
  };
  return statusMap[status] || '未知状态';
};

// 获取操作按钮样式类
const getActionClass = (type: ActionType) => {
  const actionMap = {
    [ActionType.PAY]: 'btn-primary',
    [ActionType.CANCEL]: 'btn-secondary',
    [ActionType.ACCEPT]: 'btn-success',
    [ActionType.CONFIRM]: 'btn-primary',
    [ActionType.REFUND]: 'btn-warning',
    [ActionType.RATE]: 'btn-success',
    [ActionType.REORDER]: 'btn-primary',
  };
  return actionMap[type] || 'btn-default';
};

// 格式化时间
const formatTime = (time: string | number) => {
  if (!time) return '';
  const date = new Date(time);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 处理订单点击
const handleOrderClick = () => {
  emit('orderClick', props.orderInfo);
};

// 处理操作按钮点击
const handleAction = (action: ActionButton) => {
  if (action.disabled) return;
  emit('actionClick', action, props.orderInfo);
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';
.order-card-box {
  //   padding: 10rpx 20rpx;
  box-sizing: border-box;

  .order-card {
    padding: 24rpx;
    box-sizing: border-box;
    // background-color: #fff;
    // border-radius: 16rpx;
    margin-bottom: $up-box-mg;
    // box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
      box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.12);
    }

    // 深色模式
    &.dark-theme {
      background-color: #2c2c2c;
      color: #e0e0e0;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);

      .order-header {
        border-bottom-color: #444;
      }

      .product-details {
        .product-name {
          color: #e0e0e0;
        }

        .product-spec {
          color: #aaa;
        }
      }

      .order-details {
        .detail-item {
          .label {
            color: #aaa;
          }

          .value {
            color: #e0e0e0;

            &.table-number {
              color: #69c0ff;
              background-color: #1f1f1f;
              border: 1rpx solid #69c0ff;
            }
          }
        }
      }
    }

    // 订单头部
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20rpx;
      border-bottom: 1rpx solid #f0f0f0;
      margin-bottom: 20rpx;

      .order-number {
        display: flex;
        align-items: center;
        font-size: 28rpx;

        .label {
          color: var(--text-2);
        }

        .value {
          color: var(--text-1);
          font-weight: 500;
        }
      }

      .order-status {
        padding: 8rpx 16rpx;
        border-radius: 20rpx;
        font-size: 24rpx;
        font-weight: 500;

        &.status-pending {
          background-color: #fff7e6;
          color: #fa8c16;
        }

        &.status-paid {
          background-color: #e6f7ff;
          color: #1890ff;
        }

        &.status-pending-accept {
          background-color: #fff2e8;
          color: #fa541c;
        }

        &.status-preparing {
          background-color: #f6ffed;
          color: #52c41a;
        }

        &.status-delivering {
          background-color: #e6f7ff;
          color: #1890ff;
        }

        &.status-completed {
          background-color: #f6ffed;
          color: #52c41a;
        }

        &.status-cancelled {
          background-color: #fff2f0;
          color: #ff4d4f;
        }

        &.status-refunding {
          background-color: #fff7e6;
          color: #fa8c16;
        }

        &.status-refunded {
          background-color: #f5f5f5;
          color: var(--text-3);
        }
      }
    }

    // 商品信息
    .product-info {
      display: flex;
      margin-bottom: 20rpx;

      .product-image {
        width: 120rpx;
        height: 120rpx;
        border-radius: $up-box-radius-1;
        margin-right: 20rpx;
        background-color: #f5f5f5;
      }

      .product-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .product-name {
          font-size: 30rpx;
          font-weight: 500;
          color: var(--text-1);
          line-height: 1.4;
          margin-bottom: 8rpx;
        }

        .product-spec {
          font-size: 26rpx;
          color: var(--text-2);
          margin-bottom: 12rpx;
        }

        .product-price {
          display: flex;
          align-items: center;

          .price-symbol {
            font-size: 24rpx;
            color: #ff4d4f;
            margin-right: 4rpx;
          }

          .price-value {
            font-size: 28rpx;
            font-weight: 600;
            color: #ff4d4f;
            margin-right: 12rpx;
          }

          .quantity {
            font-size: 24rpx;
            color: var(--text-3);
          }
        }
      }
    }

    // 订单详情
    .order-details {
      margin-bottom: 20rpx;

      .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;
        font-size: 26rpx;

        &:last-child {
          margin-bottom: 0;
          padding-top: 12rpx;
          border-top: 1rpx solid #f0f0f0;
        }

        .label {
          color: var(--text-2);
        }

        .value {
          color: var(--text-1);
          text-align: right;

          &.total-price {
            font-weight: 600;
            font-size: 28rpx;

            .price-symbol {
              color: #ff4d4f;
            }

            .price-value {
              color: #ff4d4f;
            }
          }

          &.table-number {
            font-weight: 600;
            color: #1890ff;
            background-color: #e6f7ff;
            padding: 4rpx 12rpx;
            border-radius: 12rpx;
            font-size: 24rpx;
          }
        }
      }
    }

    // 操作按钮
    .order-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16rpx;

      .action-btn {
        padding: 12rpx 24rpx;
        border-radius: 20rpx;
        font-size: 24rpx;
        border: none;
        background: none;
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.95);
        }

        &.btn-primary {
          background-color: #1890ff;
          color: #fff;

          &:active {
            background-color: #096dd9;
          }
        }

        &.btn-secondary {
          background-color: #f5f5f5;
          color: var(--text-2);
          border: 1rpx solid #d9d9d9;

          &:active {
            background-color: #e6e6e6;
          }
        }

        &.btn-warning {
          background-color: #fa8c16;
          color: #fff;

          &:active {
            background-color: #d46b08;
          }
        }

        &.btn-success {
          background-color: #52c41a;
          color: #fff;

          &:active {
            background-color: #389e0d;
          }
        }

        &.btn-default {
          background-color: #f5f5f5;
          color: var(--text-2);

          &:active {
            background-color: #e6e6e6;
          }
        }

        &:disabled {
          opacity: 0.5;
          pointer-events: none;
        }
      }
    }
  }
}
</style>
