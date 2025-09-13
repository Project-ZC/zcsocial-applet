<template>
  <pageWrapper showFooter>
    <view class="ticket-receive">
      <!-- 页面标题 -->
      <view class="page-header">
        <text class="page-title">接收门票</text>
        <text class="page-subtitle">朋友转赠的门票</text>
      </view>

      <!-- 门票信息卡片 -->
      <view class="ticket-card z-glass-card" v-if="state.ticketInfo">
        <!-- 门票头部 -->
        <view class="ticket-header">
          <view class="ticket-status">
            <text class="status-text">待接收</text>
          </view>
          <view class="ticket-type">
            <text class="type-text">{{ state.ticketInfo.ticketName }}</text>
          </view>
        </view>

        <!-- 店铺信息 -->
        <view class="shop-info">
          <view class="shop-avatar">
            <up-avatar :src="getDownloadUrl(state.ticketInfo.shopAvatar)" size="80rpx"></up-avatar>
          </view>
          <view class="shop-details">
            <text class="shop-name">{{ state.ticketInfo.shopName }}</text>
            <text class="shop-address">{{ state.ticketInfo.shopAddress }}</text>
          </view>
        </view>

        <!-- 门票详情 -->
        <view class="ticket-details">
          <view class="detail-row">
            <text class="detail-label">门票名称</text>
            <text class="detail-value">{{ state.ticketInfo.ticketName }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">有效期至</text>
            <text class="detail-value">{{ state.ticketInfo.expiryDate }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">转赠人</text>
            <text class="detail-value">{{ state.ticketInfo.fromUserName }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">转赠时间</text>
            <text class="detail-value">{{ state.ticketInfo.transferTime }}</text>
          </view>
        </view>

        <!-- 门票二维码 -->
        <view class="ticket-qrcode" v-if="state.ticketInfo.qrCode">
          <view class="qrcode-container">
            <up-image
              class="qrcode-image"
              :src="getDownloadUrl(state.ticketInfo.qrCode)"
              mode="aspectFit"
              @longpress="handleQRCodeLongPress"
            ></up-image>
            <text class="qrcode-tip">长按保存或识别二维码</text>
          </view>
        </view>

        <!-- 门票说明 -->
        <view class="ticket-description">
          <text class="desc-title">使用说明</text>
          <text class="desc-content">
            1. 请携带此门票到店使用\n 2. 门票仅限本人使用，不可转让\n 3. 请在有效期内使用，过期作废\n 4.
            如有疑问请联系商家
          </text>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-container" v-if="state.loading">
        <up-loading-icon mode="circle"></up-loading-icon>
        <text class="loading-text">正在加载门票信息...</text>
      </view>

      <!-- 错误状态 -->
      <view class="error-container" v-if="state.error">
        <view class="error-icon">⚠️</view>
        <text class="error-title">{{ state.error.title }}</text>
        <text class="error-message">{{ state.error.message }}</text>
        <up-button type="primary" shape="circle" @click="retryLoad">重新加载</up-button>
      </view>

      <!-- 空状态 -->
      <view class="empty-container" v-if="state.showEmpty">
        <view class="empty-icon">🎫</view>
        <text class="empty-title">门票不存在</text>
        <text class="empty-message">该门票可能已被使用或已过期</text>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <template #footer v-if="state.ticketInfo">
      <view class="footer-actions">
        <up-button type="default" shape="circle" @click="goToMyTickets" class="action-btn">查看我的票夹</up-button>
        <up-button type="primary" shape="circle" @click="receiveTicket" :loading="state.receiving" class="action-btn">
          确认接收
        </up-button>
      </view>
    </template>
  </pageWrapper>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { reactive } from 'vue';
import pageWrapper from '@/components/page/index.vue';
import { getDownloadUrl } from '@/api/common/upload';
import { handleQRCodeLongPress } from '@/utils/util';

// 页面状态
const state = reactive({
  loading: false,
  receiving: false,
  error: null as any,
  showEmpty: false,
  ticketInfo: null as any,
  ticketId: '',
  fromUserId: '',
});

// 加载门票信息
const loadTicketInfo = async () => {
  if (!state.ticketId) {
    state.error = {
      title: '参数错误',
      message: '缺少门票ID参数',
    };
    return;
  }

  state.loading = true;
  state.error = null;

  try {
    // 这里应该调用实际的API获取门票信息
    // const res = await getTicketInfo({ ticketId: state.ticketId, fromUserId: state.fromUserId });

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟门票数据
    const mockTicketInfo = {
      id: state.ticketId,
      ticketName: '微醺套餐',
      shopName: '微醺酒吧',
      shopAvatar: '/static/images/shop-avatar.png',
      shopAddress: '北京市朝阳区三里屯',
      expiryDate: '2024-12-31 23:59',
      fromUserName: '张三',
      transferTime: '2024-01-15 19:30',
      qrCode: '/static/images/ticket-qr.png',
      status: 'pending', // pending: 待接收, received: 已接收, expired: 已过期
    };

    // 检查门票状态
    if (mockTicketInfo.status === 'expired') {
      state.showEmpty = true;
      return;
    }

    if (mockTicketInfo.status === 'received') {
      state.error = {
        title: '门票已接收',
        message: '该门票已被其他用户接收',
      };
      return;
    }

    state.ticketInfo = mockTicketInfo;
  } catch (err) {
    console.error('加载门票信息失败:', err);
    state.error = {
      title: '加载失败',
      message: '无法获取门票信息，请检查网络连接',
    };
  } finally {
    state.loading = false;
  }
};

// 接收门票
const receiveTicket = async () => {
  if (!state.ticketInfo) return;

  state.receiving = true;

  try {
    // 这里应该调用实际的API接收门票
    // await receiveTicketApi({ ticketId: state.ticketId, fromUserId: state.fromUserId });

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500));

    uni.showModal({
      title: '接收成功',
      content: '门票已成功添加到您的票夹中',
      showCancel: false,
      confirmText: '查看票夹',
      success: res => {
        if (res.confirm) {
          goToMyTickets();
        }
      },
    });

    // 更新门票状态
    state.ticketInfo.status = 'received';
  } catch (err) {
    console.error('接收门票失败:', err);
    uni.showToast({
      title: '接收失败，请重试',
      icon: 'none',
    });
  } finally {
    state.receiving = false;
  }
};

// 跳转到我的票夹
const goToMyTickets = () => {
  uni.navigateTo({
    url: '/pages/my/ticketholder/ticketholder',
  });
};

// 重新加载
const retryLoad = () => {
  loadTicketInfo();
};

// 页面加载
onLoad(options => {
  state.ticketId = options.ticketId || '';
  state.fromUserId = options.fromUserId || '';

  if (state.ticketId) {
    loadTicketInfo();
  } else {
    state.error = {
      title: '参数错误',
      message: '缺少必要参数',
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.ticket-receive {
  min-height: 100vh;
  padding: $up-box-pd;
}

.page-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.page-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: var(--text-1);
  margin-bottom: 10rpx;
}

.page-subtitle {
  display: block;
  font-size: 28rpx;
  color: var(--text-3);
}

.ticket-card {
  margin-bottom: 40rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid var(--border-1);
}

.ticket-status {
  background: var(--primary-6);
  color: #fff;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.ticket-type {
  flex: 1;
  text-align: right;
}

.type-text {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--text-1);
}

.shop-info {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  padding: 20rpx;
  background: var(--bg-1);
  border-radius: 12rpx;
}

.shop-avatar {
  margin-right: 20rpx;
}

.shop-details {
  flex: 1;
}

.shop-name {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: var(--text-1);
  margin-bottom: 8rpx;
}

.shop-address {
  display: block;
  font-size: 24rpx;
  color: var(--text-3);
}

.ticket-details {
  margin-bottom: 30rpx;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid var(--border-1);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 28rpx;
  color: var(--text-2);
}

.detail-value {
  font-size: 28rpx;
  color: var(--text-1);
  font-weight: 500;
}

.ticket-qrcode {
  text-align: center;
  margin-bottom: 30rpx;
  padding: 30rpx;
  background: var(--bg-1);
  border-radius: 12rpx;
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
}

.qrcode-tip {
  font-size: 24rpx;
  color: var(--text-3);
}

.ticket-description {
  padding: 20rpx;
  background: var(--bg-1);
  border-radius: 12rpx;
}

.desc-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: var(--text-1);
  margin-bottom: 16rpx;
}

.desc-content {
  display: block;
  font-size: 26rpx;
  color: var(--text-2);
  line-height: 1.6;
  white-space: pre-line;
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;
  text-align: center;
}

.loading-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: var(--text-2);
}

.error-icon,
.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.error-title,
.empty-title {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--text-1);
  margin-bottom: 10rpx;
}

.error-message,
.empty-message {
  font-size: 28rpx;
  color: var(--text-3);
  margin-bottom: 30rpx;
  line-height: 1.5;
}

.footer-actions {
  display: flex;
  gap: 20rpx;
  padding: 0 $up-box-pd;
}

.action-btn {
  flex: 1;
}
</style>
