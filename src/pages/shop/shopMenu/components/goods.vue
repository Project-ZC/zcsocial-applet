<template>
  <!-- 商品明细card -->
  <view class="goods-card">
    <view class="goods-item z-glass-card" v-for="(item, index) in props.goodsList" :key="index">
      <!-- 第一列：商品图片 -->
      <view class="goods-image">
        <up-image :src="item.image" width="120rpx" height="120rpx" mode="aspectFill" radius="8rpx"></up-image>
      </view>

      <!-- 第二列：商品信息 -->
      <view class="goods-info">
        <view class="goods-name">{{ item.name }}</view>
        <view class="goods-desc">{{ item.description }}</view>
        <view class="goods-price">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ item.price }}</text>
        </view>
      </view>

      <!-- 第三列：操作按钮 -->
      <view class="goods-actions">
        <slot name="actions" :item="item" :index="index"></slot>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  goodsList: any[];
}>();

defineOptions({
  options: {
    styleIsolation: 'shared',
  },
});
</script>

<style lang="scss" scoped>
/* 商品明细card样式 */
.goods-card {
  padding: 20rpx;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

/* 第一列：商品图片 */
.goods-image {
  flex-shrink: 0;
  margin-right: 24rpx;
}

/* 第二列：商品信息 */
.goods-info {
  flex: 1;
  margin-right: 24rpx;
}

.goods-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.goods-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 16rpx;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.goods-price {
  display: flex;
  align-items: baseline;
  height: 30rpx;
}

.price-symbol {
  font-size: 24rpx;
  color: #ff6b35;
  margin-right: 4rpx;
}

.price-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #ff6b35;
}

/* 第三列：操作按钮 */
.goods-actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  flex-shrink: 0;
}

.action-btn {
  min-width: 120rpx;
}

/* 响应式布局 */
// @media (max-width: 750rpx) {
//   .goods-item {
//     flex-direction: column;
//     align-items: flex-start;
//   }

//   .goods-image {
//     margin-right: 0;
//     margin-bottom: 20rpx;
//   }

//   .goods-info {
//     margin-right: 0;
//     margin-bottom: 20rpx;
//     width: 100%;
//   }

//   .goods-actions {
//     flex-direction: row;
//     width: 100%;
//     justify-content: flex-end;
//   }
// }
</style>
