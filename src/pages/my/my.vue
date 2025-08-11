<template>
	<view class="my-page" :class="{ 'dark-theme': isDarkMode }">
		<!-- 用户信息区域 -->
		<view class="user-info-section">
			<view class="user-avatar">
				<image src="/static/logo.png" mode="aspectFill" />
			</view>
			<view class="user-details">
				<view class="username">张三</view>
				<view class="user-level">黄金会员</view>
			</view>
		</view>

		<!-- 功能菜单 -->
		<view class="menu-section">
			<view class="menu-item" @tap="navigateToOrders">
				<view class="menu-icon">📋</view>
				<view class="menu-text">我的订单</view>
				<view class="menu-arrow">></view>
			</view>
			<view class="menu-item" @tap="navigateToFavorites">
				<view class="menu-icon">❤️</view>
				<view class="menu-text">我的收藏</view>
				<view class="menu-arrow">></view>
			</view>
			<view class="menu-item" @tap="navigateToSettings">
				<view class="menu-icon">⚙️</view>
				<view class="menu-text">设置</view>
				<view class="menu-arrow">></view>
			</view>
			<view class="menu-item" @tap="navigateToMerchantOrders">
				<view class="menu-icon">🏪</view>
				<view class="menu-text">商家订单管理</view>
				<view class="menu-arrow">></view>
			</view>
			<view class="menu-item" @tap="navigateToOrderDemo">
				<view class="menu-icon">📱</view>
				<view class="menu-text">订单卡片演示</view>
				<view class="menu-arrow">></view>
			</view>
			<view class="menu-item" @tap="navigateToMilkTeaOrder">
				<view class="menu-icon">🥤</view>
				<view class="menu-text">奶茶点单</view>
				<view class="menu-arrow">></view>
			</view>
			<view class="menu-item" @tap="navigateToMilkTeaDemo">
				<view class="menu-icon">📖</view>
				<view class="menu-text">奶茶点单演示</view>
				<view class="menu-arrow">></view>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { useThemeStore } from "@/stores/theme";
import { ActionType } from "@/types/order";
import { computed } from "vue";

const themeStore = useThemeStore();
const isDarkMode = computed(() => themeStore.isDarkMode);

// 导航到订单页面
const navigateToOrders = () => {
	uni.navigateTo({
		url: '/pages/orders/orders'
	});
};

// 导航到收藏页面
const navigateToFavorites = () => {
	uni.showToast({
		title: '跳转到收藏页面',
		icon: 'none'
	});
};

// 导航到设置页面
const navigateToSettings = () => {
	uni.showToast({
		title: '跳转到设置页面',
		icon: 'none'
	});
};

// 导航到商家订单管理页面
const navigateToMerchantOrders = () => {
	uni.navigateTo({
		url: '/pages/merchant/orders'
	});
};

// 导航到订单演示页面
const navigateToOrderDemo = () => {
	uni.navigateTo({
		url: '/pages/order-demo/order-demo'
	});
};

// 导航到奶茶点单页面
const navigateToMilkTeaOrder = () => {
	uni.navigateTo({
		url: '/pages/milk-tea-order/milk-tea-order'
	});
};

// 导航到奶茶点单演示页面
const navigateToMilkTeaDemo = () => {
	uni.navigateTo({
		url: '/pages/milk-tea-demo/milk-tea-demo'
	});
};

// 处理订单点击
const handleOrderClick = (orderInfo: any) => {
	uni.showToast({
		title: `点击了订单：${orderInfo.orderNumber}`,
		icon: 'none'
	});
};

// 处理操作按钮点击
const handleActionClick = (action: any, orderInfo: any) => {
	uni.showToast({
		title: `执行操作：${action.text} - ${orderInfo.orderNumber}`,
		icon: 'none'
	});
	
	// 根据操作类型执行相应逻辑
	switch (action.type) {
		case ActionType.PAY:
			// 处理支付逻辑
			break;
		case ActionType.CANCEL:
			// 处理取消订单逻辑
			break;
		case ActionType.ACCEPT:
			// 处理接取订单逻辑
			break;
		case ActionType.CONFIRM:
			// 处理确认收货逻辑
			break;
		case ActionType.RATE:
			// 处理评价逻辑
			break;
		case ActionType.REORDER:
			// 处理再次购买逻辑
			break;
	}
};

defineOptions({
	styleIsolation: "shared",
});
</script>

<style lang="scss" scoped>
.my-page {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding-bottom: 40rpx;

	&.dark-theme {
		background-color: #1a1a1a;
		color: #e0e0e0;

		.user-info-section {
			background-color: #2c2c2c;
		}

		.menu-section {
			background-color: #2c2c2c;

			.menu-item {
				border-bottom-color: #444;

				.menu-text {
					color: #e0e0e0;
				}
			}
		}

		.orders-section {
			.section-title {
				color: #e0e0e0;
			}
		}
	}

	// 用户信息区域
	.user-info-section {
		background-color: #fff;
		padding: 40rpx 30rpx;
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;

		.user-avatar {
			width: 120rpx;
			height: 120rpx;
			border-radius: 60rpx;
			overflow: hidden;
			margin-right: 30rpx;

			image {
				width: 100%;
				height: 100%;
			}
		}

		.user-details {
			flex: 1;

			.username {
				font-size: 36rpx;
				font-weight: 600;
				color: #333;
				margin-bottom: 10rpx;
			}

			.user-level {
				font-size: 28rpx;
				color: #ff6b35;
				background-color: #fff7e6;
				padding: 8rpx 16rpx;
				border-radius: 20rpx;
				display: inline-block;
			}
		}
	}

	// 功能菜单
	.menu-section {
		background-color: #fff;
		margin-bottom: 20rpx;

		.menu-item {
			display: flex;
			align-items: center;
			padding: 30rpx;
			border-bottom: 1rpx solid #f0f0f0;

			&:last-child {
				border-bottom: none;
			}

			.menu-icon {
				font-size: 40rpx;
				margin-right: 20rpx;
			}

			.menu-text {
				flex: 1;
				font-size: 32rpx;
				color: #333;
			}

			.menu-arrow {
				font-size: 32rpx;
				color: #999;
			}
		}
	}

	// 订单示例区域
	.orders-section {
		padding: 0 20rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 20rpx;
			padding: 0 10rpx;
		}
	}
}
</style> 