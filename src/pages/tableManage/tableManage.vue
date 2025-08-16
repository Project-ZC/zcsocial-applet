<template>
   <pageWrapper class="table-manage">
    <view class="header z-glass-card">
      <text class="page-title">桌位管理</text>
      <up-button class="add-btn" type="primary" @click="openAddTableModal">添加桌位</up-button>
    </view>

    <!-- 桌位列表 -->
    <view class="table-list">
      <block v-for="table in state.tables" :key="table.id">
        <view class="table-item z-glass-card">
          <view class="table-info">
            <view class="table-header">
              <text class="table-name">{{ table.number }}</text>
              <view class="table-status" :class="[table.status === 'available' ? 'available' : 'occupied']">
                {{ table.status === 'available' ? '空闲' : '已满' }}
              </view>
            </view>
            <view class="table-count">
              <text>当前人数：{{ table.currentCount }}/{{ table.maxCount }}人</text>
            </view>
            <view class="table-mode">
              <text class="mode-tag" :class="[table.serviceMode]">{{ table.serviceMode === 'ticket' ? '门票制' : '点单制' }}</text>
            </view>
          </view>
          <view class="table-actions">
            <up-button  type="primary" @click="openEditTableModal(table.id)">编辑</up-button>
            <up-button  type="error" @click="openDeleteTableModal(table.id)">删除</up-button>
          </view>
        </view>
      </block>
      <view class="empty-state z-glass-card" v-if="state.tables.length === 0">
        <image src="/static/empty.png" mode="widthFix"></image>
        <text>暂无桌位数据</text>
        <up-button class="add-table-btn" @click="openAddTableModal">添加桌位</up-button>
      </view>
    </view>
  </pageWrapper>

    <!-- 添加/编辑桌位弹窗 -->
    <up-popup :show="state.showTableModal" mode="center" @close="closeTableModal">
      <view class="z-modal z-modal-lg">
        <view class="modal-header">
          <text class="modal-title">{{ state.isEditingTable ? '编辑桌位' : '添加桌位' }}</text>
          <text class="close-btn" @click="closeTableModal">×</text>
        </view>
          <scroll-view scroll-y class="scroll-content">
            <view class="modal-body">
              <view class="form-item">
                <text class="form-label">桌号</text>
                <up-input class="form-input" v-model="state.tempTable.number" placeholder="请输入桌号（如：1号桌）" border="surround"></up-input>
              </view>
              <view class="form-item">
                <text class="form-label">最大人数</text>
                <up-input class="form-input" type="number" v-model.number="state.tempTable.maxCount" placeholder="请输入最大人数" border="surround"></up-input>
              </view>
              <view class="form-item" v-if="state.isEditingTable">
                <text class="form-label">当前人数</text>
                <up-input class="form-input" type="number" v-model.number="state.tempTable.currentCount" placeholder="请输入当前人数" border="surround"></up-input>
              </view>
              <view class="form-item">
                <text class="form-label">服务模式</text>
                <view class="service-mode-options">
                  <view class="mode-option" :class="[state.tempTable.serviceMode === 'ticket' ? 'active' : '']" @click="selectServiceMode('ticket')">
                    <text class="mode-label">门票制</text>
                    <text class="mode-desc">固定门票价格，包含单点制内容</text>
                  </view>
                  <view class="mode-option" :class="[state.tempTable.serviceMode === 'order' ? 'active' : '']" @click="selectServiceMode('order')">
                    <text class="mode-label">点单制</text>
                    <text class="mode-desc">按实际消费点单收费</text>
                  </view>
                </view>
              </view>
              <!-- 二维码设置 -->
              <view class="form-item">
                <text class="form-label">桌位二维码</text>
                <view class="qrcode-section">
                  <view class="qrcode-preview" v-if="state.tempTable.qrcode">
                    <image class="qrcode-image" :src="state.tempTable.qrcode" mode="aspectFit"></image>
                    <view class="qrcode-actions">
                      <up-button class="qrcode-btn" type="primary" @click="viewQRCode">查看</up-button>
                      <up-button class="qrcode-btn" type="error" @click="deleteQRCode">删除</up-button>
                    </view>
                  </view>
                  <view class="qrcode-upload" v-else>
                    <view class="upload-area" @click="uploadQRCode">
                      <text class="upload-icon">+</text>
                      <text class="upload-text">上传二维码图片</text>
                      <text class="upload-desc">支持JPG、PNG格式，建议尺寸200x200px</text>
                    </view>
                  </view>
                </view>
              </view>
          </view>
          </scroll-view>
        <view class="modal-footer">
          <up-button @click="closeTableModal">取消</up-button>
          <up-button  type="primary" @click="confirmTable">确定</up-button>
        </view>
      </view>
    </up-popup>
</template>

<script lang="ts" setup>
import pageWrapper from "@/components/page/index.vue";
import { reactive, onMounted } from "vue";

defineOptions({
  name: "TableManagePage",
});

// Define interface for table
interface Table {
  id: string;
  number: string;
  status: 'available' | 'occupied';
  currentCount: number;
  maxCount: number;
  serviceMode: 'ticket' | 'order';
  qrcode: string;
  sort: number;
}

// State management
const state = reactive({
  tables: [] as Table[],
  showTableModal: false,
  isEditingTable: false,
  tempTable: {
    id: '',
    number: '',
    status: 'available',
    currentCount: 0,
    maxCount: 0,
    serviceMode: 'ticket',
    qrcode: '',
    sort: 0
  } as Table,
  deleteTableId: ''
});

// Lifecycle hooks
onMounted(() => {
  console.log('Table Manage Page loaded');
  // Initialize with sample data or fetch from API
  state.tables = [
    {
      id: '1',
      number: '1号桌',
      status: 'available',
      currentCount: 0,
      maxCount: 4,
      serviceMode: 'ticket',
      qrcode: '',
      sort: 1
    },
    {
      id: '2',
      number: '2号桌',
      status: 'occupied',
      currentCount: 4,
      maxCount: 6,
      serviceMode: 'order',
      qrcode: '',
      sort: 2
    }
  ];
});

// Table management methods
const openAddTableModal = () => {
  state.isEditingTable = false;
  state.tempTable = {
    id: '',
    number: '',
    status: 'available',
    currentCount: 0,
    maxCount: 0,
    serviceMode: 'ticket',
    qrcode: '',
    sort: 0
  };
  state.showTableModal = true;
};

const openEditTableModal = (id: string) => {
  const table = state.tables.find(t => t.id === id);
  if (table) {
    state.isEditingTable = true;
    state.tempTable = { ...table };
    state.showTableModal = true;
  }
};

const closeTableModal = () => {
  state.showTableModal = false;
};

const confirmTable = () => {
  if (!state.tempTable.number) {
    uni.showToast({
      title: '请输入桌号',
      icon: 'none'
    });
    return;
  }
  if (state.tempTable.maxCount <= 0) {
    uni.showToast({
      title: '最大人数必须大于0',
      icon: 'none'
    });
    return;
  }
  if (state.isEditingTable && state.tempTable.currentCount > state.tempTable.maxCount) {
    uni.showToast({
      title: '当前人数不能大于最大人数',
      icon: 'none'
    });
    return;
  }

  if (state.isEditingTable) {
    const index = state.tables.findIndex(t => t.id === state.tempTable.id);
    if (index !== -1) {
      state.tables[index] = { ...state.tempTable };
    }
  } else {
    const newTable = {
      ...state.tempTable,
      id: Date.now().toString()
    };
    state.tables.push(newTable);
  }

  state.tables.sort((a, b) => a.sort - b.sort);
  state.showTableModal = false;
  uni.showToast({
    title: state.isEditingTable ? '桌位已更新' : '桌位已添加',
    icon: 'success'
  });
};

const selectServiceMode = (mode: 'ticket' | 'order') => {
  state.tempTable.serviceMode = mode;
};

const uploadQRCode = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      state.tempTable.qrcode = res.tempFilePaths[0];
    }
  });
};

const viewQRCode = () => {
  uni.previewImage({
    urls: [state.tempTable.qrcode],
    current: 0
  });
};

const deleteQRCode = () => {
  state.tempTable.qrcode = '';
};

const openDeleteTableModal = (id: string) => {
  state.deleteTableId = id;
  uni.showModal({
    title: '提示',
    content: '您确定要删除此桌位吗？此操作无法撤销。',
    confirmText: '删除',
    cancelText: '取消',
    confirmColor: '#f76560',
    success: (res) => {
      if(res.confirm){
        deleteTable()
      }
    }
  })
};

const deleteTable = () => {
  const index = state.tables.findIndex(t => t.id === state.deleteTableId);
  if (index !== -1) {
    state.tables.splice(index, 1);
  }
  state.deleteTableId = '';
  uni.showToast({
    title: '桌位已删除',
    icon: 'success'
  });
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';
.table-manage {
 ::v-deep .content-area{
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
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.add-btn {
  font-size: 28rpx;
  // padding: 16rpx 32rpx;
  border-radius: 40rpx;
  border: none;
  width: 180rpx!important;
  margin: 0;

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
  color: #333;
}

.table-status {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.table-status.available {
  background-color: #e6f7ff;
  color: #1890ff;
}

.table-status.occupied {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.table-count {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.table-mode {
  margin-top: 10rpx;
}

.mode-tag {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  background-color: #f0f0f0;
  color: #666;
}

.mode-tag.ticket {
  background-color: #e6f7ff;
  color: #1890ff;
}

.mode-tag.order {
  background-color: #fff2e8;
  color: #fa8c16;
}

.table-actions {
  display: flex;
  gap: 20rpx;
}


/* 弹窗样式 */

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
  background-color: #fff;
  box-sizing: border-box;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 80rpx;
  font-size: 28rpx;
  border-radius: 40rpx;
  border: none;
}


/* 服务模式选择器样式 */
.service-mode-options {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-top: 16rpx;
}

.mode-option {
  padding: 32rpx;
  border: 4rpx solid #e0e0e0;
  border-radius: 24rpx;
  background-color: #fff;
  transition: all 0.3s ease;
  cursor: pointer;
}

.mode-option.active {
  border-color: #3aa9e8;
  background-color: #f0f8ff;
}

.mode-label {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.mode-option.active .mode-label {
  color: #3aa9e8;
}

.mode-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
  line-height: 1.4;
}

.mode-option.active .mode-desc {
  color: #666;
}

/* 二维码相关样式 */
.qrcode-section {
  margin-top: 20rpx;
}

.qrcode-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.qrcode-image {
  width: 240rpx;
  height: 240rpx;
  border-radius: 16rpx;
  border: 4rpx solid #e0e0e0;
}

.qrcode-actions {
  display: flex;
  gap: 20rpx;
}

.qrcode-btn {
  font-size: 24rpx;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  border: none;
}

.qrcode-upload {
  margin-top: 20rpx;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 40rpx;
  border: 4rpx dashed #d0d0d0;
  border-radius: 16rpx;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:active {
  background-color: #f0f0f0;
  border-color: #3aa9e8;
}

.upload-icon {
  font-size: 64rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.upload-text {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.upload-desc {
  font-size: 24rpx;
  color: #999;
  text-align: center;
}

/* 删除确认弹窗样式 */
.confirm-content {
  width: 80%;
  max-width: 600rpx;
  padding: 40rpx;
}

.confirm-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 30rpx;
}

.confirm-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 40rpx;
  text-align: center;
}

.confirm-btns {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.confirm-btns .cancel-btn {
  flex: 1;
  margin-right: 0;
}

</style>