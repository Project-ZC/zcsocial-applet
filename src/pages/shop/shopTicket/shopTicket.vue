<template>
  <view class="z-page-header z-glass-card">
    <text class="page-title">店铺门票</text>
    <up-button type="primary" @click="generateTicketModal">生成门票</up-button>
  </view>
  <ShopTicketHolderPage :isShop="true" ref="shopTicketHolderRef">
    <template #userInfo="{ item }">
      <!-- 用户信息 -->
      <view class="user-info">
        <view class="user-avatar">
          <up-image :src="item.userAvatar" width="100rpx" height="100rpx" radius="50%" />
        </view>
        <view class="user-details">
          <text class="user-nickname">{{ item.userNickname }}</text>
          <text class="user-id">玩点ID: {{ item.userId }}</text>
        </view>
      </view>
    </template>
  </ShopTicketHolderPage>
  <!-- 生成门票弹窗 -->
  <up-popup
    :show="state.showGenerateTicketModal"
    mode="center"
    :closeOnClickOverlay="true"
    @close="closeGenerateTicketModal"
  >
    <view class="z-modal z-modal-lg">
      <view class="modal-header">
        <text class="modal-title">生成门票</text>
        <up-icon name="close" color="#999" size="20" @click="closeGenerateTicketModal"></up-icon>
      </view>
      <scroll-view scroll-y>
        <view class="modal-body">
          <!-- 用户搜索 -->
          <view class="search-section">
            <text class="section-title">搜索用户</text>
            <view class="search-methods">
              <!-- 手动输入方式 -->
              <view class="input-method">
                <text class="method-title">手动输入</text>
                <view class="search-input-container">
                  <up-input v-model="state.searchUserId" placeholder="请输入玩点ID" @confirm="searchUser" />
                  <view class="search-btn">
                    <up-button type="primary" @click="searchUser">搜索</up-button>
                  </view>
                </view>
              </view>

              <!-- 扫码方式 -->
              <view class="scan-method">
                <text class="method-title">扫码识别</text>
                <view class="scan-btn" @click="scanQRCode">
                  <up-icon name="scan" color="#666" size="20"></up-icon>
                  <text class="scan-text">扫一扫 自动填入</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 搜索结果 -->
          <view class="search-result" v-if="state.searchedUser">
            <text class="result-title">搜索结果</text>
            <view class="user-info-card">
              <up-avatar :src="getDownloadUrl(state.searchedUser.avatar)" size="80rpx"></up-avatar>
              <view class="user-details">
                <text class="user-nickname">{{ state.searchedUser.nickname }}</text>
                <text class="user-wandianid">玩点ID: {{ state.searchedUser.wandianId }}</text>
                <text class="user-gender">性别: {{ state.searchedUser.gender }}</text>
              </view>
              <up-button type="primary" size="small" @click="selectUser">选择</up-button>
            </view>
          </view>

          <!-- 门票选择 -->
          <view class="ticket-selection">
            <text class="section-title">选择门票类型 ({{ state.shopTicketSettings.length }}个)</text>
            <view class="ticket-cards">
              <view
                class="ticket-card"
                :class="{ selected: state.selectedTicketType === item.id }"
                v-for="item in state.shopTicketSettings"
                :key="item.id"
                @click="selectTicketType(item.id)"
              >
                <view class="ticket-header">
                  <view class="ticket-name-container">
                    <text class="ticket-name">{{ item.name }}</text>
                    <text class="price-type-badge" :class="item.priceType">
                      {{ item.priceType === 'universal' ? '通用' : item.priceType === 'male' ? '男生' : '女生' }}
                    </text>
                  </view>
                </view>
                <view class="ticket-details">
                  <text class="detail-item">包含{{ item.drinkCount }}杯酒水</text>
                  <text class="detail-item">使用{{ item.validHours }}小时</text>
                </view>
                <view class="ticket-price">
                  <text class="price-value">¥{{ item.price }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="modal-footer">
        <up-button type="cancel" shape="circle" @click="closeGenerateTicketModal">取消</up-button>
        <up-button
          type="primary"
          shape="circle"
          @click="generateTicket"
          :disabled="!state.selectedUser || !state.selectedTicketType"
        >
          发送
        </up-button>
      </view>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import ShopTicketHolderPage from '@/pages/my/ticketholder/ticketholder.vue';

const shopTicketHolderRef = ref<any>(null);

const state = reactive({
  showGenerateTicketModal: false,
  searchUserId: '',
  searchedUser: null as any,
  selectedUser: null as any,
  selectedTicketType: '',
  // 店铺门票设置
  shopTicketSettings: [] as any[],
});

const selectTicketType = (id: string) => {
  state.selectedTicketType = id;
};
const closeGenerateTicketModal = () => {
  state.showGenerateTicketModal = false;
};

// 搜索、选择、生成（简化）
const searchUser = () => {
  const mockUsers = [
    {
      id: '10001',
      nickname: '小王',
      wandianId: '1029384756',
      gender: '男',
      avatar: '/static/images/avatar1.png',
    },
    {
      id: '10002',
      nickname: '小李',
      wandianId: '5647382910',
      gender: '女',
      avatar: '/static/images/avatar2.png',
    },
  ];
  const found = mockUsers.find(u => u.wandianId === (state.searchUserId || '').trim());
  state.searchedUser = found || null;
  uni.showToast({
    title: found ? '找到用户' : '未找到用户',
    icon: found ? 'success' : 'none',
  });
};

const scanQRCode = () => {
  uni.scanCode({
    success: res => {
      state.searchUserId = res.result;
      searchUser();
    },
  });
};
const generateTicketModal = () => {
  state.showGenerateTicketModal = true;
};

const selectUser = () => {
  state.selectedUser = state.searchedUser;
  uni.showToast({ title: '已选择用户', icon: 'success' });
};
const generateTicket = () => {
  if (!state.selectedUser || !state.selectedTicketType) return;
  const t = state.shopTicketSettings.find((x: any) => x.id === state.selectedTicketType);
  if (!t) return;
  const now = new Date();
  const expiry = new Date(now.getTime() + Number(t.validDays || 0) * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(
      d.getHours()
    ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const newTicket = {
    id: String(Date.now()),
    ticketName: t.name,
    purchaseTime: fmt(now),
    status: 'verified',
    statusText: '已校核',
    shopLogo: '/static/images/avatar1.png',
    shopName: '醉美酒吧',
    shopAddress: '北京市朝阳区三里屯街道',
    ticketType: t.priceType === 'male' ? '男性票' : t.priceType === 'female' ? '女性票' : '通用票',
    quantity: 1,
    validPeriod: `${fmt(now)} 至 ${fmt(expiry)}`,
    validityDays: t.validDays,
    expiryDate: fmt(expiry),
    duration: `${t.validHours}小时`,
    drinkCount: t.drinkCount,
    price: t.price,
    userAvatar: state.selectedUser.avatar,
    userNickname: state.selectedUser.nickname,
    userId: state.selectedUser.wandianId,
    joinTime: fmt(now),
    usedTime: fmt(now),
    description: '商家赠送门票',
    isGenerated: true,
  };
  state.allTickets = [newTicket, ...state.allTickets];
  state.showGenerateTicketModal = false;
  state.searchUserId = '';
  state.searchedUser = null;
  state.selectedUser = null;
  state.selectedTicketType = '';
  filterTickets();
  uni.showToast({ title: '门票生成成功', icon: 'success' });
};
// 加载店铺门票设置（使用原模拟数据）
const loadShopTicketSettings = () => {
  state.shopTicketSettings = [
    {
      id: '1',
      name: '周中门票',
      priceType: 'universal',
      price: '88',
      drinkCount: '3',
      validHours: '4',
      validDays: '7',
      description: '包含3杯酒水，4小时内使用，有效期7天',
      status: 'active',
    },
    {
      id: '2',
      name: '周末门票',
      priceType: 'male',
      price: '128',
      drinkCount: '5',
      validHours: '6',
      validDays: '15',
      description: '包含5杯酒水，6小时内使用，有效期15天',
      status: 'active',
    },
    {
      id: '3',
      name: '周末门票',
      priceType: 'female',
      price: '108',
      drinkCount: '5',
      validHours: '6',
      validDays: '15',
      description: '包含5杯酒水，6小时内使用，有效期15天',
      status: 'active',
    },
    {
      id: '4',
      name: '补票门票',
      priceType: 'universal',
      price: '68',
      drinkCount: '2',
      validHours: '3',
      validDays: '5',
      description: '包含2杯酒水，3小时内使用，有效期5天',
      status: 'active',
    },
  ];

  shopTicketHolderRef.value?.init();
};

onLoad(() => {
  loadShopTicketSettings();
});

defineOptions({
  options: {
    styleIsolation: 'shared',
  },
});
</script>

<style scoped lang="scss">
@import '@/uni.scss';
.user-info {
  display: flex;
  align-items: center;
  // margin-bottom: $up-box-mg;
  padding: 20rpx 0;
  // background: var(--bg-2);
  border-radius: $up-box-radius-1;
  .user-avatar {
    margin-right: 16rpx;
  }
  .user-nickname {
    display: block;
    font-size: 26rpx;
    font-weight: 600;
    color: var(--text-1);
    margin-bottom: 6rpx;
  }
  .user-id {
    display: block;
    font-size: 22rpx;
    color: var(--text-3);
  }
}
// 弹窗样式
.search-section {
  margin-bottom: 40rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: var(--text-1);
    margin-bottom: 20rpx;
    display: block;
  }

  .search-methods {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
  }

  .input-method {
    .method-title {
      font-size: 26rpx;
      color: var(--text-2);
      margin-bottom: 16rpx;
      display: block;
    }

    .search-input-container {
      display: flex;
      gap: 20rpx;
      align-items: center;
      :deep(.search-btn) {
        width: 120rpx;
      }
    }
  }

  .scan-method {
    .method-title {
      font-size: 26rpx;
      color: var(--text-2);
      margin-bottom: 16rpx;
      display: block;
    }

    .scan-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20rpx;
      background: var(--bg-2);
      border-radius: 12rpx;
      border: 2rpx dashed var(--border-2);

      .scan-text {
        margin-left: 10rpx;
        font-size: 26rpx;
        color: var(--text-2);
      }
    }
  }
}

.search-result {
  margin-bottom: 40rpx;

  .result-title {
    font-size: 28rpx;
    font-weight: bold;
    color: var(--text-1);
    margin-bottom: 20rpx;
    display: block;
  }

  .user-info-card {
    display: flex;
    align-items: center;
    padding: 20rpx;
    background: var(--bg-2);
    border-radius: $up-box-radius-1;
    border: 1px solid var(--border-2);

    .user-details {
      flex: 1;
      margin-left: 20rpx;

      .user-nickname {
        display: block;
        font-size: 28rpx;
        font-weight: bold;
        color: var(--text-1);
        margin-bottom: 8rpx;
      }

      .user-wandianid,
      .user-gender {
        display: block;
        font-size: 24rpx;
        color: var(--text-3);
        margin-bottom: 4rpx;
      }
    }
  }
}

.ticket-selection {
  .section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: var(--text-1);
    margin-bottom: 20rpx;
    display: block;
  }

  .ticket-cards {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    padding-bottom: $up-box-pd;
  }

  .ticket-card {
    padding: 20rpx;
    background: var(--bg-2);
    border-radius: $up-box-radius-1;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;

    &.selected {
      border-color: var(--primary-6);
      background: var(--primary-1);
    }

    .ticket-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .ticket-name-container {
        display: flex;
        align-items: center;
        gap: 12rpx;
      }

      .ticket-name {
        font-size: 28rpx;
        font-weight: bold;
        color: var(--text-1);
      }

      .price-type-badge {
        padding: 4rpx 12rpx;
        border-radius: $up-box-radius-1;
        font-size: 20rpx;
        color: #fff;

        &.universal {
          background: var(--success-6);
        }

        &.male {
          background: var(--primary-6);
        }

        &.female {
          background: var(--danger-6);
        }
      }
    }

    .ticket-details {
      display: flex;
      gap: 12rpx;
      margin-bottom: 16rpx;

      .detail-item {
        background: var(--primary-5);
        color: #fff;
        padding: 6rpx 12rpx;
        border-radius: $up-box-radius-1;
        font-size: 20rpx;
      }
    }

    .ticket-price {
      display: flex;
      justify-content: flex-end;

      .price-value {
        font-size: 32rpx;
        font-weight: bold;
        color: var(--primary-6);
      }
    }
  }
}
</style>
