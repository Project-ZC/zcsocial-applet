<template>
	<view class="z-modal-lg z-modal">
		<view class="modal-header">
			<text>{{ props.title }}</text>
			<view class="close-btn" @click="close">×</view>
		</view>
		<view class="modal-body">
			<up-form
				:model="state.tempCapacityGroup"
				ref="capacityGroupFormRef"
				:rules="state.capacityGroupRules"
				labelPosition="top"
				labelWidth="auto"
			>
				<up-form-item label="容量名称" prop="size">
					<up-input
						v-model="state.tempCapacityGroup.size"
						placeholder="请输入容量数字"
						type="digit"
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
						v-model="state.tempCapacityGroup.price"
						placeholder="请输入价格"
						type="digit"
					/>
				</up-form-item>
			</up-form>
		</view>
		<view class="modal-footer">
			<up-button @click="close">取消</up-button>
			<up-button type="primary" @click="save">确定</up-button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
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
	capacityGroupFormData: {
		type: Object,
		default: () => {},
	},
});
// 表单引用
const capacityGroupFormRef = ref(null);
const state = reactive({
	tempCapacityGroup: {
		id: "", // 容量id
		size: "", // 新增：容量数字
		price: "", // 价格
		unit: "ml", // 新增：容量单位
		// name: "", // 容量名称
		isDefault: false, // 新增：是否为默认选中
	},
	// 容量单位选项
	capacityUnitOptions: [
		{ name: "毫升 (ml)", id: "ml" },
		{ name: "升 (L)", id: "L" },
		{ name: "克 (g)", id: "g" },
	],
	capacityGroupRules: {
		size: {
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
});
const emit = defineEmits(["close", "callback"]);

const resetForm = () => {
	capacityGroupFormRef.value?.resetFields();
	setTimeout(() => {
		capacityGroupFormRef.value?.clearValidate();
	}, 0);
	state.tempCapacityGroup.unit = "ml";
};

const close = () => {
	resetForm();
	emit("close");
};

const validate = async () => {
	await capacityGroupFormRef.value?.validate();
};

// 保存容量组
const save = async () => {
	try {
		// 表单验证
		await validate();

		// 组合容量名称：数字 + 单位
		// const capacityName = `${state.tempCapacityGroup.size}${state.tempCapacityGroup.unit}`;

		// 生成回传数据
		const payload = {
			...state.tempCapacityGroup,
			// name: capacityName,
			// 新增时若无 id 则生成一个
			// id: state.tempCapacityGroup.id || Date.now().toString(),
		};

		console.log("payload", payload);

		// 通过事件回传给父组件处理保存逻辑
		emit("callback", {
			mode: props.type,
			data: payload,
		});

		close();
		uni.showToast({
			title: props.type === "edit" ? "容量组已更新" : "容量组已添加",
			icon: "success",
		});
	} catch (error) {
		console.log("表单验证失败:", error);
	}
};

onMounted(() => {
	state.tempCapacityGroup.unit = "ml";
	if (props.capacityGroupFormData && props.type === "edit") {
		for (const key in state.tempCapacityGroup) {
			if (props.capacityGroupFormData[key]) {
				state.tempCapacityGroup[key] = props.capacityGroupFormData[key];
			}
		}
	}
});
onUnmounted(() => {
	resetForm();
});
</script>
