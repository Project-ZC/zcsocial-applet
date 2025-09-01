// 商品规格接口
export interface ProductSku {
  id: number;
  productId: number;
  size: number;
  unit: string;
  price: number;
  status: string;
  createTime: string;
  modifyTime: string;
}

// 商品项接口
export interface GoodItem {
  id: number;
  name: string;
  description: string;
  photo: string;
  price: number;
  productSkus?: ProductSku[];
}

// 购物车商品项接口
export interface CartItem {
  productId: number;
  productName: string;
  skuId: number | null;
  skuSize: string | null;
  price: number;
  quantity: number;
  photo?: string;
}
