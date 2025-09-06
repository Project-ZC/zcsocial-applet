<template>
  <pageWrapper :showFooter="true" :footerH="150" v-if="state.showShop">
    <view class="container">
      <!-- 店铺顶部信息 -->
      <view class="shop-header z-glass-card">
        <view class="shop-logo">
          <up-image
            width="160rpx"
            height="160rpx"
            :src="getDownloadUrl(state.shopInfo.logo)"
            @click="previewImage({ urls: [getDownloadUrl(state.shopInfo.logo)] })"
          ></up-image>
        </view>
        <view class="shop-base-info">
          <text class="shop-name text-bold">{{ state.shopInfo.name }}</text>
          <view class="shop-owner flex-row align-center">
            <up-image class="owner-avatar" :src="state.shopInfo.ownerAvatar" width="40" height="40"></up-image>
            <text class="owner-name">店长: {{ state.shopInfo.ownerName }}</text>
          </view>
          <view class="shop-time flex-row align-center">
            <text class="time-icon">⏱️</text>
            <text>营业时间: {{ state.shopInfo.openTime }}-{{ state.shopInfo.closeTime }}</text>
          </view>
          <view class="shop-location flex-row align-center">
            <text class="location-icon">📍</text>
            <text class="ovflow2">{{ state.shopInfo.address }}</text>
          </view>
        </view>
      </view>

      <!-- 店铺标签 -->
      <view class="shop-tags z-glass-card">
        <view class="section-title">
          <text class="title-text">店铺标签</text>
        </view>
        <view class="tags-container flex-row">
          <!-- <text class="tag" v-for="(tag, index) in state.shopInfo.tags" :key="index">{{ tag }}</text> -->
          <up-tag
            size="mini"
            class="tag"
            type="primary"
            plain
            plainFill
            :text="tag"
            v-for="(tag, index) in state.shopInfo.tags"
            :key="index"
          ></up-tag>
        </view>
      </view>

      <!-- 店铺费用 -->
      <view class="shop-fee z-glass-card">
        <view class="section-title">
          <text class="title-text">费用标准</text>
        </view>
        <view class="fee-list">
          <view class="fee-item flex-row space-between" v-for="(fee, index) in state.shopInfo.fees" :key="index">
            <text class="fee-name">{{ fee.name }}</text>
            <text class="fee-value">{{ fee.value }}</text>
          </view>
        </view>
      </view>

      <!-- 店铺相册 -->
      <view class="shop-album z-glass-card">
        <view class="section-title flex-row space-between">
          <text class="title-text">店铺相册</text>
          <text class="upload-text" v-if="state.isOwner" @click="uploadAlbum">上传照片</text>
        </view>
        <scroll-view scroll-x class="album-scroll">
          <view class="album-container flex-row">
            <view
              class="album-item"
              v-for="(img, index) in state.shopInfo.photo"
              :key="index"
              @click="
                previewImage({
                  urls: state.shopInfo.photo.map(item => getDownloadUrl(item)),
                  current: index,
                })
              "
            >
              <image :src="getDownloadUrl(img)" mode="aspectFill"></image>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 特邀嘉宾和工作人员 -->
      <view class="shop-staff z-glass-card">
        <view class="section-title">
          <text class="title-text">特邀嘉宾和工作人员</text>
        </view>
        <scroll-view scroll-x class="staff-scroll">
          <view class="staff-container flex-row">
            <view class="staff-item" v-for="(staff, index) in state.shopInfo.staffs" :key="index">
              <image class="staff-avatar" :src="getDownloadUrl(staff.avatar)" mode="aspectFill"></image>
              <text class="staff-name">{{ staff.name }}</text>
              <text class="staff-role">{{ staff.role }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
    <!-- 底部按钮 -->
    <template #footer>
      <view class="bottom-buttons">
        <view class="button-row flex-row space-between">
          <view class="button-item flex-column align-center" @click="goToDrinkMenu">
            <text class="menu-icon">🍹</text>
            <text class="button-text">店铺点单</text>
          </view>
          <view class="button-item flex-column align-center" @click="goToShopGame">
            <text class="game-icon">🎮</text>
            <text class="button-text">店内游戏</text>
          </view>
        </view>
        <up-button
          type="gradient1"
          class="apply-button"
          :class="{
            'glass-btn': !state.isApplied,
            'disabled-btn': state.isApplied,
          }"
          @click="applyJoin"
        >
          {{ state.isApplied ? '已报名参加' : '报名参加' }}
        </up-button>
      </view>
    </template>
  </pageWrapper>
  <pageWrapper v-else height="80vh">
    <emptyData text="店铺不存在或已被删除"></emptyData>
  </pageWrapper>
</template>

<script lang="ts" set>
import { onLoad } from '@dcloudio/uni-app';
import { reactive, onMounted } from 'vue';
import { previewImage } from '@/utils/util';
import { getDownloadUrl } from '@/api/common/upload';
import { getShopDetail } from '@/api/shopManage';
import { createShopHistory } from '@/api/history';

export default {
  options: {
    styleIsolation: 'shared',
  },
  setup() {
    // 统一状态管理
    const state = reactive({
      shopId: '',
      isApplied: false,
      showShop: true,
      isOwner: false, // 是否是店长
      shopInfo: {
        logo: '',
        name: '',
        openTime: '',
        closeTime: '',
        address: '',
        phone: '',
        tags: [],
        photo: [],
        state: '',
        shopId: '',
        provinceId: '',
        cityId: '',
        distinctId: '',
        latitude: '',
        longitude: '',
        ownerAvatar: '',
        ownerName: '张店长',
        fees: [
          { name: '入场费', value: '¥0' },
          { name: '最低消费', value: '¥100/人' },
          { name: '包厢', value: '¥1000起/间' },
          { name: '活动报名', value: '免费畅饮' },
        ],
        // albums: [
        // 	"/static/images/default-avatar.png",
        // 	"/static/images/default-avatar.png",
        // 	"/static/images/default-avatar.png",
        // 	"/static/images/default-avatar.png",
        // 	"/static/images/default-avatar.png",
        // ],
        staffs: [
          {
            avatar: '/static/images/default-avatar.png',
            name: '王大厨',
            role: '主理人',
          },
          {
            avatar: '/static/images/default-avatar.png',
            name: '李师傅',
            role: '调酒师',
          },
          {
            avatar: '/static/images/default-avatar.png',
            name: '小美',
            role: '特邀嘉宾',
          },
          {
            avatar: '/static/images/default-avatar.png',
            name: '阿杰',
            role: '特邀嘉宾',
          },
        ],
      },
    });

    const GtShopDetail = () => {
      getShopDetail({
        id: state.shopId,
      })
        .then(res => {
          let data = res.data?.config || {};
          for (const key in state.shopInfo) {
            if (data[key]) {
              state.shopInfo[key] = data[key];
            }
          }
          state.showShop = true;
        })
        .catch(err => {
          state.showShop = false;
        });
    };

    // 检查报名状态
    const checkApplyStatus = () => {
      // 实际项目中这里需要调用接口检查用户是否已报名
      // 使用模拟数据
      state.isApplied = false;
    };

    // 检查是否是店长
    const checkIsOwner = () => {
      // 实际项目中这里需要调用接口检查用户是否是店长
      // 使用模拟数据
      state.isOwner = false;
    };

    // 前往店铺点单
    const goToDrinkMenu = () => {
      uni.navigateTo({
        url: '/pages/index/order/order?shopId=' + state.shopId,
      });
    };

    // 前往店内游戏
    const goToShopGame = () => {
      uni.navigateTo({
        url: '/pages/zero/shop-game?shopId=' + state.shopId,
      });
    };

    // 报名参加
    const applyJoin = () => {
      if (state.isApplied) {
        uni.showToast({
          title: '您已报名，无需重复操作',
          icon: 'none',
        });
        return;
      }

      uni.navigateTo({
        url: '/pages/zero/apply?shopId=' + state.shopId,
      });
    };

    // 上传相册图片（仅店长可用）
    const uploadAlbum = () => {
      if (!state.isOwner) {
        uni.showToast({
          title: '只有店长可以上传图片',
          icon: 'none',
        });
        return;
      }

      uni.chooseImage({
        count: 9,
        success: res => {
          // 这里应该调用接口上传图片
          console.log('选择图片成功:', res.tempFilePaths);
          uni.showLoading({
            title: '上传中...',
          });

          // 模拟上传成功
          setTimeout(() => {
            uni.hideLoading();
            uni.showToast({
              title: '上传成功',
              icon: 'success',
            });

            // 将选择的图片添加到相册
            // 实际项目中应该刷新数据
            // state.shopInfo.albums = state.shopInfo.albums.concat(res.tempFilePaths)
          }, 1500);
        },
      });
    };

    // 页面加载时执行
    onMounted(() => {
      // 检查是否已报名
      checkApplyStatus();

      // 检查是否是店长
      checkIsOwner();
    });

    onLoad(options => {
      // 获取店铺ID
      if (options && options.shopId) {
        state.shopId = options.shopId;
        GtShopDetail();

        createShopHistory({
          shopId: state.shopId,
        });
      }
    });

    return {
      state,
      GtShopDetail,
      checkApplyStatus,
      checkIsOwner,
      goToDrinkMenu,
      goToShopGame,
      applyJoin,
      uploadAlbum,
      previewImage,
      getDownloadUrl,
    };
  },
};
</script>

<style lang="scss" scoped>
.container {
  padding: $up-box-pd;
}

/* 店铺头部信息 */
.shop-header {
  padding: 30rpx;
  margin-bottom: 30rpx;
  display: flex;
  flex-direction: row;
}

.shop-logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin-right: 16rpx;
}

.shop-base-info {
  flex: 1;
}

.shop-name {
  font-size: 36rpx;
  margin-bottom: 20rpx;
}

.shop-owner {
  margin-bottom: 10rpx;
}

.owner-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 20rpx;
  margin-right: 10rpx;
}

.owner-name {
  font-size: 28rpx;
}

.shop-time,
.shop-location {
  font-size: 24rpx;
  color: var(--text-2);
  margin-top: 10rpx;
}

.time-icon,
.location-icon {
  margin-right: 10rpx;
}

/* 店铺标签 */
.shop-tags,
.shop-fee,
.shop-album,
.shop-staff {
  padding: $up-box-pd;
  margin-bottom: $up-box-mg;
}

.section-title {
  margin-bottom: 20rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
}

.upload-text {
  font-size: 24rpx;
  color: #3aa9e8;
}

.tags-container {
  flex-wrap: wrap;
  display: flex;
  gap: 12rpx;
}

/* 费用部分 */
.fee-item {
  padding: 16rpx 0;
  border-bottom: 1px solid var(--border-1);
}

.fee-item:last-child {
  border-bottom: none;
}

.fee-name,
.fee-value {
  font-size: 26rpx;
}

.fee-value {
  color: var(--primary-6);
  font-weight: bold;
}

/* 相册部分 */
.album-scroll {
  width: 100%;
}

.album-container {
  padding: 10rpx 0;
}

.album-item {
  width: 200rpx;
  height: 160rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin-right: 20rpx;
}

.album-item image {
  width: 100%;
  height: 100%;
}

/* 员工部分 */
.staff-scroll {
  width: 100%;
}

.staff-container {
  padding: 10rpx 0;
}

.staff-item {
  width: 140rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 30rpx;
}

.staff-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  margin-bottom: 10rpx;
}

.staff-name {
  font-size: 24rpx;
  margin-bottom: 4rpx;
}

.staff-role {
  font-size: 20rpx;
  color: var(--text-3);
}

/* 底部按钮 */
.bottom-buttons {
  width: 100%;
  padding: 0 $up-box-pd;
}

.button-row {
  margin-bottom: 30rpx;
}

.button-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.menu-icon,
.game-icon {
  font-size: 48rpx;
  margin-bottom: 10rpx;
}

.button-text {
  font-size: 28rpx;
  color: var(--primary-6);
  font-weight: bold;
}

.apply-button {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
  border-radius: 44rpx;
}

.glass-btn {
  background-color: var(--primary-6);
  color: var(--text-1);
}

.disabled-btn {
  background-color: var(--bg-3);
  color: var(--text-1);
}

.flex-row {
  display: flex;
  flex-direction: row;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.align-center {
  align-items: center;
}

.space-between {
  justify-content: space-between;
}

.text-bold {
  font-weight: bold;
}
</style>
