import type { user } from "@/types/user";
import { defineStore } from "pinia";
import { ref } from "vue";
import { loginTo } from "@/utils/login";
import { uniCache } from "@/utils/storage";
import {
	getPermissionsByRoleId,
	getRoleNameByRoleId,
	generatePermObj,
	hasShopPermission,
	hasPermission,
	testRoleId,
} from "@/consts/auth";

export const useUserStore = defineStore(
	"user",
	() => {
		//存储用户的信息
		const userInfo = ref<user>({} as user);

		//设置用户信息
		const setUserInfo = (data: any) => {
			userInfo.value = data;
		};
		//清理用户信息
		const clearUserInfo = () => {
			userInfo.value = {} as user;
		};

		// 根据角色ID生成权限
		const generateUserPermissions = (roleId: number) => {
			const perms = getPermissionsByRoleId(roleId);
			const permObj = generatePermObj(perms);
			const roleName = getRoleNameByRoleId(roleId);

			return {
				perms,
				permObj,
				roleName,
			};
		};

		// 检查是否有店铺权限
		const checkShopPermission = () => {
			return hasShopPermission(userInfo.value);
		};

		// 检查是否有特定权限
		const checkPermission = (permission: string) => {
			return hasPermission(userInfo.value, permission);
		};

		const login = async (data = {}) => {
			uni.showLoading({
				title: "登录中...",
			});
			const res = (await loginTo(data)) as any;
			// 测试角色Id
			if (testRoleId) {
				res.roleId = testRoleId;
			}
			// 根据roleId生成权限
			if (res.roleId) {
				const { perms, permObj, roleName } = generateUserPermissions(
					res.roleId
				);
				res.perms = perms;
				res.permObj = permObj;
				res.roleName = roleName;
			} else {
				// 如果没有roleId，设置为普通用户权限
				res.perms = [];
				res.permObj = {};
				res.roleName = "用户";
			}

			const userInfo = { ...res, ...data };
			setUserInfo(userInfo);
		};

		return {
			userInfo,
			setUserInfo,
			clearUserInfo,
			login,
			generateUserPermissions,
			checkShopPermission,
			checkPermission,
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
