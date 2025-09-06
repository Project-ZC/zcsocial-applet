<template>
  <view class="z-modal-lg z-modal">
    <view class="modal-header">
      <text class="modal-title">{{ props.title }}</text>
      <view class="close-btn" @click="close">×</view>
    </view>
    <view class="modal-body">
      <up-form :model="state.form" ref="formRef" :rules="state.categoryRules" labelPosition="top" labelWidth="auto">
        <up-form-item label="细分类名称" prop="name">
          <up-input v-model="state.form.name" placeholder="请输入细分类名称" />
        </up-form-item>
        <up-form-item label="排序 (数字越小排序越靠前)" prop="sort">
          <up-input v-model="state.form.sort" placeholder="请输入排序数字" type="number" />
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
import { onMounted, onUnmounted, nextTick } from 'vue';
import { ref, reactive, defineEmits, defineProps } from 'vue';
import { createProductCatalog, modifyProductCatalog, deleteProductCatalog } from '@/api/product';
import { watch } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'add',
  },
  tabs: {
    type: Array,
    default: () => [],
  },
  activeTab: {
    type: String,
    default: '',
  },
  categoryFormData: {
    type: Object,
    default: () => {},
  },
  shopId: {
    type: String,
    default: '',
  },
});
// 表单引用
const formRef = ref(null);
const state = reactive({
  form: {
    id: '',
    name: '',
    sort: '',
  },
  // 表单验证规则
  categoryRules: {
    name: {
      required: true,
      message: '请输入分类名称',
      trigger: ['blur', 'change'],
    },
    sort: {
      validator: (rule, value, callback) => {
        if (!value || value === '') {
          callback(new Error('请输入排序数字'));
        } else {
          callback();
        }
      },
      trigger: ['blur', 'change'],
    },
  },
});
const emit = defineEmits(['close', 'callback']);

const resetForm = () => {
  formRef.value?.resetFields();
  setTimeout(() => {
    formRef.value?.clearValidate();
  }, 100);
};

const close = () => {
  resetForm();
  emit('close');
};

const validate = async () => {
  await formRef.value?.validate();
};

// 保存细分
const save = async () => {
  try {
    // 表单验证
    await validate();
    // 当前主类
    // const currentMain =
    // 	activeTab === ""
    // 		? tabs[activeTab]?.type
    // 		: (tabs[activeTab] as any)?.parentMain;
    // if (props.type === "edit") {
    // 	const idx = props.tabs.findIndex(
    // 		(tab: any) => tab.type === state.form.shopId
    // 	);
    // 	if (idx !== -1) {
    // 		props.tabs[idx] = {
    // 			...props.tabs[idx],
    // 			title: state.form.name,
    // 			sort: state.form.sort,
    // 		};
    // 	}
    // } else {
    // 	const newType = `cat_${Date.now()}`;
    // 	const newCategoryTab: any = {
    // 		title: state.form.name,
    // 		badge: "",
    // 		type: newType,
    // 		sort: state.form.sort || 0,
    // 		parentMain: currentMain,
    // 	};
    // 	props.tabs.push(newCategoryTab);
    // }
    if (props.type === 'edit') {
      await modifyProductCatalog({ ...state.form, shopId: props.shopId });
    } else {
      await createProductCatalog({ ...state.form, shopId: props.shopId });
    }
    close();
    uni.showToast({
      title: props.type === 'edit' ? '细分类已更新' : '细分类已添加',
      icon: 'success',
    });
    emit('callback');
  } catch (error) {}
};

const dispose = () => {
  resetForm();
};

watch(
  () => props.categoryFormData,
  newVal => {
    if (props.categoryFormData) {
      for (const key in state.form) {
        if (props.categoryFormData[key]) {
          state.form[key] = props.categoryFormData[key];
        }
      }
      if (props.type === 'edit') {
        state.form.id = props.categoryFormData.id;
      }
    }
  },
  { immediate: true, deep: true }
);

onMounted(() => {});
</script>
