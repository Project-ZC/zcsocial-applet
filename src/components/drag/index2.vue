<template>
  <movable-area class="movable-area" :style="{ height: AREA_HEIGHT + 'px' }">
    <movable-view
      v-for="(item, index) in tabList"
      :key="item.id || index"
      class="movable-item"
      :class="{ dragging: moveId === index }"
      :style="{
        width: props.width,
        height: props.height + 'px',
        zIndex: index === moveId ? 2 : 1,
      }"
      :x="item.x"
      :y="item.y"
      direction="all"
      @change="moving($event, index)"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="moveEnd"
    >
      <view class="item-content">
        <!-- <view class="drag-handle">
						<up-icon name="list" size="16" color="var(--text-3)"></up-icon>
					</view> -->
        <slot :item="item" :index="index"></slot>
      </view>
    </movable-view>
  </movable-area>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: Number,
    default: 100,
  },
});

const emit = defineEmits(['update:list', 'sort-change', 'position-change']);

// 响应式数据
const tabList = ref([]);
const moveId = ref(null);
const endX = ref(0);
const endY = ref(0);

// 列表项上外边距
const ITEM_MARGIN_TOP = 20;
const AREA_HEIGHT = ref(0);

// 比较函数，用于排序
const compare = (obj1, obj2) => {
  const val1 = obj1.y;
  const val2 = obj2.y;
  if (val1 < val2) {
    return -1;
  } else if (val1 >= val2) {
    return 1;
  } else {
    return 0;
  }
};

// 初始化移动位置
const initMove = () => {
  const list =
    props.list.length > 0
      ? props.list
      : [{ name: '十步杀一人' }, { name: '千里不留行' }, { name: '事了拂衣去' }, { name: '深藏身与名' }];

  list.forEach((ele, index) => {
    // const obj = {
    // 	...ele,
    // 	id: index,
    // 	x: 30,
    // 	y: (props.height + ITEM_MARGIN_TOP) * index + ITEM_MARGIN_TOP,
    // };
    // tarr.push(obj);
    ele.id = index;
    ele.x = 30;
    ele.y = (props.height + ITEM_MARGIN_TOP) * index + ITEM_MARGIN_TOP;
  });
  // 列表高度
  AREA_HEIGHT.value = (props.height + ITEM_MARGIN_TOP) * list.length;
  tabList.value = [...list];
};

// 重新计算位置（保持排序后的新位置）
const recalculatePositions = () => {
  tabList.value.forEach((item, index) => {
    item.x = 30;
    item.y = (props.height + ITEM_MARGIN_TOP) * index + ITEM_MARGIN_TOP;
  });
};

// 移动状态处理
const moving = (e, index) => {
  if (props.disabled) return;

  // 移动的块ID
  const moveid = index;
  // 最终坐标
  const x = e.detail.x;
  const y = e.detail.y;

  moveId.value = moveid;
  endX.value = x;
  endY.value = y;

  // 阻止页面滚动
  e.preventDefault && e.preventDefault();
  e.stopPropagation && e.stopPropagation();
};

// 触摸开始处理
const onTouchStart = e => {
  // 阻止页面滚动
  e.preventDefault && e.preventDefault();
  e.stopPropagation && e.stopPropagation();
};

// 触摸移动处理
const onTouchMove = e => {
  // 阻止页面滚动
  e.preventDefault && e.preventDefault();
  e.stopPropagation && e.stopPropagation();
};

// 移动结束处理
const moveEnd = () => {
  if (props.disabled || moveId.value === null) return;

  const currentMoveId = moveId.value;

  // 更新当前位置
  if (tabList.value[currentMoveId]) {
    tabList.value[currentMoveId].x = endX.value;
    tabList.value[currentMoveId].y = endY.value;
  }

  // 排序
  const sortedList = [...tabList.value].sort(compare);
  tabList.value = sortedList;

  // 触发排序变化事件
  const oldIndex = currentMoveId;
  const newIndex = sortedList.findIndex(item => item.id === tabList.value[currentMoveId]?.id);

  // 传出更新后的列表数据
  emit('update:list', tabList.value);

  // 传出位置数据（包含排序后的新位置）
  const positionData = tabList.value.map((item, index) => ({
    id: item.id,
    name: item.name,
    index: index,
    x: item.x,
    y: item.y,
    sortedY: (props.height + ITEM_MARGIN_TOP) * index + ITEM_MARGIN_TOP,
  }));
  emit('position-change', positionData);

  if (oldIndex !== newIndex && newIndex !== -1) {
    emit('sort-change', sortedList, oldIndex, newIndex);
  }

  // 延迟重新初始化位置，保持排序后的新位置
  setTimeout(() => {
    recalculatePositions();
    // 重置状态
    moveId.value = null;
    endX.value = 0;
    endY.value = 0;
  }, 300);
};

// 组件挂载时初始化
onMounted(() => {
  initMove();
});

// 监听外部列表变化
watch(
  () => props.list,
  newList => {
    if (newList.length > 0) {
      setTimeout(() => {
        initMove();
        // 重置状态
        moveId.value = null;
        endX.value = 0;
        endY.value = 0;
      }, 100);
    }
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.movable-area {
  width: 100%;
  height: 100%;
  position: relative;
}

.movable-item {
  background: #fff;
  border-radius: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &.dragging {
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
    transform: scale(1.02);
  }
}

.item-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 20rpx;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.item-text {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-1);
  font-weight: 500;
}
</style>
