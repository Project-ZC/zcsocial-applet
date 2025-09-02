<template>
  <!-- 商品明细card -->
  <view class="good-item z-glass-card">
    <!-- <movable-area> -->
    <!-- 第一列：商品图片 -->
    <view class="good-image">
      <up-image
        :src="getDownloadUrl(props.goodItem.photo)"
        width="120rpx"
        height="120rpx"
        mode="aspectFill"
        radius="8rpx"
      ></up-image>
    </view>

    <!-- 第二列：商品信息 -->
    <view class="good-info">
      <view class="good-name">
        <text>{{ props.goodItem.name }}</text>
        <slot name="title"></slot>
      </view>
      <!-- <view class="good-desc">{{ props.goodItem.description }}</view> -->
      <view class="sku-size">{{ availableSkus[0]?.size }}{{ availableSkus[0]?.unit }}</view>
      <!-- 多规格商品显示 -->
      <!-- <view class="sku-selector">
        <view class="sku-options">
          <view
            v-for="sku in availableSkus"
            :key="sku.id"
            class="sku-option"
            :class="{ active: selectedSkuId === sku.id }"
            @click="selectSku(sku)"
          >
            <text class="sku-size">{{ sku.size }}{{ sku.unit }}</text>
            <text class="sku-price">¥{{ sku.price }}</text>
          </view>
        </view>
      </view> -->

      <!-- 单规格商品显示 -->
      <view class="good-price" v-if="availableSkus?.length > 0">
        <text class="price-symbol">¥</text>
        <text class="price-value">{{ availableSkus[0]?.price }}</text>
      </view>
    </view>

    <!-- 第三列：操作按钮 -->
    <view class="good-actions">
      <slot name="actions" :item="props.goodItem" :index="props.index" :selectedSku="selectedSku"></slot>
    </view>
    <!-- </view> -->
  </view>
</template>

<script setup lang="ts">
import { reactive, computed, ref, watch } from 'vue';
import { getDownloadUrl } from '@/api/common/upload';
import type { ProductSku, GoodItem } from '@/types/product';

const props = defineProps<{
  goodItem: GoodItem;
  index: number;
}>();

// 定义事件
const emit = defineEmits<{
  skuChange: [sku: ProductSku];
}>();

// 选中的规格ID
const selectedSkuId = ref<number | null>(null);

// 计算是否有多个规格
const hasMultipleSkus = computed(() => {
  return props.goodItem.productSkus && props.goodItem.productSkus.length > 1;
});

// 获取可用的规格（状态为0的规格）
const availableSkus = computed(() => {
  if (!props.goodItem.productSkus) return [];
  return props.goodItem.productSkus.filter(sku => sku.status === '0');
});

// 当前选中的规格
const selectedSku = computed(() => {
  if (!selectedSkuId.value) return null;
  return availableSkus.value.find(sku => sku.id === selectedSkuId.value);
});

// 当前显示的价格
const currentPrice = computed(() => {
  if (selectedSku.value) {
    return selectedSku.value.price;
  }
  return props.goodItem.price;
});

// 选择规格
const selectSku = (sku: ProductSku) => {
  selectedSkuId.value = sku.id;
  emit('skuChange', sku);
};

// 初始化选中第一个可用规格
watch(
  () => props.goodItem,
  newItem => {
    if (availableSkus.value.length > 0) {
      selectedSkuId.value = availableSkus.value[0].id;
    }
  },
  { immediate: true }
);

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
  background-color: var(--bg-1);
}

/* 第一列：商品图片 */
.good-image {
  flex-shrink: 0;
  margin-right: 16rpx;
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

/* 规格选择器样式 */
.sku-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.sku-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rpx 8rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 8rpx;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #ff6b35;
  }

  &.active {
    border-color: #ff6b35;
    background-color: #fff5f2;
  }
}

.sku-size {
  font-size: $up-font-sm;
  color: var(--text-1);
  font-weight: 500;
}

.sku-price {
  font-size: $up-font-sm;
  color: #ff6b35;
  font-weight: 600;
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
  font-size: 30rpx;
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
