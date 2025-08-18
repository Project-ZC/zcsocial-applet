<template>
  <pageWrapper>
    <view class="shop-detail">
      <!-- 店铺信息表单 -->
      <view class="shop-form z-glass-card">
        <up-form :model="form" ref="uForm" :error-type="['message']" labelPosition="top" labelWidth="auto">
          <!-- 店铺LOGO -->
          <up-form-item label="店铺LOGO" prop="logo">
            <view class="logo-uploader" @click="uploadLogo">
              <image class="shop-logo" :src="form.logo" mode="aspectFill" v-if="form.logo"></image>
              <view class="upload-placeholder" v-else>
                <view class="upload-icon"></view>
                <text class="upload-text">点击上传</text>
              </view>
            </view>
          </up-form-item>
          
          <!-- 店铺名称 -->
          <up-form-item label="店铺名称" prop="name" :rules="[{ required: true, message: '请输入店铺名称' }]">
            <up-input v-model="form.name" placeholder="请输入店铺名称" />
          </up-form-item>
          
          <!-- 店铺简介 -->
          <up-form-item label="店铺简介" prop="description">
            <up-textarea  v-model="form.description"  :rows="4" placeholder="请输入店铺简介" maxlength="200" count/>
            <!-- <text class="textarea-counter">{{ form.description.length || 0 }}/200</text> -->
          </up-form-item>
          
          <!-- 营业时间 -->
          <up-form-item label="营业时间" prop="openTime" :rules="[{ required: true, message: '请选择营业时间' }]">
            <view class="time-picker-row">
              <view class="time-picker" @click="showOpenTimePicker = true">
                <text>{{ form.openTime || '请选择' }}</text>
              </view>
              <text class="time-separator">至</text>
              <view class="time-picker" @click="showCloseTimePicker = true">
                <text>{{ form.closeTime || '请选择' }}</text>
              </view>
            </view>
          </up-form-item>
          
          <!-- 店铺地址 -->
          <up-form-item label="店铺地址" prop="address" :rules="[{ required: true, message: '请选择店铺地址' }]">
            <view class="location-picker" @click="chooseLocation">
              <text v-if="form.address">{{ form.address }}</text>
              <text v-else class="placeholder-text">点击选择地址</text>
              <view class="location-icon"></view>
            </view>
          </up-form-item>
          
          <!-- 店铺标签 -->
          <up-form-item label="店铺标签" prop="tags">
            <view class="tags-container">
              <view class="tags-list">
                <view class="tag-item" v-for="(item, index) in form.tags" :key="index">
                  {{ item }}
                  <text class="remove-tag" @click="removeTag(index)">×</text>
                </view>
                <view class="add-tag" @click="showTagInput" v-if="!showTagInput && form.tags.length < 5">+</view>
              </view>
              <view class="tag-input-container" v-if="showTagInput">
                <up-input class="tag-input" v-model="newTag" :focus="showTagInput" placeholder="输入标签名称" maxlength="6" @blur="hideTagInput" />
                <up-button class="add-tag-btn" @click="addTag" :disabled="!newTag">添加</up-button>
              </view>
            </view>
          </up-form-item>
          
          <!-- Homebar相册 -->
          <up-form-item label="Homebar相册" prop="album">
            <view class="album-container">
              <view class="album-list">
                <view class="album-item" v-for="(item, index) in form.album" :key="index">
                  <image :src="item" mode="aspectFill"></image>
                  <view class="delete-image" @click="deleteAlbumImage(index)">×</view>
                </view>
                <view class="add-image" @click="uploadAlbumImage" v-if="form.album.length < 9">
                  <view class="add-icon">+</view>
                </view>
              </view>
              <text class="album-tip">最多上传9张照片，建议上传店铺环境、特色酒水等照片</text>
            </view>
          </up-form-item>
        </up-form>
      </view>
      
      <!-- 保存按钮 -->
      <up-button class="save-button" type="primary" @click="saveShopInfo">保存</up-button>
      
      <!-- 营业时间选择器 -->
      <up-datetime-picker
        :show="showOpenTimePicker"
        v-model="openTimeValue"
        mode="time"
        @confirm="confirmOpenTime"
        @cancel="showOpenTimePicker = false"
      ></up-datetime-picker>
      <up-datetime-picker
        :show="showCloseTimePicker"
        v-model="closeTimeValue"
        mode="time"
        @confirm="confirmCloseTime"
        @cancel="showCloseTimePicker = false"
      ></up-datetime-picker>
    </view> 
  </pageWrapper>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { onMounted } from "vue";

// 定义组件选项
defineOptions({
  name: "ShopDetailPage",
});

// 表单引用
const uForm = ref(null);

// 状态管理
const form = reactive({
  logo: '/static/logo.png',
  name: '醉美酒吧',
  description: '醉美酒吧是一家以鸡尾酒为主的静吧，提供舒适的环境和优质的服务，适合朋友聚会和情侣约会。',
  openTime: '18:00',
  closeTime: '02:00',
  address: '北京市朝阳区三里屯SOHO 3号楼2层',
  phone: '010-12345678',
  tags: ['静吧', '精致', '鸡尾酒', '情调', '约会'],
  album: [],
  rating: '4.8',
  orders: 1256,
  visitors: 5423,
  isOpen: true
});

const showTagInput = ref(false);
const newTag = ref('');
const showOpenTimePicker = ref(false);
const showCloseTimePicker = ref(false);
const openTimeValue = ref('');
const closeTimeValue = ref('');

// 生命周期钩子
onMounted(() => {
  fetchShopDetail();
});

// 获取店铺详情
const fetchShopDetail = () => {
  // 实际项目中这里应该调用接口获取数据
  console.log('获取店铺详情');
};

// 安全返回
const safeNavigateBack = () => {
  uni.navigateBack();
};

// 上传LOGO
const uploadLogo = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.logo = res.tempFilePaths[0];
    }
  });
};

// 输入店铺名称
const inputName = (e) => {
  form.name = e.detail.value;
};

// 输入店铺简介
const inputDescription = (e) => {
  form.description = e.detail.value;
};

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
      form.address = res.address;
    }
  });
};

// 显示标签输入框
const showTagInputFunc = () => {
  showTagInput.value = true;
};

// 隐藏标签输入框
const hideTagInput = () => {
  showTagInput.value = false;
  newTag.value = '';
};

// 输入标签
const inputTag = (e) => {
  newTag.value = e.detail.value;
};

// 添加标签
const addTag = () => {
  if (newTag.value && form.tags.length < 5) {
    form.tags.push(newTag.value);
    newTag.value = '';
    showTagInput.value = false;
  }
};

// 移除标签
const removeTag = (index) => {
  form.tags.splice(index, 1);
};

// 上传相册图片
const uploadAlbumImage = () => {
  uni.chooseImage({
    count: 9 - form.album.length,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.album = form.album.concat(res.tempFilePaths);
    }
  });
};

// 删除相册图片
const deleteAlbumImage = (index) => {
  form.album.splice(index, 1);
};

// 保存店铺信息
const saveShopInfo = () => {
  uForm.value.validate((valid) => {
    if (valid) {
      // 实际项目中这里应该调用接口保存数据
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      });
    } else {
      uni.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
    }
  });
};
</script>

<style lang="scss" scoped>
.shop-detail {
  // padding: $up-box-pd;
  // min-height: 100vh;
  // padding-bottom: 40rpx;
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
  content: '';
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
  height: 40px;
  border: 1px solid #eee;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  font-size: 14px;
}

.time-separator {
  font-size: 14px;
  color: #666;
  margin: 0 10px;
}

.location-picker {
  height: 40px;
  border: 1px solid #eee;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  font-size: 14px;
}

.placeholder-text {
  color: #999;
}

.location-icon {
  width: 16px;
  height: 16px;
  border-right: 2px solid #999;
  border-bottom: 2px solid #999;
  transform: rotate(-45deg);
}

.tags-container {
  display: flex;
  flex-direction: column;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.tag-item {
  background-color: #f0f0f0;
  color: #666;
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 15px;
  display: flex;
  align-items: center;
}

.remove-tag {
  margin-left: 5px;
  color: #999;
  font-size: 16px;
  line-height: 1;
}

.add-tag {
  width: 30px;
  height: 30px;
  border: 1px dashed #ccc;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 18px;
}

.tag-input-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tag-input {
  flex: 1;
  height: 36px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 14px;
}

.add-tag-btn {
  height: 36px;
  padding: 0 15px;
  background-color: #3aa9e8;
  color: white;
  border: none;
  border-radius: 18px;
  font-size: 14px;
}

.add-tag-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.album-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.album-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.album-item {
  width: 100%;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.album-item image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-image {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
}

.add-image {
  width: 100%;
  height: 100px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  font-size: 30px;
  color: #999;
}

.album-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.save-button {
  height: 50px;
  background-color: #3aa9e8;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  cursor: pointer;
}

.save-button:active {
  background-color: #2d8cd0;
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
