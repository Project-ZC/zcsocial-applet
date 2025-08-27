import { http } from "@/utils/http";

// 获取点单模式
export const getGender = (data: any) => {
	return http({
		url: "/v1/dictionary/order/mode/query",
		method: "POST",
		data,
	});
};

// 获取标签列表
export const getTagList = (data: any) => {
	return http({
		url: "/v1/tag/all/query",
		method: "POST",
		data,
	});
};

// 获取性别列表
export const getGenderList = (data: any) => {
	return http({
		url: "/v1/dictionary/gender/query",
		method: "POST",
		data,
	});
};