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
						<text class="tab-text">{{ tab.name }}</text>

						<!-- 徽章 -->
						<view v-if="tab.badge" class="tab-badge">
							<text class="badge-text">{{ tab.badge }}</text>
						</view>
					</view>

					<!-- 激活指示器 -->
					<view v-if="activeIndex === index" class="tab-indicator"></view>
				</view>
			</view>

			<view
				class="main-content"
				:class="{ 'main-content--diy': currentMainType === 'diy' }"
			>
				<slot name="content"></slot>

				<!-- 内容区域 -->
				<scroll-view
					scroll-y
					scroll-with-animation="true"
					class="tabs-content"
					:scroll-into-view="scrollIntoViewId"
					@scroll="handleScroll"
					v-if="tabs.length > 0"
				>
					<up-swipe-action>
						<view
							v-for="(i, idx) in tabs"
							:key="i.id || idx"
							class="good-card content-item"
							:id="`sec-${idx}`"
						>
							<view class="good-card-title">
								<text>{{ i.name }}</text>
								<view
									class="man-action-btns"
									v-if="activeIndex === idx && props.isEdit"
								>
									<view class="edit-btn" @click="editCurrentCategory">
										<up-icon name="edit-pen" size="36"></up-icon>
									</view>
									<view class="delete-btn" @click="deleteCurrentCategory">
										<up-icon name="trash" size="36"></up-icon>
									</view>
								</view>
							</view>
							<view v-if="i.children?.length > 0" class="good-list">
								<up-swipe-action-item
									@click="handleSwipeClick(child, index)"
									v-for="(child, index) in i.children"
									:key="child.id || index"
									:options="options1"
									:disabled="!props.isEdit"
									v-model:show="child.showSwipe"
								>
									<view class="good-wrap">
										<good-card :goodItem="child" :index="index">
											<template #actions="{ item, index }">
												<slot name="actions" :item="item" :index="index"></slot>

												<view class="action-btn" v-if="props.showActionBtn">
													<up-button
														type="primary"
														size="small"
														shape="circle"
														@click="openAddToCart(item)"
														>加入购物车</up-button
													>
												</view>
											</template>
										</good-card>
									</view>
								</up-swipe-action-item>
							</view>

							<emptyData
								v-else
								:text="props.isEdit ? '当前细分类还没有商品' : '暂无商品'"
							>
								<template #subtext v-if="props.isEdit">
									<text @click="openAddDrinkModal">请点击添加商品</text>
								</template>
							</emptyData>
						</view>
					</up-swipe-action>
				</scroll-view>

				<emptyData
					v-else
					:text="props.isEdit ? '当前暂无细分类' : '暂无商品'"
					subtext=""
				>
					<template #subtext v-if="props.isEdit">
						<text @click="openAddCategoryModal">请点击添加细分类</text>
					</template>
				</emptyData>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import goodCard from "@/components/good-card/index.vue";
import {
	ref,
	watch,
	nextTick,
	onMounted,
	getCurrentInstance,
	toRefs,
	reactive,
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
	indicatorColor?: string;
	backgroundColor?: string;
	height?: string;
	width?: string;
	currentMainType?: string;
	isEdit?: boolean;
	showActionBtn?: boolean;
}

// 定义组件事件
interface Emits {
	(e: "update:modelValue", value: any): void;
	(e: "change", value: { index: number; tab: TabItem }): void;
	(e: "click", value: { index: number; tab: TabItem }): void;
	(e: "longpress", value: { index: number; tab: TabItem }): void;
	(e: "editCurrentCategory", value: { index: number; tab: TabItem }): void;
	(e: "deleteCurrentCategory", value: { index: number; tab: TabItem }): void;
	(e: "openAddCategoryModal", value: { index: number; tab: TabItem }): void;
	(e: "openAddDrinkModal", value: { index: number; tab: TabItem }): void;
	(e: "swipeClick", value: { index: number; child: any }): void;
	(e: "openAddToCart", value: any): void;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: "",
	activeColor: "#007aff",
	inactiveColor: "#666666",
	indicatorColor: "#007aff",
	backgroundColor: "#ffffff",
	height: "100%",
	width: "100%",
	currentMainType: "",
	isEdit: true,
	showActionBtn: false,
});

const emit = defineEmits<Emits>();

const options1 = reactive([
	{
		text: "删除",
		style: {
			backgroundColor: "#f56c6c",
		},
	},
]);

// 将 props 字段暴露为同名顶层变量，供模板与样式 v-bind 使用
const {
	tabs,
	activeColor,
	inactiveColor,
	indicatorColor,
	backgroundColor,
	height,
	width,
	currentMainType,
} = toRefs(props);
// 仅在 setup 时获取并缓存组件代理，避免异步场景下 getCurrentInstance() 为空
const proxy = (getCurrentInstance()?.proxy || null) as any;

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
	if (!proxy) return;
	const q = uni.createSelectorQuery().in(proxy);
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
			setTimeout(() => {
				isClickScrolling.value = false;
			}, 300);
		}
	}
);

// 处理标签点击
const handleTabClick = async (index: number, tab: TabItem) => {
	if (tab.disabled) return;

	activeIndex.value = index;
	emit("update:modelValue", index);
	emit("change", { index, tab });
	emit("click", { index, tab });

	// 左侧点击后滚动到对应分组
	isClickScrolling.value = true;
	// 先清空再设置，避免同值不触发滚动
	//   await nextTick();
	scrollIntoViewId.value = `sec-${index}`;
	setTimeout(() => {
		isClickScrolling.value = false;
	}, 100);
};

const handleTabLongpress = (index: number, tab: TabItem) => {
	emit("longpress", { index, tab });
};

// 根据滚动位置联动左侧高亮
let lastActive: any = -1;
const handleScroll = (e: any) => {
	if (isClickScrolling.value || sectionTops.value.length === 0) return;
	const y = (e?.detail?.scrollTop || 0) + headerOffset + 1;

	let idx = 0;
	for (let i = 0; i < sectionTops.value.length; i++) {
		if (y >= sectionTops.value[i]) idx = i;
		else break;
	}
	if (idx !== lastActive) {
		lastActive = idx;
		activeIndex.value = idx;
		// emit('update:modelValue', idx);
		emit("change", { index: idx, tab: props.tabs[idx] });
	}
};

const editCurrentCategory = () => {
	emit("editCurrentCategory", {
		index: activeIndex.value,
		tab: props.tabs[activeIndex.value],
	});
};

const deleteCurrentCategory = () => {
	emit("deleteCurrentCategory", {
		index: activeIndex.value,
		tab: props.tabs[activeIndex.value],
	});
};

const openAddDrinkModal = () => {
	emit("openAddDrinkModal", {
		index: activeIndex.value,
		tab: props.tabs[activeIndex.value],
	});
};
const openAddCategoryModal = () => {
	emit("openAddCategoryModal", {
		index: activeIndex.value,
		tab: props.tabs[activeIndex.value],
	});
};

const openAddToCart = (item: any) => {
	emit("openAddToCart", item);
};

const handleSwipeClick = (item: any, index: number) => {
	emit("swipeClick", item, index);
};

onMounted(() => {
	// 初次加载时延迟测量，确保DOM完全渲染
	measureSections();
});
defineOptions({
	options: {
		styleIsolation: "shared",
	},
});
</script>

<style lang="scss" scoped>
.good-card {
	padding: 20rpx;

	:deep(.action-btn) {
		margin-top: 10rpx;
		position: absolute;
		right: 16rpx;
		bottom: 16rpx;
	}

	:deep(.u-swipe-action-item__right) {
		top: 10rpx;
		bottom: 10rpx;
		right: 4rpx;
	}

	&-title {
		display: flex;
		align-items: center;
		font-size: $up-font-md;
		font-weight: 600;
		color: var(--text-1);
		margin-bottom: 20rpx;
		&::before {
			content: "";
			display: inline-block;
			width: 6rpx;
			height: 30rpx;
			background-color: var(--primary-6);
			margin-right: 10rpx;
		}
	}
}

.good-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.good-wrap {
	display: block;
}

:deep(.man-action-btns) {
	display: flex;
	align-items: center;
	.edit-btn,
	.delete-btn {
		width: 30rpx;
		height: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: 20rpx;
		font-size: 24rpx;
	}

	.edit-btn {
		.u-icon__icon {
			font-size: 50rpx !important;
			color: $u-primary !important;
		}
	}

	.delete-btn {
		.u-icon__icon {
			font-size: 50rpx !important;
			color: $u-error !important;
		}
	}
}

.vertical-tabs {
	width: v-bind(width);
	height: v-bind(height);
	background-color: v-bind(backgroundColor);

	.tabs-container {
		display: flex;
		height: 100%;

		.tabs-bar {
			width: 160rpx;
			background-color: var(--bg-1);
			border-right: 1rpx solid #e5e5e5;
			overflow-y: auto;

			.tab-item {
				position: relative;
				padding: 30rpx 20rpx;
				cursor: pointer;
				transition: all 0.3s ease;
				border-bottom: 1rpx solid #e5e5e5;

				&:last-child {
					border-bottom: none;
				}

				&:hover {
					background-color: #f0f0f0;
				}

				&--active {
					background-color: #ffffff;
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

		.main-content {
			flex: 1;
			&--diy {
				height: calc(100% - 134rpx) !important;
			}
		}
		.tabs-content {
			height: calc(100% - 120rpx);
			overflow-y: auto;
			.content-item {
				height: auto;

				&--active {
					display: block;
				}
			}
		}
	}
}

// 响应式设计
@media (max-width: 750rpx) {
	.vertical-tabs {
		.tabs-container {
			flex-direction: column;

			.tabs-bar {
				width: 100%;
				height: auto;
				max-height: 200rpx;
				border-right: none;
				border-bottom: 1rpx solid #e5e5e5;

				.tab-item {
					.tab-content {
						flex-direction: row;
						justify-content: center;
						gap: 20rpx;
					}

					.tab-indicator {
						right: auto;
						bottom: 0;
						top: auto;
						transform: none;
						width: 60rpx;
						height: 6rpx;
						border-radius: 3rpx 3rpx 0 0;
					}
				}
			}

			.tabs-content {
				height: calc(100% - 200rpx);
			}
		}
	}
}
</style>
