import { http } from "@/utils/http";
//获取地址列表
export const getAddressListAPI = () => {
	return http({
		url: "/address/list",
	});
};
