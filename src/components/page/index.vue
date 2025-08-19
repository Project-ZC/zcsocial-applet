<template>
	<view
		class="page-wrapper"
		theme="LightBlue"
		:class="{ 'show-tabbar': showTabbar }"
		:style="{ paddingBottom: paddingBottomValue }"
	>
		<!-- <view class="page-wrapper-header" :style="{
      position: currentPage === 'index' ? 'unset' : 'sticky',
      backgroundColor: ['index', 'login'].includes(currentPage) ? 'transparent' : '#fff',
    }">
      <slot name="header"></slot>
    </view> -->

		<view class="content-area">
			<slot></slot>
		</view>

		<tabbar v-if="showTabbar" />
		<footer-view
			v-if="showFooter"
			:style="{ paddingBottom: paddingBottomValue }"
		>
			<slot name="footer"></slot>
		</footer-view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import footerView from "./footer-view.vue";
import tabbar from "./tabbar.vue";

defineOptions({
	name: "PageWrapper",
});
// 定义 props
const props = defineProps<{
	title: string;
	footerShow: boolean;
	showTabbar: boolean;
}>();

// 定义数据
const paddingBottomValue = ref("0px");
const showBackButton = ref(false);
const currentPage = ref("");

// 生命周期钩子
onMounted(() => {
	const pages = getCurrentPages();
	const current = pages[pages.length - 1];
	// 修正：使用可选链操作符来避免属性不存在的错误
	showBackButton.value = !(current as any).isTabBarPage;
	const currentPageInstance = pages[pages.length - 1];
	currentPage.value = currentPageInstance.route.split("/").pop() || "";

	const systemInfo = uni.getSystemInfoSync();
	const bottomSafeArea = systemInfo.safeAreaInsets
		? systemInfo.safeAreaInsets.bottom
		: 0;
	paddingBottomValue.value = bottomSafeArea + "px"; // 设置底部安全区域的填充

	if (props.showTabbar) {
		paddingBottomValue.value = bottomSafeArea + 58 + "px"; // 设置底部安全区域的填充
	} else {
		paddingBottomValue.value = bottomSafeArea + "px"; // 设置底部安全区域的填充
	}
});

// 使用 props 中的值
const showFooter = computed(() => props.footerShow);
</script>

<style scoped lang="scss">
@import "@/uni.scss";
$header-h: 100rpx;
.page-wrapper {
	position: relative;
	width: 100%;
	height: 100%;
	min-height: 100vh;
	font-size: $up-font-base;
	display: flex;
	flex-direction: column;
	background-color: $u-bg-1;
	&-header {
		position: sticky;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 999;
		height: $header-h;
	}
}

// .show-tabbar{
//   padding-bottom: $up-tabbar-h + paddingBottomValue;
// }

.content-area {
	font-size: $up-font-base;
	flex: 1;
}
</style>
