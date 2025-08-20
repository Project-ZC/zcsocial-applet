<template>
	<!-- 公共上传组件 -->
	<up-upload
		class="margin-top16"
		:fileList="_fileList"
		@beforeRead="beforeRead"
		@afterRead="afterRead"
		@delete="deleteFile"
		:width="props.width"
		:height="props.height"
		:maxSize="props.maxSize"
		@oversize="onOversize"
		@clickPreview="clickPreview"
		:deletable="!props.disabled"
		:maxCount="props.maxCount"
		:disabled="props.disabled"
		:previewFullImage="true"
	></up-upload>
	<!-- pdf预览 -->
	<!--<v-pdf-view :preview-params="previewParams" v-model:showPdf="showPdf"></v-pdf-view>-->
</template>

<script setup lang="ts" name="baseUpload">
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
import { upload } from "@/api/common/upload";
import { getObjectURL } from "@/utils/download";
import { ref, defineProps, defineEmits, watch, onBeforeMount } from "vue";

const emit = defineEmits(["afterUpload"]);
const props = defineProps({
	// 回显文件列表
	fileList: {
		type: Array,
		default: () => [],
	},
	width: {
		type: String,
		default: "160rpx",
	},
	height: {
		type: String,
		default: "160rpx",
	},
	// 是否禁用
	disabled: {
		type: Boolean,
		default: false,
	},
	// 最大上传输
	maxCount: {
		type: Number,
		default: 1,
	},
	// 接受文件类型
	accept: {
		type: String,
		default: "*",
	},
	paramJson: {
		type: Object,
		default: null,
	},
	maxSize: {
		type: Number,
		default: 200 * 1024 * 1024,
	},
	suffix: {
		type: Array,
		default: () => ["image/jpg", "image/jpeg", "image/png"],
	},
	rule: {
		type: String,
		default: "请上传jpg、png格式文件",
	},
	formData: {
		type: Object,
		default: () => ({}),
	},
});

const bucket = ref("bk-business-01"); //文件的桶
const module = ref("workOrderImage"); //文件的目录
const _fileList = ref([]);

const previewParams = ref({}); // 预览参数
const showPdf = ref(false);

/*******
 *
 * 获取文件流，并转化成本地地址
 */

const getFileURLArr = async (arr) => {
	for (const file of arr) {
		const { url, id, fileSuffix } = file;
		// if (url) {
		//   continue;
		// }
		let _url = "";
		if (["pdf", "doc", "docx"].includes(fileSuffix)) {
			_url = VITE_APP_FILE_URL + id;
		} else {
			const res = await getFileStream(
				{ fileId: id },
				{ download: false, cancelToken: true, cancelTokenName: id }
			);
			if (res && res.status === 200) {
				_url = getObjectURL(res.data);
			}
		}
		file.url = _url;
	}
	_fileList.value = arr;
};
watch(
	() => props.fileList,
	(newVal) => {},
	{
		deep: true,
		immediate: true,
	}
);

onBeforeMount(() => {
	if (props.fileList.length) {
		// 编辑
		getFileURLArr(props.fileList);
	}
	if (props.paramJson) {
		//文件的桶
		if (props.paramJson.bucket) {
			bucket.value = props.paramJson.bucket;
		}
		//文件的目录
		if (props.paramJson.folder) {
			module.value = props.paramJson.folder;
		}
	}
});
/* 方法集合 */

/* 文件读取完成前的回调函数
 * @params {file} 上传的文件
 */
const beforeRead = (file) => {
	// 存在格式校验且不符合要求
	if (props.suffix.length && !props.suffix.includes(file.type)) {
		uni.showToast({ title: props.rule, icon: "none" });
		return false;
	}
	return true;
};
//拍照之后的操作
const afterRead = (files) => {
	// 当设置 multiple 为 true 时, file 为数组格式，否则为对象格式
	// let lists = [].concat(files.file);
	// _fileList.value = _fileList.value.concat(lists);
	// lists.map((item, index) => {
	//   files.value.push({
	//     name:'file'+index,
	//     uri: item.url,
	//     file:item
	//   });
	// })
	const file = files.file;
	uploadFile(file);
};
const uploadFile = (file) => {
	uni.uploadFile({
		url: "/v1/file/upload", // 仅为示例，并非真实的接口地址
		filePath: file.url, // 文件路径
		name: "file", // 后端通过这个key获取文件
		formData: props.formData || {},
		success: (uploadFileRes) => {
			console.log(uploadFileRes.data);
			// 强制修改数据为符合要求的数据
			const self = [].concat({ ...file, ...props.formData });
			_fileList.value = _fileList.value.concat(self);
			// 传递给父组件的数据
			emitFile(_fileList.value);
		},
		fail: (err) => {
			console.log(err);
			emit("error", err);
		},
	});
};
/* 上传文件到后台
 * @params {data} 上传的文件信息
 */
const _uploadFile = async (file) => {
	let l = _fileList.value.length;
	try {
		let res = await upload({ file: file });
		if (res.data) {
			const params = {
				imgUrl: res.data,
			};
			// 强制修改数据为符合要求的数据
			const self = [].concat({ ...file, ...params });
			_fileList.value = _fileList.value.concat(self);
			// _fileList.value = _fileList.value.push(params);
			// 传递给父组件的数据
			emitFile(_fileList.value);
		} else {
			// 失败剔除最后1项
			_fileList.value.splice(l, 1);
		}
	} catch (err) {
		// 失败剔除最后1项
		_fileList.value.splice(l, 1);
	}
};
//  //删除图片
const deleteFile = (event) => {
	_fileList.value.splice(event.index, 1);
	emitFile(_fileList.value);
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
// 点击预览
const clickPreview = async (file) => {
	// console.log('预览',file);

	const { fileSuffix, id } = file;
	if (fileSuffix.indexOf("doc") > -1 || fileSuffix.indexOf("docx") > -1) {
		uni.showToast({ title: "该文件格式不支持预览", icon: "none" });
		return false;
	}
	if (fileSuffix.indexOf("pdf") > -1) {
		showPdf.value = true;
		previewParams.value = { fileId: id };
		return false;
	}
};

/**** 抛出文件时处理文件 */
const emitFile = (fileList) => {
	let temp = [];
	if (fileList && fileList.length) {
		fileList.forEach((item) => {
			temp.push({
				id: item.id,
				fileName: item.fileName,
				fileSuffix: item.fileSuffix,
				isImage: item.isImage ? true : false, // vant 显示非标准图片路径需要这个字段---估计可以废弃了
				isFile: true, // 后端需要这个字段
			});
		});
	}
	console.log("给父组件数据", temp);
	emit("afterUpload", temp);
};
</script>
<style scoped lang="scss">
:deep(.van-uploader__file-name) {
	display: none;
}

.c-upload {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 90px;
	height: 90px;
	background: rgb(247, 247, 247);
	text-align: center;
	> p {
		font-size: 12px;
		font-family: PingFang SC, PingFang SC;
		font-weight: 400;
		color: rgb(154, 154, 154);
		line-height: 0;
	}
}
</style>
