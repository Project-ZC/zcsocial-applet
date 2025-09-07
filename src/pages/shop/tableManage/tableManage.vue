<template>
  <pageWrapper class="table-manage">
    <view class="header z-glass-card">
      <text class="page-title">桌位管理</text>
      <up-button class="add-btn" type="gradient1" @click="openAddTableModal">添加桌位</up-button>
    </view>
    <!-- 桌位列表 -->
    <view class="table-list">
      <template v-if="state.tables.length > 0">
        <block v-for="table in state.tables" :key="table.id">
          <view class="table-item z-glass-card">
            <view class="table-info">
              <view class="table-header">
                <text class="table-name">{{ table.tableName }}</text>
                <view class="table-status" :class="[table.status === 'available' ? 'available' : 'occupied']">
                  {{ table.status === 'available' ? '空闲' : '已满' }}
                </view>
              </view>
              <view class="table-count">
                <text>人数：{{ table.personNumber }}人</text>
              </view>
              <view class="table-mode">
                <text class="mode-tag" :class="[table.orderMode]">{{ getModeName(table.orderMode) }}</text>
              </view>
            </view>
            <view class="table-actions">
              <up-button shape="circle" size="small" type="primary" @click="openEditTableModal(table)">编辑</up-button>
              <up-button shape="circle" size="small" type="error" @click="openDeleteTableModal(table)">删除</up-button>
            </view>
          </view>
        </block>
      </template>
      <view class="empty-state z-glass-card" v-else>
        <emptyData text="暂无桌位">
          <template #subtext>
            <text>点击右上角按钮添加桌位</text>
          </template>
        </emptyData>
      </view>
    </view>
  </pageWrapper>

  <!-- 添加/编辑桌位弹窗 -->
  <up-popup :show="state.showTableModal" mode="center" @close="closeTableModal">
    <view class="z-modal z-modal-lg">
      <view class="modal-header">
        <text class="modal-title">{{ state.isEditingTable ? '编辑桌位' : '添加桌位' }}</text>
        <view class="close-btn" @click="closeTableModal">
          <up-icon name="close" size="20"></up-icon>
        </view>
      </view>
      <scroll-view scroll-y class="scroll-content">
        <view class="modal-body">
          <up-form
            :model="state.tempTable"
            :rules="state.formRules"
            ref="formRef"
            label-width="auto"
            label-position="top"
          >
            <up-form-item label="桌号" prop="tableName">
              <up-input v-model="state.tempTable.tableName" placeholder="请输入桌号（如：1号桌）" clearable />
            </up-form-item>

            <up-form-item label="最大人数" prop="personNumber">
              <up-input
                v-model="state.tempTable.personNumber"
                type="number"
                placeholder="请输入人数"
                border="surround"
                clearable
              />
            </up-form-item>

            <up-form-item label="点单模式" prop="orderMode">
              <view class="service-mode-options">
                <view
                  v-for="mode in state.orderModeList"
                  :key="mode.code"
                  class="mode-option"
                  :class="[state.tempTable.orderMode === mode.code ? 'active' : '']"
                  @click="selectServiceMode(mode.code)"
                >
                  <text class="mode-label">{{ mode.name }}</text>
                  <text class="mode-desc">{{ mode.description }}</text>
                </view>
              </view>
            </up-form-item>
            <up-form-item label="二维码" v-if="state.tempTable.qrCode">
              <view class="qrcode-preview">
                <up-image
                  class="qrcode-image"
                  :src="API_CONFIG.fileUrl + state.tempTable.qrCode"
                  mode="aspectFit"
                ></up-image>
              </view>
              <!-- <view class="qrcode-upload" v-else>
                <view class="upload-area" @click="uploadQRCode">
                  <text class="upload-icon">+</text>
                  <text class="upload-text">上传二维码图片</text>
                  <text class="upload-desc"
                    >支持JPG、PNG格式，建议尺寸200x200px</text
                  >
                </view>
              </view> -->
            </up-form-item>
          </up-form>
        </view>
      </scroll-view>
      <view class="modal-footer">
        <up-button @click="closeTableModal">取消</up-button>
        <up-button type="primary" @click="confirmTable">确定</up-button>
      </view>
    </view>
  </up-popup>
</template>

<script lang="ts" setup>
import pageWrapper from '@/components/page/index.vue';
import { reactive, ref } from 'vue';
import emptyData from '@/components/empty-data/index.vue';
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { API_CONFIG } from '@/api/common/apiConfig';
import { previewImage, handleQRCodeLongPress } from '@/utils/util';
import { getAllTableList, addTable, editTable, deleteTable } from '@/api/tableManage';
import { getGender } from '@/api/common/dict';

defineOptions({
  name: 'TableManagePage',
});

// 表单引用
const formRef = ref();

// State management
const state = reactive({
  tables: [] as any,
  showTableModal: false,
  isEditingTable: false,
  tempTable: {
    id: '',
    tableName: '',
    personNumber: '',
    orderMode: 'ticket',
    status: 'available',
    qrCode: '',
  },
  deleteTableId: '',
  shopId: '',
  // 表单验证规则
  formRules: {
    tableName: [{ required: true, message: '请输入桌号', trigger: 'blur' }],
    personNumber: [
      // { required: true, message: '请输入最大人数', trigger: 'blur' },
      {
        validator: (rule: any, value: any, callback: any) => {
          if ((value && (isNaN(value) || parseInt(value) <= 0)) || !value) {
            callback(new Error('人数必须大于0'));
          } else {
            callback();
          }
        },
        trigger: ['blur', 'change'],
      },
    ],
    orderMode: [{ required: true, message: '请选择点单模式', trigger: 'change' }],
  },
  orderModeList: [] as any,
});

const getOrderModeList = async () => {
  const res = await getGender({
    // shopId: state.shopId
  });
  if (res.data?.length) {
    state.tempTable.orderMode = res.data[0].code;
  }
  state.orderModeList = res.data || [];
};

const GetTableList = async () => {
  try {
    const res = await getAllTableList({
      shopId: state.shopId,
    });
    state.tables = res.data || [];
  } catch (error) {
    console.error('获取桌位列表失败:', error);
  }
};

// Table management methods
const openAddTableModal = () => {
  state.isEditingTable = false;
  state.showTableModal = true;
};

const openEditTableModal = (table: any) => {
  if (table) {
    state.isEditingTable = true;
    state.tempTable = {
      ...table,
    };
    state.showTableModal = true;
  }
};

const closeTableModal = () => {
  state.showTableModal = false;
  // 重置表单
  formRef.value?.resetFields();
  setTimeout(() => {
    formRef.value?.clearValidate();
  }, 100);
  state.tempTable.qrCode = '';
};

const uploadQRCode = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: res => {
      state.tempTable.qrCode = res.tempFilePaths[0];
    },
  });
};

const deleteQRCode = () => {
  state.tempTable.qrCode = '';
};

// 保存桌位
const confirmTable = async () => {
  try {
    // 表单验证
    await formRef.value.validate();
    const params = {
      shopId: state.shopId,
      tableName: state.tempTable.tableName,
      personNumber: parseInt(state.tempTable.personNumber),
      orderMode: state.tempTable.orderMode,
    };

    if (state.isEditingTable) {
      // 编辑桌位
      await editTable({
        ...params,
        id: state.tempTable.id,
      });
      GetTableList(); // 重新获取列表
      uni.showToast({
        title: '桌位已更新',
        icon: 'success',
      });
    } else {
      // 添加桌位
      await addTable(params);
      GetTableList(); // 重新获取列表
      uni.showToast({
        title: '桌位已添加',
        icon: 'success',
      });
    }
    closeTableModal();
  } catch (error) {}
};

const openDeleteTableModal = (table: any) => {
  state.deleteTableId = table.id;
  uni.showModal({
    title: '提示',
    content: '您确定要删除此桌位吗？此操作无法撤销。',
    confirmText: '删除',
    cancelText: '取消',
    confirmColor: '#f76560',
    success: async res => {
      if (res.confirm) {
        await deleteTableItem();
      }
    },
  });
};

const selectServiceMode = (mode: string) => {
  state.tempTable.orderMode = mode;
};

// 获取模式描述
const getModeDescription = (code: string) => {
  // const descriptions: Record<string, string> = {
  // 	ticket: "固定门票价格，包含单点制内容",
  // 	order: "按实际消费点单收费",
  // 	// 可以根据需要添加更多模式的描述
  // };
  // return descriptions[code] || "暂无描述";
};

// 获取模式名称
const getModeName = (code: string) => {
  const mode = state.orderModeList.find((item: any) => item.code === code);
  return mode ? mode.name : '未知模式';
};

const deleteTableItem = async () => {
  try {
    await deleteTable({ id: state.deleteTableId });
    uni.showToast({
      title: '桌位已删除',
      icon: 'success',
    });
    GetTableList(); // 重新获取列表
  } catch (error) {}
  state.deleteTableId = '';
};

onLoad(async query => {
  state.shopId = query.shopId;
  await getOrderModeList();
  GetTableList();
});

// 二维码长按处理
const onQRCodeLongPress = () => {
  if (state.tempTable.qrCode) {
    const qrCodeUrl = API_CONFIG.fileUrl + state.tempTable.qrCode;
    handleQRCodeLongPress(qrCodeUrl, '桌位二维码');
  }
};

// 下拉刷新监听
onPullDownRefresh(async () => {
  try {
    await GetTableList();
  } finally {
    uni.stopPullDownRefresh();
  }
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';
.table-manage {
  ::v-deep .content-area {
    padding: $up-box-pd;
  }
}

/* 头部样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $up-box-pd;
  margin-bottom: $up-box-mg;
  :deep(.add-btn) {
    // font-size: 28rpx;
    margin: 0;
    width: 200rpx;
  }
  .page-title {
    font-size: 36rpx;
    font-weight: bold;
    color: var(--text-1);
  }
}

/* 桌位列表样式 */
.table-list {
  display: flex;
  flex-direction: column;
  gap: $up-box-mg;
}

.table-item {
  padding: $up-box-pd;
}

.table-info {
  margin-bottom: $up-box-mg;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $up-box-mg;
}

.table-name {
  font-size: $up-font-lg;
  font-weight: bold;
  color: var(--text-1);
}

.table-status {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.table-status.available {
  background-color: var(--bg-1);
  color: var(--primary-6);
}

.table-status.occupied {
  background-color: var(--bg-1);
  color: var(--danger-6);
}

.table-count {
  font-size: 28rpx;
  color: var(--text-2);
  margin-bottom: 16rpx;
}

.table-mode {
  margin-top: 10rpx;
}

.mode-tag {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  background-color: var(--bg-1);
  color: var(--text-2);
}

.mode-tag.ticket {
  background-color: var(--bg-1);
  color: var(--primary-6);
}

.mode-tag.order {
  background-color: var(--bg-1);
  color: var(--burgundy);
}

.table-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20rpx;
  margin: 0;
  :deep(.u-button) {
    margin: 0;
    width: 120rpx;
  }
}

/* 服务模式选择器样式 */
.service-mode-options {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-top: 16rpx;
  width: 100%;
  box-sizing: border-box;
}

.mode-option {
  padding: 20rpx;
  border: 4rpx solid var(--border-1);
  border-radius: 24rpx;
  background-color: var(--bg-1);
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
}

.mode-option.active {
  border-color: var(--border-4);
  background-color: var(--bg-1);
}

.mode-label {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  color: var(--text-1);
  margin-bottom: 8rpx;
}

.mode-option.active .mode-label {
  color: var(--text-1);
}

.mode-desc {
  display: block;
  font-size: 24rpx;
  color: var(--text-3);
  line-height: 1.4;
}

.mode-option.active .mode-desc {
  color: var(--text-2);
}

/* 二维码相关样式 */
// .qrcode-section {
//   width: 100%;
// }
// .qrcode-preview {
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   gap: 20rpx;
//   width: 100%;
// }

// .qrcode-image {
//   width: 100%;
//   height: 260rpx;
//   border-radius: 16rpx;
//   border: 4rpx solid #e0e0e0;
// }

// .qrcode-actions {
//   display: flex;
//   gap: 20rpx;
// }

// .qrcode-btn {
//   font-size: 24rpx;
//   padding: 12rpx 24rpx;
//   border-radius: 30rpx;
//   border: none;
// }

// .qrcode-upload {
//   margin-top: 20rpx;
// }

// .upload-area {
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   padding: 60rpx 40rpx;
//   border: 4rpx dashed var(--border-1);
//   border-radius: 16rpx;
//   background-color: var(--bg-1);
//   cursor: pointer;
//   transition: all 0.3s ease;
//   width: 100%;
// }

// .upload-area:active {
//   background-color: var(--bg-1);
//   border-color: var(--primary-6);
// }

.upload-icon {
  font-size: 64rpx;
  color: var(--text-3);
  margin-bottom: 16rpx;
}

.upload-text {
  font-size: 28rpx;
  color: var(--text-1);
  margin-bottom: 8rpx;
}

.upload-desc {
  font-size: 24rpx;
  color: var(--text-3);
  text-align: center;
}

.modal-body {
  // max-height: 60vh;
}
</style>
