<template>
	<pageWrapper>
		<view class="container">
			<!-- 店铺切换组件 -->
			<view class="shop-switcher-section">
				<ShopSwitcher
					:shops="shopList"
					:currentShopId="currentShopId"
					@update:currentShopId="handleShopChange"
					@shopChange="handleShopSelect"
				/>
			</view>

			<!-- 当前店铺信息 -->
			<view class="current-shop-info" v-if="currentShop">
				<view class="info-card">
					<view class="shop-name">{{ currentShop.name }}</view>
					<view class="shop-address">{{
						currentShop.address || "暂无地址"
					}}</view>
					<view class="shop-status">
						<text class="status-dot" :class="currentShop.status"></text>
						<text class="status-text">{{
							getStatusText(currentShop.status)
						}}</text>
					</view>
				</view>
			</view>

			<!-- 其他内容 -->
			<view class="content-section">
				<text>这里是店铺的其他功能内容...</text>
			</view>
		</view>
	</pageWrapper>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import pageWrapper from "@/components/page/index.vue";

// 店铺数据
const shopList = ref([
	{
		id: "1",
		name: "星巴克咖啡店",
		address: "北京市朝阳区三里屯路19号",
		status: "open",
	},
	{
		id: "2",
		name: "瑞幸咖啡店",
		address: "上海市浦东新区陆家嘴环路1000号",
		status: "close",
	},
	{
		id: "3",
		name: "喜茶饮品店",
		address: "广州市天河区珠江新城花城大道85号",
		status: "open",
	},
	{
		id: "4",
		name: "奈雪的茶",
		address: "深圳市南山区科技园南区",
		status: "close_manual",
	},
]);

// 当前选中的店铺ID
const currentShopId = ref("1");

// 当前选中的店铺信息
const currentShop = computed(() => {
	return shopList.value.find((shop) => shop.id === currentShopId.value);
});

// 处理店铺切换
const handleShopChange = (shopId: string) => {
	currentShopId.value = shopId;
	console.log("店铺ID已更新:", shopId);
};

// 处理店铺选择
const handleShopSelect = (shop: any) => {
	console.log("选中的店铺:", shop);
	// 可以在这里执行其他逻辑，比如刷新页面数据
	uni.showToast({
		title: `已切换到: ${shop.name}`,
		icon: "success",
	});
};

// 获取状态文本
const getStatusText = (status: string) => {
	const statusMap = {
		open: "营业中",
		close: "暂停营业",
		close_manual: "暂停营业(手动)",
	};
	return statusMap[status] || "未知状态";
};
</script>

<style lang="scss" scoped>
.container {
	padding: 20rpx;
}

.shop-switcher-section {
	margin-bottom: 30rpx;
}

.current-shop-info {
	margin-bottom: 30rpx;

	.info-card {
		background: #fff;
		border-radius: 12rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

		.shop-name {
			font-size: 36rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 16rpx;
		}

		.shop-address {
			font-size: 28rpx;
			color: #666;
			margin-bottom: 16rpx;
		}

		.shop-status {
			display: flex;
			align-items: center;
			font-size: 24rpx;
			color: #666;

			.status-dot {
				width: 12rpx;
				height: 12rpx;
				border-radius: 50%;
				margin-right: 8rpx;

				&.open {
					background-color: #52c41a;
				}

				&.close,
				&.close_manual {
					background-color: #ff4d4f;
				}
			}

			.status-text {
				font-size: 24rpx;
			}
		}
	}
}

.content-section {
	background: #fff;
	border-radius: 12rpx;
	padding: 30rpx;
	text-align: center;
	color: #666;
	font-size: 28rpx;
}
</style>
