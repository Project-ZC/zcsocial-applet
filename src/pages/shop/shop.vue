<!-- 店铺 -->
<template>
  <pageWrapper :showTabbar="true">
    <view class="shop">
	   <!-- 店铺基本信息 -->
    <view class="shop-info-card z-glass-card">
      <view class="shop-header">
        <up-image class="shop-logo"  :src="shopInfo.logo || '/static/images/logo.png'" mode="aspectFill" width="60px" height="60px" border-radius="8px"></up-image>
        <view class="shop-basic-info">
          <text class="shop-name">{{shopInfo.name}}</text>
          
		  <view class="shop-intro">
			{{shopInfo.intro}}
		  </view>
		  <view class="shop-date">
			营业时间：{{shopInfo.openTime}} - {{shopInfo.closeTime}}
		  </view>
        </view>

		<view class="shop-address">
			<view class="shop-status {{shopInfo.state}}">
            <text>{{statusEnum[shopInfo.state]}}</text>
          </view>

		  <up-button type="primary" shape="circle" @click="toggleShopStatus">
			{{shopInfo.state == 'open'?'休息':'营业'}}
          </up-button>
		</view>
      </view>
    </view>
      <view class="z-glass-card">
        <up-cell-group v-for="main in state.cellList" :key="main.title">
          <view class="z-cell-title">{{ main.title }}</view>
          <up-cell
            v-for="item in main.children"
            :key="item.title"
            :icon="item.icon"
            :title="item.title"
            :isLink="item.showArrow"
            @click="itemClick(item)"
          ></up-cell>
        </up-cell-group>
      </view>
    </view>
  </pageWrapper>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import pageWrapper from '@/components/page/index.vue';
import { useThemeStore } from '@/stores/modules/theme';
import { useUserStore } from '@/stores/modules/user';
import { ActionType } from '@/enums/order';
import { getShopList,getShopConfigList } from '@/api/shopManage';

const userStore = useUserStore();

const statusEnum = {
  open: '营业',
  close: '暂停营业 ',
  close_manual: '暂停营业(手动)',
}
const state = reactive({
  cellList: [
    {
      title: '店铺详情',
      children: [
        {
          title: '店铺详情',
          icon: 'star-fill',
          url: '/pages/shopDetail/shopDetail',
          showArrow: true,
        },
        {
          title: '报名审核',
          icon: 'star-fill',
          url: '',
          showArrow: true,
        },
        {
          title: '店铺订单',
          icon: 'star-fill',
          url: '/pages/merchant/orders',
          showArrow: true,
        },
        {
          title: '数据分析',
          icon: 'star-fill',
          url: '',
          showArrow: true,
        },
        {
          title: '店铺二维码',
          icon: 'star-fill',
          url: '',
          type: 'qrcode',
          showArrow: true,
        },
        {
          title: '订单卡片演示',
          icon: 'star-fill',
          url: '/pages/orderDemo/orderDemo',
          showArrow: true,
        },
        {
          title: '奶茶点单',
          icon: 'star-fill',
          url: '/pages/milkTeaOrder/milkTeaOrder',
          showArrow: true,
        },
        {
          title: '奶茶点单演示',
          icon: 'star-fill',
          url: '/pages/milkTeaDemo/milkTeaDemo',
          showArrow: true,
        },
      ],
    },
    {
      title: '店铺管理',
      children: [
        {
          title: '菜单管理',
          icon: 'setting-fill',
          url: '/pages/shopMenu/shopMenu',
          showArrow: true,
        },
        {
          title: '游戏管理',
          icon: 'setting-fill',
          url: '/pages/shopGames/shopGames',
          showArrow: true,
        },
        {
          title: '桌位管理',
          icon: 'setting-fill',
          url: '/pages/tableManage/tableManage',
          showArrow: true,
        },
        {
          title: '门票设置',
          icon: 'setting-fill',
          url: '/pages/ticketSettings/ticketSettings',
          showArrow: true,
        },
        {
          title: '员工管理',
          icon: 'setting-fill',
          url: '/pages/shopStaff/shopStaff',
          showArrow: true,
        },
      ],
    },
  ],
});
let shopInfo = ref({})

const GetShopConfigList = async () => {
  try {
    let params = {
    //   pageNum: 1,
    //   pageSize: 999,
	// id: userStore.userInfo?.id
    };
    const res = await getShopConfigList(params);
    console.log(res);
    if (res.data?.length) {
      shopInfo.value = res.data[0] || {};
    }
  } catch (error) {}
};

const itemClick = (item: any) => {
  if (item.url) {
    navigateTo(item.url);
  } else if (item.type == 'qrcode') {
    uni.showModal({
      title: '店铺二维码',
      content: shopInfo.name + '的二维码功能开发中，敬请期待！',
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
  const shopId = shopInfo.value?.id || '';
  url &&
    uni.navigateTo({
      url: `${url}?shopId=${shopId}`,
    });
};

// 切换店铺营业状态
const toggleShopStatus = () => {
  // 实际项目中，这里应该调用接口修改店铺状态
  shopInfo.state = shopInfo.state == 'open' ? 'close' : 'open';
  uni.showToast({
    title: shopInfo.state == 'open' ? '已设为营业中' : '已设为休息',
    icon: 'success'
  });
};

onMounted(() => {
  GetShopConfigList();
});

// 下拉刷新监听
onPullDownRefresh(async () => {
  try {
    await GetShopConfigList();
  } finally {
    uni.stopPullDownRefresh();
  }
});

defineOptions({
  styleIsolation: 'shared',
});
</script>

<style lang="scss" scoped>
.shop {
  padding: $up-box-pd;
  .tags {
    flex-wrap: wrap;
    margin-top: 8rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
  .edit-btn {
    margin: 0 auto;
    margin-top: 20rpx;
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

}
</style>
