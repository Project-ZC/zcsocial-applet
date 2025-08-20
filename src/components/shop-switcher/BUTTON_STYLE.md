# 店铺切换按钮样式说明

## 美化效果

### 🎨 设计特点

1. **渐变背景** - 使用主题色的渐变背景，营造现代感
2. **圆角设计** - 16rpx 圆角，符合现代 UI 设计趋势
3. **阴影效果** - 柔和的阴影，增加层次感
4. **图标搭配** - 店铺图标 + 箭头图标，语义清晰
5. **店铺数量** - 显示可切换的店铺数量
6. **交互动画** - 点击时的缩放效果

### 🎯 颜色统一

使用项目主题变量，确保颜色统一：

```scss
// 主要颜色
--theme-primary: #2272FB (主题蓝)
--primary-1: #DBEBFF (浅蓝背景)
--primary-2: #CFE2F6 (渐变背景)
--primary-3: #BAD9FF (边框颜色)

// 文字颜色
--theme-content-color: #4E5969 (次要文字)
```

### 📱 响应式设计

- **最小宽度**: 280rpx
- **内边距**: 24rpx 32rpx
- **字体大小**: 28rpx (主文字) / 22rpx (副文字)
- **图标大小**: 20rpx (店铺图标) / 16rpx (箭头图标)

### ✨ 交互效果

1. **点击缩放**: `transform: scale(0.98)`
2. **阴影变化**: 点击时阴影加深
3. **过渡动画**: `transition: all 0.3s ease`

## 代码实现

### HTML 结构

```vue
<view class="shop-switch-section" @click="openShopModal">
  <view class="shop-switch-btn">
    <view class="btn-content">
      <up-icon name="shop" size="20" color="var(--theme-primary)"></up-icon>
      <text class="btn-text">切换店铺</text>
      <up-icon name="arrow-down" size="16" color="var(--theme-content-color)"></up-icon>
    </view>
    <view class="shop-count" v-if="state.shopList.length > 1">
      {{ state.shopList.length }}家店铺
    </view>
  </view>
</view>
```

### CSS 样式

```scss
.shop-switch-section {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20rpx 0;
	margin: 20rpx 0;

	.shop-switch-btn {
		background: linear-gradient(
			135deg,
			var(--primary-1) 0%,
			var(--primary-2) 100%
		);
		border: 1px solid var(--primary-3);
		border-radius: 16rpx;
		padding: 24rpx 32rpx;
		min-width: 280rpx;
		box-shadow: 0 4rpx 12rpx rgba(34, 114, 251, 0.1);
		transition: all 0.3s ease;
		cursor: pointer;

		&:active {
			transform: scale(0.98);
			box-shadow: 0 2rpx 8rpx rgba(34, 114, 251, 0.15);
		}

		.btn-content {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 12rpx;

			.btn-text {
				font-size: 28rpx;
				font-weight: 600;
				color: var(--theme-primary);
				letter-spacing: 1rpx;
			}
		}

		.shop-count {
			text-align: center;
			margin-top: 8rpx;
			font-size: 22rpx;
			color: var(--theme-content-color);
			opacity: 0.8;
		}
	}
}
```

## 优势

1. **视觉统一** - 使用主题变量，与整体设计保持一致
2. **用户体验** - 清晰的视觉反馈和交互效果
3. **信息丰富** - 显示店铺数量，提供更多上下文信息
4. **现代设计** - 符合当前移动端 UI 设计趋势
5. **易于维护** - 使用 CSS 变量，便于主题切换和维护
