<script setup lang="ts">
import { onHide, onLaunch, onShow } from "@dcloudio/uni-app";
import { useUserStore, useShopStore } from "@/stores/index";
import { setOnAuthErrorCallback, notifyLoginSuccess } from "@/utils/http";
import { startLogin, isCurrentlyLoggingIn } from "@/utils/auth-manager";
// import { uniCache } from "@/utils/storage";
import { PAGE_LIST } from "@/consts/page";
import { autoLogin } from "@/consts/auth";

const userStore = useUserStore();
const shopStore = useShopStore();

// 初始化进来，登陆-获取店铺状态
const init = async () => {
	return new Promise(async (resolve, reject) => {
		try {
			const res = await userStore.login();
			shopStore.GetShopStatus();
			await shopStore.GetMyShopList();
			uni.reLaunch({
				url: PAGE_LIST.INDEX,
			});
			resolve(res);
		} catch (error) {
			reject(error);
		}
	});
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
	//   if (!userStore.userInfo?.token) {
	//     init();
	//   }
	// 设置登录过期错误处理回调
	autoLogin && setOnAuthErrorCallback(handleAuthError);
	// 小程序版本更新检测与应用
	// 仅在微信小程序端有效
	// 使用方式：检测到新版本 -> 弹窗提示 -> 用户确认后重启应用以应用新版本
	// 参考：https://developers.weixin.qq.com/miniprogram/dev/api/base/update/wx.getUpdateManager.html
	// #ifdef MP-WEIXIN
	try {
		const updateManager = wx.getUpdateManager();
		// 检查是否有新版本
		updateManager.onCheckForUpdate((res) => {
			// res.hasUpdate 为 true 表示有新版本
			if (res.hasUpdate) {
				// 下载完成后回调
				updateManager.onUpdateReady(() => {
					uni.showModal({
						title: "更新提示",
						content: "有新版本可用，是否立即重启并更新？",
						confirmText: "立即更新",
						cancelText: "稍后",
						success: (mres) => {
							if (mres.confirm) {
								// 应用新版本并重启
								updateManager.applyUpdate();
							}
						},
					});
				});

				// 新版本下载失败
				updateManager.onUpdateFailed(() => {
					uni.showModal({
						title: "更新失败",
						content: "新版本下载失败，请稍后重试或重新进入小程序。",
						showCancel: false,
						confirmText: "知道了",
					});
				});
			}
		});
	} catch (e) {
		console.log("版本更新检测初始化失败：", e);
	}
	// #endif
});
// 页面级 onShow 不接收路径参数， 获取页面参数应使用 onLoad(options)
onShow(() => {
	if (shopStore.shopStatus.length == 0) {
		shopStore.GetShopStatus();
	}
	// shopStore.GetMyShopList();
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
