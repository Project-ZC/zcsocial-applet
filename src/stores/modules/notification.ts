import type {
  Notification,
  UserRole
} from '@/types/notification';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([]);
  const currentUserRole = ref<UserRole>(UserRole.CUSTOMER);

  // 获取未读通知数量
  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.isRead && n.visibleTo.includes(currentUserRole.value)).length
  );

  // 获取当前用户可见的通知
  const visibleNotifications = computed(() => 
    notifications.value.filter(n => n.visibleTo.includes(currentUserRole.value))
  );

  // 添加通知
  function addNotification(notification: Notification) {
    notifications.value.unshift(notification);
  }

  // 标记通知为已读
  function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
    }
  }

  // 标记所有通知为已读
  function markAllAsRead() {
    notifications.value.forEach(n => {
      if (n.visibleTo.includes(currentUserRole.value)) {
        n.isRead = true;
      }
    });
  }

  // 删除通知
  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  }

  // 设置用户角色
  function setUserRole(role: UserRole) {
    currentUserRole.value = role;
  }

  return {
    notifications,
    currentUserRole,
    unreadCount,
    visibleNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    setUserRole
  };
});