<template>
	<view class="upload-container">
		<up-upload
			:width="props.width"
			:height="props.height"
			:fileList="props.fileList"
			@afterRead="afterRead"
			@delete="deletePic"
			:maxSize="props.maxSize"
			@oversize="onOversize"
			:multiple="props.multiple"
			:maxCount="props.maxCount"
			:accept="props.acceept"
			:previewFullImage="props.previewFullImage"
			:disabled="props.disabled"
		>
		</up-upload>
		<view class="tips-container">
			<slot name="tips"></slot>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { uploadFile } from "@/utils/util";
import { getDownloadUrl } from "@/api/common/upload";

// 组件名称
defineOptions({
	name: "Upload",
});

// 组件属性
const props = defineProps({
	width: {
		type: [String, Number],
		default: "160rpx",
	},
	height: {
		type: [String, Number],
		default: "160rpx",
	},
	multiple: {
		type: Boolean,
		default: true,
	},
	maxCount: {
		type: Number,
		default: 1,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	previewFullImage: {
		type: Boolean,
		default: true,
	},
	// 最大200 MB
	maxSize: {
		type: Number,
		default: 200 * 1024 * 1024,
	},
	acceept: {
		type: String,
		required: true,
		default: "image",
		validator: function (value) {
			return ["image", "video"].includes(value);
		},
	},
	// 新增初始值属性，支持编辑场景
	// fileList: [{
	// 		type: 'image',	// 文件类型，image/video/file
	// 		url: 'https://cdn.uviewui.com/uview/swiper/1.jpg',
	// 	}],
	fileList: {
		type: Array,
		default: () => [],
	},
});

const emit = defineEmits(["update:fileList", "afterUpload"]);

// 使用内部响应式变量，初始化为props.fileList
const innerFileList = ref([...props.fileList]);

// 监听props.fileList变化，更新内部状态
watch(
	() => props.fileList,
	(newVal) => {
		innerFileList.value = [...newVal];
	}
);
// 同步内部状态到父组件
const syncToParent = () => {
	emit("update:fileList", [...innerFileList.value]);
	emit("afterUpload", [...innerFileList.value]);
};

/* 超出提示
 * @params {file} 上传的文件
 */
const onOversize = (file) => {
	uni.showToast({
		title: `文件大小在${props.maxSize / 1024 / 1024}MB以内，请重新选择`,
		icon: "none",
	});
};

// 删除图片
const deletePic = (event) => {
	innerFileList.value.splice(event.index, 1);
	syncToParent();
};

// 新增图片
const afterRead = async (event) => {
	// 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
	let lists = [].concat(event.file);
	let fileListLen = innerFileList.value.length;
	// 检查是否超过最大数量
	if (fileListLen + lists.length > props.maxCount) {
		uni.showToast({
			title: `最多只能上传${props.maxCount}个文件`,
			icon: "none",
		});
		return;
	}
	// 添加新文件到列表（上传中状态）
	lists.map((item) => {
		innerFileList.value.push({
			...item,
			status: "uploading",
			message: "上传中",
		});
	});
	syncToParent();
	for (let i = 0; i < lists.length; i++) {
		const result = await uploadFile(lists[i].url);
		let item = innerFileList.value[fileListLen];
		innerFileList.value.splice(fileListLen, 1, {
			...item,
			// url: getDownloadUrl(result.url),
			// url: event.file[0].url,
			// fileUrl: result.url,
			url: result.url,
			status: "success",
			message: "上传成功",
			isFile: true,
			isImage: item.isImage ? true : false,
		});
		fileListLen++;
	}
	syncToParent();
};

// const uploadFilePromise = (url) => {
//   return new Promise((resolve, reject) => {
//     let a = uni.uploadFile({
//       url: 'http://192.168.2.21:7001/upload', // 仅为示例，非真实的接口地址
//       filePath: url,
//       name: 'file',
//       formData: {
//         user: 'test',
//       },
//       success: (res) => {
//         setTimeout(() => {
//           resolve(res.data.data);
//         }, 1000);
//       },
//     });
//   });
</script>

<style lang="scss" scoped>
.upload-container {
}
.tips-container {
	font-size: 12px;
	color: #999;
	margin-top: 5px;
}

.upload-title {
	font-size: 32rpx;
	color: #0d2a40;
	margin-bottom: 24rpx;
	font-weight: 500;

	text {
		color: rgba(13, 42, 64, 0.4);
		font-size: 24rpx;
		font-weight: 400;
	}
}

.upload-list {
	display: flex;
	flex-wrap: wrap;
	gap: 24rpx;
}

.upload-item {
	position: relative;
	width: 112rpx;
	height: 112rpx;
	background-color: #f5f6fb;
	border-radius: 12rpx;
	overflow: hidden;

	image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.video-preview {
		width: 100%;
		height: 100%;
	}

	.deleteBtn {
		position: absolute;
		top: 8rpx;
		right: 8rpx;
		width: 24rpx;
		height: 24rpx;
		background: rgba(0, 0, 0, 0.4);
		color: #fff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		font-weight: 500;
		padding: 0;
	}
}

.upload-add {
	width: 112rpx;
	height: 112rpx;
	background-color: #fff;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgba(0, 45, 54, 0.2);

	.plus {
		font-size: 48rpx;
		color: #93a6ac;
		font-weight: 300;
	}
}
</style>
