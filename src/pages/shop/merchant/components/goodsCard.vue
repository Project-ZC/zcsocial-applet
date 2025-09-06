<template>
  <view class="goods-card">
    <view class="goods-img">
      <up-image width="80px" height="80px" radius="10px" :src="data.goods_cover" mode="aspectFill"></up-image>
    </view>
    <view class="goods-info">
      <view class="goods-name">{{ data.goods_name }}</view>
      <view class="goods-desc">{{ data.goods_desc }}</view>
      <view class="goods-price">
        <text class="current-price">¥{{ data.goods_price }}</text>
        <text class="original-price" v-if="data.goods_original_price">¥{{ data.goods_original_price }}</text>
      </view>
      <up-button text="选规格" size="mini" @click="showSpecModal" color="#000000"></up-button>
    </view>

    <!-- 规格选择弹框 -->
    <up-popup v-model:show="showSpec" mode="center" :safe-area-inset-bottom="true" bgColor="transparent">
      <view class="spec-modal">
        <view class="spec-header">
          <view class="spec-title">选择规格</view>
          <view class="spec-close" @click="closeSpecModal">
            <up-icon name="close" size="16" color="var(--text-3)"></up-icon>
          </view>
        </view>

        <scroll-view scroll-y class="spec-content">
          <view class="goods-preview">
            <up-image width="120px" height="120px" radius="8px" :src="data.goods_cover" mode="aspectFill"></up-image>
            <view class="goods-info-preview">
              <view class="goods-name-preview">{{ data.goods_name }}</view>
              <view class="goods-price-preview">¥{{ data.goods_price }}</view>
            </view>
          </view>

          <view class="spec-options">
            <view class="spec-group" v-for="(specGroup, groupIndex) in specOptions" :key="groupIndex">
              <view class="spec-group-title">{{ specGroup.name }}</view>
              <view class="spec-items">
                <view
                  class="spec-item"
                  :class="{ active: selectedSpecs[groupIndex] === item.value }"
                  v-for="item in specGroup.options"
                  :key="item.value"
                  @click="selectSpec(groupIndex, item.value)"
                >
                  {{ item.label }}
                </view>
              </view>
            </view>
          </view>

          <view class="spec-quantity">
            <view class="quantity-label">数量</view>
            <up-number-box v-model="specQuantity" :min="1" :max="99" @change="handleQuantityChange">
              <template #minus>
                <view class="minus" v-if="specQuantity > 1">
                  <up-icon name="minus" size="12" color="var(--text-2)"></up-icon>
                </view>
              </template>
              <template #input>
                <text class="input">{{ specQuantity }}</text>
              </template>
              <template #plus>
                <view class="plus">
                  <up-icon name="plus" color="#FFFFFF" size="12"></up-icon>
                </view>
              </template>
            </up-number-box>
          </view>
        </scroll-view>

        <view class="spec-footer">
          <view class="total-price">
            <text class="total-label">总计：</text>
            <text class="total-amount">¥{{ totalPrice }}</text>
          </view>
          <view class="confirm-btn" @click="confirmSpec">确认选择</view>
        </view>
      </view>
    </up-popup>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

// 定义接口
interface GoodsItem {
  goods_name: string;
  goods_cover: string;
  goods_desc: string;
  goods_price: string;
  goods_original_price: string;
  goods_number: number;
  goods_image: string[];
}

interface SpecOption {
  label: string;
  value: string;
  price?: number;
}

interface SpecGroup {
  name: string;
  options: SpecOption[];
}

// 定义props
interface Props {
  data: GoodsItem;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({
    goods_name: '',
    goods_cover: '',
    goods_desc: '',
    goods_price: '0',
    goods_original_price: '',
    goods_number: 0,
    goods_image: [],
  }),
});

// 定义事件
const emit = defineEmits<{
  change: [number: number];
  specChange: [specs: Record<string, string>, quantity: number];
}>();

// 响应式数据
const goodsNumber = ref(props.data.goods_number);
const showSpec = ref(false);
const specQuantity = ref(1);
const selectedSpecs = ref<Record<number, string>>({});

// 规格选项数据
const specOptions = ref<SpecGroup[]>([
  {
    name: '规格',
    options: [
      { label: '小杯', value: 'small', price: 0 },
      { label: '中杯', value: 'medium', price: 2 },
      { label: '大杯', value: 'large', price: 4 },
    ],
  },
  {
    name: '温度',
    options: [
      { label: '常温', value: 'normal' },
      { label: '热饮', value: 'hot' },
      { label: '冰饮', value: 'cold' },
    ],
  },
  {
    name: '糖度',
    options: [
      { label: '无糖', value: 'no-sugar' },
      { label: '微糖', value: 'light-sugar' },
      { label: '半糖', value: 'half-sugar' },
      { label: '全糖', value: 'full-sugar' },
    ],
  },
]);

// 计算总价
const totalPrice = computed(() => {
  const basePrice = parseFloat(props.data.goods_price);
  let additionalPrice = 0;

  // 计算规格额外价格
  Object.values(selectedSpecs.value).forEach(specValue => {
    specOptions.value.forEach(group => {
      const option = group.options.find(opt => opt.value === specValue);
      if (option && option.price) {
        additionalPrice += option.price;
      }
    });
  });

  return ((basePrice + additionalPrice) * specQuantity.value).toFixed(2);
});

// 监听props变化
watch(
  () => props.data.goods_number,
  newVal => {
    goodsNumber.value = newVal;
  }
);

// 方法
const handleNumberChange = (value: number) => {
  goodsNumber.value = value;
  emit('change', value);
};

const showSpecModal = () => {
  showSpec.value = true;
};

const closeSpecModal = () => {
  showSpec.value = false;
};

const selectSpec = (groupIndex: number, value: string) => {
  selectedSpecs.value[groupIndex] = value;
};

const handleQuantityChange = (value: number) => {
  specQuantity.value = value;
};

const confirmSpec = () => {
  // 检查是否所有规格都已选择
  const allSelected = specOptions.value.every((_, index) => selectedSpecs.value[index]);

  if (!allSelected) {
    uni.showToast({
      title: '请选择完整规格',
      icon: 'none',
    });
    return;
  }

  emit('specChange', selectedSpecs.value, specQuantity.value);
  closeSpecModal();
};
</script>

<style lang="scss" scoped>
.goods-card {
  padding: 20rpx;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: center;

  .goods-img {
    overflow: hidden;
  }

  .goods-info {
    padding: 20rpx;
    box-sizing: border-box;
    width: calc(100% - 100rpx);

    .goods-name {
      font-size: 32rpx;
      font-weight: 600;
      color: var(--text-1);
      margin-bottom: 8rpx;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .goods-desc {
      font-size: 26rpx;
      color: var(--text-2);
      margin-bottom: 16rpx;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .goods-price {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-bottom: 16rpx;

      .current-price {
        font-size: 36rpx;
        font-weight: 700;
        color: #ff4757;
      }

      .original-price {
        font-size: 24rpx;
        color: var(--text-3);
        text-decoration: line-through;
      }
    }
  }
}

// 规格弹框样式
.spec-modal {
  background: #fff;
  border-radius: 20rpx;
  max-height: 80vh;
  overflow: hidden;
  width: 90%;
  margin: 0 auto;

  .spec-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    border-bottom: 1px solid #f0f0f0;

    .spec-title {
      font-size: 36rpx;
      font-weight: 600;
      color: var(--text-1);
    }

    .spec-close {
      padding: 8rpx;
    }
  }

  .spec-content {
    padding: 20rpx;
    box-sizing: border-box;
    max-height: 60vh;
    .goods-preview {
      display: flex;
      padding: 32rpx 0;
      box-sizing: border-box;

      .goods-info-preview {
        margin-left: 24rpx;
        flex: 1;

        .goods-name-preview {
          font-size: 32rpx;
          font-weight: 600;
          color: var(--text-1);
          margin-bottom: 16rpx;
        }

        .goods-price-preview {
          font-size: 36rpx;
          font-weight: 700;
          color: #ff4757;
        }
      }
    }

    .spec-options {
      .spec-group {
        margin-bottom: 40rpx;
        .spec-group-title {
          font-size: 28rpx;
          font-weight: 600;
          color: var(--text-1);
          padding-bottom: 24rpx;
          box-sizing: border-box;
        }

        .spec-items {
          display: flex;
          flex-wrap: wrap;
          gap: 20rpx;

          .spec-item {
            padding: 16rpx 24rpx;
            box-sizing: border-box;
            border: 1px solid #e9ecef;
            border-radius: 8rpx;
            font-size: 26rpx;
            color: var(--text-2);
            background: #fff;
            transition: all 0.3s ease;

            &.active {
              border-color: var(--border-1);
              color: var(--text-1);
              background: var(--bg-1);
            }
          }
        }
      }
    }

    .spec-quantity {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx;
      box-sizing: border-box;
      border-top: 1px solid var(--border-1);

      .quantity-label {
        font-size: 28rpx;
        font-weight: 600;
        color: var(--text-1);
      }

      .minus,
      .plus {
        width: 40rpx;
        height: 40rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .minus {
        background: #f5f5f5;
      }

      .plus {
        background: var(--bg-1);
      }

      .input {
        width: 80rpx;
        text-align: center;
        font-size: 28rpx;
        color: var(--text-1);
      }
    }
  }

  .spec-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx 40rpx;
    box-sizing: border-box;
    border-top: 1px solid #f0f0f0;
    background: #fff;

    .total-price {
      .total-label {
        font-size: 28rpx;
        color: var(--text-2);
      }

      .total-amount {
        font-size: 36rpx;
        font-weight: 700;
        color: #ff4757;
      }
    }

    .confirm-btn {
      padding: 20rpx 40rpx;
      background: var(--bg-1);
      color: #fff;
      border-radius: 8rpx;
      font-size: 28rpx;
      font-weight: 600;
    }
  }
}
</style>
