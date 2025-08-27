<template>
	<view class="z-modal-lg z-modal">
		<view class="modal-header">
			<text>{{ props.title }}</text>
			<view class="close-btn" @click="close">×</view>
		</view>
		<view class="modal-body">
			<up-form
				:model="state.tempIngredientGroup"
				ref="ingredientGroupFormRef"
				:rules="state.ingredientGroupRules"
				labelPosition="top"
				labelWidth="auto"
			>
				<up-form-item label="快速模板">
					<view style="width: 100%" @click="openTemplateSheet">
						<up-input
							v-model="state.tempIngredientGroup.name"
							readonly
							placeholder="请选择模板"
						>
							<template #suffix>
								<up-icon name="arrow-right"></up-icon>
							</template>
						</up-input>
					</view>
				</up-form-item>
				<up-form-item label="模板选项">
					<view class="options-editor">
						<view
							class="option-row"
							v-for="(opt, idx) in state.tempIngredientGroup.options"
							:key="idx"
						>
							<text class="option-label">名称</text>
							<up-input
								v-model="state.tempIngredientGroup.options[idx]"
								placeholder="请输入选项名称"
							>
								<template #suffix>
									<up-icon
										name="close"
										color="#f56c6c"
										@click="removeOption(idx)"
									/>
								</template>
							</up-input>
						</view>
						<up-button type="info" size="small" @click="addOption"
							>新增选项</up-button
						>
					</view>
				</up-form-item>
			</up-form>
		</view>
		<up-action-sheet
			:show="state.showTemplateSheet"
			:actions="state.templateActions"
			@select="onSelectTemplate"
			@close="state.showTemplateSheet = false"
			title="选择快速模板"
			cancel-text="取消"
		/>
		<view class="modal-footer">
			<up-button @click="close">取消</up-button>
			<up-button type="primary" @click="save">确定</up-button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { ref, reactive, defineEmits, defineProps } from "vue";

const props = defineProps({
	title: {
		type: String,
		default: "",
	},
	type: {
		type: String,
		default: "add",
	},
	specGroupFormData: {
		type: Object,
		default: () => {},
	},
});
// 表单引用
const ingredientGroupFormRef = ref();

const state = reactive({
	showTemplateSheet: false,
	tempIngredientGroup: {
		id: "",
		name: "",
		price: 0,
		isDefault: false,
		options: [] as string[],
	},
	templateActions: [
		{ name: "冰", value: "ice" },
		{ name: "度数", value: "degree" },
		{ name: "甜度", value: "sweet" },
		{ name: "加工方式", value: "process" },
	],
	templates: {
		ice: ["不加冰", "少冰", "正常冰"],
		degree: ["无酒精", "低度数", "正常", "高度数"],
		sweet: ["不加糖", "少糖", "正常糖"],
		process: ["不加热", "加热"],
	} as Record<string, string[]>,
	ingredientGroupRules: {
		name: {
			required: true,
			message: "请输入小料名称",
			trigger: ["blur", "change"],
		},
	},
});
const emit = defineEmits(["close", "callback"]);

const resetForm = () => {
	ingredientGroupFormRef.value?.resetFields();
	setTimeout(() => {
		ingredientGroupFormRef.value?.clearValidate();
	}, 0);
};

const close = () => {
	resetForm();
	emit("close");
};

const validate = async () => {
	await ingredientGroupFormRef.value?.validate();
};

const openTemplateSheet = () => {
	state.showTemplateSheet = true;
};

const onSelectTemplate = (action: any) => {
	const list = state.templates[action.value] || [];
	state.tempIngredientGroup.options = list.slice();
	if (!state.tempIngredientGroup.name)
		state.tempIngredientGroup.name = action.name;
	state.showTemplateSheet = false;
};

const addOption = () => state.tempIngredientGroup.options.push("");
const addOptionAfter = (idx: number) =>
	state.tempIngredientGroup.options.splice(idx + 1, 0, "");
const removeOption = (idx: number) =>
	state.tempIngredientGroup.options.splice(idx, 1);

// 保存容量组
const save = async () => {
	try {
		// 表单验证
		await validate();

		// 生成回传数据
		const payload = {
			...state.tempIngredientGroup,
			// 新增时若无 id 则生成一个
			id: state.tempIngredientGroup.id || Date.now().toString(),
		};
		console.log("payload", payload);
		// 通过事件回传给父组件处理保存逻辑
		emit("callback", {
			mode: props.type === "edit" ? "edit" : "add",
			data: payload,
		});

		close();
		uni.showToast({
			title: props.type === "edit" ? "规格组已更新" : "规格组已添加",
			icon: "success",
		});
	} catch (error) {
		console.log("表单验证失败:", error);
	}
};

onMounted(() => {
	if (props.specGroupFormData) {
		for (const key in state.tempIngredientGroup) {
			if (props.specGroupFormData[key]) {
				state.tempIngredientGroup[key] = props.specGroupFormData[key];
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.options-editor {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}
.option-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
}
.option-label {
	min-width: 80rpx;
	color: var(--text-1);
	// font-size: $up-font-sm;
}
</style>
