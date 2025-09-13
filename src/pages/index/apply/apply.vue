<template>
  <pageWrapper showFooter>
    <view class="apply">
      <!-- 店铺与统计 -->
      <view class="header z-glass-card">
        <view class="shop-main">
          <up-image width="70rpx" height="70rpx" class="shop-logo" :src="getDownloadUrl(state.shopInfo.logo)" />
          <view class="shop-info">
            <text class="shop-name">{{ state.shopInfo.name }}</text>
            <text class="shop-desc">活动报名</text>
          </view>
        </view>
        <view class="today-stats-simple">
          <view class="stats-content">
            <view class="total-count">
              <text class="count-number">{{ state.todayStats.totalCount }}</text>
              <text class="count-desc">报名人数</text>
            </view>
            <view class="gender-stats">
              <view class="gender-item">
                <text class="wd-icon wd-icon-male gender-icon male"></text>
                <text class="gender-count">{{ state.todayStats.maleCount }}</text>
              </view>
              <view class="gender-item">
                <text class="wd-icon wd-icon-female gender-icon female"></text>
                <text class="gender-count">{{ state.todayStats.femaleCount }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 日期与门票选择 -->
      <view class="form-container">
        <up-form :model="state.form" labelPosition="top" labelWidth="auto">
          <view class="form-section z-glass-card">
            <view class="section-title">
              <text class="title-text">选择活动日期</text>
            </view>
            <up-form-item label="活动日期">
              <view style="width: 100%" @click="state.datePickerShow = true">
                <up-input
                  readonly
                  :placeholder="
                    state.shopInfo.openTime && state.shopInfo.closeTime
                      ? `活动时间 ${state.shopInfo.openTime} - ${state.shopInfo.closeTime}`
                      : '请先加载店铺信息'
                  "
                  v-model="state.activityDate"
                />
              </view>
            </up-form-item>
            <view class="date-tip">
              <text class="tip-icon">?</text>
              <text class="tip-text">购买此门票参与本次活动专场，请确认时间！</text>
            </view>
          </view>

          <!-- 门票列表与数量 -->
          <view class="form-section z-glass-card">
            <view class="section-title">
              <text class="title-text">购买门票</text>
            </view>
            <view class="ticket-cards">
              <view class="ticket-card" v-for="item in state.filteredTicketList" :key="item.id">
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
                  <text class="price-value z-price">¥{{ item.price }}</text>
                </view>
                <view class="quantity-controls">
                  <text class="quantity-label">数量：</text>
                  <up-number-box
                    v-model="state.ticketQuantities[item.id]"
                    :min="0"
                    :max="99"
                    @change="updatePriceBreakdown"
                  />
                </view>
              </view>
            </view>
          </view>

          <!-- 费用明细 -->
          <view class="form-section z-glass-card">
            <view class="section-title">
              <text class="title-text">费用明细</text>
            </view>
            <view class="price-details">
              <view class="price-item" v-for="(it, idx) in state.priceBreakdown" :key="idx">
                <view class="item-name-container">
                  <text class="item-name">{{ it.ticketName }}</text>
                  <text class="price-type-badge" :class="it.priceType">
                    {{ it.priceType === 'universal' ? '通用' : it.priceType === 'male' ? '男生' : '女生' }}
                  </text>
                  <text class="item-quantity">× {{ it.quantity }}张</text>
                </view>
                <text class="item-price z-price">¥{{ it.price }}</text>
              </view>
            </view>
            <view class="total-price">
              <text class="total-label">总计</text>
              <text class="total-value">¥{{ state.totalPrice }}</text>
            </view>
          </view>

          <!-- 报名信息（买票人） -->
          <view class="form-section z-glass-card">
            <view class="section-title">
              <text class="title-text">报名信息</text>
              <view class="fill-btn">
                <button class="getphone-btn" open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber">
                  自动填充
                </button>
              </view>
            </view>
            <up-form-item label="昵称">
              <up-input v-model="state.form.nickname" placeholder="请输入昵称" />
            </up-form-item>
            <up-form-item label="性别">
              <view class="gender-options-inline">
                <view
                  class="gender-option-inline"
                  v-for="gender in state.genderList"
                  :key="gender.value"
                  :class="{ selected: state.form.gender === gender.value }"
                  @click="selectGender(gender.value)"
                >
                  <text
                    class="wd-icon gender-icon"
                    :class="gender.value === '0' ? 'wd-icon-male male' : 'wd-icon-female female'"
                  ></text>
                  <text class="gender-text">{{ gender.label }}</text>
                </view>
              </view>
            </up-form-item>
            <up-form-item label="玩点ID">
              <up-input v-model="state.form.id" placeholder="请输入玩点ID" />
            </up-form-item>
            <up-form-item label="电话号码">
              <up-input v-model="state.form.mobile" type="number" placeholder="请输入电话号码" />
            </up-form-item>
            <!-- 照片上传（最多5张） -->
            <view class="photo-upload-section">
              <text class="section-subtitle">照片上传（最多5张）</text>
              <up-form-item>
                <Upload v-model:fileList="state.form.images" acceept="image" :maxSize="5 * 1024 * 1024" :maxCount="5">
                  <template #tips>
                    <text class="photo-tip">单张不超过5MB</text>
                  </template>
                </Upload>
              </up-form-item>
            </view>
            <!-- 备注 -->
            <up-form-item label="备注">
              <up-textarea
                v-model="state.form.remark"
                placeholder="请输入备注信息（选填）"
                count
                maxlength="200"
                autoHeight
              />
            </up-form-item>
          </view>
        </up-form>
      </view>
    </view>

    <template #footer>
      <view class="bottom-action">
        <up-button class="apply-btn" type="primary" @click="submitPayApplication">支付参加</up-button>
      </view>
    </template>
    <up-datetime-picker
      :show="state.datePickerShow"
      v-model="state.selectedDate"
      mode="date"
      :minDate="state.yesterdayDate"
      :maxDate="dayjs().add(1, 'year').format('YYYY-MM-DD')"
      @confirm="onDateConfirm"
      @cancel="() => (state.datePickerShow = false)"
      @close="() => (state.datePickerShow = false)"
    />
  </pageWrapper>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores/modules/user';
import { reactive } from 'vue';
import dayjs from 'dayjs';
import Upload from '@/components/upload-file/index.vue';
import { uniCache } from '@/utils/storage';
import { getDownloadUrl } from '@/api/common/upload';
import { getShopDetail } from '@/api/shopManage';
import { getGenderList } from '@/api/common/dict';
import { getCurrentBusinessHours } from '@/utils/util';
import { bindMobile } from '@/api/userManage';

const userStore = useUserStore();

const state = reactive({
  shopId: '',
  shopInfo: {} as any,
  // 今日报名统计
  todayStats: { totalCount: 0, maleCount: 0, femaleCount: 0 },
  // 表单
  form: {
    nickname: '',
    gender: 0 as 0 | 1, // 0=男，1=女
    id: '',
    mobile: '',
    images: [] as any[],
    remark: '',
  },
  // 日期
  selectedDate: '',
  activityDate: '', // 活动日期拼接当日营业时间
  todayDate: '',
  yesterdayDate: '',
  datePickerShow: false,
  // 门票相关
  ticketList: [] as any[],
  filteredTicketList: [] as any[],
  ticketQuantities: {} as Record<string, number>,
  // 价格
  priceBreakdown: [] as Array<{
    ticketName: string;
    priceType: string;
    quantity: number;
    price: number;
  }>,
  totalPrice: 0,
  // 字典数据
  genderList: [] as Array<{ value: number; label: string }>,
});

// 自动填充（缓存用户信息）
const fillFromCache = () => {
  const user = uniCache.getItem('user') || {};
  const info = user.userInfo || {};
  state.form.nickname = info.nickname || state.form.nickname || '';
  state.form.mobile = info.mobile || state.form.mobile || '';
  state.form.id = info.id || state.form.id || '';
  state.form.gender = info.gender !== undefined ? info.gender : state.form.gender;
};

// 获取性别字典
const fetchGenderList = () => {
  getGenderList({})
    .then((res: any) => {
      if (res.data && Array.isArray(res.data)) {
        state.genderList = res.data.map((item: any) => ({
          value: item.value || item.code,
          label: item.label || item.name,
        }));
      }
    })
    .catch((err: any) => {
      console.error('获取性别字典失败:', err);
      // 设置默认值
      state.genderList = [
        { value: 0, label: '男' },
        { value: 1, label: '女' },
      ];
    });
};

// 今日统计（示例固定值）
const updateTodayStats = () => {
  state.todayStats = { totalCount: 20, maleCount: 9, femaleCount: 10 } as any;
};

// 门票列表（模拟）
const fetchTicketList = () => {
  const list: any[] = [
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
      drinkCount: '8',
      validHours: '8',
      validDays: '30',
      description: '包含8杯酒水，8小时内使用，有效期30天',
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
  state.ticketList = list;
  state.filteredTicketList = list;
};

// 设置日期（今日、昨日）
const setTodayDate = () => {
  const today = dayjs();
  const yesterday = today.subtract(1, 'day');

  state.todayDate = today.format('YYYY-MM-DD');
  state.yesterdayDate = yesterday.format('YYYY-MM-DD');
  state.selectedDate = today.format('YYYY-MM-DD');
};

// 日期确认
const onDateConfirm = (e: any) => {
  let selectedDate = e.value ? e.value : state.yesterdayDate;

  state.datePickerShow = false;

  // 格式化活动日期显示
  formatActivityDate(selectedDate);

  filterTicketsByDate(selectedDate);
  updateTodayStats();
};

// 格式化活动日期显示
const formatActivityDate = (selectedDate: string) => {
  if (!selectedDate || !state.shopInfo.openTime || !state.shopInfo.closeTime) {
    state.activityDate = '请选择日期';
    return;
  }

  try {
    const date = dayjs(selectedDate);

    // 验证日期是否有效
    if (!date.isValid()) {
      state.activityDate = '请选择日期';
      return;
    }

    // 格式化日期为 MM月DD日
    const formatDate = (d: dayjs.Dayjs) => d.format('MM月DD日');

    const startDateStr = formatDate(date);

    // 获取营业时间
    const openTime = state.shopInfo.openTime || '';
    const closeTime = state.shopInfo.closeTime || '';

    // 判断是否跨天：关闭时间小于等于开始时间表示跨天
    const isCrossDay = closeTime <= openTime;

    let endDateStr, endTime;
    if (isCrossDay) {
      // 跨天：结束日期是下一天
      const nextDate = date.add(1, 'day');
      endDateStr = formatDate(nextDate);
      endTime = closeTime;
    } else {
      // 不跨天：结束日期是当天
      endDateStr = startDateStr;
      endTime = closeTime;
    }
    // 拼接格式：09月12日 20:00 - 09月13日 02:00 或 09月12日 20:00 - 09月12日 23:00
    state.activityDate = `${startDateStr} ${openTime} - ${endDateStr} ${endTime}`;
  } catch (error) {
    console.error('日期格式化失败:', error);
    state.activityDate = '请选择日期';
  }
};

// 门票过滤（此处不过滤，直接展示全部）
const filterTicketsByDate = (_date: string) => {
  state.filteredTicketList = state.ticketList;
  state.ticketQuantities = {};
  updatePriceBreakdown();
};

// 性别切换
const selectGender = (g: any) => {
  state.form.gender = g;
  updatePriceBreakdown();
};

// 价格计算
const updatePriceBreakdown = () => {
  const breakdown: Array<{
    ticketName: string;
    priceType: string;
    quantity: number;
    price: number;
  }> = [];
  let total = 0;
  for (const t of state.ticketList) {
    const qty = state.ticketQuantities[t.id] || 0;
    if (qty <= 0) continue;
    if (t.priceType === 'male' && state.form.gender !== 0) continue;
    if (t.priceType === 'female' && state.form.gender !== 1) continue;
    const unit = parseInt(t.price || '0', 10) || 0;
    const sum = unit * qty;
    breakdown.push({
      ticketName: t.name,
      priceType: t.priceType,
      quantity: qty,
      price: sum,
    });
    total += sum;
  }
  state.priceBreakdown = breakdown;
  state.totalPrice = total;
};

// 提交（付费）
const submitPayApplication = () => {
  const totalTickets = Object.values(state.ticketQuantities).reduce(
    (sum: number, v: any) => sum + (v || 0),
    0 as number
  );
  uni.showModal({
    title: '支付确认',
    content: `您选择了${totalTickets}张门票，需要支付${state.totalPrice}元，是否继续？`,
    confirmText: '确认支付',
    cancelText: '取消',
    success: res => {
      if (res.confirm) processPayment();
    },
  });
};

const onGetPhoneNumber = async (e: any) => {
  const userInfo = userStore.userInfo;
  if (userInfo?.isBindMobile || userInfo?.mobile) {
    fillFromCache();
    return;
  }
  const { errMsg, code } = e.detail || {};
  if (!code) {
    uni.showToast({ title: '未授权手机号', icon: 'none' });
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
      state.form.mobile = res.data?.mobile || state.form.mobile || '';
    }, 0);
  } catch (error) {}
};

const processPayment = () => {
  uni.showLoading({ title: '支付中...' });
  setTimeout(() => {
    uni.hideLoading();
    uni.showModal({
      title: '支付成功',
      content: '您的报名已购买成功，报名已通过审核！',
      showCancel: false,
      confirmText: '确定',
    });
  }, 1200);
};

const GtShopDetail = () => {
  getShopDetail({
    id: state.shopId,
  })
    .then((res: any) => {
      let data = res.data?.config || {};
      if (data.shippingTimeList?.length) {
        const currentBusinessHours = getCurrentBusinessHours(data.shippingTimeList) as any;
        if (currentBusinessHours) {
          data.businessHours = currentBusinessHours.time;
          data.closeTime = currentBusinessHours.closeTime;
          data.openTime = currentBusinessHours.openTime;
        }
      }
      state.shopInfo = data || {};

      // 店铺信息加载完成后，格式化当前选中的日期
      // if (state.selectedDate) {
      //   formatActivityDate(state.selectedDate);
      // }
    })
    .catch((err: any) => {});
};

onLoad((options: any) => {
  options.shopId = '10000008';
  if (options?.shopId) {
    state.shopId = options.shopId as string;
    GtShopDetail();
  }
  fetchGenderList(); // 获取性别字典
  setTodayDate();
  fetchTicketList();
  updateTodayStats();
  fillFromCache(); // 自动填充
});

defineOptions({
  options: { styleIsolation: 'shared' },
});
</script>

<style scoped lang="scss">
@import '@/uni.scss';
.apply {
  padding: $up-box-pd;
}
.header {
  padding: 0 20rpx 20rpx;
  margin: 20rpx 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.shop-main {
  display: flex;
  align-items: center;
}
.shop-logo {
  border-radius: 12rpx;
  margin-right: 16rpx;
}
.shop-info {
  display: flex;
  flex-direction: column;
}
.shop-name {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--text-1);
}
.shop-desc {
  font-size: 28rpx;
  margin-top: 16rpx;
  color: var(--text-2);
}

.today-stats-simple {
  text-align: center;
  padding: 8px;
  min-width: 160rpx;
}
.stats-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.count-number {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--text-1);
}
.count-desc {
  font-size: 24rpx;
  color: var(--text-2);
}
.total-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}
.gender-stats {
  display: flex;
  gap: 20rpx;
  margin-top: 16rpx;
}
.gender-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}
.gender-icon {
  font-size: 24rpx;
  font-weight: bold;
}
.gender-icon.male {
  color: var(--male);
}
.gender-icon.female {
  color: var(--female);
}
.gender-count {
  font-size: 30rpx;
  color: var(--text-2);
}

.form-container {
  flex: 1;
  margin-bottom: 20px;
}
.form-section {
  margin-bottom: $up-box-mg;
  padding: 20rpx;
}
.section-title {
  margin-bottom: $up-box-mg;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .fill-btn {
    width: 120rpx;
  }
  .title-text {
    font-size: 30rpx;
    font-weight: bold;
    color: var(--text-1);
    flex: 1;
  }
}

.hours-text {
  font-size: 24rpx;
  color: var(--primary-6);
  font-weight: 600;
}
.date-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 0;
  padding: 12rpx 20rpx;
  // background: var(--bg-2);
  background: var(--bg-2);
  color: var(--text1);
  opacity: 0.9;
  border-radius: $up-box-radius-1;
}
.tip-icon {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: var(--primary-6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}
.tip-text {
  font-size: 24rpx;
  color: var(--text-2);
}

.ticket-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ticket-card {
  background: var(--bg-2);
  border-radius: $up-box-radius-1;
  padding: 12px;
  border: 1px solid var(--border-2);
}
.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.ticket-name {
  font-size: 28rpx;
  font-weight: bold;
  color: var(--text-1);
}
.price-type-badge {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 20rpx;
  color: #fff;
  margin-left: 12rpx;
}
.price-type-badge.universal {
  background: #52c41a;
}
.price-type-badge.male {
  background: var(--male);
}
.price-type-badge.female {
  background: var(--female);
}
.ticket-details {
  display: flex;
  gap: 8px;
  margin: 8px 0;
}
.detail-item {
  background: var(--primary-5);
  color: var(--text-2);
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 20rpx;
}
.ticket-price {
  display: flex;
  justify-content: flex-end;
}
.price-value {
  font-size: 30rpx;
  font-weight: bold;
}
.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--border-1);
}
.quantity-label {
  font-size: 28rpx;
  color: var(--text-2);
}

.price-details {
  margin-bottom: 12px;
}
.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-1);
}
.item-name {
  font-size: 26rpx;
  color: var(--text-2);
}
.item-quantity {
  font-size: 24rpx;
  color: var(--text-3);
}
.item-price {
  font-size: 26rpx;
}
.total-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 2px solid var(--border-1);
}
.total-label {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-1);
}
.total-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #e74c3c;
}

.gender-options-inline {
  display: flex;
  gap: 12px;
}
.gender-option-inline {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  border-radius: $up-box-radius-1;
  border: 1px solid var(--border-2);
}
.gender-option-inline.selected {
  color: var(--primary-6);
  border-color: var(--primary-6);
}
.gender-icon {
  font-size: 32rpx;
}
.gender-text {
  font-size: 26rpx;
}

.photo-upload-section {
  margin-top: $up-box-mg;
}
.section-subtitle {
  font-size: 26rpx;
  color: var(--text-2);
  margin-bottom: $up-box-mg;
  display: block;
}

.bottom-action {
  width: 100%;
  padding: 0 $up-box-pd;
}
</style>
