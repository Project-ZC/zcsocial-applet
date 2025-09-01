// 移除对 useUserStore 的引用以避免循环依赖
// 如果需要用户 token，可以将其作为参数传递给 http 函数
// import { useUserStore } from '@/stores/index';
import { uniCache } from "@/utils/storage";
import { baseUrl } from "@/api/common/apiConfig";

// const userStore = useUserStore();

const baseURL = baseUrl;
// 自定义错误处理回调函数，以便在应用层处理登录过期的情况
let onAuthErrorCallback: ((error: any) => Promise<void>) | null = null;
let isRefreshing = false;
let requestsQueue: Array<() => Promise<any>> = [];
// 添加最大重试次数限制
const MAX_AUTH_RETRY_COUNT = 3;
let currentAuthRetryCount = 0;

export function setOnAuthErrorCallback(
	callback: (error: any) => Promise<void>
) {
	onAuthErrorCallback = callback;
}

// 重置重试计数器
export function resetAuthRetryCount() {
	currentAuthRetryCount = 0;
}

// 通知登录成功并触发请求重发
export function notifyLoginSuccess() {
	// // 获取当前页面路径
	// const pages = getCurrentPages();
	// const currentPage = pages[pages.length - 1];
	// const currentPath = "/" + currentPage.route;
	// console.log("收到登录成功通知，刷新当前页面", currentPath);
	// // 重新加载当前页面
	// uni.redirectTo({
	// 	url: currentPath,
	// });
	if (isRefreshing) {
		console.log("收到登录成功通知，重新发送队列中的请求");
		requestsQueue.forEach((request) =>
			request().catch((err) => console.error("重新请求失败:", err))
		);
		requestsQueue = [];
		isRefreshing = false;
		// 重置重试计数器
		resetAuthRetryCount();
	} else {
		console.log("收到登录成功通知，但当前不在刷新状态");
	}
}

// 请求队列处理
const addRequest = (config: UniApp.RequestOptions) => {
	return new Promise((resolve) => {
		requestsQueue.push(() => {
			// 更新Token后重发请求
			const user = uniCache.getItem("user");
			if (user?.userInfo?.token) {
				config.header = config.header || {};
				config.header["X-App-Token"] = user.userInfo.token;
			}
			resolve(uni.request(config));
		});
	});
};

//添加拦截器
const httpInterceptor = {
	//发起请求前触发
	invoke(args: UniApp.RequestOptions) {
		if (!args.url.startsWith("http")) {
			args.url = baseURL + args.url;
		}
		args.timeout = 60000;
		args.header = {
			...args.header,
			"X-App-Version": "1.0.0",
			"X-App-Platform": "wechat",
		};
		// 添加token
		const user = uniCache.getItem("user");
		if (user?.userInfo?.token) {
			args.header["X-App-Token"] = user.userInfo.token;
		}
	},
};
uni.addInterceptor("request", httpInterceptor); //表示拦截requestAPI
uni.addInterceptor("uploadFile", httpInterceptor); //表示拦截uploadFileAPI

interface Data<T> {
	code: number;
	message: string;
	data: T;
}

const showToast = async (title: string) => {
	// 先延迟，确保loading完全消失
	await new Promise((resolve) => setTimeout(resolve, 500));
	uni.hideLoading();
	// 在延迟一小段时间后显示toast
	await new Promise((resolve) => setTimeout(resolve, 100));
	uni.showToast({
		icon: "none",
		title: title,
		mask: true,
	});
};

export const http = <T>(options: UniApp.RequestOptions) => {
	return new Promise<Data<T>>((resolve, reject) => {
		uni.showLoading({
			title: "",
		});
		uni.request({
			...options,
			success: async (res) => {
				uni.hideLoading();
				const val = res.data as Data<T>;
				if (val.code == 0) {
					resolve(val);
				} else if (val.code == 1002) {
					// 检查是否超过最大重试次数
					if (currentAuthRetryCount >= MAX_AUTH_RETRY_COUNT) {
						showToast("登录过期次数过多，请重新登录");
						uniCache.clear();
						// 重置重试计数器
						resetAuthRetryCount();
						// 清空请求队列
						requestsQueue = [];
						isRefreshing = false;
						reject({ ...val, isAuthError: true, exceededRetryLimit: true });
						return;
					}

					// 增加重试计数
					currentAuthRetryCount++;
					console.log(
						`登录过期，第 ${currentAuthRetryCount} 次重试，最大重试次数: ${MAX_AUTH_RETRY_COUNT}`
					);

					showToast(val.message || "登录过期,请重新登录");
					uniCache.clear();

					// 抛出特定错误，让上层应用逻辑处理登录过期
					const authError = {
						...val,
						isAuthError: true,
						retryCount: currentAuthRetryCount,
					};

					if (onAuthErrorCallback) {
						onAuthErrorCallback(authError)
							.then(() => {
								isRefreshing = true;
								notifyLoginSuccess();
								resolve(val);
							})
							.catch((err) => {
								reject(err);
							});
					} else {
						// 如果没有设置回调函数，将当前请求加入队列等待重试
						addRequest(options);
						reject(authError);
					}
				} else {
					val.message && showToast(val.message);
					reject(val);
				}
			},
			fail(err) {
				showToast("网路错误,换个网络试试");
				reject(err);
			},
		});
	});
};
