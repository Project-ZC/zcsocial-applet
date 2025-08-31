import { http } from "@/utils/http";


// 增加酒品细分
export const createProductCatalog = (data: any) => {
    return http({
        url: "/v1/product/catalog/create",
        method: "POST",
        data,
    });
};


// 分页查询酒品细分
export const getProductCatalog = (data: any) => {
    return http({
        url: "/v1/product/catalog/query",
        method: "POST",
        data,
    });
};


// 分页查询酒品所有细分
export const getProductCatalogAll = (data: any) => {
    return http({
        url: "/v1/product/catalog/all/query",
        method: "POST",
        data,
    });
};


// 修改酒品细分
export const modifyProductCatalog = (data: any) => {
    return http({
        url: "/v1/product/catalog/modify",
        method: "POST",
        data,
    });
};

// 删除酒品细分
export const deleteProductCatalog = (data: any) => {
    return http({
        url: "/v1/product/catalog/remove",
        method: "POST",
        data,
    });
};

// 增加产品
export const createProduct = (data: any) => {
    return http({
        url: "/v1/product/create",
        method: "POST",
        data,
    });
};
// 全部查询产品列表
export const getProductList = (data: any) => {
    return http({
        url: "/v1/product/all/query",
        method: "POST",
        data,
    });
};
// 修改产品
export const modifyProduct = (data: any) => {
    return http({
        url: "/v1/product/modify",
        method: "POST",
        data,
    });
};

// 删除产品
export const deleteProduct = (data: any) => {
    return http({
        url: "/v1/product/remove",
        method: "POST",
        data,
    });
};



