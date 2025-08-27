<template>
  <view class="z-modal-lg z-modal">
    <view class="modal-header">
      <text>{{ props.title }}</text>
      <view class="close-btn" @click="close">×</view>
    </view>
    <scroll-view scroll-y="true">
      <view class="modal-body">
        <view class="image-upload">
          <UploadFile v-model="state.form.image" :max-count="1"></UploadFile>
        </view>

        <up-form :model="state.form" ref="formRef" :rules="state.rules" labelPosition="top" labelWidth="auto">
          <up-form-item label="商品名称" prop="name">
            <up-input v-model="state.form.name" placeholder="请输入商品名称" />
          </up-form-item>

          <up-form-item label="所属细分类" prop="categoryId">
            <view class="category-selector" @click="showCategorySelector">
              <up-input v-model="state.form.categoryName" readonly placeholder="请选择细分类">
                <template #suffix>
                  <up-icon name="arrow-right"></up-icon>
                </template>
              </up-input>
            </view>
          </up-form-item>

          <up-form-item label="描述" prop="description">
            <up-textarea v-model="state.form.description" placeholder="请输入商品描述" />
          </up-form-item>

          <up-form-item label="容量组管理" prop="capacityGroups">
            <view class="capacity-groups-container">
              <view class="capacity-groups-header header-btn">
                <up-button type="info" shape="circle" @click="openAddCapacityGroupModal()">添加容量组</up-button>
              </view>
              <view
                class="capacity-groups-list"
                v-if="state.form.capacityGroups?.length > 0 && state.showCapacityGroups"
              >
                <drag-container :list="state.form.capacityGroups" :controlsSize="{ height: 50 }">
                  <template #default="{ item, index }">
                    <view class="capacity-group-item" @click.stop="openAddCapacityGroupModal(item, index)">
                      <view class="capacity-group-info">
                        <view class="capacity-main-info">
                          <text class="capacity-name">{{ item.name }}</text>
                          <text class="capacity-price">¥{{ item.price }}</text>
                        </view>
                        <view class="capacity-default-info">
                          <text v-if="item.isDefault" class="default-badge">默认选中</text>
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
              <view v-else class="groups-empty">
                <text class="z-tips">暂无容量组，请点击添加</text>
              </view>
            </view>
          </up-form-item>

          <up-form-item label="规格组管理" prop="specGroups">
            <view class="spec-groups-container">
              <view class="spec-groups-header header-btn">
                <up-button type="info" shape="circle" @click="openAddSpecGroupModal()">添加规格组</up-button>
              </view>
              <view class="spec-groups-list" v-if="state.form.specGroups?.length > 0">
                <view
                  class="spec-group-item"
                  v-for="(item, index) in state.form.specGroups"
                  :key="item.id || index"
                  @click.stop="openAddSpecGroupModal(item, index)"
                >
                  <view class="spec-group-info">
                    <view class="spec-main-info">
                      <text class="spec-name">{{ item.name }}</text>
                    </view>
                  </view>
                  <view class="spec-group-actions" @click.stop>
                    <up-button class="del-icon-btn" type="error" size="mini" @click.stop="deleteSpecGroup(item, index)">
                      删除
                    </up-button>
                  </view>
                </view>
              </view>

              <view v-else class="groups-empty">
                <text class="z-tips">暂无规格组，请点击添加</text>
              </view>
            </view>
          </up-form-item>

          <up-form-item label="添料组管理" prop="ingredientGroups">
            <view class="ingredient-groups-container">
              <view class="ingredient-groups-header header-btn">
                <up-button type="info" shape="circle" @click="openAddIngredientGroupModal()">添加小料</up-button>
                <view class="ingredient-groups-header-flex">
                  <view class="left-switches">
                    <view class="switch-item">
                      <text class="switch-label">是否必选</text>
                      <up-switch v-model="state.form.ingredientRequired"></up-switch>
                    </view>
                    <view class="switch-item">
                      <text class="switch-label">是否多选</text>
                      <up-switch v-model="state.form.ingredientSingle"></up-switch>
                    </view>
                  </view>
                </view>
              </view>
              <view v-if="state.form.ingredientGroups?.length > 0">
                <up-dragsort :initialList="state.form.ingredientGroups" direction="vertical">
                  <template #default="{ item, index }">
                    <view class="ingredient-group-item" @click.stop="openAddIngredientGroupModal(item, index)">
                      <view class="ingredient-group-info">
                        <view class="ingredient-main-info">
                          <text class="ingredient-name">{{ item.name }}</text>
                          <text class="ingredient-price">¥{{ item.price }}</text>
                        </view>
                        <view class="ingredient-default-info">
                          <text v-if="item.isDefault" class="default-badge">默认选中</text>
                        </view>
                      </view>
                      <view class="ingredient-group-actions" @click.stop>
                        <up-button
                          v-if="!item.isDefault"
                          type="success"
                          size="mini"
                          @click.stop="setDefaultIngredientGroup(item, index)"
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

              <view v-else class="groups-empty">
                <text class="z-tips">暂无小料，请点击添加</text>
              </view>
            </view>
          </up-form-item>

          <!-- <up-form-item label="价格 (元)" prop="price">
								<up-input
									v-model.number="state.form.price"
									placeholder="请输入价格"
									type="number"
								/>
							</up-form-item> -->

          <!-- <up-form-item label="排序 (数字越小排序越靠前)" prop="sort">
                <up-input v-model.number="state.form.sort" placeholder="请输入排序数字" type="number" />
              </up-form-item> -->

          <!-- <up-form-item label="推荐酒水" prop="isRecommended">
                <up-switch v-model="state.form.isRecommended" active-color="#1989fa"></up-switch>
              </up-form-item> -->

          <up-form-item label="上架状态" prop="isAvailable">
            <up-switch v-model="state.form.isAvailable" active-color="#1989fa"></up-switch>
          </up-form-item>

          <!-- <up-form-item label="启用点单制" prop="enableOrdering">
								<up-switch
									v-model="state.form.enableOrdering"
									active-color="#1989fa"
								></up-switch>
							</up-form-item>
							<view class="z-tip">
								<text class="tip-text"
									>开启后，顾客可以通过扫码点单选择此酒水</text
								>
							</view> -->
          <!-- <up-form-item label="单次点单上限（杯）" prop="maxOrderCount">
								<up-input
									v-model.number="state.form.maxOrderCount"
									placeholder="请输入单次点单上限"
									type="number"
								/>
							</up-form-item>
							<view class="z-tip">
								<text class="tip-text"
									>设置顾客单次点单此酒水的最大数量，0表示不限制</text
								>
							</view> -->
        </up-form>
      </view>
    </scroll-view>
    <view class="modal-footer">
      <up-button @click="close">取消</up-button>
      <up-button type="primary" @click="save">确定</up-button>
    </view>
  </view>

  <!-- 容量组管理模态框 -->
  <up-popup :show="state.showCapacityGroupModal" mode="center" @close="closeCapacityGroupModal">
    <capacityGroupContent
      v-if="state.showCapacityGroupModal"
      :title="state.isEditingCapacityGroup ? '编辑容量组' : '添加容量组'"
      :type="state.isEditingDiyIngredient ? 'edit' : 'add'"
      :capacityGroupFormData="state.capacityGroupFormData"
      @close="closeCapacityGroupModal"
      @callback="handleCapacityGroupCallback"
    />
  </up-popup>

  <!-- 规格组管理模态框 -->
  <up-popup :show="state.showSpecGroupModal" mode="center" @close="closeSpecGroupModal">
    <specGroupContent
      v-if="state.showSpecGroupModal"
      :title="state.isEditingSpecGroup ? '编辑规格组' : '添加规格组'"
      :type="state.isEditingSpecGroup ? 'edit' : 'add'"
      :specGroupFormData="state.specGroupFormData"
      @close="closeSpecGroupModal"
      @callback="handleSpecGroupCallback"
    />
  </up-popup>

  <!-- 添料组管理模态框 -->
  <up-popup :show="state.showIngredientGroupModal" mode="center" @close="closeIngredientGroupModal">
    <ingredientGroupContent
      v-if="state.showIngredientGroupModal"
      :title="state.isEditingIngredientGroup ? '编辑小料' : '添加小料'"
      :type="state.isEditingIngredientGroup ? 'edit' : 'add'"
      :ingredientGroupFormData="state.ingredientGroupFormData"
      @close="closeIngredientGroupModal"
      @callback="handleIngredientGroupCallback"
    />
  </up-popup>

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
import { ref, reactive, defineEmits, defineProps, onMounted } from 'vue';
import UploadFile from '@/components/upload-file/index.vue';
import DragContainer from '@/components/drag/index.vue';
import capacityGroupContent from './capacityGroupContent.vue';
import ingredientGroupContent from './ingredientGroupContent.vue';
import specGroupContent from './specGroupContent.vue';

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
  productFormData: {
    type: Object,
    default: () => {},
  },
  categories: {
    type: Array,
    default: () => [],
  },
  categoryActions: {
    type: Array,
    default: () => [],
  },
});
// 表单引用
const formRef = ref(null);

const state = reactive({
  showIngredientGroupModal: false,
  isEditingIngredientGroup: false,
  showCapacityGroups: true,
  showCategorySelector: false,
  showCapacityGroupModal: false,
  isEditingCapacityGroup: false,
  isEditingSpecGroup: false,
  showSpecGroupModal: false,
  specGroupFormData: {} as any,
  form: {
    id: '',
    name: '',
    image: '',
    description: '',
    price: 0,
    originalPrice: 0,
    sort: 0,
    isRecommended: false,
    isAvailable: true,
    enableOrdering: true,
    categoryId: '',
    categoryName: '',
    maxOrderCount: 0,
    ingredientRequired: false,
    ingredientSingle: false,
    specGroups: [] as any[], // 新增规格组列表
    capacityGroups: [] as any[], // 新增容量组列表
    ingredientGroups: [] as any[], // 新增小料组列表
  } as any,
  rules: {
    name: {
      required: true,
      message: '请输入商品名称',
      trigger: ['blur', 'change'],
    },
    price: {
      required: true,
      message: '请输入价格',
      trigger: ['blur', 'change'],
      validator: (rule, value, callback) => {
        if (value <= 0) {
          callback(new Error('价格必须大于0'));
        } else {
          callback();
        }
      },
    },
    sort: {
      required: true,
      message: '请输入排序数字',
      trigger: ['blur', 'change'],
    },
    categoryGroups: {
      required: true,
      message: '请选择容量组',
      trigger: ['blur', 'change'],
    },
    specGroups: {
      required: true,
      message: '请选择规格组',
      trigger: ['blur', 'change'],
    },
  },
  capacityGroupFormData: {} as any,
  ingredientGroupFormData: {} as any,
});
const emit = defineEmits(['close']);

const resetForm = () => {
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

const getSelectedCategoryName = () => {
  const selectedCategory = props.categories.find(cat => cat.type === state.form.categoryId);
  return selectedCategory ? selectedCategory.title : '';
};

const closeCapacityGroupModal = () => {
  state.showCapacityGroupModal = false;
  state.isEditingCapacityGroup = false;
};

const showCategorySelector = () => {
  state.showCategorySelector = true;
};

const selectCategory = (category: any) => {
  state.form.categoryId = category.value;
  state.form.categoryName = category.name;
  state.showCategorySelector = false;
};

const deleteCapacityGroup = (item, index: number) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除容量组"${item.name}"吗？`,
    success: res => {
      if (res.confirm) {
        state.form.capacityGroups.splice(index, 1);
        uni.showToast({
          title: '删除成功',
          icon: 'success',
        });
      }
    },
  });
};

const setDefaultCapacityGroup = (item, index: number) => {
  state.form.capacityGroups.forEach(group => {
    group.isDefault = false;
  });
  state.form.capacityGroups[index].isDefault = true;
  uni.showToast({
    title: '已设为默认容量组',
    icon: 'success',
  });
};

const handleCapacityGroupCallback = ({ mode, data }) => {
  if (state.form.capacityGroups.length === 0) {
    data.isDefault = true;
  }
  state.showCapacityGroups = false;
  setTimeout(() => {
    state.showCapacityGroups = true;
  }, 0);
  if (mode === 'edit') {
    const i = state.form.capacityGroups.findIndex(g => g.id === data.id);
    if (i !== -1) state.form.capacityGroups[i] = data;
    else state.form.capacityGroups.push(data);
  } else {
    state.form.capacityGroups.push(data);
  }
};

// 容量组管理相关函数
const openAddCapacityGroupModal = (item, index) => {
  if (item) {
    state.capacityGroupFormData = {
      ...item,
    };
  }
  state.showCapacityGroupModal = true;
};

// 添料组管理相关函数
const openAddIngredientGroupModal = (item, index) => {
  if (item) {
    state.isEditingIngredientGroup = true;
    state.ingredientGroupFormData = {
      ...item,
    };
  }
  state.showIngredientGroupModal = true;
};
const handleIngredientGroupCallback = ({ mode, data }) => {
  if (state.form.ingredientGroups.length === 0) {
    data.isDefault = true;
  }
  if (mode === 'edit') {
    const i = state.form.ingredientGroups.findIndex(g => g.id === data.id);
    if (i !== -1) state.form.ingredientGroups[i] = data;
    else state.form.ingredientGroups.push(data);
  } else {
    state.form.ingredientGroups.push(data);
  }
};
const closeIngredientGroupModal = () => {
  state.showIngredientGroupModal = false;
  state.isEditingIngredientGroup = false;
};

const deleteIngredientGroup = (item, index: number) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除小料"${item.name}"吗？`,
    success: res => {
      if (res.confirm) {
        state.form.ingredientGroups.splice(index, 1);
        uni.showToast({
          title: '删除成功',
          icon: 'success',
        });
      }
    },
  });
};

const setDefaultIngredientGroup = (item, index: number) => {
  state.form.ingredientGroups.forEach(group => {
    group.isDefault = false;
  });
  state.form.ingredientGroups[index].isDefault = true;
  uni.showToast({
    title: '已设为默认小料',
    icon: 'success',
  });
};

const deleteSpecGroup = (item, index: number) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除规格组"${item.name}"吗？`,
    success: res => {
      if (res.confirm) {
        state.form.specGroups.splice(index, 1);
        uni.showToast({
          title: '删除成功',
          icon: 'success',
        });
      }
    },
  });
};

const setDefaultSpecGroup = (item, index: number) => {
  state.form.specGroups.forEach(group => {
    group.isDefault = false;
  });
  state.form.specGroups[index].isDefault = true;
  uni.showToast({
    title: '已设为默认规格组',
    icon: 'success',
  });
};

const openAddSpecGroupModal = (item?, index?) => {
  if (item) {
    state.isEditingSpecGroup = true;
    state.specGroupFormData = { ...item };
  }
  state.showSpecGroupModal = true;
};

const closeSpecGroupModal = () => {
  state.showSpecGroupModal = false;
  state.isEditingSpecGroup = false;
};

const handleSpecGroupCallback = ({ mode, data }) => {
  if (state.form.specGroups.length === 0) {
    data.isDefault = true;
  }
  if (mode === 'edit') {
    const i = state.form.specGroups.findIndex(g => g.id === data.id);
    if (i !== -1) state.form.specGroups[i] = data;
    else state.form.specGroups.push(data);
  } else {
    state.form.specGroups.push(data);
  }
};

// 保存酒水
const save = async () => {
  try {
    // 表单验证
    await validate();

    console.log('state.form', state.form);

    close();
    uni.showToast({
      title: props.type === 'edit' ? '酒水已更新' : '酒水已添加',
      icon: 'success',
    });
  } catch (error) {
    console.log('表单验证失败:', error);
  }
};
onMounted(() => {
  if (props.productFormData) {
    for (const key in state.form) {
      if (props.productFormData[key]) {
        state.form[key] = props.productFormData[key];
      }
    }
  }
});

defineOptions({
  options: {
    styleIsolation: 'shared',
  },
});
</script>

<style lang="scss" scoped>
.del-icon-btn {
  border-radius: 50%;
  overflow: hidden;
  .u-button {
    background-color: var(--error-6);
    color: #fff;
  }
}

.image-upload {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.groups-empty {
  width: 100%;
  text-align: center;
  padding: 40rpx 20rpx;
  background-color: #f8f9fa;
  border-radius: 8rpx;
  display: none;
}
/* 容量组管理样式 */

.category-selector {
  width: 100%;
}

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
  color: var(--text-1);
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
  color: var(--text-1);
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

/* 规格组管理样式 */
.spec-groups-container {
  width: 100%;
}

.spec-groups-number-input {
  flex: 1;
}

.spec-groups-unit-select {
  width: 160rpx;
}

.spec-groups-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 180rpx;
}

.spec-groups-title {
  font-size: 28rpx;
  color: var(--text-1);
  font-weight: 500;
}

.spec-group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 8rpx;
  box-sizing: border-box;
}

.spec-group-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.spec-main-info {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.spec-name {
  //   font-size: $;
  color: var(--text-2);
  font-weight: 500;
}

.spec-default-info {
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

.spec-group-actions {
  display: flex;
  gap: 16rpx;
}

/* 添料组管理样式 */
.ingredient-groups-container {
  width: 100%;
}

.ingredient-groups-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 10rpx;
  :deep(.u-button) {
    width: 160rpx;
    margin: 0;
    // order: 2; /* 按钮在右侧 */
  }
}

.ingredient-groups-header-flex {
  display: flex;
  align-items: center;
  gap: 24rpx;
  order: 1; /* 开关区域在左侧 */
}

.left-switches {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.switch-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.switch-label {
  color: var(--text-1);
  font-size: $up-font-sm;
}

.ingredient-groups-title {
  font-size: 28rpx;
  color: var(--text-1);
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
  color: var(--text-1);
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

.ingredient-group-switches {
  display: flex;
  gap: 20rpx;
  align-items: center;
}

.switch-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.switch-item text {
  font-size: $up-font-sm;
  color: var(--text-1);
}
</style>
