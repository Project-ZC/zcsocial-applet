<template>
	<pageWrapper>
		<view class="container">
			<view class="section">
				<view class="section-title">标签选择器示例</view>

				<!-- 基础用法 -->
				<view class="demo-card">
					<view class="demo-title">基础用法</view>
					<TagSelector
						:selectedTags="selectedTags"
						@update:selectedTags="handleTagChange"
						@tagAdd="handleTagAdd"
						@tagRemove="handleTagRemove"
					/>
				</view>

				<!-- 限制最大数量 -->
				<view class="demo-card">
					<view class="demo-title">限制最大数量 (最多3个)</view>
					<TagSelector
						:selectedTags="limitedTags"
						:maxTags="3"
						@update:selectedTags="handleLimitedTagChange"
					/>
				</view>

				<!-- 不允许自定义输入 -->
				<view class="demo-card">
					<view class="demo-title">仅选择模式 (不允许自定义输入)</view>
					<TagSelector
						:selectedTags="selectOnlyTags"
						:allowCustom="false"
						@update:selectedTags="handleSelectOnlyChange"
					/>
				</view>

				<!-- 当前选中状态 -->
				<view class="demo-card">
					<view class="demo-title">当前选中的标签</view>
					<view class="selected-info">
						<text>数量: {{ selectedTags.length }}</text>
						<text
							>标签:
							{{ selectedTags.map((t) => t.name).join(", ") || "无" }}</text
						>
					</view>
				</view>
			</view>
		</view>
	</pageWrapper>
</template>

<script setup lang="ts">
import { ref } from "vue";
import pageWrapper from "@/components/page/index.vue";
import TagSelector from "./tag-selector.vue";

// 已选标签
const selectedTags = ref([{ id: 1, name: "咖啡" }]);

const limitedTags = ref([]);
const selectOnlyTags = ref([]);

// 处理标签变化
const handleTagChange = (tags: any[]) => {
	selectedTags.value = tags;
	console.log("标签变化:", tags);
};

const handleLimitedTagChange = (tags: any[]) => {
	limitedTags.value = tags;
	console.log("限制标签变化:", tags);
};

const handleSelectOnlyChange = (tags: any[]) => {
	selectOnlyTags.value = tags;
	console.log("仅选择标签变化:", tags);
};

// 处理标签添加
const handleTagAdd = (tag: any) => {
	console.log("添加标签:", tag);
	uni.showToast({
		title: `添加了标签: ${tag.name}`,
		icon: "success",
	});
};

// 处理标签移除
const handleTagRemove = (tag: any) => {
	console.log("移除标签:", tag);
	uni.showToast({
		title: `移除了标签: ${tag.name}`,
		icon: "none",
	});
};
</script>

<style lang="scss" scoped>
.container {
	padding: 20rpx;
}

.section {
	.section-title {
		font-size: 36rpx;
		font-weight: 600;
		color: var(--text-1);
		margin-bottom: 30rpx;
		text-align: center;
	}
}

.demo-card {
	background: #fff;
	border-radius: 12rpx;
	padding: 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

	.demo-title {
		font-size: 28rpx;
		font-weight: 600;
		color: var(--text-1);
		margin-bottom: 20rpx;
		padding-bottom: 12rpx;
		border-bottom: 1px solid var(--border-1);
	}

	.selected-info {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		font-size: 26rpx;
		color: var(--text-2);
		line-height: 1.5;
	}
}
</style>
