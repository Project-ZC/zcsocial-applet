<template>
  <pageWrapper>
    <up-sticky :offset-top="0">
      <view class="tabs-wrapper z-glass-card">
        <Tabs :list="state.tabList" v-model="state.activeTab" @change="onTabChange" />
      </view>
    </up-sticky>
    <view class="ticket-holder">
      <!-- 顶部 Tabs -->
      <!-- 门票列表 -->
      <scroll-view scroll-y class="ticket-list">
        <view v-for="item in state.filteredTickets" :key="item.id" class="ticket-item z-glass-card">
          <!-- 头部 -->
          <view class="ticket-header flex-row space-between">
            <view class="ticket-info">
              <text class="ticket-name">{{ item.ticketName }} - {{ item.ticketType }}</text>
            </view>
            <up-tag size="mini" shape="circle" type="success" :class="item.status">{{ item.statusText }}</up-tag>
          </view>

          <slot name="userInfo" :item="item"></slot>

          <!-- 门票详情 -->
          <view class="ticket-details">
            <view class="detail-row flex-row space-between">
              <text class="detail-label">酒吧名称：</text>
              <text class="detail-value">{{ item.shopName }}</text>
            </view>
            <view class="detail-row flex-row space-between">
              <text class="detail-label">报名时间：</text>
              <text class="detail-value">{{ item.applyTime }}</text>
            </view>
            <view class="detail-row flex-row space-between">
              <text class="detail-label">包含酒水：</text>
              <text class="detail-value">{{ item.drinkCount }}杯</text>
            </view>
            <view class="detail-row flex-row space-between">
              <text class="detail-label">使用时长：</text>
              <text class="detail-value">{{ item.duration }}</text>
            </view>
            <view class="detail-row" v-if="item.description">
              <text class="detail-label">门票描述：</text>
              <text class="detail-value description">{{ item.description }}</text>
            </view>
          </view>

          <!-- 操作时间显示 -->
          <view class="operation-time" v-if="item.status === 'verified' || item.status === 'cancelled'">
            <view class="time-row" v-if="item.status === 'verified' && item.usedTime">
              <text class="time-label">校核时间：</text>
              <text class="time-value">{{ item.usedTime }}</text>
            </view>
            <view class="time-row" v-if="item.status === 'cancelled' && item.refundTime">
              <text class="time-label">退款时间：</text>
              <text class="time-value">{{ item.refundTime }}</text>
            </view>
          </view>

          <view class="ticket-actions" v-if="!props.isShop">
            <up-button type="primary" shape="circle" @click="handleTransferTicket(item)">转赠朋友</up-button>
          </view>
        </view>

        <!-- 空状态 -->
        <emptyData
          height="60vh"
          class="empty-state"
          text="暂无门票"
          subtext="该店铺还没有用户购买门票"
          v-if="state.showEmptyState"
        ></emptyData>
      </scroll-view>
    </view>
  </pageWrapper>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { reactive, computed } from 'vue';
import Tabs from '@/components/tabs/index.vue';

const props = defineProps({
  isShop: {
    type: Boolean,
    default: false,
  },
});

const state = reactive({
  activeTab: 'all',
  showEmptyState: false,

  // 门票数据
  allTickets: [] as any[],
  filteredTickets: [] as any[],

  // 顶部 tabs 配置
  tabList: [
    { title: '全部', status: 'all', count: 0 },
    { title: '已校核', status: 'verified', count: 0 },
    { title: '已取消', status: 'cancelled', count: 0 },
  ],

  // 生成门票相关
  searchUserId: '',
  searchedUser: null as any,
  selectedUser: null as any,
  selectedTicketType: '',
  shopTicketSettings: [] as any[],
});

const onTabChange = () => filterTickets();

// 计算有效期至（复制小程序逻辑）
const calculateExpiryDate = (joinTime: string, validityDays: number | string) => {
  const joinDate = new Date(joinTime);
  const days = typeof validityDays === 'string' ? parseInt(validityDays, 10) : validityDays || 0;
  const expiryDate = new Date(joinDate.getTime() + days * 24 * 60 * 60 * 1000);
  const y = expiryDate.getFullYear();
  const m = String(expiryDate.getMonth() + 1).padStart(2, '0');
  const d = String(expiryDate.getDate()).padStart(2, '0');
  const hh = String(joinDate.getHours()).padStart(2, '0');
  const mm = String(joinDate.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
};

// 加载门票数据（使用原模拟数据）
const loadTicketData = () => {
  const allTickets = [
    {
      id: '1',
      ticketName: '微醺套餐',
      purchaseTime: '2024-01-15 19:30',
      status: 'verified',
      statusText: '已校核',
      shopLogo: '/static/images/avatar1.png',
      shopName: '醉美酒吧',
      shopAddress: '北京市朝阳区三里屯街道',
      ticketType: '男性票',
      quantity: 2,
      validPeriod: '2024-01-15 至 2024-01-22',
      validityDays: 7,
      expiryDate: '2024-01-22',
      duration: '3小时',
      drinkCount: 6,
      joinTime: '2024-01-15 19:30',
      applyTime: '2024-01-15',
      description: '包含精选鸡尾酒3杯，小食拼盘1份，享受专业调酒师现场调制',
      originalPrice: '200.00',
      finalPrice: '176.00',
      discount: '8.8',
      usedTime: null,
      usedLocation: null,
      expiredTime: null,
      refundTime: null,
      refundReason: null,
      userNickname: '小明',
      userId: 'WD001234',
      userAvatar: '/static/images/user-avatar-1.png',
    },
    {
      id: '2',
      ticketName: '派对狂欢',
      purchaseTime: '2024-01-14 20:15',
      status: 'verified',
      statusText: '已校核',
      shopLogo: '/static/images/avatar2.png',
      shopName: '派对领地',
      shopAddress: '上海市黄浦区南京路',
      ticketType: '女性票',
      quantity: 1,
      validPeriod: '2024-01-14 至 2024-01-21',
      validityDays: 7,
      expiryDate: '2024-01-21',
      duration: '4小时',
      drinkCount: 4,
      joinTime: '2024-01-14 20:15',
      applyTime: '2024-01-14',
      description: '专为女性设计的派对套餐，包含特调鸡尾酒和精美小食',
      originalPrice: '150.00',
      finalPrice: '120.00',
      discount: '8.0',
      usedTime: '2024-01-14 21:30',
      usedLocation: '派对领地 - 2楼VIP区',
      expiredTime: null,
      refundTime: null,
      refundReason: null,
      userNickname: '小红',
      userId: 'WD001235',
      userAvatar: '/static/images/user-avatar-2.png',
    },
    {
      id: '3',
      ticketName: '静吧小憩',
      purchaseTime: '2024-01-13 18:45',
      status: 'cancelled',
      statusText: '已取消',
      shopLogo: '/static/images/avatar3.png',
      shopName: '夜色酒廊',
      shopAddress: '广州市天河区珠江新城',
      ticketType: '通用票',
      quantity: 1,
      validPeriod: '2024-01-13 至 2024-01-20',
      validityDays: 7,
      expiryDate: '2024-01-20',
      duration: '2小时',
      drinkCount: 2,
      joinTime: '2024-01-13 18:45',
      applyTime: '2024-01-13',
      description: '适合安静聊天的轻奢套餐，包含精品咖啡和精致点心',
      originalPrice: '88.00',
      finalPrice: '88.00',
      discount: null,
      usedTime: null,
      usedLocation: null,
      expiredTime: null,
      refundTime: '2024-01-16 10:30',
      refundReason: '商家审核后主动退款',
      userNickname: '小李',
      userId: 'WD001236',
      userAvatar: '/static/images/user-avatar-3.png',
    },
  ];
  const ticketsWithExpiry = allTickets.map((t: any) => ({
    ...t,
    expiryDate: calculateExpiryDate(t.joinTime, t.validityDays),
  }));
  state.allTickets = ticketsWithExpiry;
  filterTickets();
};

// tabs 切换 + 过滤
const filterTickets = () => {
  let list = state.allTickets.slice();
  if (state.activeTab !== 'all') list = list.filter((t: any) => t.status === state.activeTab);
  state.filteredTickets = list;
  state.showEmptyState = list.length === 0;
  // 更新计数
  state.tabList = state.tabList.map((t: any) => ({
    ...t,
    // count:
    //   t.status === 'all' ? state.allTickets.length : state.allTickets.filter((x: any) => x.status === t.status).length,
  }));
};

// 转赠门票功能
const handleTransferTicket = (ticket: any) => {
  // 检查门票状态，只有未使用的门票才能转赠
  // 显示确认弹窗
  uni.showModal({
    title: '转赠门票',
    content: `确定要将"${ticket.ticketName}"门票转赠给朋友吗？转赠后您将不再拥有该门票使用权。`,
    confirmText: '确认转赠',
    cancelText: '取消',
    success: res => {
      if (res.confirm) {
        // 用户确认转赠，执行分享功能
        shareTicketToFriend(ticket);
        // 调用接口
        // uni.showToast({
        //   title: '转赠成功',
        //   icon: 'success',
        // });
      }
    },
  });
};

// 分享门票给朋友--这种方式还得新建页面
const shareTicketToFriend = (ticket: any) => {
  // 构建分享内容
  const shareContent = {
    title: `【${ticket.shopName}】${ticket.ticketName}`,
    path: `/pages/ticketReceive/ticketReceive?ticketId=${ticket.id}&fromUserId=${ticket.userId}`,
    imageUrl: ticket.qrCode || '', // 如果有二维码图片
    success: () => {
      uni.showToast({
        title: '分享成功',
        icon: 'success',
      });
    },
    fail: (err: any) => {
      console.log('分享失败:', err);
      uni.showToast({
        title: '分享失败，请重试',
        icon: 'none',
      });
    },
  };

  // 使用微信小程序分享功能
  // #ifdef MP-WEIXIN
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession', // 分享到聊天
    type: 0, // 图文消息
    title: shareContent.title,
    summary: `有效期至：${ticket.expiryDate}`,
    imageUrl: shareContent.imageUrl,
    success: shareContent.success,
    fail: shareContent.fail,
  });
  // #endif

  // 其他平台使用通用分享
  // #ifndef MP-WEIXIN
  // uni.showActionSheet({
  //   itemList: ['复制链接', '生成分享图片'],
  //   success: res => {
  //     if (res.tapIndex === 0) {
  //       // 复制链接
  //       copyTicketLink(ticket);
  //     } else if (res.tapIndex === 1) {
  //       // 生成分享图片
  //       generateShareImage(ticket);
  //     }
  //   },
  // });
  // #endif
};

// 复制门票链接
const copyTicketLink = (ticket: any) => {
  const link = `${
    uni.getSystemInfoSync().platform === 'devtools' ? 'https://your-domain.com' : 'https://your-domain.com'
  }/pages/ticketReceive/ticketReceive?ticketId=${ticket.id}&fromUserId=${ticket.userId}`;

  uni.setClipboardData({
    data: link,
    success: () => {
      uni.showToast({
        title: '链接已复制',
        icon: 'success',
      });
    },
    fail: () => {
      uni.showToast({
        title: '复制失败',
        icon: 'none',
      });
    },
  });
};

// 生成分享图片（使用canvas合成）
const generateShareImage = (ticket: any) => {
  // 这里可以实现生成分享图片的逻辑
  // 使用canvas将门票信息和二维码合成一张分享图片
  uni.showToast({
    title: '生成分享图片功能开发中',
    icon: 'none',
  });
};

const init = () => {
  loadTicketData();
};
onLoad(() => {
  init();
});

defineExpose({
  init,
});
</script>

<style scoped lang="scss">
@import '@/uni.scss';
.ticket-holder {
  padding: $up-box-pd;
}

.tabs-wrapper {
  // margin: $up-box-mg 0;
}
.ticket-list {
  // height: calc(100vh - 280rpx);
}
.ticket-item {
  margin-bottom: $up-box-mg;
  padding: $up-box-pd;
  position: relative;
  overflow: hidden;
}
.ticket-header {
  margin-bottom: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ticket-name {
  display: inline-block;
  font-size: 26rpx;
  color: var(--text-2);
  background: var(--bg-2);
  padding: 8rpx 16rpx;
  border-radius: $up-box-radius-1;
}

.ticket-actions {
  width: 100%;
  padding: $up-box-pd;
  box-sizing: border-box;
}

.ticket-details {
  margin-bottom: 16rpx;
}
.detail-row {
  margin-bottom: 10rpx;
  align-items: center;
}
.detail-label {
  font-size: 24rpx;
  color: var(--text-2);
  min-width: 160rpx;
}
.detail-value {
  font-size: 24rpx;
  color: var(--text-1);
  font-weight: 500;
  flex: 1;
  text-align: right;
}
.detail-value.description {
  text-align: left;
  margin-top: 6rpx;
  line-height: 1.6;
  color: var(--text-1);
}
.operation-time {
  margin-bottom: 16rpx;
  border-radius: $up-box-radius-1;
}
.time-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}
.time-label {
  font-size: 22rpx;
  color: var(--text-3);
  min-width: 140rpx;
}
.time-value {
  font-size: 22rpx;
  color: var(--text-1);
  font-weight: 500;
  flex: 1;
  text-align: right;
}
</style>
