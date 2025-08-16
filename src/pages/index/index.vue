<template>
	<view class="content container">
		<Navbar />
		<view class="scan-box z-glass-card" @tap="handleScan">
			<up-image width="100" height="100" src="/static/scan-logo.png" />
			<view class="scan-text">
				<text>扫码进入店铺</text>
			</view>
		</view>
		<view class="title">已参与的活动</view>
		<view class="shop-list">
			<up-list height="100%" @scrolltolower="scrolltolower">
				<up-list-item v-for="(item, index) in activityList" :key="index">
					<activity-card :activity-info="item" />
				</up-list-item>
			</up-list>
		</view>
		<view class="title">浏览过的店铺</view>
		<view class="shop-list">
			<up-list height="100%" @scrolltolower="scrolltolower">
				<up-list-item v-for="(item, index) in shopList" :key="index">
					<shop-card :shop-info="item" />
				</up-list-item>
			</up-list>
		</view>
	</view>
</template>

<script lang="ts" setup>
import Navbar from "@/components/navbar/navbar.vue";
import ShopCard from "@/components/shop-card/shop-card.vue";
import ActivityCard from "@/components/activity-card/activity-card.vue";
import { ref } from "vue";
const listHeight = ref(0);
// uni.getSystemInfo({
//   success: (res) => {
//     let view = uni.createSelectorQuery().select(".shop-list");
//     view
//       .boundingClientRect((data) => {
//         listHeight.value = res.windowHeight - uni.upx2px(100) - data.top - 100;
//         console.log("信息", listHeight.value);
//       })
//       .exec();
//   },
// });
const value = ref("");
const shopList = ref([
	{
		title: "海伦司小酒馆",
		thumb:
			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
		distance: "100m",
		desc: "海伦司小酒馆111",
		tags: ["标签1", "标签2"],
		businessHours: "10:00-22:00",
	},
	{
		title: "海伦司小酒馆",
		thumb:
			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
		distance: "100m",
		desc: "海伦司小酒馆",
		tags: ["标签1", "标签2"],
		businessHours: "10:00-22:00",
	},
	{
		title: "海伦司小酒馆",
		thumb:
			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
		distance: "100m",
		desc: "海伦司小酒馆",
		tags: ["标签1", "标签2"],
		businessHours: "10:00-22:00",
	},
	{
		title: "海伦司小酒馆",
		thumb:
			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
		distance: "100m",
		desc: "海伦司小酒馆",
		tags: ["标签1", "标签2"],
		businessHours: "10:00-22:00",
	},
	{
		title: "海伦司小酒馆",
		thumb:
			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
		distance: "100m",
		desc: "海伦司小酒馆",
		tags: ["标签1", "标签2"],
		businessHours: "10:00-22:00",
	},
	{
		title: "海伦司小酒馆",
		thumb:
			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
		distance: "100m",
		desc: "海伦司小酒馆",
		tags: ["标签1", "标签2"],
		businessHours: "10:00-22:00",
	},
	{
		title: "海伦司小酒馆",
		thumb:
			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
		distance: "100m",
		desc: "海伦司小酒馆",
		tags: ["标签1", "标签2"],
		businessHours: "10:00-22:00",
	},
]);
const activityList = ref([
	{
		activityTitle: "毕业季狂欢节12",
		thumb:
			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
		startTime: "2025-06-12 10:00:00",
		endTime: "2025-06-19 23:59:59",
		status: "进行中",
		businessName: "海伦司小酒馆",
		tags: ["标签1", "标签2"],
		businessHours: "10:00-22:00",
	},
	{
		activityTitle: "毕业季狂欢节",
		thumb:
			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
		startTime: "2025-06-12 10:00:00",
		endTime: "2025-06-19 23:59:59",
		status: "进行中",
		businessName: "海伦司小酒馆",
		tags: ["标签1", "标签2"],
		businessHours: "10:00-22:00",
	},
	{
		activityTitle: "毕业季狂欢节",
		thumb:
			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
		startTime: "2025-06-12 10:00:00",
		endTime: "2025-06-19 23:59:59",
		status: "进行中",
		businessName: "海伦司小酒馆",
		tags: ["标签1", "标签2"],
		businessHours: "10:00-22:00",
	},
	{
		activityTitle: "毕业季狂欢节",
		thumb:
			"https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg",
		startTime: "2025-06-12 10:00:00",
		endTime: "2025-06-19 23:59:59",
		status: "进行中",
		businessName: "海伦司小酒馆",
		tags: ["标签1", "标签2"],
		businessHours: "10:00-22:00",
	},
]);

const handleScan = () => {
	wx.scanCode({
		onlyFromCamera: true, // 只允许从相机扫码
		scanType: ["qrCode"], // 只扫描二维码
		success: (res) => {
			console.log("扫码结果：", res);
			// 处理扫码结果
			const shopId = res.result;
			if (shopId) {
				// 跳转到店铺页面
				wx.navigateTo({
					url: `/pages/shop/shop?id=${shopId}`,
				});
			}
		},
		fail: (err) => {
			console.error("扫码失败：", err);
			wx.showToast({
				title: "扫码失败",
				icon: "none",
			});
		},
	});
};
</script>

<style lang="scss" scoped>
.content {
	.scan-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		margin: 12px 0;
		transition: all 0.3s ease;

		&:active {
			transform: scale(0.98);
		}

		.scan-text {
			font-weight: bold;
			margin-top: 16rpx;
			font-size: 32rpx;
			color: #333;
		}
	}
	.title {
		padding: 0 20rpx;
		box-sizing: border-box;
		font-size: 34rpx;
		font-weight: bold;
	}
	.shop-list {
		// padding: 20rpx;
		box-sizing: border-box;
	}
}

</style>
