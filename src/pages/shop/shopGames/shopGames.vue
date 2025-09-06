<template>
  <pageWrapper>
    <!-- 顶部导航栏 -->
    <up-navbar :title="'店内游戏'" :placeholder="true" :border="true" leftIcon="" class="z-navbar">
      <template #right>
        <view class="header-right">
          <!-- <up-icon name="scan" size="22" @click="generateQRCode"></up-icon> -->
          <up-icon name="plus" size="22" color="var(--text-1)" @click="openAddModal"></up-icon>
        </view>
      </template>
    </up-navbar>
    <view class="game-list" v-if="state.games.length > 0">
      <view class="game-item" v-for="(item, index) in state.games" :key="item.id">
        <view class="game-info">
          <up-image
            class="game-icon"
            width="120rpx"
            height="120rpx"
            :src="item.icon || '/static/images/default-game.png'"
            mode="aspectFill"
          ></up-image>
          <view class="game-details">
            <view class="game-name">{{ item.name }}</view>
            <view class="game-type">{{ item.type }}</view>
            <view class="game-desc">{{ item.description }}</view>
            <view class="game-meta">
              <text class="player-count">{{ item.playerCount }}</text>
              <text class="like-rate">喜爱度: {{ item.likeRate }}</text>
            </view>
          </view>
        </view>
        <view class="game-actions">
          <view class="status" :class="{ active: item.isActive, inactive: !item.isActive }">
            <up-switch v-model="item.isActive" @change="toggleGameStatus(index)" color="#07c160"></up-switch>
            <text>{{ item.isActive ? '已启用' : '已禁用' }}</text>
          </view>
          <view class="action-btns">
            <view class="edit-btn" @click="openEditModal(index)">
              <up-icon name="edit-pen" size="36"></up-icon>
            </view>
            <view class="delete-btn" @click="openDeleteModal(index)">
              <up-icon name="trash" size="36"></up-icon>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <!-- <up-image src="/static/images/empty-games.png" mode="aspectFit"></up-image> -->
      <text>暂无游戏，点击右上角添加</text>
    </view>
  </pageWrapper>

  <!-- 添加/编辑游戏弹窗 -->
  <up-popup :show="state.showAddModal" mode="center" @close="closeAddModal">
    <view class="z-modal z-modal-lg">
      <view class="modal-header">
        <text class="modal-title">{{ state.isEdit ? '编辑游戏' : '添加游戏' }}</text>
        <view class="close-btn" @click="closeAddModal">
          <up-icon name="close" size="26"></up-icon>
        </view>
      </view>
      <scroll-view scroll-y class="scroll-content">
        <view class="modal-body">
          <view class="form-item">
            <text class="label">游戏名称</text>
            <up-input v-model="state.tempGame.name" placeholder="请输入游戏名称" border="surround"></up-input>
          </view>
          <view class="form-item">
            <text class="label">游戏类型</text>
            <up-input v-model="state.tempGame.type" placeholder="桌游、互动、技巧等" border="surround"></up-input>
          </view>
          <view class="form-item">
            <text class="label">游戏描述</text>
            <up-input
              v-model="state.tempGame.description"
              type="textarea"
              placeholder="请输入游戏描述"
              border="surround"
              height="160"
            ></up-input>
          </view>
          <view class="form-item">
            <text class="label">参与人数</text>
            <up-input v-model="state.tempGame.playerCount" placeholder="如: 2-6人" border="surround"></up-input>
          </view>
          <view class="form-item">
            <text class="label">喜爱程度</text>
            <up-input v-model="state.tempGame.likeRate" placeholder="如: 87%" border="surround"></up-input>
          </view>
          <view class="form-item">
            <text class="label">游戏图标</text>
            <view class="upload-box" @click="uploadIcon">
              <up-image
                v-if="state.tempGame.icon"
                :src="state.tempGame.icon"
                mode="aspectFill"
                width="100%"
                height="100%"
              ></up-image>
              <view class="upload-placeholder" v-else>
                <!-- <up-icon name="upload" size="50"></up-icon> -->
                <text>点击上传</text>
              </view>
            </view>
          </view>
          <view class="form-item switch-item">
            <text class="label">启用状态</text>
            <up-switch v-model="state.tempGame.isActive" color="#07c160"></up-switch>
          </view>
        </view>
      </scroll-view>
      <view class="modal-footer">
        <up-button @click="closeAddModal">取消</up-button>
        <up-button type="primary" @click="saveGame">保存</up-button>
      </view>
    </view>
  </up-popup>
</template>

<script lang="ts" setup>
import { reactive, onMounted } from 'vue';
import pageWrapper from '@/components/page/index.vue';

defineOptions({
  name: 'ShopGamesPage',
});

// 定义游戏接口
interface Game {
  id: string;
  name: string;
  type: string;
  description: string;
  playerCount: string;
  likeRate: string;
  icon: string;
  isActive: boolean;
}

// 状态管理
const state = reactive({
  games: [] as Game[],
  showAddModal: false,
  isEdit: false,
  tempGame: {
    id: '',
    name: '',
    type: '',
    description: '',
    playerCount: '',
    likeRate: '',
    icon: '',
    isActive: true,
  } as Game,
  currentGame: {
    id: '',
    name: '',
    type: '',
    description: '',
    playerCount: '',
    likeRate: '',
    icon: '',
    isActive: false,
  } as Game,
});

// 页面加载时初始化数据
onMounted(() => {
  console.log('Shop Games Page loaded');
  // 初始化示例数据或从API获取
  state.games = [
    {
      id: '1',
      name: '狼人杀',
      type: '桌游',
      description: '经典的社交推理游戏，适合多人参与，通过语言和逻辑找出隐藏的狼人。',
      playerCount: '8-18人',
      likeRate: '89%',
      icon: '/static/images/game-werewolf.jpg',
      isActive: true,
    },
    {
      id: '2',
      name: 'UNO',
      type: '卡牌',
      description: '简单有趣的卡牌游戏，适合各个年龄段，通过颜色和数字匹配出牌。',
      playerCount: '2-10人',
      likeRate: '92%',
      icon: '/static/images/game-uno.jpg',
      isActive: true,
    },
    {
      id: '3',
      name: '三国杀',
      type: '桌游',
      description: '以三国为背景的策略卡牌游戏，玩家扮演不同角色，通过技能和策略获胜。',
      playerCount: '2-10人',
      likeRate: '85%',
      icon: '/static/images/game-sanguo.jpg',
      isActive: false,
    },
  ];
});

// 打开添加模态框
const openAddModal = () => {
  state.isEdit = false;
  state.tempGame = {
    id: '',
    name: '',
    type: '',
    description: '',
    playerCount: '',
    likeRate: '',
    icon: '',
    isActive: true,
  };
  state.showAddModal = true;
};

// 打开编辑模态框
const openEditModal = (index: number) => {
  const game = state.games[index];
  state.isEdit = true;
  state.tempGame = { ...game };
  state.showAddModal = true;
};

// 关闭添加模态框
const closeAddModal = () => {
  state.showAddModal = false;
};

// 保存游戏
const saveGame = () => {
  if (!state.tempGame.name) {
    uni.showToast({
      title: '请输入游戏名称',
      icon: 'none',
    });
    return;
  }

  if (state.isEdit) {
    const index = state.games.findIndex(g => g.id === state.tempGame.id);
    if (index !== -1) {
      state.games[index] = { ...state.tempGame };
    }
  } else {
    state.games.push({
      ...state.tempGame,
      id: Date.now().toString(),
    });
  }

  state.showAddModal = false;
  uni.showToast({
    title: state.isEdit ? '游戏已更新' : '游戏已添加',
    icon: 'success',
  });
};

// 切换游戏状态
const toggleGameStatus = (index: number) => {
  const game = state.games[index];
  game.isActive = !game.isActive;
  uni.showToast({
    title: game.isActive ? '游戏已启用' : '游戏已禁用',
    icon: 'success',
  });
};

// 打开删除模态框
const openDeleteModal = (index: number) => {
  state.currentGame = { ...state.games[index] };
  state.showDeleteModal = true;

  uni.showModal({
    title: '提示',
    content: `确定要删除"${state.currentGame.name}"吗？删除后无法恢复。`,
    confirmText: '删除',
    cancelText: '取消',
    confirmColor: '#f76560',
    success: res => {
      if (res.confirm) {
        deleteGame();
      }
    },
  });
};

// 删除游戏
const deleteGame = () => {
  const index = state.games.findIndex(g => g.id === state.currentGame.id);
  if (index !== -1) {
    state.games.splice(index, 1);
  }
  uni.showToast({
    title: '游戏已删除',
    icon: 'success',
  });
};

// 上传图标
const uploadIcon = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: res => {
      const tempFilePaths = res.tempFilePaths;
      state.tempGame.icon = tempFilePaths[0];
      uni.showToast({
        title: '图标上传成功',
        icon: 'success',
      });
    },
    fail: err => {
      uni.showToast({
        title: '上传失败: ' + err.errMsg,
        icon: 'none',
      });
    },
  });
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';
.container {
  padding: 0 30rpx;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100rpx;
  padding: 0 10rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
}

.add-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

/* 游戏列表样式 */
.game-list {
  margin-top: 20rpx;
}

.modal-body {
  // max-height: 600rpx;
}
.game-item {
  margin-bottom: 30rpx;
  background-color: var(--bg-2);
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  padding: 30rpx;
}

.game-info {
  display: flex;
  margin-bottom: 20rpx;
}

.game-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background-color: var(--bg-2);
}

.game-details {
  margin-left: 20rpx;
  flex: 1;
}

.game-name {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 6rpx;
}

.game-type {
  font-size: 26rpx;
  color: var(--text-2);
  margin-bottom: 10rpx;
  background-color: var(--bg-2);
  display: inline-block;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.game-desc {
  font-size: 26rpx;
  color: var(--text-2);
  margin-bottom: 10rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-meta {
  display: flex;
  font-size: 24rpx;
  color: var(--text-3);
}

.player-count {
  margin-right: 20rpx;
}

.game-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1rpx solid var(--border-1);
  padding-top: 20rpx;
}

.status {
  display: flex;
  align-items: center;
  font-size: 26rpx;
}

.status.active text {
  color: #07c160;
}

.status.inactive text {
  color: var(--text-3);
}

::v-deep .action-btns {
  display: flex;
  .edit-btn,
  .delete-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 20rpx;
  }

  .edit-btn {
    .u-icon__icon {
      color: var(--primary-6) !important;
    }
  }

  .delete-btn {
    .u-icon__icon {
      color: var(--danger-6) !important;
    }
  }
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 200rpx;
}

.empty-state up-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.empty-state text {
  font-size: 28rpx;
  color: var(--text-3);
}

/* 弹窗样式 */
.form-item {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: var(--text-1);
  margin-bottom: 10rpx;
}

up-input,
up-input[type='textarea'] {
  width: 100%;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

up-input[type='textarea'] {
  height: 160rpx;
}

.upload-box {
  width: 200rpx;
  height: 200rpx;
  border: 1rpx dashed #ddd;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-box up-image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
  font-size: 24rpx;
}

.upload-placeholder up-icon {
  font-size: 40rpx;
  margin-bottom: 10rpx;
}

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 确认弹窗 */
.confirm-modal {
  width: 600rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.confirm-title {
  font-size: 34rpx;
  font-weight: 600;
  padding: 30rpx;
  text-align: center;
  border-bottom: 1rpx solid #f0f0f0;
}

.confirm-content {
  padding: 40rpx 30rpx;
  font-size: 30rpx;
  color: var(--text-1);
  text-align: center;
}

.confirm-btns {
  display: flex;
  border-top: 1rpx solid #f0f0f0;
}

.confirm-btns up-button {
  flex: 1;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  font-size: 32rpx;
  border-radius: 0;
  margin: 0;
}

.confirm-btn {
  background-color: #e64340;
  color: #fff;
}
</style>
