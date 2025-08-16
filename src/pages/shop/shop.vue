<template>
  <view class="shop-page">
    <van-nav-bar
      title="店铺详情"
      left-arrow
      @click-left="onClickLeft"
      fixed
      placeholder
    />
    
    <view class="shop-info">
      <van-image
        width="100%"
        height="400rpx"
        :src="shopInfo.thumb"
        fit="cover"
      />
      
      <view class="info-content">
        <view class="title">{{ shopInfo.title }}</view>
        <view class="tags">
          <van-tag
            v-for="(tag, index) in shopInfo.tags"
            :key="index"
            color="#ffe1e1"
            text-color="#ad0000"
            class="tag"
          >{{ tag }}</van-tag>
        </view>
        <view class="business-hours">
          <text class="label">营业时间：</text>
          <text>{{ shopInfo.businessHours }}</text>
        </view>
        <view class="address">
          <text class="label">店铺地址：</text>
          <text>{{ shopInfo.address }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'

interface ShopInfo {
  title: string
  thumb: string
  tags: string[]
  businessHours: string
  address: string
}

const shopInfo = ref<ShopInfo>({
  title: '',
  thumb: '',
  tags: [],
  businessHours: '',
  address: ''
})

onMounted(() => {
  // 获取路由参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const shopId = currentPage.$page?.options?.id

  // TODO: 根据 shopId 获取店铺信息
  // 这里模拟数据
  shopInfo.value = {
    title: '海伦司小酒馆',
    thumb: 'https://www.shuomingshu.cn/wp-content/uploads/images/2023/06/23/4b30c4d172cd4c709d170e8194cae245_ajwo1tt5eln.jpg',
    tags: ['标签1', '标签2'],
    businessHours: '10:00-22:00',
    address: '北京市朝阳区xxx街道xxx号'
  }
})

const onClickLeft = () => {
  wx.navigateBack()
}
</script>

<style lang="scss">
.shop-page {
  min-height: 100vh;
  background-color: #f7f8fa;

  .shop-info {
    .info-content {
      padding: 30rpx;
      background-color: #fff;

      .title {
        font-size: 36rpx;
        font-weight: bold;
        margin-bottom: 20rpx;
      }

      .tags {
        margin-bottom: 20rpx;
        .tag {
          margin-right: 10rpx;
        }
      }

      .business-hours,
      .address {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 16rpx;

        .label {
          color: #333;
          font-weight: 500;
        }
      }
    }
  }
}


</style>