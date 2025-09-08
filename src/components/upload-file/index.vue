<template>
	<view class="upload-container">
		<!-- 隐藏画布：用于图片与logo合成（保持在组件作用域内） -->
		<!-- <image :src="imgUrl" mode="aspectFill"></image> -->
		<canvas
			:canvas-id="canvasId"
			:id="canvasId"
			:style="{
				position: 'fixed',
				left: '-9999px',
				top: '-9999px',
				width: canvasW + 'px',
				height: canvasH + 'px',
			}"
			:width="canvasW"
			:height="canvasH"
		></canvas>
		<up-upload
			ref="uploadRef"
			imageMode="aspectFit"
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
					border: '1px dashed var(--border-2)',
					borderRadius: props.round ? '50%' : '16rpx',
				}"
			>
				<up-icon name="plus" size="24" color="var(--text-1)"></up-icon>
			</view>
		</up-upload>
		<view class="tips-container z-tips">
			<slot name="tips"></slot>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { computed, ref, watch, nextTick, getCurrentInstance } from "vue";
import { uploadFile, previewImage } from "@/utils/util";
import { getDownloadUrl } from "@/api/common/upload";

const proxy = (getCurrentInstance()?.proxy || null) as any;

// 配置上传图片是否加logo
const logoConfig = {
	src: "", // 图片路径 https
	scale: 0.2, // 图片缩放比例
	opacity: 0.8, // 图片透明度
	margin: 10, // 图片边距
};

// 组件名称
defineOptions({
	name: "Upload",
	options: {
		styleIsolation: "shared",
	},
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
	// 新参数：logo 配置对象（优先级高于下方旧参数）
	logoConfig: { type: Object, default: () => ({}) },
});
// 统一读取 logo 配置（logoConfig 优先，旧参数回退）
const mergedLogo = computed(() => {
	const cfg: any = props.logoConfig || {};
	return {
		src: cfg.src ?? logoConfig.src,
		scale: cfg.scale ?? logoConfig.scale,
		opacity: cfg.opacity ?? logoConfig.opacity,
		margin: cfg.margin ?? logoConfig.margin,
	} as { src: string; scale: number; opacity: number; margin: number };
});

const uploadRef = ref<any>(null);

const imgUrl = ref<string>("");

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

		// previewImage({
		//   urls,
		//   current: index,
		// });
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
			// 如果是图片，则先与logo进行合成
			let uploadPath = lists[i].url;
			// 合成图片为图片统一添加logo
			const isImage =
				lists[i]?.type?.startsWith?.("image") ||
				lists[i]?.isImage === true ||
				props.acceept === "image";
			if (isImage && mergedLogo.value.src) {
				const composed = await composeImageWithLogo(uploadPath);
				if (composed) uploadPath = composed;
			}

			const result = await uploadFile(uploadPath);
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

// ---------------- 叠加Logo：画布合成 ----------------
// 说明：使用 canvas 将原图与 logo 合成，再生成临时文件用于上传
const canvasId = "uploadLogoCanvas";
const canvasW = ref<number>(0);
const canvasH = ref<number>(0);

// 获取图片信息（宽高等）
const getImgInfo = (src: string) =>
	new Promise<uniApp.GetImageInfoSuccessCallbackResult>((resolve, reject) => {
		uni.getImageInfo({ src, success: resolve, fail: reject });
	});

// 合成函数：返回临时文件路径
const composeImageWithLogo = async (originPath: string) => {
	const base = await getImgInfo(originPath);
	// 处理 logo 源：支持 /static、本地临时文件、网络图
	let logoSrc = mergedLogo.value.src as string;
	if (!logoSrc) throw new Error("logo src empty");
	if (/^https?:\/\//i.test(logoSrc)) {
		const dl: any = await new Promise((resolve) => {
			uni.downloadFile({ url: logoSrc, success: resolve, fail: resolve });
		});
		if (dl && dl.statusCode === 200 && dl.tempFilePath) {
			logoSrc = dl.tempFilePath;
		}
	}
	const logo = await getImgInfo(logoSrc);

	// 画布尺寸与原图一致
	canvasW.value = base.width;
	canvasH.value = base.height;

	await nextTick();
	// 创建绘图上下文
	const ctx = uni.createCanvasContext(canvasId, proxy);
	// 绘制原图
	ctx.drawImage(base.path, 0, 0, base.width, base.height);

	// 计算logo绘制尺寸与位置（基于短边比例）
	const shortSide = Math.min(base.width, base.height);
	const targetLogoSize = Math.max(
		1,
		Math.floor(shortSide * Math.min(Math.max(mergedLogo.value.scale, 0), 1))
	);
	const margin = Math.max(0, Math.floor(mergedLogo.value.margin));

	// 等比缩放logo至 targetLogoSize（以宽为准）
	const scale = targetLogoSize / logo.width;
	const logoDrawW = Math.round(logo.width * scale);
	const logoDrawH = Math.round(logo.height * scale);
	const dx = base.width - logoDrawW - margin;
	const dy = base.height - logoDrawH - margin;

	// 设置透明度并绘制logo
	const alpha = Math.min(1, Math.max(0, mergedLogo.value.opacity));
	// 旧版canvas无全局透明设置API，使用setGlobalAlpha
	// @ts-ignore
	if (ctx.setGlobalAlpha) ctx.setGlobalAlpha(alpha);
	ctx.drawImage(logo.path, dx, dy, logoDrawW, logoDrawH);

	return new Promise<string>((resolve, reject) => {
		ctx.draw(false, () => {
			uni.canvasToTempFilePath(
				{
					canvasId,
					quality: 1,
					success: (res) => {
						imgUrl.value = res.tempFilePath;
						resolve(res.tempFilePath);
					},
					fail: (err) => {
						reject(err);
					},
				},
				proxy as any
			);
		});
	});
};
</script>

<style lang="scss" scoped>
.upload-container {
	text-align: center;

	:deep(.u-icon__icon) {
		color: #fff;
		font-size: 36rpx !important;
	}
	:deep(.uicon-plus) {
		color: var(--text-1) !important;
	}
	:deep(.u-upload__deletable) {
		background: var(--primary-6) !important;
		color: var(--text-1) !important;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
	}
	:deep(.u-upload__deletable__icon) {
		left: 50%;
		top: 50% !important;
		transform: translate(-50%, -50%) scale(0.7);
		right: unset !important;
	}
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
	margin-top: 5px;
}
</style>
