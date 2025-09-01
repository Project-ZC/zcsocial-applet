import type { user } from "@/types/user";
import { defineStore } from "pinia";
import { ref } from "vue";
import { loginTo } from "@/utils/login";
import { uniCache } from "@/utils/storage";
import {
	generateUserPermissionsByRoleIds,
	hasShopPermission,
	hasPermission,
	testRoleId,
} from "@/consts/auth";

export const useUserStore = defineStore(
	"user",
	() => {
		//存储用户的信息
		const userInfo = ref<user>({} as user);

		const userRole = ref<any>({
			perms: [],
			permObj: {},
			roleName: "",
			roleId: 0,
		});

		//设置用户信息
		const setUserInfo = (data: any) => {
			userInfo.value = data;
		};
		//清理用户信息
		const clearUserInfo = () => {
			userInfo.value = {} as user;
		};

		// 检查是否有店铺权限
		const checkShopPermission = () => {
			return hasShopPermission(userRole.value);
		};

		// 检查是否有特定权限
		const checkPermission = (permission: string) => {
			return hasPermission(userRole.value, permission);
		};

		const login = async (data = {}) => {
			try {
				uni.showLoading({
					title: "登录中...",
				});
				const res = (await loginTo(data)) as any;
				const userInfo = { ...res, ...data };
				setUserInfo(userInfo);
				
				// 登录成功后，设置权限
				if (res.roleList || res.roleId) {
					setPerms(res);
				}
				
				return userInfo;
			} catch (error) {
				console.error('登录失败:', error);
				throw error;
			} finally {
				uni.hideLoading();
			}
		};

		// 设置店铺权限，绑定的店铺角色
		const setPerms = (res: any) => {
			// 支持新的roleList格式和旧的userRole格式
			let roleIds: number[] = [];

			if (Array.isArray(res.roleList) && res.roleList?.length > 0) {
				// 新格式：roleList数组
				roleIds = res.roleList.map((item: any) => item.roleId);
			} else if (res.roleId) {
				// 旧格式：单个roleId
				roleIds = [res.roleId];
			}

			// 根据roleIds生成权限
			if (roleIds.length > 0) {
				const { perms, permObj, roleNames } =
					generateUserPermissionsByRoleIds(roleIds);
				userRole.value = {
					perms,
					permObj,
					roleNames,
					roleIds,
				};
			} else {
				// 如果没有角色，设置为普通用户权限
				userRole.value = {
					perms: [],
					permObj: {},
					roleNames: "用户",
					roleIds: [],
				};
			}
		};

		return {
			userInfo,
			setUserInfo,
			clearUserInfo,
			login,
			checkShopPermission,
			checkPermission,
			setPerms,
			userRole,
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
