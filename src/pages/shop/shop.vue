<!-- 店铺 -->
<template>
	<pageWrapper :showTabbar="true">
		<view class="shop">
			<!-- 店铺基本信息 -->
			<view class="shop-info-card z-glass-card">
				<view class="shop-header">
					<up-image
						class="shop-logo"
						:src="shopInfo.logo || '/static/images/logo.png'"
						mode="aspectFill"
						width="60px"
						height="60px"
						border-radius="8px"
					></up-image>
					<view class="shop-basic-info">
						<text class="shop-name">{{ shopInfo.name }}</text>
						<view class="shop-intro">
							{{ shopInfo.address || "暂无地址" }}
						</view>
						<view class="shop-date">
							营业时间：{{ shopInfo.openTime }} - {{ shopInfo.closeTime }}
						</view>
					</view>

					<view class="shop-address">
						<view class="shop-status">
							<BusinessStatus :state="shopInfo.state" />
						</view>
						<up-button
							type="primary"
							shape="circle"
							size="small"
							class="shop-status-btn"
							@click="toggleShopStatus"
						>
							{{ shopInfo.state == "open" ? "休息" : "营业" }}
						</up-button>
					</view>
				</view>
				<view
					class="shop-switch-section"
					@click="openShopModal"
					v-if="state.shopList.length > 0"
				>
					<view class="shop-switch-btn">
						<view class="btn-content">
							<!-- <up-icon
								class="switch-icon"
								name="shop"
								size="20"
								color="var(--primary-6)"
							></up-icon> -->
							<text class="btn-text">切换店铺</text>
							<up-icon
								class="arrow-icon"
								name="arrow-down"
								size="16"
								color="var(--primary-6)"
							></up-icon>
						</view>
						<view class="shop-count" v-if="state.shopList.length > 1">
							{{ state.shopList.length }}家店铺
						</view>
					</view>
				</view>
			</view>
			<view class="z-glass-card">
				<up-cell-group v-for="main in state.cellList" :key="main.title">
					<view class="z-cell-title">{{ main.title }}</view>
					<up-cell
						v-for="item in main.children"
						:key="item.title"
						:title="item.title"
						:isLink="item.showArrow"
						@click="itemClick(item)"
					>
						<template #icon>
							<view class="z-cell-left-icon">{{ item.img }}</view>
						</template>
					</up-cell>
				</up-cell-group>
			</view>
		</view>
		<!-- 店铺切换组件 -->
		<ShopSwitcher
			ref="shopSwitcherRef"
			v-if="state.shopList.length > 0"
			:shops="state.shopList"
			@shopChange="handleShopSelect"
		/>
	</pageWrapper>
</template>

<script lang="ts" setup>
import { cloneDeep } from "lodash-es";
import { onMounted, reactive, ref } from "vue";
import { onShow, onPullDownRefresh } from "@dcloudio/uni-app";
import pageWrapper from "@/components/page/index.vue";
import BusinessStatus from "@/components/business-status/index.vue";
import ShopSwitcher from "@/components/shop-switcher/index.vue";
import { useUserStore, useShopStore } from "@/stores";
import { getShopList, getShopConfigList } from "@/api/shopManage";

const userStore = useUserStore();
const shopStore = useShopStore();

const shopSwitcherRef = ref<any>(null);

const state = reactive({
	shopList: [] as any, // 店铺列表
	cellList: [
		{
			title: "店铺详情",
			children: [
				{
					title: "店铺详情",
					icon: "star-fill",
					url: "/pages/shopDetail/shopDetail",
					showArrow: true,
					img: "🏪",
				},
				{
					title: "报名审核",
					icon: "star-fill",
					url: "",
					showArrow: true,
					img: "✅",
				},
				{
					title: "店铺订单",
					icon: "star-fill",
					url: "/pages/merchant/orders",
					showArrow: true,
					img: "📋",
				},
				{
					title: "数据分析",
					icon: "star-fill",
					url: "",
					showArrow: true,
					img: "📊",
				},
				{
					title: "店铺二维码",
					icon: "star-fill",
					url: "",
					type: "qrcode",
					showArrow: true,
					img: "📱",
				},
				{
					title: "订单卡片演示",
					icon: "star-fill",
					url: "/pages/orderDemo/orderDemo",
					showArrow: true,
				},
				{
					title: "奶茶点单",
					icon: "star-fill",
					url: "/pages/milkTeaOrder/milkTeaOrder",
					showArrow: true,
				},
				{
					title: "奶茶点单演示",
					icon: "star-fill",
					url: "/pages/milkTeaDemo/milkTeaDemo",
					showArrow: true,
				},
			],
		},
		{
			title: "店铺管理",
			children: [
				{
					title: "菜单管理",
					icon: "setting-fill",
					url: "/pages/shopMenu/shopMenu",
					showArrow: true,
					img: "🍷",
				},
				{
					title: "游戏管理",
					icon: "setting-fill",
					url: "/pages/shopGames/shopGames",
					showArrow: true,
					img: "🎮",
				},
				{
					title: "桌位管理",
					icon: "setting-fill",
					url: "/pages/tableManage/tableManage",
					showArrow: true,
					img: "🪑",
				},
				{
					title: "门票设置",
					icon: "setting-fill",
					url: "/pages/ticketSettings/ticketSettings",
					showArrow: true,
					img: "🎫",
				},
				{
					title: "员工管理",
					icon: "setting-fill",
					url: "/pages/shopStaff/shopStaff",
					showArrow: true,
					img: "👨‍👩‍👧‍👦",
				},
			],
		},
	],
});
let shopInfo = ref<any>({});

const openShopModal = () => {
	shopSwitcherRef.value.openShopModal(shopInfo.value);
};

const GetShopConfigList = async () => {
	try {
		let params = {
			//   pageNum: 1,
			//   pageSize: 999,
			// id: userStore.userInfo?.id
		};
		const res = await getShopConfigList(params);
		console.log(res);
		if (res.data?.length) {
			shopInfo.value = cloneDeep(res.data[0]) || {};
			// 将店铺数据添加到店铺列表中
			state.shopList = res.data || [];
			// 设置当前店铺ID
			if (state.shopList.length > 0 && !shopInfo.value.shopId) {
				shopInfo.value.shopId = state.shopList[0].shopId;
			}
		}
	} catch (error) {}
};

// 处理店铺选择
const handleShopSelect = (shop: any) => {
	console.log("切换到店铺:", shop.name);
	// shopInfo.value.id = shopId;
	// 根据店铺ID更新当前店铺信息
	for (const key in shopInfo.value) {
		shopInfo.value[key] = shop[key];
	}
};

const itemClick = (item: any) => {
	if (item.url) {
		navigateTo(item.url);
	} else if (item.type == "qrcode") {
		uni.showModal({
			title: "店铺二维码",
			content: shopInfo.value.name + "的二维码功能开发中，敬请期待！",
			showCancel: false,
			confirmText: "知道了",
		});
	} else {
		uni.showToast({
			title: "功能开发中",
			icon: "none",
		});
	}
};
const navigateTo = (url: string) => {
	const shopId = shopInfo.value?.shopId || "";
	url &&
		uni.navigateTo({
			url: `${url}?shopId=${shopId}`,
		});
};

// 切换店铺营业状态
const toggleShopStatus = () => {
	// 实际项目中，这里应该调用接口修改店铺状态
	shopInfo.value.state = shopInfo.value.state == "open" ? "close" : "open";
	uni.showToast({
		title: shopInfo.value.state == "open" ? "已设为营业中" : "已设为休息",
		icon: "success",
	});
};

onMounted(() => {
	GetShopConfigList();
});

// 下拉刷新监听
onPullDownRefresh(async () => {
	try {
		await GetShopConfigList();
	} finally {
		uni.stopPullDownRefresh();
	}
});

defineOptions({
	styleIsolation: "shared",
});
</script>

<style lang="scss" scoped>
.shop {
	padding: $up-box-pd;
	.tags {
		flex-wrap: wrap;
		margin-top: 8rpx;
		display: flex;
		align-items: center;
		gap: 12rpx;
	}
	.edit-btn {
		margin: 0 auto;
		margin-top: 20rpx;
	}

	/* 店铺基本信息卡片 */
	.shop-info-card {
		padding: 15rpx;
		margin-bottom: $up-box-mg;
		.shop-intro,
		.shop-date {
			color: $u-content-color;
			font-size: $up-font-sm;
			margin-top: 6rpx;
		}
	}

	.shop-header {
		display: flex;
		align-items: center;
		margin-bottom: 15rpx;
		padding: $up-box-pd;
	}

	.shop-logo {
		width: 60rpx;
		height: 60rpx;
		border-radius: 8rpx;
		margin-right: 12rpx;
	}

	.shop-basic-info {
		flex: 1;
	}

	.shop-name {
		font-size: $up-font-lg;
		font-weight: bold;
		color: #333;
		margin-bottom: 5rpx;
	}

	.shop-status {
		display: inline-block;
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
		font-size: $up-font-sm;
		color: white;
		margin-left: 6rpx;
		margin-bottom: 10rpx;
		position: absolute;
		right: 16rpx;
		top: 16rpx;
		:deep(.u-tag) {
			border: none;
		}
		.shop-stats {
			display: flex;
			justify-content: space-around;
			padding: 10rpx 0;
			border-top: 1rpx solid #f0f0f0;
		}

		.stat-item {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.stat-number {
			font-size: $up-font-md;
			font-weight: bold;
			color: #333;
			margin-bottom: 5rpx;
		}

		.stat-label {
			font-size: $up-font-sm;
			color: #999;
		}
	}
	.shop-status-btn {
		margin-top: 40rpx;
	}

	.shop-switch-section {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 12rpx;

		.shop-switch-btn {
			background: linear-gradient(
				135deg,
				var(--primary-1) 0%,
				var(--primary-2) 100%
			);
			border: 1px solid var(--primary-3);
			border-radius: 16rpx;
			padding: 10rpx 24rpx;
			min-width: 200rpx;
			box-shadow: 0 4rpx 12rpx rgba(34, 114, 251, 0.1);
			transition: all 0.3s ease;
			cursor: pointer;

			&:active {
				transform: scale(0.98);
				box-shadow: 0 2rpx 8rpx rgba(34, 114, 251, 0.15);
			}

			.btn-content {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 12rpx;

				.switch-icon {
					flex-shrink: 0;
				}

				.btn-text {
					font-size: 28rpx;
					font-weight: 600;
					color: var(--primary-6);
					letter-spacing: 1rpx;
				}

				.arrow-icon {
					flex-shrink: 0;
					transition: transform 0.3s ease;
				}
			}

			.shop-count {
				text-align: center;
				margin-top: 6rpx;
				font-size: 20rpx;
				color: var(--text-2);
				opacity: 0.8;
			}
		}
	}
}
</style>
