import { http } from "@/utils/http";


// 加入我的购物车
export const addCart = (data: any) => {
    return http({
        url: "/v1/user/cart/my/create",
        method: "POST",
        data,
    });
};


// 查询我的购物车
export const getCart = (data: any) => {
    return http({
        url: "/v1/user/cart/all/my/query",
        method: "POST",
        data,
    });
};


// 修改我的购物车
export const modifyCart = (data: any) => {
    return http({
        url: "/v1/user/cart/my/modify",
        method: "POST",
        data,
    });
};

// 删除我的购物车
export const removeCart = (data: any) => {
    return http({
        url: "/v1/user/cart/remove",
        method: "POST",
        data,
    });
};