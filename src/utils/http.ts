// 移除对 useUserStore 的引用以避免循环依赖
// 如果需要用户 token，可以将其作为参数传递给 http 函数
// import { useUserStore } from '@/stores/index';
import { uniCache } from "@/utils/storage";

// const userStore = useUserStore();

const baseURL = "http://115.190.120.193:8080";
// 自定义错误处理回调函数，以便在应用层处理登录过期的情况
let onAuthErrorCallback: ((error: any) => Promise<void>) | null = null;
let isRefreshing = false;
let requestsQueue: Array<() => Promise<any>> = [];

export function setOnAuthErrorCallback(callback: (error: any) => Promise<void>) {
	onAuthErrorCallback = callback;
}

// 通知登录成功并触发请求重发
export function notifyLoginSuccess() {
	if (isRefreshing) {
		console.log('收到登录成功通知，重新发送队列中的请求');
		requestsQueue.forEach(request => request().catch(err => console.error('重新请求失败:', err)));
		requestsQueue = [];
		isRefreshing = false;
	} else {
		console.log('收到登录成功通知，但当前不在刷新状态');
	}
}
// 请求队列处理
const addRequest = (config) => {
	return new Promise((resolve) => {
		requestsQueue.push(() => {
			// 更新Token后重发请求
			const user = uniCache.getItem('user')
			config.header.Authorization = `Bearer ${user?.userInfo?.token}`
			resolve(uni.request(config))
		})
	})
}

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
		const user = uniCache.getItem('user')
		if (user?.userInfo?.token) {
			args.header["X-App-Token"] = user?.userInfo?.token;
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


export const http = <T>(options: UniApp.RequestOptions) => {
	return new Promise<Data<T>>((resolve, reject) => {
		uni.showLoading({
			title: "加载中...",
		});
		uni.request({
			...options,
			success(res) {
				const val = res.data as Data<T>;
				if (val.code == 0) {
					resolve(val);
				} else if (val.code == 1002) {
					uni.showToast({
						icon: "none",
						title: val.message || "登录过期,请重新登录",
					});
					uniCache.clear();
					// 抛出特定错误，让上层应用逻辑处理登录过期
					const authError = { ...val, isAuthError: true };
					if (onAuthErrorCallback) {
						onAuthErrorCallback(authError).then(() => {
							isRefreshing = true;
							notifyLoginSuccess()
							resolve(val);
						}).catch(err => {
							reject(err);
						});
					}
					// 将当前请求加入队列
					addRequest(options)
					reject(authError);
				} else {
					if (val.message) {
						uni.showToast({
							icon: "none",
							title: val.message,
						});
					}
					reject(val);
				}
			},
			fail(err) {
				uni.showToast({
					icon: "none",
					title: "网路错误,换个网络试试",
				});
				reject(err);
			},
			complete() {
				uni.hideLoading();
			},
		});
	});
};
