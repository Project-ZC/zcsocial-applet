<template>
	<view class="tag-selector">
		<!-- 加载状态 -->
		<view class="loading-container" v-if="loading">
			<up-loading-icon mode="spinner" size="20"></up-loading-icon>
			<text class="loading-text">加载标签中...</text>
		</view>

		<!-- 已选标签展示 -->
		<view class="selected-tags" v-if="selectedTags.length > 0">
			<view class="tags-title">已选标签：</view>
			<view class="tags-container">
				<view
					class="tag-item selected"
					v-for="tag in selectedTags"
					:key="tag.id"
					@click="removeTag(tag)"
				>
					<text class="tag-text">{{ tag.name }}</text>
					<up-icon name="close" size="12" color="#fff"></up-icon>
				</view>
			</view>
		</view>

		<!-- 标签输入/选择区域 -->
		<view class="tag-input-section">
			<!-- 输入框 -->
			<view class="tag-input-container">
				<up-input
					class="tag-input"
					v-model="inputValue"
					:focus="showInput"
					@focus="handleInputFocus"
					@blur="handleInputBlur"
					@confirm="addCustomTag"
					placeholder="输入标签名称或选择已有标签"
					maxlength="10"
				/>
				<up-button
					class="add-btn"
					size="small"
					type="primary"
					@click="addCustomTag"
					:disabled="!inputValue.trim()"
				>
					添加
				</up-button>
			</view>

			<!-- 可选标签列表 -->
			<view
				class="available-tags"
				v-if="showAvailableTags && availableTags.length > 0"
			>
				<view class="tags-title">可选标签：</view>
				<view class="tags-container">
					<view
						class="tag-item available"
						v-for="tag in availableTags"
						:key="tag.id"
						@click="selectTag(tag)"
					>
						<text class="tag-text">{{ tag.name }}</text>
						<up-icon name="plus" size="12" color="var(--primary-6)"></up-icon>
					</view>
				</view>
			</view>

			<!-- 搜索建议 -->
			<view
				class="search-suggestions"
				v-if="showSuggestions && filteredTags.length > 0"
			>
				<view class="suggestions-title">搜索建议：</view>
				<view class="suggestions-list">
					<view
						class="suggestion-item"
						v-for="tag in filteredTags"
						:key="tag.id"
						@click="selectTag(tag)"
					>
						<text class="suggestion-text">{{ tag.name }}</text>
						<up-icon name="plus" size="12" color="var(--primary-6)"></up-icon>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";

interface Tag {
	id: string | number;
	name: string;
	[key: string]: any;
}

interface Props {
	selectedTags?: Tag[]; // 已选标签
	maxTags?: number; // 最大可选标签数
	allowCustom?: boolean; // 是否允许自定义输入
	shopId?: string | number; // 店铺ID，用于获取店铺标签
}

const props = withDefaults(defineProps<Props>(), {
	selectedTags: () => [],
	maxTags: 10,
	allowCustom: true,
	shopId: "",
});

const emit = defineEmits<{
	"update:selectedTags": [tags: Tag[]];
	tagChange: [tags: Tag[]];
	tagAdd: [tag: Tag];
	tagRemove: [tag: Tag];
}>();

// 响应式数据
const inputValue = ref("");
const showInput = ref(false);
const showAvailableTags = ref(false);
const showSuggestions = ref(false);
const tagList = ref<Tag[]>([]); // 可选标签列表
const loading = ref(false);

// 预设的常用标签
const defaultTags = [
	{ id: 1, name: "咖啡" },
	{ id: 2, name: "奶茶" },
	{ id: 3, name: "果汁" },
	{ id: 4, name: "甜品" },
	{ id: 5, name: "小吃" },
	{ id: 6, name: "主食" },
	{ id: 7, name: "饮料" },
	{ id: 8, name: "酒水" },
	{ id: 9, name: "零食" },
	{ id: 10, name: "水果" },
	{ id: 11, name: "烧烤" },
	{ id: 12, name: "火锅" },
	{ id: 13, name: "快餐" },
	{ id: 14, name: "西餐" },
	{ id: 15, name: "中餐" },
	{ id: 16, name: "日料" },
	{ id: 17, name: "韩料" },
	{ id: 18, name: "川菜" },
	{ id: 19, name: "粤菜" },
	{ id: 20, name: "湘菜" },
];

// 获取标签数据
const fetchTagData = async () => {
	loading.value = true;
	try {
		// 如果有店铺ID，尝试从店铺配置获取标签
		if (props.shopId) {
			// 这里可以调用获取店铺配置的接口
			// const res = await getShopConfig({ shopId: props.shopId });
			// if (res.data?.tags) {
			//   tagList.value = res.data.tags;
			// }
		}

		// 如果没有获取到数据，使用默认标签
		if (tagList.value.length === 0) {
			tagList.value = [...defaultTags];
		}
	} catch (error) {
		console.error("获取标签数据失败:", error);
		// 出错时使用默认标签
		tagList.value = [...defaultTags];
	} finally {
		loading.value = false;
	}
};

// 计算属性
const availableTags = computed(() => {
	const selectedIds = props.selectedTags.map((tag) => tag.id);
	return tagList.value.filter((tag) => !selectedIds.includes(tag.id));
});

const filteredTags = computed(() => {
	if (!inputValue.value.trim()) return [];
	const keyword = inputValue.value.toLowerCase();
	return availableTags.value.filter((tag) =>
		tag.name.toLowerCase().includes(keyword)
	);
});

// 方法
const handleInputFocus = () => {
	showInput.value = true;
	showAvailableTags.value = true;
	showSuggestions.value = false;
};

const handleInputBlur = () => {
	setTimeout(() => {
		showInput.value = false;
		showAvailableTags.value = false;
		showSuggestions.value = false;
	}, 200);
};

const selectTag = (tag: Tag) => {
	if (props.selectedTags.length >= props.maxTags) {
		uni.showToast({
			title: `最多只能选择${props.maxTags}个标签`,
			icon: "none",
		});
		return;
	}

	const newSelectedTags = [...props.selectedTags, tag];
	emit("update:selectedTags", newSelectedTags);
	emit("tagChange", newSelectedTags);
	emit("tagAdd", tag);

	inputValue.value = "";
	showSuggestions.value = false;
};

const addCustomTag = () => {
	if (!props.allowCustom) {
		uni.showToast({
			title: "不允许自定义输入",
			icon: "none",
		});
		return;
	}

	const tagName = inputValue.value.trim();
	if (!tagName) return;

	if (props.selectedTags.length >= props.maxTags) {
		uni.showToast({
			title: `最多只能选择${props.maxTags}个标签`,
			icon: "none",
		});
		return;
	}

	// 检查是否已存在相同名称的标签
	const existingTag = props.selectedTags.find((tag) => tag.name === tagName);
	if (existingTag) {
		uni.showToast({
			title: "标签已存在",
			icon: "none",
		});
		return;
	}

	const newTag: Tag = {
		id: `custom_${Date.now()}`,
		name: tagName,
		isCustom: true,
	};

	const newSelectedTags = [...props.selectedTags, newTag];
	emit("update:selectedTags", newSelectedTags);
	emit("tagChange", newSelectedTags);
	emit("tagAdd", newTag);

	inputValue.value = "";
	showSuggestions.value = false;
};

const removeTag = (tag: Tag) => {
	const newSelectedTags = props.selectedTags.filter((t) => t.id !== tag.id);
	emit("update:selectedTags", newSelectedTags);
	emit("tagChange", newSelectedTags);
	emit("tagRemove", tag);
};

// 监听输入值变化，显示搜索建议
watch(inputValue, (newValue) => {
	if (newValue.trim() && availableTags.value.length > 0) {
		showSuggestions.value = true;
		showAvailableTags.value = false;
	} else {
		showSuggestions.value = false;
		showAvailableTags.value = true;
	}
});

// 组件挂载时获取数据
onMounted(() => {
	fetchTagData();
});
</script>

<style lang="scss" scoped>
.tag-selector {
	.loading-container {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40rpx;
		gap: 16rpx;

		.loading-text {
			font-size: 28rpx;
			color: var(--text-3);
		}
	}

	.selected-tags {
		margin-bottom: 20rpx;

		.tags-title {
			font-size: 28rpx;
			color: var(--text-2);
			margin-bottom: 12rpx;
			font-weight: 500;
		}

		.tags-container {
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;
		}
	}

	.tag-input-section {
		.tag-input-container {
			display: flex;
			align-items: center;
			gap: 12rpx;
			margin-bottom: 16rpx;

			.tag-input {
				flex: 1;
				background: var(--fill-2);
				border-radius: 8rpx;
				padding: 16rpx;
				font-size: 28rpx;
			}

			.add-btn {
				flex-shrink: 0;
				height: 64rpx;
				padding: 0 24rpx;
			}
		}
	}

	.available-tags,
	.search-suggestions {
		margin-top: 16rpx;

		.tags-title,
		.suggestions-title {
			font-size: 26rpx;
			color: var(--text-3);
			margin-bottom: 12rpx;
		}

		.tags-container,
		.suggestions-list {
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;
		}
	}

	.tag-item,
	.suggestion-item {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 12rpx 16rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		cursor: pointer;
		transition: all 0.3s ease;

		&.selected {
			background: var(--primary-6);
			color: #fff;

			&:active {
				transform: scale(0.95);
			}
		}

		&.available {
			background: var(--primary-1);
			color: var(--primary-6);
			border: 1px solid var(--primary-3);

			&:active {
				background: var(--primary-2);
				transform: scale(0.95);
			}
		}

		.tag-text {
			font-weight: 500;
		}
	}

	.suggestion-item {
		background: var(--fill-2);
		color: var(--text-2);
		border: 1px solid var(--border-1);

		&:active {
			background: var(--fill-3);
			transform: scale(0.95);
		}

		.suggestion-text {
			font-weight: 400;
		}
	}
}
</style>
