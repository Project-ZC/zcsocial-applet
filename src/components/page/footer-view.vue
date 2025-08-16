<template>
	<view :style="{ paddingBottom: paddingBottomValue }" class="footer">
		<!-- 使用 slot 允许外部内容的插入 -->
		<slot></slot>
	</view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
const paddingBottomValue = ref('0px')

onMounted(() => {
	const systemInfo = uni.getSystemInfoSync();
	const bottomSafeArea = systemInfo.safeAreaInsets ? systemInfo.safeAreaInsets.bottom : 0;
	paddingBottomValue.value = bottomSafeArea + 'px'; // 设置底部安全区域的填充
})
</script>

<style scoped lang="scss">
.footer {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #fff;
	text-align: center;
	box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
	z-index: 9;
}
</style>