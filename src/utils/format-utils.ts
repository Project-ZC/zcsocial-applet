/**
 * 格式化工具函数
 * 用于统一处理数据格式转换
 */

/**
 * 将数组转换为 {value: string} 格式
 * @param list 原始数组
 * @param includeId 是否包含id字段
 * @returns 格式化后的数组
 */
export function formatValuesToOptions(
  list: string[] | Array<{ value: string; id?: string }>, 
  includeId: boolean = false
): Array<{ value: string; id?: string }> {
  if (!Array.isArray(list)) {
    return [];
  }
  
  // 如果已经是对象数组，直接返回
  if (list.length > 0 && typeof list[0] === 'object' && 'value' in list[0]) {
    return list.map(item => ({ 
      value: (item as any).value, 
      ...(includeId && (item as any).id ? { id: (item as any).id } : {})
    }));
  }
  
  // 如果是字符串数组，转换为对象数组
  return (list as string[]).map(item => ({ 
    value: item,
    ...(includeId ? { id: '' } : {})
  }));
}


/**
 * 将 {value: string} 格式的数组转换为字符串数组
 * @param options 选项数组
 * @returns 字符串数组
 */
export function formatOptionsToValues(options: Array<{ value: string }> | string[]): string[] {
  if (!Array.isArray(options)) {
    return [];
  }
  
  // 如果已经是字符串数组，直接返回
  if (options.length > 0 && typeof options[0] === 'string') {
    return options as string[];
  }
  
  // 如果是对象数组，提取value值
  return (options as Array<{ value: string }>).map(item => item.value);
}

/**
 * 将字符串数组转换为显示格式（用于join等操作）
 * @param options 选项数组
 * @returns 字符串数组
 */
export function getDisplayValues(options: Array<{ value: string }> | string[]): string[] {
  return formatOptionsToValues(options);
}

/**
 * 检查是否为 {value: string} 格式
 * @param item 检查项
 * @returns 是否为对象格式
 */
export function isValueObject(item: any): item is { value: string } {
  return typeof item === 'object' && item !== null && 'value' in item;
}

/**
 * 统一添加选项到数组
 * @param array 目标数组
 * @param item 要添加的项
 * @param format 是否格式化为 {value: string} 格式
 */
export function addOptionToArray(
  array: Array<{ value: string }> | string[], 
  item: string, 
  format: boolean = true
): void {
  if (format) {
    (array as Array<{ value: string }>).push({ value: item });
  } else {
    (array as string[]).push(item);
  }
}

/**
 * 统一从数组中移除选项
 * @param array 目标数组
 * @param index 要移除的索引
 */
export function removeOptionFromArray(
  array: Array<{ value: string }> | string[], 
  index: number
): void {
  array.splice(index, 1);
}
