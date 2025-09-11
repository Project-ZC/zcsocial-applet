<template>
	<pageWrapper>
		<!-- 状态筛选标签 -->
		<up-sticky>
			<tabs :list="statusTabs" v-model="currentStatus" @change="switchStatus" />
		</up-sticky>

		<!-- 订单类型筛选 -->
		<view class="order-type-section">
			<text>订单类型</text>
			<view class="order-type-tags">
				<up-tag
					v-for="type in orderTypeTabs"
					:key="type.type"
					:text="type.text"
					:type="currentOrderType === type.type ? 'primary' : 'info'"
					:plain="currentOrderType !== type.type"
					:size="'medium'"
					:shape="'circle'"
					@click="switchOrderType(type.type)"
				/>
			</view>
		</view>
		<view class="orders-page">
			<!-- 订单列表 -->
			<view class="orders-list">
				<epmtyData
					v-if="filteredOrders.length === 0"
					:text="getEmptyText()"
				></epmtyData>

				<order-card
					v-for="order in filteredOrders"
					:key="order.orderNumber"
					:order-info="order"
					@order-click="handleOrderClick"
					@action-click="handleActionClick"
				/>
			</view>
		</view>
	</pageWrapper>
</template>

<script lang="ts" setup>
import OrderCard from "@/components/order-card/order-card.vue";
import tabs from "@/components/tabs/index.vue";
import { ActionType, OrderStatus } from "@/enums/order";
import { computed, ref } from "vue";

// 当前选中的状态
const currentStatus = ref<OrderStatus | "all">("all");

// 当前选中的订单类型
const currentOrderType = ref<"all" | "ticket" | "order">("all");

// 订单类型筛选标签
const orderTypeTabs = ref([
	{ type: "all" as const, text: "全部" },
	{ type: "ticket" as const, text: "门票" },
	{ type: "order" as const, text: "点单" },
]);

// 状态筛选标签
const statusTabs = ref([
	{ status: "all" as const, title: "全部订单" },
	{ status: OrderStatus.PREPARING, title: "正在进行" },
	{ status: OrderStatus.COMPLETED, title: "已完成" },
	// { status: OrderStatus.PENDING_PAYMENT, text: '待支付' },
	// { status: OrderStatus.PAID, text: '已支付' },
	// { status: OrderStatus.PENDING_ACCEPT, text: '未接单' },
	// { status: OrderStatus.PREPARING, text: '制作中' },
	// { status: OrderStatus.DELIVERING, text: '配送中' },
]);

// 模拟订单数据
const orders = ref([
	{
		orderNumber: "ORD20241201001",
		orderType: "order",
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
		orderType: "ticket",
		status: OrderStatus.PENDING_ACCEPT,
		productImage: "/static/images/logo.png",
		productName: "VIP门票",
		productSpec: "单人票 / 有效期7天",
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
		orderType: "order",
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
		orderType: "order",
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
		orderType: "ticket",
		status: OrderStatus.DELIVERING,
		productImage: "/static/images/logo.png",
		productName: "团体门票",
		productSpec: "5人票 / 有效期3天",
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
		orderType: "order",
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
		orderType: "ticket",
		status: OrderStatus.COMPLETED,
		productImage: "/static/images/logo.png",
		productName: "年卡门票",
		productSpec: "单人年卡 / 有效期365天",
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

// 根据订单类型和状态筛选订单
const filteredOrders = computed(() => {
	let filtered = orders.value;

	// 先按订单类型筛选
	if (currentOrderType.value !== "all") {
		filtered = filtered.filter(
			(order) => order.orderType === currentOrderType.value
		);
	}

	// 再按状态筛选
	if (currentStatus.value !== "all") {
		filtered = filtered.filter((order) => order.status === currentStatus.value);
	}

	return filtered;
});

// 切换订单类型
const switchOrderType = (type: "all" | "ticket" | "order") => {
	currentOrderType.value = type;
	// 切换类型时重置状态筛选
	currentStatus.value = "all";
};

// 切换状态
const switchStatus = (tab) => {
	currentStatus.value = tab.status;
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

// 获取订单类型文本
const getOrderTypeText = (type: "all" | "ticket" | "order") => {
	const typeMap = {
		all: "全部",
		ticket: "门票",
		order: "点单",
	};
	return typeMap[type] || "";
};

// 获取空状态文本
const getEmptyText = () => {
	const typeText = getOrderTypeText(currentOrderType.value);
	const statusText = getStatusText(currentStatus.value);

	if (currentOrderType.value === "all" && currentStatus.value === "all") {
		return "暂无订单";
	} else if (currentOrderType.value === "all") {
		return `暂无${statusText}订单`;
	} else if (currentStatus.value === "all") {
		return `暂无${typeText}订单`;
	} else {
		return `暂无${typeText}${statusText}订单`;
	}
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
</script>

<style lang="scss" scoped>
@import "@/uni.scss";
// 订单类型筛选样式
.order-type-section {
	display: flex;
	align-items: center;
	justify-content: flex-start;
	padding: $up-box-pd;
	background-color: var(--bg-1);

	.order-type-tags {
		display: flex;
		gap: 20rpx;
		justify-content: center;
		margin-left: 20rpx;
	}
}
.orders-page {
	padding: $up-box-pd;

	// 订单列表
	.orders-list {
	}
}
</style>
