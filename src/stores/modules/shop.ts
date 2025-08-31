import type { user } from "@/types/user";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { uniCache } from "@/utils/storage";
import { getShopStatus, getShopConfigList } from "@/api/shopManage";


export const useShopStore = defineStore(
	"shop",
	() => {
		const shopStatus = ref<any>([]);
		const myShopList = ref<any>([]);
		const myShopListLen = ref<number>(0);
	
		const setMyShopList = (data: any) => {
			myShopList.value = data;
		};

		const setMyShopListLen = (data: any) => {
			myShopListLen.value = data;
		};

		//设置店铺状态
		const setShopStatus = (data: any) => {
			shopStatus.value = data;
		};
		const GetShopStatus = async (data = {}) => {
			const res = (await getShopStatus(data)) as any;
			if (res.data.length > 0) {
				for (const item of res.data) {
					if (item.code == "open") {
						item.text = "营业中";
					} else if (item.code == "close") {
						item.text = "休息中";
					} else if (item.code == "close_manual") {
						item.text = "暂停营业(手动)";
					}
				}
			}
			setShopStatus(res.data);
		};

		const getShopStatusText = (state: string) => {
			const text = shopStatus.value.find(
				(item: any) => item.code == state
			)?.text;
			return text;
		};

		// 缓存店铺列表 权限控制
		const GetMyShopList = async (data = {}) => {
			return new Promise(async (resolve, reject) => {
				let params = {
					...data,
				};
				try {
					const res = (await getShopConfigList(params)) as any;
					myShopListLen.value = res.data?.length || 0;
					const shopLen = res.data?.length || 0;
					setMyShopListLen(shopLen);
					setMyShopList(res.data);
					resolve(res);
				} catch (error) {
					reject(error);
				}
			})
		};
		return {
			setShopStatus,
			shopStatus,
			GetShopStatus,
			getShopStatusText,
			GetMyShopList,
			myShopListLen,
			// myShopList,
			setMyShopList,
			setMyShopListLen,
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
