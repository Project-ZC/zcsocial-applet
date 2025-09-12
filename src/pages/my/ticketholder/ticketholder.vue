<template>
	<pageWrapper>
		<view class="ticket-holder">
			<!-- 顶部 Tabs -->
			<view class="tabs-wrapper z-glass-card">
				<Tabs
					:list="state.tabList"
					v-model="state.activeTab"
					@change="onTabChange"
				/>
			</view>

			<!-- 门票列表 -->
			<scroll-view scroll-y class="ticket-list">
				<view
					v-for="item in state.filteredTickets"
					:key="item.id"
					class="ticket-item z-glass-card"
				>
					<!-- 头部 -->
					<view class="ticket-header flex-row space-between">
						<view class="ticket-info">
							<text class="ticket-name"
								>{{ item.ticketName }} - {{ item.ticketType }}</text
							>
						</view>
						<up-tag
							size="mini"
							shape="circle"
							type="success"
							:class="item.status"
							>{{ item.statusText }}</up-tag
						>
					</view>

					<!-- 用户信息 -->
					<!-- <view class="user-info">
						<view class="user-avatar">
							<up-image
								:src="item.userAvatar"
								width="100rpx"
								height="100rpx"
								radius="40rpx"
							/>
						</view>
						<view class="user-details">
							<text class="user-nickname">{{ item.userNickname }}</text>
							<text class="user-id">玩点ID: {{ item.userId }}</text>
						</view>
					</view> -->

					<!-- 门票详情 -->
					<view class="ticket-details">
						<view class="detail-row flex-row space-between">
							<text class="detail-label">酒吧名称：</text>
							<text class="detail-value">{{ item.shopName }}</text>
						</view>
						<view class="detail-row flex-row space-between">
							<text class="detail-label">报名时间：</text>
							<text class="detail-value">{{ item.applyTime }}</text>
						</view>
						<view class="detail-row flex-row space-between">
							<text class="detail-label">包含酒水：</text>
							<text class="detail-value">{{ item.drinkCount }}杯</text>
						</view>
						<view class="detail-row flex-row space-between">
							<text class="detail-label">使用时长：</text>
							<text class="detail-value">{{ item.duration }}</text>
						</view>
						<view class="detail-row" v-if="item.description">
							<text class="detail-label">门票描述：</text>
							<text class="detail-value description">{{
								item.description
							}}</text>
						</view>
					</view>

					<!-- 操作时间显示 -->
					<view
						class="operation-time"
						v-if="item.status === 'verified' || item.status === 'cancelled'"
					>
						<view
							class="time-row"
							v-if="item.status === 'verified' && item.usedTime"
						>
							<text class="time-label">校核时间：</text>
							<text class="time-value">{{ item.usedTime }}</text>
						</view>
						<view
							class="time-row"
							v-if="item.status === 'cancelled' && item.refundTime"
						>
							<text class="time-label">退款时间：</text>
							<text class="time-value">{{ item.refundTime }}</text>
						</view>
					</view>
				</view>

				<!-- 空状态 -->
				<emptyData
					height="60vh"
					class="empty-state"
					text="暂无门票"
					subtext="该店铺还没有用户购买门票"
					v-if="state.showEmptyState"
				>
				</emptyData>
			</scroll-view>
		</view>
	</pageWrapper>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { reactive, computed } from "vue";
import Tabs from "@/components/tabs/index.vue";

const state = reactive({
	activeTab: "all",
	showEmptyState: false,

	// 门票数据
	allTickets: [] as any[],
	filteredTickets: [] as any[],

	// 顶部 tabs 配置
	tabList: [
		{ title: "全部", status: "all", count: 0 },
		{ title: "已校核", status: "verified", count: 0 },
		{ title: "已取消", status: "cancelled", count: 0 },
	],

	// 生成门票相关
	searchUserId: "",
	searchedUser: null as any,
	selectedUser: null as any,
	selectedTicketType: "",
	shopTicketSettings: [] as any[],
});

const onTabChange = () => filterTickets();

// 计算有效期至（复制小程序逻辑）
const calculateExpiryDate = (
	joinTime: string,
	validityDays: number | string
) => {
	const joinDate = new Date(joinTime);
	const days =
		typeof validityDays === "string"
			? parseInt(validityDays, 10)
			: validityDays || 0;
	const expiryDate = new Date(joinDate.getTime() + days * 24 * 60 * 60 * 1000);
	const y = expiryDate.getFullYear();
	const m = String(expiryDate.getMonth() + 1).padStart(2, "0");
	const d = String(expiryDate.getDate()).padStart(2, "0");
	const hh = String(joinDate.getHours()).padStart(2, "0");
	const mm = String(joinDate.getMinutes()).padStart(2, "0");
	return `${y}-${m}-${d} ${hh}:${mm}`;
};

// 加载门票数据（使用原模拟数据）
const loadTicketData = () => {
	const allTickets = [
		{
			id: "1",
			ticketName: "微醺套餐",
			purchaseTime: "2024-01-15 19:30",
			status: "verified",
			statusText: "已校核",
			shopLogo: "/static/images/avatar1.png",
			shopName: "醉美酒吧",
			shopAddress: "北京市朝阳区三里屯街道",
			ticketType: "男性票",
			quantity: 2,
			validPeriod: "2024-01-15 至 2024-01-22",
			validityDays: 7,
			expiryDate: "2024-01-22",
			duration: "3小时",
			drinkCount: 6,
			joinTime: "2024-01-15 19:30",
			applyTime: "2024-01-15",
			description: "包含精选鸡尾酒3杯，小食拼盘1份，享受专业调酒师现场调制",
			originalPrice: "200.00",
			finalPrice: "176.00",
			discount: "8.8",
			usedTime: null,
			usedLocation: null,
			expiredTime: null,
			refundTime: null,
			refundReason: null,
			userNickname: "小明",
			userId: "WD001234",
			userAvatar: "/static/images/user-avatar-1.png",
		},
		{
			id: "2",
			ticketName: "派对狂欢",
			purchaseTime: "2024-01-14 20:15",
			status: "verified",
			statusText: "已校核",
			shopLogo: "/static/images/avatar2.png",
			shopName: "派对领地",
			shopAddress: "上海市黄浦区南京路",
			ticketType: "女性票",
			quantity: 1,
			validPeriod: "2024-01-14 至 2024-01-21",
			validityDays: 7,
			expiryDate: "2024-01-21",
			duration: "4小时",
			drinkCount: 4,
			joinTime: "2024-01-14 20:15",
			applyTime: "2024-01-14",
			description: "专为女性设计的派对套餐，包含特调鸡尾酒和精美小食",
			originalPrice: "150.00",
			finalPrice: "120.00",
			discount: "8.0",
			usedTime: "2024-01-14 21:30",
			usedLocation: "派对领地 - 2楼VIP区",
			expiredTime: null,
			refundTime: null,
			refundReason: null,
			userNickname: "小红",
			userId: "WD001235",
			userAvatar: "/static/images/user-avatar-2.png",
		},
		{
			id: "3",
			ticketName: "静吧小憩",
			purchaseTime: "2024-01-13 18:45",
			status: "cancelled",
			statusText: "已取消",
			shopLogo: "/static/images/avatar3.png",
			shopName: "夜色酒廊",
			shopAddress: "广州市天河区珠江新城",
			ticketType: "通用票",
			quantity: 1,
			validPeriod: "2024-01-13 至 2024-01-20",
			validityDays: 7,
			expiryDate: "2024-01-20",
			duration: "2小时",
			drinkCount: 2,
			joinTime: "2024-01-13 18:45",
			applyTime: "2024-01-13",
			description: "适合安静聊天的轻奢套餐，包含精品咖啡和精致点心",
			originalPrice: "88.00",
			finalPrice: "88.00",
			discount: null,
			usedTime: null,
			usedLocation: null,
			expiredTime: null,
			refundTime: "2024-01-16 10:30",
			refundReason: "商家审核后主动退款",
			userNickname: "小李",
			userId: "WD001236",
			userAvatar: "/static/images/user-avatar-3.png",
		},
	];
	const ticketsWithExpiry = allTickets.map((t: any) => ({
		...t,
		expiryDate: calculateExpiryDate(t.joinTime, t.validityDays),
	}));
	state.allTickets = ticketsWithExpiry;
	filterTickets();
};

// tabs 切换 + 过滤
const filterTickets = () => {
	let list = state.allTickets.slice();
	if (state.activeTab !== "all")
		list = list.filter((t: any) => t.status === state.activeTab);
	state.filteredTickets = list;
	state.showEmptyState = list.length === 0;
	// 更新计数
	state.tabList = state.tabList.map((t: any) => ({
		...t,
		count:
			t.status === "all"
				? state.allTickets.length
				: state.allTickets.filter((x: any) => x.status === t.status).length,
	}));
};

// 搜索、选择、生成（简化）
const searchUser = () => {
	const mockUsers = [
		{
			id: "10001",
			nickname: "小王",
			wandianId: "1029384756",
			gender: "男",
			avatar: "/static/images/avatar1.png",
		},
		{
			id: "10002",
			nickname: "小李",
			wandianId: "5647382910",
			gender: "女",
			avatar: "/static/images/avatar2.png",
		},
	];
	const found = mockUsers.find(
		(u) => u.wandianId === (state.searchUserId || "").trim()
	);
	state.searchedUser = found || null;
	uni.showToast({
		title: found ? "找到用户" : "未找到用户",
		icon: found ? "success" : "none",
	});
};
const selectUser = () => {
	state.selectedUser = state.searchedUser;
	uni.showToast({ title: "已选择用户", icon: "success" });
};
const generateTicket = () => {
	if (!state.selectedUser || !state.selectedTicketType) return;
	const t = state.shopTicketSettings.find(
		(x: any) => x.id === state.selectedTicketType
	);
	if (!t) return;
	const now = new Date();
	const expiry = new Date(
		now.getTime() + Number(t.validDays || 0) * 24 * 60 * 60 * 1000
	);
	const fmt = (d: Date) =>
		`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
			d.getDate()
		).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
			d.getMinutes()
		).padStart(2, "0")}`;
	const newTicket = {
		id: String(Date.now()),
		ticketName: t.name,
		purchaseTime: fmt(now),
		status: "verified",
		statusText: "已校核",
		shopLogo: "/static/images/avatar1.png",
		shopName: "醉美酒吧",
		shopAddress: "北京市朝阳区三里屯街道",
		ticketType:
			t.priceType === "male"
				? "男性票"
				: t.priceType === "female"
				? "女性票"
				: "通用票",
		quantity: 1,
		validPeriod: `${fmt(now)} 至 ${fmt(expiry)}`,
		validityDays: t.validDays,
		expiryDate: fmt(expiry),
		duration: `${t.validHours}小时`,
		drinkCount: t.drinkCount,
		price: t.price,
		userAvatar: state.selectedUser.avatar,
		userNickname: state.selectedUser.nickname,
		userId: state.selectedUser.wandianId,
		joinTime: fmt(now),
		usedTime: fmt(now),
		description: "商家赠送门票",
		isGenerated: true,
	};
	state.allTickets = [newTicket, ...state.allTickets];
	state.showGenerateTicketModal = false;
	state.searchUserId = "";
	state.searchedUser = null;
	state.selectedUser = null;
	state.selectedTicketType = "";
	filterTickets();
	uni.showToast({ title: "门票生成成功", icon: "success" });
};

// 加载店铺门票设置（使用原模拟数据）
const loadShopTicketSettings = () => {
	state.shopTicketSettings = [
		{
			id: "1",
			name: "周中门票",
			priceType: "universal",
			price: "88",
			drinkCount: "3",
			validHours: "4",
			validDays: "7",
			description: "包含3杯酒水，4小时内使用，有效期7天",
			status: "active",
		},
		{
			id: "2",
			name: "周末门票",
			priceType: "male",
			price: "128",
			drinkCount: "5",
			validHours: "6",
			validDays: "15",
			description: "包含5杯酒水，6小时内使用，有效期15天",
			status: "active",
		},
		{
			id: "3",
			name: "周末门票",
			priceType: "female",
			price: "108",
			drinkCount: "5",
			validHours: "6",
			validDays: "15",
			description: "包含5杯酒水，6小时内使用，有效期15天",
			status: "active",
		},
		{
			id: "4",
			name: "补票门票",
			priceType: "universal",
			price: "68",
			drinkCount: "2",
			validHours: "3",
			validDays: "5",
			description: "包含2杯酒水，3小时内使用，有效期5天",
			status: "active",
		},
	];
};

onLoad(() => {
	loadShopTicketSettings();
	loadTicketData();
});
</script>

<style scoped lang="scss">
@import "@/uni.scss";
.ticket-holder {
	min-height: 100vh;
	padding: $up-box-pd;
}

.tabs-wrapper {
	margin-bottom: $up-box-mg;
}
.ticket-list {
	// height: calc(100vh - 280rpx);
}
.ticket-item {
	margin-bottom: $up-box-mg;
	padding: 24rpx;
	position: relative;
	overflow: hidden;
}
.ticket-item::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 6rpx;
	background: linear-gradient(90deg, var(--primary-5), var(--primary-7));
}
.ticket-header {
	margin-bottom: 16rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.ticket-name {
	display: inline-block;
	font-size: 26rpx;
	color: var(--text-2);
	background: var(--bg-2);
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
}

.user-info {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
	padding: 20rpx 0;
	background: var(--bg-2);
	border-radius: 8rpx;
}
.user-avatar {
	margin-right: 16rpx;
}
.user-nickname {
	display: block;
	font-size: 26rpx;
	font-weight: 600;
	color: var(--text-1);
	margin-bottom: 6rpx;
}
.user-id {
	display: block;
	font-size: 22rpx;
	color: var(--text-3);
}
.ticket-details {
	margin-bottom: 16rpx;
}
.detail-row {
	margin-bottom: 10rpx;
	align-items: center;
}
.detail-label {
	font-size: 24rpx;
	color: var(--text-2);
	min-width: 160rpx;
}
.detail-value {
	font-size: 24rpx;
	color: var(--text-1);
	font-weight: 500;
	flex: 1;
	text-align: right;
}
.detail-value.description {
	text-align: left;
	margin-top: 6rpx;
	line-height: 1.6;
	color: var(--text-1);
}
.operation-time {
	margin-bottom: 16rpx;
	border-radius: 8rpx;
}
.time-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;
}
.time-label {
	font-size: 22rpx;
	color: var(--text-3);
	min-width: 140rpx;
}
.time-value {
	font-size: 22rpx;
	color: var(--text-1);
	font-weight: 500;
	flex: 1;
	text-align: right;
}
</style>
