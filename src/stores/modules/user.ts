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
			const res = await loginTo(data) as any;
			res.perms = ['shop'];
			let permObj = {}
			for (const item of res.perms) {
				permObj[item] = true
			}
			res.permObj = permObj
			console.log(res, 444)
			const userInfo = { ...res, ...data };
			setUserInfo(userInfo);
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
