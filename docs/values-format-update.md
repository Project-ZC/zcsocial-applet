# Values 格式转换说明

## 修改背景

为了统一数据格式，将原来的字符串数组格式转换为 `{value: string}` 对象数组格式，以便更好地支持选项的扩展属性。

## 修改内容

### 1. 创建格式化工具函数 (`src/utils/format-utils.ts`)

提供了统一的格式化工具函数：

```typescript
// 将数组转换为 {value: string} 格式（支持包含id字段）
export function formatValuesToOptions(
  list: string[] | Array<{ value: string; id?: string }>,
  includeId: boolean = false
): Array<{ value: string; id?: string }>;

// 将 {value: string} 格式转换为字符串数组
export function formatOptionsToValues(options: Array<{ value: string }> | string[]): string[];

// 获取显示用的字符串数组（用于join等操作）
export function getDisplayValues(options: Array<{ value: string }> | string[]): string[];

// 统一添加选项到数组
export function addOptionToArray(
  array: Array<{ value: string }> | string[],
  item: string,
  format: boolean = true
): void;

// 统一从数组中移除选项
export function removeOptionFromArray(array: Array<{ value: string }> | string[], index: number): void;
```

### 2. 修改规格组组件 (`src/pages/shop/shopMenu/components/specGroupContent.vue`)

**数据格式变更：**

```typescript
// 修改前
values: [] as string[];

// 修改后
values: [] as Array<{ value: string }>;
```

**模板绑定变更：**

```vue
<!-- 修改前 -->
<up-input v-model="state.form.values[idx]" placeholder="请输入选项名称">

<!-- 修改后 -->
<up-input v-model="state.form.values[idx].value" placeholder="请输入选项名称">
```

**函数调用变更：**

```typescript
// 修改前
const addOption = () => state.form.values.push('');
const removeOption = (idx: number) => state.form.values.splice(idx, 1);

// 修改后
const addOption = () => addOptionToArray(state.form.values, '');
const removeOption = (idx: number) => removeOptionFromArray(state.form.values, idx);
```

**模板选择逻辑：**

```typescript
// 修改前
const values = [];
for (const item of list) {
  values.push({ value: item });
}
state.form.values = values;

// 修改后
state.form.values = formatValuesToOptions(list);
```

### 3. 修改商品内容组件 (`src/pages/shop/shopMenu/components/productContent.vue`)

**显示逻辑变更：**

```vue
<!-- 修改前 -->
<text class="spec-name">{{ item.key }}({{ item.options?.join('、') }})</text>

<!-- 修改后 -->
<text class="spec-name">{{ item.key }}({{ getDisplayValues(item.options || []).join('、') }})</text>
```

## 数据格式对比

### 修改前（字符串数组）

```javascript
{
  key: "规格",
  options: ["小杯", "中杯", "大杯"]
}
```

### 修改后（对象数组）

```javascript
{
  key: "规格",
  options: [
    { value: "小杯" },
    { value: "中杯" },
    { value: "大杯" }
  ]
}
```

## 优势

1. **扩展性**：为每个选项预留了扩展属性的空间
2. **统一性**：所有选项数据格式保持一致
3. **类型安全**：TypeScript 类型定义更加明确
4. **向后兼容**：工具函数支持两种格式的转换

## 使用方式

### 1. 创建新选项

```typescript
import { addOptionToArray } from '@/utils/format-utils';

// 添加到数组
addOptionToArray(values, '新选项');
```

### 2. 显示选项

```typescript
import { getDisplayValues } from '@/utils/format-utils';

// 获取显示用的字符串数组
const displayValues = getDisplayValues(options);
const displayText = displayValues.join('、');
```

### 3. 格式转换

```typescript
import { formatValuesToOptions, formatOptionsToValues } from '@/utils/format-utils';

// 字符串数组转对象数组
const options = formatValuesToOptions(['选项1', '选项2']);

// 字符串数组转对象数组（包含id字段）
const optionsWithId = formatValuesToOptions(['选项1', '选项2'], true);

// 对象数组转字符串数组
const values = formatOptionsToValues(options);
```

## 注意事项

1. **数据兼容性**：工具函数会自动处理两种格式的转换
2. **模板绑定**：需要修改模板中的 `v-model` 绑定为 `item.value`
3. **数组操作**：使用工具函数进行添加、删除等操作
4. **显示逻辑**：使用 `getDisplayValues` 函数获取显示用的字符串数组

## 影响范围

- ✅ `specGroupContent.vue` - 规格组编辑组件
- ✅ `productContent.vue` - 商品内容组件
- ✅ `format-utils.ts` - 格式化工具函数
- 🔄 其他使用 `options` 数组的组件需要相应更新

## 测试建议

1. **规格组创建**：测试创建新的规格组功能
2. **规格组编辑**：测试编辑现有规格组功能
3. **模板选择**：测试快速模板选择功能
4. **数据显示**：验证选项显示是否正确
5. **数据保存**：确认保存的数据格式正确
