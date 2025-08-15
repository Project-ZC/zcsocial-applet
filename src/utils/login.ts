import { toLogin } from "@/api/login";
// 移除对 useUserStore 的引用以避免循环依赖
// 如果需要设置用户信息，可以将 setUserInfo 函数作为参数传递
// import { useUserStore } from "@/stores/index";
// const userStore = useUserStore();

// 处理登录逻辑
export const loginTo = (data = {}) => {
    return new Promise((resolve, reject) => {
        uni.login({
            provider: "weixin",
            success: async (loginRes) => {
                uni.showLoading({
                    title: "登录中...",
                });
                try {
                    const params = {
                        loginCode: loginRes.code,
                    };
                    const res = await toLogin(params);
                    // 使用Pinia store保存用户信息
                    // 移除对 userStore 的直接引用
                    // userStore.setUserInfo(res.data);
                    // uni.reLaunch({
                    //     url: "/pages/index/index",
                    // });
                    resolve(res.data); // 登录成功，返回用户信息
                } catch (error: any) {
                    console.log(error);
                    reject(error); // 登录失败，返回错误信息
                } finally {
                    // uni.hideLoading();
                }
            },
            fail: (err) => {
                uni.showToast({
                    title: "登录失败，请重试",
                    icon: "none",
                });
                reject(err); // 登录失败，返回错误信息
            },
        });
    });
};