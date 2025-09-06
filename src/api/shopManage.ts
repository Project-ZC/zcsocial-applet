import { http } from "@/utils/http";

// ----------店铺列表-----------
// 查询店铺列表
export const getShopList = (data: any) => {
	return http({
		url: "/v1/shop/list",
		method: "POST",
		data,
	});
};
// 查询店铺列表
export const getShopDetail = (data: any) => {
	return http({
		url: "/v1/shop/detail",
		method: "POST",
		data,
	});
};

// 删除店铺
export const deleteShop = (data: any) => {
	return http({
		url: "/v1/shop/remove",
		method: "POST",
		data,
	});
};

// 新增店铺
export const addShop = (data: any) => {
	return http({
		url: "/v1/shop/add",
		method: "POST",
		data,
	});
};

// 修改店铺
export const editShop = (data: any) => {
	return http({
		url: "/v1/shop/edit",
		method: "POST",
		data,
	});
};

// 查询营业状态
export const getShopStatus = (data: any) => {
	return http({
		url: "/v1/dictionary/shop/state/query",
		method: "POST",
		data,
	});
};

// ------------店铺配置-------------

// 查询店铺列表
export const getShopConfigList = (data: any) => {
	return http({
		url: "/v1/shop/config/all/my/query",
		method: "POST",
		data,
	});
};
// 修改店铺配置
export const editShopConfig = (data: any) => {
	return http({
		url: "/v1/shop/config/modify",
		method: "POST",
		data,
	});
};

// 查询全部店铺配置列表
export const getAllShopConfig = (data: any) => {
	return http({
		url: "/v1/shop/config/all/query",
		method: "POST",
		data,
	});
};

// 查询店铺配置列表
export const getShopConfig = (data: any) => {
	return http({
		url: "/v1/shop/config/query",
		method: "POST",
		data,
	});
};


