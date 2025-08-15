// 移除对 useUserStore 的引用以避免循环依赖
// 如果需要用户 token，可以将其作为参数传递给 http 函数
// import { useUserStore } from '@/stores/index';
import { loginTo } from "@/utils/login";
import { uniCache } from "@/utils/storage";

const baseURL = "http://115.190.120.193:8080";
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
					if (val.message) {
						uni.showToast({
							icon: "none",
							title: val.message,
						});
					}
					resolve(val);
				} else if (val.code == 1002) {
					uni.showToast({
						icon: "none",
						title: val.message || "登录过期,请重新登录",
					});
					uni.clearStorageSync();
					setTimeout(() => {
						loginTo()
					}, 300);
					// reject(val);
					// setTimeout(() => {
					// 	uni.navigateTo({
					// 		url: "/pages/login/login",
					// 	});
					// }, 1500);
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
