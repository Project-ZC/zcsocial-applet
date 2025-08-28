import { baseUrl } from "@/api/common/apiConfig";
import { getDownloadUrl } from "@/api/common/upload";

// 模拟分页API 下拉加载更多
export const mockApiFetchList = (params) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			const mockData = [];
			for (let i = 0; i < params.pageSize; i++) {
				mockData.push({
					id: `${params.pageNo}_${i}`,
					title: params.keyword
						? `${params.keyword}的工单${i}`
						: `工单标题${params.pageNo}_${i}`,
					description: "内容",
					createTime:
						Date.now() - Math.floor(Math.random() * 7 * 24 * 3600 * 1000),
					creator: `用户${Math.floor(Math.random() * 100)}`,
				});
			}
			resolve({
				list: mockData,
				total: 35, // 模拟总条数
			});
		}, 1000);
	});
};

// ---------------------------- uni ----------------------------

// 获取系统信息计算滚动高度
export const getScrollHeight = (opts: any) => {
	return new Promise((resolve) => {
		opts = opts || {};
		let navbarHeight = opts.navbarHeight != undefined ? opts.navbarHeight : 44;
		let footerHeight = opts.footerHeight != undefined ? opts.footerHeight : 0;
		let bounceHeight = opts.bounceHeight != undefined ? opts.bounceHeight : 50;
		uni.getSystemInfo({
			success: (res) => {
				const scrollHeight =
					res.windowHeight - navbarHeight - footerHeight - bounceHeight;
				resolve(scrollHeight);
			},
		});
	});
};

export const toSign = () => {
	// if (!token) {
	//   uni.reLaunch({
	//     url: '/pages/login/login'
	//   })
	// } else {
	//   uni.navigateToMiniProgram({
	//     appId: "wx36596fe8c4d2ea23",
	//     path: "pages/mine/order/orderLong",
	//   })
	// }
};

// 公共确认弹框
export const showModal = (params, title = "提示") => {
	uni.showModal({
		title,
		...params,
		success: (res) => {
			if (res.confirm) {
				params.onConfirm && params.onConfirm();
			}
		},
		error: (err) => {
			console.log(err);
		},
	});
};

// 我们假设有一个文件路径 'filePath' 是你要上传的文件
export function uploadFile(filePath, formData?: any) {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: `${baseUrl}/v1/file/upload`, // 你要上传的接口地址
			filePath: filePath, // 文件的临时路径
			name: "file", // 服务器接收文件的字段名
			formData,
			// header: {
			// 'Authorization': token,
			// },
			success: function (res) {
				const { data } = JSON.parse(res.data); // 解析返还的数据
				if (data) {
					resolve({
						url: data,
					});
				} else {
					reject(new Error("没有找到返回的URL")); // 无法找到URL
				}
			},
			fail: function (err) {
				reject(new Error("上传失败: " + err.errMsg)); // 上传失败
			},
		});
	});
}

// 公共预览图片
export const previewImage = ({ urls, current = 0 }: { urls: string[]; current?: number }) => {
	uni.previewImage({
	  current,
	  urls: urls,
	  success: () => {},
	  fail: (err) => {
        uni.showToast({
          title: '预览失败',
          icon: 'none'
        });
      }
	});
  };
