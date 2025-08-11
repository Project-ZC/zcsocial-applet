// 订单状态枚举
export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',    // 待支付
  PAID = 'paid',                          // 已支付
  PENDING_ACCEPT = 'pending_accept',      // 未接单
  PREPARING = 'preparing',                // 制作中
  DELIVERING = 'delivering',              // 配送中
  COMPLETED = 'completed',                // 已完成
  CANCELLED = 'cancelled',                // 已取消
  REFUNDING = 'refunding',               // 退款中
  REFUNDED = 'refunded'                  // 已退款
}

// 操作类型枚举
export enum ActionType {
  PAY = 'pay',                           // 支付
  CANCEL = 'cancel',                     // 取消
  ACCEPT = 'accept',                     // 接取订单
  CONFIRM = 'confirm',                   // 确认收货
  REFUND = 'refund',                     // 申请退款
  RATE = 'rate',                         // 评价
  REORDER = 'reorder'                    // 再次购买
}

// 操作按钮接口
export interface ActionButton {
  type: ActionType;
  text: string;
  disabled?: boolean;
}

// 订单信息接口
export interface OrderInfo {
  orderNumber: string;
  status: OrderStatus;
  productImage: string;
  productName: string;
  productSpec: string;
  price: number;
  quantity: number;
  totalAmount: number;
  createTime: string | number;
  payTime?: string | number;
  deliveryTime?: string | number;
  actions?: ActionButton[];
  // 新增字段
  userNickname?: string;        // 用户昵称
  userPhoneTail?: string;       // 用户手机尾号
  tableNumber?: string;         // 桌子号
}

// 订单列表筛选选项
export interface OrderFilter {
  status?: OrderStatus | 'all';
  startDate?: string | number;
  endDate?: string | number;
  keyword?: string;
}

// 订单统计信息
export interface OrderStats {
  total: number;
  pendingPayment: number;
  paid: number;
  delivering: number;
  completed: number;
  cancelled: number;
} 