import { http } from "@/utils/http";

// 地理编码与逆地理编码
export const geocoder = (params: any) => {
	return http({
		url: "/v1/lbs/geocoder",
		method: "GET",
		data: params,
	});
};
