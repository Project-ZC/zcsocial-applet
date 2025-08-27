<template>
  <pageWrapper showTabbar>
    <view class="message-container">
      <!-- <up-sticky :offset-top="0" bgColor="#fff" :z-index="999">
        <view class="top-tab">
          <up-subsection :list="topTab" @change="sectionChange"></up-subsection>
        </view>
      </up-sticky> -->
      <view class="message-box">
        <message-notification
          :messages="messages"
          @message-click="handleMessageClick"
          @action-click="handleActionClick"
          @mark-as-read="handleMarkAsRead"
        />
      </view>
    </view>
  </pageWrapper>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import pageWrapper from '@/components/page/index.vue';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import MessageNotification from '@/components/message-notification/message-notification.vue';
import OrderCard from '@/components/order-card/order-card.vue';
import VerticalTabs from '@/components/vertical-tabs/vertical-tabs.vue';
import { ActionType, MessageType } from '@/enums/message';

// 模拟消息数据
const messages = ref([
  {
    id: '1',
    type: MessageType.SYSTEM,
    title: '系统维护通知',
    content: '系统将于今晚22:00-24:00进行维护，期间可能影响正常使用，请提前做好准备。',
    createTime: Date.now() - 30 * 60 * 1000,
    isRead: false,
    tags: ['重要', '维护'],
  },
  {
    id: '2',
    type: MessageType.ORDER,
    title: '订单状态更新',
    content: '您的订单ORD20241201001已完成制作，请及时取餐。',
    createTime: Date.now() - 2 * 60 * 60 * 1000,
    isRead: false,
    tags: ['订单'],
    data: { orderId: 'ORD20241201001' },
  },
  {
    id: '5',
    type: MessageType.REMINDER,
    title: '订单提醒',
    content: '您有3个订单即将超时，请及时处理。',
    createTime: Date.now() - 8 * 60 * 60 * 1000,
    isRead: false,
    tags: ['提醒', '超时'],
  },
]);

const activeTopTabIndex = ref(0);

const topTab = ref([
  {
    name: '消息',
    type: 'message',
  },
  {
    name: '订单',
    type: 'order',
  },
]);

const sectionChange = (index: number) => {
  activeTopTabIndex.value = index;
};

// 消息相关事件处理
const handleMessageClick = (message: any) => {
  console.log('消息点击:', message);
  // 根据消息类型进行不同处理
  switch (message.type) {
    case MessageType.ORDER:
      // 跳转到订单详情
      if (message.data?.orderId) {
        uni.navigateTo({
          url: `/pages/order-detail/order-detail?id=${message.data.orderId}`,
        });
      }
      break;
    case MessageType.ACTIVITY:
      // 跳转到活动页面
      uni.navigateTo({
        url: '/pages/activity/activity',
      });
      break;
    default:
      // 显示消息详情
      uni.showModal({
        title: message.title,
        content: message.content,
        showCancel: false,
      });
  }
};

const handleActionClick = (message: any, action: any) => {
  console.log('操作点击:', message, action);

  switch (action.type) {
    case ActionType.VIEW:
      handleMessageClick(message);
      break;
    case ActionType.CONFIRM:
      uni.showModal({
        title: '确认',
        content: '确定要执行此操作吗？',
        success: res => {
          if (res.confirm) {
            // 执行确认逻辑
            uni.showToast({
              title: '操作成功',
              icon: 'success',
            });
          }
        },
      });
      break;
    case ActionType.CANCEL:
      // 取消操作
      break;
    case ActionType.DELETE:
      uni.showModal({
        title: '删除',
        content: '确定要删除此消息吗？',
        success: res => {
          if (res.confirm) {
            // 删除消息
            const index = messages.value.findIndex(m => m.id === message.id);
            if (index > -1) {
              messages.value.splice(index, 1);
              uni.showToast({
                title: '删除成功',
                icon: 'success',
              });
            }
          }
        },
      });
      break;
  }
};

const handleMarkAsRead = (messageId: string) => {
  console.log('标记已读:', messageId);
  const message = messages.value.find(m => m.id === messageId);
  if (message) {
    message.isRead = true;
  }
};

// 下拉刷新监听
onPullDownRefresh(async () => {
  try {
  } finally {
    uni.stopPullDownRefresh();
  }
});
</script>

<style lang="scss">
.message-container {
  .message-box {
    min-height: calc(100vh - 80rpx);
  }
}
</style>
