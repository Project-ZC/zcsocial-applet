<template>
  <!-- <up-swipe-action>
		<up-swipe-action-item :options="options1">
			<view class="swipe-action up-border-top up-border-bottom">
				<view class="swipe-action__content">
					<text class="swipe-action__content__text">基础使用</text>
				</view>
			</view>
		</up-swipe-action-item>
	</up-swipe-action> -->
  <!-- 商品明细card -->
  <view class="good-item z-glass-card">
    <!-- <movable-area> -->
    <!-- 第一列：商品图片 -->
    <view class="good-image">
      <up-image :src="props.goodItem.image" width="120rpx" height="120rpx" mode="aspectFill" radius="8rpx"></up-image>
    </view>

    <!-- 第二列：商品信息 -->
    <view class="good-info">
      <view class="good-name">
        <text>{{ props.goodItem.name }}</text>
        <slot name="title"></slot>
      </view>
      <view class="good-desc">{{ props.goodItem.description }}</view>
      <view class="good-price">
        <text class="price-symbol">¥</text>
        <text class="price-value">{{ props.goodItem.price }}</text>
      </view>
    </view>

    <!-- 第三列：操作按钮 -->
    <view class="good-actions">
      <slot name="actions" :item="props.goodItem" :index="props.index"></slot>
    </view>
    <!-- </view> -->
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const props = defineProps({
  goodItem: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const options1 = reactive([
  {
    text: '删除',
  },
]);
defineOptions({
  options: {
    styleIsolation: 'shared',
  },
});
</script>

<style lang="scss" scoped>
/* 商品明细card样式 */
.good-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

/* 第一列：商品图片 */
.good-image {
  flex-shrink: 0;
  margin-right: 24rpx;
}

/* 第二列：商品信息 */
.good-info {
  flex: 1;
  margin-right: 24rpx;
}

.good-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.good-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 16rpx;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.good-price {
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
.good-actions {
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
//   .good-item {
//     flex-direction: column;
//     align-items: flex-start;
//   }

//   .good-image {
//     margin-right: 0;
//     margin-bottom: 20rpx;
//   }

//   .good-info {
//     margin-right: 0;
//     margin-bottom: 20rpx;
//     width: 100%;
//   }

//   .good-actions {
//     flex-direction: row;
//     width: 100%;
//     justify-content: flex-end;
//   }
// }
</style>
