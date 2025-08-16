import { http } from "@/utils/http";


// 全部查询角色列表
export const getAllRoleList = (data: any) => {
    return http({
        url: "/v1/role/all/query",
        method: "POST",
        data,
    });
};