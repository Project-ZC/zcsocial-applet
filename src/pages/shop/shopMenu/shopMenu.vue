<template>
	<pageWrapper bottomSafeArea="0">
		<view>
			<vertical-tabs
				v-model="state.activeTab"
				:tabs="state.tabs"
				:active-color="state.activeColor"
				:inactive-color="state.inactiveColor"
				:indicator-color="state.indicatorColor"
				height="calc(100vh)"
				@longpress="handleTabLongpress"
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
					<view class="content">
						<view class="tab0-buttons">
							<up-button type="success" @click="openAddCategoryModal"
								>添加细分类</up-button
							>
							<up-button type="primary" @click="openAddDrinkModal"
								>添加商品</up-button
							>
						</view>
						<view
							class="category-management-section"
							v-if="state.activeTab != ''"
						>
							<view class="section-header">
								<text class="section-title"
									>{{ state.tabs[state.activeTab]?.title }}管理</text
								>
								<view class="man-action-btns">
									<view class="edit-btn" @click="editCurrentCategory">
										<up-icon name="edit-pen" size="36"></up-icon>
									</view>
									<view class="delete-btn" @click="deleteCurrentCategory">
										<up-icon name="trash" size="36"></up-icon>
									</view>
								</view>
							</view>
						</view>
						<goods :goodsList="filteredOrders" v-if="filteredOrders.length > 0">
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
									>上移</up-button
								>
								<up-button
									type="warning"
									size="mini"
									@click="downGoods(item, index)"
									class="action-btn"
								>
									下移
								</up-button>
							</template>
						</goods>
						<!-- DIY酒料空状态 -->
						<emptyData
							v-else
							text="当前细分类还没有酒水"
							subtext="请选择添加商品"
						>
							<view class="empty-state-buttons">
								<!-- <up-button type="error" @click="deleteCategory">删除此细分类</up-button> -->
							</view>
						</emptyData>

						<!-- <view class="empty-state" v-else-if="state.diyTypes.length === 0">
              <image src="/static/images/empty-category.png" mode="aspectFit"></image>
              <text>还没有创建DIY酒料分类</text>
              <up-button class="add-category-btn" @click="openAddDiyTypeModal">创建酒料分类</up-button>
            </view> -->
					</view>
				</template>
			</vertical-tabs>
		</view>

		<!-- 细分分类模态框 -->
		<up-popup
			:show="state.showCategoryModal"
			mode="center"
			@close="closeCategoryModal"
		>
			<view class="z-modal-lg z-modal">
				<view class="modal-header">
					<text>{{
						state.isEditingCategory ? "编辑细分类" : "添加细分类"
					}}</text>
					<view class="close-btn" @click="closeCategoryModal">×</view>
				</view>
				<view class="modal-body">
					<up-form
						:model="state.tempCategory"
						ref="categoryFormRef"
						:rules="state.categoryRules"
						labelPosition="top"
						labelWidth="auto"
					>
						<up-form-item label="细分类名称" prop="name">
							<up-input
								v-model="state.tempCategory.name"
								placeholder="请输入细分类名称"
							/>
						</up-form-item>
						<up-form-item label="排序 (数字越小排序越靠前)" prop="sort">
							<up-input
								v-model="state.tempCategory.sort"
								placeholder="请输入排序数字"
								type="number"
							/>
						</up-form-item>
					</up-form>
				</view>
				<view class="modal-footer">
					<up-button @click="closeCategoryModal">取消</up-button>
					<up-button type="primary" @click="saveCategory">确定</up-button>
				</view>
			</view>
		</up-popup>

		<!-- 添加商品酒水模态框 -->
		<up-popup
			:show="state.showDrinkModal"
			mode="center"
			@close="closeDrinkModal"
		>
			<view class="z-modal-lg z-modal">
				<view class="modal-header">
					<text>{{ state.isEditingDrink ? "编辑酒水" : "添加酒水" }}</text>
					<view class="close-btn" @click="closeDrinkModal">×</view>
				</view>
				<scroll-view scroll-y="true">
					<view class="modal-body">
						<view class="image-upload">
							<UploadFile
								v-model="state.tempDrink.image"
								:max-count="1"
							></UploadFile>
						</view>

						<up-form
							:model="state.tempDrink"
							ref="drinkFormRef"
							:rules="state.drinkRules"
							labelPosition="top"
							labelWidth="auto"
						>
							<up-form-item label="酒水名称" prop="name">
								<up-input
									v-model="state.tempDrink.name"
									placeholder="请输入酒水名称"
								/>
							</up-form-item>

							<up-form-item label="所属细分类" prop="categoryId">
								<view class="category-selector" @click="showCategorySelector">
									<up-input
										v-model="state.tempDrink.categoryName"
										readonly
										placeholder="请选择细分类"
									>
										<template #suffix>
											<up-icon name="arrow-right"></up-icon>
										</template>
									</up-input>
								</view>
							</up-form-item>

							<up-form-item label="描述" prop="description">
								<up-textarea
									v-model="state.tempDrink.description"
									placeholder="请输入酒水描述"
								/>
							</up-form-item>

							<up-form-item label="容量组管理" prop="capacityGroups">
								<view class="capacity-groups-container">
									<view class="capacity-groups-header header-btn">
										<up-button
											type="info"
											shape="circle"
											@click="openAddCapacityGroupModal()"
											>添加容量组</up-button
										>
									</view>
									<view
										class="capacity-groups-list"
										v-if="
											state.tempDrink.capacityGroups?.length > 0 &&
											state.showCapacityGroups
										"
									>
										<drag-container
											:list="state.tempDrink.capacityGroups"
											:controlsSize="{ height: 50 }"
										>
											<template #default="{ item, index }">
												<view
													class="capacity-group-item"
													@click.stop="openAddCapacityGroupModal(item, index)"
												>
													<view class="capacity-group-info">
														<view class="capacity-main-info">
															<text class="capacity-name">{{ item.name }}</text>
															<text class="capacity-price"
																>¥{{ item.price }}</text
															>
														</view>
														<view class="capacity-default-info">
															<text v-if="item.isDefault" class="default-badge"
																>默认选中</text
															>
														</view>
													</view>
													<view class="capacity-group-actions" @click.stop>
														<up-button
															v-if="!item.isDefault"
															type="success"
															size="mini"
															@click.stop="setDefaultCapacityGroup(item, index)"
														>
															设为默认
														</up-button>
														<up-button
															class="del-icon-btn"
															type="error"
															size="mini"
															@click.stop="deleteCapacityGroup(item, index)"
														>
															删除
														</up-button>
													</view>
												</view>
											</template>
										</drag-container>
									</view>
									<view v-else class="capacity-groups-empty">
										<text class="empty-text">暂无容量组，请点击添加</text>
									</view>
								</view>
							</up-form-item>

							<up-form-item label="添料组管理" prop="ingredientGroups">
								<view class="ingredient-groups-container">
									<view class="ingredient-groups-header header-btn">
										<up-button
											type="info"
											shape="circle"
											@click="openAddIngredientGroupModal()"
											>添加小料</up-button
										>
									</view>
									<view v-if="state.tempDrink.ingredientGroups?.length > 0">
										<up-dragsort
											:initialList="state.tempDrink.ingredientGroups"
											direction="vertical"
										>
											<template #default="{ item, index }">
												<view
													class="ingredient-group-item"
													@click.stop="openAddIngredientGroupModal(item, index)"
												>
													<view class="ingredient-group-info">
														<view class="ingredient-main-info">
															<text class="ingredient-name">{{
																item.name
															}}</text>
															<text class="ingredient-price"
																>¥{{ item.price }}</text
															>
														</view>
														<view class="ingredient-default-info">
															<text v-if="item.isDefault" class="default-badge"
																>默认选中</text
															>
														</view>
													</view>
													<view class="ingredient-group-actions" @click.stop>
														<up-button
															v-if="!item.isDefault"
															type="success"
															size="mini"
															@click.stop="
																setDefaultIngredientGroup(item, index)
															"
														>
															设为默认
														</up-button>
														<up-button
															class="del-icon-btn"
															type="error"
															size="mini"
															@click.stop="deleteIngredientGroup(item, index)"
														>
															删除
														</up-button>
													</view>
												</view>
											</template>
										</up-dragsort>
									</view>

									<view v-else class="ingredient-groups-empty">
										<text class="empty-text">暂无小料，请点击添加</text>
									</view>
								</view>
							</up-form-item>

							<up-form-item label="价格 (元)" prop="price">
								<up-input
									v-model.number="state.tempDrink.price"
									placeholder="请输入价格"
									type="number"
								/>
							</up-form-item>

							<!-- <up-form-item label="排序 (数字越小排序越靠前)" prop="sort">
                <up-input v-model.number="state.tempDrink.sort" placeholder="请输入排序数字" type="number" />
              </up-form-item> -->

							<!-- <up-form-item label="推荐酒水" prop="isRecommended">
                <up-switch v-model="state.tempDrink.isRecommended" active-color="#1989fa"></up-switch>
              </up-form-item> -->

							<up-form-item label="上架状态" prop="isAvailable">
								<up-switch
									v-model="state.tempDrink.isAvailable"
									active-color="#1989fa"
								></up-switch>
							</up-form-item>

							<up-form-item label="启用点单制" prop="enableOrdering">
								<up-switch
									v-model="state.tempDrink.enableOrdering"
									active-color="#1989fa"
								></up-switch>
							</up-form-item>
							<view class="form-tip">
								<text class="tip-text"
									>开启后，顾客可以通过扫码点单选择此酒水</text
								>
							</view>
							<up-form-item label="单次点单上限（杯）" prop="maxOrderCount">
								<up-input
									v-model.number="state.tempDrink.maxOrderCount"
									placeholder="请输入单次点单上限"
									type="number"
								/>
							</up-form-item>
							<view class="form-tip">
								<text class="tip-text"
									>设置顾客单次点单此酒水的最大数量，0表示不限制</text
								>
							</view>
						</up-form>
					</view>
				</scroll-view>
				<view class="modal-footer">
					<up-button @click="closeDrinkModal">取消</up-button>
					<up-button type="primary" @click="saveDrink">确定</up-button>
				</view>
			</view>
		</up-popup>
		<!-- DIY酒料分类模态框 -->
		<up-popup
			:show="state.showDiyTypeModal"
			mode="center"
			@close="closeDiyTypeModal"
		>
			<view class="z-modal-lg z-modal">
				<view class="modal-header">
					<text>{{
						state.isEditingDiyType ? "编辑酒料分类" : "添加酒料分类"
					}}</text>
					<view class="close-btn" @click="closeDiyTypeModal">×</view>
				</view>
				<view class="modal-body">
					<up-form
						:model="state.tempDiyType"
						ref="diyTypeFormRef"
						:rules="state.diyTypeRules"
						labelPosition="top"
						labelWidth="auto"
					>
						<up-form-item label="分类名称" prop="name">
							<up-input
								v-model="state.tempDiyType.name"
								placeholder="请输入分类名称"
							/>
						</up-form-item>
						<up-form-item label="排序 (数字越小排序越靠前)" prop="sort">
							<up-input
								v-model.number="state.tempDiyType.sort"
								placeholder="请输入排序数字"
								type="number"
							/>
						</up-form-item>
					</up-form>
				</view>
				<view class="modal-footer">
					<up-button class="cancel-btn" @click="closeDiyTypeModal"
						>取消</up-button
					>
					<up-button class="confirm-btn" @click="saveDiyType">确定</up-button>
				</view>
			</view>
		</up-popup>

		<!-- DIY酒料模态框 -->
		<up-popup
			:show="state.showDiyIngredientModal"
			mode="center"
			@close="closeDiyIngredientModal"
		>
			<view class="z-modal-lg z-modal">
				<view class="modal-header">
					<text>{{
						state.isEditingDiyIngredient ? "编辑酒料" : "添加酒料"
					}}</text>
					<view class="close-btn" @click="closeDiyIngredientModal">×</view>
				</view>
				<view class="modal-body">
					<scroll-view
						class="categories-scroll"
						scroll-y="true"
						enhanced="true"
						show-scrollbar="true"
						style="max-height: 900rpx"
					>
						<view class="image-upload" @click="uploadDiyIngredientImage">
							<image
								class="drink-image-preview"
								:src="
									state.tempDiyIngredient.image ||
									'/static/images/default-ingredient.png'
								"
								mode="aspectFill"
							></image>
							<view class="upload-icon">
								<image
									src="/static/images/icons/camera.png"
									mode="aspectFit"
								></image>
							</view>
						</view>

						<up-form
							:model="state.tempDiyIngredient"
							ref="diyIngredientFormRef"
							:rules="state.diyIngredientRules"
							labelPosition="top"
							labelWidth="auto"
						>
							<up-form-item label="酒料名称" prop="name">
								<up-input
									v-model="state.tempDiyIngredient.name"
									placeholder="请输入酒料名称"
								/>
							</up-form-item>

							<up-form-item label="描述" prop="description">
								<up-textarea
									v-model="state.tempDiyIngredient.description"
									placeholder="请输入酒料描述"
								/>
							</up-form-item>

							<up-form-item label="附加价格 (元，可选)" prop="price">
								<up-input
									v-model.number="state.tempDiyIngredient.price"
									placeholder="请输入附加价格，0表示免费"
									type="number"
								/>
							</up-form-item>

							<up-form-item label="计量单位" prop="unit">
								<up-input
									v-model="state.tempDiyIngredient.unit"
									placeholder="例如：份、杯、瓶等"
								/>
							</up-form-item>

							<up-form-item label="排序 (数字越小排序越靠前)" prop="sort">
								<up-input
									v-model.number="state.tempDiyIngredient.sort"
									placeholder="请输入排序数字"
									type="number"
								/>
							</up-form-item>

							<up-form-item label="推荐酒料" prop="isRecommended">
								<up-switch
									v-model="state.tempDiyIngredient.isRecommended"
									active-color="#1989fa"
								></up-switch>
							</up-form-item>

							<up-form-item label="上架状态" prop="isAvailable">
								<up-switch
									v-model="state.tempDiyIngredient.isAvailable"
									active-color="#1989fa"
								></up-switch>
							</up-form-item>
						</up-form>
					</scroll-view>
				</view>
				<view class="modal-footer">
					<up-button @click="closeDiyIngredientModal">取消</up-button>
					<up-button type="primary" @click="saveDiyIngredient">确定</up-button>
				</view>
			</view>
		</up-popup>

		<!-- 容量组管理模态框 -->
		<up-popup
			:show="state.showCapacityGroupModal"
			mode="center"
			@close="closeCapacityGroupModal"
		>
			<view class="z-modal-lg z-modal">
				<view class="modal-header">
					<text>{{
						state.isEditingCapacityGroup ? "编辑容量组" : "添加容量组"
					}}</text>
					<view class="close-btn" @click="closeCapacityGroupModal">×</view>
				</view>
				<view class="modal-body">
					<up-form
						:model="state.tempCapacityGroup"
						ref="capacityGroupFormRef"
						:rules="state.capacityGroupRules"
						labelPosition="top"
						labelWidth="auto"
					>
						<up-form-item label="容量名称" prop="capacity">
							<up-input
								v-model.number="state.tempCapacityGroup.capacity"
								placeholder="请输入容量数字"
								type="number"
								class="capacity-number-input"
							>
								<template #suffix>
									<up-select
										v-model:current="state.tempCapacityGroup.unit"
										:label="state.tempCapacityGroup.unit"
										:options="state.capacityUnitOptions"
										class="capacity-unit-select"
									/>
								</template>
							</up-input>
						</up-form-item>
						<up-form-item label="容量价格 (元)" prop="price">
							<up-input
								v-model.number="state.tempCapacityGroup.price"
								placeholder="请输入价格"
								type="number"
							/>
						</up-form-item>
					</up-form>
				</view>
				<view class="modal-footer">
					<up-button @click="closeCapacityGroupModal">取消</up-button>
					<up-button type="primary" @click="saveCapacityGroup">确定</up-button>
				</view>
			</view>
		</up-popup>

		<!-- 添料组管理模态框 -->
		<up-popup
			:show="state.showIngredientGroupModal"
			mode="center"
			@close="closeIngredientGroupModal"
		>
			<view class="z-modal-lg z-modal">
				<view class="modal-header">
					<text>{{
						state.isEditingIngredientGroup ? "编辑酒料" : "添加酒料"
					}}</text>
					<view class="close-btn" @click="closeIngredientGroupModal">×</view>
				</view>
				<view class="modal-body">
					<up-form
						:model="state.tempIngredientGroup"
						ref="ingredientGroupFormRef"
						:rules="state.ingredientGroupRules"
						labelPosition="top"
						labelWidth="auto"
					>
						<up-form-item label="酒料名称" prop="name">
							<up-input
								v-model="state.tempIngredientGroup.name"
								placeholder="如：珍珠/椰果/桂花"
							/>
						</up-form-item>
						<up-form-item label="酒料金额 (每项)" prop="price">
							<up-input
								v-model.number="state.tempIngredientGroup.price"
								placeholder="请输入酒料金额"
								type="number"
							/>
						</up-form-item>
						<!-- <up-form-item label="是否默认" prop="isDefault">
              <up-switch v-model="state.tempIngredientGroup.isDefault" active-color="#1989fa"></up-switch>
            </up-form-item> -->
					</up-form>
				</view>
				<view class="modal-footer">
					<up-button @click="closeIngredientGroupModal">取消</up-button>
					<up-button type="primary" @click="saveIngredientGroup"
						>确定</up-button
					>
				</view>
			</view>
		</up-popup>

		<!-- 分类选择器动作表 -->
		<up-action-sheet
			:show="state.showCategorySelector"
			:actions="categoryActions"
			@select="selectCategory"
			@close="closeCategorySelector"
			title="选择细分类"
			cancel-text="取消"
		/>
	</pageWrapper>
</template>

<script lang="ts" setup>
import { reactive, ref, computed, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import VerticalTabs from "@/components/vertical-tabs/vertical-tabs.vue";
import UploadFile from "@/components/upload-file/index.vue";
import emptyData from "@/components/empty-data/index.vue";
import { ActionType as OrderActionType, OrderStatus } from "@/enums/order";
import Goods from "./components/goods.vue";
import DragContainer from "@/components/drag/index.vue";

// 商品列表数据
const state = reactive({
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
	showCapacityGroups: true,
	activeTab: "" as any,
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
	orders: [
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
			actions: [
				{ type: OrderActionType.PAY, text: "接受订单" },
				{ type: OrderActionType.CANCEL, text: "取消订单" },
			],
			type: "diy",
		},
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
			actions: [
				{ type: OrderActionType.PAY, text: "接受订单" },
				{ type: OrderActionType.CANCEL, text: "取消订单" },
			],
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
		},
		{
			title: "伏特加",
			badge: "",
			type: "vodka",
			parentMain: "all",
			sort: 3,
		},
		{
			title: "diy酒",
			badge: "",
			type: "diy",
			parentMain: "diy",
			sort: 3,
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
	tempCategory: {
		id: "",
		name: "",
		sort: 0,
	},
	// 表单验证规则
	categoryRules: {
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
	showDiyTypeModal: false,
	isEditingDiyType: false,
	tempDiyType: {
		id: "",
		name: "",
		sort: 0,
	},
	showDrinkModal: false,
	isEditingDrink: false,
	tempDrink: {
		id: "",
		name: "",
		image: "",
		description: "",
		price: 0,
		originalPrice: 0,
		sort: 0,
		isRecommended: false,
		isAvailable: true,
		enableOrdering: true,
		categoryId: "",
		categoryName: "",
		maxOrderCount: 0,
		capacityGroups: [] as any[], // 新增容量组列表
		ingredientGroups: [] as any[], // 新增小料组列表
	} as any,
	showDiyIngredientModal: false,
	isEditingDiyIngredient: false,
	tempDiyIngredient: {
		id: "",
		name: "",
		image: "",
		description: "",
		price: 0,
		unit: "份",
		sort: 0,
		isRecommended: false,
		isAvailable: true,
		diyTypeId: "",
	} as any,
	showDeleteCategoryModal: false,
	showDeleteDiyTypeModal: false,
	showDeleteDrinkModal: false,
	deleteDrinkId: "",
	showDeleteDiyIngredientModal: false,
	deleteDiyIngredientId: "",

	drinkRules: {
		name: {
			required: true,
			message: "请输入酒水名称",
			trigger: ["blur", "change"],
		},
		price: {
			required: true,
			message: "请输入价格",
			trigger: ["blur", "change"],
			validator: (rule, value, callback) => {
				if (value <= 0) {
					callback(new Error("价格必须大于0"));
				} else {
					callback();
				}
			},
		},
		sort: {
			required: true,
			message: "请输入排序数字",
			trigger: ["blur", "change"],
		},
	},
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
	diyIngredientRules: {
		name: {
			required: true,
			message: "请输入酒料名称",
			trigger: ["blur", "change"],
		},
		sort: {
			required: true,
			message: "请输入排序数字",
			trigger: ["blur", "change"],
		},
	},
	showCategorySelector: false,
	showCapacityGroupModal: false,
	isEditingCapacityGroup: false,
	tempCapacityGroup: {
		id: "", // 容量id
		capacity: 0, // 新增：容量数字
		unit: "ml", // 新增：容量单位
		name: "", // 容量名称
		price: 0, // 价格
		isDefault: false, // 新增：是否为默认选中
	},
	// 容量单位选项
	capacityUnitOptions: [
		{ name: "毫升 (ml)", id: "ml" },
		{ name: "升 (L)", id: "L" },
		{ name: "克 (g)", id: "g" },
	],
	capacityGroupRules: {
		capacity: {
			required: true,
			message: "请输入容量数字",
			trigger: ["blur", "change"],
			validator: (rule, value, callback) => {
				if (value <= 0) {
					callback(new Error("容量必须大于0"));
				} else {
					callback();
				}
			},
		},
		unit: {
			required: true,
			message: "请选择容量单位",
			trigger: ["blur", "change"],
		},
		price: {
			required: true,
			message: "请输入容量价格",
			trigger: ["blur", "change"],
			validator: (rule, value, callback) => {
				if (value <= 0) {
					callback(new Error("价格必须大于0"));
				} else {
					callback();
				}
			},
		},
	},
	showIngredientGroupModal: false,
	isEditingIngredientGroup: false,
	tempIngredientGroup: {
		id: "",
		name: "",
		price: 0,
		isDefault: false,
	},
	ingredientGroupRules: {
		name: {
			required: true,
			message: "请输入小料名称",
			trigger: ["blur", "change"],
		},
		price: {
			required: true,
			message: "请输入小料价格",
			trigger: ["blur", "change"],
			validator: (rule, value, callback) => {
				if (value <= 0) {
					callback(new Error("价格必须大于0"));
				} else {
					callback();
				}
			},
		},
	},
});

// 表单引用
const categoryFormRef = ref();
const drinkFormRef = ref();
const diyTypeFormRef = ref();
const diyIngredientFormRef = ref();
const capacityGroupFormRef = ref();
const ingredientGroupFormRef = ref();

const handleTabLongpress = (index, tab) => {
	console.log("longpress", index, tab);
};

const handleMainTabClick = (tab) => {
	state.activeTab = "";
	state.currentMainType = tab.type;
	state.tabs = state.allTabs.filter(
		(tab) => tab.parentMain === state.currentMainType
	);
};

// 编辑商品
const editGoods = (item, index: number) => {
	state.showDrinkModal = true;
	state.isEditingDrink = true;
	state.tempDrink = {
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

// 根据状态筛选订单
const filteredOrders = computed(() => {
	if (state.activeTab === "") {
		return state.orders;
	}
	return state.orders.filter(
		(order) => order.type === state.tabs[state.activeTab].type
	);
});
// 细分类列表：根据当前主类过滤
const categories = computed(() => {
	const currentMain =
		state.activeTab === ""
			? state.tabs[state.activeTab]?.type
			: (state.tabs[state.activeTab] as any)?.parentMain;
	const temp = state.tabs.filter(
		(tab: any, index) => index >= 2 && tab.parentMain === currentMain
	);
	if (temp.length > 0) {
		state.tempDrink.categoryId = temp[0].type;
		state.tempDrink.categoryName = temp[0].title;
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
	state.tempCategory = { id: "", name: "", sort: 0 } as any;
	state.showCategoryModal = true;
};

// 关闭添加编辑分类弹框
const closeCategoryModal = () => {
	state.showCategoryModal = false;
	state.isEditingCategory = false;
	categoryFormRef.value?.resetFields();
	categoryFormRef.value?.clearValidate();
};
// 保存细分
const saveCategory = async () => {
	try {
		// 表单验证
		await categoryFormRef.value?.validate();

		// 当前主类
		const currentMain =
			state.activeTab === ""
				? state.tabs[state.activeTab]?.type
				: (state.tabs[state.activeTab] as any)?.parentMain;

		if (state.isEditingCategory) {
			const idx = state.tabs.findIndex(
				(tab: any) => tab.type === state.tempCategory.id
			);
			if (idx !== -1) {
				state.tabs[idx] = {
					...state.tabs[idx],
					title: state.tempCategory.name,
					sort: state.tempCategory.sort,
				};
			}
		} else {
			const newType = `cat_${Date.now()}`;
			const newCategoryTab: any = {
				title: state.tempCategory.name,
				badge: "",
				type: newType,
				sort: state.tempCategory.sort || 0,
				parentMain: currentMain,
			};
			state.tabs.push(newCategoryTab);
		}
		closeCategoryModal();
		uni.showToast({
			title: state.isEditingCategory ? "细分类已更新" : "细分类已添加",
			icon: "success",
		});
	} catch (error) {
		console.log("表单验证失败:", error);
	}
};
// 关闭添加编辑酒水弹框
const closeDrinkModal = () => {
	state.showDrinkModal = false;
	state.isEditingDrink = false;
	// 清空表单
	drinkFormRef.value?.resetFields();
	drinkFormRef.value?.clearValidate();
};

// 打开添加编辑酒水弹框
const openAddDrinkModal = () => {
	console.log(state.activeTab, 1234);
	// 仅细分类下可添加商品
	if (state.activeTab == "") {
		uni.showToast({ title: "请选择细分类", icon: "none" });
		return;
	}
	const currentTab: any = state.tabs[state.activeTab];
	if (currentTab?.parentMain === "diy") {
		state.showDiyIngredientModal = true;
		state.isEditingDiyIngredient = false;
		state.tempDiyIngredient = {
			id: "",
			name: "",
			image: "",
			description: "",
			price: 0,
			unit: "份",
			sort: 0,
			isRecommended: false,
			isAvailable: true,
			diyTypeId: currentTab.type,
		} as any;
	} else {
		state.showDrinkModal = true;
		state.isEditingDrink = false;
		state.tempDrink = {
			id: "",
			name: "",
			image: "",
			description: "",
			price: 0,
			originalPrice: 0,
			sort: 0,
			isRecommended: false,
			isAvailable: true,
			enableOrdering: true,
			categoryId: currentTab.type,
			categoryName: currentTab.title,
			maxOrderCount: 0,
			capacityGroups: [],
			ingredientGroups: [],
		} as any;
	}
};
// 保存酒水
const saveDrink = async () => {
	try {
		// 表单验证
		await drinkFormRef.value?.validate();

		console.log("state.tempDrink", state.tempDrink);

		closeDrinkModal();
		uni.showToast({
			title: state.isEditingDrink ? "酒水已更新" : "酒水已添加",
			icon: "success",
		});
	} catch (error) {
		console.log("表单验证失败:", error);
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
	const currentTab = state.tabs[state.activeTab];
	if (currentTab) {
		state.isEditingCategory = true;
		state.tempCategory.id = currentTab.type;
		state.tempCategory.name = currentTab.title;
		state.tempCategory.sort = Number(currentTab.sort ?? 0);
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

const closeDiyTypeModal = () => {
	state.showDiyTypeModal = false;
};

const saveDiyType = async () => {
	try {
		// 表单验证
		await diyTypeFormRef.value?.validate();

		if (state.isEditingDiyType) {
			const index = state.diyTypes.findIndex(
				(type) => type.id === state.tempDiyType.id
			);
			if (index !== -1) {
				state.diyTypes[index] = {
					...state.tempDiyType,
					ingredients: state.diyTypes[index].ingredients,
				};
			}
		} else {
			const newDiyType = {
				...state.tempDiyType,
				id: Date.now().toString(),
				ingredients: [],
			};
			state.diyTypes.push(newDiyType as any);
			if (state.diyTypes.length === 1) {
				state.currentDiyTypeId = newDiyType.id;
			}
		}

		state.diyTypes.sort((a, b) => a.sort - b.sort);
		state.showDiyTypeModal = false;
		uni.showToast({
			title: state.isEditingDiyType ? "分类已更新" : "分类已添加",
			icon: "success",
		});
	} catch (error) {
		console.log("表单验证失败:", error);
	}
};

const closeDiyIngredientModal = () => {
	state.showDiyIngredientModal = false;
};

const saveDiyIngredient = async () => {
	try {
		// 表单验证
		await diyIngredientFormRef.value?.validate();

		const diyTypeIndex = state.diyTypes.findIndex(
			(type) => type.id === state.tempDiyIngredient.diyTypeId
		);
		if (diyTypeIndex !== -1) {
			if (state.isEditingDiyIngredient) {
				const ingredientIndex = state.diyTypes[
					diyTypeIndex
				].ingredients.findIndex((i) => i.id === state.tempDiyIngredient.id);
				if (ingredientIndex !== -1) {
					state.diyTypes[diyTypeIndex].ingredients[ingredientIndex] = {
						...state.tempDiyIngredient,
					};
				}
			} else {
				const newIngredient = {
					...state.tempDiyIngredient,
					id: Date.now().toString(),
				};
				state.diyTypes[diyTypeIndex].ingredients.push(newIngredient);
			}
			state.diyTypes[diyTypeIndex].ingredients.sort((a, b) => a.sort - b.sort);
		}

		state.showDiyIngredientModal = false;
		uni.showToast({
			title: state.isEditingDiyIngredient ? "酒料已更新" : "酒料已添加",
			icon: "success",
		});
	} catch (error) {
		console.log("表单验证失败:", error);
	}
};

const uploadDiyIngredientImage = () => {
	uni.chooseImage({
		count: 1,
		sizeType: ["original", "compressed"],
		sourceType: ["album", "camera"],
		success: (res) => {
			state.tempDiyIngredient.image = res.tempFilePaths[0];
		},
	});
};

const showCategorySelector = () => {
	state.showCategorySelector = true;
};

const closeCategorySelector = () => {
	state.showCategorySelector = false;
};

const selectCategory = (category: any) => {
	state.tempDrink.categoryId = category.value;
	state.tempDrink.categoryName = category.name;
	state.showCategorySelector = false;
};

const getSelectedCategoryName = () => {
	const selectedCategory = categories.value.find(
		(cat) => cat.type === state.tempDrink.categoryId
	);
	return selectedCategory ? selectedCategory.title : "";
};

// 容量组管理相关函数
const openAddCapacityGroupModal = (item, index) => {
	if (item) {
		state.tempCapacityGroup = {
			...item,
		};
	}
	state.showCapacityGroupModal = true;
};

const closeCapacityGroupModal = () => {
	state.showCapacityGroupModal = false;
	state.isEditingCapacityGroup = false;
	capacityGroupFormRef.value?.resetFields();
	capacityGroupFormRef.value?.clearValidate();
	state.tempCapacityGroup.unit = "ml";
};

const saveCapacityGroup = async () => {
	try {
		// 表单验证
		await capacityGroupFormRef.value?.validate();

		// 组合容量名称：数字 + 单位
		const capacityName = `${state.tempCapacityGroup.capacity}${state.tempCapacityGroup.unit}`;

		if (state.isEditingCapacityGroup) {
			// 编辑模式
			const index = state.tempDrink.capacityGroups.findIndex(
				(g) => g.id === state.tempCapacityGroup.id
			);
			if (index !== -1) {
				state.tempDrink.capacityGroups[index] = {
					...state.tempCapacityGroup,
					name: capacityName, // 使用组合后的容量名称
				};
			}
		} else {
			// 添加模式
			const newCapacityGroup = {
				...state.tempCapacityGroup,
				id: Date.now().toString(),
				name: capacityName, // 使用组合后的容量名称
				// 如果是第一个容量组，自动设为默认
				isDefault: state.tempDrink.capacityGroups.length === 0,
			};
			state.tempDrink.capacityGroups.push(newCapacityGroup);
		}
		state.showCapacityGroups = false;
		setTimeout(() => {
			state.showCapacityGroups = true;
		}, 100);
		closeCapacityGroupModal();
		uni.showToast({
			title: state.isEditingCapacityGroup ? "容量组已更新" : "容量组已添加",
			icon: "success",
		});
	} catch (error) {
		console.log("表单验证失败:", error);
	}
};

const deleteCapacityGroup = (item, index: number) => {
	uni.showModal({
		title: "确认删除",
		content: `确定要删除容量组"${item.name}"吗？`,
		success: (res) => {
			if (res.confirm) {
				state.tempDrink.capacityGroups.splice(index, 1);
				uni.showToast({
					title: "删除成功",
					icon: "success",
				});
			}
		},
	});
};

const setDefaultCapacityGroup = (item, index: number) => {
	state.tempDrink.capacityGroups.forEach((group) => {
		group.isDefault = false;
	});
	state.tempDrink.capacityGroups[index].isDefault = true;
	uni.showToast({
		title: "已设为默认容量组",
		icon: "success",
	});
};

// 添料组管理相关函数
const openAddIngredientGroupModal = (item, index) => {
	if (item) {
		state.isEditingIngredientGroup = true;
		state.tempIngredientGroup = {
			...item,
		};
	}
	state.showIngredientGroupModal = true;
};

const closeIngredientGroupModal = () => {
	state.showIngredientGroupModal = false;
	state.isEditingIngredientGroup = false;
	ingredientGroupFormRef.value?.resetFields();
	ingredientGroupFormRef.value?.clearValidate();
};

// 酒料保存
const saveIngredientGroup = async () => {
	try {
		// 表单验证
		await ingredientGroupFormRef.value?.validate();

		const drinkIndex = state.tempDrink.ingredientGroups.findIndex(
			(g) => g.id === state.tempIngredientGroup.id
		);
		if (drinkIndex !== -1) {
			state.tempDrink.ingredientGroups[drinkIndex] = {
				...state.tempIngredientGroup,
			};
		} else {
			const newIngredientGroup = {
				...state.tempIngredientGroup,
				id: Date.now().toString(),
			};
			if (state.tempDrink.ingredientGroups.length === 0) {
				newIngredientGroup.isDefault = true;
			}
			state.tempDrink.ingredientGroups.push(newIngredientGroup);
		}
		state.tempDrink.ingredientGroups.sort((a, b) => a.sort - b.sort);
		closeIngredientGroupModal();
		uni.showToast({
			title: state.isEditingIngredientGroup ? "小料已更新" : "小料已添加",
			icon: "success",
		});
	} catch (error) {
		console.log("表单验证失败:", error);
	}
};

const deleteIngredientGroup = (item, index: number) => {
	uni.showModal({
		title: "确认删除",
		content: `确定要删除小料"${item.name}"吗？`,
		success: (res) => {
			if (res.confirm) {
				state.tempDrink.ingredientGroups.splice(index, 1);
				uni.showToast({
					title: "删除成功",
					icon: "success",
				});
			}
		},
	});
};

const setDefaultIngredientGroup = (item, index: number) => {
	state.tempDrink.ingredientGroups.forEach((group) => {
		group.isDefault = false;
	});
	state.tempDrink.ingredientGroups[index].isDefault = true;
	uni.showToast({
		title: "已设为默认小料",
		icon: "success",
	});
};
// 生命周期钩子
onLoad(() => {
	handleMainTabClick(state.mainTabs[0]);
});

defineOptions({
	options: {
		styleIsolation: "shared",
	},
});
</script>

<style lang="scss" scoped>
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
.category-management-section {
	.section-header {
		display: flex;
		align-items: center;
		padding: 20rpx 20rpx 0;
	}
	.section-title {
		font-size: $up-font-md;
		font-weight: 600;
	}
	::v-deep .man-action-btns {
		display: flex;
		align-items: center;
		.edit-btn,
		.delete-btn {
			width: 30rpx;
			height: 30rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-left: 20rpx;
			font-size: 24rpx;
		}

		.edit-btn {
			.u-icon__icon {
				font-size: 50rpx !important;
				color: $u-primary !important;
			}
		}

		.delete-btn {
			.u-icon__icon {
				font-size: 50rpx !important;
				color: $u-error !important;
			}
		}
	}
}
.capacity-groups-list {
	position: relative;
}

.del-icon-btn {
	border-radius: 50%;
	overflow: hidden;
	.u-button {
		background-color: var(--error-6);
		color: #fff;
	}
}
.form-tip {
	font-size: $up-font-sm;
	color: var(--text-2);
	margin-top: -16rpx;
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

.image-upload {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
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

.category-selector {
	width: 100%;
}

/* 容量组管理样式 */
.capacity-groups-container {
	width: 100%;
}

.capacity-number-input {
	flex: 1;
}

.capacity-unit-select {
	width: 160rpx;
}

.capacity-groups-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 180rpx;
}

.capacity-groups-title {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.capacity-group-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 50px;
	padding: 20rpx;
	background-color: #f8f9fa;
	border-radius: 8rpx;
	box-sizing: border-box;
}

.capacity-group-info {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.capacity-main-info {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.capacity-name {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
}

.capacity-price {
	font-size: 26rpx;
	color: #ff6b35;
	font-weight: 600;
}

.capacity-default-info {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.default-badge {
	font-size: 22rpx;
	color: #fff;
	background-color: #1989fa;
	padding: 4rpx 10rpx;
	border-radius: 8rpx;
}

.capacity-group-actions {
	display: flex;
	gap: 16rpx;
}

.capacity-groups-empty {
	text-align: center;
	padding: 40rpx 20rpx;
	background-color: #f8f9fa;
	border-radius: 8rpx;
}

.empty-text {
	font-size: 26rpx;
	color: #999;
}

/* 添料组管理样式 */
.ingredient-groups-container {
	width: 100%;
}

.ingredient-groups-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 160rpx;
}

.ingredient-groups-title {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.ingredient-group-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 50px;
	padding: 20rpx;
	background-color: #f8f9fa;
	border-radius: 8rpx;
	box-sizing: border-box;
}

.ingredient-group-info {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.ingredient-main-info {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.ingredient-name {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
}

.ingredient-price {
	font-size: 26rpx;
	color: #ff6b35;
	font-weight: 600;
}

.ingredient-default-info {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.ingredient-group-actions {
	display: flex;
	gap: 16rpx;
}

.ingredient-groups-empty {
	text-align: center;
	padding: 40rpx 20rpx;
	background-color: #f8f9fa;
	border-radius: 8rpx;
}
</style>
