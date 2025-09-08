<template>
	<view class="vertical-tabs">
		<view class="tabs-container">
			<!-- 标签栏 -->
			<view class="tabs-bar">
				<slot name="tabs"></slot>
				<view
					v-for="(tab, index) in tabs"
					:key="index"
					class="tab-item"
					@longpress="handleTabLongpress(index, tab)"
					:class="{
						'tab-item--active': activeIndex === index,
						'tab-item--disabled': tab.disabled,
					}"
					@click="handleTabClick(index, tab)"
				>
					<view class="tab-content">
						<!-- 图标 -->
						<view v-if="tab.icon" class="tab-icon">
							<image
								v-if="tab.iconType === 'image'"
								:src="tab.icon"
								class="icon-image"
							/>
							<text v-else class="icon-text">{{ tab.icon }}</text>
						</view>

						<!-- 标签文本 -->
						<text class="tab-text">{{ tab.title }}</text>

						<!-- 徽章 -->
						<view v-if="tab.badge" class="tab-badge">
							<text class="badge-text">{{ tab.badge }}</text>
						</view>
					</view>

					<!-- 激活指示器 -->
					<view v-if="activeIndex === index" class="tab-indicator"></view>
				</view>
			</view>

			<!-- 内容区域 -->
			<scroll-view
				scroll-y
				scroll-with-animation
				class="tabs-content"
				:scroll-into-view="scrollIntoViewId"
				@scroll="handleScroll"
				@touchmove.stop.prevent
			>
				<slot name="content"></slot>

				<!-- <view
					class="content-item"
					v-for="(tab, index) in tabs"
					:id="`sec-${index}`"
					:key="index"
					:class="{ 'content-item--active': activeIndex === index }"
				>
					{{ tab.title }}1234234
				</view> -->
			</scroll-view>
		</view>
	</view>
</template>

<script setup lang="ts">
// @ts-nocheck
/* eslint-disable */
import {
	ref,
	watch,
	nextTick,
	onMounted,
	getCurrentInstance,
	toRefs,
} from "vue";

// 定义标签项接口
interface TabItem {
	title: string;
	content?: string;
	icon?: string;
	iconType?: "text" | "image";
	badge?: string | number;
	disabled?: boolean;
	[key: string]: any;
}

// 定义组件属性
interface Props {
	tabs: TabItem[];
	modelValue?: number | string;
	activeColor?: string;
	inactiveColor?: string;
	height?: string;
	width?: string;
}

// 定义组件事件
interface Emits {
	(e: "update:modelValue", value: any): void;
	(e: "change", value: { index: number; tab: TabItem }): void;
	(e: "click", value: { index: number; tab: TabItem }): void;
	(e: "longpress", value: { index: number; tab: TabItem }): void;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: "",
	activeColor: "var(--text-1)", // 文字颜色
	inactiveColor: "var(--text-2)", // 文字颜色
	indicatorColor: "var(--primary-6)",
	height: "100%",
	width: "100%",
});

const emit = defineEmits<Emits>();

// 将 props 字段暴露为同名顶层变量，供模板与样式 v-bind 使用
const { tabs, activeColor, inactiveColor, indicatorColor, height, width } =
	toRefs(props);

// 当前激活的标签索引
const activeIndex = ref(props.modelValue);

// 滚动联动：容器滚动到指定分组、根据滚动更新高亮
const scrollIntoViewId = ref<string>("");
const sectionTops = ref<number[]>([]);
const isClickScrolling = ref(false);
// 如有吸顶头部，请在这里设置偏移高度
const headerOffset = 0;

const measureSections = async () => {
	await nextTick();
	const instance = getCurrentInstance();
	if (!instance) return;
	const q = uni.createSelectorQuery().in(instance);
	q.select(".tabs-content").boundingClientRect();
	q.selectAll(".tabs-content .content-item").boundingClientRect();
	q.exec((res: any[]) => {
		const containerRect = res?.[0];
		const itemRects = res?.[1] || [];
		if (!containerRect || !itemRects.length) {
			sectionTops.value = [];
			return;
		}
		const baseTop = containerRect.top;
		sectionTops.value = itemRects.map((r: any) => Math.max(0, r.top - baseTop));
	});
};

// tabs 变化时重新测量
watch(
	() => props.tabs,
	() => {
		measureSections();
	},
	{ deep: true }
);

// 监听外部传入的modelValue变化
watch(
	() => props.modelValue,
	(newValue) => {
		activeIndex.value = newValue;
		// 外部变更时，滚动到对应分组
		if (typeof newValue === "number" && newValue >= 0) {
			isClickScrolling.value = true;
			scrollIntoViewId.value = `sec-${newValue}`;

			console.log(scrollIntoViewId.value, 1234);
			setTimeout(() => {
				isClickScrolling.value = false;
			}, 300);
		}
	}
);

// 处理标签点击
const handleTabClick = async (index: number, tab: TabItem) => {
	if (tab.disabled) return;
	console.log(index, tab);

	activeIndex.value = index;
	emit("update:modelValue", index);
	emit("change", { index, tab });
	emit("click", { index, tab });

	// 左侧点击后滚动到对应分组
	isClickScrolling.value = true;
	// 先清空再设置，避免同值不触发滚动
	await nextTick();
	scrollIntoViewId.value = `sec-${index}`;
	setTimeout(() => {
		isClickScrolling.value = false;
	}, 300);
};

const handleTabLongpress = (index: number, tab: TabItem) => {
	emit("longpress", { index, tab });
};

// 根据滚动位置联动左侧高亮
let lastActive: any = -1;
const handleScroll = (e: any) => {
	console.log(e, 111, isClickScrolling.value, sectionTops.value.length);
	if (isClickScrolling.value || sectionTops.value.length === 0) return;
	const y = (e?.detail?.scrollTop || 0) + headerOffset + 1;
	let idx = 0;
	for (let i = 0; i < sectionTops.value.length; i++) {
		if (y >= sectionTops.value[i]) idx = i;
		else break;
	}

	console.log(lastActive, 111);
	if (idx !== lastActive) {
		lastActive = idx;
		activeIndex.value = idx;
		emit("update:modelValue", idx);
		emit("change", { index: idx, tab: props.tabs[idx] });
	}
};

onMounted(() => {
	measureSections();
});

defineOptions({
	options: {
		styleIsolation: "shared",
	},
});
</script>

<style lang="scss" scoped>
.vertical-tabs {
	width: v-bind(width);
	height: v-bind(height);

	.tabs-container {
		display: flex;
		height: 100%;

		.tabs-bar {
			width: 160rpx;
			border-right: 1rpx solid var(--border-1);
			overflow-y: auto;
			/* 防止H5向父级滚动穿透 */
			overflow: auto;
			overscroll-behavior: contain;
			touch-action: pan-y;

			.tab-item {
				position: relative;
				padding: 30rpx 20rpx;
				cursor: pointer;
				transition: all 0.3s ease;
				border-bottom: 1rpx solid var(--border-1);

				&:last-child {
					border-bottom: none;
				}

				&:hover {
					background-color: #f0f0f0;
				}

				&--active {
					background-color: var(--primary-6);
					color: v-bind(activeColor);

					.tab-text {
						color: v-bind(activeColor);
						font-weight: 600;
					}

					.tab-icon {
						color: v-bind(activeColor);
					}
				}

				&--disabled {
					opacity: 0.5;
					cursor: not-allowed;

					&:hover {
						background-color: transparent;
					}
				}

				.tab-content {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 10rpx;

					.tab-icon {
						font-size: 32rpx;
						color: v-bind(inactiveColor);

						.icon-image {
							width: 32rpx;
							height: 32rpx;
						}

						.icon-text {
							font-size: 32rpx;
						}
					}

					.tab-text {
						font-size: 28rpx;
						color: v-bind(inactiveColor);
						text-align: center;
						line-height: 1.4;
					}

					.tab-badge {
						position: absolute;
						top: 5rpx;
						right: 5rpx;
						background-color: #ff4757;
						border-radius: 20rpx;
						min-width: 32rpx;
						height: 32rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						padding: 0 8rpx;

						.badge-text {
							color: #ffffff;
							font-size: 20rpx;
							font-weight: 600;
						}
					}
				}

				.tab-indicator {
					position: absolute;
					right: 0;
					top: 50%;
					transform: translateY(-50%);
					width: 6rpx;
					height: 60rpx;
					background-color: v-bind(indicatorColor);
					border-radius: 3rpx 0 0 3rpx;
				}
			}
		}

		.tabs-content {
			flex: 1;
			overflow-y: auto;
			.content-item {
				height: 100%;
				padding: 30rpx;

				&--active {
					display: block;
				}
			}
		}
	}
}
</style>
