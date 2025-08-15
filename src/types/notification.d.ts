// 通知类型枚举
export enum NotificationType {
  ORDER = 'ORDER',           // 订单相关
  STAFF = 'STAFF',          // 员工管理
  REGISTRATION = 'REGISTRATION', // 报名审核
  SYSTEM = 'SYSTEM'         // 系统消息
}

// 订单状态枚举
export enum OrderStatus {
  PENDING = 'PENDING',           // 已下单
  ACCEPTED = 'ACCEPTED',         // 已接单
  COMPLETED = 'COMPLETED',       // 已完成
  CANCELLED = 'CANCELLED'        // 已取消
}

// 员工状态枚举
export enum StaffStatus {
  APPLYING = 'APPLYING',         // 申请加入
  LEAVING = 'LEAVING',          // 离开
  PERMISSION_REQUEST = 'PERMISSION_REQUEST' // 权限申请
}

// 报名状态枚举
export enum RegistrationStatus {
  APPLIED = 'APPLIED',           // 报名参加
  CANCELLED = 'CANCELLED',       // 取消报名
  APPROVED = 'APPROVED',         // 审核通过
  REJECTED = 'REJECTED'          // 审核不通过
}

// 用户角色枚举
export enum UserRole {
  CUSTOMER = 'CUSTOMER',         // 顾客
  STAFF = 'STAFF',              // 员工
  ADMIN = 'ADMIN'               // 管理员
}

// 通知基础接口
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
  visibleTo: UserRole[];
}

// 订单通知
export interface OrderNotification extends Notification {
  type: NotificationType.ORDER;
  orderId: string;
  status: OrderStatus;
  tableNumber?: string;
  phoneLastFour?: string;
}

// 员工通知
export interface StaffNotification extends Notification {
  type: NotificationType.STAFF;
  staffId: string;
  status: StaffStatus;
}

// 报名通知
export interface RegistrationNotification extends Notification {
  type: NotificationType.REGISTRATION;
  registrationId: string;
  status: RegistrationStatus;
  phoneLastFour: string;
}

// 系统通知
export interface SystemNotification extends Notification {
  type: NotificationType.SYSTEM;
} 