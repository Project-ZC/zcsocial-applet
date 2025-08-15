// 消息接口
export interface Message {
	id: string;
	type: MessageType;
	title: string;
	content: string;
	createTime: number;
	isRead: boolean;
	tags?: string[];
	actions?: Array<{
		type: ActionType;
		text: string;
	}>;
	data?: any; // 额外数据
}

// 消息统计接口
export interface MessageStats {
	total: number;
	unread: number;
	system: number;
	order: number;
	activity: number;
	promotion: number;
	reminder: number;
}

// 消息过滤器接口
export interface MessageFilter {
	type?: MessageType | "all";
	isRead?: boolean;
	startTime?: number;
	endTime?: number;
	keyword?: string;
}
