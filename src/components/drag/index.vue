<template>
  <movable-area
    class="drag-container"
    v-if="state.controlsPositionArray.length > 0"
    :style="{
      height:
        state.height * state.controlsPositionArray.length +
        state.margin.margin_y * state.controlsPositionArray.length +
        'px',
    }"
  >
    <movable-view
      :disabled="props.disabled || !state.isDragging"
      v-for="(item, index) in state.controlsArray"
      :key="index"
      class="drag-container-item"
      :class="{
        'drag-container-item--dragging': state.isDragging && state.curretnControlsIndex === index,
      }"
      :style="{
        transition: state.curretnControlsIndex === index ? 'initial' : `${state.animationDuration}s`,
        'z-index': state.curretnControlsIndex === index ? 1 : 0,
        height: state.height + 'px',
        top: state.controlsPositionArray[index].top + 'px',
        left: props.axis === 'y' ? 0 + 'px' : state.controlsPositionArray[index].left + 'px',
      }"
      @touchstart="handleTouchstart($event, index)"
      @touchmove="handleTouchmove"
      @touchend="handleTouchend"
      @longpress="handleLongpress($event, index)"
    >
      <!-- 自定义内容 -->
      <slot :moveItem="item" :moveIndex="index" :height="state.height" :margin="state.margin"></slot>
    </movable-view>
  </movable-area>
</template>

<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from 'vue';

// 定义 props
interface Props {
  height: number;
  list?: any[];
  animationDuration?: number;
  axis?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  height: 40,
  list: () => [],
  animationDuration: 0.2,
  axis: 'y',
  disabled: false,
});

// 定义事件
const emit = defineEmits<{
  'update:list': [list: any[]];
  'sort-change': [newList: any[], oldIndex: number, newIndex: number];
}>();

// 将所有数据放入 state 对象中管理
const state = reactive({
  isDragging: false, //是否可以开始拖动
  // 控件列表
  controlsArray: [] as any[],
  // 每行最大存放的个数
  maxWidthCount: 1,
  // 控件的间距
  margin: {
    margin_x: 0,
    margin_y: 10,
  },
  // 记录所有控件的初始位置
  recordInitControlsPoisitonList: [] as any[],
  // 控件的位置数据
  controlsPositionArray: [] as any[],
  // 记录当前手指的位置
  recordPosition: {
    x: 0,
    y: 0,
  },
  // 记录当前操作的控件数据
  recordControlsPositionItem: {} as any,
  // 当前操作的控件的下标
  curretnControlsIndex: -1,
  // 系统信息
  systemInfo: {} as any,
  // 控件大小
  height: props.height,
  // 动画时长
  animationDuration: props.animationDuration,
});

// 生命周期钩子
onMounted(() => {
  // 获取系统信息
  state.systemInfo = uni.getDeviceInfo();
  // 获取控件列表
  state.controlsArray = props.list;
  // 初始化控件的位置
  state.controlsPositionArray = initControlsPosition();
});

// 组件销毁时清理
onUnmounted(() => {
  // 清理拖拽状态
  state.isDragging = false;
  state.curretnControlsIndex = -1;
  state.controlsArray = [];
  state.controlsPositionArray = [];
  state.recordInitControlsPoisitonList = [];
  state.recordPosition = { x: 0, y: 0 };
  state.recordControlsPositionItem = {};
});

// 方法定义
const initControlsPosition = () => {
  // 用于返回出去的新数组
  let tempArray: any[] = [];

  // 设置控件位置
  for (let i = 0, j = 0; i < props.list.length; i++, j++) {
    tempArray[i] = {
      left: state.margin.margin_x,
      top: j * (state.height + state.margin.margin_y) + state.margin.margin_y,
    };
  }

  // 记录数据 - 进行深拷贝
  state.recordInitControlsPoisitonList = [...tempArray];
  // 返回数据
  return tempArray;
};

const handleTouchmove = (event: any) => {
  if (props.disabled) return;
  if (!state.isDragging) return;
  const { pageX, pageY } = event.touches[0];

  // 获取移动的差
  state.controlsPositionArray[state.curretnControlsIndex] = {
    left: state.controlsPositionArray[state.curretnControlsIndex].left + (pageX - state.recordPosition.x),
    top: state.controlsPositionArray[state.curretnControlsIndex].top + (pageY - state.recordPosition.y),
  };

  // 记录位置
  state.recordPosition = {
    x: pageX,
    y: pageY,
  };

  // 判断当前移动的位置是否需要进行排序
  // 向下移动
  if (
    state.curretnControlsIndex !== state.controlsPositionArray.length - 1 &&
    state.controlsPositionArray[state.curretnControlsIndex].top >
      state.controlsPositionArray[state.curretnControlsIndex + 1].top
  ) {
    // 交换位置
    _handleChangeControlsPosition(0, state.curretnControlsIndex + 1);
  }
  // 向上移动
  else if (
    state.curretnControlsIndex !== 0 &&
    state.controlsPositionArray[state.curretnControlsIndex].top <
      state.controlsPositionArray[state.curretnControlsIndex - 1].top
  ) {
    // 交换位置
    _handleChangeControlsPosition(0, state.curretnControlsIndex - 1);
  }
};

const handleTouchstart = (event: any, index: number) => {
  if (props.disabled) return;
  const { pageX, pageY } = event.touches[0];

  // 记录一些数据
  state.curretnControlsIndex = index;
  state.recordPosition = {
    x: pageX,
    y: pageY,
  };
  state.recordControlsPositionItem = state.controlsPositionArray[index];
};

const handleTouchend = () => {
  if (props.disabled) return;
  // 将操控的控件归位
  state.controlsPositionArray[state.curretnControlsIndex] =
    state.recordInitControlsPoisitonList[state.curretnControlsIndex];
  state.curretnControlsIndex = -1;
  state.isDragging = false;
};

const _handleChangeControlsPosition = (type: number, index: number) => {
  // 记录当前操控的控件数据
  let tempControls = state.controlsArray[state.curretnControlsIndex];

  // 记录原始索引，用于事件触发
  const oldIndex = state.curretnControlsIndex;
  const newIndex = index;

  // 设置原来位置的数据
  state.controlsArray[state.curretnControlsIndex] = state.controlsArray[index];
  // 将临时存放的数据设置好
  state.controlsArray[index] = tempControls;

  // 调整控件位置数据
  state.controlsPositionArray[index] = state.controlsPositionArray[state.curretnControlsIndex];
  state.controlsPositionArray[state.curretnControlsIndex] = state.recordControlsPositionItem;

  // 改变当前选中的位置
  state.curretnControlsIndex = index;

  // 记录新位置的数据
  state.recordControlsPositionItem = state.recordInitControlsPoisitonList[state.curretnControlsIndex];

  // 触发事件，通知父组件排序已改变
  emit('update:list', [...state.controlsArray]);
  emit('sort-change', [...state.controlsArray], oldIndex, newIndex);
};

const handleLongpress = (event: any, index: number) => {
  if (props.disabled) return;
  state.isDragging = true;
};

defineOptions({
  options: {
    styleIsolation: 'shared',
  },
});
</script>

<style scoped lang="scss">
.drag-container {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  &-item {
    width: 100%;
    height: 100%;
    position: absolute;
    box-sizing: border-box;
    &--dragging {
      opacity: 0.5;
    }
  }
}
</style>
