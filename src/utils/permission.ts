import { useUserStore } from "@/stores";
import { hasPermission } from "@/consts/auth";

/**
 * 权限管理工具函数
 */

// 检查是否有特定权限
export const checkPermission = (permission: string): boolean => {
	const userStore = useUserStore();
	return hasPermission(userStore.userInfo, permission);
};

// 检查是否有多个权限中的任意一个
export const checkAnyPermission = (permissions: string[]): boolean => {
	return permissions.some((permission) => checkPermission(permission));
};

// 检查是否有多个权限中的所有权限
export const checkAllPermissions = (permissions: string[]): boolean => {
	return permissions.every((permission) => checkPermission(permission));
};

// 获取用户角色名称
export const getUserRoleName = (): string => {
	const userStore = useUserStore();
	return userStore.userInfo.roleName || "用户";
};

// 获取用户权限列表
export const getUserPermissions = (): string[] => {
	const userStore = useUserStore();
	return userStore.userInfo.perms || [];
};

// 权限指令（用于v-if等指令）
export const permissionDirective = {
	mounted(el: any, binding: any) {
		const { value } = binding;
		const userStore = useUserStore();

		if (typeof value === "string") {
			// 单个权限检查
			if (!hasPermission(userStore.userInfo, value)) {
				el.style.display = "none";
			}
		} else if (Array.isArray(value)) {
			// 多个权限检查，默认使用any模式
			const mode = binding.arg || "any"; // any 或 all
			let hasPerm = false;

			if (mode === "all") {
				hasPerm = value.every((perm) =>
					hasPermission(userStore.userInfo, perm)
				);
			} else {
				hasPerm = value.some((perm) => hasPermission(userStore.userInfo, perm));
			}

			if (!hasPerm) {
				el.style.display = "none";
			}
		}
	},
};
