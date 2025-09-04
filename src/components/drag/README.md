# Drag 拖拽排序组件

基于触摸事件的拖拽排序组件，支持垂直方向的拖拽排序。

## 功能特性

- 支持垂直方向的拖拽排序
- 基于触摸事件，兼容移动端和桌面端
- 自动处理排序逻辑和位置计算
- 支持自定义项目内容
- 提供排序变化事件
- 支持动画效果

## 使用方法

### 基础用法

```vue
<template>
	<drag-component
		:list="items"
		:controlsSize="{ height: 80 }"
		@sort-change="onSortChange"
		@update:list="onListUpdate"
	>
		<template #default="{ item, index }">
			<view class="custom-item">
				<text>{{ item.name }}</text>
			</view>
		</template>
	</drag-component>
</template>

<script setup>
import { ref } from "vue";
import dragComponent from "@/components/drag/index.vue";

const items = ref([{ name: "项目 1" }, { name: "项目 2" }, { name: "项目 3" }]);

const onSortChange = (newList, oldIndex, newIndex) => {
	console.log("排序变化:", { newList, oldIndex, newIndex });
};

const onListUpdate = (newList) => {
	items.value = newList;
};
</script>
```

## Props

| 参数              | 类型   | 默认值         | 说明             |
| ----------------- | ------ | -------------- | ---------------- |
| list              | Array  | []             | 要排序的数据列表 |
| controlsSize      | Object | { height: 40 } | 控件大小配置     |
| animationDuration | Number | 0.3            | 动画时长（秒）   |

## Events

| 事件名      | 参数                        | 说明           |
| ----------- | --------------------------- | -------------- |
| update:list | newList                     | 列表更新时触发 |
| sort-change | newList, oldIndex, newIndex | 排序变化时触发 |

## 事件说明

### update:list

- **触发时机**: 列表数据更新时
- **参数**: `newList` - 更新后的完整列表
- **用途**: 同步外部列表数据

### sort-change

- **触发时机**: 排序发生变化时
- **参数**:
  - `newList` - 排序后的新列表
  - `oldIndex` - 原始位置索引
  - `newIndex` - 新位置索引
- **用途**: 处理排序逻辑，如保存到后端

## 实现原理

1. **初始化**: 组件挂载时，为每个列表项设置初始位置
2. **触摸监听**: 通过 `@touchstart`、`@touchmove`、`@touchend` 事件监听拖拽操作
3. **位置计算**: 根据触摸移动距离计算新位置
4. **排序判断**: 当拖拽项目与其他项目位置重叠时，自动交换位置
5. **事件通知**: 排序完成后触发事件，通知父组件更新数据

## 注意事项

1. 组件会自动处理位置计算，无需手动设置坐标
2. 支持自定义项目内容，通过 `#default` 插槽实现
3. 拖拽过程中会有动画效果，提升用户体验
4. 排序变化会同时触发 `update:list` 和 `sort-change` 事件

## 样式自定义

组件使用 SCSS 编写样式，支持以下自定义：

```scss
.drag-container {
	// 容器样式
	&-item {
		// 项目样式
		// 可以自定义背景、边框、阴影等
	}
}
```

## 完整示例

```vue
<template>
	<view class="page">
		<drag-component
			:list="items"
			:controlsSize="{ height: 100 }"
			:animationDuration="0.5"
			@sort-change="onSortChange"
			@update:list="onListUpdate"
		>
			<template #default="{ item, index }">
				<view class="drag-item">
					<view class="item-index">{{ index + 1 }}</view>
					<view class="item-content">
						<text class="item-name">{{ item.name }}</text>
						<text class="item-desc">{{ item.description }}</text>
					</view>
				</view>
			</template>
		</drag-component>
	</view>
</template>

<script setup>
import { ref } from "vue";
import dragComponent from "@/components/drag/index.vue";

const items = ref([
	{ name: "项目 A", description: "这是项目 A" },
	{ name: "项目 B", description: "这是项目 B" },
	{ name: "项目 C", description: "这是项目 C" },
]);

const onSortChange = (newList, oldIndex, newIndex) => {
	console.log(`项目从位置 ${oldIndex} 移动到位置 ${newIndex}`);
	// 可以调用API保存新的排序
	saveSortOrder(newList);
};

const onListUpdate = (newList) => {
	items.value = newList;
};

const saveSortOrder = async (list) => {
	try {
		await api.updateSortOrder({
			items: list.map((item, index) => ({
				id: item.id,
				sort: index,
			})),
		});
		console.log("排序保存成功");
	} catch (error) {
		console.error("保存失败:", error);
	}
};
</script>

<style lang="scss" scoped>
.drag-item {
	display: flex;
	align-items: center;
	height: 100%;
	padding: 0 20rpx;
	background: #fff;
	border-radius: 8rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.item-index {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 60rpx;
	height: 60rpx;
	background: #007aff;
	color: #fff;
	border-radius: 50%;
	font-size: 24rpx;
	font-weight: 600;
	margin-right: 20rpx;
}

.item-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.item-name {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 8rpx;
}

.item-desc {
	font-size: 24rpx;
	color: #999;
}
</style>
```
