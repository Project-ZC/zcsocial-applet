//用户类型声明
export type user = {
	nickname: string;
	avatar: string;
	phone: string;
	yuKingCoin: number;
	voucherNum: number;
	token: string;
	gender: number;
	roleId?: number; // 角色ID
	perms?: string[]; // 权限列表
	permObj?: Record<string, boolean>; // 权限对象
	roleName?: string; // 角色名称
};
//用户购物车类型声明
export type UserCart = {
	id?: string;
	goodsId: string;
	skuInfo?: string;
	count: number;
	price: number;
	coverImage?: string;
	goodsName?: string;
};
//立即购买类型
export type buyNow = {
	goodsId: string;
	skuInfo?: string;
	count: number;
	price: number;
	coverImage?: string;
	goodsName?: string;
};
