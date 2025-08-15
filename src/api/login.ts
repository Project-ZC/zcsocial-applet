import { http } from "@/utils/http";

// 登录接口
export const toLogin = (data: any) => {
	return http({
		url: "/v1/user/wechat/login",
		method: "POST",
		data,
	});
};

// 注册
export const register = (data: any) => {
	return http({
		url: "/v1/user/wechat/register",
		method: "POST",
		data,
	});
};
