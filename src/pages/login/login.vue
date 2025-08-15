<!-- 登录 -->
<template>
	<page-wrapper>
		<view class="container">
			<view class="container_bg"></view>
			<!-- Logo区域 -->
			<view class="logo-section">
				<view class="logo">
					<image
						class="wheat-icon"
						src="/static/images/logo.png"
						mode="aspectFit"
					></image>
				</view>
				<text class="app-name">零卡社交</text>
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
				<view class="agreement-section">
					<u-checkbox-group v-model="state.isAgreed">
						<u-checkbox label=""></u-checkbox>
					</u-checkbox-group>
					<text class="agreement-text">
						登录零卡社交服务账号且代表您已经同意
						<text class="link" @click.stop="openUserAgreement"
							>《用户协议》</text
						>
						和
						<text class="link" @click.stop="openPrivacyAgreement"
							>《隐私协议》</text
						>
						并使用本机号码登录
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

// 登录进去
const login = async (res) => {
	// 使用Pinia store保存用户信息
	userStore.setUserInfo(res);
	// uni.setStorageSync("userInfo", res);
	uni.reLaunch({
		url: "/pages/index/index",
	});
};

// 登录处理函数
const handleLogin = (e) => {
	if (!state.isAgreed) {
		uni.showToast({
			title: "请先同意用户协议和隐私协议",
			icon: "none",
		});
		return;
	}
	// 用户同意授权
	if (e?.detail?.userInfo) {
		// const { nickName, avatarUrl } = e.detail.userInfo;
		state.userInfo = e.detail.userInfo;
	}
	console.log(state.userInfo, 1234);
	// if (!e?.detail?.code) {
	// 	uni.showToast({
	// 		title: "请先授权手机号",
	// 		icon: "none",
	// 	});
	// 	return;
	// }
	// 执行登录逻辑
	uni.login({
		provider: "weixin",
		success: async (loginRes) => {
			// 处理登录成功
			uni.showLoading({
				title: "登录中...",
			});
			try {
				const params = {
					loginCode: loginRes.code,
				};
				state.params = params;
				const res = await toLogin(params);
				login({ ...res.data, ...state.userInfo });
			} catch (error: any) {
				console.log(error);
				if (error.code == 1004) {
					const res = await register({
						...state.params,
						nickname: state.userInfo.nickName,
						avatar: state.userInfo.avatarUrl,
					});
					login({ ...res.data, ...state.userInfo });
				}
			} finally {
			}
		},
		fail: (err) => {
			uni.showToast({
				title: "登录失败，请重试",
				icon: "none",
			});
		},
	});
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
	min-height: 100%;
	// padding-bottom: env(safe-area-inset-bottom);
	box-sizing: border-box;

	// &_bg {
	// 	position: absolute;
	// 	top: 0;
	// 	left: 0;
	// 	width: 100%;
	// 	height: 100%;
	// 	background: linear-gradient(
	// 		to bottom,
	// 		rgba(6, 148, 230, 0.24) 0%,
	// 		rgba(255, 255, 255, 0.16) 20%,
	// 		white 100%
	// 	);
	// 	z-index: -1;
	// }
}

.logo-section {
	margin-top: 160rpx;
	display: flex;
	flex-direction: column;
	align-items: center;

	.logo {
		display: flex;
		align-items: center;
		justify-content: center;

		.logo-text {
			font-size: 160rpx;
			color: #0099ff;
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
		font-size: 32rpx;
		color: #0694e6;
		font-weight: 500;
	}

	.app-subtitle {
		font-size: 24rpx;
		color: #002d36;
	}
}

.login-section {
	margin-top: 220rpx;
	padding: 0 60rpx;

	.auth-btn {
		width: 100%;
		height: 90rpx;
		line-height: 90rpx;
		background: #0694e6;
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
