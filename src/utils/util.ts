import { baseUrl } from "@/api/common/apiConfig";
import { getDownloadUrl } from "@/api/common/upload";
import dayjs from "dayjs";

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
	if(urls.length>0 && urls[0]) {
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
	}
  };


//   shippingTimeList(0: 统一营业时间, 1-7 星期一~日)
export const getShippingTimeList = (shippingTimeList: any[]) => {
  return shippingTimeList.map(item => {
    return {
      ...item,
      status: item.status == '1' ? '1' : '0',
    };
  });
};

// 获取当天是星期几
export const getCurrentDay = () => {
	const currentDay = dayjs().day(); // 0-6, 0是周日
	const dayOfWeek = currentDay === 0 ? 7 : currentDay; // 转换为1-7格式，7是周日
	return dayOfWeek;
};

// 获取当前营业时间
export const getCurrentBusinessHours = (shippingTimeList: any[]) => {
  if (!shippingTimeList || !Array.isArray(shippingTimeList) || shippingTimeList.length === 0) {
    return '暂无营业时间';
  }

  // 使用dayjs获取当前是星期几 (1-7, 1是周一, 7是周日)
  const dayOfWeek = getCurrentDay();

  // 先查找当天的营业时间
  const todayTime = shippingTimeList.find((time: any) => time.day === dayOfWeek.toString());
  if (todayTime && todayTime.status === '1') {
    return {
		time: `${todayTime.openTime}-${todayTime.closeTime}`,
		status: todayTime.status,
		openTime: todayTime.openTime,
		closeTime: todayTime.closeTime,
	};
  }

  // 如果没有当天的营业时间，查找统一营业时间(day=0)
  const unifiedTime = shippingTimeList.find((time: any) => time.day === '0');
  if (unifiedTime && unifiedTime.status === '0') {
	return{
		time: `${unifiedTime.openTime}-${unifiedTime.closeTime}`,
		status: unifiedTime.status,
		openTime: unifiedTime.openTime,
		closeTime: unifiedTime.closeTime,
	};
  }

  // 如果都没有，返回第一个有效的营业时间
  const firstValidTime = shippingTimeList.find((time: any) => time.status === '0');
  if (firstValidTime) {
    return {
		time: `${firstValidTime.openTime}-${firstValidTime.closeTime}`,
		status: firstValidTime.status,
		openTime: firstValidTime.openTime,
		closeTime: firstValidTime.closeTime,
	};
  }

  return '暂无营业时间';
};


// 地图导航和选择
export const useMap = (type: string, data: any)=>{
	return new Promise((resolve, reject) => {
		if(type == 'chooseLocation'){
			uni.chooseLocation({
				success: res => {
					resolve(res);
				},
				fail: err => {
					reject(err);
				},
			});
		}else if(type == 'openLocation'){
			if(!data){
				return;
			}
			uni.openLocation({
				latitude: data.latitude,
				longitude: data.longitude,
				name: data.name,
				address: data.address,
				success: res => {
					resolve(res);
				},
				fail: err => {
					reject(err);
				},
			});
		}
	});
}

// 二维码长按处理 - 保存到相册或识别二维码
export const handleQRCodeLongPress = (imageUrl: string, title: string = '二维码') => {
	uni.showActionSheet({
		itemList: ['保存到相册', '识别二维码'],
		success: (res) => {
			if (res.tapIndex === 0) {
				// 保存到相册
				saveQRCodeToAlbum(imageUrl, title);
			} else if (res.tapIndex === 1) {
				// 识别二维码
				scanQRCode(imageUrl);
			}
		},
		fail: (err) => {
			console.log('用户取消操作:', err);
		}
	});
};

// 保存二维码到相册
export const saveQRCodeToAlbum = (imageUrl: string, title: string = '二维码') => {
	// 先下载图片到本地
	uni.downloadFile({
		url: imageUrl,
		success: (downloadRes) => {
			if (downloadRes.statusCode === 200) {
				// 保存到相册
				uni.saveImageToPhotosAlbum({
					filePath: downloadRes.tempFilePath,
					success: () => {
						uni.showToast({
							title: `${title}已保存到相册`,
							icon: 'success',
							duration: 2000
						});
					},
					fail: (err) => {
						console.log('保存到相册失败:', err);
						if (err.errMsg.includes('auth deny')) {
							// 权限被拒绝，引导用户开启权限
							uni.showModal({
								title: '提示',
								content: '需要相册权限才能保存图片，请在设置中开启相册权限',
								showCancel: true,
								cancelText: '取消',
								confirmText: '去设置',
								success: (modalRes) => {
									if (modalRes.confirm) {
										// 打开系统设置页面
										plus.runtime.openURL('app-settings:');
									}
								}
							});
						} else {
							uni.showToast({
								title: '保存失败',
								icon: 'none'
							});
						}
					}
				});
			} else {
				uni.showToast({
					title: '图片下载失败',
					icon: 'none'
				});
			}
		},
		fail: (err) => {
			console.log('下载图片失败:', err);
			uni.showToast({
				title: '图片下载失败',
				icon: 'none'
			});
		}
	});
};

// 识别二维码
export const scanQRCode = (imageUrl: string) => {
	// 先下载图片到本地
	uni.downloadFile({
		url: imageUrl,
		success: (downloadRes) => {
			if (downloadRes.statusCode === 200) {
				// 识别二维码
				uni.scanCode({
					scanType: ['qrCode'],
					success: (scanRes) => {
						console.log('识别结果:', scanRes);
						// 显示识别结果
						uni.showModal({
							title: '识别结果',
							content: scanRes.result,
							showCancel: true,
							cancelText: '关闭',
							confirmText: '复制',
							success: (modalRes) => {
								if (modalRes.confirm) {
									// 复制到剪贴板
									uni.setClipboardData({
										data: scanRes.result,
										success: () => {
											uni.showToast({
												title: '已复制到剪贴板',
												icon: 'success'
											});
										}
									});
								}
							}
						});
					},
					fail: (err) => {
						console.log('识别失败:', err);
						// 如果直接识别失败，尝试使用图片识别
						recognizeQRCodeFromImage(downloadRes.tempFilePath);
					}
				});
			} else {
				uni.showToast({
					title: '图片下载失败',
					icon: 'none'
				});
			}
		},
		fail: (err) => {
			console.log('下载图片失败:', err);
			uni.showToast({
				title: '图片下载失败',
				icon: 'none'
			});
		}
	});
};

// 从图片识别二维码（备用方案）
export const recognizeQRCodeFromImage = (imagePath: string) => {
	// 使用plus API进行图片识别
	if (typeof plus !== 'undefined' && plus.barcode) {
		plus.barcode.scan({
			path: imagePath,
			success: (result) => {
				console.log('图片识别结果:', result);
				uni.showModal({
					title: '识别结果',
					content: result,
					showCancel: true,
					cancelText: '关闭',
					confirmText: '复制',
					success: (modalRes) => {
						if (modalRes.confirm) {
							uni.setClipboardData({
								data: result,
								success: () => {
									uni.showToast({
										title: '已复制到剪贴板',
										icon: 'success'
									});
								}
							});
						}
					}
				});
			},
			fail: (err) => {
				console.log('图片识别失败:', err);
				uni.showToast({
					title: '识别失败，请重试',
					icon: 'none'
				});
			}
		});
	} else {
		// 如果plus API不可用，提示用户手动识别
		uni.showModal({
			title: '提示',
			content: '无法自动识别二维码，请长按图片保存到相册后使用其他应用识别',
			showCancel: false,
			confirmText: '知道了'
		});
	}
};