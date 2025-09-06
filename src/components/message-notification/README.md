# MessageNotification 消息通知组件

一个功能完整的消息通知组件，支持多种消息类型、未读状态、操作按钮等功能。

## 功能特性

- 🎨 支持多种消息类型（系统、订单、活动、促销、提醒）
- 📱 响应式设计，适配移动端
- 🔔 未读/已读状态显示
- ⏰ 智能时间格式化
- 🏷️ 消息标签支持
- 🔘 操作按钮支持
- 📭 空状态展示

## 使用方法

### 基础用法

```vue
<template>
  <message-notification
    :messages="messages"
    @message-click="handleMessageClick"
    @action-click="handleActionClick"
    @mark-as-read="handleMarkAsRead"
  />
</template>

<script setup>
import MessageNotification, { MessageType, ActionType } from '@/components/message-notification';

const messages = ref([
  {
    id: '1',
    type: MessageType.SYSTEM,
    title: '系统维护通知',
    content: '系统将于今晚22:00-24:00进行维护，期间可能影响正常使用。',
    createTime: Date.now() - 30 * 60 * 1000,
    isRead: false,
    tags: ['重要', '维护'],
    actions: [{ type: ActionType.VIEW, text: '查看详情' }],
  },
]);

const handleMessageClick = message => {
  console.log('消息点击:', message);
};

const handleActionClick = (message, action) => {
  console.log('操作点击:', message, action);
};

const handleMarkAsRead = messageId => {
  console.log('标记已读:', messageId);
};
</script>
```

## Props

| 参数        | 类型      | 默认值 | 说明             |
| ----------- | --------- | ------ | ---------------- |
| messages    | Message[] | []     | 消息列表         |
| showActions | boolean   | true   | 是否显示操作按钮 |

## Events

| 事件名        | 参数                                                         | 说明             |
| ------------- | ------------------------------------------------------------ | ---------------- |
| message-click | message: Message                                             | 消息点击事件     |
| action-click  | message: Message, action: { type: ActionType, text: string } | 操作按钮点击事件 |
| mark-as-read  | messageId: string                                            | 标记已读事件     |

## 类型定义

### MessageType 枚举

```typescript
enum MessageType {
  SYSTEM = 'system', // 系统通知
  ORDER = 'order', // 订单通知
  ACTIVITY = 'activity', // 活动通知
  PROMOTION = 'promotion', // 促销通知
  REMINDER = 'reminder', // 提醒通知
}
```

### ActionType 枚举

```typescript
enum ActionType {
  VIEW = 'view', // 查看
  CONFIRM = 'confirm', // 确认
  CANCEL = 'cancel', // 取消
  DELETE = 'delete', // 删除
}
```

### Message 接口

```typescript
interface Message {
  id: string; // 消息ID
  type: MessageType; // 消息类型
  title: string; // 消息标题
  content: string; // 消息内容
  createTime: number; // 创建时间戳
  isRead: boolean; // 是否已读
  tags?: string[]; // 消息标签
  actions?: Array<{
    // 操作按钮
    type: ActionType;
    text: string;
  }>;
  data?: any; // 额外数据
}
```

## 样式定制

组件使用 CSS 变量进行样式定制，可以通过以下变量修改样式：

```scss
:root {
  --message-bg-color: #fff;
  --message-border-color: #f0f0f0;
  --message-unread-bg: #f8fbff;
  --message-unread-border: #007aff;
  --message-title-color: var(--text-1);
  --message-content-color: var(--text-2);
  --message-time-color: var(--text-3);
}
```

## 示例

### 不同类型的消息

```vue
<template>
  <message-notification :messages="allMessages" />
</template>

<script setup>
const allMessages = ref([
  // 系统通知
  {
    id: '1',
    type: MessageType.SYSTEM,
    title: '系统维护通知',
    content: '系统将于今晚22:00-24:00进行维护',
    createTime: Date.now() - 30 * 60 * 1000,
    isRead: false,
    tags: ['重要', '维护'],
  },
  // 订单通知
  {
    id: '2',
    type: MessageType.ORDER,
    title: '订单状态更新',
    content: '您的订单ORD20241201001已完成制作',
    createTime: Date.now() - 2 * 60 * 60 * 1000,
    isRead: true,
    actions: [{ type: ActionType.VIEW, text: '查看订单' }],
  },
  // 活动通知
  {
    id: '3',
    type: MessageType.ACTIVITY,
    title: '限时优惠活动',
    content: '全场商品8折优惠，仅限今日',
    createTime: Date.now() - 4 * 60 * 60 * 1000,
    isRead: false,
    tags: ['限时', '优惠'],
    actions: [
      { type: ActionType.CONFIRM, text: '立即参与' },
      { type: ActionType.CANCEL, text: '稍后提醒' },
    ],
  },
]);
</script>
```

### 自定义操作处理

```vue
<script setup>
const handleActionClick = (message, action) => {
  switch (action.type) {
    case ActionType.VIEW:
      // 跳转到详情页
      uni.navigateTo({
        url: `/pages/order-detail/order-detail?id=${message.data?.orderId}`,
      });
      break;
    case ActionType.CONFIRM:
      // 确认操作
      uni.showModal({
        title: '确认',
        content: '确定要执行此操作吗？',
        success: res => {
          if (res.confirm) {
            // 执行确认逻辑
          }
        },
      });
      break;
    case ActionType.CANCEL:
      // 取消操作
      break;
    case ActionType.DELETE:
      // 删除消息
      uni.showModal({
        title: '删除',
        content: '确定要删除此消息吗？',
        success: res => {
          if (res.confirm) {
            // 删除消息逻辑
          }
        },
      });
      break;
  }
};
</script>
```
