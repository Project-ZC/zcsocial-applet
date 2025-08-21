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
						>
						</UploadFile>
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

					<!-- 店铺标签 -->
					<up-form-item label="店铺标签" prop="tags">
						<view class="tags-container">
							<!-- 已选标签展示 -->
							<view class="selected-tags">
								<view class="tags-list" v-if="form.tags.length > 0">
									<view
										class="tag-item selected"
										v-for="(item, index) in form.tags"
										:key="index"
									>
										<text class="tag-text">{{ item }}</text>
										<text class="remove-tag" @click="removeTag(index)">×</text>
									</view>
								</view>

								<view
									class="add-tag"
									@click="
										showTagInput = true;
										showAvailableTags = true;
									"
									v-if="!showTagInput && form.tags.length < 5"
									>+</view
								>
							</view>

							<!-- 标签输入/选择区域 -->
							<view class="tag-input-section">
								<!-- 输入框 -->
								<view class="tag-input-container" v-if="showTagInput">
									<up-input
										class="tag-input"
										v-model="newTag"
										:focus="showTagInput"
										@focus="handleTagInputFocus"
										@blur="handleTagInputBlur"
										@confirm="addTag"
										placeholder="输入标签名称或选择已有标签"
										maxlength="10"
									>
										<template #suffix>
											<up-button
												size="small"
												class="add-tag-btn"
												type="primary"
												@click="addTag"
												:disabled="!newTag.trim()"
											>
												添加
											</up-button>
										</template>
									</up-input>
								</view>

								<!-- 可选标签列表 -->
								<view
									class="available-tags"
									v-if="showAvailableTags && availableTags.length > 0"
								>
									<view class="tags-title">可选标签：</view>
									<view class="tags-container">
										<view
											class="tag-item available"
											v-for="tag in availableTags"
											:key="tag.id"
											@click="selectTag(tag)"
										>
											<text class="tag-text">{{ tag.name }}</text>
											<up-icon
												name="plus"
												size="12"
												color="var(--primary-6)"
											></up-icon>
										</view>
									</view>
								</view>

								<!-- 搜索建议 -->
								<view
									class="search-suggestions"
									v-if="showSuggestions && filteredTags.length > 0"
								>
									<view class="suggestions-title">搜索建议：</view>
									<view class="suggestions-list">
										<view
											class="suggestion-item"
											v-for="tag in filteredTags"
											:key="tag.id"
											@click="selectTag(tag)"
										>
											<text class="suggestion-text">{{ tag.name }}</text>
											<up-icon
												name="plus"
												size="12"
												color="var(--primary-6)"
											></up-icon>
										</view>
									</view>
								</view>
							</view>
						</view>
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

<script setup lang="ts">
import UploadFile from "@/components/uploadFile/index.vue";
import { getDownloadUrl } from "@/api/common/upload";
import { reactive, ref, nextTick, computed, watch } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
	getShopDetail,
	getAllShopConfig,
	editShopConfig,
} from "@/api/shopManage";

// 定义组件选项
defineOptions({
	name: "ShopDetailPage",
});

// 标签可选列表 - 预设的常用标签
const tagList = ref([
	{ id: 1, name: "咖啡" },
	{ id: 2, name: "奶茶" },
	{ id: 3, name: "果汁" },
	{ id: 4, name: "甜品" },
	{ id: 5, name: "咖啡" },
	{ id: 6, name: "奶茶" },
	{ id: 7, name: "果汁" },
	{ id: 8, name: "甜品" },
]);

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

const showTagInput = ref(false);
const newTag = ref("");
const showOpenTimePicker = ref(false);
const showCloseTimePicker = ref(false);
const showAvailableTags = ref(false);
const showSuggestions = ref(false);

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
});

// 计算属性：可选的标签列表（排除已选择的）
const availableTags = computed(() => {
	const selectedNames = form.tags.map((tag) => tag.toLowerCase());
	return tagList.value.filter(
		(tag) => !selectedNames.includes(tag.name.toLowerCase())
	);
});

// 计算属性：搜索建议标签
const filteredTags = computed(() => {
	if (!newTag.value.trim()) return [];
	const keyword = newTag.value.toLowerCase();
	return availableTags.value.filter((tag) =>
		tag.name.toLowerCase().includes(keyword)
	);
});

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
		state.photoFileList = form.photo.map((item) => {
			return {
				url: item,
			};
		});
	});
};

// 生命周期钩子
onLoad((options) => {
	form.shopId = options.shopId;
	GtShopDetail();
});

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

// 标签输入框焦点处理
const handleTagInputFocus = () => {
	showTagInput.value = true;
	showAvailableTags.value = true;
	showSuggestions.value = false;
};

// 隐藏标签输入框
const hideTagInput = () => {
	setTimeout(() => {
		showTagInput.value = false;
		showAvailableTags.value = false;
		showSuggestions.value = false;
	}, 200);
};

// 处理标签输入框失焦
const handleTagInputBlur = () => {
	hideTagInput();
};

// 添加标签
const addTag = () => {
	const tagName = newTag.value.trim();
	if (tagName && form.tags.length < 5) {
		// 检查是否已存在相同名称的标签
		const existingTag = form.tags.find(
			(tag) => tag.toLowerCase() === tagName.toLowerCase()
		);
		if (existingTag) {
			uni.showToast({
				title: "标签已存在",
				icon: "none",
			});
			return;
		}

		form.tags.push(tagName);
		newTag.value = "";
		showTagInput.value = false;
		showAvailableTags.value = false;
		showSuggestions.value = false;
	}
};

// 选择预设标签
const selectTag = (tag) => {
	if (form.tags.length >= 5) {
		uni.showToast({
			title: "最多只能选择5个标签",
			icon: "none",
		});
		return;
	}

	// 检查是否已存在相同名称的标签
	const existingTag = form.tags.find(
		(t) => t.toLowerCase() === tag.name.toLowerCase()
	);
	if (existingTag) {
		uni.showToast({
			title: "标签已存在",
			icon: "none",
		});
		return;
	}

	form.tags.push(tag.name);
	newTag.value = "";
	showSuggestions.value = false;
};

// 移除标签
const removeTag = (index) => {
	form.tags.splice(index, 1);
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

// 监听输入值变化，显示搜索建议
watch(newTag, (newValue) => {
	if (newValue.trim() && availableTags.value.length > 0) {
		showSuggestions.value = true;
		showAvailableTags.value = false;
	} else {
		showSuggestions.value = false;
		showAvailableTags.value = true;
	}
});

// 保存店铺信息
const saveShopInfo = async () => {
	// 表单验证
	try {
		await formRef.value.validate();
		await editShopConfig(form);
		uni.showToast({
			title: "保存成功",
			icon: "success",
		});
		safeNavigateBack();
	} catch (error) {}
};
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

.tags-container {
	display: flex;
	flex-wrap: wrap;
	width: 100%;
}
.selected-tags {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 10px;
}
.tags-title {
	margin-bottom: 10px;
}
.tags-list {
	display: flex;
	flex-wrap: wrap;
	// margin-bottom: 10px;
}
.tag-item {
	display: flex;
	align-items: center;
	padding: 6px 10px;
	background-color: #f0f0f0;
	border-radius: 16px;
	font-size: 12px;
	color: #333;
	margin-right: 10px;
	margin-bottom: 10px;

	&:last-child {
		margin-right: 0;
	}
}

.tag-input-section {
	width: 100%;
}
.remove-tag {
	margin-left: 5px;
	font-size: 16px;
	color: #999;
}

.add-tag {
	width: 30px;
	height: 30px;
	background-color: #f0f0f0;
	border-radius: 15px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
	color: #999;
	margin-bottom: 10px;
	// margin-left: -10px;
}

.tag-input-container {
	display: flex;
	margin-bottom: 10px;
	align-items: center;

	.tag-input {
		flex: 1;
		// margin-right: 10px;
		height: 36rpx;
		padding-right: 0 !important;
	}
	.add-tag-btn {
		width: 100rpx;
		height: 50rpx;
		// display: flex;
		// align-items: center;
		// justify-content: center;
	}

	.add-tag-btn[disabled] {
		background-color: #ccc;
	}
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
