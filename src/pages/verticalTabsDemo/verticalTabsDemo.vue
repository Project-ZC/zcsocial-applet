<template>
  <view class="vertical-tabs-demo">
    <view class="demo-container">
      <vertical-tabs
        v-model="activeTab"
        :tabs="tabs"
        :active-color="activeColor"
        :inactive-color="inactiveColor"
        :indicator-color="indicatorColor"
        height="calc(100vh - 200rpx)"
        @change="handleTabChange"
        @click="handleTabClick"
      >
        <template #content>
          <view>
            <text>测试</text>
          </view>
        </template>
      </vertical-tabs>
    </view>
  </view>
</template>

<script setup lang="ts">
import VerticalTabs from '@/components/vertical-tabs/vertical-tabs.vue'
import { ref } from 'vue'

// 当前激活的标签
const activeTab = ref(0)

// 颜色配置
const activeColor = ref('#007aff')
const inactiveColor = ref('#666666')
const indicatorColor = ref('#007aff')

// 标签数据
const tabs = ref([
  {
    title: '鸡尾酒',
    badge: '2',
    type: "cocktail",
    
  },
  {
    title: '伏特加',
    type: "vodka",
  },
  {
    title: '啤酒',
    type: "beer",
  },
  {
    title: '葡萄酒',
    type: "wine",
    disabled: true
  }
])

// 列表数据
const listData = ref([
  '列表项 1',
  '列表项 2',
  '列表项 3',
  '列表项 4',
  '列表项 5'
])

// 处理标签变化
const handleTabChange = (data: { index: number; tab: any }) => {
  console.log('标签变化:', data)
}

// 处理标签点击
const handleTabClick = (data: { index: number; tab: any }) => {
  console.log('标签点击:', data)
}

// 处理表单提交
const handleSubmit = () => {
  uni.showToast({
    title: '表单提交成功',
    icon: 'success'
  })
}
</script>

<style lang="scss" scoped>
.vertical-tabs-demo {
  height: 100vh;
  background-color: #f5f5f5;
  
  .demo-header {
    padding: 30rpx;
    background-color: #ffffff;
    border-bottom: 1rpx solid #e5e5e5;
    
    .demo-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #333333;
    }
  }
  
  .demo-container {
    height: calc(100vh - 200rpx);
  }
  
  .tab-content {
    height: 100%;
    
    .content-header {
      margin-bottom: 40rpx;
      
      .content-title {
        display: block;
        font-size: 32rpx;
        font-weight: 600;
        color: #333333;
        margin-bottom: 10rpx;
      }
      
      .content-subtitle {
        font-size: 28rpx;
        color: #666666;
      }
    }
    
    .content-body {
      .content-text {
        font-size: 28rpx;
        color: #666666;
        line-height: 1.6;
        margin-bottom: 30rpx;
      }
      
      .demo-card {
        background-color: #ffffff;
        border-radius: 16rpx;
        padding: 30rpx;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
        
        .card-title {
          display: block;
          font-size: 30rpx;
          font-weight: 600;
          color: #333333;
          margin-bottom: 20rpx;
        }
        
        .card-content {
          font-size: 28rpx;
          color: #666666;
        }
      }
      
      .demo-list {
        .list-item {
          background-color: #ffffff;
          border-radius: 12rpx;
          padding: 30rpx;
          margin-bottom: 20rpx;
          box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
          
          .item-text {
            font-size: 28rpx;
            color: #333333;
          }
        }
      }
      
      .demo-form {
        .form-item {
          margin-bottom: 30rpx;
          
          .form-label {
            display: block;
            font-size: 28rpx;
            color: #333333;
            margin-bottom: 15rpx;
          }
          
          .form-input {
            width: 100%;
            height: 80rpx;
            background-color: #ffffff;
            border: 2rpx solid #e5e5e5;
            border-radius: 12rpx;
            padding: 0 20rpx;
            font-size: 28rpx;
            color: #333333;
            
            &:focus {
              border-color: #007aff;
            }
          }
        }
        
        .form-button {
          width: 100%;
          height: 80rpx;
          background-color: #007aff;
          color: #ffffff;
          border: none;
          border-radius: 12rpx;
          font-size: 30rpx;
          font-weight: 600;
          
          &:active {
            background-color: #0056b3;
          }
        }
      }
    }
  }
  
  .control-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #ffffff;
    border-top: 1rpx solid #e5e5e5;
    padding: 20rpx 30rpx;
    
    .control-item {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .control-label {
        font-size: 28rpx;
        color: #333333;
        margin-right: 20rpx;
      }
      
      .control-value {
        font-size: 28rpx;
        color: #007aff;
        font-weight: 600;
      }
      
      .color-picker {
        display: flex;
        gap: 20rpx;
        
        .color-option {
          width: 60rpx;
          height: 60rpx;
          border-radius: 50%;
          border: 4rpx solid transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &--active {
            border-color: #333333;
            transform: scale(1.1);
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 750rpx) {
  .vertical-tabs-demo {
    .control-panel {
      padding: 20rpx;
      
      .control-item {
        .color-picker {
          gap: 15rpx;
          
          .color-option {
            width: 50rpx;
            height: 50rpx;
          }
        }
      }
    }
  }
}
</style> 