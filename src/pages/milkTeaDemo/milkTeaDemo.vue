<template>
  <view class="content">
    <!-- 分类导航 -->
    <view class="classify-list">
      <!-- 左侧分类导航 -->
      <scroll-view scroll-y="true" class="left">
        <view
          class="row"
          v-for="(item, index) in classifyList"
          :key="index"
          :class="[index === showClassifyIndex ? 'active' : '']"
          @tap="tapClassify(index)"
        >
          <view class="text">
            <view class="block" :class="'bg-' + themeColor.name"></view>
            {{ item.title }}
          </view>
        </view>
      </scroll-view>
      <!-- 右侧分类导航 -->
      <scroll-view scroll-y="true" class="right">
        <view v-for="(item, index) in classifyList" :key="index">
          <view v-if="index === showClassifyIndex" class="classify">
            <view class="" v-if="item.goods_list.length !== 0">
              <!-- 标题 -->
              <view class="item-title unify-weight">{{ item.title }}</view>

              <view
                class="item-subclass unify-relative"
                v-for="(item2, index2) in item.goods_list"
                :key="index2"
              >
                <view class="item-subclass-ice unify-flex" @tap="tapGoodsDetails(item2)">
                  <view class="item-left">
                    <image
                      class="item-left-image"
                      :src="item2.goods_cover || errorImage"
                      mode=""
                    >
                    </image>
                  </view>
                  <view class="item-right">
                    <view class="item-right-con">
                      <view
                        class="item-right-name unify-weight unify-font-size-line-astrict"
                      >
                        {{ item2.goods_name }}
                      </view>
                      <view class="item-right-desc unify-font-size-two-line-astrict">
                        {{ item2.goods_desc }}
                      </view>
                      <view class="item-right-price unify-absolute unify-flex">
                        <view
                          class="item-price unify-weight"
                          :class="'tf-' + themeColor.name"
                        >
                          <text class="item-price-iden">{{ moneySymbol }}</text>
                          {{ item2.goods_price }}
                          <text class="item-original-price"
                            >{{ moneySymbol }}{{ item2.goods_original_price }}</text
                          >
                        </view>
                      </view>
                    </view>
                  </view>
                </view>

                <uni-goods-add-subtract
                  :data="item2"
                  :index="index"
                  :index2="index2"
                  :absolute="true"
                  bottom="10rpx"
                  right="40rpx"
                  @minus="tapNumber"
                  @add="tapNumber"
                ></uni-goods-add-subtract>
              </view>

              <!-- 间隔 -->
              <view style="height: 60px" v-if="goodsNum > 0"></view>
            </view>
            <view class="no-data" v-else>
              <image class="iconfont" :src="iconRight" mode="widthFix"></image>
              暂无分类
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <uni-goods-add-subtract-animation
      :show="isCartIcon"
      :cartItemElc="cartItemElc"
    ></uni-goods-add-subtract-animation>

    <!-- 购物车 -->
    <uni-shopping-trolley
      ref="uniShoppingTrolley"
      :show="show"
      :cartItemElc="cartItemElc"
      :isCartIcon="isCartIcon"
      :num="goodsNum"
      :totalPrice="totalPrice"
      :isMinus="isMinus"
      @updateIsCartIcon="updateIsCartIcon"
      @updateCartItemElc="updateCartItemElc"
    >
    </uni-shopping-trolley>

    <!-- 自定义模态框 -->
    <uni-show-modal ref="uniShowModal" :show="isShowModal"></uni-show-modal>
  </view>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";

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

interface CartItemElc {
  left: number;
  top: number;
}

interface TouchEvent {
  touches: Array<{
    pageX: number;
    pageY: number;
  }>;
}

// 响应式数据
const windowHeight = ref(0);
const statusBarHeight = ref(0);
const errorImage = ref("/static/images/error.png"); // 假设错误图片路径
const iconRight = ref("/static/images/icon-right.png"); // 假设图标路径
const moneySymbol = ref("¥");
const appName = ref("应用名称");
const isPress = ref(1);
const show = ref(false);
const isShowModal = ref(false);
const isCartIcon = ref(false);
const cartItemElc = ref<CartItemElc>({
  left: 0,
  top: 0,
});
const goodsNum = ref(0);
const totalPrice = ref(0);
const isMinus = ref(0);
const showClassifyIndex = ref(0);

// 主题色
const themeColor = reactive({
  name: "primary",
});

// 分类列表数据
const classifyList = ref<ClassifyItem[]>([
  {
    title: "招聘推荐",
    goods_list: [
      {
        goods_name: "新鲜盐焗鸡新鲜盐焗鸡新鲜盐焗鸡新鲜盐焗鸡新鲜盐焗鸡",
        goods_cover: "/static/images/mall/goods2.png",
        goods_desc:
          "盐水鸡是一道由鸡、辣椒、盐水等做成的菜肴，冷热均可食，味咸辣。可用于虚劳瘦弱、骨蒸潮热、脾虚泄泻、消渴、崩漏、赤白带、遗精等",
        goods_price: "19",
        goods_original_price: "29",
        goods_number: 0,
        goods_image: ["/static/images/mall/goods1.png", "/static/images/mall/goods2.png"],
      },
      {
        goods_name: "新鲜盐焗鸡",
        goods_cover: "",
        goods_desc:
          "盐水鸡是一道由鸡、辣椒、盐水等做成的菜肴，冷热均可食，味咸辣。可用于虚劳瘦弱、骨蒸潮热、脾虚泄泻、消渴、崩漏、赤白带、遗精等",
        goods_price: "19",
        goods_original_price: "29",
        goods_number: 0,
        goods_image: ["/static/images/mall/goods1.png", "/static/images/mall/goods2.png"],
      },
      {
        goods_name: "新鲜盐焗鸡",
        goods_cover: "/static/images/mall/goods2.png",
        goods_desc:
          "盐水鸡是一道由鸡、辣椒、盐水等做成的菜肴，冷热均可食，味咸辣。可用于虚劳瘦弱、骨蒸潮热、脾虚泄泻、消渴、崩漏、赤白带、遗精等",
        goods_price: "19",
        goods_original_price: "29",
        goods_number: 0,
        goods_image: ["/static/images/mall/goods1.png", "/static/images/mall/goods2.png"],
      },
      {
        goods_name: "新鲜盐焗鸡",
        goods_cover: "/static/images/mall/goods2.png",
        goods_desc:
          "盐水鸡是一道由鸡、辣椒、盐水等做成的菜肴，冷热均可食，味咸辣。可用于虚劳瘦弱、骨蒸潮热、脾虚泄泻、消渴、崩漏、赤白带、遗精等",
        goods_price: "19",
        goods_original_price: "29",
        goods_number: 0,
        goods_image: ["/static/images/mall/goods1.png", "/static/images/mall/goods2.png"],
      },
      {
        goods_name: "新鲜盐焗鸡",
        goods_cover: "/static/images/mall/goods2.png",
        goods_desc:
          "盐水鸡是一道由鸡、辣椒、盐水等做成的菜肴，冷热均可食，味咸辣。可用于虚劳瘦弱、骨蒸潮热、脾虚泄泻、消渴、崩漏、赤白带、遗精等",
        goods_price: "19",
        goods_original_price: "29",
        goods_number: 0,
        goods_image: ["/static/images/mall/goods1.png", "/static/images/mall/goods2.png"],
      },
    ],
  },
  {
    title: "肉丸类",
    goods_list: [],
  },
]);

// refs
const uniShoppingTrolley = ref();
const uniShowModal = ref();

// 方法
// 商品详情
const tapGoodsDetails = (e: GoodsItem) => {
  uni.navigateTo({
    url: `/pages/goods-details/goods-details?data=${encodeURIComponent(
      JSON.stringify(e)
    )}`,
  });
};

// 点击分类
const tapClassify = (e: number) => {
  showClassifyIndex.value = e;
};

// 点击商品数量加减 1减  2加
const tapNumber = (e: TouchEvent, type: number, index: number, index2: number) => {
  const currentClassifyList = [...classifyList.value];
  isMinus.value = type; // 判断是否减操作  1减  2加

  switch (type) {
    case 1:
      currentClassifyList[index].goods_list[index2].goods_number--;
      goodsNum.value--;
      countTotalPrice(); // 回调计算总价
      if (goodsNum.value === 0) {
        show.value = false;
        setTimeout(() => {
          if (uniShoppingTrolley.value) {
            uniShoppingTrolley.value.isCartShow(); // 回调组件isCartShow方法
          }
        }, 20);
      }
      break;
    case 2:
      show.value = true;
      currentClassifyList[index].goods_list[index2].goods_number++;
      cartItemElc.value.left = e.touches[0].pageX - 15; // 自由调动位置
      cartItemElc.value.top = e.touches[0].pageY - 40;
      setTimeout(() => {
        goodsNum.value++;
        countTotalPrice(); // 回调计算总价
        if (uniShoppingTrolley.value) {
          uniShoppingTrolley.value.isCartShow(); // 回调组件isCartShow方法
        }
      }, 20);
      break;
    default:
      break;
  }
  classifyList.value = currentClassifyList;
};

// 计算商品总价
const countTotalPrice = () => {
  let total = 0;
  classifyList.value.forEach((item) => {
    item.goods_list.forEach((item2) => {
      total += Number(item2.goods_price) * item2.goods_number;
    });
  });
  totalPrice.value = total;
};

// 更新动画标状态  默认false
const updateIsCartIcon = (e: boolean) => {
  isCartIcon.value = e;
};

// 更新cartItemElc坐标移动
const updateCartItemElc = (e: CartItemElc) => {
  cartItemElc.value = e;
};

// 模态框affirm
const tapModalAffirm = () => {
  // 模态框确认逻辑
};

// 生命周期
onMounted(() => {
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync();
  windowHeight.value = systemInfo.windowHeight;
  statusBarHeight.value = systemInfo.statusBarHeight || 0;
});

// #ifdef APP-PLUS
// 返回按钮处理
const onBackPress = (e: any) => {
  uni.showModal({
    content: "确定要退出程序？",
    success: (res) => {
      if (res.confirm) {
        // 退出当前应用，改方法只在App中生效
        // @ts-ignore
        plus.runtime.quit();
      }
    },
  });
  return true;
};
// #endif
</script>

<style lang="scss" scoped>
/* 模块分类 */
.classify-list {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  display: flex;
  position: absolute;
  padding-top: 88rpx;
  /* #ifdef APP-PLUS */
  padding-top: calc(88rpx + var(--status-bar-height));
  /* #endif */
  bottom: 0;

  .left {
    width: 24%;
    left: 0rpx;
    background-color: #f8f8f8;

    .row {
      width: 100%;
      height: 90rpx;
      display: flex;
      align-items: center;

      .text {
        width: 100%;
        position: relative;
        font-size: 28rpx;
        display: flex;
        justify-content: center;
        color: #3c3c3c;

        .block {
          position: absolute;
          width: 0rpx;
          left: 0rpx;
        }
      }

      &.active {
        height: 100rpx;
        background-color: #ffffff;

        .text {
          font-size: 30rpx;
          font-weight: 600;
          color: #2d2d2d;

          .block {
            width: 6rpx;
            height: 100%;
            left: 10rpx;
          }
        }
      }
    }
  }

  .right {
    width: 76%;
    left: 24%;
    background-color: #fff;

    .classify {
      width: 100%;
      padding: 0 20rpx 0;
      padding-top: 10rpx;

      // 标题
      .item-title {
        line-height: 86rpx;
        font-size: $up-font-base;
      }

      .item-subclass {
        margin-bottom: 40rpx;

        .item-subclass-ice {
          .item-left {
            .item-left-image {
              width: 180rpx;
              height: 180rpx;
              border-radius: 10rpx;
            }
          }

          .item-right {
            width: 65%;
            height: 180rpx;

            .item-right-con {
              height: inherit;
              margin: 10rpx 30rpx 10rpx 20rpx;

              .item-right-name {
                font-size: $up-font-base;
              }

              .item-right-desc {
                font-size: $up-font-sm;
                color: $u-main-color;
                margin-top: 10rpx;
              }

              .item-right-price {
                width: 57%;
                bottom: 10rpx;
                justify-content: space-between;

                .item-price {
                  .item-price-iden {
                    font-size: $up-font-sm;
                    font-weight: 500;
                  }

                  .item-original-price {
                    font-size: $up-font-sm;
                    margin-left: 5rpx;
                    font-weight: 500;
                    color: $u-main-color;
                    text-decoration: line-through;
                  }
                }
              }
            }
          }
        }

        .item-operation {
          width: max-content;
          align-items: center;
          bottom: 10rpx;
          right: 50rpx;

          .item-number {
            width: 50rpx;
            text-align: center;
            font-size: $up-font-base;
          }

          .iconfont {
            font-size: 40rpx;
          }
        }
      }

      .no-data {
        margin: 48rpx 0;
        color: #909399;
        display: flex;
        justify-content: center;
        align-items: center;

        .iconfont {
          margin-right: 20rpx;
          width: 50rpx;
          height: 52rpx;
        }
      }
    }
  }
}
</style>
