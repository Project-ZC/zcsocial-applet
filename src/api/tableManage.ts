import { http } from "@/utils/http";


// 新增桌台
export const addTable = (data: any) => {
    return http({
        url: "/v1/table/create",
        method: "POST",
        data,
    });
};

// 分页查询增加桌台列表
export const getTableList = (data: any) => {
    return http({
        url: "/v1/table/query",
        method: "POST",
        data,
    });
};


// 全部查询桌台列表
export const getAllTableList = (data: any) => {
    return http({
        url: "/v1/table/all/query",
        method: "POST",
        data,
    });
};

// 修改桌台
export const editTable = (data: any) => {
    return http({
        url: "/v1/table/modify",
        method: "POST",
        data,
    });
};

// 删除桌台
export const deleteTable = (data: any) => {
    return http({
        url: "/v1/table/remove",
        method: "POST",
        data,
    });
};