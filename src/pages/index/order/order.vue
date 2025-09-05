<template>
	<pageWrapper :safeArea="0" :showFooter="true">
		<view>
			<!-- 顶部：桌号选择 -->
			<view class="order-header" v-if="state.isLoaded">
				<view class="table-selector">
					<view class="table-selector__label">桌号</view>
					<view class="table-selector__content" @click="openTableSheet">
						<text class="table-selector__text">
							{{ state.currentTableNo || "请选择桌号" }}
						</text>
						<up-icon name="arrow-down" size="16" color="#666" />
					</view>
				</view>
			</view>

			<!-- 商品分类与列表 -->
			<vertical-tabs
				v-if="state.isLoaded"
				v-model="state.activeTab"
				:tabs="state.tabs"
				:active-color="state.activeColor"
				:inactive-color="state.inactiveColor"
				:indicator-color="state.indicatorColor"
				height="calc(100vh - 200rpx)"
				@click="handleCategoryClick"
				:activeTab="state.activeTab"
				@openAddToCart="openAddToCart"
				:isEdit="false"
				:showActionBtn="true"
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
			</vertical-tabs>
		</view>

		<!-- footer 槽位：购物车、备注、结算按钮 -->
		<template #footer>
			<view class="footer-bar">
				<view class="cart-icon" @click="state.cartPopupShow = true">
					<up-icon name="shopping-cart" size="40" />
					<view v-if="cart.totalCount > 0" class="badge">{{
						cart.totalCount
					}}</view>
				</view>
				<!-- <up-input v-model="cart.remark" placeholder="输入订单备注" clearable style="flex: 1" /> -->
				<up-button
					type="primary"
					shape="circle"
					:disabled="cart.items.length === 0"
					@click="checkout"
				>
					结算 ¥ {{ cart.totalPrice }}
				</up-button>
			</view>
		</template>
	</pageWrapper>

	<!-- 加入购物车弹框（容量/选项/加料） -->
	<up-popup :show="state.addToCartShow" mode="bottom" @close="closeAddToCart">
		<view class="z-modal">
			<view class="modal-header">
				<text class="title modal-title">加入购物车</text>
				<view class="close-btn" @click="closeAddToCart">
					<up-icon name="close" size="22" />
				</view>
			</view>
			<scroll-view scroll-y="true">
				<view class="modal-body" v-if="state.currentProduct">
					<view class="sku-brief">
						<view class="sku-thumb">
							<up-image
								width="140rpx"
								height="140rpx"
								:src="getDownloadUrl(state.currentProduct.photo)"
							/>
						</view>
						<view class="sku-brief-info">
							<text class="name">{{ state.currentProduct.name }}</text>
							<text class="desc">{{
								state.currentProduct.description || ""
							}}</text>
						</view>
					</view>
					<!-- 容量（SKU） -->
					<view
						v-if="(state.currentProduct.productSkus || []).length"
						class="sku-block"
					>
						<text class="label">容量</text>
						<up-radio-group
							v-model="form.selectedSkuId"
							placement="row"
							class="options"
						>
							<up-radio
								v-for="sku in state.currentProduct.productSkus"
								:key="sku.id"
								:name="sku.id"
								:label="`${sku.size}${sku.unit}`"
								class="z-cart-item"
								:class="{
									'z-cart-item--checked': form.selectedSkuId === sku.id,
								}"
							/>
						</up-radio-group>
					</view>
					<!-- 选项（冰度/甜度等） -->
					<view v-if="state.currentProduct.productOptions" class="sku-block">
						<view
							v-for="(opts, key) in state.currentProduct.productOptions"
							:key="key"
							class="sku-sub-block"
						>
							<text class="label">{{ key }}</text>
							<up-radio-group
								v-model="form.optionsSelected[key]"
								placement="row"
								class="options"
							>
								<up-radio
									v-for="opt in opts"
									:key="opt.id"
									:name="opt.value"
									:label="opt.value"
									class="z-cart-item"
									:class="{
										'z-cart-item--checked':
											form.optionsSelected[key] === opt.value,
									}"
								/>
							</up-radio-group>
						</view>
					</view>
					<!-- 加料 -->
					<view
						v-if="state.currentProduct.productIngredients?.length"
						class="sku-block"
					>
						<text class="label">加料</text>
						<up-checkbox-group
							v-model="form.ingredientsSelected"
							shape="square"
							class="options"
						>
							<up-checkbox
								v-for="ing in state.currentProduct.productIngredients"
								:key="ing.id"
								:label="ing.name"
								:name="ing.id"
								class="z-cart-item"
								:class="{
									'z-cart-item--checked': form.ingredientsSelected.includes(
										ing.id
									),
								}"
							/>
						</up-checkbox-group>
					</view>
					<!-- 数量 -->
				</view>
			</scroll-view>

			<view
				class="modal-footer"
				style="flex-direction: column; gap: 10rpx; height: 160rpx"
			>
				<view class="sku-block row">
					<!-- <text class="label"
						>总价：¥{{ formatPrice(calculateTotalPrice()) }}</text
					> -->
					<text class="label">价格：¥{{ getCurrentPrice() }}</text>
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
	<!-- 购物车弹框footer按钮 -->
	<up-popup
		:show="state.cartPopupShow"
		mode="bottom"
		@close="state.cartPopupShow = false"
	>
		<view class="z-modal">
			<view class="cart-header modal-header">
				<text class="modal-title">购物车</text>
				<view class="cart-header-actions">
					<text class="clear-cart" @click="clearCart">清空</text>
					<view class="close-btn" @click="state.cartPopupShow = false">
						<up-icon name="close" size="22" />
					</view>
				</view>
			</view>
			<view v-if="cart.items.length === 0" class="cart-empty">购物车为空</view>
			<scroll-view v-else :scroll-y="true" style="max-height: 50vh">
				<view class="modal-body">
					<view v-for="(ci, cidx) in cart.items" :key="ci.id" class="cart-item">
						<up-image
							width="120rpx"
							height="120rpx"
							:src="getDownloadUrl(ci.photo)"
						/>
						<view class="cart-item-main">
							<text class="name">{{ ci.name }}</text>
							<view class="desc">
								<text class="z-tips">{{ ci.skuLabel }}</text>
							</view>
							<view class="desc">
								<text class="z-tips" v-if="ci.optionsSummary">{{
									ci.optionsSummary
								}}</text>
								<text class="z-tips" v-if="ci.ingredientsSummary"
									>/ {{ ci.ingredientsSummary }}</text
								>
							</view>
							<view class="cart-item-bottom">
								<!-- <text class="price">¥{{ formatPrice(ci.unitPrice) }}</text> -->
								<text class="price">¥{{ ci.unitPrice }}</text>
								<up-number-box
									v-model="ci.quantity"
									:min="0"
									integer
									@change="onCartItemQtyChange($event, ci, cidx)"
								/>
								<!-- <view class="quantity-controls">
									<up-button
										type="text"
										size="small"
										@click="decreaseQuantity(cidx)"
										>-</up-button
									>
									<text class="quantity-text">{{ ci.quantity }}</text>
									<up-button
										type="text"
										size="small"
										@click="increaseQuantity(cidx)"
										>+</up-button
									>
								</view> -->
							</view>
						</view>
						<!-- <up-button
							type="error"
							size="mini"
							@click="removeCartItem(cidx)"
							class="delete-btn"
							>删除</up-button
						> -->
					</view>
				</view>
			</scroll-view>
			<view class="modal-footer">
				<view class="footer-total">
					<view class="total-label">合计</view>
					<view class="total-price">¥ {{ cart.totalPrice }}</view>
				</view>
				<up-button
					type="primary"
					shape="circle"
					@click="checkout"
					:disabled="cart.items.length === 0"
				>
					去结算
				</up-button>
			</view>
		</view>
	</up-popup>

	<!-- 桌号选择：action-sheet -->
	<up-action-sheet
		:show="state.tableSheetShow"
		:actions="state.tableActions"
		:round="30"
		title="选择桌号"
		@close="state.tableSheetShow = false"
		@select="onSelectTable"
	/>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { reactive, computed, onMounted, nextTick } from "vue";
import VerticalTabs from "@/components/vertical-tabs/index.vue";
import { getDownloadUrl } from "@/api/common/upload";
import { getProductCatalogAll, getProductList } from "@/api/product";
import { getAllTableList } from "@/api/tableManage";

import {
	add,
	multiply,
	sum,
	calculateItemTotal,
	calculateCartTotal,
	formatPrice,
} from "@/utils/price";
import { addCart, getCart, modifyCart, removeCart } from "@/api/cart";
// 页面状态
const state = reactive({
	isLoaded: false,
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

	addToCartShow: false,
	currentProduct: null as any,
	cartPopupShow: false,
	tableSheetShow: false,
	tableActions: [],
});

// 购物车
const cart = reactive({
	items: [] as any[],
	remark: "",
	get totalCount() {
		return this.items.reduce((s, it) => s + Number(it.quantity || 0), 0);
	},
	totalPrice: 0 as any,
	// get totalPrice() {
	//   // 使用 Decimal.js 进行精确计算
	//   return this.items.reduce((sum: number, it) => {
	//     const itemTotal = calculateItemTotal(it.unitPrice || 0, it.quantity || 1);
	//     return sum + itemTotal;
	//   }, 0);
	// },
});

// 表单
const form = reactive({
	selectedSkuId: undefined as any,
	optionsSelected: {} as Record<string, string>,
	ingredientsSelected: [] as string[],
	quantity: 1,
	// 展示用：仅产品价格（不含加料/数量）
	price: 0 as any,
});

const GetTableList = async () => {
	const res = await getAllTableList({ shopId: state.shopId });
	state.tableActions = res.data.map((item: any) => ({
		name: item.tableName,
		value: item.id,
	}));
};

// 顶部主类切换
const handleMainTabClick = (tab: any) => {
	state.currentMainType = tab.type;
	state.activeTab = 0;
	if (tab.type === "diy") {
		// 过滤显示 DIY 分类，保持引用不变
		const diyTabs = state.tabs.filter((t) => t.parentMain === "diy");
		if (diyTabs.length > 0) {
			// 使用 splice 清空并添加新数据，保持数组引用
			state.tabs.splice(0, state.tabs.length, ...diyTabs);
		} else {
			state.tabs.splice(0, state.tabs.length);
		}
	} else {
		// 切换回常规点单，重新获取数据
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
	state.isLoaded = false;
	getProductCatalogAll({ shopId: state.shopId }).then(async (res) => {
		const data = res.data || [];
		const newTabs = data.map((item: any) => ({
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
		// 按 sort 字段排序
		newTabs.sort((a, b) => (a.sort || 0) - (b.sort || 0));
		// 使用 splice 保持数组引用，避免组件重新渲染
		// state.tabs.splice(0, state.tabs.length, ...newTabs);
		state.tabs = [...newTabs];
		await getAllProductsForCategories();
	});
};

const getAllProductsForCategories = async () => {
	try {
		await Promise.all(
			state.tabs.map(async (tab: any) => {
				await GetProductList(tab.id);
			})
		);
		state.isLoaded = true;
	} catch (error) {}
};

const GetProductList = async (catalogId) => {
	try {
		const params = { shopId: state.shopId, catalogId } as any;
		const res = await getProductList(params);
		const products = res?.data || [];
		const tab = state.tabs.find((t) => t.id === catalogId);
		if (tab) {
			tab.children = [...products];
			tab.hasLoaded = true;
		}
	} catch (error) {}
};

// 桌号
const openTableSheet = () => {
	state.tableSheetShow = true;
};
const onSelectTable = (action: any) => {
	state.currentTableNo = action.name;
	state.tableSheetShow = false;
	uni.showToast({ title: `已选择 ${action.name}`, icon: "none" });
};

// 加入购物车
const openAddToCart = (item: any) => {
	// 验证商品数据
	if (!item) {
		uni.showToast({ title: "商品信息错误", icon: "none" });
		return;
	}

	state.addToCartShow = true;

	state.currentProduct = item;

	// 设置默认SKU，如果没有SKU则设置为null
	if (item.productSkus && item.productSkus.length > 0) {
		form.selectedSkuId = item.productSkus[0].id;
	} else {
		form.selectedSkuId = null;
	}

	// 价格现在通过 getCurrentPrice() 函数动态计算，无需手动设置

	form.optionsSelected = {};
	if (item?.productOptions) {
		Object.keys(item.productOptions).forEach((key) => {
			const first = item.productOptions[key]?.[0]?.value;
			if (first) form.optionsSelected[key] = first;
		});
	}
	form.ingredientsSelected = [];
	form.quantity = 1;
};
const closeAddToCart = () => {
	state.addToCartShow = false;
};

// 购物车加减处理
const onCartItemQtyChange = async (qty: number, ci: any, cidx: number) => {
	// / 保存修改前的数量，用于回滚
	const originalQty = ci.quantity;
	// if (qty.value <= 0) {
	//   cart.items.splice(cidx, 1);
	//   return;
	// }
	try {
		await modifyCart({
			id: ci.id,
			number: qty.value,
		});
		GetCart();
	} catch (error) {
		// 回滚数量到修改前的值
		ci.quantity = originalQty;
	}
};

// 清空购物车
const clearCart = () => {
	uni.showModal({
		title: "确认清空",
		content: "确定要清空购物车吗？",
		success: (res) => {
			if (res.confirm) {
				cart.items = [];
				cart.remark = "";
				uni.showToast({ title: "购物车已清空", icon: "success" });
			}
		},
	});
};

const confirmAddToCart = async () => {
	if (!state.currentProduct) return;

	// 验证是否选择了SKU（如果商品有SKU的话）
	if (
		state.currentProduct.productSkus &&
		state.currentProduct.productSkus.length > 0 &&
		!form.selectedSkuId
	) {
		uni.showToast({ title: "请选择容量", icon: "none" });
		return;
	}

	const product = state.currentProduct;
	const sku = (product.productSkus || []).find(
		(s: any) => s.id === form.selectedSkuId
	);
	// 加料选择校验：依据 productIngredientConfig（required/type）
	// required: "0" 必选, "1" 可选；type: "single" 单选, "multi" 多选
	const ingredientCfg = product?.productIngredientConfig || {};
	const requiredFlag = String(ingredientCfg.required ?? "1");
	const selectType = String(ingredientCfg.type ?? "single");
	const selectedCount = Array.isArray(form.ingredientsSelected)
		? form.ingredientsSelected.length
		: 0;

	// 单选时不允许多选
	if (selectType === "single" && selectedCount > 1) {
		uni.showToast({ title: "该商品加料为单选，请只选择1项", icon: "none" });
		return;
	}

	// 必选时需要至少选择1项；若为必选单选则必须恰好1项
	if (requiredFlag === "0") {
		if (selectType === "single" && selectedCount !== 1) {
			uni.showToast({ title: "该商品加料为必选单选，请选择1项", icon: "none" });
			return;
		}
		if (selectType !== "single" && selectedCount < 1) {
			uni.showToast({ title: "该商品加料为必选，请至少选择1项", icon: "none" });
			return;
		}
	}
	// const skuLabel = sku ? `${sku.size}${sku.unit}` : '默认规格';
	// const optionsSummary = Object.keys(form.optionsSelected || {})
	//   .map(k => `${k}:${form.optionsSelected[k]}`)
	//   .join('/');
	// const chosenIngredients = (product.productIngredients || []).filter((ing: any) =>
	//   form.ingredientsSelected?.includes(ing.id)
	// );
	// const ingredientsSummary = chosenIngredients.map((x: any) => x.name).join('/');

	// 检查购物车中是否已有相同配置的商品
	// const existingItemIndex = cart.items.findIndex(item => {
	//   // 检查商品ID、SKU ID、选项和加料是否完全一致
	//   if (item.productId !== product.id || item.skuId !== sku?.id) {
	//     return false;
	//   }

	//   // 检查选项是否一致（使用JSON.stringify比较对象）
	//   const itemOptionsStr = JSON.stringify(item.options || {});
	//   const formOptionsStr = JSON.stringify(form.optionsSelected || {});
	//   if (itemOptionsStr !== formOptionsStr) {
	//     return false;
	//   }

	//   // 检查加料是否一致（比较排序后的ID数组）
	//   const itemIngredientsIds = (item.ingredients || [])
	//     .map((ing: any) => ing.id)
	//     .sort()
	//     .join(',');
	//   const formIngredientsIds = form.ingredientsSelected
	//     .map(id => Number(id))
	//     .sort()
	//     .join(',');

	//   if (itemIngredientsIds !== formIngredientsIds) {
	//     return false;
	//   }

	//   return true;
	// });

	// if (existingItemIndex !== -1) {
	//   // 如果找到相同配置的商品，数量+1
	//   cart.items[existingItemIndex].quantity += form.quantity;
	//   state.addToCartShow = false;
	//   uni.showToast({ title: '已更新购物车数量', icon: 'success' });
	//   return;
	// }

	// 本地价格计算（展示）
	// const extraPrice = chosenIngredients.reduce((sum: number, it: any) => sum + it.price, 0);
	// const basePrice = sku?.price || product.price || 0;
	// const unitPrice = calculateItemTotal(basePrice, 1) + extraPrice;

	// 调用后端加入购物车
	try {
		// 将所选“冰度/甜度等”从名称映射为对应的选项ID
		const selectedOptionIds: number[] = [];
		if (product.productOptions && form.optionsSelected) {
			Object.keys(form.optionsSelected).forEach((k) => {
				const selectedValue = form.optionsSelected[k];
				const opts = (product.productOptions as any)[k] || [];
				const hit = opts.find((o: any) => o.value === selectedValue);
				if (hit && hit.id != null) selectedOptionIds.push(hit.id);
			});
		}
		const payload = {
			number: form.quantity,
			productId: product.id,
			productSkuId: sku?.id ?? null,
			catalogId: product.catalogId ?? undefined,
			stage: "up",
			shopId: state.shopId,
			name: product.name,
			productOptionIdList: selectedOptionIds,
			productIngredientIdList: form.ingredientsSelected,
			// tableNo: state.currentTableNo || undefined,
		} as any;

		await addCart(payload);

		// 同步到本地购物车（保持原展示）
		// const cartItem = {
		//   productId: product.id,
		//   name: product.name,
		//   photo: product.photo,
		//   skuId: sku?.id,
		//   skuLabel,
		//   options: { ...form.optionsSelected },
		//   optionsSummary,
		//   ingredients: chosenIngredients.map((x: any) => ({ id: x.id, name: x.name, price: x.price })),
		//   ingredientsSummary,
		//   unitPrice,
		//   quantity: form.quantity,
		// };
		// cart.items.push(cartItem);
		await GetCart();
		state.addToCartShow = false;
		uni.showToast({ title: "已加入购物车", icon: "" });
	} catch (error: any) {
	}
};

// 查询购物车
const GetCart = async () => {
	let res = await getCart({ shopId: state.shopId });
	// 根据接口数据刷新本地购物车
	// 期望结构见注释：data.totalPrice, data.userCarts: [{ id, userId, shopId, productId, productName, productSkuId, productSkuName, productOptionIdList, productOptionNameList, productIngredientIdList, productIngredientNameList, number, price, ... }]
	const carts = (res?.data?.userCarts || []) as any[];
	cart.items = carts.map((it: any) => ({
		id: it.id,
		productId: it.productId,
		name: it.productName,
		photo: it.photo || it.productPhoto || "",
		skuId: it.productSkuId,
		skuLabel: it.productSkuName,
		optionsSummary: Array.isArray(it.productOptionNameList)
			? it.productOptionNameList.join("/")
			: "",
		ingredients: Array.isArray(it.productIngredientIdList)
			? it.productIngredientIdList.map((id: number, idx: number) => ({
					id,
					name: (it.productIngredientNameList || [])[idx],
			  }))
			: [],
		ingredientsSummary: Array.isArray(it.productIngredientNameList)
			? it.productIngredientNameList.join("/")
			: "",
		unitPrice: it.price || 0,
		quantity: it.number || 1,
	}));
	cart.totalPrice = res?.data?.totalPrice || 0;
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
	// console.log('下单参数', {
	//   shopId: state.shopId,
	//   tableNo: state.currentTableNo,
	//   remark: cart.remark,
	//   items: cart.items.map(x => ({
	//     productId: x.productId,
	//     skuId: x.skuId,
	//     quantity: x.quantity,
	//     options: x.options,
	//     ingredients: x.ingredients,
	//   })),
	//   totalAmount: cart.totalPrice,
	// });
	uni.showToast({ title: "下单成功", icon: "success" });
	state.cartPopupShow = false;
	cart.totalPrice = 0;
	cart.items = [];
	cart.remark = "";
};

// 获取当前选中SKU的价格
const getCurrentPrice = () => {
	if (!state.currentProduct) return 0;
	const product = state.currentProduct;
	const sku = (product.productSkus || []).find(
		(s: any) => s.id === form.selectedSkuId
	);
	return sku?.price || product.price || 0;
};

// 计算总价
const calculateTotalPrice = () => {
	if (!state.currentProduct) return 0;
	const product = state.currentProduct;
	const sku = (product.productSkus || []).find(
		(s: any) => s.id === form.selectedSkuId
	);
	// 使用 Decimal.js 进行精确计算
	const basePrice = sku?.price || product.price || 0;
	const unitPrice = calculateItemTotal(basePrice, 1);
	const extraPrice = (product.productIngredients || []).reduce(
		(sum: number, ing: any) => {
			if (form.ingredientsSelected?.includes(ing.id)) {
				return sum + ing.price;
			}
			return sum;
		},
		0
	);

	return unitPrice + extraPrice;
};

// 生命周期
onLoad((options) => {
	// state.shopId = options.shopId || '10000008';
	state.shopId = options.shopId;
	GetCategoryList();
	GetCart();
	GetTableList();
});

defineOptions({
	options: {
		styleIsolation: "shared",
	},
});
</script>

<style scoped lang="scss">
@import "@/uni.scss";
.order-header {
	padding: 16rpx;
	display: flex;
	//   justify-content: center;
}

.table-selector {
	display: flex;
	align-items: center;
	gap: 16rpx;
	background: #fff;
	border: 2rpx solid #e8e8e8;
	border-radius: 16rpx;
	padding: 20rpx 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	min-width: 260rpx;
	max-width: 400rpx;
	transition: all 0.2s ease;

	&:active {
		transform: scale(0.98);
		background: #f8f9fa;
	}

	&__label {
		font-size: 28rpx;
		color: var(--text-2);
		font-weight: 500;
		white-space: nowrap;
	}

	&__content {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12rpx;
		cursor: pointer;
	}

	&__text {
		font-size: 30rpx;
		color: var(--text-1);
		font-weight: 600;
		flex: 1;
		text-align: center;

		&:empty::before {
			content: "请选择桌号";
			color: var(--text-3);
			font-weight: 400;
		}
	}
}
.footer-total {
	display: flex;
	flex-direction: column;
	justify-content: center;
	min-width: 200rpx;
	.total-label {
		font-size: 28rpx;
		color: var(--text-2);
	}
	.total-price {
		font-size: 32rpx;
		color: var(--text-1);
		font-weight: 600;
	}
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
.footer-bar {
	width: 100%;
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 12rpx 16rpx;
	background: #fff;
	border-top: 1px solid #f2f2f2;
	box-sizing: border-box;
	justify-content: space-around;
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
.cart-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.cart-header-actions {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.clear-cart {
	font-size: 24rpx;
	color: #999;
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
	background: #f5f5f5;
	cursor: pointer;
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
	min-width: 0; /* 防止子元素溢出 */
}
.cart-item-main .name {
	font-weight: 600;
}
.cart-item-main .desc {
	font-size: 24rpx;
	color: var(--text-3);
	word-break: break-all; /* 防止长文本换行 */
}
.cart-item-bottom {
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.price {
	color: var(--primary-6);
	font-weight: 600;
	white-space: nowrap; /* 价格不换行 */
}

.quantity-controls {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.quantity-text {
	min-width: 40rpx;
	text-align: center;
	font-weight: 600;
}

.delete-btn {
	align-self: flex-start;
	margin-top: 8rpx;
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

/* 总价显示样式 */
.modal-footer .sku-block .label {
	font-weight: 600;
	color: var(--text-2);
	font-size: 32rpx;
}

.row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}
</style>
