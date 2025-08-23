<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="page-header z-glass-card">
      <text class="page-title">门票设置</text>
      <view class="header-actions">
        <up-button class="add-btn" @click="openAddTicketModal">新增门票</up-button>
      </view>
    </view>
    
    <!-- 门票列表 -->
    <view class="ticket-list">
      <view class="ticket-item z-glass-card" v-for="ticket in state.tickets" :key="ticket.id">
        <view class="ticket-header">
          <view class="ticket-info">
            <text class="ticket-name">{{ ticket.name }}</text>
            <view class="ticket-status" :class="[ticket.status === 'active' ? 'active' : 'inactive']">
              <text>{{ ticket.status === 'active' ? '启用' : '停用' }}</text>
            </view>
          </view>
          <view class="ticket-price">
            <view class="price-display">
              <text class="price-label">男性:</text>
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ ticket.malePrice }}</text>
            </view>
            <view class="price-display">
              <text class="price-label">女性:</text>
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ ticket.femalePrice }}</text>
            </view>
          </view>
        </view>
        
        <view class="ticket-details">
          <view class="detail-item">
            <text class="detail-label">包含酒水：</text>
            <text class="detail-value">{{ ticket.drinkCount }}杯</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">使用时间：</text>
            <text class="detail-value">{{ ticket.validHours }}小时</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">有效期：</text>
            <text class="detail-value">{{ ticket.validDays }}天</text>
          </view>
        </view>
        
        <view class="ticket-actions">
          <up-button class="action-btn edit-btn" @click="openEditTicketModal(ticket.id)">编辑</up-button>
          <up-button class="action-btn toggle-btn" :class="[ticket.status === 'active' ? 'deactivate' : 'activate']" @click="toggleTicketStatus(ticket.id)">
            {{ ticket.status === 'active' ? '停用' : '启用' }}
          </up-button>
          <up-button class="action-btn delete-btn" @click="openDeleteTicketModal(ticket.id)">删除</up-button>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="state.tickets.length === 0">
        <image class="empty-icon" src="https://via.placeholder.com/120x120/CCCCCC/FFFFFF?text=🎫" mode="aspectFit"></image>
        <text class="empty-text">暂无门票设置</text>
        <text class="empty-desc">点击上方"新增门票"开始设置</text>
      </view>
    </view>
    
    <!-- 添加/编辑门票模态框 -->
    <up-popup :show="state.showTicketModal" mode="center" @close="closeTicketModal" >
      <view class="z-modal-lg z-modal">
        <view class="modal-header">
          <text class="modal-title">{{ state.isEditingTicket ? '编辑门票' : '新增门票' }}</text>
          <view class="modal-close close-btn" @click="closeTicketModal">×</view>
        </view>
        
        <view class="modal-body">
          <scroll-view scroll-y="true" >
          <view class="form-group">
            <label class="form-label">门票名称</label>
            <up-input class="form-input" v-model="state.tempTicket.name" placeholder="请输入门票名称"></up-input>
          </view>
          
          <!-- 性别价格设置 -->
          <view class="form-group">
            <label class="form-label">门票价格</label>
            <view class="gender-pricing">
              <view class="price-item">
                <text class="gender-label">男性价格</text>
                <view class="price-input-container">
                  <text class="price-symbol">¥</text>
                  <up-input class="form-input price-input" type="digit" v-model.number="state.tempTicket.malePrice" placeholder="请输入男性价格"></up-input>
                </view>
              </view>
              <view class="price-item">
                <text class="gender-label">女性价格</text>
                <view class="price-input-container">
                  <text class="price-symbol">¥</text>
                  <up-input class="form-input price-input" type="digit" v-model.number="state.tempTicket.femalePrice" placeholder="请输入女性价格"></up-input>
                </view>
              </view>
            </view>
          </view>
          
          <view class="form-group">
            <label class="form-label">包含酒水数量</label>
            <up-input class="form-input" type="number" v-model.number="state.tempTicket.drinkCount" placeholder="请输入酒水数量"></up-input>
          </view>
          
          <view class="form-group">
            <label class="form-label">使用时间（小时）</label>
            <up-input class="form-input" type="number" v-model.number="state.tempTicket.validHours" placeholder="请输入使用时间"></up-input>
          </view>
          
          <view class="form-group">
            <label class="form-label">有效期（天）</label>
            <up-input class="form-input" type="number" v-model.number="state.tempTicket.validDays" placeholder="请输入有效期"></up-input>
          </view>
          
          <view class="form-group">
            <label class="form-label">门票描述</label>
            <up-textarea class="form-textarea" v-model="state.tempTicket.description" placeholder="请输入门票描述" height="120"></up-textarea>
          </view>
          
          <view class="form-group switch-group">
            <label>启用状态</label>
            <up-switch v-model="state.tempTicket.status" true-value="active" false-value="inactive" color="#1989fa"></up-switch>
          </view>
          </scroll-view>
        </view>
        
        <view class="modal-footer">
          <up-button class="modal-btn cancel-btn" @click="closeTicketModal">取消</up-button>
          <up-button class="modal-btn confirm-btn" @click="saveTicket">保存</up-button>
        </view>
      </view>
    </up-popup>
    
    <!-- 删除确认弹窗 -->
    <up-popup :show="state.showDeleteTicketModal" mode="center" @close="closeDeleteTicketModal">
      <view class="confirm-content z-glass-card">
        <text class="confirm-title">确认删除</text>
        <text class="confirm-text">您确定要删除此票券吗？此操作无法撤销。</text>
        <view class="confirm-btns">
          <up-button class="cancel-btn" @click="closeDeleteTicketModal">取消</up-button>
          <up-button class="delete-btn" type="error" @click="deleteTicket">确认删除</up-button>
        </view>
      </view>
    </up-popup>
  </view>
</template>

<script lang="ts" setup>
import { reactive, onMounted } from "vue";

defineOptions({
  name: "TicketSettingsPage",
});

// Define interface for ticket
interface Ticket {
  id: string;
  name: string;
  description: string;
  malePrice: number;
  femalePrice: number;
  drinkCount: number;
  validHours: number;
  validDays: number;
  status: 'active' | 'inactive';
  sort: number;
}

// State management
const state = reactive({
  tickets: [] as Ticket[],
  showTicketModal: false,
  isEditingTicket: false,
  tempTicket: {
    id: '',
    name: '',
    description: '',
    malePrice: 0,
    femalePrice: 0,
    drinkCount: 0,
    validHours: 0,
    validDays: 0,
    status: 'active' as 'active' | 'inactive',
    sort: 0
  } as Ticket,
  showDeleteTicketModal: false,
  deleteTicketId: ''
});

// Lifecycle hooks
onMounted(() => {
  console.log('Ticket Settings Page loaded');
  // Initialize with sample data or fetch from API
  state.tickets = [
    {
      id: '1',
      name: '优惠票券A',
      description: '适用于特定活动，限时优惠',
      malePrice: 50,
      femalePrice: 40,
      drinkCount: 2,
      validHours: 4,
      validDays: 30,
      status: 'active',
      sort: 1
    },
    {
      id: '2',
      name: '体验票券B',
      description: '新用户专享体验票',
      malePrice: 10,
      femalePrice: 8,
      drinkCount: 1,
      validHours: 2,
      validDays: 7,
      status: 'inactive',
      sort: 2
    }
  ];
});

// Navigation methods
const navigateBack = () => {
  uni.navigateBack();
};

// Ticket management methods
const openAddTicketModal = () => {
  state.isEditingTicket = false;
  state.tempTicket = {
    id: '',
    name: '',
    description: '',
    malePrice: 0,
    femalePrice: 0,
    drinkCount: 0,
    validHours: 0,
    validDays: 0,
    status: 'active',
    sort: 0
  };
  state.showTicketModal = true;
};

const openEditTicketModal = (id: string) => {
  const ticket = state.tickets.find(t => t.id === id);
  if (ticket) {
    state.isEditingTicket = true;
    state.tempTicket = { ...ticket };
    state.showTicketModal = true;
  }
};

const closeTicketModal = () => {
  state.showTicketModal = false;
};

const saveTicket = () => {
  if (!state.tempTicket.name) {
    uni.showToast({
      title: '请输入门票名称',
      icon: 'none'
    });
    return;
  }
  if (state.tempTicket.malePrice <= 0 || state.tempTicket.femalePrice <= 0) {
    uni.showToast({
      title: '价格必须大于0',
      icon: 'none'
    });
    return;
  }

  if (state.isEditingTicket) {
    const index = state.tickets.findIndex(t => t.id === state.tempTicket.id);
    if (index !== -1) {
      state.tickets[index] = { ...state.tempTicket };
    }
  } else {
    const newTicket = {
      ...state.tempTicket,
      id: Date.now().toString()
    };
    state.tickets.push(newTicket);
  }

  state.tickets.sort((a, b) => a.sort - b.sort);
  state.showTicketModal = false;
  uni.showToast({
    title: state.isEditingTicket ? '门票已更新' : '门票已添加',
    icon: 'success'
  });
};

const toggleTicketStatus = (id: string) => {
  const index = state.tickets.findIndex(t => t.id === id);
  if (index !== -1) {
    state.tickets[index].status = state.tickets[index].status === 'active' ? 'inactive' : 'active';
    uni.showToast({
      title: state.tickets[index].status === 'active' ? '门票已启用' : '门票已停用',
      icon: 'success'
    });
  }
};

const openDeleteTicketModal = (id: string) => {
  state.deleteTicketId = id;
  state.showDeleteTicketModal = true;
};

const closeDeleteTicketModal = () => {
  state.showDeleteTicketModal = false;
  state.deleteTicketId = '';
};

const deleteTicket = () => {
  const index = state.tickets.findIndex(t => t.id === state.deleteTicketId);
  if (index !== -1) {
    state.tickets.splice(index, 1);
  }
  state.showDeleteTicketModal = false;
  state.deleteTicketId = '';
  uni.showToast({
    title: '门票已删除',
    icon: 'success'
  });
};
</script>

<style lang="scss" scoped>
/* 容器样式 */
.container {
  padding: 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;

  .up-button{
    border:none;
  }
}

/* 玻璃卡片效果 */
.z-glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: bold;
  color: white;
}

.header-actions {
  display: flex;
  gap: 20rpx;
}

.add-btn {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 20rpx 30rpx;
  border-radius: 50rpx;
  font-size: 28rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 15rpx rgba(255, 107, 107, 0.3);
}

.add-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.3);
}

/* 门票列表 */
.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.ticket-item {
  padding: 30rpx;
  transition: all 0.3s ease;
}

.ticket-item:active {
  transform: scale(0.98);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.ticket-info {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.ticket-name {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
}

.ticket-status {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: bold;
}

.ticket-status.active {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.ticket-status.inactive {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.ticket-price {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.price-display {
  display: flex;
  align-items: baseline;
  gap: 5rpx;
}

.price-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-right: 5rpx;
}

.price-symbol {
  font-size: 28rpx;
  color: #f39c12;
  font-weight: bold;
}

.price-value {
  font-size: 48rpx;
  color: #f39c12;
  font-weight: bold;
}

.ticket-details {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  margin-bottom: 25rpx;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.detail-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  min-width: 140rpx;
}

.detail-value {
  font-size: 28rpx;
  color: white;
  font-weight: 500;
}

.ticket-actions {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  flex: 1;
  padding: 15rpx 20rpx;
  border-radius: 25rpx;
  font-size: 26rpx;
  font-weight: bold;
  border: none;
  transition: all 0.3s ease;
}

.edit-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.toggle-btn.activate {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.toggle-btn.deactivate {
  background: linear-gradient(135deg, #e67e22, #d35400);
  color: white;
}

.delete-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.action-btn:active {
  transform: translateY(2rpx);
  opacity: 0.8;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
  text-align: center;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: white;
  font-weight: bold;
  margin-bottom: 15rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
}

.modal-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
}

.modal-close {
  font-size: 48rpx;
  color: white;
  cursor: pointer;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 15rpx;
}
.switch-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
}

.switch-group label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.modal-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.modal-btn:active {
  transform: translateY(2rpx);
  opacity: 0.8;
}

/* 性别价格设置样式 */
.gender-pricing {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.price-item {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.gender-label {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.price-input-container {
  display: flex;
  align-items: center;
//   padding: 0 20rpx;
  transition: all 0.3s ease;
  position: relative;
  .price-input {
    padding-left: 40rpx!important;
    }
}

.price-input-container .price-symbol {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-right: 10rpx;
  position: absolute;
  left: 10rpx;
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

.confirm-btns .delete-btn {
  flex: 1;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 20px;
  cursor: pointer;
  font-size: 14px;
}
</style>