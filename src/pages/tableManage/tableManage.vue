<template>
  <view class="container">
    <view class="header glass-card">
      <text class="page-title">桌位管理</text>
      <u-button class="add-btn" type="primary" @click="openAddTableModal">添加桌位</u-button>
    </view>

    <!-- 桌位列表 -->
    <view class="table-list">
      <block v-for="table in state.tables" :key="table.id">
        <view class="table-item glass-card">
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
            <u-button  type="primary" @click="openEditTableModal(table.id)">编辑</u-button>
            <u-button  type="error" @click="openDeleteTableModal(table.id)">删除</u-button>
          </view>
        </view>
      </block>
      <view class="empty-state glass-card" v-if="state.tables.length === 0">
        <image src="/static/empty.png" mode="widthFix"></image>
        <text>暂无桌位数据</text>
        <u-button class="add-table-btn" @click="openAddTableModal">添加桌位</u-button>
      </view>
    </view>

    <!-- 添加/编辑桌位弹窗 -->
    <u-popup :show="state.showTableModal" mode="center" @close="closeTableModal">
      <view class="z-modal z-modal-lg">
        <view class="modal-header">
          <text class="modal-title">{{ state.isEditingTable ? '编辑桌位' : '添加桌位' }}</text>
          <text class="close-btn" @click="closeTableModal">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">桌号</text>
            <u-input class="form-input" v-model="state.tempTable.number" placeholder="请输入桌号（如：1号桌）" border="surround"></u-input>
          </view>
          <view class="form-item">
            <text class="form-label">最大人数</text>
            <u-input class="form-input" type="number" v-model.number="state.tempTable.maxCount" placeholder="请输入最大人数" border="surround"></u-input>
          </view>
          <view class="form-item" v-if="state.isEditingTable">
            <text class="form-label">当前人数</text>
            <u-input class="form-input" type="number" v-model.number="state.tempTable.currentCount" placeholder="请输入当前人数" border="surround"></u-input>
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
                  <u-button class="qrcode-btn" type="primary" @click="viewQRCode">查看</u-button>
                  <u-button class="qrcode-btn" type="error" @click="deleteQRCode">删除</u-button>
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
        <view class="modal-footer">
          <u-button @click="closeTableModal">取消</u-button>
          <u-button  type="primary" @click="confirmTable">确定</u-button>
        </view>
      </view>
    </u-popup>

    <!-- 删除确认弹窗 -->
    <u-popup :show="state.showDeleteTableModal" mode="center" @close="closeDeleteTableModal">
      <view class="confirm-content glass-card">
        <text class="confirm-title">确认删除</text>
        <text class="confirm-text">您确定要删除此桌位吗？此操作无法撤销。</text>
        <view class="confirm-btns">
          <u-button  @click="closeDeleteTableModal">取消</u-button>
          <u-button  type="error" @click="deleteTable">确认删除</u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script lang="ts" setup>
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
  showDeleteTableModal: false,
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
  state.showDeleteTableModal = true;
};

const closeDeleteTableModal = () => {
  state.showDeleteTableModal = false;
  state.deleteTableId = '';
};

const deleteTable = () => {
  const index = state.tables.findIndex(t => t.id === state.deleteTableId);
  if (index !== -1) {
    state.tables.splice(index, 1);
  }
  state.showDeleteTableModal = false;
  state.deleteTableId = '';
  uni.showToast({
    title: '桌位已删除',
    icon: 'success'
  });
};
</script>

<style lang="scss" scoped>
.container {
  padding: 15px;
  background-color: #f8f8f8;
  min-height: 100vh;
}

/* 玻璃卡片效果 */
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 头部样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.add-btn {
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  width: 120rpx;
}

/* 桌位列表样式 */
.table-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.table-item {
  padding: 15px;
}

.table-info {
  margin-bottom: 15px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.table-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.table-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 10px;
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
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.table-mode {
  margin-top: 5px;
}

.mode-tag {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 8px;
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
  gap: 10px;
}


/* 弹窗样式 */

.form-item {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  color: #333;
  background-color: #fff;
  box-sizing: border-box;
}

.modal-footer {
  display: flex;
  gap: 10px;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 40px;
  font-size: 14px;
  border-radius: 20px;
  border: none;
}


/* 服务模式选择器样式 */
.service-mode-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.mode-option {
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
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
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.mode-option.active .mode-label {
  color: #3aa9e8;
}

.mode-desc {
  display: block;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.mode-option.active .mode-desc {
  color: #666;
}

/* 二维码相关样式 */
.qrcode-section {
  margin-top: 10px;
}

.qrcode-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.qrcode-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

.qrcode-actions {
  display: flex;
  gap: 10px;
}

.qrcode-btn {
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 15px;
  border: none;
}

.qrcode-upload {
  margin-top: 10px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  border: 2px dashed #d0d0d0;
  border-radius: 8px;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:active {
  background-color: #f0f0f0;
  border-color: #3aa9e8;
}

.upload-icon {
  font-size: 32px;
  color: #999;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.upload-desc {
  font-size: 12px;
  color: #999;
  text-align: center;
}

/* 删除确认弹窗样式 */
.confirm-content {
  width: 80%;
  max-width: 300px;
  padding: 20px;
}

.confirm-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 15px;
}

.confirm-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  text-align: center;
}

.confirm-btns {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.confirm-btns .cancel-btn {
  flex: 1;
  margin-right: 0;
}

</style>