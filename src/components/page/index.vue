<template>
	<!-- <scroll-view :scroll-y="true" show-scrollbar="true" :scroll-into-view="scrollIntoViewId"> -->
	<view
		class="page-wrapper"
		theme="LightBlue"
		:style="{ paddingBottom: bottom + 'px' }"
	>
		<!-- <view class="page-wrapper-header" :style="{
      position: currentPage === 'index' ? 'unset' : 'sticky',
      backgroundColor: ['index', 'login'].includes(currentPage) ? 'transparent' : '#fff',
    }">
      <slot name="header"></slot>
    </view> -->
		<view class="content-area">
			<slot></slot>
			<view id="page-bottom-anchor" style="height: 1px"></view>
		</view>

		<tabbar v-if="showTabbar" />

		<footer-view v-if="showFooter" :footerH="props.footerH">
			<slot name="footer"></slot>
		</footer-view>
	</view>
	<!-- </scroll-view> -->
</template>

<script setup lang="ts">
// @ts-nocheck
/* eslint-disable */
import footerView from "./footer-view.vue";
import { ref, onMounted, onUnmounted, computed } from "vue";
import tabbar from "./tabbar.vue";

defineOptions({
	name: "PageWrapper",
});
// 定义 props
const props = defineProps({
	title: {
		type: String,
		default: "",
	},
	showFooter: {
		type: Boolean,
		default: false,
	},
	showTabbar: {
		type: Boolean,
		default: false,
	},
	footerH: {
		type: Number,
		default: 80,
	},
	scrollTop: {
		type: Number,
		default: 0,
	},
	safeArea: {
		type: [Number, String],
		default: "",
	},
});

const bottom = computed(() => {
	return props.safeArea === "" ? paddingBottomValue.value : props.safeArea;
});

// 定义数据
const paddingBottomValue = ref(0);
const showBackButton = ref(false);
const currentPage = ref("");
const scrollIntoViewId = ref<string>("");

const systemInfo = () => {
	const systemInfo = uni.getSystemInfoSync();
	const bottomSafeArea = systemInfo.safeAreaInsets
		? systemInfo.safeAreaInsets.bottom
		: 0;

	if (props.showTabbar) {
		const tabbarH = 50;
		paddingBottomValue.value = bottomSafeArea + tabbarH; // 设置底部安全区域的填充
	} else if (props.showFooter) {
		paddingBottomValue.value = bottomSafeArea + props.footerH; // 设置底部安全区域的填充
	} else {
		paddingBottomValue.value = bottomSafeArea; // 设置底部安全区域的填充
	}
};

// 滚动到底部
const scrollToBottom = (scrollTop) => {
	// 获取当前滚动位置
	const query = uni.createSelectorQuery();
	query
		.select(".page-wrapper")
		.scrollOffset((res) => {
			if (res) {
				const currentScrollTop = res.scrollTop;
				const maxScrollTop = 9999;

				// 只有在不在底部时才滚动
				if (currentScrollTop < maxScrollTop - scrollTop) {
					uni.pageScrollTo({
						scrollTop: maxScrollTop,
						duration: 0,
					});
				}
			}
		})
		.exec();
};

const setScrollIntoViewId = ({ id = "", scrollTop = 0 }) => {
	scrollTop = scrollTop || props.scrollTop;
	if (scrollTop <= 0) {
		return;
	}
	if (id) {
		paddingBottomValue.value += scrollTop;
		const systemInfo = uni.getSystemInfoSync();
		const windowHeight = systemInfo.windowHeight;
		const screenHeight = systemInfo.screenHeight;
		const scrollableHeight = screenHeight - windowHeight;
		setTimeout(() => {
			if (scrollableHeight < scrollableHeight + scrollTop) {
				uni.pageScrollTo({
					scrollTop: 9999,
					duration: 0,
				});
			}
			// scrollToBottom(scrollTop);
		}, 0);
	} else {
		systemInfo();
	}
	scrollIntoViewId.value = id;
};
// 生命周期钩子
onMounted(() => {
	const pages = getCurrentPages();
	const current = pages[pages.length - 1];
	// 修正：使用可选链操作符来避免属性不存在的错误
	showBackButton.value = !(current as any).isTabBarPage;
	const currentPageInstance = pages[pages.length - 1];
	currentPage.value = currentPageInstance.route.split("/").pop() || "";
	systemInfo();
	if (props.scrollTop > 0) {
		uni.onKeyboardHeightChange((res) => {
			// console.log('键盘收起', res);
			if (res.height > 0) {
				// console.log('键盘弹起', res.height, paddingBottomValue.value);
				// 将滚动条滚动到底部
				setScrollIntoViewId({
					id: "page-bottom-anchor",
					scrollTop: props.scrollTop,
				});
			} else {
				// 重置，避免后续进入页面仍然自动滚动
				setScrollIntoViewId({ id: "" });
			}
		});
	}
});
onUnmounted(() => {
	// 页面卸载时移除监听器，避免内存泄漏
	uni.offKeyboardHeightChange();
});

defineExpose({
	paddingBottomValue,
	setScrollIntoViewId,
});
</script>

<style scoped lang="scss">
@import "@/uni.scss";
$header-h: 100rpx;
.page-wrapper {
	position: relative;
	width: 100%;
	height: 100%;
	// min-height: 100vh;
	font-size: $up-font-base;
	display: flex;
	flex-direction: column;
	background-color: var(--bg-1);
	color: var(--text-1);

	&-header {
		position: sticky;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 999;
		height: $header-h;
	}
}

.content-area {
	font-size: $up-font-base;
	flex: 1;
	height: 100%;
}
</style>
