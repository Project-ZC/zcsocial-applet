// 消息类型枚举
export enum MessageType {
	SYSTEM = "system", // 系统通知
	ORDER = "order", // 订单通知
	ACTIVITY = "activity", // 活动通知
	PROMOTION = "promotion", // 促销通知
	REMINDER = "reminder", // 提醒通知
}

// 操作类型枚举
export enum ActionType {
	VIEW = "view", // 查看
	CONFIRM = "confirm", // 确认
	CANCEL = "cancel", // 取消
	DELETE = "delete", // 删除
}
