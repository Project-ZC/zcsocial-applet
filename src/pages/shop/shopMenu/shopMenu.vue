<template>
	<pageWrapper :safeArea="0">
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
						<view class="z-glass-card" v-show="state.currentMainType === 'diy'">
							<view>DIY酒水价格</view>
							<view>
								<up-input
									v-model="state.diyPrice"
									placeholder="请输入DIY酒水价格"
									type="number"
								></up-input>
							</view>
						</view>
						<view class="tab0-buttons">
							<up-button type="success" @click="openAddCategoryModal"
								>添加细分类</up-button
							>
							<up-button type="primary" @click="openAddDrinkModal"
								>添加商品</up-button
							>
						</view>
						<!-- DIY酒料空状态 -->
						<!-- <emptyData v-else text="当前细分类还没有酒水" subtext="请选择添加商品">
              <view class="empty-state-buttons">
              </view>
            </emptyData> -->

						<!-- <view class="empty-state" v-else-if="state.diyTypes.length === 0">
              <image src="/static/images/empty-category.png" mode="aspectFit"></image>
              <text>还没有创建DIY酒料分类</text>
              <up-button class="add-category-btn" @click="openAddDiyTypeModal">创建酒料分类</up-button>
            </view> -->
					</view>
				</template>
				<template #actions="{ item, index }">
					<up-button
						type="primary"
						size="mini"
						@click="editGoods(item, index)"
						class="action-btn"
					>
						编辑
					</up-button>
					<up-button
						type="error"
						size="mini"
						@click="deleteGoods(item, index)"
						class="action-btn"
					>
						删除
					</up-button>
					<up-button
						type="success"
						size="mini"
						@click="upGoods(item, index)"
						class="action-btn"
					>
						上移
					</up-button>
					<up-button
						type="warning"
						size="mini"
						@click="downGoods(item, index)"
						class="action-btn"
					>
						下移
					</up-button>
				</template>
			</vertical-tabs>
		</view>

		<!-- 细分分类模态框 -->
		<up-popup
			:show="state.showCategoryModal"
			mode="center"
			@close="closeCategoryModal"
		>
			<categoryContent
				v-if="state.showCategoryModal"
				:title="state.isEditingCategory ? '编辑细分类' : '添加细分类'"
				:type="state.isEditingCategory ? 'edit' : 'add'"
				:tabs="state.tabs"
				:activeTab="state.activeTab"
				@close="closeCategoryModal"
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
				v-if="state.showDrinkModal"
				:title="state.isEditingDrink ? '编辑商品' : '添加商品'"
				:type="state.isEditingDrink ? 'edit' : 'add'"
				:tabs="state.tabs"
				:activeTab="state.activeTab"
				@close="closeDrinkModal"
				:productFormData="state.productFormData"
				:categories="categories"
				:categoryActions="categoryActions"
			/>
		</up-popup>

		<!-- DIY酒料模态框 -->
		<up-popup
			:show="state.showDiyIngredientModal"
			mode="center"
			@close="closeDiyIngredientModal"
		>
			<diyProductContent
				v-if="state.showDiyIngredientModal"
				:title="state.isEditingDiyIngredient ? '编辑酒料' : '添加酒料'"
				:type="state.isEditingDiyIngredient ? 'edit' : 'add'"
				:diyTypes="state.diyTypes"
				:categoryActions="state.categoryActions"
				@close="closeDiyIngredientModal"
				:diyFormData="state.diyFormData"
			/>
		</up-popup>
	</pageWrapper>
</template>

<script lang="ts" setup>
import { reactive, ref, computed, onMounted } from "vue";
import VerticalTabs from "./components/vertical-tabs.vue";
import emptyData from "@/components/empty-data/index.vue";
import { ActionType as OrderActionType, OrderStatus } from "@/enums/order";
import Good from "./components/good.vue";
import categoryContent from "./components/categoryContent.vue";
import productContent from "./components/productContent.vue";
import diyProductContent from "./components/diyProductContent.vue";

// 商品列表数据
const state = reactive({
	diyPrice: "",
	list: [
		{ id: 1, label: "项目 A" },
		{ id: 2, label: "项目 B" },
		{ id: 3, label: "项目 C" },
		{ id: 4, label: "项目 D" },
		{ id: 5, label: "项目 E" },
		{ id: 6, label: "项目 F" },
		{ id: 7, label: "项目 G" },
		{ id: 8, label: "项目 H" },
	],
	activeTab: 0 as any,
	goodsList: [
		{
			id: "1",
			name: "经典奶茶",
			description: "香浓丝滑，经典口味",
			price: 18,
			image: "/static/images/default-avatar.png",
		},
		{
			id: "2",
			name: "珍珠奶茶",
			description: "Q弹珍珠，口感丰富",
			price: 22,
			image: "/static/images/default-avatar.png",
		},
		{
			id: "3",
			name: "水果茶",
			description: "新鲜水果，清爽解腻",
			price: 25,
			image: "/static/images/default-avatar.png",
		},
	],
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
	allTabs: [
		{
			title: "鸡尾酒",
			badge: "",
			type: "cocktail",
			parentMain: "all",
			sort: 2,
			children: [
				{
					orderNumber: "ORD20241201002",
					status: OrderStatus.PENDING_ACCEPT,
					image: "/static/images/logo.png",
					name: "鸡尾酒",
					description: "中杯",
					price: 22.0,
					quantity: 1,
					totalAmount: 22.0,
					createTime: new Date().getTime() - 2 * 60 * 60 * 1000,
					userNickname: "李四",
					userPhoneTail: "6666",
					tableNumber: "B08",
					type: "cocktail",
				},
				{
					orderNumber: "ORD20241201003",
					status: OrderStatus.PREPARING,
					image: "/static/images/logo.png",
					name: "鸡尾酒",
					description: "大杯",
					price: 45.0,
					quantity: 1,
					totalAmount: 45.0,
					createTime: new Date().getTime() - 3 * 60 * 60 * 1000,
					userNickname: "王五",
					userPhoneTail: "9999",
					tableNumber: "C15",
					actions: [{ type: OrderActionType.CONFIRM, text: "完成制作" }],
					type: "cocktail",
				},
				{
					orderNumber: "ORD20241201003",
					status: OrderStatus.PREPARING,
					image: "/static/images/logo.png",
					name: "鸡尾酒",
					description: "大杯",
					price: 45.0,
					quantity: 1,
					totalAmount: 45.0,
					createTime: new Date().getTime() - 3 * 60 * 60 * 1000,
					userNickname: "王五",
					userPhoneTail: "9999",
					tableNumber: "C15",
					actions: [{ type: OrderActionType.CONFIRM, text: "完成制作" }],
					type: "cocktail",
				},
				{
					orderNumber: "ORD20241201003",
					status: OrderStatus.PREPARING,
					image: "/static/images/logo.png",
					name: "鸡尾酒",
					description: "大杯",
					price: 45.0,
					quantity: 1,
					totalAmount: 45.0,
					createTime: new Date().getTime() - 3 * 60 * 60 * 1000,
					userNickname: "王五",
					userPhoneTail: "9999",
					tableNumber: "C15",
					actions: [{ type: OrderActionType.CONFIRM, text: "完成制作" }],
					type: "cocktail",
				},
				{
					orderNumber: "ORD20241201003",
					status: OrderStatus.PREPARING,
					image: "/static/images/logo.png",
					name: "鸡尾酒",
					description: "大杯",
					price: 45.0,
					quantity: 1,
					totalAmount: 45.0,
					createTime: new Date().getTime() - 3 * 60 * 60 * 1000,
					userNickname: "王五",
					userPhoneTail: "9999",
					tableNumber: "C15",
					actions: [{ type: OrderActionType.CONFIRM, text: "完成制作" }],
					type: "cocktail",
				},
				{
					orderNumber: "ORD20241201003",
					status: OrderStatus.PREPARING,
					image: "/static/images/logo.png",
					name: "鸡尾酒",
					description: "大杯",
					price: 45.0,
					quantity: 1,
					totalAmount: 45.0,
					createTime: new Date().getTime() - 3 * 60 * 60 * 1000,
					userNickname: "王五",
					userPhoneTail: "9999",
					tableNumber: "C15",
					actions: [{ type: OrderActionType.CONFIRM, text: "完成制作" }],
					type: "cocktail",
				},
				{
					orderNumber: "ORD20241201003",
					status: OrderStatus.PREPARING,
					image: "/static/images/logo.png",
					name: "鸡尾酒",
					description: "大杯",
					price: 45.0,
					quantity: 1,
					totalAmount: 45.0,
					createTime: new Date().getTime() - 3 * 60 * 60 * 1000,
					userNickname: "王五",
					userPhoneTail: "9999",
					tableNumber: "C15",
					actions: [{ type: OrderActionType.CONFIRM, text: "完成制作" }],
					type: "cocktail",
				},
				{
					orderNumber: "ORD20241201003",
					status: OrderStatus.PREPARING,
					image: "/static/images/logo.png",
					name: "鸡尾酒",
					description: "大杯",
					price: 45.0,
					quantity: 1,
					totalAmount: 45.0,
					createTime: new Date().getTime() - 3 * 60 * 60 * 1000,
					userNickname: "王五",
					userPhoneTail: "9999",
					tableNumber: "C15",
					actions: [{ type: OrderActionType.CONFIRM, text: "完成制作" }],
					type: "cocktail",
				},
				{
					orderNumber: "ORD20241201003",
					status: OrderStatus.PREPARING,
					image: "/static/images/logo.png",
					name: "鸡尾酒",
					description: "大杯",
					price: 45.0,
					quantity: 1,
					totalAmount: 45.0,
					createTime: new Date().getTime() - 3 * 60 * 60 * 1000,
					userNickname: "王五",
					userPhoneTail: "9999",
					tableNumber: "C15",
					actions: [{ type: OrderActionType.CONFIRM, text: "完成制作" }],
					type: "cocktail",
				},
				{
					orderNumber: "ORD20241201003",
					status: OrderStatus.PREPARING,
					image: "/static/images/logo.png",
					name: "鸡尾酒",
					description: "大杯",
					price: 45.0,
					quantity: 1,
					totalAmount: 45.0,
					createTime: new Date().getTime() - 3 * 60 * 60 * 1000,
					userNickname: "王五",
					userPhoneTail: "9999",
					tableNumber: "C15",
					actions: [{ type: OrderActionType.CONFIRM, text: "完成制作" }],
					type: "cocktail",
				},
			],
		},
		{
			title: "伏特加",
			badge: "",
			type: "vodka",
			parentMain: "all",
			sort: 1,
			children: [
				{
					orderNumber: "ORD20241201001",
					status: OrderStatus.PENDING_ACCEPT,
					image: "/static/images/logo.png",
					name: "伏特加",
					description: "大杯 / 加冰球 / 加柠檬 / 加薄荷 / 50°酒精",
					price: 28.0,
					quantity: 1,
					totalAmount: 28.0,
					createTime: new Date().getTime() - 30 * 60 * 1000,
					userNickname: "张三",
					userPhoneTail: "8888",
					tableNumber: "A12",
					type: "vodka",
				},
				{
					orderNumber: "ORD20241201001",
					status: OrderStatus.PENDING_ACCEPT,
					image: "/static/images/logo.png",
					name: "伏特加",
					description: "大杯 / 加冰球 / 加柠檬 / 加薄荷 / 50°酒精",
					price: 28.0,
					quantity: 1,
					totalAmount: 28.0,
					createTime: new Date().getTime() - 30 * 60 * 1000,
					userNickname: "张三",
					userPhoneTail: "8888",
					tableNumber: "A12",
					type: "vodka",
				},
				{
					orderNumber: "ORD20241201001",
					status: OrderStatus.PENDING_ACCEPT,
					image: "/static/images/logo.png",
					name: "伏特加",
					description: "大杯 / 加冰球 / 加柠檬 / 加薄荷 / 50°酒精",
					price: 28.0,
					quantity: 1,
					totalAmount: 28.0,
					createTime: new Date().getTime() - 30 * 60 * 1000,
					userNickname: "张三",
					userPhoneTail: "8888",
					tableNumber: "A12",
					type: "vodka",
				},
				{
					orderNumber: "ORD20241201001",
					status: OrderStatus.PENDING_ACCEPT,
					image: "/static/images/logo.png",
					name: "伏特加",
					description: "大杯 / 加冰球 / 加柠檬 / 加薄荷 / 50°酒精",
					price: 28.0,
					quantity: 1,
					totalAmount: 28.0,
					createTime: new Date().getTime() - 30 * 60 * 1000,
					userNickname: "张三",
					userPhoneTail: "8888",
					tableNumber: "A12",
					type: "vodka",
				},
				{
					orderNumber: "ORD20241201001",
					status: OrderStatus.PENDING_ACCEPT,
					image: "/static/images/logo.png",
					name: "伏特加",
					description: "大杯 / 加冰球 / 加柠檬 / 加薄荷 / 50°酒精",
					price: 28.0,
					quantity: 1,
					totalAmount: 28.0,
					createTime: new Date().getTime() - 30 * 60 * 1000,
					userNickname: "张三",
					userPhoneTail: "8888",
					tableNumber: "A12",
					type: "vodka",
				},
				{
					orderNumber: "ORD20241201001",
					status: OrderStatus.PENDING_ACCEPT,
					image: "/static/images/logo.png",
					name: "伏特加",
					description: "大杯 / 加冰球 / 加柠檬 / 加薄荷 / 50°酒精",
					price: 28.0,
					quantity: 1,
					totalAmount: 28.0,
					createTime: new Date().getTime() - 30 * 60 * 1000,
					userNickname: "张三",
					userPhoneTail: "8888",
					tableNumber: "A12",
					type: "vodka",
				},
				{
					orderNumber: "ORD20241201001",
					status: OrderStatus.PENDING_ACCEPT,
					image: "/static/images/logo.png",
					name: "伏特加",
					description: "大杯 / 加冰球 / 加柠檬 / 加薄荷 / 50°酒精",
					price: 28.0,
					quantity: 1,
					totalAmount: 28.0,
					createTime: new Date().getTime() - 30 * 60 * 1000,
					userNickname: "张三",
					userPhoneTail: "8888",
					tableNumber: "A12",
					type: "vodka",
				},
				{
					orderNumber: "ORD20241201001",
					status: OrderStatus.PENDING_ACCEPT,
					image: "/static/images/logo.png",
					name: "伏特加",
					description: "大杯 / 加冰球 / 加柠檬 / 加薄荷 / 50°酒精",
					price: 28.0,
					quantity: 1,
					totalAmount: 28.0,
					createTime: new Date().getTime() - 30 * 60 * 1000,
					userNickname: "张三",
					userPhoneTail: "8888",
					tableNumber: "A12",
					type: "vodka",
				},
			],
		},
		{
			title: "diy酒",
			badge: "",
			type: "diy",
			parentMain: "diy",
			sort: 3,
			children: [
				{
					orderNumber: "ORD20241201001",
					status: OrderStatus.PENDING_ACCEPT,
					image: "/static/images/logo.png",
					name: "diy酒品",
					description: "大杯 / 加冰球 / 加柠檬 / 加薄荷 / 50°酒精",
					price: 28.0,
					quantity: 1,
					totalAmount: 28.0,
					createTime: new Date().getTime() - 30 * 60 * 1000,
					userNickname: "张三",
					userPhoneTail: "8888",
					tableNumber: "A12",
					type: "diy",
				},
			],
		},
	],
	tabs: [],
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

	diyTypeRules: {
		name: {
			required: true,
			message: "请输入分类名称",
			trigger: ["blur", "change"],
		},
		sort: {
			required: true,
			message: "请输入排序数字",
			trigger: ["blur", "change"],
		},
	},

	diyFormData: {} as any,
	productFormData: {} as any,
	categoryFormData: {} as any,
});

const handleTabLongpress = (index, tab) => {
	console.log("longpress", index, tab);
};

const handleMainTabClick = (tab) => {
	state.currentMainType = tab.type;
	state.tabs = state.allTabs.filter(
		(tab) => tab.parentMain === state.currentMainType
	);
	state.activeTab = 0;
};

// 编辑商品
const editGoods = (item, index: number) => {
	state.showDrinkModal = true;
	state.isEditingDrink = true;
	state.productFormData = {
		...item,
	};
};

// 删除商品
const deleteGoods = (item, index: number) => {
	uni.showModal({
		title: "确认删除",
		content: `确定要删除商品"${item.name}"吗？`,
		success: (res) => {
			if (res.confirm) {
				state.goodsList.splice(index, 1);
				uni.showToast({
					title: "删除成功",
					icon: "success",
				});
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

// 细分类列表：根据当前主类过滤
const categories = computed(() => {
	const currentMain =
		state.activeTab === ""
			? state.tabs[state.activeTab]?.type
			: (state.tabs[state.activeTab] as any)?.parentMain;
	const temp = state.tabs.filter(
		(tab: any, index) => tab.parentMain === currentMain
	);
	if (temp.length > 0) {
		state.productFormData.categoryId = temp[0].type;
		state.productFormData.categoryName = temp[0].title;
	}
	return temp;
});

// 分类动作数据，用于up-action-sheet
const categoryActions = computed(() => {
	return categories.value.map((category, index) => ({
		name: category.title,
		value: category.type,
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
};

// 关闭添加编辑酒水弹框
const closeDrinkModal = () => {
	state.showDrinkModal = false;
	state.isEditingDrink = false;
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
	console.log("currentTab", currentTab);
	if (currentTab?.parentMain === "diy") {
		state.showDiyIngredientModal = true;
		state.isEditingDiyIngredient = false;
	} else {
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
			content: `确定要删除分类"${currentTab.title}"吗？删除后无法恢复。`,
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
	console.log(1234);
	const currentTab = state.tabs[state.activeTab];
	console.log(currentTab);
	if (currentTab) {
		state.isEditingCategory = true;
		state.categoryFormData.id = currentTab.type;
		state.categoryFormData.name = currentTab.title;
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
			content: `确定要删除分类"${currentTab.title}"吗？删除后无法恢复。`,
			success: (res) => {
				if (res.confirm) {
					// 从tabs中移除当前分类
					state.tabs.splice(state.activeTab, 1);
					// 如果删除的是最后一个分类，回到第一个
					if (state.activeTab >= state.tabs.length) {
						state.activeTab = 0;
					}
					uni.showToast({
						title: "分类已删除",
						icon: "success",
					});
				}
			},
		});
	}
};

const closeDiyIngredientModal = () => {
	state.showDiyIngredientModal = false;
};

// 生命周期钩子
onMounted(() => {
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
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 20rpx 0;
	gap: 20rpx;
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
