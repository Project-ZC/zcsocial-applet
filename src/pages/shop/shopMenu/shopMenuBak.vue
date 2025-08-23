<template>
	<pageWrapper>
		<view class="container">
			<!-- 顶部菜单栏 -->
			<view class="menu-tabs">
				<view
					class="menu-tab"
					:class="{ active: state.menuType === 'regular' }"
					@click="switchMenuType('regular')"
					>常规酒单</view
				>
				<view
					class="menu-tab"
					:class="{ active: state.menuType === 'diy' }"
					@click="switchMenuType('diy')"
					>DIY酒料</view
				>
			</view>

			<!-- 常规酒单内容 -->
			<block v-if="state.menuType === 'regular'">
				<!-- 分类导航 -->
				<view class="categories-nav">
					<scroll-view
						class="categories-scroll"
						scroll-x="true"
						enhanced="true"
						show-scrollbar="false"
					>
						<view
							class="category-item"
							v-for="(item, index) in state.categories"
							:key="item.id"
							:class="{ active: state.currentCategoryId === item.id }"
							@click="switchCategory(item.id)"
						>
							{{ item.name }}
						</view>
					</scroll-view>
					<view class="category-actions" v-if="state.categories.length > 0">
						<view
							class="action-btn edit-category-btn"
							@click="openEditCategoryModal"
						>
							<!-- <image src="/static/images/icons/edit.png" mode="aspectFit"></image> -->
							<up-icon name="plus-circle-fill" size="56rpx"></up-icon>
						</view>
						<view
							class="action-btn delete-category-btn"
							@click="openDeleteCategoryModal"
						>
							<!-- <image src="/static/images/icons/delete.png" mode="aspectFit"></image> -->
							<up-icon name="minus-circle-fill" size="56rpx"></up-icon>
						</view>
					</view>
				</view>

				<!-- 酒水列表 -->
				<view class="drink-list" v-if="filteredDrinks.length > 0">
					<view
						class="drink-item"
						v-for="(item, index) in filteredDrinks"
						:key="item.id"
					>
						<view class="drink-info">
							<image
								class="drink-image"
								:src="item.image || '/static/images/default-drink.png'"
								mode="aspectFill"
							></image>
							<view class="drink-detail">
								<view class="drink-name-row">
									<text class="drink-name">{{ item.name }}</text>
									<text class="drink-badge" v-if="item.isRecommended"
										>推荐</text
									>
								</view>
								<view class="drink-desc">{{
									item.description || "暂无描述"
								}}</view>
								<view class="drink-price-row">
									<text class="drink-price">¥{{ item.price }}</text>
									<text
										class="drink-original-price"
										v-if="item.originalPrice && item.originalPrice > item.price"
										>¥{{ item.originalPrice }}</text
									>
								</view>
							</view>
						</view>
						<view class="drink-actions">
							<up-button
								type="warning"
								class="edit-btn"
								plain
								shape="circle"
								@click="openEditDrinkModal(item.id)"
								>编辑</up-button
							>
							<up-button
								type="error"
								class="delete-btn"
								plain
								shape="circle"
								@click="openDeleteDrinkModal(item.id)"
								>删除</up-button
							>
						</view>
					</view>
				</view>

				<!-- 空状态 -->
				<view
					class="empty-state"
					v-else-if="state.currentCategoryId && state.categories.length > 0"
				>
					<image src="/static/images/empty-drinks.png" mode="aspectFit"></image>
					<text>当前分类还没有酒水</text>
					<up-button class="add-drink-btn" @click="openAddDrinkModal"
						>添加酒水</up-button
					>
				</view>

				<view class="empty-state" v-else-if="state.categories.length === 0">
					<image
						src="/static/images/empty-category.png"
						mode="aspectFit"
					></image>
					<text>还没有创建分类</text>
					<up-button class="add-category-btn" @click="openAddCategoryModal"
						>创建分类</up-button
					>
				</view>

				<!-- 添加按钮 -->
				<view
					class="floating-btn"
					@click="openAddDrinkModal"
					v-if="state.currentCategoryId && state.categories.length > 0"
				>
					<!-- <image src="/static/images/icons/add-white.png" mode="aspectFit"></image> -->
					<up-icon name="plus" size="32" color="#fff"></up-icon>
				</view>
			</block>

			<!-- DIY酒料管理内容 -->
			<block v-if="state.menuType === 'diy'">
				<!-- DIY酒料分类导航 -->
				<view class="categories-nav">
					<scroll-view
						class="categories-scroll"
						scroll-x="true"
						enhanced="true"
						show-scrollbar="false"
					>
						<view
							class="category-item"
							v-for="(item, index) in state.diyTypes"
							:key="item.id"
							:class="{ active: state.currentDiyTypeId === item.id }"
							@click="switchDiyType(item.id)"
						>
							{{ item.name }}
						</view>
					</scroll-view>
					<view class="category-actions" v-if="state.diyTypes.length > 0">
						<view
							class="action-btn edit-category-btn"
							@click="openEditDiyTypeModal"
						>
							<!-- <image src="/static/images/icons/edit.png" mode="aspectFit"></image> -->
							<up-icon name="plus-circle-fill" size="56rpx"></up-icon>
						</view>
						<view
							class="action-btn delete-category-btn"
							@click="openDeleteDiyTypeModal"
						>
							<!-- <image src="/static/images/icons/delete.png" mode="aspectFit"></image> -->
							<up-icon name="minus-circle-fill" size="56rpx"></up-icon>
						</view>
					</view>
				</view>

				<!-- DIY酒料列表 -->
				<view class="diy-list" v-if="filteredDiyIngredients.length > 0">
					<view
						class="diy-item"
						v-for="(item, index) in filteredDiyIngredients"
						:key="item.id"
					>
						<view class="diy-info">
							<image
								class="diy-image"
								:src="item.image || '/static/images/default-ingredient.png'"
								mode="aspectFill"
							></image>
							<view class="diy-detail">
								<view class="diy-name-row">
									<text class="diy-name">{{ item.name }}</text>
								</view>
								<view class="diy-desc">{{
									item.description || "暂无描述"
								}}</view>
								<view class="diy-price-row" v-if="item.price > 0">
									<text class="diy-price">¥{{ item.price }}</text>
									<text class="diy-unit">/{{ item.unit }}</text>
								</view>
							</view>
						</view>
						<view class="diy-actions">
							<up-button
								type="warning"
								class="edit-btn"
								plain
								shape="circle"
								@click="openEditDiyIngredientModal(item.id)"
								>编辑</up-button
							>
							<up-button
								type="error"
								class="delete-btn"
								plain
								shape="circle"
								@click="openDeleteDiyIngredientModal(item.id)"
								>删除</up-button
							>
						</view>
					</view>
				</view>

				<!-- DIY酒料空状态 -->
				<view
					class="empty-state"
					v-else-if="state.currentDiyTypeId && state.diyTypes.length > 0"
				>
					<image
						src="/static/images/empty-ingredients.png"
						mode="aspectFit"
					></image>
					<text>当前分类还没有酒料</text>
					<up-button class="add-diy-btn" @click="openAddDiyIngredientModal"
						>添加酒料</up-button
					>
				</view>

				<view class="empty-state" v-else-if="state.diyTypes.length === 0">
					<image
						src="/static/images/empty-category.png"
						mode="aspectFit"
					></image>
					<text>还没有创建DIY酒料分类</text>
					<up-button class="add-category-btn" @click="openAddDiyTypeModal"
						>创建酒料分类</up-button
					>
				</view>

				<!-- 添加DIY酒料按钮 -->
				<view
					class="floating-btn"
					@click="openAddDiyIngredientModal"
					v-if="state.currentDiyTypeId && state.diyTypes.length > 0"
				>
					<up-icon name="plus" size="32" color="#fff"></up-icon>
				</view>
			</block>

			<!-- 分类模态框 -->
			<up-popup
				:show="state.showCategoryModal"
				mode="center"
				@close="closeCategoryModal"
			>
				<view class="z-modal-lg z-modal">
					<view class="modal-header">
						<text>{{ state.isEditingCategory ? "编辑分类" : "添加分类" }}</text>
						<view class="close-btn" @click="closeCategoryModal">×</view>
					</view>
					<view class="modal-body">
						<view class="form-group">
							<label>分类名称</label>
							<up-input
								v-model="state.tempCategory.name"
								placeholder="请输入分类名称"
							/>
						</view>
						<view class="form-group">
							<label>排序 (数字越小排序越靠前)</label>
							<up-input
								v-model.number="state.tempCategory.sort"
								placeholder="请输入排序数字"
								type="number"
							/>
						</view>
					</view>
					<view class="modal-footer">
						<up-button @click="closeCategoryModal">取消</up-button>
						<up-button type="primary" @click="saveCategory">确定</up-button>
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
						<view class="form-group">
							<label>分类名称</label>
							<up-input
								v-model="state.tempDiyType.name"
								placeholder="请输入分类名称"
							/>
						</view>
						<view class="form-group">
							<label>排序 (数字越小排序越靠前)</label>
							<up-input
								v-model.number="state.tempDiyType.sort"
								placeholder="请输入排序数字"
								type="number"
							/>
						</view>
					</view>
					<view class="modal-footer">
						<up-button class="cancel-btn" @click="closeDiyTypeModal"
							>取消</up-button
						>
						<up-button class="confirm-btn" @click="saveDiyType">确定</up-button>
					</view>
				</view>
			</up-popup>

			<!-- 酒水模态框 -->
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
					<view class="modal-body">
						<view class="image-upload" @click="uploadDrinkImage">
							<image
								class="drink-image-preview"
								:src="
									state.tempDrink.image || '/static/images/default-drink.png'
								"
								mode="aspectFill"
							></image>
							<view class="upload-icon">
								<!-- <image src="/static/images/icons/camera.png" mode="aspectFit"></image> -->
							</view>
						</view>

						<view class="form-group">
							<label>酒水名称</label>
							<up-input
								v-model="state.tempDrink.name"
								placeholder="请输入酒水名称"
							/>
						</view>

						<view class="form-group">
							<label>描述</label>
							<up-input
								v-model="state.tempDrink.description"
								type="textarea"
								placeholder="请输入酒水描述"
							/>
						</view>

						<view class="form-group">
							<label>价格 (元)</label>
							<up-input
								v-model.number="state.tempDrink.price"
								placeholder="请输入价格"
								type="number"
							/>
						</view>

						<view class="form-group">
							<label>原价 (元，可选)</label>
							<up-input
								v-model.number="state.tempDrink.originalPrice"
								placeholder="请输入原价"
								type="number"
							/>
						</view>

						<view class="form-group">
							<label>排序 (数字越小排序越靠前)</label>
							<up-input
								v-model.number="state.tempDrink.sort"
								placeholder="请输入排序数字"
								type="number"
							/>
						</view>

						<view class="form-group switch-group">
							<label>推荐酒水</label>
							<up-switch
								v-model="state.tempDrink.isRecommended"
								active-color="#1989fa"
							></up-switch>
						</view>

						<view class="form-group switch-group">
							<label>上架状态</label>
							<up-switch
								v-model="state.tempDrink.isAvailable"
								active-color="#1989fa"
							></up-switch>
						</view>

						<view class="form-group switch-group">
							<label>启用点单制</label>
							<up-switch
								v-model="state.tempDrink.enableOrdering"
								active-color="#1989fa"
							></up-switch>
						</view>
						<view class="form-tip">
							<text class="tip-text"
								>开启后，顾客可以通过扫码点单选择此酒水</text
							>
						</view>
					</view>
					<view class="modal-footer">
						<up-button @click="closeDrinkModal">取消</up-button>
						<up-button type="primary" @click="saveDrink">确定</up-button>
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

							<view class="form-group">
								<label>酒料名称</label>
								<up-input
									v-model="state.tempDiyIngredient.name"
									placeholder="请输入酒料名称"
								/>
							</view>

							<view class="form-group">
								<label>描述</label>
								<up-input
									v-model="state.tempDiyIngredient.description"
									type="textarea"
									placeholder="请输入酒料描述"
								/>
							</view>

							<view class="form-group">
								<label>附加价格 (元，可选)</label>
								<up-input
									v-model.number="state.tempDiyIngredient.price"
									placeholder="请输入附加价格，0表示免费"
									type="number"
								/>
							</view>

							<view class="form-group">
								<label>计量单位</label>
								<up-input
									v-model="state.tempDiyIngredient.unit"
									placeholder="例如：份、杯、瓶等"
								/>
							</view>

							<view class="form-group">
								<label>排序 (数字越小排序越靠前)</label>
								<up-input
									v-model.number="state.tempDiyIngredient.sort"
									placeholder="请输入排序数字"
									type="number"
								/>
							</view>

							<view class="form-group switch-group">
								<label>推荐酒料</label>
								<up-switch
									v-model="state.tempDiyIngredient.isRecommended"
									active-color="#1989fa"
								></up-switch>
							</view>

							<view class="form-group switch-group">
								<label>上架状态</label>
								<up-switch
									v-model="state.tempDiyIngredient.isAvailable"
									active-color="#1989fa"
								></up-switch>
							</view>
						</scroll-view>
					</view>
					<view class="modal-footer">
						<up-button @click="closeDiyIngredientModal">取消</up-button>
						<up-button type="primary" @click="saveDiyIngredient"
							>确定</up-button
						>
					</view>
				</view>
			</up-popup>

			<!-- 删除分类确认模态框 -->
			<up-modal
				:show="state.showDeleteCategoryModal"
				@cancel="closeDeleteCategoryModal"
				@confirm="deleteCategory"
				showCancelButton
				title="提示"
				content="删除分类将同时删除该分类下的所有酒水，此操作不可恢复，确定要删除吗？"
			></up-modal>

			<!-- 删除DIY酒料分类确认模态框 -->
			<up-modal
				:show="state.showDeleteDiyTypeModal"
				@cancel="closeDeleteDiyTypeModal"
				@confirm="deleteDiyType"
				showCancelButton
				title="提示"
				content="删除分类将同时删除该分类下的所有DIY酒料，此操作不可恢复，确定要删除吗？"
			></up-modal>

			<!-- 删除酒水确认模态框 -->
			<up-modal
				:show="state.showDeleteDrinkModal"
				@cancel="closeDeleteDrinkModal"
				@confirm="deleteDrink"
				showCancelButton
				title="提示"
				content="删除酒水后将无法恢复，确定要删除吗？"
			></up-modal>

			<!-- 删除DIY酒料确认模态框 -->
			<up-modal
				:show="state.showDeleteDiyIngredientModal"
				@cancel="closeDeleteDiyIngredientModal"
				@confirm="deleteDiyIngredient"
				showCancelButton
				title="提示"
				content="删除酒料后将无法恢复，确定要删除吗？"
			></up-modal>
		</view>
	</pageWrapper>
</template>

<script lang="ts" setup>
import { reactive, computed, onMounted } from "vue";

// 定义组件选项
defineOptions({
	name: "ShopMenuPage",
});

// 定义接口类型
interface Drink {
	id: string;
	name: string;
	image: string;
	description: string;
	price: number;
	originalPrice: number;
	sort: number;
	isRecommended: boolean;
	isAvailable: boolean;
	enableOrdering: boolean;
	categoryId: string;
}

interface Category {
	id: string;
	name: string;
	sort: number;
	drinks: Drink[];
}

interface DiyIngredient {
	id: string;
	name: string;
	image: string;
	description: string;
	price: number;
	unit: string;
	sort: number;
	isRecommended: boolean;
	isAvailable: boolean;
	diyTypeId: string;
}

interface DiyType {
	id: string;
	name: string;
	sort: number;
	ingredients: DiyIngredient[];
}

// 状态管理
const state = reactive({
	menuType: "regular" as "regular" | "diy",
	categories: [
		{
			id: "1",
			name: "鸡尾酒",
			sort: 1,
			drinks: [
				{
					id: "101",
					name: "玛格丽塔",
					image: "/static/logo.png",
					description: "经典柑橘风味，酸甜平衡",
					price: 48,
					originalPrice: 58,
					sort: 1,
					isRecommended: true,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "1",
				},
				{
					id: "102",
					name: "莫吉托",
					image: "/static/logo.png",
					description: "清新薄荷与朗姆酒的完美结合",
					price: 45,
					originalPrice: 0,
					sort: 2,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "1",
				},
				{
					id: "103",
					name: "老式鸡尾酒",
					image: "/static/logo.png",
					description: "威士忌基底，经典苦味",
					price: 52,
					originalPrice: 0,
					sort: 3,
					isRecommended: false,
					isAvailable: false,
					enableOrdering: false,
					categoryId: "1",
				},
				{
					id: "104",
					name: "曼哈顿",
					image: "/static/logo.png",
					description: "威士忌与甜苦艾酒的优雅融合",
					price: 55,
					originalPrice: 0,
					sort: 4,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "1",
				},
				{
					id: "105",
					name: "皮纳科拉达",
					image: "/static/logo.png",
					description: "椰子与菠萝的热带风情",
					price: 48,
					originalPrice: 0,
					sort: 5,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "1",
				},
				{
					id: "106",
					name: "蓝色夏威夷",
					image: "/static/logo.png",
					description: "蓝色库拉索与柑橘的奇妙组合",
					price: 50,
					originalPrice: 0,
					sort: 6,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "1",
				},
				{
					id: "107",
					name: "长岛冰茶",
					image: "/static/logo.png",
					description: "多种烈酒混合，强劲有力",
					price: 58,
					originalPrice: 0,
					sort: 7,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "1",
				},
				{
					id: "108",
					name: "血腥玛丽",
					image: "/static/logo.png",
					description: "番茄汁与伏特加的独特风味",
					price: 45,
					originalPrice: 0,
					sort: 8,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "1",
				},
			],
		},
		{
			id: "2",
			name: "威士忌",
			sort: 2,
			drinks: [
				{
					id: "201",
					name: "杰克丹尼",
					image: "/static/logo.png",
					description: "美国田纳西州经典威士忌",
					price: 68,
					originalPrice: 0,
					sort: 1,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "2",
				},
				{
					id: "202",
					name: "占边",
					image: "/static/logo.png",
					description: "经典波本威士忌",
					price: 65,
					originalPrice: 0,
					sort: 2,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "2",
				},
				{
					id: "203",
					name: "格兰菲迪12年",
					image: "/static/logo.png",
					description: "苏格兰单一麦芽威士忌",
					price: 88,
					originalPrice: 0,
					sort: 3,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "2",
				},
				{
					id: "204",
					name: "麦卡伦12年",
					image: "/static/logo.png",
					description: "雪莉桶陈酿，口感丰富",
					price: 98,
					originalPrice: 0,
					sort: 4,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "2",
				},
				{
					id: "205",
					name: "山崎",
					image: "/static/logo.png",
					description: "日本威士忌代表作",
					price: 108,
					originalPrice: 0,
					sort: 5,
					isRecommended: false,
					isAvailable: false,
					enableOrdering: false,
					categoryId: "2",
				},
			],
		},
		{
			id: "3",
			name: "啤酒",
			sort: 3,
			drinks: [
				{
					id: "301",
					name: "百威",
					image: "/static/logo.png",
					description: "美国经典拉格啤酒",
					price: 28,
					originalPrice: 0,
					sort: 1,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "3",
				},
				{
					id: "302",
					name: "科罗娜",
					image: "/static/logo.png",
					description: "墨西哥清爽啤酒，搭配柠檬",
					price: 30,
					originalPrice: 0,
					sort: 2,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "3",
				},
				{
					id: "303",
					name: "喜力",
					image: "/static/logo.png",
					description: "荷兰优质拉格啤酒",
					price: 32,
					originalPrice: 0,
					sort: 3,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "3",
				},
				{
					id: "304",
					name: "青岛",
					image: "/static/logo.png",
					description: "中国经典啤酒",
					price: 25,
					originalPrice: 0,
					sort: 4,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "3",
				},
				{
					id: "305",
					name: "鹅岛IPA",
					image: "/static/logo.png",
					description: "美国精酿IPA，浓郁啤酒花香",
					price: 38,
					originalPrice: 0,
					sort: 5,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "3",
				},
				{
					id: "306",
					name: "凯旋1664白啤",
					image: "/static/logo.png",
					description: "法国小麦啤酒，果香浓郁",
					price: 35,
					originalPrice: 0,
					sort: 6,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "3",
				},
			],
		},
		{
			id: "4",
			name: "葡萄酒",
			sort: 4,
			drinks: [
				{
					id: "401",
					name: "拉菲传奇波尔多红",
					image: "/static/logo.png",
					description: "法国波尔多经典红酒",
					price: 88,
					originalPrice: 0,
					sort: 1,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "4",
				},
				{
					id: "402",
					name: "黄尾袋鼠西拉",
					image: "/static/logo.png",
					description: "澳大利亚果香型红酒",
					price: 78,
					originalPrice: 0,
					sort: 2,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "4",
				},
				{
					id: "403",
					name: "桑塔丽塔珍藏霞多丽",
					image: "/static/logo.png",
					description: "智利清爽白葡萄酒",
					price: 75,
					originalPrice: 0,
					sort: 3,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "4",
				},
				{
					id: "404",
					name: "卡斯特罗起泡酒",
					image: "/static/logo.png",
					description: "西班牙清爽起泡酒",
					price: 68,
					originalPrice: 0,
					sort: 4,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "4",
				},
			],
		},
		{
			id: "5",
			name: "清酒",
			sort: 5,
			drinks: [
				{
					id: "501",
					name: "月桂冠",
					image: "/static/logo.png",
					description: "日本传统清酒",
					price: 58,
					originalPrice: 0,
					sort: 1,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "5",
				},
				{
					id: "502",
					name: "獭祭二割三分",
					image: "/static/logo.png",
					description: "日本顶级大吟酿",
					price: 128,
					originalPrice: 0,
					sort: 2,
					isRecommended: false,
					isAvailable: false,
					enableOrdering: false,
					categoryId: "5",
				},
				{
					id: "503",
					name: "白鹤银笺",
					image: "/static/logo.png",
					description: "口感清爽，适合搭配海鲜",
					price: 68,
					originalPrice: 0,
					sort: 3,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "5",
				},
			],
		},
		{
			id: "6",
			name: "无酒精饮品",
			sort: 6,
			drinks: [
				{
					id: "601",
					name: "可口可乐",
					image: "/static/logo.png",
					description: "经典碳酸饮料",
					price: 15,
					originalPrice: 0,
					sort: 1,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "6",
				},
				{
					id: "602",
					name: "雪碧",
					image: "/static/logo.png",
					description: "柠檬风味碳酸饮料",
					price: 15,
					originalPrice: 0,
					sort: 2,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "6",
				},
				{
					id: "603",
					name: "椰树牌椰汁",
					image: "/static/logo.png",
					description: "天然椰子汁",
					price: 18,
					originalPrice: 0,
					sort: 3,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "6",
				},
				{
					id: "604",
					name: "巴黎水",
					image: "/static/logo.png",
					description: "天然气泡矿泉水",
					price: 22,
					originalPrice: 0,
					sort: 4,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "6",
				},
				{
					id: "605",
					name: "鲜榨橙汁",
					image: "/static/logo.png",
					description: "现场鲜榨，富含维生素C",
					price: 28,
					originalPrice: 0,
					sort: 5,
					isRecommended: false,
					isAvailable: true,
					enableOrdering: true,
					categoryId: "6",
				},
			],
		},
	] as Category[],
	currentCategoryId: "1",
	diyTypes: [
		{
			id: "1",
			name: "基酒",
			sort: 1,
		},
		{
			id: "2",
			name: "调味酒",
			sort: 2,
		},
		{
			id: "3",
			name: "果汁/糖浆",
			sort: 3,
		},
		{
			id: "4",
			name: "装饰物",
			sort: 4,
		},
		{
			id: "5",
			name: "气泡饮料",
			sort: 5,
		},
	] as DiyType[],
	diyIngredients: [
		{
			id: "1",
			typeId: "1",
			name: "伏特加",
			description: "无色、无味的蒸馏酒，酒精度40%左右",
			price: 20,
			unit: "份",
			image: "/static/images/ingredient1.png",
			sort: 1,
			isRecommended: true,
			isAvailable: true,
		},
		{
			id: "2",
			typeId: "1",
			name: "金酒",
			description: "以杜松子调味的蒸馏酒，酒精度40-47%",
			price: 25,
			unit: "份",
			image: "/static/images/ingredient2.png",
			sort: 2,
			isRecommended: false,
			isAvailable: true,
		},
		{
			id: "3",
			typeId: "1",
			name: "朗姆酒",
			description: "由甘蔗制成的烈酒，有白朗姆和黑朗姆之分",
			price: 22,
			unit: "份",
			image: "/static/images/rum.png",
			sort: 3,
			isRecommended: true,
			isAvailable: true,
		},
		{
			id: "4",
			typeId: "1",
			name: "龙舌兰",
			description: "由墨西哥龙舌兰植物制成的烈酒",
			price: 28,
			unit: "份",
			image: "/static/images/tequila.png",
			sort: 4,
			isRecommended: false,
			isAvailable: true,
		},
		{
			id: "5",
			typeId: "2",
			name: "君度橙酒",
			description: "甜橙口味的利口酒，常用于调制鸡尾酒",
			price: 15,
			unit: "份",
			image: "/static/images/cointreau.png",
			sort: 1,
			isRecommended: true,
			isAvailable: true,
		},
		{
			id: "6",
			typeId: "2",
			name: "蓝色柑橙酒",
			description: "蓝色的甜味利口酒，常用于调制蓝色鸡尾酒",
			price: 15,
			unit: "份",
			image: "/static/images/blue-curacao.png",
			sort: 2,
			isRecommended: false,
			isAvailable: true,
		},
		{
			id: "7",
			typeId: "2",
			name: "咖啡利口酒",
			description: "浓郁的咖啡风味酒，后味微甜",
			price: 18,
			unit: "份",
			image: "/static/images/coffee-liqueur.png",
			sort: 3,
			isRecommended: true,
			isAvailable: true,
		},
		{
			id: "8",
			typeId: "3",
			name: "柠檬汁",
			description: "新鲜压榨的柠檬汁",
			price: 5,
			unit: "份",
			image: "/static/images/ingredient3.png",
			sort: 1,
			isRecommended: true,
			isAvailable: true,
		},
		{
			id: "9",
			typeId: "3",
			name: "香草糖浆",
			description: "带有香草风味的甜糖浆",
			price: 3,
			unit: "份",
			image: "/static/images/vanilla-syrup.png",
			sort: 2,
			isRecommended: false,
			isAvailable: true,
		},
		{
			id: "10",
			typeId: "3",
			name: "蔓越莓汁",
			description: "酸甜可口的蔓越莓果汁",
			price: 8,
			unit: "份",
			image: "/static/images/cranberry-juice.png",
			sort: 3,
			isRecommended: true,
			isAvailable: true,
		},
		{
			id: "11",
			typeId: "3",
			name: "西瓜汁",
			description: "新鲜压榨的西瓜汁，清甜爽口",
			price: 10,
			unit: "份",
			image: "/static/images/watermelon-juice.png",
			sort: 4,
			isRecommended: false,
			isAvailable: true,
		},
		{
			id: "12",
			typeId: "4",
			name: "薄荷叶",
			description: "新鲜薄荷叶，用于装饰和增香",
			price: 3,
			unit: "份",
			image: "/static/images/ingredient4.png",
			sort: 1,
			isRecommended: false,
			isAvailable: true,
		},
		{
			id: "13",
			typeId: "4",
			name: "柠檬片",
			description: "切片柠檬，用于装饰和调味",
			price: 2,
			unit: "份",
			image: "/static/images/lemon-slice.png",
			sort: 2,
			isRecommended: true,
			isAvailable: true,
		},
		{
			id: "14",
			typeId: "4",
			name: "橄榄",
			description: "腌制橄榄，常用于马提尼等鸡尾酒装饰",
			price: 4,
			unit: "份",
			image: "/static/images/olive.png",
			sort: 3,
			isRecommended: false,
			isAvailable: true,
		},
		{
			id: "15",
			typeId: "4",
			name: "樱桃",
			description: "鸡尾酒专用樱桃，色泽鲜艳",
			price: 5,
			unit: "份",
			image: "/static/images/cocktail-cherry.png",
			sort: 4,
			isRecommended: true,
			isAvailable: true,
		},
		{
			id: "16",
			typeId: "5",
			name: "苏打水",
			description: "无味气泡水，用于调和鸡尾酒",
			price: 0,
			unit: "份",
			image: "/static/images/soda-water.png",
			sort: 1,
			isRecommended: true,
			isAvailable: true,
		},
		{
			id: "17",
			typeId: "5",
			name: "汤力水",
			description: "带有奎宁苦味的气泡水，常与金酒搭配",
			price: 5,
			unit: "份",
			image: "/static/images/tonic-water.png",
			sort: 2,
			isRecommended: true,
			isAvailable: true,
		},
		{
			id: "18",
			typeId: "5",
			name: "姜汁汽水",
			description: "辛辣微甜的姜味汽水，搭配朗姆酒风味绝佳",
			price: 8,
			unit: "份",
			image: "/static/images/ginger-ale.png",
			sort: 3,
			isRecommended: false,
			isAvailable: true,
		},
	],
	currentDiyTypeId: "1",
	showCategoryModal: false,
	isEditingCategory: false,
	tempCategory: {
		id: "",
		name: "",
		sort: 0,
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
		categoryId: "1",
	} as Drink,
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
	} as DiyIngredient,
	showDeleteCategoryModal: false,
	showDeleteDiyTypeModal: false,
	showDeleteDrinkModal: false,
	deleteDrinkId: "",
	showDeleteDiyIngredientModal: false,
	deleteDiyIngredientId: "",
});

// 计算属性
const filteredDrinks = computed(() => {
	const category = state.categories.find(
		(cat) => cat.id === state.currentCategoryId
	);
	return category ? category.drinks.sort((a, b) => a.sort - b.sort) : [];
});

const filteredDiyIngredients = computed(() => {
	// const diyType = state.diyTypes.find(type => type.id === state.currentDiyTypeId);
	// return diyType ? diyType.ingredients.sort((a, b) => a.sort - b.sort) : [];
	return state.diyIngredients
		.filter((item) => item.typeId === state.currentDiyTypeId)
		.sort((a, b) => a.sort - b.sort);
});

// 生命周期钩子
onMounted(() => {
	// 初始化数据，如果需要从接口获取数据，可以在这里调用
	console.log("页面加载完成");
});

// 页面方法
const navigateBack = () => {
	uni.navigateBack();
};

const switchMenuType = (type: "regular" | "diy") => {
	state.menuType = type;
};

const switchCategory = (id: string) => {
	state.currentCategoryId = id;
};

const switchDiyType = (id: string) => {
	state.currentDiyTypeId = id;
};

const openAddCategoryModal = () => {
	state.isEditingCategory = false;
	state.tempCategory = {
		id: "",
		name: "",
		sort: 0,
	};
	state.showCategoryModal = true;
};

const openEditCategoryModal = () => {
	const currentCategory = state.categories.find(
		(cat) => cat.id === state.currentCategoryId
	);
	if (currentCategory) {
		state.isEditingCategory = true;
		state.tempCategory = { ...currentCategory };
		state.showCategoryModal = true;
	}
};

const closeCategoryModal = () => {
	state.showCategoryModal = false;
};

const saveCategory = () => {
	if (!state.tempCategory.name) {
		uni.showToast({
			title: "请输入分类名称",
			icon: "none",
		});
		return;
	}

	if (state.isEditingCategory) {
		const index = state.categories.findIndex(
			(cat) => cat.id === state.tempCategory.id
		);
		if (index !== -1) {
			state.categories[index] = {
				...state.tempCategory,
				drinks: state.categories[index].drinks,
			};
		}
	} else {
		const newCategory = {
			...state.tempCategory,
			id: Date.now().toString(),
			drinks: [],
		};
		state.categories.push(newCategory as Category);
		if (state.categories.length === 1) {
			state.currentCategoryId = newCategory.id;
		}
	}

	state.categories.sort((a, b) => a.sort - b.sort);
	state.showCategoryModal = false;
	uni.showToast({
		title: state.isEditingCategory ? "分类已更新" : "分类已添加",
		icon: "success",
	});
};

const openDeleteCategoryModal = () => {
	state.showDeleteCategoryModal = true;
};

const closeDeleteCategoryModal = () => {
	state.showDeleteCategoryModal = false;
};

const deleteCategory = () => {
	const index = state.categories.findIndex(
		(cat) => cat.id === state.currentCategoryId
	);
	if (index !== -1) {
		state.categories.splice(index, 1);
		if (state.categories.length > 0) {
			state.currentCategoryId = state.categories[0].id;
		} else {
			state.currentCategoryId = "";
		}
	}
	state.showDeleteCategoryModal = false;
	uni.showToast({
		title: "分类已删除",
		icon: "success",
	});
};

const openAddDrinkModal = () => {
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
		categoryId: state.currentCategoryId,
	};
	state.showDrinkModal = true;
};

const openEditDrinkModal = (id: string) => {
	const category = state.categories.find(
		(cat) => cat.id === state.currentCategoryId
	);
	if (category) {
		const drink = category.drinks.find((d) => d.id === id);
		if (drink) {
			state.isEditingDrink = true;
			state.tempDrink = { ...drink };
			state.showDrinkModal = true;
		}
	}
};

const closeDrinkModal = () => {
	state.showDrinkModal = false;
};

const saveDrink = () => {
	if (!state.tempDrink.name) {
		uni.showToast({
			title: "请输入酒水名称",
			icon: "none",
		});
		return;
	}
	if (state.tempDrink.price <= 0) {
		uni.showToast({
			title: "价格必须大于0",
			icon: "none",
		});
		return;
	}

	const categoryIndex = state.categories.findIndex(
		(cat) => cat.id === state.tempDrink.categoryId
	);
	if (categoryIndex !== -1) {
		if (state.isEditingDrink) {
			const drinkIndex = state.categories[categoryIndex].drinks.findIndex(
				(d) => d.id === state.tempDrink.id
			);
			if (drinkIndex !== -1) {
				state.categories[categoryIndex].drinks[drinkIndex] = {
					...state.tempDrink,
				};
			}
		} else {
			const newDrink = {
				...state.tempDrink,
				id: Date.now().toString(),
			};
			state.categories[categoryIndex].drinks.push(newDrink);
		}
		state.categories[categoryIndex].drinks.sort((a, b) => a.sort - b.sort);
	}

	state.showDrinkModal = false;
	uni.showToast({
		title: state.isEditingDrink ? "酒水已更新" : "酒水已添加",
		icon: "success",
	});
};

const openDeleteDrinkModal = (id: string) => {
	state.deleteDrinkId = id;
	state.showDeleteDrinkModal = true;
};

const closeDeleteDrinkModal = () => {
	state.showDeleteDrinkModal = false;
	state.deleteDrinkId = "";
};

const deleteDrink = () => {
	const categoryIndex = state.categories.findIndex(
		(cat) => cat.id === state.currentCategoryId
	);
	if (categoryIndex !== -1) {
		const drinkIndex = state.categories[categoryIndex].drinks.findIndex(
			(d) => d.id === state.deleteDrinkId
		);
		if (drinkIndex !== -1) {
			state.categories[categoryIndex].drinks.splice(drinkIndex, 1);
		}
	}
	state.showDeleteDrinkModal = false;
	state.deleteDrinkId = "";
	uni.showToast({
		title: "酒水已删除",
		icon: "success",
	});
};

const uploadDrinkImage = () => {
	uni.chooseImage({
		count: 1,
		sizeType: ["original", "compressed"],
		sourceType: ["album", "camera"],
		success: (res) => {
			state.tempDrink.image = res.tempFilePaths[0];
		},
	});
};

const openAddDiyTypeModal = () => {
	state.isEditingDiyType = false;
	state.tempDiyType = {
		id: "",
		name: "",
		sort: 0,
	};
	state.showDiyTypeModal = true;
};

const openEditDiyTypeModal = () => {
	const currentDiyType = state.diyTypes.find(
		(type) => type.id === state.currentDiyTypeId
	);
	if (currentDiyType) {
		state.isEditingDiyType = true;
		state.tempDiyType = { ...currentDiyType };
		state.showDiyTypeModal = true;
	}
};

const closeDiyTypeModal = () => {
	state.showDiyTypeModal = false;
};

const saveDiyType = () => {
	if (!state.tempDiyType.name) {
		uni.showToast({
			title: "请输入分类名称",
			icon: "none",
		});
		return;
	}

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
		state.diyTypes.push(newDiyType as DiyType);
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
};

const openDeleteDiyTypeModal = () => {
	state.showDeleteDiyTypeModal = true;
};

const closeDeleteDiyTypeModal = () => {
	state.showDeleteDiyTypeModal = false;
};

const deleteDiyType = () => {
	const index = state.diyTypes.findIndex(
		(type) => type.id === state.currentDiyTypeId
	);
	if (index !== -1) {
		state.diyTypes.splice(index, 1);
		if (state.diyTypes.length > 0) {
			state.currentDiyTypeId = state.diyTypes[0].id;
		} else {
			state.currentDiyTypeId = "";
		}
	}
	state.showDeleteDiyTypeModal = false;
	uni.showToast({
		title: "分类已删除",
		icon: "success",
	});
};

const openAddDiyIngredientModal = () => {
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
		diyTypeId: state.currentDiyTypeId,
	};
	state.showDiyIngredientModal = true;
};

const openEditDiyIngredientModal = (id: string) => {
	const diyType = state.diyTypes.find(
		(type) => type.id === state.currentDiyTypeId
	);
	if (diyType) {
		// const ingredient = diyType.ingredients.find(i => i.id === id);
		const ingredient = state.diyIngredients.find((i) => i.id === id);
		if (ingredient) {
			state.isEditingDiyIngredient = true;
			state.tempDiyIngredient = { ...ingredient };
			state.showDiyIngredientModal = true;
		}
	}
};

const closeDiyIngredientModal = () => {
	state.showDiyIngredientModal = false;
};

const saveDiyIngredient = () => {
	if (!state.tempDiyIngredient.name) {
		uni.showToast({
			title: "请输入酒料名称",
			icon: "none",
		});
		return;
	}

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
};

const openDeleteDiyIngredientModal = (id: string) => {
	state.deleteDiyIngredientId = id;
	state.showDeleteDiyIngredientModal = true;
};

const closeDeleteDiyIngredientModal = () => {
	state.showDeleteDiyIngredientModal = false;
	state.deleteDiyIngredientId = "";
};

const deleteDiyIngredient = () => {
	const diyTypeIndex = state.diyTypes.findIndex(
		(type) => type.id === state.currentDiyTypeId
	);
	if (diyTypeIndex !== -1) {
		const ingredientIndex = state.diyTypes[diyTypeIndex].ingredients.findIndex(
			(i) => i.id === state.deleteDiyIngredientId
		);
		if (ingredientIndex !== -1) {
			state.diyTypes[diyTypeIndex].ingredients.splice(ingredientIndex, 1);
		}
	}
	state.showDeleteDiyIngredientModal = false;
	state.deleteDiyIngredientId = "";
	uni.showToast({
		title: "酒料已删除",
		icon: "success",
	});
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
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
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

.add-btn {
	width: 70rpx;
	height: 70rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: rgba(25, 137, 250, 0.9);
	border-radius: 50%;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.08);
}

.add-btn image {
	width: 38rpx;
	height: 38rpx;
	filter: brightness(10);
}

/* 顶部菜单栏 */
.menu-tabs {
	display: flex;
	margin-bottom: 30rpx;
	background-color: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 15rpx rgba(0, 0, 0, 0.06);
}

.menu-tab {
	flex: 1;
	height: 90rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
	color: #666;
	position: relative;
	transition: all 0.3s ease;
}

.menu-tab.active {
	color: #1989fa;
	font-weight: 600;
}

.menu-tab.active::after {
	content: "";
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 60rpx;
	height: 6rpx;
	background-color: #1989fa;
	border-radius: 3rpx;
}

/* 分类导航样式 */
.categories-nav {
	display: flex;
	align-items: center;
	margin-bottom: 25rpx;
	background-color: #fff;
	border-radius: 16rpx;
	padding: 20rpx 30rpx;
	box-shadow: 0 2rpx 15rpx rgba(0, 0, 0, 0.05);
}

.categories-scroll {
	flex: 1;
	white-space: nowrap;
	overflow-x: auto;
}

.categories-scroll::-webkit-scrollbar {
	display: none;
}

.category-item {
	display: inline-block;
	padding: 14rpx 30rpx;
	margin-right: 20rpx;
	border-radius: 30rpx;
	font-size: 28rpx;
	background-color: #f0f0f0;
	color: #666;
	transition: all 0.3s ease;
}

.category-item.active {
	background-color: #1989fa;
	color: #fff;
	box-shadow: 0 4rpx 8rpx rgba(25, 137, 250, 0.2);
}

.category-actions {
	display: flex;
	margin-left: 20rpx;
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
}

.action-btn image {
	width: 32rpx;
	height: 32rpx;
}

/* 酒水列表 */
.drink-list {
	margin-top: 20rpx;
	padding-bottom: 100rpx;
}

.drink-item {
	position: relative;
	margin-bottom: 25rpx;
	background-color: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 20rpx rgba(0, 0, 0, 0.06);
	transition: all 0.3s ease;
	padding: 16rpx;
}

.drink-item:active {
	transform: scale(0.98);
}

.drink-info {
	display: flex;
	padding: 20rpx;
}

.drink-image {
	width: 160rpx;
	height: 160rpx;
	border-radius: 12rpx;
	overflow: hidden;
	background-color: #f5f5f5;
	flex-shrink: 0;
}

.drink-detail {
	flex: 1;
	margin-left: 25rpx;
	overflow: hidden;
}

.drink-name-row {
	display: flex;
	align-items: center;
	margin-bottom: 12rpx;
}

.drink-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	margin-right: 15rpx;
}

.drink-badge {
	font-size: 20rpx;
	color: #ff6b00;
	background-color: rgba(255, 107, 0, 0.1);
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
}

.drink-desc {
	font-size: 26rpx;
	color: #999;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	text-overflow: ellipsis;
	margin-bottom: 15rpx;
	line-height: 1.5;
}

.drink-price-row {
	display: flex;
	align-items: center;
}

.drink-price {
	font-size: 34rpx;
	color: #ff6b00;
	font-weight: 700;
}

.drink-original-price {
	font-size: 26rpx;
	color: #bbb;
	text-decoration: line-through;
	margin-left: 15rpx;
}

.drink-actions {
	display: flex;
	// justify-content: space-between;
	gap: 20rpx;
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

/* DIY酒料列表 */
.diy-list {
	margin-top: 20rpx;
	padding-bottom: 100rpx;
}

.diy-item {
	margin-bottom: 25rpx;
	background-color: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 20rpx rgba(0, 0, 0, 0.06);
	transition: all 0.3s ease;
	padding: 16rpx;
}

.diy-item:active {
	transform: scale(0.98);
}

.diy-info {
	display: flex;
	padding: 20rpx;
}

.diy-image {
	width: 140rpx;
	height: 140rpx;
	border-radius: 12rpx;
	overflow: hidden;
	background-color: #f5f5f5;
	flex-shrink: 0;
}

.diy-detail {
	flex: 1;
	margin-left: 25rpx;
	overflow: hidden;
}

.diy-name-row {
	display: flex;
	align-items: center;
	margin-bottom: 10rpx;
}

.diy-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.diy-desc {
	font-size: 26rpx;
	color: #999;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	text-overflow: ellipsis;
	margin-bottom: 15rpx;
	line-height: 1.5;
}

.diy-price-row {
	display: flex;
	align-items: center;
}

.diy-price {
	font-size: 34rpx;
	color: #ff6b00;
	font-weight: 700;
}

.diy-unit {
	font-size: 24rpx;
	color: #999;
	margin-left: 5rpx;
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

.add-drink-btn,
.add-category-btn,
.add-diy-btn {
	width: 300rpx;
	height: 80rpx;
	line-height: 80rpx;
	background-color: #1989fa;
	color: #fff;
	font-size: 30rpx;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 10rpx 20rpx rgba(25, 137, 250, 0.2);
}

/* 悬浮按钮 */
.floating-btn {
	position: fixed;
	right: 40rpx;
	bottom: 100rpx;
	width: 100rpx;
	height: 100rpx;
	background-color: #1989fa;
	color: #fff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 10rpx 20rpx rgba(25, 137, 250, 0.3);
	z-index: 10;
	transition: all 0.3s ease;
}

.floating-btn image {
	width: 48rpx;
	height: 48rpx;
}

.floating-btn:active {
	transform: scale(0.95);
}

/* 模态框样式 */
.modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 100;
	display: flex;
	align-items: center;
	justify-content: center;
}

.modal-content {
	width: 650rpx;
	background-color: #fff;
	border-radius: 24rpx;
	overflow: hidden;
	box-shadow: 0 15rpx 30rpx rgba(0, 0, 0, 0.1);
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	border-bottom: 1rpx solid #eee;
}

.modal-header text {
	font-size: 34rpx;
	font-weight: 600;
	color: #333;
}

.close-btn {
	font-size: 44rpx;
	color: #999;
	line-height: 1;
}

.modal-body {
	padding: 30rpx;
	max-height: 800rpx;
	overflow-y: auto;
}

.form-group {
	margin-bottom: 30rpx;
}

.form-group label {
	display: block;
	font-size: 28rpx;
	color: #666;
	margin-bottom: 15rpx;
}

.form-group input,
.form-group textarea {
	width: 100%;
	height: 80rpx;
	padding: 0 20rpx;
	font-size: 30rpx;
	border: 1rpx solid #e0e0e0;
	border-radius: 12rpx;
	box-sizing: border-box;
	background-color: #fafafa;
}

.form-group textarea {
	height: 200rpx;
	padding: 20rpx;
	line-height: 1.6;
}

.image-upload {
	width: 200rpx;
	height: 200rpx;
	margin: 0 auto 30rpx;
	border-radius: 12rpx;
	overflow: hidden;
	position: relative;
	border: 1rpx dashed #ddd;
	background-color: #fafafa;
}

.drink-image-preview {
	width: 100%;
	height: 100%;
}

.upload-icon {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: rgba(0, 0, 0, 0.2);
}

.upload-icon image {
	width: 60rpx;
	height: 60rpx;
}

.modal-footer {
	display: flex;
	padding: 20rpx 30rpx;
	border-top: 1rpx solid #eee;
}

.cancel-btn,
.confirm-btn {
	flex: 1;
	height: 80rpx;
	line-height: 80rpx;
	text-align: center;
	font-size: 30rpx;
	border-radius: 40rpx;
}

.cancel-btn {
	color: #666;
	background-color: #f5f5f5;
	margin-right: 20rpx;
}

.confirm-btn {
	color: #fff;
	background-color: #1989fa;
}

/* 表单提示文字样式 */
.form-tip {
	margin-top: 10rpx;
	padding: 15rpx 20rpx;
	background-color: #f8f9fa;
	border-radius: 8rpx;
	border-left: 4rpx solid #1989fa;
}

.tip-text {
	font-size: 24rpx;
	color: #666;
	line-height: 1.4;
}
.diy-actions {
	display: flex;
	// flex-direction: column;
	justify-content: space-between;
	align-items: center;
	gap: 20rpx;
	width: 80%;
	margin: 0 auto;
}

.edit-btn,
.delete-btn {
	flex: 1;
	height: 60rpx !important;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	position: relative;
	flex-shrink: 0;
}
</style>
