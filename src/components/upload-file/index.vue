<template>
  <view class="upload-container">
    <up-upload
      :class="['upload-wrap', { round: props.round }]"
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
import { computed, ref, watch } from 'vue';
import { uploadFile } from '@/utils/util';
import { getDownloadUrl } from '@/api/common/upload';

// 组件名称
defineOptions({
  name: 'Upload',
});

// 组件属性
const props = defineProps({
  customStyle: {
    type: Boolean,
    default: false,
  },
  width: {
    type: [String, Number],
    default: '160rpx',
  },
  height: {
    type: [String, Number],
    default: '160rpx',
  },
  round: {
    type: Boolean,
    default: false,
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
    default: 'image',
    validator: function (value) {
      return ['image', 'video'].includes(value);
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

const emit = defineEmits(['update:fileList', 'afterUpload']);

// 使用内部响应式变量，初始化为props.fileList
const innerFileList = ref([...props.fileList]);

// 监听props.fileList变化，更新内部状态
watch(
  () => props.fileList,
  newVal => {
    innerFileList.value = [...newVal];
  }
);
// 同步内部状态到父组件
const syncToParent = () => {
  emit('update:fileList', [...innerFileList.value]);
  emit('afterUpload', [...innerFileList.value]);
};

/* 超出提示
 * @params {file} 上传的文件
 */
const onOversize = file => {
  uni.showToast({
    title: `文件大小在${props.maxSize / 1024 / 1024}MB以内，请重新选择`,
    icon: 'none',
  });
};

// 删除图片
const deletePic = event => {
  innerFileList.value.splice(event.index, 1);
  syncToParent();
};

// 新增图片
const afterRead = async event => {
  // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
  let lists = [].concat(event.file);
  let fileListLen = innerFileList.value.length;
  // 检查是否超过最大数量
  if (fileListLen + lists.length > props.maxCount) {
    uni.showToast({
      title: `最多只能上传${props.maxCount}个文件`,
      icon: 'none',
    });
    return;
  }
  // 添加新文件到列表（上传中状态）
  lists.map(item => {
    innerFileList.value.push({
      ...item,
      status: 'uploading',
      message: '上传中',
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
      status: 'success',
      message: '上传成功',
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
