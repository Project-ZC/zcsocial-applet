import { uniCache } from "@/utils/storage";

// 登录状态管理
class AuthManager {
	private isLoggingIn = false;
	private loginPromise: Promise<any> | null = null;
	private retryCount = 0;
	private maxRetries = 3;

	// 检查是否正在登录
	isCurrentlyLoggingIn(): boolean {
		return this.isLoggingIn;
	}

	// 获取当前登录Promise
	getCurrentLoginPromise(): Promise<any> | null {
		return this.loginPromise;
	}

	// 开始登录
	startLogin(loginFunction: () => Promise<any>): Promise<any> {
		// 如果已经在登录中，返回现有的Promise
		if (this.isLoggingIn && this.loginPromise) {
			console.log("正在登录中，返回现有Promise");
			return this.loginPromise;
		}

		// 检查重试次数
		if (this.retryCount >= this.maxRetries) {
			console.log("登录重试次数已达上限，跳转到登录页面");
			// 无登录页场景：不跳转，重置状态并返回特定错误
			this.reset();
			uni.showToast({
				icon: "none",
				title: "登录失败，请稍后重试",
				mask: true,
			});
			const error: any = new Error("登录重试次数已达上限");
			error.code = "MAX_LOGIN_RETRY_EXCEEDED";
			return Promise.reject(error);
		}

		this.isLoggingIn = true;
		this.retryCount++;

		console.log(`开始登录，第 ${this.retryCount} 次尝试`);

		this.loginPromise = loginFunction()
			.then((result) => {
				console.log("登录成功");
				this.reset();
				return result;
			})
			.catch((error) => {
				console.error("登录失败:", error);
				this.reset();
				throw error;
			});

		return this.loginPromise;
	}

	// 重置状态
	reset(): void {
		this.isLoggingIn = false;
		this.loginPromise = null;
		this.retryCount = 0;
	}

	// 获取重试次数
	getRetryCount(): number {
		return this.retryCount;
	}

	// 设置最大重试次数
	setMaxRetries(max: number): void {
		this.maxRetries = max;
	}
}

// 创建单例实例
export const authManager = new AuthManager();

// 导出便捷函数
export const isCurrentlyLoggingIn = () => authManager.isCurrentlyLoggingIn();
export const startLogin = (loginFunction: () => Promise<any>) =>
	authManager.startLogin(loginFunction);
export const resetAuthManager = () => authManager.reset();
export const getAuthRetryCount = () => authManager.getRetryCount();
