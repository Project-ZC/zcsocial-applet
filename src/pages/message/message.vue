<template>
	<view class="message-container">
		<template v-if="role">
			<up-sticky bgColor="#fff">
				<up-subsection :list="topTab" @change="sectionChange"></up-subsection>
			</up-sticky>
			<view class="message-box" v-show="activeTopTabIndex === 0">
				<message-notification
					:messages="messages"
					@message-click="handleMessageClick"
					@action-click="handleActionClick"
					@mark-as-read="handleMarkAsRead"
				/>
			</view>
			<view class="message-box" v-show="activeTopTabIndex === 1">
				<vertical-tabs
					v-model="activeTab"
					:tabs="tabs"
					:active-color="activeColor"
					:inactive-color="inactiveColor"
					:indicator-color="indicatorColor"
					height="calc(100vh - 80rpx)"
					@change="handleTabChange"
					@click="handleTabClick"
				>
					<template #content>
						<order-card
							v-for="order in filteredOrders"
							:key="order.orderNumber"
							:order-info="order"
							@order-click="handleOrderClick"
							@action-click="handleOrderActionClick"
						/>
					</template>
				</vertical-tabs>
			</view>
		</template>
		<template v-else>
			<view class="message-box">
				<message-notification
					:messages="messages"
					@message-click="handleMessageClick"
					@action-click="handleActionClick"
					@mark-as-read="handleMarkAsRead"
				/>
			</view>
		</template>
	</view>
</template>

<script lang="ts" setup>
import MessageNotification from "@/components/message-notification/message-notification.vue";
import OrderCard from "@/components/order-card/order-card.vue";
import VerticalTabs from "@/components/vertical-tabs/vertical-tabs.vue";
import { ActionType, MessageType } from "@/enums/message";
import { ActionType as OrderActionType, OrderStatus } from "@/enums/order";
import { computed, ref } from "vue";

// 当前选中的状态
const currentStatus = ref<OrderStatus | "all">("all");
const role = ref(true);
// 模拟订单数据
const orders = ref([
	{
		orderNumber: "ORD20241201001",
		status: OrderStatus.PENDING_ACCEPT,
		productImage: "/static/images/logo.png",
		productName: "diy酒品",
		productSpec: "大杯 / 加冰球 / 加柠檬 / 加薄荷 / 50°酒精",
		price: 28.0,
		quantity: 1,
		totalAmount: 28.0,
		createTime: new Date().getTime() - 30 * 60 * 1000,
		userNickname: "张三",
		userPhoneTail: "8888",
		tableNumber: "A12",
		actions: [
			{ type: OrderActionType.PAY, text: "接受订单" },
			{ type: OrderActionType.CANCEL, text: "取消订单" },
		],
	},
	{
		orderNumber: "ORD20241201002",
		status: OrderStatus.PENDING_ACCEPT,
		productImage: "/static/images/logo.png",
		productName: "鸡尾酒",
		productSpec: "中杯",
		price: 22.0,
		quantity: 1,
		totalAmount: 22.0,
		createTime: new Date().getTime() - 2 * 60 * 60 * 1000,
		userNickname: "李四",
		userPhoneTail: "6666",
		tableNumber: "B08",
		actions: [
			{ type: OrderActionType.PAY, text: "接受订单" },
			{ type: OrderActionType.CANCEL, text: "取消订单" },
		],
	},
	{
		orderNumber: "ORD20241201003",
		status: OrderStatus.PREPARING,
		productImage: "/static/images/logo.png",
		productName: "鸡尾酒",
		productSpec: "大杯",
		price: 45.0,
		quantity: 1,
		totalAmount: 45.0,
		createTime: new Date().getTime() - 3 * 60 * 60 * 1000,
		userNickname: "王五",
		userPhoneTail: "9999",
		tableNumber: "C15",
		actions: [{ type: OrderActionType.CONFIRM, text: "完成制作" }],
	},
]);

// 模拟消息数据
const messages = ref([
	{
		id: "1",
		type: MessageType.SYSTEM,
		title: "系统维护通知",
		content:
			"系统将于今晚22:00-24:00进行维护，期间可能影响正常使用，请提前做好准备。",
		createTime: Date.now() - 30 * 60 * 1000,
		isRead: false,
		tags: ["重要", "维护"],
	},
	{
		id: "2",
		type: MessageType.ORDER,
		title: "订单状态更新",
		content: "您的订单ORD20241201001已完成制作，请及时取餐。",
		createTime: Date.now() - 2 * 60 * 60 * 1000,
		isRead: false,
		tags: ["订单"],
		data: { orderId: "ORD20241201001" },
	},
	{
		id: "5",
		type: MessageType.REMINDER,
		title: "订单提醒",
		content: "您有3个订单即将超时，请及时处理。",
		createTime: Date.now() - 8 * 60 * 60 * 1000,
		isRead: false,
		tags: ["提醒", "超时"],
	},
]);

// 当前激活的标签
const activeTab = ref(0);

const activeTopTabIndex = ref(0);

// 颜色配置
const activeColor = ref("#007aff");
const inactiveColor = ref("#666666");
const indicatorColor = ref("#007aff");

// 标签数据
const tabs = ref([
	{
		title: "全部",
		badge: "3",
		type: "all",
	},
	{
		title: "鸡尾酒",
		badge: "3",
		type: "cocktail",
	},
	{
		title: "伏特加",
		type: "vodka",
	},
	{
		title: "啤酒",
		type: "beer",
	},
	{
		title: "葡萄酒",
		type: "wine",
	},
]);

// 根据状态筛选订单
const filteredOrders = computed(() => {
	if (currentStatus.value === "all") {
		return orders.value;
	}
	return orders.value.filter((order) => order.status === currentStatus.value);
});

const topTab = ref([
	{
		name: "消息",
		type: "message",
	},
	{
		name: "订单",
		type: "order",
	},
]);

// 处理标签变化
const handleTabChange = (data: { index: number; tab: any }) => {
	console.log("标签变化:", data);
};

// 处理标签点击
const handleTabClick = (data: { index: number; tab: any }) => {
	console.log("标签点击:", data);
};

const sectionChange = (index: number) => {
	activeTopTabIndex.value = index;
};

// 消息相关事件处理
const handleMessageClick = (message: any) => {
	console.log("消息点击:", message);
	// 根据消息类型进行不同处理
	switch (message.type) {
		case MessageType.ORDER:
			// 跳转到订单详情
			if (message.data?.orderId) {
				uni.navigateTo({
					url: `/pages/order-detail/order-detail?id=${message.data.orderId}`,
				});
			}
			break;
		case MessageType.ACTIVITY:
			// 跳转到活动页面
			uni.navigateTo({
				url: "/pages/activity/activity",
			});
			break;
		default:
			// 显示消息详情
			uni.showModal({
				title: message.title,
				content: message.content,
				showCancel: false,
			});
	}
};

const handleActionClick = (message: any, action: any) => {
	console.log("操作点击:", message, action);

	switch (action.type) {
		case ActionType.VIEW:
			handleMessageClick(message);
			break;
		case ActionType.CONFIRM:
			uni.showModal({
				title: "确认",
				content: "确定要执行此操作吗？",
				success: (res) => {
					if (res.confirm) {
						// 执行确认逻辑
						uni.showToast({
							title: "操作成功",
							icon: "success",
						});
					}
				},
			});
			break;
		case ActionType.CANCEL:
			// 取消操作
			break;
		case ActionType.DELETE:
			uni.showModal({
				title: "删除",
				content: "确定要删除此消息吗？",
				success: (res) => {
					if (res.confirm) {
						// 删除消息
						const index = messages.value.findIndex((m) => m.id === message.id);
						if (index > -1) {
							messages.value.splice(index, 1);
							uni.showToast({
								title: "删除成功",
								icon: "success",
							});
						}
					}
				},
			});
			break;
	}
};

const handleMarkAsRead = (messageId: string) => {
	console.log("标记已读:", messageId);
	const message = messages.value.find((m) => m.id === messageId);
	if (message) {
		message.isRead = true;
	}
};

// 订单相关事件处理
const handleOrderClick = (order: any) => {
	console.log("订单点击:", order);
	uni.navigateTo({
		url: `/pages/order-detail/order-detail?id=${order.orderNumber}`,
	});
};

const handleOrderActionClick = (order: any, action: any) => {
	console.log("订单操作点击:", order, action);
	// 这里可以处理订单相关的操作
};
</script>

<style lang="scss">
.message-container {
	.message-box {
		min-height: calc(100vh - 80rpx);
	}
}
</style>
