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
	userNickname?: string; // 用户昵称
	userPhoneTail?: string; // 用户手机尾号
	tableNumber?: string; // 桌子号
}

// 订单列表筛选选项
export interface OrderFilter {
	status?: OrderStatus | "all";
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
