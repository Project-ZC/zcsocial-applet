import Big from 'big.js';

/**
 * 价格计算工具类
 * 使用 Big.js 确保浮点数计算的精度
 */

/**
 * 加法：a + b
 */
export const add = (a: number | string, b: number | string): number => {
  return new Big(a).plus(b).toNumber();
};

/**
 * 减法：a - b
 */
export const subtract = (a: number | string, b: number | string): number => {
  return new Big(a).minus(b).toNumber();
};

/**
 * 乘法：a * b
 */
export const multiply = (a: number | string, b: number | string): number => {
  return new Big(a).times(b).toNumber();
};

/**
 * 除法：a / b
 */
export const divide = (a: number | string, b: number | string): number => {
  return new Big(a).div(b).toNumber();
};

/**
 * 计算多个价格的总和
 */
export const sum = (...prices: (number | string)[]): number => {
  return prices.reduce((sum: Big, price) => sum.plus(new Big(price)), new Big(0)).toNumber();
};

/**
 * 计算商品总价（单价 * 数量）
 */
export const calculateItemTotal = (unitPrice: number | string, quantity: number | string): number => {
  return multiply(unitPrice, quantity);
};

/**
 * 计算购物车总价
 */
export const calculateCartTotal = (items: Array<{ unitPrice: number | string; quantity: number | string }>): number => {
  return items.reduce((sum: Big, item) => {
    const itemTotal = new Big(item.unitPrice).times(item.quantity);
    return sum.plus(itemTotal);
  }, new Big(0)).toNumber();
};

/**
 * 格式化价格显示（保留2位小数）
 */
export const formatPrice = (price: number | string): string => {
  return new Big(price).toFixed(2);
};

/**
 * 比较两个价格是否相等
 */
export const isEqual = (a: number | string, b: number | string): boolean => {
  return new Big(a).eq(b);
};

/**
 * 比较价格大小
 */
export const isGreaterThan = (a: number | string, b: number | string): boolean => {
  return new Big(a).gt(b);
};

export const isLessThan = (a: number | string, b: number | string): boolean => {
  return new Big(a).lt(b);
};
