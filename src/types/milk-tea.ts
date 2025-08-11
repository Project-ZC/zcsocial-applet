// 奶茶商品类型
export interface MilkTeaProduct {
  id: number
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  tags: string[]
  category: string
  isAvailable: boolean
  stock?: number
}

// 分类类型
export interface Category {
  id: number
  name: string
  description: string
  icon: string
  products: MilkTeaProduct[]
}

// 购物车商品类型
export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number
}

// 订单类型
export interface Order {
  id: string
  items: CartItem[]
  totalAmount: number
  deliveryFee: number
  finalAmount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'completed' | 'cancelled'
  createTime: string
  estimatedDeliveryTime?: string
}

// 店铺信息类型
export interface ShopInfo {
  id: string
  name: string
  description: string
  logo: string
  rating: number
  deliveryTime: string
  minOrderAmount: number
  deliveryFee: number
  isOpen: boolean
}

// 用户信息类型
export interface UserInfo {
  id: string
  nickname: string
  phone: string
  avatar?: string
  address?: string
}

// 下单请求参数类型
export interface CreateOrderRequest {
  items: CartItem[]
  userInfo: UserInfo
  deliveryAddress: string
  deliveryTime?: string
  specialInstructions?: string
}

// 下单响应类型
export interface CreateOrderResponse {
  orderId: string
  orderNumber: string
  estimatedDeliveryTime: string
  totalAmount: number
} 