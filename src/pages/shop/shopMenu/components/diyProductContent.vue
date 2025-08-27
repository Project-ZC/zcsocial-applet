<template>
	<view class="z-modal-lg z-modal">
		<view class="modal-header">
			<text>{{ props.type === "edit" ? "编辑酒料" : "添加酒料" }}</text>
			<view class="close-btn" @click="close">×</view>
		</view>
		<view class="modal-body">
			<scroll-view
				class="categories-scroll"
				scroll-y="true"
				enhanced="true"
				show-scrollbar="true"
				style="max-height: 900rpx"
			>
				<!-- <view class="image-upload" @click="uploadDiyIngredientImage">
					<image
						class="drink-image-preview"
						:src="state.form.image || '/static/images/default-ingredient.png'"
						mode="aspectFill"
					></image>
					<view class="upload-icon">
						<image
							src="/static/images/icons/camera.png"
							mode="aspectFit"
						></image>
					</view>
				</view> -->
				<view class="image-upload">
					<UploadFile v-model="state.form.image" :max-count="1"></UploadFile>
				</view>
				<up-form
					:model="state.form"
					ref="diyIngredientFormRef"
					:rules="state.rules"
					labelPosition="top"
					labelWidth="auto"
				>
					<up-form-item label="酒料名称" prop="name">
						<up-input v-model="state.form.name" placeholder="请输入酒料名称" />
					</up-form-item>
					<up-form-item label="所属细分类" prop="categoryId">
						<view class="category-selector" @click="showCategorySelector">
							<up-input
								v-model="state.form.categoryName"
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
							v-model="state.form.description"
							placeholder="请输入酒料描述"
						/>
					</up-form-item>

					<!-- <up-form-item label="附加价格 (元，可选)" prop="price">
								<up-input
									v-model.number="state.form.price"
									placeholder="请输入附加价格，0表示免费"
									type="number"
								/>
							</up-form-item> -->

					<up-form-item label="计量单位" prop="unit">
						<up-input
							v-model="state.form.unit"
							placeholder="例如：份、杯、瓶等"
						/>
					</up-form-item>

					<up-form-item label="排序 (数字越小排序越靠前)" prop="sort">
						<up-input
							v-model.number="state.form.sort"
							placeholder="请输入排序数字"
							type="number"
						/>
					</up-form-item>

					<!-- <up-form-item label="推荐酒料" prop="isRecommended">
								<up-switch
									v-model="state.form.isRecommended"
									active-color="#1989fa"
								></up-switch>
							</up-form-item> -->

					<up-form-item label="上架状态" prop="isAvailable">
						<up-switch
							v-model="state.form.isAvailable"
							active-color="#1989fa"
						></up-switch>
					</up-form-item>
				</up-form>
			</scroll-view>
		</view>
		<view class="modal-footer">
			<up-button @click="close">取消</up-button>
			<up-button type="primary" @click="save">确定</up-button>
		</view>
	</view>
	<!-- 分类选择器动作表 -->
	<up-action-sheet
		:show="state.showCategorySelector"
		:actions="props.categoryActions"
		@select="selectCategory"
		@close="state.showCategorySelector = false"
		title="选择细分类"
		cancel-text="取消"
	/>
</template>

<script setup lang="ts">
import { ref, reactive, defineEmits, defineProps, onMounted } from "vue";
import UploadFile from "@/components/upload-file/index.vue";

const props = defineProps({
	title: {
		type: String,
		default: "",
	},
	type: {
		type: String,
		default: "add",
	},
	diyTypes: {
		type: Array,
		default: () => [],
	},
	categoryActions: {
		type: Array,
		default: () => [],
	},
	diyFormData: {
		type: Object,
		default: () => {},
	},
});
// 表单引用
const formRef = ref(null);
const diyIngredientFormRef = ref();
const state = reactive({
	showCategorySelector: false,

	form: {
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
		categoryId: "",
		categoryName: "",
	} as any,
	rules: {
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
});
const emit = defineEmits(["close"]);

const resetForm = () => {
	formRef.value?.resetFields();
	setTimeout(() => {
		formRef.value?.clearValidate();
	}, 0);
};

const close = () => {
	resetForm();
	emit("close");
};

const validate = async () => {
	await formRef.value?.validate();
};

const uploadDiyIngredientImage = () => {
	uni.chooseImage({
		count: 1,
		sizeType: ["original", "compressed"],
		sourceType: ["album", "camera"],
		success: (res) => {
			state.form.image = res.tempFilePaths[0];
		},
	});
};
const showCategorySelector = () => {
	state.showCategorySelector = true;
};

const selectCategory = (category: any) => {
	state.form.categoryId = category.value;
	state.form.categoryName = category.name;
	state.showCategorySelector = false;
};

// 保存酒水
const saveDiyIngredient = async () => {
	try {
		// 表单验证
		await validate();

		const diyTypeIndex = state.diyTypes.findIndex(
			(type) => type.id === state.form.diyTypeId
		);
		if (diyTypeIndex !== -1) {
			if (props.type === "edit") {
				const ingredientIndex = state.diyTypes[
					diyTypeIndex
				].ingredients.findIndex((i) => i.id === state.form.id);
				if (ingredientIndex !== -1) {
					state.diyTypes[diyTypeIndex].ingredients[ingredientIndex] = {
						...state.form,
					};
				}
			} else {
				const newIngredient = {
					...state.form,
					id: Date.now().toString(),
				};
				state.diyTypes[diyTypeIndex].ingredients.push(newIngredient);
			}
			state.diyTypes[diyTypeIndex].ingredients.sort((a, b) => a.sort - b.sort);
		}

		close();
		uni.showToast({
			title: props.type === "edit" ? "酒料已更新" : "酒料已添加",
			icon: "success",
		});
	} catch (error) {
		console.log("表单验证失败:", error);
	}
};

onMounted(() => {
	if (props.diyFormData) {
		for (const key in state.form) {
			if (props.diyFormData[key]) {
				state.form[key] = props.diyFormData[key];
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.image-upload {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}
.category-selector {
	width: 100%;
}
</style>
