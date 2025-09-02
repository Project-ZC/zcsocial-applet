<template>
	<pageWrapper :showTabbar="true">
		<up-sticky offset-top="0">
			<Navbar />
		</up-sticky>
		<view class="content">
			<view class="scan-box z-glass-card" @tap="handleScan">
				<up-image width="100" height="100" src="/static/images/scan-logo.png" />
				<view class="scan-text">
					<text>扫码进入店铺</text>
				</view>
			</view>
			<!-- <view class="title">已参与的活动</view>
			<view class="shop-list">
				<up-list height="100%" @scrolltolower="scrolltolower">
					<up-list-item v-for="(item, index) in activityList" :key="index">
						<activity-card :activity-info="item" />
					</up-list-item>
				</up-list>
			</view> -->
			<view class="title">浏览过的店铺</view>
			<view class="shop-list">
				<up-list
					height="100%"
					@scrolltolower="scrolltolower"
					v-if="shopList.length > 0"
				>
					<up-list-item v-for="(item, index) in shopList" :key="index">
						<shop-card :shop-info="item" @itemClick="handleShopClick(item)" />
					</up-list-item>
				</up-list>
				<emptyData v-else text="暂无浏览过的店铺" />
			</view>
		</view>
	</pageWrapper>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { onPullDownRefresh, onLoad } from "@dcloudio/uni-app";
import Navbar from "@/components/navbar/navbar.vue";
import ShopCard from "./components/shopCard.vue";
import ActivityCard from "./components/activityCard.vue";
import { getShopConfigList } from "@/api/shopManage";
const shopList = ref([
	// {
	// 	title: "海伦司小酒馆",
	// 	thumb:
	// 		"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
	// 	distance: "100m",
	// 	desc: "海伦司小酒馆111",
	// 	tags: ["标签1", "标签2"],
	// 	businessHours: "10:00-22:00",
	// 	status: "open",
	// },
	// {
	// 	title: "海伦司小酒馆",
	// 	thumb:
	// 		"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
	// 	distance: "100m",
	// 	desc: "海伦司小酒馆",
	// 	tags: ["标签1", "标签2"],
	// 	businessHours: "10:00-22:00",
	// 	status: "closed",
	// },
	// {
	// 	title: "海伦司小酒馆",
	// 	thumb:
	// 		"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
	// 	distance: "100m",
	// 	desc: "海伦司小酒馆",
	// 	tags: ["标签1", "标签2"],
	// 	businessHours: "10:00-22:00",
	// 	status: "close_manual",
	// },
	// {
	// 	title: "海伦司小酒馆",
	// 	thumb:
	// 		"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
	// 	distance: "100m",
	// 	desc: "海伦司小酒馆",
	// 	tags: ["标签1", "标签2"],
	// 	businessHours: "10:00-22:00",
	// 	status: "closed",
	// },
	// {
	// 	title: "海伦司小酒馆",
	// 	thumb:
	// 		"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
	// 	distance: "100m",
	// 	desc: "海伦司小酒馆",
	// 	tags: ["标签1", "标签2"],
	// 	businessHours: "10:00-22:00",
	// 	status: "closed",
	// },
	// {
	// 	title: "海伦司小酒馆",
	// 	thumb:
	// 		"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
	// 	distance: "100m",
	// 	desc: "海伦司小酒馆",
	// 	tags: ["标签1", "标签2"],
	// 	businessHours: "10:00-22:00",
	// 	status: "open",
	// },
	// {
	// 	title: "海伦司小酒馆",
	// 	thumb:
	// 		"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
	// 	distance: "100m",
	// 	desc: "海伦司小酒馆",
	// 	tags: ["标签1", "标签2"],
	// 	businessHours: "10:00-22:00",
	// 	status: "open",
	// },
]);
// const activityList = ref([
// 	{
// 		activityTitle: "毕业季狂欢节12",
// 		thumb:
// 			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
// 		startTime: "2025-06-12 10:00:00",
// 		endTime: "2025-06-19 23:59:59",
// 		status: "open",
// 		businessName: "海伦司小酒馆",
// 		tags: ["标签1", "标签2"],
// 		businessHours: "10:00-22:00",
// 	},
// 	{
// 		activityTitle: "毕业季狂欢节",
// 		thumb:
// 			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
// 		startTime: "2025-06-12 10:00:00",
// 		endTime: "2025-06-19 23:59:59",
// 		status: "closed",
// 		businessName: "海伦司小酒馆",
// 		tags: ["标签1", "标签2"],
// 		businessHours: "10:00-22:00",
// 	},
// 	{
// 		activityTitle: "毕业季狂欢节",
// 		thumb:
// 			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
// 		startTime: "2025-06-12 10:00:00",
// 		endTime: "2025-06-19 23:59:59",
// 		status: "open",
// 		businessName: "海伦司小酒馆",
// 		tags: ["标签1", "标签2"],
// 		businessHours: "10:00-22:00",
// 	},
// 	{
// 		activityTitle: "毕业季狂欢节",
// 		thumb:
// 			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
// 		startTime: "2025-06-12 10:00:00",
// 		endTime: "2025-06-19 23:59:59",
// 		status: "open",
// 		businessName: "海伦司小酒馆",
// 		tags: ["标签1", "标签2"],
// 		businessHours: "10:00-22:00",
// 	},
// ]);

const GetShopConfigList = async () => {
	try {
		const res = await getShopConfigList({});
		let list = [];
		if (res.data?.length) {
			for (const item of res.data) {
				list.push({
					...item.shopConfig,
				});
			}
		}
		shopList.value = list || [];
	} catch (error) {}
};

const handleShopClick = (item: any) => {
	uni.navigateTo({
		url: `/pages/index/shopDetail/showDetail?shopId=${item.shopId}`,
	});
};

const handleScan = () => {
	uni.scanCode({
		onlyFromCamera: true, // 只允许从相机扫码
		scanType: ["qrCode"], // 只扫描二维码
		success: (res) => {
			console.log("扫码结果：", res);
			// 处理扫码结果
			const shopId = res.result;
			if (shopId) {
				// 跳转到店铺页面
				uni.navigateTo({
					url: `/pages/shop/shop?id=${shopId}`,
				});
			}
		},
		fail: (err) => {
			console.error("扫码失败：", err);
			uni.showToast({
				title: "扫码失败",
				icon: "none",
			});
		},
	});
};
onLoad(() => {
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
</script>

<style lang="scss" scoped>
@import "@/uni.scss";
.content {
	padding: $up-box-pd;
	color: var(--text-1);
	.scan-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		padding: $up-box-pd;
		transition: all 0.3s ease;

		&:active {
			transform: scale(0.98);
		}

		.scan-text {
			font-weight: bold;
			margin-top: 16rpx;
			font-size: 32rpx;
			color: var(--text-1);
		}
	}
	.title {
		padding: 0;
		box-sizing: border-box;
		font-size: 34rpx;
		font-weight: bold;
		color: var(--text-1);
		margin: $up-box-mg 0 6rpx;
	}
	.shop-list {
		// padding: 20rpx;
		box-sizing: border-box;
	}
}
</style>
