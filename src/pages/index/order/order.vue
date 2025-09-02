<template>
	<pageWrapper :safeArea="0" :showFooter="true" :footerH="100">
		<view>
			<!-- 顶部：桌号选择 -->
			<view class="order-header">
				<up-button
					type="primary"
					shape="circle"
					size="small"
					@click="openTableSheet"
				>
					{{
						state.currentTableNo ? `桌号：${state.currentTableNo}` : "选择桌号"
					}}
				</up-button>
			</view>

			<!-- 商品分类与列表 -->
			<vertical-tabs
				v-model="state.activeTab"
				:tabs="state.tabs"
				:active-color="state.activeColor"
				:inactive-color="state.inactiveColor"
				:indicator-color="state.indicatorColor"
				height="calc(100vh)"
				:activeTab="state.activeTab"
				@click="handleCategoryClick"
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
						<!-- 用户点单页无需DIY价格卡、管理按钮 -->
					</view>
				</template>
				<template #actions="{ item }">
					<up-button
						type="primary"
						size="mini"
						class="action-btn"
						@click="openAddToCart(item)"
						>加入购物车</up-button
					>
				</template>
			</vertical-tabs>
		</view>

		<!-- 购物车弹框 -->
		<up-popup
			:show="ui.cartPopupShow"
			mode="bottom"
			@close="ui.cartPopupShow = false"
		>
			<view class="cart-popup">
				<view class="cart-header">
					<text class="title">购物车</text>
					<up-button
						type="default"
						size="mini"
						@click="ui.cartPopupShow = false"
						>X</up-button
					>
				</view>
				<view v-if="cart.items.length === 0" class="cart-empty"
					>购物车为空</view
				>
				<scroll-view v-else :scroll-y="true" style="max-height: 50vh">
					<view
						v-for="(ci, cidx) in cart.items"
						:key="ci.uid"
						class="cart-item"
					>
						<image
							:src="ci.photo || '/static/images/default-avatar.png'"
							class="cart-item-thumb"
							mode="aspectFill"
						/>
						<view class="cart-item-main">
							<text class="name">{{ ci.name }}</text>
							<text class="desc"
								>{{ ci.skuLabel
								}}<span v-if="ci.optionsSummary">
									· {{ ci.optionsSummary }}</span
								><span v-if="ci.ingredientsSummary">
									· {{ ci.ingredientsSummary }}</span
								></text
							>
							<view class="row">
								<text class="price">¥ {{ ci.unitPrice.toFixed(2) }}</text>
								<up-number-box
									v-model="ci.quantity"
									@change="onCartItemQtyChange(ci)"
									min="1"
									integer
								/>
							</view>
						</view>
						<up-button type="error" size="mini" @click="removeCartItem(cidx)"
							>删除</up-button
						>
					</view>
				</scroll-view>
				<view class="cart-footer">
					<text
						>合计：<text class="total"
							>¥ {{ cart.totalPrice.toFixed(2) }}</text
						></text
					>
					<up-button
						type="primary"
						shape="circle"
						@click="checkout"
						:disabled="cart.items.length === 0"
						>去结算</up-button
					>
				</view>
			</view>
		</up-popup>

		<!-- 加入购物车弹框（容量/选项/加料） -->
		<up-popup :show="ui.addToCartShow" mode="center" @close="closeAddToCart">
			<view class="sku-popup">
				<view class="sku-header">
					<text class="title">加入购物车</text>
					<up-button size="small" @click="closeAddToCart">X</up-button>
				</view>
				<view v-if="ui.currentProduct">
					<view class="sku-brief">
						<image
							:src="
								ui.currentProduct.photo || '/static/images/default-avatar.png'
							"
							class="sku-thumb"
							mode="aspectFill"
						/>
						<view class="sku-brief-info">
							<text class="name">{{ ui.currentProduct.name }}</text>
							<text class="desc">{{
								ui.currentProduct.description || ""
							}}</text>
						</view>
					</view>
					<!-- 容量（SKU） -->
					<view
						v-if="(ui.currentProduct.productSkus || []).length"
						class="sku-block"
					>
						<text class="label">容量</text>
						<up-radio-group
							v-model="form.selectedSkuId"
							placement="row"
							class="options"
						>
							<up-radio
								v-for="sku in ui.currentProduct.productSkus"
								:key="sku.id"
								:name="sku.id"
								:label="`${sku.size}${sku.unit} ¥${Number(sku.price).toFixed(
									2
								)}`"
							/>
						</up-radio-group>
					</view>
					<!-- 选项（冰度/甜度等） -->
					<view v-if="ui.currentProduct.productOptions" class="sku-block">
						<view
							v-for="(opts, key) in ui.currentProduct.productOptions"
							:key="String(key)"
							class="sku-sub-block"
						>
							<text class="label">{{ key }}</text>
							<up-radio-group
								v-model="form.optionsSelected[String(key)]"
								placement="row"
								class="options"
							>
								<up-radio
									v-for="opt in opts"
									:key="opt.id"
									:name="opt.value"
									:label="opt.value"
								/>
							</up-radio-group>
						</view>
					</view>
					<!-- 加料 -->
					<view
						v-if="(ui.currentProduct.productIngredients || []).length"
						class="sku-block"
					>
						<text class="label">加料</text>
						<up-checkbox-group
							v-model="form.ingredientsSelected"
							shape="square"
							class="options"
						>
							<up-checkbox
								v-for="ing in ui.currentProduct.productIngredients"
								:key="ing.id"
								:name="String(ing.id)"
								:label="`${ing.name} +¥${Number(ing.price).toFixed(2)}`"
							/>
						</up-checkbox-group>
					</view>
					<!-- 数量 -->
					<view class="sku-block row">
						<text class="label">数量</text>
						<up-number-box v-model="form.quantity" min="1" integer />
					</view>
					<up-button
						type="primary"
						shape="circle"
						class="submit-btn"
						@click="confirmAddToCart"
						>加入购物车</up-button
					>
				</view>
			</view>
		</up-popup>

		<!-- 桌号选择：action-sheet -->
		<up-action-sheet
			:show="ui.tableSheetShow"
			:actions="ui.tableActions"
			title="选择桌号"
			@close="ui.tableSheetShow = false"
			@select="onSelectTable"
		/>

		<!-- footer 槽位：购物车、备注、结算按钮 -->
		<template #footer>
			<view class="footer-bar">
				<view class="cart-icon" @click="ui.cartPopupShow = true">
					<up-icon name="shopping-cart" size="28" />
					<view v-if="cart.totalCount > 0" class="badge">{{
						cart.totalCount
					}}</view>
				</view>
				<up-input
					v-model="cart.remark"
					placeholder="输入订单备注"
					clearable
					style="flex: 1"
				/>
				<up-button
					type="primary"
					shape="circle"
					:disabled="cart.items.length === 0"
					@click="checkout"
					>结算 ¥ {{ cart.totalPrice.toFixed(2) }}</up-button
				>
			</view>
		</template>
	</pageWrapper>
</template>

<script setup lang="ts">
// @ts-nocheck
/* eslint-disable */
import { reactive, computed, onMounted } from "vue";
import VerticalTabs from "@/components/vertical-tabs/index.vue";
import { getProductCatalogAll, getProductList } from "@/api/product";

// 页面状态
const state = reactive({
	shopId: "",
	activeTab: 0 as any,
	currentMainType: "all",
	currentCategoryId: "",
	// 顶部主类切换
	mainTabs: [
		{ title: "常规点单", badge: "", type: "all" },
		{ title: "DIY酒料", badge: "", type: "diy" },
	],
	// 分类与样式
	tabs: [] as any[],
	activeColor: "#007aff",
	inactiveColor: "#666666",
	indicatorColor: "#007aff",
	// 桌号
	currentTableNo: "",
});

// UI
const ui = reactive({
	addToCartShow: false,
	currentProduct: null as any,
	cartPopupShow: false,
	tableSheetShow: false,
	tableActions: Array.from({ length: 20 }).map((_, i) => ({
		name: `A-${i + 1}`,
		value: `A-${i + 1}`,
	})),
});

// 购物车
const cart = reactive({
	items: [] as any[],
	remark: "",
	get totalCount() {
		return this.items.reduce((s, it) => s + Number(it.quantity || 0), 0);
	},
	get totalPrice() {
		return this.items.reduce(
			(s, it) => s + Number(it.unitPrice) * Number(it.quantity),
			0
		);
	},
});

// 表单
const form = reactive({
	selectedSkuId: undefined as any,
	optionsSelected: {} as Record<string, string>,
	ingredientsSelected: [] as string[],
	quantity: 1,
});

// 顶部主类切换
const handleMainTabClick = (tab: any) => {
	state.currentMainType = tab.type;
	if (tab.type === "diy") {
		const allTabs = state.tabs as any[];
		state.tabs = allTabs.filter((t) => t.parentMain === "diy");
		state.activeTab = 0;
	} else {
		GetCategoryList();
	}
};

// 点击分类
const handleCategoryClick = (event: { index: number; tab: any }) => {
	const { tab } = event;
	// 这里保留扩展入口
	console.log("点击分类:", tab?.name);
};

// 商品接口
const GetCategoryList = () => {
	getProductCatalogAll({ shopId: state.shopId }).then(async (res) => {
		if (res.data && Array.isArray(res.data)) {
			state.tabs = res.data.map((item: any) => ({
				id: item.id,
				name: item.name,
				parentMain: item.parentMain || "all",
				sort: item.sort || 0,
				status: item.status,
				shopId: item.shopId,
				createTime: item.createTime,
				modifyTime: item.modifyTime,
				children: [],
				hasLoaded: false,
			}));
			state.tabs.sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0));
			await getAllProductsForCategories();
		} else {
			state.tabs = [];
		}
	});
};

const getAllProductsForCategories = async () => {
	try {
		await Promise.all(
			state.tabs.map(async (tab: any) => {
				await GetProductList(tab.id);
			})
		);
	} catch (error) {}
};

const GetProductList = async (catalogId: string) => {
	try {
		const params = { shopId: state.shopId, catalogId } as any;
		const res = await getProductList(params);
		if (res.data && Array.isArray(res.data)) {
			const products = res.data || [];
			const targetTab = state.tabs.find((t: any) => t.id == catalogId);
			if (targetTab) {
				targetTab.children = products;
				targetTab.hasLoaded = true;
			}
		}
	} catch (error) {}
};

// 桌号
const openTableSheet = () => {
	ui.tableSheetShow = true;
};
const onSelectTable = (action: any) => {
	state.currentTableNo = action.value;
	ui.tableSheetShow = false;
	uni.showToast({ title: `已选择 ${action.name}`, icon: "none" });
};

// 加入购物车
const openAddToCart = (item: any) => {
	ui.currentProduct = item;
	form.selectedSkuId = item?.productSkus?.[0]?.id;
	form.optionsSelected = {};
	if (item?.productOptions) {
		Object.keys(item.productOptions).forEach((key) => {
			const first = item.productOptions[key]?.[0]?.value;
			if (first) form.optionsSelected[key] = first;
		});
	}
	form.ingredientsSelected = [];
	form.quantity = 1;
	ui.addToCartShow = true;
};
const closeAddToCart = () => {
	ui.addToCartShow = false;
};
const onCartItemQtyChange = (ci: any) => {
	if (ci.quantity <= 0) ci.quantity = 1;
};
const removeCartItem = (idx: number) => {
	cart.items.splice(idx, 1);
};
const confirmAddToCart = () => {
	if (!ui.currentProduct) return;
	const product = ui.currentProduct;
	const sku = (product.productSkus || []).find(
		(s: any) => s.id === form.selectedSkuId
	);
	const skuLabel = sku ? `${sku.size}${sku.unit}` : "";
	const optionsSummary = Object.keys(form.optionsSelected || {})
		.map((k) => `${k}:${form.optionsSelected[k]}`)
		.join("/");
	const chosenIngredients = (product.productIngredients || []).filter(
		(ing: any) => form.ingredientsSelected.includes(String(ing.id))
	);
	const ingredientsSummary = chosenIngredients
		.map((x: any) => x.name)
		.join("/");
	const extraPrice = chosenIngredients.reduce(
		(s: number, it: any) => s + Number(it.price || 0),
		0
	);
	const unitPrice = Number(sku?.price || 0) + extraPrice;
	const cartItem = {
		uid: `${product.id}-${sku?.id || "na"}-${Date.now()}`,
		productId: product.id,
		name: product.name,
		photo: product.photo,
		skuId: sku?.id,
		skuLabel,
		options: { ...form.optionsSelected },
		optionsSummary,
		ingredients: chosenIngredients.map((x: any) => ({
			id: x.id,
			name: x.name,
			price: x.price,
		})),
		ingredientsSummary,
		unitPrice,
		quantity: form.quantity,
	};
	cart.items.push(cartItem);
	ui.addToCartShow = false;
	uni.showToast({ title: "已加入购物车", icon: "success" });
};

// 结算
const checkout = () => {
	if (!state.currentTableNo) {
		uni.showToast({ title: "请先选择桌号", icon: "none" });
		return;
	}
	if (cart.items.length === 0) {
		uni.showToast({ title: "购物车为空", icon: "none" });
		return;
	}
	console.log("下单参数", {
		shopId: state.shopId,
		tableNo: state.currentTableNo,
		remark: cart.remark,
		items: cart.items.map((x) => ({
			productId: x.productId,
			skuId: x.skuId,
			quantity: x.quantity,
			options: x.options,
			ingredients: x.ingredients,
		})),
		totalAmount: cart.totalPrice,
	});
	uni.showToast({ title: "下单成功（示例）", icon: "success" });
	ui.cartPopupShow = false;
	cart.items = [];
	cart.remark = "";
};

// 生命周期
onMounted(() => {
	GetCategoryList();
});
</script>

<style scoped lang="scss">
.order-header {
	padding: 16rpx 24rpx;
}
.main-tabs-bar {
	display: flex;
	align-items: center;
	flex-direction: column;
	justify-content: space-between;
	.tab-item {
		flex: 1;
		text-align: center;
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
.top-content {
}
.action-btn {
	margin-top: 10rpx;
}

.footer-bar {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 12rpx 16rpx;
	background: #fff;
	border-top: 1px solid #f2f2f2;
	.cart-icon {
		position: relative;
	}
	.badge {
		position: absolute;
		right: -8rpx;
		top: -8rpx;
		background: #ff4d4f;
		color: #fff;
		border-radius: 999rpx;
		padding: 2rpx 8rpx;
		font-size: 22rpx;
	}
}

.cart-popup {
	padding: 24rpx;
}
.cart-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.cart-empty {
	padding: 40rpx 0;
	text-align: center;
	color: var(--text-3);
}
.cart-item {
	display: flex;
	gap: 16rpx;
	padding: 16rpx 0;
	border-bottom: 1px solid #f2f2f2;
}
.cart-item-thumb {
	width: 120rpx;
	height: 120rpx;
	border-radius: 12rpx;
}
.cart-item-main {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}
.cart-item-main .name {
	font-weight: 600;
}
.cart-item-main .desc {
	font-size: 24rpx;
	color: var(--text-3);
}
.cart-item-main .row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.price {
	color: var(--primary-6);
}
.cart-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 16rpx;
}
.cart-footer .total {
	color: var(--primary-6);
	font-weight: 600;
}

.sku-popup {
	width: 640rpx;
	max-width: 90vw;
	padding: 24rpx;
}
.sku-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.sku-brief {
	display: flex;
	gap: 16rpx;
	margin: 16rpx 0;
}
.sku-thumb {
	width: 140rpx;
	height: 140rpx;
	border-radius: 12rpx;
}
.sku-brief-info {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}
.sku-brief-info .name {
	font-weight: 600;
}
.sku-brief-info .desc {
	font-size: 24rpx;
	color: var(--text-3);
}
.sku-block {
	margin-top: 16rpx;
}
.sku-sub-block {
	margin-top: 8rpx;
}
.sku-block .label {
	font-weight: 600;
}
.options {
	margin-top: 12rpx;
	gap: 12rpx;
	flex-wrap: wrap;
}
.row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.submit-btn {
	margin-top: 20rpx;
}
</style>
