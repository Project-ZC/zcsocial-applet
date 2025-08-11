<template>
  <view class="" v-if="isShow">
    <!-- 写入内容 -->
    <view class="matter-window unify-flex unify-fixed uni-from-the-bottom">
      <view class="left unify-flex">
        <view class="left-bag unify-relative" @tap="tapTrolleyShow">
          <view
            class="iconfont el-icon-gouwu unify-absolute"
            :class="'bg-' + themeColor.name"
          ></view>

          <!-- 突出数量 -->
          <view
            id="cart-icon"
            class="left-bag-highlight unify-absolute"
            :class="'bg-' + themeColor.name"
            >{{ num }}</view
          >
        </view>

        <view class="left-price">
          <text class="money-symbol">{{ moneySymbol }}</text>
          {{ totalPrice }}
        </view>
      </view>

      <!-- 结算按钮 -->
      <view class="submit-btn" :class="'bg-' + themeColor.name" @tap="tapSubmit"
        >去结算</view
      >
    </view>

    <!-- 购物车窗口 -->
    <uni-shopping-trolley-window
      ref="uniShoppingTrolleyWindow"
      :show="isTrolleyShow"
    ></uni-shopping-trolley-window>
  </view>
</template>

<script setup lang="ts">
import { getCurrentInstance, nextTick, onUnmounted, reactive, ref, watch } from 'vue'

// 定义接口
interface CartItemElc {
  left: number
  top: number
}

interface BezierPoint {
  x: number
  y: number
}

interface BezierResult {
  bezier_points: BezierPoint[]
}

interface Props {
  show: boolean
  cartItemElc: CartItemElc
  num: string | number
  totalPrice: string | number
  isMinus: number
}

// 定义props
const props = withDefaults(defineProps<Props>(), {
  show: false,
  cartItemElc: () => ({ left: 0, top: 0 }),
  num: 0,
  totalPrice: 0,
  isMinus: 0
})

// 定义emits
const emit = defineEmits<{
  updateIsCartIcon: [value: boolean]
  updateCartItemElc: [value: CartItemElc]
}>()

// 响应式数据
const moneySymbol = ref('¥') // 假设这是货币符号，您可能需要从配置中获取
const isShow = ref(false)
const isAnimate = ref(true)
const isTrolleyShow = ref(false)
const bezierPos = ref<BezierResult | null>(null)
const timer = ref<number | null>(null)

// refs
const uniShoppingTrolleyWindow = ref()

// 计算属性
const themeColor = reactive({
  name: 'primary' // 假设主题色名称
})

// 监听器
watch(() => props.show, (newVal) => {
  isCartShow()
})

// 方法
const isCartShow = () => {
  isShow.value = props.show
  if (props.isMinus !== 1) {
    setTimeout(() => {
      // 一定要加延迟，不然拿到的坐标为null
      getCartKepPosition()
    }, 20)
  }
}

// 获取购物车篮子位置
const getCartKepPosition = () => {
  let cartIcon = uni.createSelectorQuery().in(getCurrentInstance()).select("#cart-icon")
  cartIcon
    .boundingClientRect((data: any) => {
      bezierPos.value = (getCurrentInstance()?.proxy as any).$mUtils.bezier(
        [
          {
            x: props.cartItemElc.left,
            y: props.cartItemElc.top,
          },
          {
            x: props.cartItemElc.left - 100,
            y: 120,
          },
          {
            x: data.left,
            y: data.top,
          },
        ],
        20
      )

      startAnimation() // 回调动画
    })
    .exec()
}

// 开始动画
const startAnimation = () => {
  if (isAnimate.value && bezierPos.value) {
    isAnimate.value = false
    let bezier_points = bezierPos.value.bezier_points
    let index = 0
    emit('updateIsCartIcon', true)
    
    if (timer.value) {
      clearInterval(timer.value)
    }
    
    timer.value = setInterval(() => {
      index++
      const newCartItemElc = {
        left: bezier_points[index].x,
        top: bezier_points[index].y
      }
      emit('updateCartItemElc', newCartItemElc)
      
      // 动画完成
      if (index >= 19) {
        if (timer.value) {
          clearInterval(timer.value)
          timer.value = null
        }
        isAnimate.value = true
        emit('updateIsCartIcon', false)
      }
    }, 20) as unknown as number
  }
}

// 结算
const tapSubmit = () => {
  // 这里需要根据您的业务逻辑调整
  const isStatus = false // 假设这是状态检查
  if (!isStatus) {
    uni.navigateTo({
      url: '/pages/goods-affirm/goods-affirm'
    })
  } else {
    // 显示模态框逻辑
    console.log('显示模态框')
  }
}

// 购物车
const tapTrolleyShow = () => {
  isTrolleyShow.value = !isTrolleyShow.value
  nextTick(() => {
    if (uniShoppingTrolleyWindow.value) {
      uniShoppingTrolleyWindow.value.updateStatus()
    }
  })
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style lang="scss" scoped>
// 写入内容
.matter-window {
  z-index: 98;
  height: 50px;
  width: 90%;
  left: 0;
  right: 0;
  bottom: var(--window-bottom);
  margin: 0 auto 10px;
  border-radius: 25px;
  justify-content: space-between;
  align-items: center;
  background-color: #555555;
}

.left {
  align-items: center;
}

.left-bag {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #555555;
  margin-left: 25px;
  margin-top: -15px;
  text-align: center;
}

.el-icon-gouwu {
  width: 48px;
  height: 48px;
  line-height: 48px;
  // background-color: $uni-essential-colour;
  font-size: 25px;
  color: #ffffff;
  border-radius: 50%;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
}

.left-bag-highlight {
  right: 0;
  width: 21px;
  height: 21px;
  // background-color: $uni-essential-colour;
  text-align: center;
  line-height: 20px;
  border-radius: 50%;
  border-bottom: 1px solid #ffffff;
  border-left: 1px solid #ffffff;
  font-size: 12px;
  color: $uni-text-color-inverse;
}

.left-price {
  font-size: 18px;
  color: $uni-text-color-inverse;
  margin-left: 5px;
}

.left-num {
  font-size: $uni-font-size-base;
  margin-left: 25px;
  color: $uni-text-color-inverse;
}

.money-symbol {
  font-size: 14px;
  font-weight: 400;
}

.submit-btn {
  width: 180rpx;
  font-size: 14px;
  height: inherit;
  line-height: 50px;
  // background: linear-gradient(to right, $uni-auxiliary-colour3, $uni-essential-colour);
  text-align: center;
  border-radius: 0 25px 25px 0;
  color: $uni-text-color-inverse;
}
</style>
