import { http } from "@/utils/http";

// 获取点单模式
export const getGender = (data: any) => {
	return http({
		url: "/v1/dictionary/order/mode/query",
		method: "POST",
		data,
	});
};
