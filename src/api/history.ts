import { http } from "@/utils/http";

// 增加用户浏览店铺历史记录
export const createShopHistory = (data: any) => {
	return http({
		url: "/v1/user/shop/history/create",
		method: "POST",
		data,
	});
};


// 分页查询用户浏览店铺历史记录列表
export const getShopHistory = (data: any) => {
	return http({
		url: "/v1/user/shop/history/query",
		method: "POST",
		data,
	});
}



// 全部查询用户浏览店铺历史记录列表
export const getAllShopHistory = (data: any) => {
	return http({
		url: "/v1/user/shop/history/all/my/query",
		method: "POST",
		data,
	});
};


// 删除用户浏览店铺历史记录
export const deleteShopHistory = (data: any) => {
	return http({
		url: "/v1/user/shop/history/remove",
		method: "POST",
		data,
	});
};