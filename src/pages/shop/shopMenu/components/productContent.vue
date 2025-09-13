<template>
  <view class="z-modal-lg z-modal">
    <view class="modal-header">
      <text class="modal-title">{{ props.title }}</text>
      <view class="close-btn" @click="close">×</view>
    </view>
    <scroll-view scroll-y="true">
      <view class="modal-body">
        <view class="image-upload">
          <UploadFile
            v-model:fileList="state.photoFileList"
            :max-count="1"
            @afterUpload="photoAfterUpload"
          ></UploadFile>
        </view>

        <up-form :model="state.form" ref="formRef" :rules="state.rules" labelPosition="top" labelWidth="auto">
          <up-form-item label="商品名称" prop="name">
            <up-input v-model="state.form.name" placeholder="请输入商品名称" />
          </up-form-item>

          <up-form-item label="所属细分类" prop="catalogId">
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

          <up-form-item label="容量组管理" prop="productSkus">
            <view class="capacity-groups-container">
              <view class="capacity-groups-header header-btn">
                <up-button type="info" shape="circle" @click="openAddCapacityGroupModal()">添加容量组</up-button>
              </view>
              <view class="capacity-groups-list" v-if="state.form.productSkus?.length > 0 && state.showCapacityGroups">
                <drag-container
                  :list="state.form.productSkus"
                  :height="32"
                  @sort-change="handleCapacityGroupSortChange"
                >
                  <template #default="{ moveItem, moveIndex }">
                    <view class="capacity-group-item" @click.stop="openAddCapacityGroupModal(moveItem, moveIndex)">
                      <view class="capacity-group-info">
                        <view class="capacity-main-info">
                          <text class="capacity-name">{{ moveItem.size + moveItem.unit }}</text>
                          <text class="capacity-price">¥{{ moveItem.price }}</text>
                        </view>
                        <view class="capacity-default-info">
                          <text v-if="moveItem.isDefault" class="default-badge">默认选中</text>
                        </view>
                      </view>
                      <view class="capacity-group-actions" @click.stop>
                        <!-- <up-button
                          v-if="!moveItem.isDefault"
                          type="success"
                          size="mini"
                          @click.stop="setDefaultCapacityGroup(moveItem, index)"
                        >
                          设为默认
                        </up-button> -->
                        <up-button
                          class="del-icon-btn"
                          type="error"
                          size="mini"
                          @click.stop="deleteCapacityGroup(moveItem, index)"
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

          <up-form-item label="规格组管理" prop="productOptions">
            <view class="spec-groups-container">
              <view class="spec-groups-header header-btn">
                <up-button type="info" shape="circle" @click="openAddSpecGroupModal()">添加规格组</up-button>
              </view>
              <drag-container
                :list="state.form.productOptions"
                :height="32"
                class="spec-groups-list"
                v-if="state.form.productOptions?.length > 0 && state.showSpecGroup"
              >
                <template #default="{ moveItem, moveIndex }">
                  <view class="spec-group-item" @click.stop="openAddSpecGroupModal(moveItem, moveIndex)">
                    <view class="spec-group-info">
                      <view class="spec-main-info">
                        <text class="spec-name">
                          {{ moveItem.key }}({{ getDisplayValues(moveItem.options || []).join('、') }})
                        </text>
                      </view>
                    </view>
                    <view class="spec-group-actions" @click.stop>
                      <up-button
                        class="del-icon-btn"
                        type="error"
                        size="mini"
                        @click.stop="deleteSpecGroup(moveItem, index)"
                      >
                        删除
                      </up-button>
                    </view>
                  </view>
                </template>
              </drag-container>

              <view v-else class="groups-empty">
                <text class="z-tips">暂无规格组，请点击添加</text>
              </view>
            </view>
          </up-form-item>

          <up-form-item label="添料组管理" prop="productIngredients">
            <view class="ingredient-groups-container">
              <view class="ingredient-groups-header header-btn">
                <up-button type="info" shape="circle" @click="openAddIngredientGroupModal()">添加小料</up-button>
                <view class="ingredient-groups-header-flex">
                  <view class="left-switches">
                    <view class="switch-item">
                      <text class="switch-label">是否必选</text>
                      <up-switch
                        v-model="state.form.productIngredientConfig.required"
                        activeValue="0"
                        inactiveValue="1"
                      ></up-switch>
                    </view>
                    <view class="switch-item">
                      <text class="switch-label">是否多选</text>
                      <up-switch
                        v-model="state.form.productIngredientConfig.type"
                        activeValue="multi"
                        inactiveValue="single"
                      ></up-switch>
                    </view>
                  </view>
                </view>
              </view>
              <view v-if="state.form.productIngredients?.length > 0 && state.showIngredientGroups">
                <drag-container :list="state.form.productIngredients" :height="32">
                  <template #default="{ moveItem, moveIndex }">
                    <view class="ingredient-group-item" @click.stop="openAddIngredientGroupModal(moveItem, moveIndex)">
                      <view class="ingredient-group-info">
                        <view class="ingredient-main-info">
                          <text class="ingredient-name">{{ moveItem.name }}</text>
                          <text class="ingredient-price">¥{{ moveItem.price }}</text>
                        </view>
                        <view class="ingredient-default-info">
                          <text v-if="moveItem.isDefault" class="default-badge">默认选中</text>
                        </view>
                      </view>
                      <view class="ingredient-group-actions" @click.stop>
                        <!-- <up-button
                          v-if="!moveItem.isDefault"
                          type="success"
                          size="mini"
                          @click.stop="setDefaultIngredientGroup(moveItem, moveIndex)"
                        >
                          设为默认
                        </up-button> -->
                        <up-button
                          class="del-icon-btn"
                          type="error"
                          size="mini"
                          @click.stop="deleteIngredientGroup(moveItem, moveIndex)"
                        >
                          删除
                        </up-button>
                      </view>
                    </view>
                  </template>
                </drag-container>
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
									type="digit"
								/>
							</up-form-item> -->

          <!-- <up-form-item label="排序 (数字越小排序越靠前)" prop="sort">
                <up-input v-model.number="state.form.sort" placeholder="请输入排序数字" type="number" />
              </up-form-item> -->

          <!-- <up-form-item label="推荐酒水" prop="isRecommended">
                <up-switch v-model="state.form.isRecommended" active-color="#1989fa"></up-switch>
              </up-form-item> -->

          <up-form-item label="上架状态" prop="stage">
            <up-switch v-model="state.form.stage" activeValue="up" inactiveValue="down"></up-switch>
          </up-form-item>

          <up-form-item label="是否为群酒(该商品属性为本桌一起畅饮的酒)" prop="tableFlag">
            <up-switch v-model="state.form.tableFlag" activeValue="0" inactiveValue="1"></up-switch>
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
      :type="state.isEditingCapacityGroup ? 'edit' : 'add'"
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
  />
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash-es';
import { ref, reactive, defineEmits, defineProps, onMounted, onUnmounted, nextTick, watch } from 'vue';
import UploadFile from '@/components/upload-file/index.vue';
import DragContainer from '@/components/drag/index.vue';
import capacityGroupContent from './capacityGroupContent.vue';
import ingredientGroupContent from './ingredientGroupContent.vue';
import specGroupContent from './specGroupContent.vue';
import { createProduct, modifyProduct } from '@/api/product';
import { getDisplayValues, formatValuesToOptions } from '@/utils/format-utils';

// 简单深拷贝：用于保存与还原快照（对象内仅包含基本类型/数组/对象）

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
  shopId: {
    type: String,
    default: '',
  },
});
// 表单引用
const formRef = ref(null);

const state = reactive({
  photoFileList: [],
  showIngredientGroupModal: false,
  isEditingIngredientGroup: false,
  showCapacityGroups: true,
  showIngredientGroups: true,
  showSpecGroup: true,
  showCategorySelector: false,
  showCapacityGroupModal: false,
  isEditingCapacityGroup: false,
  isEditingSpecGroup: false,
  showSpecGroupModal: false,
  // 原始快照：用于取消时还原
  originalFormSnapshot: null as any,
  form: {
    id: '',
    name: '',
    photo: '',
    description: '',
    // price: 0,
    // sort: 0,
    // isRecommended: false,
    // enableOrdering: true,
    // maxOrderCount: 0,
    stage: 'up', // down: 下架, up: 上架
    catalogId: '',
    categoryName: '',
    productIngredientConfig: {
      id: '',
      type: 'single', // single: 单选, multi: 多选
      required: '1', // 0: 必选, 1: 可选
    },
    tableFlag: '1', // 0: 是群酒, 1: 否
    productSkus: [] as any[], // 新增容量组列表
    productOptions: [] as any[], // 新增规格组列表
    productIngredients: [] as any[], // 新增小料组列表
  } as any,
  rules: {
    name: {
      required: true,
      message: '请输入商品名称',
      trigger: ['blur', 'change'],
    },
    // price: {
    // 	required: true,
    // 	message: "请输入价格",
    // 	trigger: ["blur", "change"],
    // 	validator: (rule, value, callback) => {
    // 		if (value <= 0) {
    // 			callback(new Error("价格必须大于0"));
    // 		} else {
    // 			callback();
    // 		}
    // 	},
    // },
    // sort: {
    // 	required: true,
    // 	message: "请输入排序数字",
    // 	trigger: ["blur", "change"],
    // },
    productSkus: {
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请添加容量组'));
        } else {
          callback();
        }
      },
      trigger: ['blur', 'change'],
    },
    // productOptions: {
    // 	validator: (rule, value, callback) => {
    // 		if (!value || value.length === 0) {
    // 			callback(new Error("请添加规格组"));
    // 		} else {
    // 			callback();
    // 		}
    // 	},
    // 	trigger: ["blur", "change"],
    // },
  },
  capacityGroupFormData: {} as any,
  specGroupFormData: {} as any,
  ingredientGroupFormData: {} as any,
});

const emit = defineEmits(['close', 'callback']);

const resetForm = () => {
  //   if (state.originalFormSnapshot) {
  //     for (const key in state.form) {
  //       state.form[key] = state.originalFormSnapshot[key];
  //     }
  //     state.originalFormSnapshot = null;
  //   }
  formRef.value?.resetFields();
  state.photoFileList = [];
  state.form.photo = '';
  state.form.productOptions = [];
  state.form.productSkus = [];
  state.form.productIngredients = [];
  state.form.productIngredientConfig = {
    type: 'single',
    required: '1',
  };

  setTimeout(() => {
    formRef.value?.clearValidate();
  }, 100);
};

const close = () => {
  resetForm();
  emit('close');
};

const photoAfterUpload = (fileList: any[]) => {
  state.form.photo = fileList[0].url;
};

const validate = async () => {
  await formRef.value?.validate();
};

const getSelectedCategoryName = () => {
  const categories = (props.categories || []) as any[];
  const selectedCategory = categories.find((cat: any) => cat.id === state.form.catalogId);
  return selectedCategory ? selectedCategory.name : '';
};

const closeCapacityGroupModal = () => {
  state.showCapacityGroupModal = false;
  state.isEditingCapacityGroup = false;
};

const showCategorySelector = () => {
  state.showCategorySelector = true;
};

const selectCategory = (category: any) => {
  state.form.catalogId = category.value;
  state.form.categoryName = category.name;
  state.showCategorySelector = false;
};

const deleteCapacityGroup = (item, index: number) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除容量组"${item.size + item.unit}"吗？`,
    success: res => {
      if (res.confirm) {
        state.form.productSkus.splice(index, 1);
        uni.showToast({
          title: '删除成功',
          icon: 'success',
        });
      }
    },
  });
};

const setDefaultCapacityGroup = (item, index: number) => {
  state.form.productSkus.forEach(group => {
    group.isDefault = false;
  });
  state.form.productSkus[index].isDefault = true;
  uni.showToast({
    title: '已设为默认容量组',
    icon: 'success',
  });
};

const handleCapacityGroupCallback = ({ mode, data }) => {
  if (state.form.productSkus.length === 0) {
    data.isDefault = true;
  }
  state.showCapacityGroups = false;
  setTimeout(() => {
    state.showCapacityGroups = true;
  }, 0);
  if (mode === 'edit') {
    const i = state.form.productSkus.findIndex(g => g.id === data.id);
    if (i !== -1) state.form.productSkus[i] = data;
    else state.form.productSkus.push(data);
  } else {
    state.form.productSkus.push(data);
  }
};

const handleCapacityGroupSortChange = (newList, oldIndex, newIndex) => {
  state.form.productSkus = newList;
  for (let i = 0; i < state.form.productSkus.length; i++) {
    state.form.productSkus[i].isDefault = false;
  }
  state.form.productSkus[0].isDefault = true;
};

// 容量组管理相关函数
const openAddCapacityGroupModal = (item, index) => {
  if (item) {
    state.isEditingCapacityGroup = true;
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
  //   if (state.form.productIngredients.length === 0) {
  //     data.isDefault = true;
  //   }
  state.showIngredientGroups = false;
  setTimeout(() => {
    state.showIngredientGroups = true;
  }, 0);
  if (mode === 'edit') {
    const i = state.form.productIngredients.findIndex(g => g.id === data.id);
    if (i !== -1) state.form.productIngredients[i] = data;
    else state.form.productIngredients.push(data);
  } else {
    state.form.productIngredients.push(data);
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
        state.form.productIngredients.splice(index, 1);
        uni.showToast({
          title: '删除成功',
          icon: 'success',
        });
      }
    },
  });
};

const setDefaultIngredientGroup = (item, index: number) => {
  state.form.productIngredients.forEach(group => {
    group.isDefault = false;
  });
  state.form.productIngredients[index].isDefault = true;
  uni.showToast({
    title: '已设为默认小料',
    icon: 'success',
  });
};

const deleteSpecGroup = (item, index: number) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除规格组"${item.key}"吗？`,
    success: res => {
      if (res.confirm) {
        state.form.productOptions.splice(index, 1);
        uni.showToast({
          title: '删除成功',
          icon: 'success',
        });
      }
    },
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
  // if (state.form.productOptions.length === 0) {
  // 	data.isDefault = true;
  // }
  state.showSpecGroup = false;
  setTimeout(() => {
    state.showSpecGroup = true;
  }, 0);

  if (mode === 'edit') {
    const i = state.form.productOptions.findIndex(g => g.id === data.id);
    if (i !== -1) state.form.productOptions[i] = data;
    else state.form.productOptions.push(data);
  } else {
    state.form.productOptions.push(data);
  }
};

// 保存酒水
const save = async () => {
  try {
    // 表单验证
    await validate();
    try {
      if (props.type === 'edit') {
        await modifyProduct({ ...state.form, shopId: props.shopId });
      } else {
        await createProduct({ ...state.form, shopId: props.shopId });
      }
      emit('callback', state.form.catalogId);
      uni.showToast({
        title: props.type === 'edit' ? '商品已更新' : '商品已添加',
        icon: 'success',
      });
      close();
    } catch (error) {}
  } catch (error) {
    console.log('表单验证失败:', error);
  }
};

watch(
  () => props.productFormData,
  newVal => {
    if (props.productFormData) {
      for (const key in state.form) {
        if (props.productFormData[key]) {
          state.form[key] = props.productFormData[key];
        }
      }
    }
    if (props.productFormData.productSkus) {
      props.productFormData.productSkus.forEach((item: any, index: number) => {
        if (index == 0) {
          item.isDefault = true;
        }
      });
      state.form.productSkus = props.productFormData.productSkus;
    }
    if (props.productFormData.productOptions) {
      let options = [];
      for (const key in props.productFormData.productOptions) {
        options.push({
          key: key,
          options: formatValuesToOptions(props.productFormData.productOptions[key], true),
        });
      }
      state.form.productOptions = options;
    }
    if (props.type === 'add') {
      state.form.catalogId = props.tabs[props.activeTab]?.id || '';
    }
    state.form.categoryName = getSelectedCategoryName();
    if (state.form.photo) {
      state.photoFileList = [{ url: state.form.photo }];
    }
    // 保存打开时的快照，用于取消时还原
    // if (props.productFormData.productIngredientConfig) {
    //   state.form.productIngredientConfig.required = props.productFormData.productIngredientConfig.required;
    //   state.form.productIngredientConfig.type = props.productFormData.productIngredientConfig.type;
    //   state.form.productIngredientConfig.id = props.productFormData.productIngredientConfig.id;
    // }
    // nextTick(() => {
    // 	formRef.value?.setRules(state.rules);
    // });
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  // nextTick(() => {
  // 	formRef.value?.setRules(state.rules);
  // });
});

defineOptions({
  options: {
    styleIsolation: 'shared',
  },
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';
.del-icon-btn {
  border-radius: 50%;
  overflow: hidden;
  .u-button {
    background-color: var(--danger-6);
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
  border-radius: $up-box-radius-1;
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
  height: 36px;
  padding: 16rpx;
  background-color: var(--bg-1);
  border-radius: $up-box-radius-1;
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
  height: 36px;
  padding: 16rpx;
  background-color: var(--bg-1);
  border-radius: $up-box-radius-1;
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
  font-size: $up-font-sm;
  color: var(--text-2);
  font-weight: 500;
}

.spec-default-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.default-badge {
  font-size: $up-font-sm;
  color: #fff;
  background-color: var(--primary-6);
  padding: 3rpx 8rpx;
  border-radius: $up-box-radius-1;
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
  height: 36px;
  padding: 16rpx;
  background-color: var(--bg-2);
  border-radius: $up-box-radius-1;
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
