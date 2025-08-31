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
			return hasShopPermission(userRole.value);
		};

		// 检查是否有特定权限
		const checkPermission = (permission: string) => {
			return hasPermission(userRole.value, permission);
		};

		const login = async (data = {}) => {
			uni.showLoading({
				title: "登录中...",
			});
			const res = (await loginTo(data)) as any;
			const userInfo = { ...res, ...data };
			setUserInfo(userInfo);
		};

		// 设置店铺权限，绑定的店铺角色
		const setPerms = (res: any) => {
			// 测试角色Id
			const roleId =  res.roleId;
			// 根据roleId生成权限
			if (roleId) {
				const { perms, permObj, roleName } = generateUserPermissions(
					roleId
				);
				userRole.value = {
					perms,
					permObj,
					roleName,
					roleId,
				};
			} else {
				// 如果没有roleId，设置为普通用户权限
				userRole.value = {
					perms: [],
					permObj: {},
					roleName: "用户",
					roleId: 0,
				};
			}

		};

		return {
			userInfo,
			setUserInfo,
			clearUserInfo,
			login,
			generateUserPermissions,
			checkShopPermission,
			checkPermission,
			setPerms,
			userRole
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
