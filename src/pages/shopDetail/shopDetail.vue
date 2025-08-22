<template>
	<pageWrapper showFooter>
		<view class="shop-detail">
			<!-- 店铺信息表单 -->
			<view class="shop-form z-glass-card">
				<up-form
					:model="form"
					ref="formRef"
					:rules="state.rules"
					labelPosition="top"
					labelWidth="auto"
				>
					<!-- 店铺LOGO -->
					<up-form-item label="店铺LOGO" prop="logo">
						<UploadFile
							v-model:fileList="state.logoFileList"
							acceept="image"
							:maxCount="1"
							@afterUpload="logoAfterUpload"
						></UploadFile>
					</up-form-item>
					<!-- 店铺名称 -->
					<up-form-item label="店铺名称" prop="name">
						<up-input v-model="form.name" placeholder="请输入店铺名称" />
					</up-form-item>

					<!-- 店铺简介 -->
					<up-form-item label="店铺简介" prop="description">
						<up-textarea
							v-model="form.description"
							:rows="4"
							placeholder="请输入店铺简介"
							maxlength="200"
							count
						/>
						<!-- <text class="textarea-counter">{{ form.description.length || 0 }}/200</text> -->
					</up-form-item>
					<!-- 营业时间 -->
					<up-form-item label="营业时间" prop="openTime">
						<view class="time-picker-row">
							<view @click="showOpenTimePicker = true">
								<up-input
									class="time-picker"
									v-model="form.openTime"
									readonly
									placeholder="请选择"
								/>
							</view>
							<text class="time-separator">至</text>
							<view @click="showCloseTimePicker = true">
								<up-input
									class="time-picker"
									readonly
									v-model="form.closeTime"
									placeholder="请选择"
								/>
							</view>
						</view>
					</up-form-item>

					<!-- 店铺地址 -->
					<up-form-item label="店铺地址" prop="address">
						<view class="location-picker" @click="chooseLocation">
							<text class="placeholder-text">{{
								form.address || "点击选择地址"
							}}</text>
							<view class="location-icon"></view>
						</view>
					</up-form-item>

					<up-form-item label="店铺标签" prop="tags">
						<TagSelector
							style="width: 100%"
							v-model:selectedTags="state.selectTagList"
							:tags="state.tagList"
							:maxTags="5"
							:allowCustom="true"
						/>
					</up-form-item>

					<!-- Homebar相册 -->
					<up-form-item label="Homebar相册" prop="photo">
						<view class="photo-container">
							<UploadFile
								v-model:fileList="state.photoFileList"
								acceept="image"
								:maxCount="9"
								@afterUpload="handleImagesUpdate"
							>
								<template #tips>
									<text class="photo-tip"
										>最多上传9张照片，建议上传店铺环境、特色酒水等照片</text
									>
								</template>
							</UploadFile>
						</view>
					</up-form-item>
				</up-form>
			</view>
		</view>
		<!-- 保存按钮 -->
		<template #footer>
			<view class="save-button">
				<up-button class="" type="primary" shape="circle" @click="saveShopInfo"
					>保存</up-button
				>
			</view>
		</template>
	</pageWrapper>
	<!-- 营业时间选择器 -->
	<up-datetime-picker
		:show="showOpenTimePicker"
		v-model="form.openTime"
		mode="time"
		@confirm="confirmOpenTime"
		@cancel="showOpenTimePicker = false"
	></up-datetime-picker>
	<up-datetime-picker
		:show="showCloseTimePicker"
		v-model="form.closeTime"
		mode="time"
		@confirm="confirmCloseTime"
		@cancel="showCloseTimePicker = false"
	></up-datetime-picker>
</template>

<script lang="ts">
export default {
	options: { styleIsolation: "shared" },
};
</script>

<script setup lang="ts">
import UploadFile from "@/components/upload-file/index.vue";
import TagSelector from "@/components/tag-selector/index.vue";
import { getDownloadUrl } from "@/api/common/upload";
import { reactive, ref, nextTick, computed, watch } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
	getShopDetail,
	getAllShopConfig,
	editShopConfig,
} from "@/api/shopManage";
import { getTagList } from "@/api/common/dict";

// 表单引用
const formRef = ref(null);

// 状态管理
const form = reactive({
	logo: "",
	name: "",
	description: "",
	openTime: "18:00",
	closeTime: "02:00",
	address: "",
	phone: "",
	tags: [],
	photo: [],
	state: "",
	shopId: "",
	provinceId: "",
	cityId: "",
	distinctId: "",
	latitude: "",
	longitude: "",
});

const showOpenTimePicker = ref(false);
const showCloseTimePicker = ref(false);

const state = reactive({
	rules: {
		name: [{ required: true, message: "请输入店铺名称", trigger: "blur" }],
	},
	photoFileList: [
		// {
		// 	url: "http://192.168.1.100:8080/file/download/1724252800000",
		// 	type: "image",
		// },
	],
	logoFileList: [],
	tagList: [
		// { id: 1, name: "咖啡" },
		// { id: 2, name: "奶茶" },
		// { id: 3, name: "果汁" },
		// { id: 8, name: "甜品" },
	],
	selectTagList: [],
});

const GetTagList = () => {
	getTagList({ catalog: "shop" }).then((res) => {
		state.tagList = res.data || [];
		// if (res.data?.length > 0) {
		// state.tagList = res.data.map((item) => {
		// 	return {
		// 		id: item.id,
		// 		name: item.name,
		// 	};
		// });
		// }
	});
};

const logoAfterUpload = (images) => {
	console.log(images, 1234);
	form.logo = images[0].url;
};

const handleImagesUpdate = (images) => {
	console.log(images, 1234);
	form.photo = images.map((item) => item.url);
};

const GtShopDetail = () => {
	getAllShopConfig({
		shopId: form.shopId,
	}).then((res) => {
		let data = res.data?.[0] || {};
		for (const key in form) {
			if (key == "tags" || key == "photo") {
				form[key] = data[key] || [];
			} else {
				form[key] = data[key] || "";
			}
		}
		state.selectTagList = form.tags.map((item, index) => {
			return {
				id: `custom_${Date.now()}`,
				name: item,
			};
		});
		state.photoFileList = form.photo.map((item) => {
			return {
				url: item,
			};
		});
	});
};

// // 安全返回
const safeNavigateBack = () => {
	uni.navigateBack();
};

// 上传LOGO
// const uploadLogo = () => {
// 	uni.chooseImage({
// 		count: 1,
// 		sizeType: ["original", "compressed"],
// 		sourceType: ["photo", "camera"],
// 		success: (res) => {
// 			form.logo = res.tempFilePaths[0];
// 		},
// 	});
// };

// 更改营业开始时间
const confirmOpenTime = (e) => {
	form.openTime = e.value;
	showOpenTimePicker.value = false;
};

// 更改营业结束时间
const confirmCloseTime = (e) => {
	form.closeTime = e.value;
	showCloseTimePicker.value = false;
};

// 选择地址
const chooseLocation = () => {
	uni.chooseLocation({
		success: (res) => {
			form.address = res.address || "";
			form.latitude = res.latitude || "";
			form.longitude = res.longitude || "";
			form.provinceId = res.provinceId || "";
			form.cityId = res.cityId || "";
			form.distinctId = res.distinctId || "";
		},
	});
};

// 上传相册图片
const uploadAlbumImage = () => {
	uni.chooseImage({
		count: 9 - form.photo.length,
		sizeType: ["original", "compressed"],
		sourceType: ["photo", "camera"],
		success: (res) => {
			form.photo = form.photo.concat(res.tempFilePaths);
		},
	});
};

// 保存店铺信息
const saveShopInfo = async () => {
	// 表单验证
	try {
		await formRef.value.validate();
		form.tags = state.selectTagList.map((item) => item.name);
		await editShopConfig(form);
		uni.showToast({
			title: "保存成功",
			icon: "success",
		});
		safeNavigateBack();
	} catch (error) {}
};

// 生命周期钩子
onLoad((options) => {
	form.shopId = options.shopId;
	GetTagList();
	GtShopDetail();
});
</script>
<style lang="scss" scoped>
.shop-detail {
	padding: $up-box-pd;
	// min-height: 100vh;
	// padding-bottom: 60rpx;
	// background-color: #f5f5f5;
}
.z-glass-card {
	background: rgba(255, 255, 255, 0.8);
	backdrop-filter: blur(10px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	margin-bottom: 15px;
	padding: 15px;
	overflow: hidden;
}

.page-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px;
	margin-bottom: 20px;
}

.back-arrow {
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-arrow image {
	width: 100%;
	height: 100%;
}

.page-title {
	font-size: 20px;
	font-weight: bold;
	color: #333;
}

.empty-place {
	width: 24px;
}

.shop-form {
	padding: 16rpx;
}

.form-item {
	margin-bottom: 20px;
	padding: 15px;
	border-bottom: 1px solid #f0f0f0;
}

.form-item:last-child {
	border-bottom: none;
}

.form-label {
	font-size: 16px;
	font-weight: bold;
	color: #333;
	margin-bottom: 10px;
	display: block;
}

.logo-uploader {
	width: 80px;
	height: 80px;
	border: 1px dashed #ccc;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	overflow: hidden;
}

.shop-logo {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.upload-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
}

.upload-icon {
	width: 30px;
	height: 30px;
	background-color: #eee;
	border-radius: 50%;
	margin-bottom: 5px;
	position: relative;
}

.upload-icon::before,
.upload-icon::after {
	content: "";
	position: absolute;
	background-color: #666;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}

.upload-icon::before {
	width: 16px;
	height: 2px;
}

.upload-icon::after {
	width: 2px;
	height: 16px;
}

.upload-text {
	font-size: 12px;
	color: #666;
}

.form-input {
	height: 40px;
	border: 1px solid #eee;
	border-radius: 4px;
	padding: 0 10px;
	font-size: 14px;
}

.form-textarea {
	height: 80px;
	border: 1px solid #eee;
	border-radius: 4px;
	padding: 10px;
	font-size: 14px;
	resize: none;
	width: 100%;
	box-sizing: border-box;
}

.textarea-counter {
	font-size: 12px;
	color: #999;
	text-align: right;
	margin-top: 5px;
	display: block;
}

.time-picker-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.time-picker {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: $up-font-base;
	width: 100rpx;
}

.time-separator {
	font-size: 14px;
	color: #666;
	margin: 0 10px;
}

.location-picker {
	height: 40px;
	border: 1px solid var(--border-1);
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 10px;
	font-size: $up-font-base;
	width: 100%;
}

.placeholder-text {
	color: var(--text-2);
}

.location-icon {
	width: 8px;
	height: 8px;
	border-right: 2px solid var(--text-4);
	border-bottom: 2px solid var(--text-4);
	transform: rotate(-45deg);
}
.photo-container {
	display: flex;
	flex-direction: column;
	gap: 10px;
}
.add-icon {
	font-size: 30px;
	color: #999;
}

.save-button {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	padding: 0 $up-box-pd;
	box-sizing: border-box;
}

// 自定义样式以确保u-form标签显示在顶部
// .up-form-item {
//   flex-direction: column !important;
//   align-items: flex-start !important;
// }

// .up-form-item__body {
//   width: 100% !important;
// }
</style>
