<template>
	<view class="upload-container">
		<view v-if="uploadType === 'image'" class="upload-section">
			<!-- <view class="upload-title">图片 <text>(最多{{ maxCount }}张)</text></view> -->
			<view class="upload-list">
				<view v-for="(item, index) in imageList" :key="index" class="upload-item">
					<image :src="item" mode="aspectFill" @click="previewImage(index)" />
					<view class="deleteBtn" @click.stop="deleteImage(index)">×</view>
				</view>
				<view v-if="imageList.length < maxCount" class="upload-add" @click="chooseMedia">
					<text class="plus">+</text>
				</view>
			</view>
		</view>

		<view v-if="uploadType === 'video'" class="upload-section">
			<!-- <view class="upload-title">视频 </view> -->
			<view class="upload-list">
				<view v-for="(item, index) in videoList" :key="index" class="upload-item">
					<view :src="item" class="video-preview" @click="openVideo(item)" />
					<view class="deleteBtn" @click.stop="deleteVideo(index)">×</view>
				</view>
				<view v-if="videoList.length < maxCount" class="upload-add" @click="chooseMedia">
					<text class="plus">+</text>
				</view>
			</view>
		</view>
    <view class="tips-container">
        <slot name="tips" ></slot>
    </view>
	</view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { uploadFile } from '@/utils/util';
import { getDownloadUrl } from '@/api/common/upload';

// 组件名称
defineOptions({
  name: 'Upload',
})

// 组件属性
const props = defineProps({
  maxCount: {
    type: Number,
    default: 1
  },
  uploadType: {
    type: String,
    required: true,
    validator: function (value) {
      return ['image', 'video'].includes(value)
    }
  },
  // 新增初始值属性，支持编辑场景
  fileList: {
    type: Array,
    default: () => []
  }
})

// 事件发射
const emit = defineEmits(['update:images', 'update:videos'])

// 数据状态
const imageList = ref([])
const videoList = ref([])

// 初始化列表
onMounted(() => {
  if (props.uploadType === 'image') {
    imageList.value = [...props.fileList]
  } else if (props.uploadType === 'video') {
    videoList.value = [...props.fileList]
  }
})

// 通用的媒体选择和上传函数
const openVideo = (videoUrl) => {
  uni.navigateTo({
    url: `/pages/video/video?url=${videoUrl}`
  })
}

const chooseMedia = () => {
  const currentList = props.uploadType === 'image' ? imageList.value : videoList.value
  const remainingCount = props.maxCount - currentList.length

  if (remainingCount <= 0) {
    uni.showToast({
      title: '已达到最大选择数量',
      icon: 'none'
    })
    return
  }

  const mediaType = props.uploadType
  const mediaMethod = mediaType === 'image' ? uni.chooseImage : uni.chooseVideo
  uni.showActionSheet({
    itemList: ['从相册选择', '拍摄'],
    success: (res) => {
      const sourceType = res.tapIndex === 0 ? ['album'] : ['camera']
      uni.showLoading({
        title: '上传中...'
      })
      mediaMethod({
        count: remainingCount,
        sourceType: ['photo', ...sourceType],
        sizeType: ["original", "compressed"],
        success: (res) => {
          const tempFiles = mediaType === 'image' ? res.tempFilePaths : [res.tempFilePath || res.tempFilePaths[0]]
          console.log(tempFiles, 2134)

          // 先使用临时文件路径预览
          if (mediaType === 'image') {
            imageList.value = [...imageList.value, ...tempFiles]
          } else {
            videoList.value = [...videoList.value, ...tempFiles]
          }

          // 上传文件
          const uploadPromises = tempFiles.map(filePath => uploadFile(filePath))
          uni.showLoading({
            title: '上传中...'
          })
          Promise.all(uploadPromises)
            .then(data => {
              const urls = data.map(item => item.url);
              uni.hideLoading()

              // 上传成功后更新事件中的地址
              if (mediaType === 'image') {
                emit('update:images', urls)
              } else {
                emit('update:videos', urls)
              }
            })
            .catch(err => {
              uni.hideLoading()

              uni.showToast({
                title: mediaType === 'image' ? '图片上传失败' : '视频上传失败',
                icon: 'none'
              })
              console.error(mediaType + '上传失败:', err)
            })
        },
        fail: (err) => {
          uni.showToast({
            title: '选择失败',
            icon: 'none'
          })
          uni.hideLoading()

          console.error('选择失败:', err)
        }
      })
    },
    fail: (err) => {
      console.error('操作菜单选择失败:', err)
    }
  })
}

// 预览图片
const previewImage = (index) => {
  uni.previewImage({
    urls: imageList.value,
    current: index
  })
}

// 删除图片
const deleteImage = (index) => {
  imageList.value.splice(index, 1)
  emit('update:images', imageList.value)
}

// 删除视频
const deleteVideo = (index) => {
  videoList.value.splice(index, 1)
  emit('update:videos', videoList.value)
}
</script>

<style lang="scss" scoped>

.tips-container {
	font-size: 12px;
	color: #999;
	margin-top: 5px;
}

.upload-title {
	font-size: 32rpx;
	color: #0D2A40;
	margin-bottom: 24rpx;
	font-weight: 500;

	text {
		color: rgba(13, 42, 64, .4);
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
	background-color: #F5F6FB;
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
	border: 1px solid rgba(0, 45, 54, .2);

	.plus {
		font-size: 48rpx;
		color: #93A6AC;
		font-weight: 300;
	}
}
</style>