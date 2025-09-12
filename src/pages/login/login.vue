<!-- 登录 -->
<template>
	<page-wrapper>
		<view class="container">
			<!-- Logo区域 -->
			<view class="logo-section">
				<view class="logo">
					<image
						class="wheat-icon"
						src="/static/images/logo.png"
						mode="aspectFit"
					></image>
				</view>
				<text class="app-name">玩点社交</text>
			</view>

			<!-- 登录区域 -->
			<view class="login-section">
				<!-- 手机号一键授权登录 -->
				<!-- <button
					class="auth-btn"
					open-type="getPhoneNumber"
					@getphonenumber="handleLogin"
				>
					一键授权登录
				</button> -->
				<button
					class="auth-btn"
					open-type="getUserInfo"
					@getuserinfo="handleLogin"
				>
					一键授权登录
				</button>
				<!-- <up-button class="auth-btn" @click="handleToLogin">直接登录</up-button> -->
				<view class="agreement-section" v-if="false">
					<up-checkbox-group v-model="state.isAgreed">
						<up-checkbox label=""></up-checkbox>
					</up-checkbox-group>
					<text class="agreement-text">
						登录玩点社交服务账号且代表您已经同意
						<text class="link" @click.stop="openUserAgreement"
							>《用户协议》</text
						>
						和
						<text class="link" @click.stop="openPrivacyAgreement"
							>《隐私协议》</text
						>
					</text>
				</view>
			</view>
		</view>
	</page-wrapper>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useUserStore } from "@/stores/modules/user";
import { register, toLogin } from "@/api/login";
import { PAGE_LIST } from "@/consts/page";
import { useShopStore } from "@/stores/modules/shop";

// 定义组件选项
defineOptions({
	name: "LoginPage",
});

// 创建响应式状态对象
const state = reactive({
	isAgreed: false,
	params: {} as any,
	userInfo: {} as any,
});

// 获取用户store
const userStore = useUserStore();
const shopStore = useShopStore();

// 登录处理函数
const handleLogin = async (e) => {
	// if (!state.isAgreed) {
	// 	uni.showToast({
	// 		title: "请先同意用户协议和隐私协议",
	// 		icon: "none",
	// 	});
	// 	return;
	// }
	// 手机号授权登录
	// if (!e?.detail?.code) {
	// 	uni.showToast({
	// 		title: "请先授权手机号",
	// 		icon: "none",
	// 	});
	// 	return;
	// }
	// 用户同意授权
	if (e?.detail?.userInfo) {
		// const { nickName, avatarUrl } = e.detail.userInfo;
		state.userInfo = e.detail.userInfo;
		// 执行登录逻辑
		handleToLogin(state.userInfo);
	}
};

// 直接登录
const handleToLogin = async (userInfo?: any) => {
	try {
		let data = {};
		if (userInfo) {
			data = {
				avatar: userInfo.avatarUrl,
				nickname: userInfo.nickName,
			};
		}
		await userStore.login(data);

		shopStore.GetShopStatus();
		await shopStore.GetMyShopList();

		uni.reLaunch({
			url: PAGE_LIST.INDEX,
		});
	} catch (error) {
		uni.showToast({
			title: "登录失败，请重试",
			icon: "none",
		});
	}
};

// 打开用户协议
const openUserAgreement = () => {
	uni.navigateTo({
		url: "/pages/agreement/user",
	});
};

// 打开隐私协议
const openPrivacyAgreement = () => {
	uni.navigateTo({
		url: "/pages/agreement/privacy",
	});
};
</script>

<style lang="scss" scoped>
.container {
	height: 70vh;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
}

.logo-section {
	display: flex;
	flex-direction: column;
	align-items: center;

	.logo {
		display: flex;
		align-items: center;
		justify-content: center;

		.logo-text {
			font-size: 160rpx;
			color: var(--text-1);
			font-weight: bold;
			line-height: 1;
		}

		.wheat-icon {
			width: 160rpx;
			height: 180rpx;
			margin: 0 10rpx;
		}
	}

	.app-name {
		margin-top: 24rpx;
		font-size: 36rpx;
		color: var(--text-1);
		font-weight: 500;
	}
}

.login-section {
	padding: 60rpx 20rpx;
	width: 100%;
	box-sizing: border-box;

	.auth-btn {
		width: 100%;
		height: 90rpx;
		line-height: 90rpx;
		background: var(--btn-gradient-1);
		color: #ffffff;
		font-size: 32rpx;
		border-radius: 45rpx;
		border: none;

		&:active {
			opacity: 0.8;
		}
	}
}

.agreement-section {
	display: flex;
	margin-top: 40rpx;

	:deep(.checklist-box) {
		margin: 0 !important;
		margin-right: 10rpx !important;
	}

	:deep(.checkbox__inner) {
		border-radius: 50% !important;
	}

	.agreement-label {
		display: flex;
		align-items: flex-start;

		:deep(.uni-checkbox-input) {
			margin-right: 10rpx;
			transform: scale(0.8);
		}
	}

	.agreement-text {
		font-size: 24rpx;
		color: rgba(0, 45, 54, 0.4);
		line-height: 1.5;
	}

	.link {
		color: #0694e6;
	}
}

.checklist-box {
	margin: 0 !important;
}

.checkbox__inner {
	border-radius: 50% !important;
}
</style>
