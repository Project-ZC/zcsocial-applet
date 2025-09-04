<template>
	<pageWrapper :safeArea="0">
		<!-- <drag v-model:list="state.list" :height="32">
			<template #default="{ item, index }">
				<view>
					<text>{{ item.label }}</text>
				</view>
			</template>
		</drag> -->
		<!-- DIY酒料空状态 -->
		<!-- <view class="empty-state" v-else-if="state.diyTypes.length === 0">
			<image src="/static/images/empty-category.png" mode="aspectFit"></image>
			<text>还没有创建DIY酒料分类</text>
			<up-button class="add-category-btn" @click="openAddDiyTypeModal">创建酒料分类</up-button>
		</view> -->
		<view>
			<vertical-tabs
				v-model="state.activeTab"
				:tabs="state.tabs"
				:active-color="state.activeColor"
				:inactive-color="state.inactiveColor"
				:indicator-color="state.indicatorColor"
				height="calc(100vh)"
				:activeTab="state.activeTab"
				@longpress="handleTabLongpress"
				@editCurrentCategory="editCurrentCategory"
				@deleteCurrentCategory="deleteCurrentCategory"
				@openAddDrinkModal="openAddDrinkModal"
				@openAddCategoryModal="openAddCategoryModal"
				@click="handleCategoryClick"
				:currentMainType="state.currentMainType"
				@swipeClick="swipeClick"
			>
				<template #tabs>
					<view class="main-tabs-bar">
						<view
							class="tab-item"
							v-for="(tab, index) in state.mainTabs"
							:key="index"
							@click="handleMainTabClick(tab)"
							:class="{
								'tab-item--active': state.currentMainType === tab.type,
							}"
						>
							<text>{{ tab.title }}</text>
						</view>
					</view>
				</template>
				<template #content>
					<view class="top-content">
						<view
							class="z-glass-card diy-price-card"
							v-if="state.currentMainType === 'diy'"
						>
							<view class="card-header">
								<text class="card-title">DIY酒水价格</text>
								<!-- <text class="card-subtitle">用于该分类下商品的默认定价</text> -->
							</view>
							<view class="price-input-row">
								<text class="currency">¥</text>
								<up-input
									size="small"
									v-model="state.diyPrice"
									placeholder="用于该分类下商品的默认定价"
									type="digit"
									@blur="saveDiyPrice"
									style="flex: 1"
								></up-input>
								<text class="unit">元/杯</text>
							</view>
						</view>
						<view class="tab0-buttons z-glass-card">
							<up-button
								type="success"
								shape="circle"
								@click="openAddCategoryModal"
								>添加细分类</up-button
							>
							<up-button
								type="primary"
								shape="circle"
								@click="openAddDrinkModal"
								>添加商品</up-button
							>
						</view>
					</view>
				</template>
				<!-- <template #actions="{ item, index }"> -->
				<!-- <up-button
						type="success"
						size="mini"
						@click="upGoods(item, index)"
						class="action-btn"
						>上移</up-button
					>
					<up-button
						type="warning"
						size="mini"
						@click="downGoods(item, index)"
						class="action-btn"
						>下移</up-button
					> -->
				<!-- </template> -->
			</vertical-tabs>
		</view>

		<!-- 细分分类模态框 -->
		<up-popup
			:show="state.showCategoryModal"
			mode="center"
			@close="closeCategoryModal"
		>
			<categoryContent
				:title="state.isEditingCategory ? '编辑细分类' : '添加细分类'"
				:type="state.isEditingCategory ? 'edit' : 'add'"
				:tabs="state.tabs"
				:activeTab="state.activeTab"
				@close="closeCategoryModal"
				:shopId="state.shopId"
				@callback="GetCategoryList"
				:categoryFormData="state.categoryFormData"
			/>
		</up-popup>

		<!-- 添加商品酒水模态框 -->
		<up-popup
			:show="state.showDrinkModal"
			mode="center"
			@close="closeDrinkModal"
		>
			<productContent
				:title="state.isEditingDrink ? '编辑商品' : '添加商品'"
				:type="state.isEditingDrink ? 'edit' : 'add'"
				:tabs="state.tabs"
				:activeTab="state.activeTab"
				@close="closeDrinkModal"
				:productFormData="state.productFormData"
				:categories="categories"
				:categoryActions="categoryActions"
				:shopId="state.shopId"
				@callback="GetProductList"
			/>
		</up-popup>

		<!-- DIY酒料模态框 -->
		<up-popup
			:show="state.showDiyIngredientModal"
			mode="center"
			@close="closeDiyIngredientModal"
		>
			<diyProductContent
				:title="state.isEditingDiyIngredient ? '编辑酒料' : '添加酒料'"
				:type="state.isEditingDiyIngredient ? 'edit' : 'add'"
				:diyTypes="state.diyTypes"
				:categoryActions="state.categoryActions"
				@close="closeDiyIngredientModal"
				:diyFormData="state.diyFormData"
				:shopId="state.shopId"
			/>
		</up-popup>
	</pageWrapper>
</template>

<script lang="ts" setup>
import { reactive, ref, computed, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import VerticalTabs from "@/components/vertical-tabs/index.vue";
import categoryContent from "./components/categoryContent.vue";
import productContent from "./components/productContent.vue";
import diyProductContent from "./components/diyProductContent.vue";
import drag from "@/components/drag/index.vue";

import {
	getProductCatalogAll,
	getProductList,
	deleteProductCatalog,
	deleteProduct,
} from "@/api/product";

// 商品列表数据
const state = reactive({
	shopId: "",
	diyPrice: "",
	list: [
		{ id: 1, label: "项目 A" },
		{ id: 2, label: "项目 B" },
		{ id: 3, label: "项目 C" },
		{ id: 4, label: "项目 D" },
	],
	activeTab: 0 as any,
	currentMainType: "all",
	currentCategoryId: "",
	// DIY酒料分类数据
	diyTypes: [] as any[],
	// 订单数据
	orders: [],
	mainTabs: [
		{
			title: "常规点单",
			badge: "3",
			type: "all",
		},
		{
			title: "DIY酒料",
			badge: "",
			type: "diy",
		},
	],
	// 移除硬编码的 allTabs，改为从接口获取
	tabs: [] as any[],
	// 颜色配置
	activeColor: "#007aff",
	inactiveColor: "#666666",
	indicatorColor: "#007aff",
	currentDiyTypeId: "1",
	showCategoryModal: false,
	isEditingCategory: false,
	// 展示商品模态框
	showDrinkModal: false,
	isEditingDrink: false,
	// 展示DIY酒料模态框
	showDiyIngredientModal: false,
	isEditingDiyIngredient: false,

	diyFormData: {} as any,
	productFormData: {} as any,
	categoryFormData: {} as any,
});

// 处理排序变化
const onSortChange = (newList, oldIndex, newIndex) => {
	console.log("排序变化:", {
		原位置: oldIndex,
		新位置: newIndex,
		新列表: newList,
	});

	uni.showToast({
		title: "排序已更新",
		icon: "success",
	});
};

const swipeClick = (e: any, item: any, index: number) => {
	switch (e.index) {
		case 0:
			editGoods(item, index);
			break;
		case 1:
			deleteGoods(item, index);
			break;
		default:
			break;
	}
};

const handleTabLongpress = (index, tab) => {
	console.log("longpress", index, tab);
};

const handleMainTabClick = (tab) => {
	state.currentMainType = tab.type;
	// 获取所有分类数据（包括已加载的商品数据）
	const allTabs = state.tabs;

	// 根据主类型过滤分类
	if (tab.type === "diy") {
		// DIY酒料类型，可以设置特殊的分类
		state.tabs = allTabs.filter((tab) => tab.parentMain === "diy");
	} else {
		// 常规点单类型，显示所有分类
		// state.tabs = allTabs.filter(tab => tab.parentMain === 'all' || !tab.parentMain);
		GetCategoryList();
	}

	state.activeTab = 0;

	console.log(`切换到${tab.title}，当前显示 ${state.tabs.length} 个分类`);
	// 显示每个分类的商品数量
	state.tabs.forEach((tab) => {
		console.log(`分类 ${tab.title}: ${tab.children.length} 个商品`);
	});
};

// 编辑商品
const editGoods = (item, index: number) => {
	console.log(item, index, 111);
	state.productFormData = {
		...item,
	};
	state.isEditingDrink = true;
	state.showDrinkModal = true;
};

// 删除商品
const deleteGoods = (item, index: number) => {
	uni.showModal({
		title: "确认删除",
		content: `确定要删除商品"${item.name}"吗？`,
		success: async (res) => {
			if (res.confirm) {
				try {
					await deleteProduct({ id: item.id });
					GetProductList(item.catalogId);
					uni.showToast({
						title: "删除成功",
						icon: "success",
					});
				} catch (error) {}
			}
		},
	});
};

const upGoods = (item, index: number) => {
	console.log("上移商品:", item, index);
};

const downGoods = (item, index: number) => {
	console.log("下移商品:", item, index);
};

//  ------ 细分类-------
const GetCategoryList = () => {
	getProductCatalogAll({ shopId: state.shopId }).then(async (res) => {
		// 转换接口返回的数据结构，适配 vertical-tabs 组件
		if (res.data && Array.isArray(res.data)) {
			state.tabs = res.data.map((item) => ({
				id: item.id,
				name: item.name,
				parentMain: item.parentMain || "all", // 使用接口返回的 parentMain
				sort: item.sort || 0,
				status: item.status,
				shopId: item.shopId,
				createTime: item.createTime,
				modifyTime: item.modifyTime,
				children: [], // 商品列表，后续可以单独获取
				hasLoaded: false, // 标记是否已加载过商品数据
			}));

			// 按 sort 字段排序
			state.tabs.sort((a, b) => (a.sort || 0) - (b.sort || 0));

			console.log("转换后的tabs:", state.tabs);

			// 一次性获取所有分类的商品数据
			await getAllProductsForCategories();
		} else {
			state.tabs = [];
		}
	});
};

// 一次性获取所有分类的商品数据
const getAllProductsForCategories = async () => {
	try {
		// 并行获取所有分类的商品数据
		const productPromises = state.tabs.map(async (tab) => {
			// 直接复用单分类获取方法，避免重复代码
			await GetProductList(tab.id);
		});

		// 等待所有商品数据获取完成
		await Promise.all(productPromises);
		console.log("最终的tabs数据:", state.tabs);
	} catch (error) {
		console.error("获取所有分类商品数据失败:", error);
	}
};

// 获取分类下的商品列表
const GetProductList = async (catalogId: string) => {
	try {
		const params = {
			shopId: state.shopId,
			catalogId: catalogId,
		};

		const res = await getProductList(params);

		if (res.data && Array.isArray(res.data)) {
			// 转换商品数据格式
			// const products = res.data.map((item) => ({
			// 	id: item.id || Math.random(),
			// 	name: item.name,
			// 	description: item.description || "",
			// 	price: item.price || 0,
			// 	image:
			// 		item.photo && item.photo.length > 0
			// 			? item.photo[0]
			// 			: "/static/images/default-avatar.png",
			// 	stage: item.stage, // 上下架状态
			// 	photo: item.photo || [], // 图片数组
			// 	shopId: item.shopId,
			// }));
			const products = res.data || [];
			// 找到对应的分类并更新 children
			const targetTab = state.tabs.find((tab) => tab.id == catalogId);
			if (targetTab) {
				targetTab.children = products;
				targetTab.hasLoaded = true; // 标记为已加载
				console.log(`分类 ${targetTab.name} 的商品数据已更新:`, products);
			}
		}
	} catch (error) {}
};

// 处理分类点击事件
const handleCategoryClick = (event: { index: number; tab: any }) => {
	const { index, tab } = event;
	console.log("点击分类:", tab);
	// 所有数据已经预加载，这里可以添加其他逻辑
	// 比如更新当前选中的分类、显示加载状态等
	console.log(`分类 ${tab.name} 的商品数量: ${tab.children.length}`);
};

// 细分类列表：根据当前主类过滤
const categories = computed(() => {
	// 根据当前主类型过滤分类
	// const currentMain = state.currentMainType;
	const temp = state.tabs.filter((tab: any) => {
		// if (currentMain === 'diy') {
		//   return tab.parentMain === 'diy';
		// } else {
		//   return tab.parentMain === 'all' || !tab.parentMain;
		// }
		return tab;
	});
	return temp;
});

// 分类动作数据，用于up-action-sheet
const categoryActions = computed(() => {
	return categories.value.map((category, index) => ({
		name: category.name,
		value: category.id,
		disabled: false,
	}));
});

// 添加细分分类
const openAddCategoryModal = () => {
	// 重置并打开细分类新增
	state.isEditingCategory = false;
	state.showCategoryModal = true;
};

// 关闭添加编辑分类弹框
const closeCategoryModal = () => {
	state.showCategoryModal = false;
	state.isEditingCategory = false;
	state.categoryFormData = {};
};

// 关闭添加编辑酒水弹框
const closeDrinkModal = () => {
	state.showDrinkModal = false;
	state.isEditingDrink = false;
	state.productFormData = {};
};

// 打开添加编辑酒水弹框
const openAddDrinkModal = () => {
	// 仅细分类下可添加商品
	if (
		state.tabs.length === 0 ||
		state.activeTab === undefined ||
		state.activeTab === null
	) {
		uni.showToast({ title: "请选择细分类", icon: "none" });
		return;
	}
	const currentTab: any = state.tabs[state.activeTab];
	if (currentTab?.parentMain === "diy") {
		state.diyFormData = {};
		state.showDiyIngredientModal = true;
		state.isEditingDiyIngredient = false;
	} else {
		state.productFormData = {};
		state.showDrinkModal = true;
		state.isEditingDrink = false;
	}
};

// 删除分类
const deleteCategory = () => {
	// 仅当当前是细分类时可删除
	if (state.activeTab !== "") {
		const currentTab = state.tabs[state.activeTab];
		uni.showModal({
			title: "确认删除",
			content: `确定要删除分类"${currentTab.name}"吗？删除后无法恢复。`,
			success: (res) => {
				if (res.confirm) {
					state.tabs.splice(state.activeTab, 1);
					if (state.activeTab >= state.tabs.length) state.activeTab = "";
					uni.showToast({ title: "分类已删除", icon: "success" });
				}
			},
		});
	}
};

// 编辑当前分类
const editCurrentCategory = () => {
	console.log("编辑分类");
	const currentTab = state.tabs[state.activeTab];
	console.log("当前分类:", currentTab);
	if (currentTab) {
		state.isEditingCategory = true;
		state.categoryFormData.id = currentTab.id;
		state.categoryFormData.name = currentTab.name;
		state.categoryFormData.sort = Number(currentTab.sort ?? 0);
		state.showCategoryModal = true;
	}
};

// 删除当前分类
const deleteCurrentCategory = () => {
	const currentTab = state.tabs[state.activeTab];
	if (currentTab) {
		uni.showModal({
			title: "确认删除",
			content: `确定要删除分类"${currentTab.name}"吗？删除后无法恢复。`,
			success: async (res) => {
				if (res.confirm) {
					// 从tabs中移除当前分类
					// state.tabs.splice(state.activeTab, 1);
					try {
						await deleteProductCatalog({ id: currentTab.id });
						// 如果删除的是最后一个分类，回到第一个
						// if (state.activeTab >= state.tabs.length) {
						state.activeTab = 0;
						// }
						GetCategoryList();
						uni.showToast({
							title: "分类已删除",
							icon: "success",
						});
					} catch (error) {}
				}
			},
		});
	}
};

const closeDiyIngredientModal = () => {
	state.showDiyIngredientModal = false;
};

// 生命周期钩子
onLoad((options) => {
	state.shopId = options.shopId;
	// 先获取分类列表
	GetCategoryList();
	// 设置默认主类型为常规点单
	handleMainTabClick(state.mainTabs[0]);
});

defineOptions({
	options: {
		styleIsolation: "shared",
	},
});
</script>

<style lang="scss" scoped>
.top-content {
	// position: sticky;
	// top: 0;
	// z-index: 1;
}
.main-tabs-bar {
	display: flex;
	align-items: center;
	flex-direction: column;
	justify-content: space-between;

	.tab-item {
		flex: 1;
		text-align: center;
		// font-size: $up-font-md;
		font-weight: 600;
		height: 100rpx;
		line-height: 100rpx;
		color: var(--text-2);
		border-radius: 10rpx;
		padding: 0 20rpx;
		box-sizing: border-box;
		&--active {
			background-color: var(--primary-6);
			color: #fff;
		}
	}
}

.tab0-buttons {
	display: flex;
	// justify-content: flex-end;
	justify-content: space-between;
	align-items: center;
	padding: 10rpx 60rpx;
	gap: 16rpx;
	box-sizing: border-box;
	:deep(.u-button) {
		width: 220rpx;
		height: 60rpx;
		margin: 0;
	}
}

.diy-price-card {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	padding: 12rpx 20rpx;
}

.card-header {
	display: flex;
	flex-direction: column;
}

.card-title {
	font-size: $up-font-md;
	font-weight: 600;
	color: var(--text-1);
}

.card-subtitle {
	margin-top: 6rpx;
	font-size: 24rpx;
	color: var(--text-3);
}

.price-input-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-top: -14rpx;
	:deep(.u-input) {
		height: 34rpx;
	}
}

.currency {
	font-size: 32rpx;
	color: var(--text-2);
}

.unit {
	margin-left: 8rpx;
	font-size: 26rpx;
	color: var(--text-3);
}
.empty-state-buttons {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 20rpx;
	margin-top: 20rpx;
}

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 100rpx;
	padding: 0 10rpx;
	margin-bottom: 20rpx;
}

.back-btn {
	width: 70rpx;
	height: 70rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: rgba(255, 255, 255, 0.9);
	border-radius: 50%;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.08);
}

.back-btn image {
	width: 36rpx;
	height: 36rpx;
}

.title {
	font-size: 38rpx;
	font-weight: 600;
	color: #333;
}

.action-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 15rpx;
	border-radius: 50%;
	background-color: #f7f8fa;
	margin-top: 10rpx;
}

.action-btn image {
	width: 32rpx;
	height: 32rpx;
}

.edit-btn {
	color: #1989fa;
}

.edit-btn::after {
	content: "";
	position: absolute;
	right: 0;
	top: 25%;
	height: 50%;
	width: 1rpx;
	background-color: rgba(0, 0, 0, 0.05);
}

.delete-btn {
	color: #ff3b30;
}

/* 空状态 */
.empty-state {
	padding: 100rpx 50rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.empty-state image {
	width: 280rpx;
	height: 280rpx;
	margin-bottom: 30rpx;
	opacity: 0.8;
}

.empty-state text {
	font-size: 30rpx;
	color: #999;
	margin-bottom: 40rpx;
}
</style>
