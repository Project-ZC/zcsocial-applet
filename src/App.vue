<script setup lang="ts">
import { onHide, onLaunch, onShow } from "@dcloudio/uni-app";
import { useUserStore } from "@/stores/index";
import { setOnAuthErrorCallback } from "@/utils/http";
// import { uniCache } from "@/utils/storage";

const userStore = useUserStore();

// 全局仅触发一次-- 可获取 shareTicket（转发群信息）， 扫描进入等
onLaunch((options) => {
// console.log('App 初始化完成', options);
uni.hideTabBar(); // 隐藏tabbar 自定义tabbar pages.json 中配置tabbar 注释 不能调用uni.switchTab
	if (!userStore.userInfo?.token) {
	  userStore.login();
	}
	// 设置登录过期错误处理回调
	setOnAuthErrorCallback(async (error) => {
		console.log("登录过期，尝试重新登录:", error);
		await userStore.login();
	});
});
// 页面级 onShow 不接收路径参数， 获取页面参数应使用 onLoad(options)
onShow(() => {
	console.log("App Show");
});
onHide(() => {
	console.log("App Hide");
});
</script>

<style lang="scss">
/* 每个页面公共css */
@import "uview-plus/index.scss";
@import "@/static/styles/common.scss";
</style>
