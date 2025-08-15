<template>
	<view class="orders-page" :class="{ 'dark-theme': isDarkMode }">
		<!-- 状态筛选标签 -->
		<view class="status-tabs">
			<view
				v-for="tab in statusTabs"
				:key="tab.status"
				class="tab-item"
				:class="{ active: currentStatus === tab.status }"
				@tap="switchStatus(tab.status)"
			>
				{{ tab.text }}
			</view>
		</view>

		<!-- 订单列表 -->
		<view class="orders-list">
			<view v-if="filteredOrders.length === 0" class="empty-state">
				<view class="empty-icon">📋</view>
				<view class="empty-text"
					>暂无{{ getStatusText(currentStatus) }}订单</view
				>
			</view>

			<order-card
				v-for="order in filteredOrders"
				:key="order.orderNumber"
				:order-info="order"
				@order-click="handleOrderClick"
				@action-click="handleActionClick"
			/>
		</view>
	</view>
</template>

<script lang="ts" setup>
import OrderCard from "@/components/order-card/order-card.vue";
import { useThemeStore } from "@/stores/modules/theme";
import { ActionType, OrderStatus } from "@/enums/order";
import { computed, ref } from "vue";

const themeStore = useThemeStore();
const isDarkMode = computed(() => themeStore.isDarkMode);

// 当前选中的状态
const currentStatus = ref<OrderStatus | "all">("all");

// 状态筛选标签
const statusTabs = ref([
	{ status: "all" as const, text: "全部" },
	{ status: OrderStatus.PENDING_PAYMENT, text: "待支付" },
	{ status: OrderStatus.PAID, text: "已支付" },
	{ status: OrderStatus.PENDING_ACCEPT, text: "未接单" },
	{ status: OrderStatus.PREPARING, text: "制作中" },
	{ status: OrderStatus.DELIVERING, text: "配送中" },
	{ status: OrderStatus.COMPLETED, text: "已完成" },
]);

// 模拟订单数据
const orders = ref([
	{
		orderNumber: "ORD20241201001",
		status: OrderStatus.PENDING_PAYMENT,
		productImage: "/static/images/logo.png",
		productName: "经典拿铁咖啡",
		productSpec: "大杯 / 热饮 / 加糖",
		price: 28.0,
		quantity: 1,
		totalAmount: 28.0,
		createTime: new Date().getTime() - 30 * 60 * 1000,
		actions: [
			{ type: ActionType.PAY, text: "立即支付" },
			{ type: ActionType.CANCEL, text: "取消订单" },
		],
	},
	{
		orderNumber: "ORD20241201004",
		status: OrderStatus.PENDING_ACCEPT,
		productImage: "/static/images/logo.png",
		productName: "焦糖玛奇朵",
		productSpec: "中杯 / 冰饮 / 加糖",
		price: 35.0,
		quantity: 1,
		totalAmount: 35.0,
		createTime: new Date().getTime() - 15 * 60 * 1000,
		payTime: new Date().getTime() - 10 * 60 * 1000,
		actions: [
			{ type: ActionType.ACCEPT, text: "接取订单" },
			{ type: ActionType.CANCEL, text: "取消订单" },
		],
	},
	{
		orderNumber: "ORD20241201005",
		status: OrderStatus.PREPARING,
		productImage: "/static/images/logo.png",
		productName: "摩卡咖啡",
		productSpec: "大杯 / 热饮 / 加糖",
		price: 32.0,
		quantity: 2,
		totalAmount: 64.0,
		createTime: new Date().getTime() - 45 * 60 * 1000,
		payTime: new Date().getTime() - 40 * 60 * 1000,
		actions: [{ type: ActionType.CANCEL, text: "取消订单" }],
	},
	{
		orderNumber: "ORD20241201002",
		status: OrderStatus.PAID,
		productImage: "/static/images/logo.png",
		productName: "美式咖啡",
		productSpec: "中杯 / 冰饮 / 无糖",
		price: 22.0,
		quantity: 1,
		totalAmount: 22.0,
		createTime: new Date().getTime() - 2 * 60 * 60 * 1000,
		payTime: new Date().getTime() - 1.5 * 60 * 60 * 1000,
		actions: [{ type: ActionType.CANCEL, text: "取消订单" }],
	},
	{
		orderNumber: "ORD20241201003",
		status: OrderStatus.DELIVERING,
		productImage: "/static/images/logo.png",
		productName: "卡布奇诺 + 提拉米苏",
		productSpec: "大杯 / 热饮 / 半糖 + 标准份",
		price: 45.0,
		quantity: 1,
		totalAmount: 45.0,
		createTime: new Date().getTime() - 3 * 60 * 60 * 1000,
		payTime: new Date().getTime() - 2.5 * 60 * 60 * 1000,
		deliveryTime: new Date().getTime() - 30 * 60 * 1000,
		actions: [{ type: ActionType.CONFIRM, text: "确认收货" }],
	},
	{
		orderNumber: "ORD20241130001",
		status: OrderStatus.COMPLETED,
		productImage: "/static/images/logo.png",
		productName: "摩卡咖啡",
		productSpec: "大杯 / 热饮 / 加糖",
		price: 32.0,
		quantity: 2,
		totalAmount: 64.0,
		createTime: new Date().getTime() - 24 * 60 * 60 * 1000,
		payTime: new Date().getTime() - 23.5 * 60 * 60 * 1000,
		deliveryTime: new Date().getTime() - 22 * 60 * 60 * 1000,
		actions: [
			{ type: ActionType.RATE, text: "评价" },
			{ type: ActionType.REORDER, text: "再次购买" },
		],
	},
	{
		orderNumber: "ORD20241129001",
		status: OrderStatus.COMPLETED,
		productImage: "/static/images/logo.png",
		productName: "焦糖玛奇朵",
		productSpec: "中杯 / 冰饮 / 加糖",
		price: 35.0,
		quantity: 1,
		totalAmount: 35.0,
		createTime: new Date().getTime() - 48 * 60 * 60 * 1000,
		payTime: new Date().getTime() - 47.5 * 60 * 60 * 1000,
		deliveryTime: new Date().getTime() - 46 * 60 * 60 * 1000,
		actions: [
			{ type: ActionType.RATE, text: "评价" },
			{ type: ActionType.REORDER, text: "再次购买" },
		],
	},
]);

// 根据状态筛选订单
const filteredOrders = computed(() => {
	if (currentStatus.value === "all") {
		return orders.value;
	}
	return orders.value.filter((order) => order.status === currentStatus.value);
});

// 切换状态
const switchStatus = (status: OrderStatus | "all") => {
	currentStatus.value = status;
};

// 获取状态文本
const getStatusText = (status: OrderStatus | "all") => {
	if (status === "all") return "";
	const statusMap = {
		[OrderStatus.PENDING_PAYMENT]: "待支付",
		[OrderStatus.PAID]: "已支付",
		[OrderStatus.PENDING_ACCEPT]: "未接单",
		[OrderStatus.PREPARING]: "制作中",
		[OrderStatus.DELIVERING]: "配送中",
		[OrderStatus.COMPLETED]: "已完成",
		[OrderStatus.CANCELLED]: "已取消",
		[OrderStatus.REFUNDING]: "退款中",
		[OrderStatus.REFUNDED]: "已退款",
	};
	return statusMap[status] || "";
};

// 处理订单点击
const handleOrderClick = (orderInfo: any) => {
	uni.showToast({
		title: `查看订单详情：${orderInfo.orderNumber}`,
		icon: "none",
	});
};

// 处理操作按钮点击
const handleActionClick = (action: any, orderInfo: any) => {
	uni.showToast({
		title: `执行操作：${action.text}`,
		icon: "none",
	});

	// 根据操作类型执行相应逻辑
	switch (action.type) {
		case ActionType.PAY:
			handlePay(orderInfo);
			break;
		case ActionType.CANCEL:
			handleCancel(orderInfo);
			break;
		case ActionType.ACCEPT:
			handleAccept(orderInfo);
			break;
		case ActionType.CONFIRM:
			handleConfirm(orderInfo);
			break;
		case ActionType.RATE:
			handleRate(orderInfo);
			break;
		case ActionType.REORDER:
			handleReorder(orderInfo);
			break;
	}
};

// 处理支付
const handlePay = (orderInfo: any) => {
	uni.showModal({
		title: "确认支付",
		content: `确认支付订单 ${orderInfo.orderNumber} 吗？`,
		success: (res) => {
			if (res.confirm) {
				// 模拟支付成功
				const order = orders.value.find(
					(o) => o.orderNumber === orderInfo.orderNumber
				);
				if (order) {
					order.status = OrderStatus.PAID;
					order.payTime = new Date().getTime();
					order.actions = [{ type: ActionType.CANCEL, text: "取消订单" }];
				}
				uni.showToast({
					title: "支付成功",
					icon: "success",
				});
			}
		},
	});
};

// 处理取消订单
const handleCancel = (orderInfo: any) => {
	uni.showModal({
		title: "确认取消",
		content: `确认取消订单 ${orderInfo.orderNumber} 吗？`,
		success: (res) => {
			if (res.confirm) {
				const order = orders.value.find(
					(o) => o.orderNumber === orderInfo.orderNumber
				);
				if (order) {
					order.status = OrderStatus.CANCELLED;
					order.actions = [];
				}
				uni.showToast({
					title: "订单已取消",
					icon: "success",
				});
			}
		},
	});
};

// 处理接取订单
const handleAccept = (orderInfo: any) => {
	uni.showModal({
		title: "确认接单",
		content: `确认接取订单 ${orderInfo.orderNumber} 吗？`,
		success: (res) => {
			if (res.confirm) {
				const order = orders.value.find(
					(o) => o.orderNumber === orderInfo.orderNumber
				);
				if (order) {
					order.status = OrderStatus.PREPARING;
					order.actions = [{ type: ActionType.CANCEL, text: "取消订单" }];
				}
				uni.showToast({
					title: "订单已接取",
					icon: "success",
				});
			}
		},
	});
};

// 处理确认收货
const handleConfirm = (orderInfo: any) => {
	uni.showModal({
		title: "确认收货",
		content: `确认已收到订单 ${orderInfo.orderNumber} 的商品吗？`,
		success: (res) => {
			if (res.confirm) {
				const order = orders.value.find(
					(o) => o.orderNumber === orderInfo.orderNumber
				);
				if (order) {
					order.status = OrderStatus.COMPLETED;
					order.actions = [
						{ type: ActionType.RATE, text: "评价" },
						{ type: ActionType.REORDER, text: "再次购买" },
					];
				}
				uni.showToast({
					title: "确认收货成功",
					icon: "success",
				});
			}
		},
	});
};

// 处理评价
const handleRate = (orderInfo: any) => {
	uni.showToast({
		title: "跳转到评价页面",
		icon: "none",
	});
};

// 处理再次购买
const handleReorder = (orderInfo: any) => {
	uni.showToast({
		title: "跳转到商品页面",
		icon: "none",
	});
};

defineOptions({
	styleIsolation: "shared",
});
</script>

<style lang="scss" scoped>
.orders-page {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding-bottom: 40rpx;

	&.dark-theme {
		background-color: #1a1a1a;
		color: #e0e0e0;

		.status-tabs {
			background-color: #2c2c2c;

			.tab-item {
				color: #e0e0e0;

				&.active {
					background-color: #1890ff;
					color: #fff;
				}
			}
		}

		.empty-state {
			.empty-text {
				color: #e0e0e0;
			}
		}
	}

	// 状态筛选标签
	.status-tabs {
		display: flex;
		background-color: #fff;
		padding: 20rpx;
		margin-bottom: 20rpx;
		border-radius: 0 0 16rpx 16rpx;

		.tab-item {
			flex: 1;
			text-align: center;
			padding: 16rpx 0;
			font-size: 28rpx;
			color: #666;
			border-radius: 20rpx;
			transition: all 0.3s ease;

			&.active {
				background-color: #1890ff;
				color: #fff;
			}

			&:active {
				transform: scale(0.95);
			}
		}
	}

	// 订单列表
	.orders-list {
		padding: 0 20rpx;

		.empty-state {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 100rpx 0;

			.empty-icon {
				font-size: 80rpx;
				margin-bottom: 20rpx;
				opacity: 0.5;
			}

			.empty-text {
				font-size: 28rpx;
				color: #999;
			}
		}
	}
}
</style>
