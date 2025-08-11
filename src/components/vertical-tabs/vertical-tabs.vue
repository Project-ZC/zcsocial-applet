<template>
  <view class="vertical-tabs">
    <view class="tabs-container">
      <!-- 标签栏 -->
      <view class="tabs-bar">
        <view
          v-for="(tab, index) in tabs"
          :key="index"
          class="tab-item"
          :class="{
            'tab-item--active': activeIndex === index,
            'tab-item--disabled': tab.disabled
          }"
          @click="handleTabClick(index, tab)"
        >
          <view class="tab-content">
            <!-- 图标 -->
            <view v-if="tab.icon" class="tab-icon">
              <image v-if="tab.iconType === 'image'" :src="tab.icon" class="icon-image" />
              <text v-else class="icon-text">{{ tab.icon }}</text>
            </view>
            
            <!-- 标签文本 -->
            <text class="tab-text">{{ tab.title }}</text>
            
            <!-- 徽章 -->
            <view v-if="tab.badge" class="tab-badge">
              <text class="badge-text">{{ tab.badge }}</text>
            </view>
          </view>
          
          <!-- 激活指示器 -->
          <view v-if="activeIndex === index" class="tab-indicator"></view>
        </view>
      </view>
      
      <!-- 内容区域 -->
      <view class="tabs-content">
        <slot name="content"></slot>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// 定义标签项接口
interface TabItem {
  title: string
  content?: string
  icon?: string
  iconType?: 'text' | 'image'
  badge?: string | number
  disabled?: boolean
  [key: string]: any
}

// 定义组件属性
interface Props {
  tabs: TabItem[]
  modelValue?: number
  activeColor?: string
  inactiveColor?: string
  indicatorColor?: string
  backgroundColor?: string
  height?: string
  width?: string
}

// 定义组件事件
interface Emits {
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: { index: number; tab: TabItem }): void
  (e: 'click', value: { index: number; tab: TabItem }): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  activeColor: '#007aff',
  inactiveColor: '#666666',
  indicatorColor: '#007aff',
  backgroundColor: '#ffffff',
  height: '100%',
  width: '100%'
})

const emit = defineEmits<Emits>()

// 当前激活的标签索引
const activeIndex = ref(props.modelValue)

// 监听外部传入的modelValue变化
watch(() => props.modelValue, (newValue) => {
  activeIndex.value = newValue
})

// 处理标签点击
const handleTabClick = (index: number, tab: TabItem) => {
  if (tab.disabled) return
  
  activeIndex.value = index
  emit('update:modelValue', index)
  emit('change', { index, tab })
  emit('click', { index, tab })
}
</script>

<style lang="scss" scoped>
.vertical-tabs {
  width: v-bind(width);
  height: v-bind(height);
  background-color: v-bind(backgroundColor);
  
  .tabs-container {
    display: flex;
    height: 100%;
    
    .tabs-bar {
      width: 100rpx;
      background-color: #f8f8f8;
      border-right: 1rpx solid #e5e5e5;
      overflow-y: auto;
      
      .tab-item {
        position: relative;
        padding: 30rpx 20rpx;
        cursor: pointer;
        transition: all 0.3s ease;
        border-bottom: 1rpx solid #e5e5e5;
        
        &:last-child {
          border-bottom: none;
        }
        
        &:hover {
          background-color: #f0f0f0;
        }
        
        &--active {
          background-color: #ffffff;
          color: v-bind(activeColor);
          
          .tab-text {
            color: v-bind(activeColor);
            font-weight: 600;
          }
          
          .tab-icon {
            color: v-bind(activeColor);
          }
        }
        
        &--disabled {
          opacity: 0.5;
          cursor: not-allowed;
          
          &:hover {
            background-color: transparent;
          }
        }
        
        .tab-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10rpx;
          
          .tab-icon {
            font-size: 32rpx;
            color: v-bind(inactiveColor);
            
            .icon-image {
              width: 32rpx;
              height: 32rpx;
            }
            
            .icon-text {
              font-size: 32rpx;
            }
          }
          
          .tab-text {
            font-size: 28rpx;
            color: v-bind(inactiveColor);
            text-align: center;
            line-height: 1.4;
          }
          
          .tab-badge {
            position: absolute;
            top: 5rpx;
            right: 5rpx;
            background-color: #ff4757;
            border-radius: 20rpx;
            min-width: 32rpx;
            height: 32rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 8rpx;
            
            .badge-text {
              color: #ffffff;
              font-size: 20rpx;
              font-weight: 600;
            }
          }
        }
        
        .tab-indicator {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 6rpx;
          height: 60rpx;
          background-color: v-bind(indicatorColor);
          border-radius: 3rpx 0 0 3rpx;
        }
      }
    }
    
    .tabs-content {
      flex: 1;
      overflow-y: auto;
      
      .content-item {
        height: 100%;
        padding: 30rpx;
        
        &--active {
          display: block;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 750rpx) {
  .vertical-tabs {
    .tabs-container {
      flex-direction: column;
      
      .tabs-bar {
        width: 100%;
        height: auto;
        max-height: 200rpx;
        border-right: none;
        border-bottom: 1rpx solid #e5e5e5;
        
        .tab-item {
          .tab-content {
            flex-direction: row;
            justify-content: center;
            gap: 20rpx;
          }
          
          .tab-indicator {
            right: auto;
            bottom: 0;
            top: auto;
            transform: none;
            width: 60rpx;
            height: 6rpx;
            border-radius: 3rpx 3rpx 0 0;
          }
        }
      }
      
      .tabs-content {
        height: calc(100% - 200rpx);
      }
    }
  }
}
</style> 