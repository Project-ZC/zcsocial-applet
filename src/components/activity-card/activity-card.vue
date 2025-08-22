<template>
	<view class="activity-card-box">
		<view
			class="activity-card z-glass-card"
			:class="{ 'dark-theme': isDarkMode }"
		>
			<view class="img-box">
				<up-image
					width="100%"
					height="100%"
					:src="activityInfo.thumb"
				></up-image>
			</view>
			<view class="content">
				<view class="activity-title">{{ activityInfo.activityTitle }}</view>
				<view class="business-name">{{ activityInfo.businessName }}</view>
				<view class="time">
					<text>开始时间:</text>
					<text>{{ activityInfo.startTime }}</text>
				</view>
				<view class="time">
					<text>结束时间:</text>
					<text>{{ activityInfo.endTime }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { useThemeStore } from "@/stores/modules/theme";
import { computed, withDefaults } from "vue";

interface ActivityInfo {
	activityTitle: string;
	thumb: string;
	startTime: string;
	endTime: string;
	status: string;
	businessName: string;
	businessHours: string;
}

const props = withDefaults(
	defineProps<{
		activityInfo: ActivityInfo;
	}>(),
	{}
);

const themeStore = useThemeStore();
const isDarkMode = computed(() => themeStore.isDarkMode);
</script>

<style lang="scss" scoped>
@import "@/uni.scss";
.activity-card-box {
	padding: 5rpx;
	box-sizing: border-box;
	.activity-card {
		padding: 20rpx;
		box-sizing: border-box;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		transition: all 0.3s ease;

		&:active {
			transform: scale(0.98);
			box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.3);
		}
		.img-box {
			width: 160rpx;
			height: 160rpx;
			border-radius: 16rpx;
			overflow: hidden;
		}
		.content {
			width: 72%;
			.activity-title {
				font-size: 30rpx;
				font-weight: bold;
				margin-bottom: 10rpx;
			}
			.business-name {
				font-size: 28rpx;
				color: #666;
				margin-bottom: 10rpx;
			}

			.time {
				display: flex;
				align-items: center;
				font-size: 28rpx;
				margin-bottom: 10rpx;
				text:first-child {
					color: #666;
				}

				text:last-child {
					color: $u-main-color;
				}
			}
		}

		// 暗色主题样式
		&.dark-theme {
			background-color: #1c1c1e;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);

			&:active {
				box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.2);
			}

			.distance {
				color: #999;
			}

			.time {
				display: flex;
				justify-content: space-between;
				align-items: center;
				font-size: 28rpx;
				text:first-child {
					color: #999;
				}

				text:last-child {
					color: #fff;
				}
			}
		}
	}
}
</style>
