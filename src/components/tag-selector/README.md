# TagSelector 标签选择器组件

## 功能特性

- 🏷️ **双重模式** - 支持选择已有标签和自定义输入
- 🔍 **智能搜索** - 输入时自动显示匹配的标签建议
- ✨ **交互友好** - 点击标签即可选择，点击已选标签可移除
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 🎨 **主题统一** - 使用项目主题变量，保持视觉一致性
- ⚙️ **灵活配置** - 支持最大数量限制、自定义输入开关等

## 使用方法

### 1. 基础用法

```vue
<template>
	<view class="container">
		<TagSelector
			:tags="tagList"
			:selectedTags="selectedTags"
			@update:selectedTags="handleTagChange"
			@tagAdd="handleTagAdd"
			@tagRemove="handleTagRemove"
		/>
	</view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { TagSelector } from "@/components/tag-selector";

// 可选标签列表
const tagList = ref([
	{ id: 1, name: "咖啡" },
	{ id: 2, name: "奶茶" },
	{ id: 3, name: "果汁" },
	{ id: 4, name: "甜品" },
]);

// 已选标签
const selectedTags = ref([{ id: 1, name: "咖啡" }]);

// 处理标签变化
const handleTagChange = (tags: any[]) => {
	selectedTags.value = tags;
	console.log("标签变化:", tags);
};

// 处理标签添加
const handleTagAdd = (tag: any) => {
	console.log("添加标签:", tag);
};

// 处理标签移除
const handleTagRemove = (tag: any) => {
	console.log("移除标签:", tag);
};
</script>
```

### 2. 限制最大数量

```vue
<template>
	<TagSelector
		:tags="tagList"
		:selectedTags="selectedTags"
		:maxTags="3"
		@update:selectedTags="handleTagChange"
	/>
</template>
```

### 3. 仅选择模式（不允许自定义输入）

```vue
<template>
	<TagSelector
		:tags="tagList"
		:selectedTags="selectedTags"
		:allowCustom="false"
		@update:selectedTags="handleTagChange"
	/>
</template>
```

## Props

| 参数         | 类型    | 默认值 | 说明               |
| ------------ | ------- | ------ | ------------------ |
| tags         | Tag[]   | []     | 可选标签列表       |
| selectedTags | Tag[]   | []     | 已选标签列表       |
| maxTags      | number  | 10     | 最大可选标签数量   |
| allowCustom  | boolean | true   | 是否允许自定义输入 |

## Events

| 事件名              | 参数        | 说明               |
| ------------------- | ----------- | ------------------ |
| update:selectedTags | tags: Tag[] | 已选标签更新时触发 |
| tagChange           | tags: Tag[] | 标签变化时触发     |
| tagAdd              | tag: Tag    | 添加标签时触发     |
| tagRemove           | tag: Tag    | 移除标签时触发     |

## Tag 接口

```typescript
interface Tag {
	id: string | number; // 标签ID
	name: string; // 标签名称
	isCustom?: boolean; // 是否为自定义标签（可选）
	[key: string]: any; // 其他属性
}
```

## 功能说明

### 🎯 选择模式

- 点击可选标签即可添加到已选列表
- 支持键盘输入搜索匹配的标签
- 自动过滤已选择的标签

### ✏️ 输入模式

- 在输入框中输入标签名称
- 点击"添加"按钮或按回车键添加
- 自动检查重复标签
- 自定义标签会标记 `isCustom: true`

### 🔍 搜索建议

- 输入时自动显示匹配的标签建议
- 支持模糊匹配
- 点击建议项快速选择

### 🗑️ 移除标签

- 点击已选标签即可移除
- 移除后标签重新变为可选状态

## 样式定制

组件使用了主题变量，可以通过以下方式自定义：

```scss
// 在父组件中覆盖样式
.tag-selector {
	.tag-item {
		&.selected {
			// 自定义已选标签样式
		}

		&.available {
			// 自定义可选标签样式
		}
	}

	.tag-input {
		// 自定义输入框样式
	}
}
```

## 注意事项

1. **标签 ID 唯一性** - 确保标签列表中的 ID 唯一
2. **自定义标签 ID** - 自定义标签会自动生成 ID，格式为 `custom_${timestamp}`
3. **重复检查** - 组件会自动检查重复标签名称
4. **数量限制** - 达到最大数量时会显示提示信息
5. **输入长度** - 标签名称最大长度为 10 个字符

## 最佳实践

1. **标签数据管理** - 建议将标签数据存储在状态管理中
2. **异步加载** - 可以从 API 动态加载标签列表
3. **数据持久化** - 选中的标签可以保存到本地存储
4. **用户体验** - 提供适当的加载状态和错误处理
