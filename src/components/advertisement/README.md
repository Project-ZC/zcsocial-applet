# 广告组件 (Advertisement)

一个可展开收起的广告盒子组件，支持点击跳转和用户关闭功能。

## 功能特性

- ✅ 宽度占满屏幕，高度可自定义（默认 400rpx）
- ✅ 支持图片展示和点击跳转
- ✅ 用户可点击关闭按钮收起广告
- ✅ 关闭后使用本地存储记录，不再展示
- ✅ 支持内部页面跳转和外部链接处理
- ✅ 响应式设计，适配不同屏幕尺寸

## 使用方法

### 基本用法

```vue
<template>
  <advertisement
    :advertisement="advertisementData"
    :height="'400rpx'"
    @click="handleAdvertisementClick"
    @close="handleAdvertisementClose"
  />
</template>

<script setup>
import Advertisement from '@/components/advertisement/index.vue';

// 广告数据
const advertisementData = {
  id: 'ad_001',
  image: '/static/images/advertisement-banner.jpg',
  link: '/pages/shop/shop?shopId=1', // 内部页面链接
};

// 处理广告点击
const handleAdvertisementClick = advertisement => {
  console.log('广告被点击:', advertisement);
};

// 处理广告关闭
const handleAdvertisementClose = advertisement => {
  console.log('广告被关闭:', advertisement);
};
</script>
```

### Props 参数

| 参数          | 类型   | 默认值                 | 说明         |
| ------------- | ------ | ---------------------- | ------------ |
| advertisement | Object | -                      | 广告数据对象 |
| height        | String | '400rpx'               | 广告容器高度 |
| storageKey    | String | 'advertisement_hidden' | 本地存储键名 |

### Advertisement 对象结构

```typescript
interface Advertisement {
  id?: string; // 广告ID
  image: string; // 广告图片URL
  link?: string; // 点击跳转链接（可选）
}
```

### Events 事件

| 事件名 | 参数          | 说明             |
| ------ | ------------- | ---------------- |
| click  | advertisement | 广告被点击时触发 |
| close  | advertisement | 广告被关闭时触发 |

## 样式定制

组件使用 SCSS 编写，支持主题变量定制：

```scss
// 关闭按钮样式
.close-btn {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  // 可以覆盖这些样式
}
```

## 注意事项

1. 广告图片建议使用 750x400px 或类似比例的图片
2. 外部链接会复制到剪贴板，内部链接直接跳转
3. 用户关闭后，该广告在本次会话中不再显示
4. 可以通过修改 storageKey 来区分不同的广告

## 示例

### 内部页面跳转

```javascript
const advertisementData = {
  id: 'shop_promotion',
  image: '/static/images/shop-banner.jpg',
  link: '/pages/shop/shop?shopId=123',
};
```

### 外部链接

```javascript
const advertisementData = {
  id: 'external_promotion',
  image: '/static/images/external-banner.jpg',
  link: 'https://www.example.com',
};
```

### 无跳转链接

```javascript
const advertisementData = {
  id: 'info_banner',
  image: '/static/images/info-banner.jpg',
  // 没有link属性，只触发click事件
};
```
