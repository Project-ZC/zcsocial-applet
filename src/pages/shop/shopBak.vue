<template>
  <pageWrapper class="shop-manage">
    <view class="content">

    <!-- 店铺基本信息 -->
    <view class="shop-info-card z-glass-card">
      <view class="shop-header">
        <up-image class="shop-logo"  :src="shopInfo.logo || '/static/images/logo.png'" mode="aspectFill" width="60px" height="60px" border-radius="8px"></up-image>
        <view class="shop-basic-info">
          <text class="shop-name">{{shopInfo.name}}</text>
          <view class="shop-status {{shopInfo.state}}">
            <text>{{statusEnum[shopInfo.state]}}</text>
          </view>
        </view>
      </view>
      
      <view class="shop-stats">
        <view class="stat-item">
          <text class="stat-number">{{shopInfo.visitorCount || 0}}</text>
          <text class="stat-label">总访客</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{shopInfo.orderCount || 0}}</text>
          <text class="stat-label">总订单</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{shopInfo.ratingScore || '0.0'}}</text>
          <text class="stat-label">评分</text>
        </view>
      </view>
    </view>
    
    <!-- 功能按钮 -->
    <view class="function-grid">
      <view class="function-item z-glass-card" v-for="(item, index) in functionItems" :key="index" @click="navigateTo(item.url, item.id)">
        <view class="function-icon" :class="item.iconClass"></view>
        <text class="function-name">{{item.name}}</text>
        <text class="function-desc">{{item.desc}}</text>
      </view>
    </view>
    
    <!-- 其他管理功能 -->
    <view class="more-functions z-glass-card">
      <view class="z-cell-title">其他功能</view>
        <up-cell-group>
          <up-cell
            title="店铺状态"
            :value="shopInfo.status === 'open' ? '营业中' : '休息中'"
            @click="toggleShopStatus"
            is-link
          >
            <template #icon>
              <view class="more-function-icon" :class="shopInfo.status === 'open' ? 'close-icon' : 'open-icon'"></view>
            </template>
            <template #value>
              <text class="cell-value" :class="shopInfo.status === 'open' ? 'open-status' : 'closed-status'">{{shopInfo.status === 'open' ? '营业中 (点击设为休息)' : '休息中 (点击设为营业)'}}</text>
            </template>
          </up-cell>
          <up-cell
            title="店铺数据"
            value="查看统计数据"
            @click="viewShopAnalytics"
            is-link
          >
            <template #icon>
              <view class="more-function-icon analytics-icon"></view>
            </template>
          </up-cell>
          <up-cell
            title="店铺二维码"
            value="生成并分享"
            @click="viewQRCode"
            is-link
          >
            <template #icon>
              <view class="more-function-icon qrcode-icon"></view>
            </template>
          </up-cell>
        </up-cell-group>
      </view> 
    </view>
    
    <!-- 二维码选项弹窗 -->
    <!-- <up-popup :show="showQRCodePopup" mode="bottom" @close="closeQRCodePopup">
      <view class="qrcode-options">
        <view class="qrcode-option" @click="generateShopQRCode">
          <text class="option-title">店铺详情二维码</text>
          <text class="option-desc">用于展示店铺基本信息</text>
        </view>
        <view class="qrcode-option" @click="generateMenuQRCode">
          <text class="option-title">酒单二维码</text>
          <text class="option-desc">用于直接查看店铺酒单</text>
        </view>
        <view class="qrcode-cancel" @click="closeQRCodePopup">取消</view>
      </view>
    </up-popup> -->
    
    <!-- 二维码预览弹窗 -->
    <up-popup :show="showPreviewPopup" mode="center" @close="closePreviewPopup">
      <view class="qrcode-preview">
        <view class="preview-header">
          <text class="preview-title">{{currentQRCodeType === 'shop' ? '店铺二维码' : '酒单二维码'}}</text>
          <view class="close-btn" @click="closePreviewPopup">×</view>
        </view>
        <view class="preview-content">
          <up-image class="qrcode-image" :src="currentQRCode" mode="aspectFit" width="400rpx" height="400rpx" margin-bottom="30rpx"></up-image>
          <text class="qrcode-tip">长按保存或分享该二维码</text>
        </view>
        <view class="preview-actions">
          <up-button class="action-btn save-btn" text="保存到相册" @click="saveQRCode"></up-button>
          <up-button class="action-btn share-btn" text="分享给好友" open-type="share"></up-button>
        </view>
      </view>
    </up-popup>
  </pageWrapper>
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'
import pageWrapper from "@/components/page/index.vue";
import { onMounted, reactive, ref } from "vue";
import { getShopList, deleteShop, addShop, editShop, getShopDetail } from "@/api/shopManage";

const statusEnum = {
  open: '营业',
  close: '暂停营业 ',
  close_manual: '暂停营业(手动)',
}

// 定义组件选项
defineOptions({
  name: "ShopManagePage",
});

// 店铺信息数据
// let shopInfo = reactive({
//   id: '',
//   logo: '',
//   shopName: '',
//   isOpen: true,
//   status: 'open',
//   address: '北京市朝阳区三里屯SOHO 3号楼2层',
//   openTime: '18:00',
//   closeTime: '02:00',
//   phone: '010-12345678',
//   tags: ['静吧', '精致', '鸡尾酒', '情调', '约会'],
//   visitorCount: 1245,
//   orderCount: 368,
//   ratingScore: '4.5'
// }
// });
let shopInfo = ref({})

// 编辑表单数据
const editForm = reactive({
  name: '',
  address: '',
  openTime: '',
  closeTime: '',
  phone: '',
  tags: [] as string[]
});

// 标签输入
const tagInput = ref('');

// 二维码相关数据
const currentQRCodeType = ref<'shop' | 'menu'>('shop');
const currentQRCode = ref('');
const showQRCodePopup = ref(false);
const showPreviewPopup = ref(false);
const showEditPopup = ref(false);

// 功能项数据
const functionItems = ref([
  { name: '店铺详情', desc: '管理店铺基本信息', url: '/pages/shopDetail/shopDetail', iconClass: 'shop-detail-icon' },
  { name: '店铺酒单', desc: '管理店内饮品菜单', url: '/pages/shopMenu/shopMenu', iconClass: 'shop-menu-icon' },
  { name: '店内游戏', desc: '管理店内互动游戏', url: '/pages/shopGames/shopGames', iconClass: 'shop-games-icon' },
  { name: '员工管理', desc: '管理员工和特邀嘉宾', url: '/pages/shopStaff/shopStaff', iconClass: 'shop-staff-icon' },
  { name: '桌位管理', desc: '管理店铺桌位信息', url: '/pages/tableManage/tableManage', iconClass: 'table-manage-icon' },
  { name: '门票设置', desc: '定制门票酒水数量和使用时间', url: '/pages/ticketSettings/ticketSettings', iconClass: 'ticket-settings-icon' }
]);


// 获取店铺信息
const getShopInfo = async (shopId) => {
  // 实际项目中，这里应该调用接口获取店铺信息
  console.log('获取店铺信息');
  try {
	// const res = await getShopList({
	// 	pageNum: 1,
	// 	pageSize: 10,
	// });
  const res = await getShopDetail({
    id: shopId,
  });
	// console.log(res); 
  shopInfo.value = res.data || {};
  console.log(shopInfo,21234)
  } catch (error) {
	console.log(error);
  }
};

// 切换店铺营业状态
const toggleShopStatus = () => {
  // 实际项目中，这里应该调用接口修改店铺状态
  shopInfo.isOpen = !shopInfo.isOpen;
  shopInfo.status = shopInfo.isOpen ? 'open' : 'closed';
  
  uni.showToast({
    title: shopInfo.isOpen ? '已设为营业中' : '已设为休息',
    icon: 'success'
  });
};

// 编辑店铺信息
const editShopInfo = () => {
  showEditPopup.value = true;
};

// 取消编辑
const cancelEdit = () => {
  showEditPopup.value = false;
};

// 保存店铺信息
const saveShopInfo = () => {
  // 表单验证
  if (!editForm.name) {
    uni.showToast({
      title: '店铺名称不能为空',
      icon: 'none'
    });
    return;
  }
  
  if (!editForm.address) {
    uni.showToast({
      title: '店铺地址不能为空',
      icon: 'none'
    });
    return;
  }
  // 关闭弹窗
  showEditPopup.value = false;
  
  uni.showToast({
    title: '保存成功',
    icon: 'success'
  });
};

// 添加标签
const addTag = () => {
  if (!tagInput.value) return;
  
  if (editForm.tags.length >= 10) {
    uni.showToast({
      title: '最多添加10个标签',
      icon: 'none'
    });
    return;
  }
  
  // 检查是否已存在
  if (editForm.tags.indexOf(tagInput.value) !== -1) {
    uni.showToast({
      title: '标签已存在',
      icon: 'none'
    });
    return;
  }
  
  editForm.tags.push(tagInput.value);
  tagInput.value = '';
};

// 移除标签
const removeTag = (index: number) => {
  editForm.tags.splice(index, 1);
};

// 页面导航
const navigateTo = (url: string) => {
  uni.navigateTo({url: `${url}?shopId=${shopInfo.id}`});
};

// 创建活动
const createActivity = () => {
  uni.navigateTo({
    url: '/pages/profile/activity-edit?type=create'
  });
};

// 创建酒品
const createDrink = () => {
  uni.navigateTo({
    url: '/pages/profile/drink-edit?type=create'
  });
};

// 显示二维码选项
const showQRCodeOptions = () => {
  showPreviewPopup.value = true;
};

// 关闭二维码选项
const closeQRCodePopup = () => {
  showPreviewPopup.value = false;
};

// 生成店铺详情二维码
const generateShopQRCode = () => {
  currentQRCodeType.value = 'shop';
  uni.showLoading({
    title: '生成中...'
  });
  
  // 实际项目中这里需要调用接口生成二维码
  // 这里使用模拟数据
  setTimeout(() => {
    uni.hideLoading();
    currentQRCode.value = '/static/images/shop-qrcode.png';
    showPreviewPopup.value = true;
  }, 1000);
  
  closeQRCodePopup();
};

// 生成酒单二维码
const generateMenuQRCode = () => {
  currentQRCodeType.value = 'menu';
  uni.showLoading({
    title: '生成中...'
  });
  
  // 实际项目中这里需要调用接口生成二维码
  // 这里使用模拟数据
  setTimeout(() => {
    uni.hideLoading();
    currentQRCode.value = '/static/images/menu-qrcode.png';
    showPreviewPopup.value = true;
  }, 1000);
  
  closeQRCodePopup();
};

// 关闭预览弹窗
const closePreviewPopup = () => {
  showPreviewPopup.value = false;
};

// 保存二维码到相册
const saveQRCode = () => {
  uni.saveImageToPhotosAlbum({
    filePath: currentQRCode.value,
    success: () => {
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      });
    },
    fail: () => {
      uni.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  });
};

// 导航到点单模式选择页面
const navigateToOrderMode = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  });
};

// 查看店铺数据
const viewShopAnalytics = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  });
};

// 查看店铺二维码
const viewQRCode = () => {
  showQRCodeOptions();
};

onLoad((query) => {
//  query.shopId = '10000008'
 if(query.shopId){
  shopInfo.id = query.shopId
  getShopInfo(query.shopId)
 }
})
</script>

<style lang="scss" scoped>
@import '@/uni.scss';
/* 主容器 */
.shop-manage {
  .content{

    padding: $up-box-pd;
  }
}

/* 毛玻璃卡片效果 */
.glass-card {
  margin-bottom: 15rpx;
}

/* 页面标题 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx;
  margin-bottom: 20rpx;
}

.page-title {
  font-size: 20rpx;
  font-weight: bold;
  color: #333;
}

/* 店铺基本信息卡片 */
.shop-info-card {
  padding: 15rpx;
  margin-bottom: $up-box-mg;
}

.shop-header {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.shop-logo {
  width: 60rpx;
  height: 60rpx;
  border-radius: 8rpx;
  margin-right: 12rpx;
}

.shop-basic-info {
  flex: 1;
}

.shop-name {
  font-size: $up-font-lg;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
}

.shop-status {
  display: inline-block;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: $up-font-sm;
  color: white;
  margin-left: 6rpx;
}

.shop-status.open {
  background-color: #34C759;
}

.shop-status.close {
  background-color: #FF3B30;
}

.shop-status.close_manual {
  background-color: #0caa88;
}

/* 店铺统计数据 */
.shop-stats {
  display: flex;
  justify-content: space-around;
  padding: 10rpx 0;
  border-top: 1rpx solid #f0f0f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: $up-font-md;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
}

.stat-label {
  font-size: $up-font-sm;
  color: #999;
}

/* 功能网格 */
.function-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15rpx;
  margin-bottom: 20rpx;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  transition: all 0.3s;
}

.function-item:active {
  transform: scale(0.95);
}

.function-icon {
  width: 80rpx;
  height: 80rpx;
  background-size: cover;
  background-position: center;
  margin-bottom: 10rpx;
}

/* 各个功能的图标 */
// .shop-detail-icon {
//   background-image: url('/static/images/icons/shop-detail.png');
// }

// .shop-menu-icon {
//   background-image: url('/static/images/icons/shop-menu.png');
// }

// .shop-games-icon {
//   background-image: url('/static/images/icons/shop-games.png');
// }

// .shop-staff-icon {
//   background-image: url('/static/images/icons/shop-staff.png');
// }

// .table-manage-icon {
//   background-image: url('/static/images/icons/table-manage.png');
// }

// .ticket-settings-icon {
//   background-image: url('/static/images/icons/ticket-settings.png');
// }

/* 设置模拟图标的内部伪元素 */
.shop-detail-icon::before,
.shop-menu-icon::before,
.shop-games-icon::before,
.shop-staff-icon::before,
.table-manage-icon::before,
.ticket-settings-icon::before {
  content: "";
  display: block;
  position: absolute;
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
  background-color: rgba(255, 255, 255, 0.8);
  mask-size: contain;
  mask-position: center;
  mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
}

.function-name {
  font-size: $up-font-md;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
}

.function-desc {
  font-size: $up-font-sm;
  color: #999;
  text-align: center;
}

/* 其他功能列表 */
.more-functions {
  padding: 0;
  overflow: hidden;
}


.more-function-item {
  display: flex;
  align-items: center;
  padding: $up-box-pd;
  border-bottom: 1rpx solid #f0f0f0;
}

.more-function-item:last-child {
  border-bottom: none;
}

.more-function-icon {
  width: 24rpx;
  height: 24rpx;
  background-size: cover;
  background-position: center;
  margin-right: 10rpx;
}

.open-icon,
.close-icon,
.analytics-icon,
.qrcode-icon {
  background-color: #3aa9e8;
  border-radius: 50%;
}

.more-function-name {
  flex: 1;
  font-size: 14rpx;
  color: #333;
}

.more-function-arrow {
  width: 8rpx;
  height: 8rpx;
  border-top: 2rpx solid #999;
  border-right: 2rpx solid #999;
  transform: rotate(45deg);
  margin-right: 8rpx;
} 
/* 二维码选项样式 */
.qrcode-options {
  background-color: #fff;
  border-radius: 20rpx 20rpx 0 0;
  padding: 30rpx;
}

.qrcode-option {
  padding: 30rpx 0;
  border-bottom: 1rpx solid #eee;
}

.option-title {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.option-desc {
  font-size: 24rpx;
  color: #999;
  display: block;
}

.qrcode-cancel {
  text-align: center;
  padding: 30rpx 0;
  color: #666;
  font-size: 32rpx;
}

/* 二维码预览样式 */
.qrcode-preview {
  background-color: #fff;
  border-radius: 20rpx;
  width: 600rpx;
}

.preview-header {
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-title {
  font-size: 32rpx;
  font-weight: bold;
}

.close-btn {
  font-size: 40rpx;
  color: #999;
  padding: 0 20rpx;
}

.preview-content {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-image {
  width: 400rpx;
  height: 400rpx;
  margin-bottom: 30rpx;
}

.qrcode-tip {
  font-size: 28rpx;
  color: #666;
}

.preview-actions {
  padding: 30rpx;
  display: flex;
  border-top: 1rpx solid #eee;
}

.action-btn {
  flex: 1;
  margin: 0 10rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.save-btn {
  background-color: #f5f5f5;
  color: #666;
}

.share-btn {
  background-color: #1890ff;
  color: #fff;
}

/* cell样式 */
.cell-value {
  font-size: 14px;
  color: #666;
}

.open-status {
  color: #34C759;
}

.closed-status {
  color: #FF3B30;
}
</style>