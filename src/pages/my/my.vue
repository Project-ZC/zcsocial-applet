<template>
  <pageWrapper :showTabbar="true">
    <view class="my-page">
      <!-- 用户信息区域 -->
      <view class="user-info-section z-glass-card">
        <view class="user-info-header">
          <view class="user-avatar">
            <!-- <up-image
						:showLoading="true"
						:src="userStore.userInfo?.avatar"
						width="120rpx"
						height="120rpx"
					></up-image> -->
            <up-avatar
              @click="
                previewImage({
                  urls: [getDownloadUrl(userStore.userInfo?.avatar)],
                })
              "
              :src="getDownloadUrl(userStore.userInfo?.avatar) || '/static/images/default-avatar.png'"
              size="140rpx"
            ></up-avatar>
            <!-- <up-album :urls="[{ src2: getDownloadUrl(userStore.userInfo?.avatar) }]" keyName="src2"></up-album> -->
            <view class="avatar-upload-icon" v-if="!userStore.userInfo?.avatar">
              <up-icon name="camera" color="#fff" size="16"></up-icon>
            </view>
          </view>
          <view class="user-details">
            <view class="username">{{ userStore.userInfo?.nickname || '微信用户' }}</view>
            <view class="user-level">玩点ID：{{ userStore.userInfo?.id || '' }}</view>

            <view class="user-intro">
              {{ userStore.userInfo?.introduce || '这个人很懒，什么都没有留下' }}
            </view>

            <view class="tags flex-row" v-if="userStore.userInfo?.tags?.length > 0">
              <up-tag
                size="mini"
                class="tag"
                type="primary"
                plain
                plainFill
                :text="tag"
                v-for="(tag, index) in userStore.userInfo?.tags"
                :key="index"
              ></up-tag>
            </view>
          </view>
        </view>
        <view class="edit-btn" v-if="userStore.userInfo?.mobile || userStore.userInfo?.isBindMobile">
          <up-button type="primary" shape="circle" @click="navigateTo('/pages/my/editProfile/editProfile')">
            编辑资料
          </up-button>
        </view>
        <view class="edit-btn phone-btn" v-else>
          <!-- 仅微信小程序显示：获取手机号并进入编辑资料 -->
          <!-- #ifdef MP-WEIXIN -->
          <!-- #endif -->
          <button class="getphone-btn" open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber">
            <view class="btn-left-text">让我们了解你更多</view>
            <view class="btn-right-text">
              获取手机号
              <up-icon name="arrow-right" color="#fff" size="14"></up-icon>
            </view>
          </button>
        </view>
      </view>
      <view class="z-glass-card">
        <up-cell-group v-for="main in state.cellList" :key="main.title">
          <view class="z-cell-title">{{ main.title }}</view>
          <up-cell
            v-for="item in main.children"
            :key="item.title"
            :title="item.title"
            :isLink="item.showArrow"
            @click="itemClick(item)"
          >
            <template #icon>
              <view class="z-cell-left-icon" :style="{ backgroundColor: item.bgc }">
                <view :class="`wd-icon wd-icon-${item.wdIcon}`"></view>
              </view>
            </template>
          </up-cell>
        </up-cell-group>
      </view>
      <!-- <up-button
			v-if="userStore.userInfo?.token"
			class="logout-btn"
			type="error"
			@click="handleLogout"
		>退出登录</up-button> -->
    </view>
  </pageWrapper>
</template>

<script lang="ts" setup>
import { useThemeStore } from '@/stores/modules/theme';
import { useUserStore } from '@/stores/modules/user';
import { ActionType } from '@/enums/order';
import { computed, reactive } from 'vue';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import { getUserInfo } from '@/api/userManage';
import { onMounted } from 'vue';
import { getDownloadUrl } from '@/api/common/upload';
import { bindMobile } from '@/api/userManage';
import { previewImage } from '@/utils/util';

const userStore = useUserStore();

const state = reactive({
  cellList: [
    {
      title: '游客中心',
      children: [
        {
          title: '我的订单',
          wdIcon: 'my-order',
          url: '/pages/my/orders/orders',
          showArrow: true,
          bgc: '#2196F3',
        },
        {
          title: '浏览历史',
          wdIcon: 'history',
          url: '/pages/my/history/history',
          showArrow: true,
          bgc: '#FF9800',
        },
      ],
    },
    {
      title: '通用设置',
      children: [
        {
          title: '通用设置',
          wdIcon: 'setting',
          url: '',
          showArrow: true,
          bgc: '#607d8b',
        },
        {
          title: '联系我们',
          wdIcon: 'contact-us',
          url: '',
          showArrow: true,
          type: 'contactUs',
          bgc: '#ff5722',
        },
        {
          title: '关于我们',
          wdIcon: 'about-us',
          url: '',
          showArrow: true,
          type: 'aboutUs',
          bgc: '#795548',
        },
      ],
    },
  ],
});

const GetUserInfo = (id: string) => {
  getUserInfo().then(res => {
    const userInfo = res.data as any;
    if (userInfo) {
      userStore.setUserInfo({
        ...userStore.userInfo,
        avatar: userInfo.avatar,
        nickname: userInfo.nickname,
        introduce: userInfo.introduce,
        tags: userInfo.tags,
        gender: userInfo.gender,
        birthday: userInfo.birthday,
      });
    }
  });
};

const itemClick = (item: any) => {
  if (item.url) {
    navigateTo(item.url);
  } else if (item.type == 'contactUs') {
    // 换行在真机才生效，开发工具不生效
    uni.showModal({
      title: '联系我们',
      content: '客服电话: 400-123-4567\n工作时间: 9:00-18:00',
      showCancel: false,
    });
  } else if (item.type == 'aboutUs') {
    // 关于我们
    uni.showModal({
      title: '首页社交',
      content: '版本: 1.0.0\n首页社交是一款专注于酒吧社交的小程序，致力于为用户提供更好的社交体验。',
      showCancel: false,
      confirmText: '知道了',
    });
  } else {
    uni.showToast({
      title: '功能开发中',
      icon: 'none',
    });
  }
};
const navigateTo = (url: string) => {
  url &&
    uni.navigateTo({
      url: `${url}?id=${userStore.userInfo?.id}`,
    });
};

// 微信获取手机号
const onGetPhoneNumber = async (e: any) => {
  const { errMsg, code } = e.detail || {};
  if (!code) {
    uni.showToast({ title: '未授权手机号', icon: 'none' });
    return;
  }
  const userInfo = userStore.userInfo;
  if (userInfo?.isBindMobile || userInfo?.mobile) {
    uni.navigateTo({ url: '/pages/my/editProfile/editProfile' });
    return;
  }
  try {
    // 此处将 code 发送到后端换取手机号（占位）
    const res = await bindMobile({ mobileCode: code });
    uni.showToast({ title: '授权成功', icon: 'success' });
    userStore.setUserInfo({
      ...userInfo,
      mobile: res.data?.mobile || '',
      isBindMobile: true,
    });
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/my/editProfile/editProfile' });
    }, 200);
  } catch (error) {}
  // 仅微信小程序支持
  // #ifdef MP-WEIXIN
  // #endif
};

// 处理操作按钮点击
const handleActionClick = (action: any, orderInfo: any) => {
  uni.showToast({
    title: `执行操作：${action.text} - ${orderInfo.orderNumber}`,
    icon: 'none',
  });

  // 根据操作类型执行相应逻辑
  switch (action.type) {
    case ActionType.PAY:
      // 处理支付逻辑
      break;
    case ActionType.CANCEL:
      // 处理取消订单逻辑
      break;
    case ActionType.ACCEPT:
      // 处理接取订单逻辑
      break;
    case ActionType.CONFIRM:
      // 处理确认收货逻辑
      break;
    case ActionType.RATE:
      // 处理评价逻辑
      break;
    case ActionType.REORDER:
      // 处理再次购买逻辑
      break;
  }
};

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: res => {
      if (res.confirm) {
        uni.clearStorageSync();
        uni.reLaunch({
          url: '/pages/login/login',
        });
      }
    },
  });
};

onMounted(() => {
  GetUserInfo(userStore.userInfo?.id);
});

// 下拉刷新监听
onPullDownRefresh(async () => {
  console.log('下拉刷新');
  try {
    await GetUserInfo(userStore.userInfo?.id);
  } finally {
    uni.stopPullDownRefresh();
  }
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';
.my-page {
  padding: $up-box-pd;
  .logout-btn {
    width: 90%;
    margin-top: 40rpx;
  }
  ::v-deep .up-cell__body {
    background-color: #fff;
  }

  // 用户信息区域
  .user-info-section {
    // padding: 40rpx 30rpx;
    margin-bottom: $up-box-mg;
    .user-info-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .avatar-upload-icon {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 50rpx;
      height: 50rpx;
      background-color: #1890ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 24rpx;
    }
    .user-avatar {
      // width: 140rpx;
      // height: 140rpx;
      // border-radius: 60rpx;
      // overflow: hidden;
      padding: 20rpx;
      position: relative;

      image {
        width: 100%;
        height: 100%;
      }
    }

    .user-details {
      flex: 1;
      padding: 20rpx 16rpx 20rpx 0;
      .username {
        font-size: $up-font-lg;
        font-weight: 600;
        color: $u-main-color;
        margin-bottom: 10rpx;
      }

      .user-level {
        font-size: $up-font-base;
        color: #ff6b35;
        background-color: #fff7e6;
        padding: 8rpx 16rpx;
        border-radius: 20rpx;
        display: inline-block;
      }
      .user-intro {
        font-size: $up-font-base;
        color: $u-content-color;
        margin-top: 10rpx;
        // 最多显示三行，超出省略
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
        word-break: break-word;
      }
    }
  }

  // 功能菜单
  .menu-section {
    background-color: #fff;
    margin-bottom: 20rpx;

    .menu-item {
      display: flex;
      align-items: center;
      padding: 30rpx;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .menu-icon {
        font-size: 40rpx;
        margin-right: 20rpx;
      }

      .menu-text {
        flex: 1;
        font-size: 32rpx;
        color: #333;
      }

      .menu-arrow {
        font-size: 32rpx;
        color: var(--text-3);
      }
    }
  }

  .tags {
    flex-wrap: wrap;
    margin-top: 8rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .tag {
    // font-size: $up-font-sm;
    // padding: 2rpx 8rpx;
    // margin-right: 5rpx;
    // margin-bottom: 2rpx;
  }

  .edit-btn {
    margin: 0 auto;
    padding: $up-box-pd;
    &.phone-btn {
      padding: 0;
    }
    .getphone-btn {
      margin-top: 12rpx;
      padding: 0 24rpx;
      font-size: $up-font-sm;
      height: 80rpx;
      line-height: 80rpx;
      border-radius: 0 0 8rpx 8rpx; /* 长方形 */
      background: #ffc107; /* 黄底 */
      color: #fff; /* 白字 */
      border: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      box-sizing: border-box;
    }

    .btn-left-text {
      color: #fff;
      font-size: $up-font-base;
    }

    .btn-right-text {
      color: #fff;
      font-size: $up-font-base;
      opacity: 0.95;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10rpx;
    }
  }
}
</style>
