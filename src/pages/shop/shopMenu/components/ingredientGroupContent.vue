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
				<up-form-item label="小料名称" prop="name">
					<up-input
						v-model="state.tempIngredientGroup.name"
						placeholder="如：珍珠/椰果/桂花"
					/>
				</up-form-item>
				<up-form-item label="小料金额 (每项)" prop="price">
					<up-input
						v-model.number="state.tempIngredientGroup.price"
						placeholder="请输入小料金额"
						type="number"
					/>
				</up-form-item>
				<!-- <up-form-item label="是否默认" prop="isDefault">
              <up-switch v-model="state.tempIngredientGroup.isDefault" active-color="#1989fa"></up-switch>
            </up-form-item> -->
			</up-form>
		</view>
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
	ingredientGroupFormData: {
		type: Object,
		default: () => {},
	},
});
// 表单引用
const ingredientGroupFormRef = ref();

const state = reactive({
	tempIngredientGroup: {
		id: "",
		name: "",
		price: "",
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
const emit = defineEmits(["close", "callback"]);

const resetForm = () => {
	ingredientGroupFormRef.value?.resetFields();
	setTimeout(() => {
		ingredientGroupFormRef.value?.clearValidate();
	}, 100);
};

const close = () => {
	resetForm();
	emit("close");
};

const validate = async () => {
	await ingredientGroupFormRef.value?.validate();
};

// 保存容量组
const save = async () => {
	try {
		// 表单验证
		await validate();

		// 生成回传数据
		const payload = {
			...state.tempIngredientGroup,
			// 新增时若无 id 则生成一个
			// id: state.tempIngredientGroup.id || Date.now().toString(),
		};
		// 通过事件回传给父组件处理保存逻辑
		emit("callback", {
			mode: props.type === "edit" ? "edit" : "add",
			data: payload,
		});

		close();
		uni.showToast({
			title: props.type === "edit" ? "小料已更新" : "小料已添加",
			icon: "success",
		});
	} catch (error) {
		console.log("表单验证失败:", error);
	}
};

onMounted(() => {
	if (props.ingredientGroupFormData) {
		for (const key in state.tempIngredientGroup) {
			if (props.ingredientGroupFormData[key]) {
				state.tempIngredientGroup[key] = props.ingredientGroupFormData[key];
			}
		}
	}
});
</script>
