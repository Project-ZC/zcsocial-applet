import type { user } from "@/types/user";
import { defineStore } from "pinia";
import { ref } from "vue";
import { uniCache } from "@/utils/storage";
import { getShopStatus } from "@/api/shopManage";

export const useShopStore = defineStore(
	"shop",
	() => {
		const shopStatus = ref<any>([]);
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
			console.log(res.data, 444);
			setShopStatus(res.data);
		};

		const getShopStatusText = (state: string) => {
			const text = shopStatus.value.find(
				(item: any) => item.code == state
			)?.text;
			return text;
		};
		return {
			setShopStatus,
			shopStatus,
			GetShopStatus,
			getShopStatusText,
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
