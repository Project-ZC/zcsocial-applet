<template>
  <scroll-view scroll-y="true" class="content">
    <view v-for="(item, index) in data" :key="index">
      <view class="classify-content" v-if="item.goods_list.length !== 0">
        <!-- 标题 -->
        <view class="item-title unify-weight">{{ item.title }}</view>

        <view
          class="item-subclass unify-relative"
          v-for="(goodsItem, goodsIndex) in item.goods_list"
          :key="goodsIndex"
        >
          <GoodsCard :data="goodsItem" />
        </view>
      </view>
      <view class="no-data" v-else>
        <image class="iconfont" mode="widthFix"></image>
        暂无分类
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import GoodsCard from "@/components/ordering/goods-card.vue";

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

interface ClassifyItem {
  title: string;
  goods_list: GoodsItem[];
}

interface Props {
  data: ClassifyItem[];
  showClassifyIndex: number;
}

const props = defineProps<Props>();
</script>

<style lang="scss" scoped>
.content {
  padding: 10rpx;
  box-sizing: border-box;
  width: calc(100% - 25%);
  height: 100%;
  background-color: #f5f5f5;
  position: absolute;
  top: 0;
  right: 0;
  padding: 0 10px;
  box-sizing: border-box;
}
</style>
