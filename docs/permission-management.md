# 权限管理系统使用文档

## 概述

本项目的权限管理系统基于角色 ID（roleId）进行权限控制，支持多种角色和细粒度的权限管理。

## 角色定义

### 1. 店主 (roleId: 10000000)

- 拥有所有店铺管理权限
- 包括：点单管理、游戏管理、桌位管理、门票管理、员工管理、店铺详情、店铺订单、数据分析、店铺二维码、报名审核

### 2. 店长 (roleId: 10000001)

- 拥有与店主相同的权限
- 包括：点单管理、游戏管理、桌位管理、门票管理、员工管理、店铺详情、店铺订单、数据分析、店铺二维码、报名审核

### 3. 调酒师 (roleId: 10000002)

- 拥有部分店铺管理权限
- 包括：点单管理、游戏管理、桌位管理、门票管理、店铺详情、店铺订单、数据分析、店铺二维码

### 4. 主理人 (roleId: 10000003)

- 拥有有限的店铺管理权限
- 包括：游戏管理、店铺详情、店铺订单、数据分析、店铺二维码

### 5. 普通用户

- 无店铺管理权限
- 不显示店铺相关的 tabbar 和功能

## 权限配置

权限配置位于 `src/consts/auth.ts` 文件中：

```typescript
export const ROLE_PERMISSIONS: RolePermission[] = [
	{
		roleId: 10000000,
		roleName: "店主",
		perms: [
			"shop/shopMenu", // 点单管理
			"shop/shopGames", // 游戏管理
			"shop/tableManage", // 桌位管理
			"shop/ticketSettings", // 门票管理
			"shop/shopStaff", // 员工管理
			// ... 更多权限
		],
	},
];
```

## 使用方法

### 1. 在组件中使用权限检查

```vue
<template>
	<!-- 根据权限显示内容 -->
	<view v-if="userStore.checkShopPermission()">
		<text>店铺管理内容</text>
	</view>

	<!-- 根据特定权限显示内容 -->
	<view v-if="userStore.checkPermission('shop/shopMenu')">
		<text>点单管理内容</text>
	</view>

	<!-- 无权限提示 -->
	<view v-else class="no-permission">
		<text>您暂无相关权限</text>
	</view>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores";

const userStore = useUserStore();
</script>
```

### 2. 使用权限工具函数

```typescript
import {
	checkShopPermission,
	checkPermission,
	checkAnyPermission,
	getUserRoleName,
} from "@/utils/permission";

// 检查店铺权限
const hasShop = checkShopPermission();

// 检查特定权限
const canManageMenu = checkPermission("shop/shopMenu");

// 检查多个权限中的任意一个
const canManageAny = checkAnyPermission(["shop/shopMenu", "shop/shopGames"]);

// 获取用户角色名称
const roleName = getUserRoleName();
```

### 3. 在 tabbar 中控制显示

tabbar 组件会自动根据用户权限显示或隐藏店铺 tab：

```typescript
// 在 src/components/page/tabbar.vue 中
const setupTabbar = computed(() => {
	const canSeeShop = userStore.checkShopPermission();
	const allTabs = [
		// ... 其他tab
		{
			text: "店铺",
			path: "/pages/shop/shop",
			needPerm: "shop", // 需要店铺权限
		},
	];

	return allTabs.filter((tab) => !tab.needPerm || canSeeShop);
});
```

### 4. 在页面中过滤功能列表

```typescript
// 根据权限过滤功能列表
const filteredCellList = computed(() => {
	return state.cellList
		.map((main) => ({
			...main,
			children: main.children.filter(
				(item) => !item.permission || userStore.checkPermission(item.permission)
			),
		}))
		.filter((main) => main.children.length > 0);
});
```

## 权限数据结构

用户信息中的权限数据结构：

```typescript
interface user {
	roleId?: number; // 角色ID
	perms?: string[]; // 权限列表，如 ['shop/shopMenu', 'shop/shopGames']
	permObj?: Record<string, boolean>; // 权限对象，如 { 'shop/shopMenu': true }
	roleName?: string; // 角色名称，如 "店主"
}
```

## 权限检查流程

1. 用户登录时，接口返回 `roleId`
2. 系统根据 `roleId` 自动生成对应的权限列表
3. 生成权限对象 `permObj` 用于快速权限检查
4. 在页面和组件中使用权限检查函数控制内容显示

## 扩展权限

如需添加新的权限，请按以下步骤操作：

1. 在 `src/consts/auth.ts` 中的 `ROLE_PERMISSIONS` 数组中添加新权限
2. 在功能配置中添加 `permission` 字段
3. 在页面中使用 `userStore.checkPermission()` 进行权限检查

## 注意事项

1. 权限检查应该在客户端和服务端都进行
2. 敏感操作必须进行权限验证
3. 权限变更后需要重新登录才能生效
4. 建议在关键功能入口处添加权限检查
