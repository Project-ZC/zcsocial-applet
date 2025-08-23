<template>
  <view class="shop-card-box">
    <view class="shop-card z-glass-card" :class="{ 'dark-theme': isDarkMode }" @click="handleItemClick">
      <view class="img-box">
        <up-image width="100%" height="100%" :src="shopInfo.thumb"></up-image>
      </view>
      <view class="content">
        <view class="title">
          <text class="title-text">{{ shopInfo.title }}</text>
          <text class="distance">{{ shopInfo.distance }}</text>
        </view>
        <!-- <view class="desc">
          <text>{{ shopInfo.desc }}</text>
        </view> -->
        <view class="tags">
          <view class="tag" v-for="(tag, index) in shopInfo.tags" :key="index">
            <up-tag type="primary" plain plainFill size="mini">{{ tag }}</up-tag>
          </view>
        </view>
        <view class="time">
          <view class="time-left">
            <text>营业时间:</text>
            <text>{{ shopInfo.businessHours }}</text>
          </view>
          <view class="time-right">
            <businessStatus :state="shopInfo.status"></businessStatus>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useThemeStore } from '@/stores/modules/theme';
import { computed, withDefaults } from 'vue';
import BusinessStatus from '@/components/business-status/index.vue';

interface ShopInfo {
  title: string;
  thumb: string;
  distance: string;
  tags: string[];
  businessHours: string;
}

const props = withDefaults(
  defineProps<{
    shopInfo: ShopInfo;
  }>(),
  {}
);

const emit = defineEmits(['itemClick']);

const handleItemClick = () => {
  emit('itemClick', props.shopInfo);
};

defineOptions({
  options: { styleIsolation: 'shared' },
});
</script>

<style lang="scss" scoped>
.shop-card-box {
  padding: 5rpx;
  box-sizing: border-box;
  .shop-card {
    padding: 20rpx;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
      box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.3);
    }
    .img-box {
      width: 160rpx;
      height: 160rpx;
      border-radius: 16rpx;
      overflow: hidden;
    }
    .content {
      width: 72%;
      .title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10rpx;
        .title-text {
          font-size: 30rpx;
          font-weight: bold;
        }
        .distance {
          font-size: 24rpx;
          color: #666;
        }
      }
      .desc {
        margin: 5rpx 0;
        font-size: 24rpx;
        color: #666;
      }

      .tags {
        margin: 5rpx 0;
        display: flex;
        .tag {
          margin-right: 10rpx;
        }
      }

      .time {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 26rpx;
        text:first-child {
          color: #666;
        }

        text:last-child {
          color: #000;
        }
      }
    }
  }
}
</style>
