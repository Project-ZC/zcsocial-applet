<script setup lang="ts">
import { onHide, onLaunch, onShow } from "@dcloudio/uni-app";
import { useUserStore, useShopStore } from "@/stores/index";
import { setOnAuthErrorCallback, notifyLoginSuccess } from "@/utils/http";
import { startLogin, isCurrentlyLoggingIn } from "@/utils/auth-manager";
// import { uniCache } from "@/utils/storage";

const userStore = useUserStore();
const shopStore = useShopStore();

// 初始化进来，登陆-获取店铺状态
const init = async () => {
	try {
		const res = await userStore.login();
		shopStore.GetShopStatus();
		shopStore.GetMyShopList();
		uni.switchTab({
			url: "/pages/index/index",
		});
		return res;
	} catch (error) {
		console.error("初始化失败:", error);
	}
};

// 处理登录过期的函数
const handleAuthError = async (error: any) => {
	console.log("登录过期，尝试重新登录:", error);

	// 检查是否已经在登录中，避免重复登录
	if (isCurrentlyLoggingIn()) {
		console.log("正在登录中，跳过重复登录");
		return;
	}

	try {
		// 使用登录状态管理器进行登录
		await startLogin(async () => {
			// const result = await userStore.login();
			const result = await init();

			// 登录成功后，通知http模块
			notifyLoginSuccess();

			console.log("重新登录成功");
			return result;
		});
	} catch (loginError) {}
};

// 全局仅触发一次-- 可获取 shareTicket（转发群信息）， 扫描进入等
onLaunch((options) => {
	console.log("App 初始化完成", options);
	uni.hideTabBar(); // 隐藏tabbar 自定义tabbar pages.json 中配置tabbar 注释 不能调用uni.switchTab
	if (!userStore.userInfo?.token) {
		init();
	}
	// 设置登录过期错误处理回调
	setOnAuthErrorCallback(handleAuthError);
});
// 页面级 onShow 不接收路径参数， 获取页面参数应使用 onLoad(options)
onShow(() => {
	if (shopStore.shopStatus.length == 0) {
		shopStore.GetShopStatus();
	}
	shopStore.GetMyShopList();
	console.log("App Show");
});
onHide(() => {
	console.log("App Hide");
});
</script>

<style lang="scss">
/* 每个页面公共css */
@import "@/static/font/font.css";
@import "uview-plus/index.scss";
@import "@/static/styles/common.scss";
</style>
