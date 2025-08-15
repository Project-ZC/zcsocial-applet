import type { user } from "@/types/user";
import { defineStore } from "pinia";
import { ref } from "vue";
import { loginTo } from "@/utils/login";
import { uniCache } from "@/utils/storage";

export const useUserStore = defineStore(
	"user",
	() => {
		//存储用户的信息
		const userInfo = ref<user>({} as user);
		//用户购买方式 pick-up或者delivery
		let buyWay = ref("pick-up");

		//设置用户信息
		const setUserInfo = (data: any) => {
			userInfo.value = data;
		};
		//清理用户信息
		const clearUserInfo = () => {
			userInfo.value = {} as user;
		};
		//设置购买方式
		const setBuyWay = (data: string) => {
			buyWay.value = data;
		};
		const login = async (data = {}) => {
			// uni.login({
			// 	provider: "weixin",
			// 	success: async (loginRes) => {
			// 		// 处理登录成功
			// 		uni.showLoading({
			// 			title: "登录中...",
			// 		});
			// 		try {
			// 			const params = {
			// 				loginCode: loginRes.code,
			// 			};
			// 			const res = await toLogin(params);
			// 			// 使用Pinia store保存用户信息
			// 			setUserInfo({ ...res.data, ...data });
			// 			// uni.setStorageSync("userInfo", res);
			// 			uni.reLaunch({
			// 				url: "/pages/index/index",
			// 			});
			// 		} catch (error: any) {
			// 			console.log(error);
			// 			// if (error.code === 1004) {
			// 			// 	// 用户不存在，尝试注册
			// 			// 	try {
			// 			// 		const registerRes = await register({
			// 			// 			loginCode: loginRes.code,
			// 			// 			...data
			// 			// 		});
			// 			// 		setUserInfo({ ...registerRes.data, ...data });
			// 			// 		uni.reLaunch({
			// 			// 			url: "/pages/index/index",
			// 			// 		});
			// 			// 	} catch (registerError) {
			// 			// 		console.log("注册失败:", registerError);
			// 			// 		uni.showToast({
			// 			// 			title: "注册失败，请重试",
			// 			// 			icon: "none",
			// 			// 		});
			// 			// 	}
			// 			// } else {
			// 			// 	uni.showToast({
			// 			// 		title: "登录失败，请重试",
			// 			// 		icon: "none",
			// 			// 	});
			// 			// }
			// 		} finally {
			// 			// uni.hideLoading();
			// 		}
			// 	},
			// 	fail: (err) => {
			// 		uni.showToast({
			// 			title: "登录失败，请重试",
			// 			icon: "none",
			// 		});
			// 	},
			// });
			const res = await loginTo(data);
			setUserInfo({ ...res, ...data });
		}
		return {
			userInfo,
			setUserInfo,
			clearUserInfo,
			buyWay,
			setBuyWay,
			login
		};
	},
	{
		persist: {
			storage: {
				getItem(key) {
					return uniCache.getItem(key);
				},
				setItem(key, value) {
					uniCache.setItem(key, value);
				},
			},
		},
	}
);
