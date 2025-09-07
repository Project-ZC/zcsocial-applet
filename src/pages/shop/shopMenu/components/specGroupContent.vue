<template>
  <view class="z-modal-lg z-modal">
    <view class="modal-header">
      <text class="modal-title">{{ props.title }}</text>
      <view class="close-btn" @click="close">×</view>
    </view>
    <scroll-view scroll-y>
      <view class="modal-body">
        <up-form :model="state.form" ref="formRef" labelPosition="top" labelWidth="auto">
          <up-form-item label="快速模板">
            <view style="width: 100%" @click="openTemplateSheet">
              <up-input v-model="state.form.name" readonly placeholder="选择模板常用模板（可选）">
                <template #suffix>
                  <up-icon name="arrow-right"></up-icon>
                </template>
              </up-input>
            </view>
          </up-form-item>
          <up-form-item label="模板选项">
            <view class="options-editor">
              <view class="option-row" v-for="(opt, idx) in state.form.values" :key="idx">
                <text class="option-label">名称</text>
                <up-input v-model="state.form.values[idx].value" placeholder="请输入选项名称">
                  <template #suffix>
                    <up-icon name="close" color="#f56c6c" @click="removeOption(idx)" />
                  </template>
                </up-input>
              </view>
              <up-button type="info" shape="circle" @click="addOption">
                <up-icon name="plus" size="16"></up-icon>
                <text class="add-text">添加选项</text>
              </up-button>
            </view>
          </up-form-item>
        </up-form>
      </view>
    </scroll-view>
    <view class="modal-footer">
      <up-button @click="close">取消</up-button>
      <up-button type="primary" @click="save">确定</up-button>
    </view>
  </view>
  <up-action-sheet
    :show="state.showTemplateSheet"
    :actions="state.templateActions"
    @select="onSelectTemplate"
    @close="state.showTemplateSheet = false"
    title="选择快速模板"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { ref, reactive, defineEmits, defineProps } from 'vue';
import {
  formatValuesToOptions,
  formatOptionsToValues,
  addOptionToArray,
  removeOptionFromArray,
} from '@/utils/format-utils';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'add',
  },
  specGroupFormData: {
    type: Object,
    default: () => {},
  },
});
// 表单引用
const formRef = ref();

const state = reactive({
  showTemplateSheet: false,
  form: {
    id: '',
    name: '',
    key: '',
    values: [] as Array<{ value: string }>,
  },
  templateActions: [
    { name: '冰', value1: 'ice', value: '冰' },
    { name: '度数', value1: 'degree', value: '度数' },
    { name: '甜度', value1: 'sweet', value: '甜度' },
    { name: '加工方式', value1: 'process', value: '加工方式' },
  ] as any,
  templates: {
    ice: ['不加冰', '少冰', '正常冰'],
    degree: ['无酒精', '低度数', '正常', '高度数'],
    sweet: ['不加糖', '少糖', '正常糖'],
    process: ['不加热', '加热'],
  } as Record<string, string[]>,
});
const emit = defineEmits(['close', 'callback']);

const resetForm = () => {
  state.form.values = [];
  state.form.name = '';
  state.form.key = '';
  state.form.id = '';
  console.log(111);
  formRef.value?.resetFields();
  setTimeout(() => {
    formRef.value?.clearValidate();
  }, 0);
};

const close = () => {
  resetForm();
  emit('close');
};

const validate = async () => {
  await formRef.value?.validate();
};

const openTemplateSheet = () => {
  state.showTemplateSheet = true;
};

const onSelectTemplate = (action: any) => {
  const list = state.templates[action.value1] || [];
  state.form.values = formatValuesToOptions(list);
  state.form.name = action.name;
  state.showTemplateSheet = false;
  state.form.key = action.value;
};

const addOption = () => addOptionToArray(state.form.values, '');
const removeOption = (idx: number) => removeOptionFromArray(state.form.values, idx);

// 保存容量组
const save = async () => {
  try {
    // 表单验证
    await validate();

    // 生成回传数据
    const payload = {
      options: state.form.values,
      // 新增时若无 id 则生成一个
      // id: state.form.id || Date.now().toString(),
      key: state.form.key || '自定义-' + Date.now().toString(),
    };
    if (state.form.id) {
      payload.id = state.form.id;
    }
    console.log('payload', payload);
    // 通过事件回传给父组件处理保存逻辑
    emit('callback', {
      mode: props.type === 'edit' ? 'edit' : 'add',
      data: payload,
    });

    close();
    uni.showToast({
      title: props.type === 'edit' ? '规格组已更新' : '规格组已添加',
      icon: 'success',
    });
  } catch (error) {
    console.log('表单验证失败:', error);
  }
};

onMounted(() => {
  state.templateActions.forEach(item => {
    item.title = item.name;
    item.name += '(' + state.templates[item.value1].join('、') + ')';
  });
  if (props.specGroupFormData) {
    // 处理编辑时的数据格式
    if (props.type === 'edit') {
      state.form.key = props.specGroupFormData.key;
      const options = formatOptionsToValues(props.specGroupFormData.options);
      state.form.values = formatValuesToOptions(options);
      const a = state.templateActions.find(item => item.value === props.specGroupFormData.key);
      state.form.name = a?.name || '';
    }
  }
});
</script>

<style lang="scss" scoped>
.options-editor {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  width: 100%;
}
.option-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.option-label {
  text-align: right;
  min-width: 60rpx;
  color: var(--text-1);
  // font-size: $up-font-sm;
}
.add-text {
  margin-left: 10rpx;
}
</style>
