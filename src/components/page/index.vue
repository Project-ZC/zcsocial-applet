<template>
	<view
		class="page-wrapper"
		theme="LightBlue"
		:style="{ paddingBottom: paddingBottomValue + 'px' }"
	>
		<!-- <view class="page-wrapper-header" :style="{
      position: currentPage === 'index' ? 'unset' : 'sticky',
      backgroundColor: ['index', 'login'].includes(currentPage) ? 'transparent' : '#fff',
    }">
      <slot name="header"></slot>
    </view> -->
		<scroll-view
			class="content-area"
			:scroll-y="true"
			:scroll-into-view="scrollIntoViewId"
		>
			<slot></slot>
			<view id="page-bottom-anchor" style="height: 1px"></view>
		</scroll-view>

		<tabbar v-if="showTabbar" />

		<footer-view v-if="showFooter">
			<slot name="footer"></slot>
		</footer-view>
	</view>
</template>

<script setup lang="ts">
// @ts-nocheck
/* eslint-disable */
import footerView from "./footer-view.vue";
import { ref, onMounted, onUnmounted } from "vue";
import tabbar from "./tabbar.vue";

defineOptions({
	name: "PageWrapper",
});
// 定义 props
const props = defineProps<{
	title: string;
	showFooter: boolean;
	showTabbar: boolean;
}>();

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
		const footerH = 80;
		paddingBottomValue.value = bottomSafeArea + footerH; // 设置底部安全区域的填充
	} else {
		paddingBottomValue.value = bottomSafeArea; // 设置底部安全区域的填充
	}
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
	uni.onKeyboardHeightChange((res) => {
		console.log(res);

		if (res.height > 0) {
			console.log("键盘弹起", res.height, paddingBottomValue.value);
			paddingBottomValue.value = paddingBottomValue.value + res.height;
			console.log("键盘收起", res.height);
			setTimeout(() => {
				// 将滚动条滚动到底部
				scrollIntoViewId.value = "page-bottom-anchor";
			}, 100);
		} else {
			systemInfo();
			// 重置，避免后续进入页面仍然自动滚动
			scrollIntoViewId.value = "";
		}
	});
});
onUnmounted(() => {
	// 页面卸载时移除监听器，避免内存泄漏
	uni.offKeyboardHeightChange();
});

// 使用 props 中的值
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
	overflow: hidden;
}
</style>
