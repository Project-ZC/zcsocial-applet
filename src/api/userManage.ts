import { http } from "@/utils/http";

// 用户绑定手机号
export const bindMobile = (data: any) => {
	return http({
		url: "/v1/user/mobile/bind",
		method: "POST",
		data,
	});
};

// 全部查询用户列表
export const getAllUserList = (data: any) => {
	return http({
		url: "/v1/user/all/query",
		method: "POST",
		data,
	});
};
// 修改用户
export const modifyUser = (data: any) => {
	return http({
		url: "/v1/user/my/modify",
		method: "POST",
		data,
	});
};

// 查询全部用户信息
export const getAllUserInfo = (data: any) => {
	return http({
		url: "/v1/user/all/query",
		method: "POST",
		data,
	});
};
// 查询单个用户信息
export const getUserInfo = () => {
	return http({
		url: "/v1/user/my/query",
		method: "POST",
	});
};
