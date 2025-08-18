<script setup lang="ts">
import { onHide, onLaunch, onShow } from "@dcloudio/uni-app";
import { useUserStore } from "@/stores/index";
import { setOnAuthErrorCallback } from "@/utils/http";
import { uniCache } from "@/utils/storage";

const userStore = useUserStore();

const setupTabbar = () => {
	// uni.hideTabBar();
	// 定义所有可能的 tab
	const allTabs = [
		// {
		// 	"pagePath": "pages/index/index",
		// 	"text": "首页",
		// 	"iconPath": "static/images/tabbar/home.png",
		// 	"selectedIconPath": "static/images/tabbar/home-active.png"
		// },
		// {
		// 	"pagePath": "pages/message/message",
		// 	"text": "通知",
		// 	"iconPath": "static/images/tabbar/message.png",
		// 	"selectedIconPath": "static/images/tabbar/message-active.png"
		// },
		// {
		// 	"pagePath": "pages/shop/shop",
		// 	"text": "店铺",
		// 	"iconPath": "static/images/tabbar/my.png",
		// 	"selectedIconPath": "static/images/tabbar/my-active.png"
		// },
		// {
		// 	"pagePath": "pages/my/my",
		// 	"text": "我的",
		// 	"iconPath": "static/images/tabbar/my.png",
		// 	"selectedIconPath": "static/images/tabbar/my-active.png"
		// }
		{ text: "首页", iconPath: "static/images/tabbar/home.png" },
		{ text: "通知", iconPath: "static/images/tabbar/message.png" },
		{
			text: "店铺",
			iconPath: "static/images/tabbar/shop.png",
			needPerm: "shop",
		},
		{ text: "我的", iconPath: "static/images/tabbar/my.png" },
	];
	const user = uniCache.getItem("user");
	const permission = ["index", "message", "my"];
	if (user && permission.length > 0) {
		// 过滤有权限的 tab
		const visibleTabs = allTabs.filter(
			(tab) => !tab.needPerm || permission.includes(tab.needPerm)
		);
		// 动态设置 tabBar
		permission.forEach((item, index) => {
			uni.setTabBarItem({
				index,
				text: visibleTabs[index].text,
				iconPath: visibleTabs[index].iconPath,
				selectedIconPath: visibleTabs[index].iconPath.replace(
					".png",
					"-active.png"
				),
			});
		});
		// uni.setTabBarItem({
		// 	items: visibleTabs.map((tab, index) => ({
		// 		index,
		// 		text: tab.text,
		// 		iconPath: tab.iconPath,
		// 		selectedIconPath: tab.iconPath.replace(".png", "-active.png"),
		// 	})),
		// });
	}
};

onLaunch(() => {
	setupTabbar();
	// if (!userStore.userInfo?.token) {
	//   userStore.login();
	// }
	// 设置登录过期错误处理回调
	setOnAuthErrorCallback(async (error) => {
		console.log("登录过期，尝试重新登录:", error);
		await userStore.login();
	});
});

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
