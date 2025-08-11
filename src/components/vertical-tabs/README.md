# 纵向Tab标签栏组件

一个功能丰富的纵向tab标签栏组件，支持自定义样式、图标、徽章等功能。

## 功能特性

- ✅ 纵向布局，适合侧边栏导航
- ✅ 支持图标（文字图标或图片图标）
- ✅ 支持徽章显示
- ✅ 支持禁用状态
- ✅ 自定义颜色主题
- ✅ 响应式设计（移动端自动切换为横向）
- ✅ 插槽内容支持
- ✅ TypeScript 类型支持

## 基本用法

```vue
<template>
  <vertical-tabs
    v-model="activeTab"
    :tabs="tabs"
    @change="handleTabChange"
  >
    <template #tab-0="{ tab, index }">
      <view>第一个标签的内容</view>
    </template>
    <template #tab-1="{ tab, index }">
      <view>第二个标签的内容</view>
    </template>
  </vertical-tabs>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VerticalTabs from '@/components/vertical-tabs/vertical-tabs.vue'

const activeTab = ref(0)

const tabs = ref([
  {
    title: '首页',
    icon: '🏠',
    iconType: 'text'
  },
  {
    title: '列表',
    icon: '📋',
    iconType: 'text'
  }
])

const handleTabChange = (data: { index: number; tab: any }) => {
  console.log('标签变化:', data)
}
</script>
```

## Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| tabs | TabItem[] | [] | 标签数据数组 |
| modelValue | number | 0 | 当前激活的标签索引 |
| activeColor | string | '#007aff' | 激活状态的颜色 |
| inactiveColor | string | '#666666' | 未激活状态的颜色 |
| indicatorColor | string | '#007aff' | 指示器的颜色 |
| backgroundColor | string | '#ffffff' | 背景颜色 |
| height | string | '100%' | 组件高度 |
| width | string | '100%' | 组件宽度 |

## TabItem 接口

```typescript
interface TabItem {
  title: string           // 标签标题
  content?: string        // 标签内容（可选）
  icon?: string          // 图标（文字或图片路径）
  iconType?: 'text' | 'image'  // 图标类型
  badge?: string | number // 徽章内容
  disabled?: boolean      // 是否禁用
  [key: string]: any      // 其他自定义属性
}
```

## Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | number | 当前激活的标签索引 |
| change | { index: number; tab: TabItem } | 标签切换时触发 |
| click | { index: number; tab: TabItem } | 标签点击时触发 |

## Slots 插槽

组件为每个标签提供了对应的插槽，插槽名格式为 `tab-{index}`：

```vue
<vertical-tabs :tabs="tabs">
  <template #tab-0="{ tab, index }">
    <!-- 第一个标签的内容 -->
    <view>{{ tab.title }} 的内容</view>
  </template>
  <template #tab-1="{ tab, index }">
    <!-- 第二个标签的内容 -->
    <view>{{ tab.title }} 的内容</view>
  </template>
</vertical-tabs>
```

## 样式自定义

### 颜色主题

```vue
<vertical-tabs
  :tabs="tabs"
  active-color="#ff6b6b"
  inactive-color="#999999"
  indicator-color="#ff6b6b"
  background-color="#f8f8f8"
/>
```

### 尺寸设置

```vue
<vertical-tabs
  :tabs="tabs"
  height="calc(100vh - 200rpx)"
  width="100%"
/>
```

## 高级用法

### 带徽章的标签

```javascript
const tabs = ref([
  {
    title: '消息',
    icon: '💬',
    iconType: 'text',
    badge: '5'  // 显示数字徽章
  },
  {
    title: '通知',
    icon: '🔔',
    iconType: 'text',
    badge: 'new'  // 显示文字徽章
  }
])
```

### 禁用标签

```javascript
const tabs = ref([
  {
    title: '正常标签',
    icon: '✅',
    iconType: 'text'
  },
  {
    title: '禁用标签',
    icon: '❌',
    iconType: 'text',
    disabled: true  // 禁用此标签
  }
])
```

### 图片图标

```javascript
const tabs = ref([
  {
    title: '用户',
    icon: '/static/icons/user.png',
    iconType: 'image'
  }
])
```

## 响应式设计

在移动端（屏幕宽度小于750rpx）时，组件会自动切换为横向布局：

- 标签栏变为顶部横向排列
- 内容区域位于标签栏下方
- 指示器变为底部横线

## 注意事项

1. 确保传入的 `tabs` 数组不为空
2. `modelValue` 的值应该在 `tabs` 数组的索引范围内
3. 如果使用图片图标，请确保图片路径正确
4. 组件高度建议设置为固定值或计算值，避免布局问题

## 示例页面

查看 `src/pages/vertical-tabs-demo/vertical-tabs-demo.vue` 获取完整的使用示例。 