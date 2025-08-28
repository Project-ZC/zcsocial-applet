// 权限管理配置
export interface RolePermission {
	roleId: number;
	roleName: string;
	perms: string[];
}

// 测试角色ID权限
export const testRoleId = '';

// 角色权限配置
export const ROLE_PERMISSIONS: RolePermission[] = [
	{
		roleId: 10000000,
		roleName: "店主/股东",
		perms: [
			"shop", // 店铺管理
			"shop/shopSystem", // 店铺系统
			"shop/switch", // 店铺切换
			"shop/shopMenu", // 点单管理
			"shop/shopGames", // 游戏管理
			"shop/tableManage", // 桌位管理
			"shop/ticketSettings", // 门票管理
			"shop/shopStaff", // 员工管理
			// "shop/shopDetail", // 店铺详情
			// "shop/orders", // 店铺订单
			// "shop/analytics", // 数据分析
			// "shop/qrcode", // 店铺二维码
			// "shop/audit", // 报名审核
		],
	},
	{
		roleId: 10000001,
		roleName: "店长",
		perms: [
			"shop", // 店铺管理
			"shop/shopSystem", // 店铺系统
			"shop/shopMenu", // 点单管理
			"shop/shopGames", // 游戏管理
			"shop/tableManage", // 桌位管理
			"shop/ticketSettings", // 门票管理
			"shop/shopStaff", // 员工管理
			// "shop/shopDetail", // 店铺详情
			// "shop/orders", // 店铺订单
			// "shop/analytics", // 数据分析
			// "shop/qrcode", // 店铺二维码
			// "shop/audit", // 报名审核
		],
	},
	{
		roleId: 10000002,
		roleName: "调酒师",
		perms: [
			"shop", // 店铺管理
			"shop/shopMenu", // 点单管理
			"shop/shopGames", // 游戏管理
			"shop/tableManage", // 桌位管理
			"shop/ticketSettings", // 门票管理
			// "shop/shopDetail", // 店铺详情
			// "shop/orders", // 店铺订单
			// "shop/analytics", // 数据分析
			// "shop/qrcode", // 店铺二维码
		],
	},
	{
		roleId: 10000003,
		roleName: "主理人",
		perms: [
			"shop", // 店铺管理
			"shop/shopGames", // 游戏管理
			// "shop/shopDetail", // 店铺详情
			// "shop/orders", // 店铺订单
			// "shop/analytics", // 数据分析
			// "shop/qrcode", // 店铺二维码
		],
	},
];

// 根据角色ID获取权限
export const getPermissionsByRoleId = (roleId: number): string[] => {
	const role = ROLE_PERMISSIONS.find((item) => item.roleId === roleId);
	return role ? role.perms : [];
};

// 根据角色ID获取角色名称
export const getRoleNameByRoleId = (roleId: number): string => {
	const role = ROLE_PERMISSIONS.find((item) => item.roleId === roleId);
	return role ? role.roleName : "用户";
};

// 生成权限对象
export const generatePermObj = (perms: string[]): Record<string, boolean> => {
	const permObj: Record<string, boolean> = {};
	perms.forEach((perm) => {
		permObj[perm] = true;
	});
	return permObj;
};

// 检查是否有店铺权限
export const hasShopPermission = (userInfo: any): boolean => {
	if (!userInfo || !userInfo.permObj) return false;
	return !!userInfo.permObj["shop"];
};

// 检查是否有特定权限
export const hasPermission = (userInfo: any, permission: string): boolean => {
	if (!userInfo || !userInfo.permObj) return false;
	return !!userInfo.permObj[permission];
};
