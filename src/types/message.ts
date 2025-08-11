// 消息类型枚举
export enum MessageType {
  SYSTEM = 'system',      // 系统通知
  ORDER = 'order',        // 订单通知
  ACTIVITY = 'activity',  // 活动通知
  PROMOTION = 'promotion', // 促销通知
  REMINDER = 'reminder'   // 提醒通知
}

// 操作类型枚举
export enum ActionType {
  VIEW = 'view',      // 查看
  CONFIRM = 'confirm', // 确认
  CANCEL = 'cancel',   // 取消
  DELETE = 'delete'    // 删除
}

// 消息接口
export interface Message {
  id: string
  type: MessageType
  title: string
  content: string
  createTime: number
  isRead: boolean
  tags?: string[]
  actions?: Array<{
    type: ActionType
    text: string
  }>
  data?: any // 额外数据
}

// 消息统计接口
export interface MessageStats {
  total: number
  unread: number
  system: number
  order: number
  activity: number
  promotion: number
  reminder: number
}

// 消息过滤器接口
export interface MessageFilter {
  type?: MessageType | 'all'
  isRead?: boolean
  startTime?: number
  endTime?: number
  keyword?: string
} 