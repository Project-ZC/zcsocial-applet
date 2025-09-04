<template>
	<view class="drag-example">
		<view class="header">
			<text class="title">拖拽排序示例</text>
			<up-button type="primary" size="small" @click="resetList">
				重置列表
			</up-button>
		</view>

		<drag-component
			:list="items"
			:controlsSize="{ height: 80 }"
			@sort-change="onSortChange"
			@update:list="onListUpdate"
		>
			<template #default="{ item, index }">
				<view class="drag-item">
					<view class="item-index">{{ index + 1 }}</view>
					<view class="item-content">
						<text class="item-name">{{ item.name }}</text>
						<text class="item-desc">{{ item.description }}</text>
					</view>
				</view>
			</template>
		</drag-component>

		<view class="debug-info">
			<text class="debug-title">调试信息：</text>
			<text class="debug-text"
				>当前列表: {{ JSON.stringify(items.map((i) => i.name)) }}</text
			>
			<text class="debug-text">最后排序: {{ lastSortInfo }}</text>
		</view>
	</view>
</template>

<script setup>
import { ref } from "vue";
import dragComponent from "./index.vue";

// 测试数据
const items = ref([
	{ name: "项目 A", description: "这是项目 A 的描述" },
	{ name: "项目 B", description: "这是项目 B 的描述" },
	{ name: "项目 C", description: "这是项目 C 的描述" },
	{ name: "项目 D", description: "这是项目 D 的描述" },
	{ name: "项目 E", description: "这是项目 E 的描述" },
]);

const lastSortInfo = ref("暂无排序操作");

// 处理排序变化
const onSortChange = (newList, oldIndex, newIndex) => {
	console.log("排序变化:", {
		原位置: oldIndex,
		新位置: newIndex,
		新列表: newList.map((item) => item.name),
	});

	lastSortInfo.value = `从位置 ${oldIndex + 1} 移动到位置 ${newIndex + 1}`;

	uni.showToast({
		title: `从位置 ${oldIndex + 1} 移动到位置 ${newIndex + 1}`,
		icon: "success",
	});
};

// 处理列表更新
const onListUpdate = (newList) => {
	console.log("列表更新:", newList);
	items.value = newList;
};

// 重置列表
const resetList = () => {
	items.value = [
		{ name: "项目 A", description: "这是项目 A 的描述" },
		{ name: "项目 B", description: "这是项目 B 的描述" },
		{ name: "项目 C", description: "这是项目 C 的描述" },
		{ name: "项目 D", description: "这是项目 D 的描述" },
		{ name: "项目 E", description: "这是项目 E 的描述" },
	];
	lastSortInfo.value = "暂无排序操作";

	uni.showToast({
		title: "列表已重置",
		icon: "success",
	});
};
</script>

<style lang="scss" scoped>
.drag-example {
	height: 100vh;
	background: #f5f5f5;
}

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 30rpx;
	background: #fff;
	border-bottom: 1rpx solid #eee;

	.title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}
}

.drag-item {
	display: flex;
	align-items: center;
	height: 100%;
	padding: 0 20rpx;
	background: #fff;
	border-radius: 8rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.item-index {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 60rpx;
	height: 60rpx;
	background: #007aff;
	color: #fff;
	border-radius: 50%;
	font-size: 24rpx;
	font-weight: 600;
	margin-right: 20rpx;
}

.item-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.item-name {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 8rpx;
}

.item-desc {
	font-size: 24rpx;
	color: #999;
}

.debug-info {
	padding: 20rpx;
	background: #fff;
	margin: 20rpx;
	border-radius: 8rpx;
}

.debug-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
	display: block;
	margin-bottom: 10rpx;
}

.debug-text {
	font-size: 24rpx;
	color: #666;
	word-break: break-all;
	display: block;
	margin-bottom: 8rpx;
}
</style>
