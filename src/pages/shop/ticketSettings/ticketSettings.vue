<template>
  <pageWrapper>
    <!-- 页面标题 -->
    <view class="z-page-header z-glass-card">
      <text class="page-title">门票设置</text>
      <up-button type="gradient1" @click="openAddTicketModal">新增门票</up-button>
    </view>
    <view class="container">
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
                <text class="price-symbol z-price">¥</text>
                <text class="price-value z-price">{{ ticket.malePrice }}</text>
              </view>
              <view class="price-display">
                <text class="price-label">女性:</text>
                <text class="price-symbol z-price">¥</text>
                <text class="price-value z-price">{{ ticket.femalePrice }}</text>
              </view>
            </view>
          </view>

          <view class="ticket-details">
            <view class="detail-item">
              <text class="detail-label">包含酒水：</text>
              <text class="detail-value">{{ ticket.drinkCount }}杯</text>
            </view>
            <!-- <view class="detail-item">
							<text class="detail-label">使用时间：</text>
							<text class="detail-value">{{ ticket.validHours }}小时</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">有效期：</text>
							<text class="detail-value">{{ ticket.validDays }}天</text>
						</view> -->
          </view>

          <view class="ticket-actions">
            <up-button
              shape="circle"
              size="small"
              type="primary"
              class="action-btn main-btn"
              @click="openEditTicketModal(ticket.id)"
            >
              编辑
            </up-button>
            <up-button
              shape="circle"
              size="small"
              type="gradient2"
              class="action-btn main-btn"
              :class="[ticket.status === 'active' ? 'deactivate' : 'activate']"
              @click="toggleTicketStatus(ticket.id)"
            >
              {{ ticket.status === 'active' ? '停用' : '启用' }}
            </up-button>
            <up-button
              shape="circle"
              size="small"
              type="error"
              class="action-btn main-btn"
              @click="openDeleteTicketModal(ticket.id)"
            >
              删除
            </up-button>
          </view>
        </view>

        <!-- 空状态 -->
        <emptyData
          height="80%"
          class="empty-state"
          text="暂无门票设置"
          subtext="点击上方新增门票开始设置"
          v-if="state.tickets.length === 0"
        ></emptyData>
      </view>

      <!-- 添加/编辑门票模态框 -->
      <up-popup :show="state.showTicketModal" mode="center" @close="closeTicketModal">
        <view class="z-modal-lg z-modal">
          <view class="modal-header">
            <text class="modal-title">{{ state.isEditingTicket ? '编辑门票' : '新增门票' }}</text>
            <view class="close-btn" @click="closeTicketModal">×</view>
          </view>

          <scroll-view scroll-y="true">
            <view class="modal-body">
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
                      <up-input
                        class="form-input price-input"
                        type="digit"
                        v-model.number="state.tempTicket.malePrice"
                        placeholder="请输入男性价格"
                      ></up-input>
                    </view>
                  </view>
                  <view class="price-item">
                    <text class="gender-label">女性价格</text>
                    <view class="price-input-container">
                      <text class="price-symbol">¥</text>
                      <up-input
                        class="form-input price-input"
                        type="digit"
                        v-model.number="state.tempTicket.femalePrice"
                        placeholder="请输入女性价格"
                      ></up-input>
                    </view>
                  </view>
                </view>
              </view>

              <view class="form-group">
                <label class="form-label">包含酒水数量</label>
                <up-input
                  class="form-input"
                  type="number"
                  v-model.number="state.tempTicket.drinkCount"
                  placeholder="请输入酒水数量"
                ></up-input>
              </view>

              <!-- <view class="form-group">
								<label class="form-label">使用时间（小时）</label>
								<up-input
									class="form-input"
									type="number"
									v-model.number="state.tempTicket.validHours"
									placeholder="请输入使用时间"
								></up-input>
							</view>

							<view class="form-group">
								<label class="form-label">有效期（天）</label>
								<up-input
									class="form-input"
									type="number"
									v-model.number="state.tempTicket.validDays"
									placeholder="请输入有效期"
								></up-input>
							</view> -->

              <view class="form-group">
                <label class="form-label">畅饮酒水</label>
                <up-button shape="circle" type="gradient2" class="add-btn main-btn" @click="openDrinkModal">
                  编辑畅饮酒水
                </up-button>
                <view
                  v-if="state.tempTicket.selectedDrinks && state.tempTicket.selectedDrinks.length"
                  style="margin-top: 16rpx"
                >
                  <text style="color: var(--text-2); font-size: 26rpx">
                    已选：
                    <text v-for="(d, idx) in state.tempTicket.selectedDrinks" :key="d.drinkId">
                      {{ d.name }}×{{ d.quantity }}
                      <text v-if="idx < state.tempTicket.selectedDrinks.length - 1">、</text>
                    </text>
                  </text>
                </view>
              </view>
              <view class="form-group">
                <label class="form-label">门票描述</label>
                <up-textarea
                  class="form-textarea"
                  v-model="state.tempTicket.description"
                  placeholder="请输入门票描述"
                  height="120"
                ></up-textarea>
              </view>

              <view class="form-group switch-group">
                <label>启用状态</label>
                <up-switch
                  v-model="state.tempTicket.status"
                  true-value="active"
                  false-value="inactive"
                  color="#1989fa"
                ></up-switch>
              </view>
            </view>
          </scroll-view>

          <view class="modal-footer">
            <up-button type="cancel" class="modal-btn" @click="closeTicketModal">取消</up-button>
            <up-button type="gradient1" class="modal-btn main-btn" @click="saveTicket">保存</up-button>
          </view>
        </view>
      </up-popup>

      <!-- 畅饮酒水选择弹窗 -->
      <up-popup :show="state.showDrinkModal" mode="bottom" round="30" @close="closeDrinkModal">
        <view class="z-modal z-modal-round">
          <view class="modal-header">
            <text class="modal-title">选择畅饮酒水</text>
            <view class="close-btn" @click="closeDrinkModal">×</view>
          </view>
          <view class="modal-body">
            <view class="z-tips">DIY饮品在最上方；可按细分查看常规酒水，点击+/-或直接编辑数量</view>
            <!-- DIY饮品置顶 -->
            <view class="drink-diy">
              <view class="drink-item__main">
                <text class="drink-item__name">DIY饮品数量</text>
                <text class="drink-item__tag">自定义</text>
              </view>
              <view class="drink-item__actions">
                <up-number-box
                  v-model="state.drinkQuantities.DIY"
                  :min="0"
                  integer
                  @change="onCartItemQtyChange($event, state.drinkQuantities, 0)"
                />
              </view>
            </view>

            <!-- 搜索与分类 -->
            <view class="drink-toolbar">
              <up-input
                v-model.trim="state.drinkSearch"
                placeholder="搜索酒水名称"
                clearable
                @confirm="onDrinkInput"
                @clear="onDrinkInput"
              ></up-input>
              <scroll-view scroll-x="true" class="drink-cats">
                <view
                  v-for="cat in state.drinkCategories"
                  :key="cat"
                  class="drink-cat"
                  :class="{ active: cat === state.activeCategory }"
                  @click="setActiveCategory(cat)"
                >
                  {{ cat }}
                </view>
              </scroll-view>
            </view>

            <!-- 酒水列表 -->
            <scroll-view scroll-y="true" class="drink-list">
              <view v-for="drink in state.filteredDrinks" :key="drink.id" class="drink-item">
                <view class="drink-item__main">
                  <text class="drink-item__name">{{ drink.name }}</text>
                  <text class="drink-item__tag">{{ drink.category }}</text>
                </view>
                <view class="drink-item__actions">
                  <up-number-box
                    v-model="drink.quantity"
                    :min="0"
                    integer
                    @change="onCartItemQtyChange($event, drink)"
                  />
                </view>
              </view>
            </scroll-view>
          </view>
          <view class="modal-footer">
            <up-button type="info" class="modal-btn" @click="closeDrinkModal">取消</up-button>
            <up-button type="gradient1" class="modal-btn main-btn" @click="confirmDrinkSelection">确定</up-button>
          </view>
        </view>
      </up-popup>
    </view>
  </pageWrapper>
</template>

<script lang="ts" setup>
import { reactive, onMounted, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
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
  // 已选畅饮酒水
  selectedDrinks?: Array<{
    drinkId: string;
    name: string;
    quantity: number;
    isDIY?: boolean;
    category?: string;
  }>;
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
    sort: 0,
    selectedDrinks: [],
  } as Ticket,
  deleteTicketId: '',
  // 畅饮酒水弹窗状态与数据
  showDrinkModal: false,
  drinkSearch: '',
  drinkCategories: ['全部', '啤酒', '洋酒', '红酒', '鸡尾酒', '软饮'],
  activeCategory: '全部',
  drinks: [
    { id: 'beer_1', name: '生啤', category: '啤酒' },
    { id: 'beer_2', name: '黑啤', category: '啤酒' },
    { id: 'spirit_1', name: '伏特加', category: '洋酒' },
    { id: 'spirit_2', name: '威士忌', category: '洋酒' },
    { id: 'wine_1', name: '干红', category: '红酒' },
    { id: 'cocktail_1', name: '莫吉托', category: '鸡尾酒' },
    { id: 'soft_1', name: '可乐', category: '软饮' },
    { id: 'soft_2', name: '雪碧', category: '软饮' },
  ],
  // 数量映射（含DIY）
  drinkQuantities: { DIY: 0 } as Record<string, number>,

  filteredDrinks: [],
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
      sort: 1,
      selectedDrinks: [],
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
      sort: 2,
      selectedDrinks: [],
    },
  ];
  state.filteredDrinks = [...state.drinks];
});

const onDrinkInput = () => {
  const keyword = state.drinkSearch?.trim() || '';
  const isAll = state.activeCategory === '全部';
  state.filteredDrinks = state.drinks.filter(d => {
    const matchCat = isAll ? true : d.category === state.activeCategory;
    const matchKey = keyword ? d.name.includes(keyword) : true;
    return matchCat && matchKey;
  });
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
    sort: 0,
    selectedDrinks: [],
  };
  state.showTicketModal = true;
};

const openEditTicketModal = (id: string) => {
  const ticket = state.tickets.find(t => t.id === id);
  if (ticket) {
    state.isEditingTicket = true;
    state.tempTicket = {
      ...ticket,
      selectedDrinks: ticket.selectedDrinks || [],
    };
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
      icon: 'none',
    });
    return;
  }
  if (state.tempTicket.malePrice <= 0 || state.tempTicket.femalePrice <= 0) {
    uni.showToast({
      title: '价格必须大于0',
      icon: 'none',
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
      id: Date.now().toString(),
    };
    state.tickets.push(newTicket);
  }

  state.tickets.sort((a, b) => a.sort - b.sort);
  state.showTicketModal = false;
  uni.showToast({
    title: state.isEditingTicket ? '门票已更新' : '门票已添加',
    icon: 'success',
  });
};

const toggleTicketStatus = (id: string) => {
  const index = state.tickets.findIndex(t => t.id === id);
  if (index !== -1) {
    state.tickets[index].status = state.tickets[index].status === 'active' ? 'inactive' : 'active';
    uni.showToast({
      title: state.tickets[index].status === 'active' ? '门票已启用' : '门票已停用',
      icon: 'success',
    });
  }
};

const openDeleteTicketModal = (id: string) => {
  uni.showModal({
    title: '确认删除',
    content: '您确定要删除此票券吗？此操作无法撤销。',
    success: res => {
      if (res.confirm) {
        deleteTicket();
      }
    },
  });
};

const deleteTicket = () => {
  const index = state.tickets.findIndex(t => t.id === state.deleteTicketId);
  if (index !== -1) {
    state.tickets.splice(index, 1);
  }
  state.deleteTicketId = '';
  uni.showToast({
    title: '门票已删除',
    icon: 'success',
  });
};

// 畅饮酒水弹窗相关逻辑
const openDrinkModal = () => {
  // 将已选酒水数量回填到映射
  state.drinkQuantities = { DIY: 0 };
  (state.tempTicket.selectedDrinks || []).forEach(d => {
    state.drinkQuantities[d.isDIY ? 'DIY' : d.drinkId] = d.quantity;
  });
  state.showDrinkModal = true;
};

const onCartItemQtyChange = (qty: number, ci: any, cidx: number) => {
  // / 保存修改前的数量，用于回滚
  const originalQty = ci.quantity;
  // qty.value
  try {
  } catch (error) {
    // 回滚数量到修改前的值
    ci.quantity = originalQty;
  }
};

const closeDrinkModal = () => {
  state.showDrinkModal = false;
};

const setActiveCategory = (cat: string) => {
  state.activeCategory = cat;
};

const confirmDrinkSelection = () => {
  const selected: Ticket['selectedDrinks'] = [];
  const diyQty = state.drinkQuantities.DIY || 0;
  if (diyQty > 0) {
    selected.push({
      drinkId: 'DIY',
      name: 'DIY饮品',
      quantity: diyQty,
      isDIY: true,
      category: 'DIY',
    });
  }
  state.drinks.forEach(d => {
    const q = state.drinkQuantities[d.id] || 0;
    if (q > 0)
      selected.push({
        drinkId: d.id,
        name: d.name,
        quantity: q,
        category: d.category,
      });
  });
  state.tempTicket.selectedDrinks = selected;
  state.tempTicket.drinkCount = selected.reduce((sum, i) => sum + i.quantity, 0);
  state.showDrinkModal = false;
  uni.showToast({ title: '已更新畅饮酒水', icon: 'success' });
};

defineOptions({
  options: {
    styleIsolation: 'shared',
  },
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';
/* 容器样式 */
.container {
  padding: $up-box-pd;

  :deep(.main-btn) {
    border: none;
    color: #fff !important;
  }
}

.add-btn {
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
  padding: $up-box-pd;
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
  color: var(--text-1);
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
  align-items: center;
  gap: 5rpx;
}

.price-label {
  font-size: 24rpx;
  color: var(--text-2);
  margin-right: 5rpx;
}

.price-symbol {
  font-size: 32rpx;
}

.price-value {
  font-size: 42rpx;
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
  color: var(--text-2);
}

.detail-value {
  font-size: 28rpx;
  color: var(--text-1);
  font-weight: 500;
}

.action-btn {
  border: none;
  transition: all 0.3s ease;
}
.action-btn:active {
  transform: translateY(2rpx);
  opacity: 0.8;
}
.ticket-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16rpx;
  margin: 0;
  width: 100%;
  :deep(.u-button) {
    margin: 0;
    width: 70rpx;
  }
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--text-1);
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: var(--text-1);
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
  color: var(--text-1);
  font-weight: bold;
}

.modal-btn {
  flex: 1;
  font-weight: bold;
  border: none;
  transition: all 0.3s ease;
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
  color: var(--text-1);
  font-weight: 500;
}

.price-input-container {
  display: flex;
  align-items: center;
  //   padding: 0 20rpx;
  transition: all 0.3s ease;
  position: relative;
  .price-input {
    padding-left: 40rpx !important;
  }
}

.price-input-container .price-symbol {
  font-size: 28rpx;
  color: var(--text-1);
  font-weight: bold;
  margin-right: 10rpx;
  position: absolute;
  left: 10rpx;
}

.drink-diy {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 20rpx;
  background: var(--bg-1);
  border-radius: $up-box-radius-1;
}
.drink-toolbar {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 16rpx;
}
.drink-cats {
  white-space: nowrap;
  width: 100%;
  padding: 8rpx 0 0 0;
}
.drink-cat {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx 20rpx;
  margin-right: 12rpx;
  border-radius: 30rpx;
  background: var(--bg-1);
  color: var(--text-2);
  font-size: 24rpx;
}
.drink-cat.active {
  // background: var(--btn-gradient-1);
  background: var(--primary-6);
  color: #fff;
}
.drink-list {
  max-height: 40vh;
  padding-bottom: 20rpx;
}
.drink-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  margin-bottom: 16rpx;
  background: var(--bg-1);
  border-radius: $up-box-radius-1;
}
.drink-item__main {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.drink-item__name {
  font-size: 28rpx;
  color: var(--text-1);
  font-weight: 600;
}
.drink-item__tag {
  font-size: 22rpx;
  color: var(--text-3);
}
.drink-item__actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
</style>
