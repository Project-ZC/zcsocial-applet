import { useUserStore } from "@/stores/user";
const userStore = useUserStore();
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
		if (userStore.userInfo?.token) {
			args.header["X-App-Token"] = userStore.userInfo.token;
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
						title: "登录过期,请重新登录",
					});
					uni.clearStorageSync();
					reject(val);
					setTimeout(() => {
						uni.navigateTo({
							url: "/pages/login/login",
						});
					}, 1500);
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
