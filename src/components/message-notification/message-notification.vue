<template>
  <view class="message-notification">
    <view class="message-list">
      <view
        v-for="message in messages"
        :key="message.id"
        class="message-item"
        :class="{
          'message-item--unread': !message.isRead,
          'message-item--read': message.isRead,
        }"
        @click="handleMessageClick(message)"
      >
        <!-- 消息图标 -->
        <view class="message-icon">
          <view class="icon-wrapper" :class="`icon-wrapper--${message.type}`">
            <text class="icon-text">{{ getMessageIcon(message.type) }}</text>
          </view>
        </view>

        <!-- 消息内容 -->
        <view class="message-content">
          <view class="message-header">
            <text class="message-title">{{ message.title }}</text>
            <text class="message-time">{{ formatTime(message.createTime) }}</text>
          </view>
          <view class="message-body">
            <text class="message-text">{{ message.content }}</text>
          </view>
          <!-- 消息标签 -->
          <view v-if="message.tags && message.tags.length > 0" class="message-tags">
            <view v-for="tag in message.tags" :key="tag" class="message-tag" :class="`message-tag--${message.type}`">
              <text class="tag-text">{{ tag }}</text>
            </view>
          </view>
        </view>

        <!-- 未读标记 -->
        <view v-if="!message.isRead" class="unread-dot"></view>

        <!-- 操作按钮 -->
        <view v-if="message.actions && message.actions.length > 0" class="message-actions">
          <button
            v-for="action in message.actions"
            :key="action.type"
            class="action-button"
            :class="`action-button--${action.type}`"
            @click.stop="handleActionClick(message, action)"
          >
            <text class="action-text">{{ action.text }}</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="messages.length === 0" class="empty-state">
      <view class="empty-icon">📭</view>
      <text class="empty-text">暂无消息通知</text>
      <text class="empty-subtext">有新消息时会在这里显示</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { Message } from '@/types/message';
import { ActionType, MessageType } from '@/enums/message';

// Props
interface Props {
  messages: Message[];
  showActions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
});

// Emits
const emit = defineEmits<{
  messageClick: [message: Message];
  actionClick: [message: Message, action: { type: ActionType; text: string }];
  markAsRead: [messageId: string];
}>();

// 获取消息图标
const getMessageIcon = (type: MessageType): string => {
  const iconMap = {
    [MessageType.SYSTEM]: '🔔',
    [MessageType.ORDER]: '📦',
    [MessageType.ACTIVITY]: '🎉',
    [MessageType.PROMOTION]: '💰',
    [MessageType.REMINDER]: '⏰',
  };
  return iconMap[type] || '📢';
};

// 格式化时间
const formatTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`;
  } else {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}-${date.getDate()}`;
  }
};

// 处理消息点击
const handleMessageClick = (message: Message) => {
  if (!message.isRead) {
    emit('markAsRead', message.id);
  }
  emit('messageClick', message);
};

// 处理操作点击
const handleActionClick = (message: Message, action: { type: ActionType; text: string }) => {
  emit('actionClick', message, action);
};
</script>

<style lang="scss" scoped>
.message-notification {
  .message-list {
    .message-item {
      display: flex;
      align-items: flex-start;
      padding: 24rpx;
      background-color: #fff;
      border-bottom: 1rpx solid #f0f0f0;
      position: relative;
      transition: all 0.3s ease;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background-color: #f8f8f8;
      }

      &--unread {
        background-color: #f8fbff;
        border-left: 4rpx solid #007aff;
      }

      &--read {
        opacity: 0.8;
      }

      .message-icon {
        margin-right: 20rpx;
        flex-shrink: 0;

        .icon-wrapper {
          width: 80rpx;
          height: 80rpx;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32rpx;

          &--system {
            background-color: #e3f2fd;
            color: #1976d2;
          }

          &--order {
            background-color: #e8f5e8;
            color: #388e3c;
          }

          &--activity {
            background-color: #fff3e0;
            color: #f57c00;
          }

          &--promotion {
            background-color: #fce4ec;
            color: #c2185b;
          }

          &--reminder {
            background-color: #f3e5f5;
            color: #7b1fa2;
          }
        }
      }

      .message-content {
        flex: 1;
        min-width: 0;

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8rpx;

          .message-title {
            font-size: 28rpx;
            font-weight: 500;
            color: var(--text-1);
            flex: 1;
            margin-right: 16rpx;
          }

          .message-time {
            font-size: 24rpx;
            color: var(--text-3);
            flex-shrink: 0;
          }
        }

        .message-body {
          margin-bottom: 12rpx;

          .message-text {
            font-size: 26rpx;
            color: var(--text-2);
            line-height: 1.5;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
          }
        }

        .message-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8rpx;

          .message-tag {
            padding: 4rpx 12rpx;
            border-radius: 12rpx;
            font-size: 20rpx;

            &--system {
              background-color: #e3f2fd;
              color: #1976d2;
            }

            &--order {
              background-color: #e8f5e8;
              color: #388e3c;
            }

            &--activity {
              background-color: #fff3e0;
              color: #f57c00;
            }

            &--promotion {
              background-color: #fce4ec;
              color: #c2185b;
            }

            &--reminder {
              background-color: #f3e5f5;
              color: #7b1fa2;
            }
          }
        }
      }

      .unread-dot {
        position: absolute;
        top: 24rpx;
        right: 24rpx;
        width: 16rpx;
        height: 16rpx;
        background-color: #ff4757;
        border-radius: 50%;
      }

      .message-actions {
        display: flex;
        gap: 12rpx;
        margin-top: 16rpx;

        .action-button {
          padding: 8rpx 16rpx;
          border-radius: 16rpx;
          font-size: 24rpx;
          border: none;
          background: none;

          &--view {
            background-color: #f0f0f0;
            color: var(--text-2);
          }

          &--confirm {
            background-color: #007aff;
            color: #fff;
          }

          &--cancel {
            background-color: #ff4757;
            color: #fff;
          }

          &--delete {
            background-color: #f0f0f0;
            color: var(--text-3);
          }

          &:active {
            opacity: 0.8;
          }
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 40rpx;
    text-align: center;

    .empty-icon {
      font-size: 80rpx;
      margin-bottom: 24rpx;
      opacity: 0.5;
    }

    .empty-text {
      font-size: 28rpx;
      color: var(--text-3);
      margin-bottom: 8rpx;
    }

    .empty-subtext {
      font-size: 24rpx;
      color: #ccc;
    }
  }
}
</style>
