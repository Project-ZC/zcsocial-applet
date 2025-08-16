import { http } from "@/utils/http";


// 全部查询用户列表
export const getAllUserList = (data: any) => {
    return http({
        url: "/v1/user/all/query",
        method: "POST",
        data,
    });
};
