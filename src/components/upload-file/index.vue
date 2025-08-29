<template>
	<view class="upload-container">
		<up-upload
			ref="uploadRef"
			:class="['upload-wrap', { round: props.round }]"
			:width="props.width"
			:height="props.height"
			:fileList="innerFileList"
			@afterRead="afterRead"
			@delete="deletePic"
			@clickPreview="onPreview"
			:maxSize="props.maxSize"
			@oversize="onOversize"
			:multiple="props.multiple"
			:maxCount="props.maxCount"
			:accept="props.acceept"
			:previewFullImage="props.previewFullImage"
			:disabled="props.disabled"
			:deletable="true"
		>
			<slot v-if="props.customStyle"></slot>
			<view
				v-else
				:style="{
					width: props.width,
					height: props.height,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					border: '1px dashed var(--border-1)',
					borderRadius: props.round ? '50%' : '16rpx',
				}"
			>
				<up-icon name="plus" size="24" color="var(--border-1)"></up-icon>
			</view>
		</up-upload>
		<view class="tips-container">
			<slot name="tips"></slot>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { computed, ref, watch, nextTick, getCurrentInstance } from "vue";
import { uploadFile, previewImage } from "@/utils/util";
import { getDownloadUrl } from "@/api/common/upload";

const proxy = (getCurrentInstance()?.proxy || null) as any;

// 组件名称
defineOptions({
	name: "Upload",
});

// 组件属性
const props = defineProps({
	customStyle: { type: Boolean, default: false },
	width: { type: [String, Number], default: "160rpx" },
	height: { type: [String, Number], default: "160rpx" },
	round: { type: Boolean, default: false },
	multiple: { type: Boolean, default: true },
	maxCount: { type: Number, default: 1 },
	disabled: { type: Boolean, default: false },
	previewFullImage: { type: Boolean, default: true },
	// 最大200 MB
	maxSize: { type: Number, default: 200 * 1024 * 1024 },
	acceept: {
		type: String,
		required: true,
		default: "image",
		validator: function (value) {
			return ["image", "video", "all", "media", "file"].includes(value);
		},
	},
	// 初始值（编辑场景）
	fileList: { type: Array, default: () => [] },
});

const uploadRef = ref<any>(null);

const emit = defineEmits(["update:fileList", "afterUpload"]);

// 内部响应式变量，初始化为props.fileList
const innerFileList = ref<any[]>([...props.fileList]);

// 监听props.fileList变化，更新内部状态（仅用于展示）
watch(
	() => props.fileList,
	(newVal: any[]) => {
		if (Array.isArray(newVal) && newVal.length > 0) {
			const list: any[] = [];
			for (const item of newVal) {
				const original = (item as any).fileUrl || (item as any).url || "";
				if (original) {
					list.push({
						...item,
						// url用于组件展示，始终为可访问的完整路径
						url: getDownloadUrl(original),
						// 保留原始存储路径，向外同步时使用
						fileUrl: original,
					});
				}
			}
			innerFileList.value = [...list];
		} else {
			innerFileList.value = [];
		}
	},
	{ immediate: true, deep: true }
);

// 对外同步：只返回原始路径，避免把展示用完整URL同步给父级
const syncToParent = () => {
	const plainList = innerFileList.value.map((it: any) => ({
		...it,
		url: it.fileUrl || it.url,
	}));
	emit("update:fileList", [...plainList]);
	emit("afterUpload", [...plainList]);
};

/* 超出提示
 * @params {file} 上传的文件
 */
const onOversize = (file: any) => {
	uni.showToast({
		title: `文件大小在${props.maxSize / 1024 / 1024}MB以内，请重新选择`,
		icon: "none",
	});
};

// 删除图片
const deletePic = (event: any) => {
	innerFileList.value.splice(event.index, 1);
	syncToParent();
};

// 预览图片
const onPreview = (event: any) => {
	const { index } = event;
	const current = innerFileList.value[index];
	if (current && current.url) {
		// 获取所有图片的URL列表用于预览
		const urls = innerFileList.value
			.filter((item: any) => item.url)
			.map((item: any) => item.url);

		previewImage({
			urls,
			current: index,
		});
	}
};

// 新增图片
const afterRead = async (event: any) => {
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
	lists.map((item: any) => {
		innerFileList.value.push({
			...item,
			status: "uploading",
			message: "上传中",
		});
	});
	syncToParent();
	for (let i = 0; i < lists.length; i++) {
		try {
			const result = await uploadFile(lists[i].url);
			if (!result || !result.url) throw new Error("上传失败");
			let item = innerFileList.value[fileListLen];
			innerFileList.value.splice(fileListLen, 1, {
				...item,
				// 展示用绝对地址
				url: getDownloadUrl(result.url),
				// 原始存储路径（用于回传）
				fileUrl: result.url,
				status: "success",
				message: "上传成功",
				isFile: true,
				isImage: item.isImage ? true : false,
				deletable: false,
			});
		} catch (err) {
			let item = innerFileList.value[fileListLen];
			innerFileList.value.splice(fileListLen, 1, {
				...item,
				status: "error",
				message: "上传失败",
				// 仅失败项显示删除图标
				deletable: true,
			});
			uni.showToast({ title: "上传失败，请重试", icon: "none" });
		}
		fileListLen++;
	}
	syncToParent();
};

const resetFileList = () => {
	innerFileList.value = [];
	syncToParent();
};
const triggerUpload = () => {
	resetFileList();
	uploadRef.value.chooseFile();
	// // 通过DOM操作触发文件选择
	// nextTick(() => {
	// 	const q = uni.createSelectorQuery().in(proxy);
	// 	console.log(q, 1234);
	// 	q.select(".upload-wrap input[type='file']").boundingClientRect();
	// 	q.exec((res: any[]) => {
	// 		console.log(res, 1234);
	// 	});
	// 	// if (fileInput) {
	// 	// 	// 触发文件选择对话框
	// 	// 	(fileInput as HTMLElement).click();
	// 	// } else {
	// 	// 	// 如果找不到文件输入框，尝试查找上传按钮
	// 	// 	const uploadButton = document.querySelector(
	// 	// 		".upload-wrap .u-upload__wrap__button"
	// 	// 	);
	// 	// 	if (uploadButton) {
	// 	// 		(uploadButton as HTMLElement).click();
	// 	// 	} else {
	// 	// 		// 如果都找不到，提示用户手动点击
	// 	// 		uni.showToast({
	// 	// 			title: "请手动点击上传区域选择文件",
	// 	// 			icon: "none",
	// 	// 			duration: 2000,
	// 	// 		});
	// 	// 	}
	// 	// }
	// });
};

defineExpose({
	triggerUpload,
	resetFileList,
});
</script>

<style lang="scss" scoped>
.upload-container {
	text-align: center;
}
.upload-wrap {
	&.round {
		:deep(.u-upload) {
			overflow: hidden !important;
			border-radius: 50% !important;
		}
	}
}
.tips-container {
	font-size: 12px;
	color: #999;
	margin-top: 5px;
}
</style>
