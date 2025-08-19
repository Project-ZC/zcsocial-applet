# ShopSwitcher 店铺切换组件

## 功能特性

- 🏪 显示当前选中的店铺信息
- 🔍 支持搜索店铺功能
- 📱 使用 up-modal 和 scroll-view 实现弹框选择
- ✅ 无需勾选框，点击即可选择
- 🎨 美观的 UI 设计，支持店铺状态显示

## 使用方法

### 1. 在页面中引入组件

```vue
<template>
	<view class="container">
		<!-- 店铺切换组件 -->
		<ShopSwitcher
			:shops="shopList"
			:currentShopId="currentShopId"
			@update:currentShopId="handleShopChange"
			@shopChange="handleShopSelect"
		/>

		<!-- 其他内容 -->
	</view>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ShopSwitcher } from "@/components/shop-switcher";

// 店铺数据
const shopList = ref([
	{
		id: "1",
		name: "星巴克咖啡店",
		address: "北京市朝阳区三里屯路19号",
		status: "open",
	},
	{
		id: "2",
		name: "瑞幸咖啡店",
		address: "上海市浦东新区陆家嘴环路1000号",
		status: "close",
	},
	{
		id: "3",
		name: "喜茶饮品店",
		address: "广州市天河区珠江新城花城大道85号",
		status: "open",
	},
]);

// 当前选中的店铺ID
const currentShopId = ref("1");

// 处理店铺切换
const handleShopChange = (shopId: string) => {
	currentShopId.value = shopId;
	console.log("店铺ID已更新:", shopId);
};

// 处理店铺选择
const handleShopSelect = (shop: any) => {
	console.log("选中的店铺:", shop);
	// 可以在这里执行其他逻辑，比如刷新页面数据
};
</script>
```

### 2. 在店铺页面中使用

```vue
<template>
	<pageWrapper>
		<view class="container">
			<!-- 店铺切换组件 -->
			<ShopSwitcher
				:shops="state.shopList"
				:currentShopId="state.currentShopId"
				@update:currentShopId="handleShopChange"
				@shopChange="handleShopSelect"
			/>

			<!-- 原有的店铺内容 -->
			<view class="z-glass-card">
				<up-cell-group v-for="main in state.cellList" :key="main.title">
					<!-- ... 其他内容 ... -->
				</up-cell-group>
			</view>
		</view>
	</pageWrapper>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";
import { ShopSwitcher } from "@/components/shop-switcher";
import { getShopList } from "@/api/shopManage";

const state = reactive({
	shopList: [],
	currentShopId: "",
	cellList: [
		// ... 原有的菜单数据 ...
	],
});

// 获取店铺列表
const loadShopList = async () => {
	try {
		const res = await getShopList();
		state.shopList = res.data || [];
		// 默认选择第一个店铺
		if (state.shopList.length > 0 && !state.currentShopId) {
			state.currentShopId = state.shopList[0].id;
		}
	} catch (error) {
		console.error("获取店铺列表失败:", error);
	}
};

// 处理店铺切换
const handleShopChange = (shopId: string) => {
	state.currentShopId = shopId;
	// 可以在这里重新加载店铺相关数据
	loadShopData(shopId);
};

// 处理店铺选择
const handleShopSelect = (shop: any) => {
	console.log("切换到店铺:", shop.name);
	// 可以在这里执行其他逻辑
};

// 加载店铺数据
const loadShopData = (shopId: string) => {
	// 根据店铺ID加载相应的数据
	console.log("加载店铺数据:", shopId);
};

onMounted(() => {
	loadShopList();
});
</script>
```

## Props

| 参数          | 类型   | 默认值 | 说明              |
| ------------- | ------ | ------ | ----------------- |
| shops         | Shop[] | []     | 店铺列表数据      |
| currentShopId | string | ''     | 当前选中的店铺 ID |

## Events

| 事件名               | 参数           | 说明               |
| -------------------- | -------------- | ------------------ |
| update:currentShopId | shopId: string | 店铺 ID 更新时触发 |
| shopChange           | shop: Shop     | 选择店铺时触发     |

## Shop 接口

```typescript
interface Shop {
	id: string; // 店铺ID
	name: string; // 店铺名称
	address?: string; // 店铺地址（可选）
	status: "open" | "close" | "close_manual"; // 店铺状态
}
```

## 店铺状态

- `open`: 营业中（绿色圆点）
- `close`: 暂停营业（红色圆点）
- `close_manual`: 暂停营业(手动)（红色圆点）

## 样式定制

组件使用了 scoped 样式，如果需要自定义样式，可以通过以下方式：

```scss
// 在父组件中覆盖样式
.shop-switcher {
	.current-shop {
		// 自定义当前店铺显示样式
	}

	.shop-modal {
		// 自定义弹框样式
	}
}
```

## 注意事项

1. 确保 `up-modal` 和 `up-icon` 组件已正确引入
2. 店铺数据需要包含必要的字段（id, name, status）
3. 建议在店铺切换时重新加载相关数据
4. 组件会自动处理空数据状态显示
