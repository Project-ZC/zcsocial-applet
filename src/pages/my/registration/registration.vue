<template>
  <pageWrapper>
    <!-- 搜索栏 -->
    <up-sticky>
      <view class="search-container z-glass-card">
        <view class="search-row">
          <up-input
            v-model="state.searchKeyword"
            placeholder="搜索店铺或活动名称"
            clearable
            confirm-type="search"
            @confirm="filterList"
          />
          <view class="search-btn">
            <up-button type="primary" @click="filterList">搜索</up-button>
          </view>
        </view>
        <!-- 顶部 Tabs -->
        <view class="tabs-wrapper z-glass-card">
          <Tabs :list="state.tabList" v-model="state.selectedStatus" @change="onTabChange" />
        </view>
      </view>
    </up-sticky>
    <view class="registration">
      <!-- 报名列表 -->
      <view class="application-list">
        <view class="application-item" v-for="item in state.filteredList" :key="item.id" @click="showDetail(item)">
          <view class="application-header">
            <view class="shop-info">
              <up-image class="shop-logo" :src="item.shopLogo" width="80rpx" height="80rpx" radius="12rpx" />
              <view class="shop-detail">
                <text class="shop-name">{{ item.shopName }}</text>
                <text class="activity-name">{{ item.activityName }}</text>
              </view>
            </view>
            <view class="status-tag" :class="item.status">{{ item.statusText }}</view>
          </view>

          <view class="application-content">
            <view class="application-row">
              <text class="application-label">报名时间</text>
              <text class="application-value">{{ item.applyTime }}</text>
            </view>
            <view class="application-row" v-if="item.userNickname">
              <text class="application-label">用户昵称</text>
              <text class="application-value">{{ item.userNickname }}</text>
            </view>
            <view class="application-row" v-if="item.gender">
              <text class="application-label">性别</text>
              <text class="application-value">{{ item.gender }}</text>
            </view>
            <view class="application-row">
              <text class="application-label">联系方式</text>
              <text class="application-value">{{ item.contact }}</text>
            </view>
            <view class="application-row" v-if="item.wechat">
              <text class="application-label">玩点ID</text>
              <text class="application-value">{{ item.wechat }}</text>
            </view>
            <view class="application-row" v-if="item.ticketContent">
              <text class="application-label">门票内容</text>
              <text class="application-value">{{ item.ticketContent }}</text>
            </view>
            <view class="application-row" v-if="item.notes">
              <text class="application-label">备注</text>
              <text class="application-value">{{ item.notes }}</text>
            </view>
            <view class="application-row photo-gallery-row" v-if="item.uploadedPhotos && item.uploadedPhotos.length">
              <view class="application-label">照片上传</view>
              <view class="photo-gallery">
                <up-image
                  v-for="(p, idx) in item.uploadedPhotos"
                  :key="idx"
                  class="photo-item"
                  :src="p"
                  width="120rpx"
                  height="120rpx"
                  radius="8rpx"
                  @click.stop="previewPhotos(item.uploadedPhotos, p)"
                />
              </view>
            </view>
            <view class="application-row" v-if="item.reason">
              <text class="application-label">拒绝原因</text>
              <text class="application-value">{{ item.reason }}</text>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="application-actions" v-if="item.status === 'pending'">
            <up-button type="cancel" shape="circle" @click.stop="cancelApplication(item)">取消报名</up-button>
            <up-button type="error" shape="circle" @click.stop="deleteApplication(item)">删除报名</up-button>
          </view>
          <view class="application-actions" v-if="item.status === 'rejected'">
            <up-button type="gradient1" shape="circle" @click.stop="applyAgain(item)">再次报名</up-button>
            <up-button type="error" shape="circle" @click.stop="deleteApplication(item)">删除报名</up-button>
          </view>
          <view class="application-actions" v-if="item.status === 'approved'">
            <up-button type="error" shape="circle" @click.stop="deleteApplication(item)">删除报名</up-button>
          </view>
        </view>

        <!-- 空状态 -->
        <emptyData height="60vh" :text="state.emptyDescMap[state.selectedStatus]" v-if="!state.filteredList.length">
          <template #subtext>
            {{ state.emptyDescMap[state.selectedStatus] }}
          </template>
        </emptyData>
      </view>
    </view>
  </pageWrapper>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { reactive } from 'vue';
import Tabs from '@/components/tabs/index.vue';
import { PAGE_LIST } from '@/consts/page';

const state = reactive({
  applyList: [] as any[],
  filteredList: [] as any[],
  currentApply: {} as any,
  selectedStatus: 'all',
  searchKeyword: '',
  tabList: [
    { title: '全部', status: 'all', count: 0 },
    { title: '待审核', status: 'pending', count: 0 },
    { title: '已通过', status: 'approved', count: 0 },
    { title: '已拒绝', status: 'rejected', count: 0 },
  ],
  emptyDescMap: {
    all: '暂无报名记录',
    pending: '暂无待审核的报名',
    approved: '暂无已通过的报名',
    rejected: '暂无已拒绝的报名',
  } as Record<string, string>,
});

const onTabChange = () => filterList();

const fetchMyApplications = () => {
  const mockApplyList = [
    {
      id: '1',
      shopId: 'shop001',
      shopName: '醉美酒吧',
      shopLogo: '/static/images/avatar1.png',
      shopAddress: '北京市朝阳区三里屯街道',
      activityName: '微醺之夜派对',
      applyTime: '2024-01-15',
      userNickname: '调酒师小王',
      gender: '男',
      contact: '138****5678',
      wechat: '1029384756',
      notes: '我是专业调酒师，希望能在活动中展示我的特长',
      ticketCount: 2,
      ticketContent: '周末门票通用×2',
      uploadedPhotos: ['/static/images/photo1.jpg', '/static/images/photo2.jpg'],
      status: 'pending',
      statusText: '待审核',
      applyTimeDetail: '2024-01-15 14:30',
      reason: null,
    },
    {
      id: '2',
      shopId: 'shop002',
      shopName: '派对领地',
      shopLogo: '/static/images/avatar2.png',
      shopAddress: '上海市黄浦区南京路',
      activityName: '狂欢周末',
      applyTime: '2024-01-15',
      userNickname: '派对达人',
      gender: '女',
      contact: '139****1234',
      wechat: '5647382910',
      ticketCount: 1,
      ticketContent: '平日门票通用×1',
      uploadedPhotos: ['/static/images/photo3.jpg'],
      status: 'approved',
      statusText: '已通过',
      applyTimeDetail: '2024-01-14 13:45',
      reason: null,
    },
    {
      id: '3',
      shopId: 'shop003',
      shopName: '夜色酒廊',
      shopLogo: '/static/images/avatar3.png',
      shopAddress: '广州市天河区珠江新城',
      activityName: '静吧小憩',
      applyTime: '2024-01-15',
      userNickname: '夜生活专家',
      gender: '男',
      contact: '137****9876',
      wechat: '9182736450',
      ticketCount: 3,
      ticketContent: 'VIP门票×3',
      uploadedPhotos: ['/static/images/photo4.jpg', '/static/images/photo5.jpg', '/static/images/photo6.jpg'],
      status: 'rejected',
      statusText: '已拒绝',
      applyTimeDetail: '2024-01-13 18:20',
      reason: '活动人数已满',
    },
    {
      id: '4',
      shopId: 'shop004',
      shopName: '静吧小憩',
      shopLogo: '/static/images/avatar1.png',
      shopAddress: '深圳市南山区科技园',
      activityName: '情侣套餐活动',
      applyTime: '2024-01-15',
      userNickname: '浪漫情侣',
      gender: '女',
      contact: '136****5555',
      wechat: '1234567890',
      ticketCount: 1,
      ticketContent: '情侣门票×1',
      uploadedPhotos: ['/static/images/photo7.jpg'],
      status: 'approved',
      statusText: '已通过',
      applyTimeDetail: '2024-01-12 09:15',
      reason: null,
    },
    {
      id: '5',
      shopId: 'shop005',
      shopName: '派对领地',
      shopLogo: '/static/images/avatar2.png',
      shopAddress: '上海市黄浦区南京路',
      activityName: 'VIP尊享夜',
      applyTime: '2024-01-15',
      userNickname: 'VIP会员',
      gender: '男',
      contact: '135****7777',
      wechat: '9876543210',
      ticketCount: 2,
      ticketContent: 'VIP门票×2',
      uploadedPhotos: ['/static/images/photo8.jpg', '/static/images/photo9.jpg'],
      status: 'pending',
      statusText: '待审核',
      applyTimeDetail: '2024-01-14 16:30',
      reason: null,
    },
  ];
  state.applyList = mockApplyList;
  filterList();
};

const filterList = () => {
  let list = state.applyList.slice();
  if (state.selectedStatus !== 'all') list = list.filter((x: any) => x.status === state.selectedStatus);
  if (state.searchKeyword && state.searchKeyword.trim()) {
    const kw = state.searchKeyword.trim().toLowerCase();
    list = list.filter(
      (x: any) => (x.shopName || '').toLowerCase().includes(kw) || (x.activityName || '').toLowerCase().includes(kw)
    );
  }
  state.filteredList = list;
  state.tabList = state.tabList.map((t: any) => ({
    ...t,
    // count:
    //   t.status === 'all' ? state.applyList.length : state.applyList.filter((x: any) => x.status === t.status).length,
  }));
};

const showDetail = (item: any) => {};

const cancelApplication = (item: any) => {
  uni.showModal({
    title: '取消报名',
    content: `确定要取消"${item.activityName}"的报名吗？`,
    success: res => {
      if (res.confirm) {
        uni.showLoading({ title: '处理中...' });
        setTimeout(() => {
          state.applyList = state.applyList.map((x: any) =>
            x.id === item.id
              ? {
                  ...x,
                  status: 'rejected',
                  statusText: '已取消',
                  reason: '用户主动取消',
                }
              : x
          );
          filterList();
          uni.hideLoading();
          uni.showToast({ title: '报名已取消', icon: 'success' });
        }, 800);
      }
    },
  });
};

const applyAgain = (item: any) => {
  uni.navigateTo({
    url: `${PAGE_LIST.INDEX_SHOP_DETAIL}?shopId=${item.shopId}`,
  });
};

const deleteApplication = (item: any) => {
  let confirmContent = '确定要删除报名记录吗？删除后将无法恢复。';
  if (item.status === 'pending') confirmContent = `确定要删除"${item.activityName}"的报名吗？删除后将无法恢复。`;
  else if (item.status === 'approved')
    confirmContent = `确定要删除"${item.activityName}"的报名记录吗？删除后将无法恢复。`;
  uni.showModal({
    title: '删除报名',
    content: confirmContent,
    confirmText: '确认删除',
    confirmColor: '#ff4757',
    success: res => {
      if (res.confirm) performDelete(item.id);
    },
  });
};

const performDelete = (id: string) => {
  uni.showLoading({ title: '删除中...' });
  setTimeout(() => {
    state.applyList = state.applyList.filter((x: any) => x.id !== id);
    filterList();
    uni.hideLoading();
    uni.showToast({ title: '删除成功', icon: 'success' });
  }, 800);
};

const previewPhotos = (photos: string[], current: string) => {
  uni.previewImage({ current, urls: photos });
};

onLoad(() => {
  fetchMyApplications();
});

defineOptions({
  options: {
    styleIsolation: 'shared',
  },
});
</script>

<style scoped lang="scss">
@import '@/uni.scss';
.registration {
  padding: $up-box-pd;
}

:deep(.tabs) {
  margin-bottom: 0 !important;
}
.search-container {
  // margin-bottom: $up-box-mg;
  // padding: 0 20rpx 0;
}
.search-row {
  display: flex;
  gap: 12rpx;
  align-items: center;
  margin-bottom: 12rpx;
  padding: 0 $up-box-pd;
  .search-btn {
    width: 120rpx;
  }
}
.tabs-wrapper {
  // margin-bottom: $up-box-mg;
}

.photo-gallery-row {
  flex-direction: column;
}
.photo-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 12rpx;
  .photo-item {
    width: 120rpx;
    height: 120rpx;
    border-radius: $up-box-radius-1;
  }
}
.application-list {
  padding-bottom: 40rpx;
}
.application-item {
  background: var(--bg-2);
  border-radius: $up-box-radius-1;
  margin-bottom: 20rpx;
  padding: $up-box-pd;
  &:first-child {
    margin-top: 0;
  }
}
.application-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}
.shop-info {
  display: flex;
  align-items: center;
  flex: 1;
}
.shop-logo {
  margin-right: 16rpx;
}
.shop-detail {
  flex: 1;
}
.shop-name {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-1);
  display: block;
  margin-bottom: 8rpx;
}
.activity-name {
  font-size: 26rpx;
  color: var(--text-2);
}
.status-tag {
  padding: 10rpx 16rpx;
  border-radius: $up-box-radius-1;
  font-size: 24rpx;
  font-weight: 500;
  white-space: nowrap;
}
.status-tag.pending {
  background: #fff7e6;
  color: #fa8c16;
}
.status-tag.approved {
  background: #e8f5e8;
  color: #52c41a;
}
.status-tag.rejected {
  background: #fff2f0;
  color: #ff4d4f;
}

.application-content {
  margin-bottom: 16rpx;
}
.application-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12rpx;
  padding: 10rpx 0;
  border-bottom: 1rpx solid var(--border-2);
}
.application-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
}
.application-label {
  font-size: 26rpx;
  color: var(--text-2);
  min-width: 160rpx;
}
.application-value {
  font-size: 26rpx;
  color: var(--text-1);
  font-weight: 500;
  flex: 1;
  text-align: right;
}

.application-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12rpx;
  :deep(.u-button) {
    width: 160rpx;
    margin: 0;
  }
}
</style>
