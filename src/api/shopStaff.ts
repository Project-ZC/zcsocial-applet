import { http } from "@/utils/http";


// 新增店铺员工
export const addShopStaff = (data: any) => {
    return http({
        url: "/v1/user/shop/create",
        method: "POST",
        data,
    });
};

// 分页查询增加店铺员工列表
export const getShopStaffList = (data: any) => {
    return http({
        url: "/v1/user/shop/query",
        method: "POST",
        data,
    });
};


// 全部查询店铺员工列表
export const getAllShopStaffList = (data: any) => {
    return http({
        url: "/v1/user/shop/all/query",
        method: "POST",
        data,
    });
};

// 修改店铺员工
export const editShopStaff = (data: any) => {
    return http({
        url: "/v1/user/shop/modify",
        method: "POST",
        data,
    });
};

// 删除店铺员工
export const deleteShopStaff = (data: any) => {
    return http({
        url: "/v1/user/shop/remove",
        method: "POST",
        data,
    });
};