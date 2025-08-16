import { http } from "@/utils/http";


// ----------店铺列表-----------
// 查询店铺列表
export const getShopList = (data: any) => {
    return http({
        url: "/v1/shop/list",
        method: "POST",
        data,
    });
};

// 删除店铺
export const deleteShop = (data: any) => {
    return http({
        url: "/v1/shop/remove",
        method: "POST",
        data,
    });
};

// 新增店铺
export const addShop = (data: any) => {
    return http({
        url: "/v1/shop/add",
        method: "POST",
        data,
    });
};

// 修改店铺
export const editShop = (data: any) => {
    return http({
        url: "/v1/shop/edit",
        method: "POST",
        data,
    });
};