<template>
  <pageWrapper showFooter :scrollTop="60">
    <view class="container">
      <view class="edit-form">
        <!-- 头像上传区域 -->
        <view class="avatar-section z-glass-card">
          <view class="avatar-container">
            <UploadFile
              v-model:fileList="state.avatarFileList"
              acceept="image"
              :maxCount="1"
              round
              @afterUpload="handleAvatarUpdate"
              customStyle
            >
              <template #default>
                <up-avatar :src="'/static/images/default-avatar.png'" size="140rpx"></up-avatar>
              </template>
              <template #tips>
                <text class="edit-text">点击更换头像</text>
              </template>
            </UploadFile>
          </view>
        </view>

        <!-- 基本信息表单 -->
        <view class="form-card z-glass-card">
          <view class="form-group">
            <view class="form-item">
              <text class="form-label">昵称</text>
              <up-input
                class="form-input"
                v-model="state.userInfo.nickname"
                placeholder="请输入昵称"
                @input="inputNickname"
              ></up-input>
              <!-- <view class="form-icon">
                <view class="icon-arrow-right"></view>
              </view> -->
            </view>
            <view class="form-item" @click="showGenderPickerFn">
              <text class="form-label">性别</text>
              <view class="form-value">{{ state.genderText[state.userInfo.gender] || '请选择' }}</view>
              <view class="form-icon">
                <view class="icon-arrow-right"></view>
              </view>
            </view>
            <view class="form-item" @click="showDatePicker">
              <text class="form-label">生日</text>
              <view class="form-value">{{ state.userInfo.birthday || '请选择' }}</view>
              <view class="form-icon">
                <view class="icon-arrow-right"></view>
              </view>
            </view>
          </view>
        </view>

        <!-- 个人标签 -->
        <view class="form-card z-glass-card">
          <view class="form-header">
            <text class="section-title">个人标签</text>
            <text class="section-subtitle">选择能代表你的标签，最多可选5个</text>
          </view>

          <view class="tags-container">
            <TagSelector
              style="width: 100%"
              v-model:selectedTags="state.selectTagList"
              :tags="state.tagList"
              :maxTags="5"
              :allowCustom="true"
            />
            <!-- <view
              class="tag-item"
              :class="{ active: state.userInfo.tags.includes(item) }"
              v-for="(item, index) in state.tagOptions"
              :key="index"
              @click="toggleTag(item)"
            >
              {{ item }}
            </view> -->
          </view>
        </view>

        <!-- 个人简介 -->
        <view class="form-card z-glass-card">
          <view class="form-header">
            <text class="section-title">个人简介</text>
            <text class="section-subtitle">介绍一下自己，让大家了解你</text>
          </view>

          <view class="bio-container">
            <up-textarea
              class="bio-textarea"
              v-model="state.userInfo.bio"
              placeholder="介绍一下自己，让大家了解你（最多200字）"
              :maxlength="200"
              @input="inputBio"
              auto-height
            ></up-textarea>
            <text class="word-count">{{ state.userInfo.bio.length }}/200</text>
          </view>
        </view>
      </view>
    </view>
    <!-- 保存按钮 -->
    <template #footer>
      <view class="save-button">
        <up-button class="" type="primary" shape="circle" @click="saveProfile">保存</up-button>
      </view>
    </template>

    <!-- 性别选择器 -->
    <up-popup class="modal" :show="state.showGenderPicker" mode="bottom">
      <view class="picker-container">
        <view class="picker-header">
          <text class="picker-title">请选择性别</text>
          <text class="picker-close" @click="closeGenderPicker">关闭</text>
        </view>
        <view class="picker-body">
          <view
            class="picker-item"
            v-for="(item, index) in state.genderOptions"
            :key="index"
            @click="selectGender(item.value)"
          >
            <text class="picker-item-text" :class="{ active: state.userInfo.gender === item.value }">
              {{ item.text }}
            </text>
            <view class="icon-check" v-if="state.userInfo.gender === item.value"></view>
          </view>
        </view>
      </view>
    </up-popup>

    <!-- 日期选择器 -->
    <up-datetime-picker
      :show="state.showDatePicker"
      v-model="state.datePickerValue"
      mode="datetime"
      @change="onDatePickerChange"
      @confirm="confirmDatePicker"
      @cancel="closeDatePicker"
    ></up-datetime-picker>

    <!-- <up-popup class="modal" :show="state.showDatePicker" mode="bottom">
      <view class="picker-container">
        <view class="picker-header">
          <text class="picker-title">请选择生日</text>
          <text class="picker-close" @click="closeDatePicker">关闭</text>
        </view>
        <view class="picker-footer">
          <up-button type="primary" shape="circle" @click="confirmDatePicker">确认</up-button>
        </view>
      </view>
    </up-popup> -->
  </pageWrapper>
</template>

<script setup lang="ts">
import pageWrapper from '@/components/page/index.vue';
import { reactive, onMounted } from 'vue';
import { onHide, onShow } from '@dcloudio/uni-app';
import UploadFile from '@/components/upload-file/index.vue';
import TagSelector from '@/components/tag-selector/index.vue';
import { getTagList } from '@/api/common/dict';
// 定义状态
const state = reactive({
  avatarFileList: [],
  userInfo: {
    id: '10086',
    nickname: '微醺一刻',
    avatar: '/static/images/avatar.png',
    gender: 'male',
    bio: '生活不止眼前的苟且，还有诗和远方的田野',
    tags: ['调酒爱好者', '社交达人', '派对控'],
    birthday: '',
  },
  genderText: {
    male: '男',
    female: '女',
  },
  tags: [
    // '调酒爱好者',
    // '社交达人',
    // '派对控',
    // '音乐迷',
    // '电影爱好者',
    // '旅行家',
    // '美食家',
    // '健身达人',
    // '游戏玩家',
    // '艺术爱好者',
  ],
  showGenderPicker: false,
  showDatePicker: false,
  genderOptions: [
    { text: '男', value: 'male' },
    { text: '女', value: 'female' },
  ],
  datePickerValue: new Date().getTime(),
  years: Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i),
  months: Array.from({ length: 12 }, (_, i) => i + 1),
  days: Array.from({ length: 31 }, (_, i) => i + 1),

  tagList: [], // 可选列表从接口获取
  selectTagList: [], // 已选列表，保存时给tags副值
});

// 生命周期钩子
onMounted(() => {
  GetTagList();
  fetchUserInfo();
});

const GetTagList = () => {
  getTagList({ catalog: 'user' }).then(res => {
    state.tagList = res.data || [];
  });
};

// 方法
const fetchUserInfo = () => {
  // 实际项目中这里需要调用接口获取用户信息
  console.log('获取用户信息');
  // 使用模拟数据，实际情况下会从接口获取
};

const saveProfile = () => {
  // 保存用户资料
  console.log('保存用户资料:', state.userInfo);
  uni.showToast({
    title: '保存成功',
    icon: 'success',
    duration: 2000,
    success: () => {
      setTimeout(() => {
        uni.navigateBack();
      }, 2000);
    },
  });
};

const handleAvatarUpdate = (e: any) => {
  console.log('handleAvatarUpdate', e);
};

const inputNickname = (e: any) => {
  state.userInfo.nickname = e.detail.value;
};

const showGenderPickerFn = () => {
  state.showGenderPicker = true;
};

const closeGenderPicker = () => {
  state.showGenderPicker = false;
};

const selectGender = (gender: string) => {
  state.userInfo.gender = gender;
  closeGenderPicker();
};

const showDatePicker = () => {
  state.showDatePicker = true;
};

const closeDatePicker = () => {
  state.showDatePicker = false;
};

const onDatePickerChange = (e: any) => {
  state.datePickerValue = e.detail.value;
};

const confirmDatePicker = () => {
  const date = new Date(state.datePickerValue);
  state.userInfo.birthday = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  closeDatePicker();
};

const toggleTag = (tag: string) => {
  const index = state.userInfo.tags.indexOf(tag);
  if (index === -1) {
    if (state.userInfo.tags.length < 5) {
      state.userInfo.tags.push(tag);
    } else {
      uni.showToast({
        title: '最多可选5个标签',
        icon: 'none',
      });
    }
  } else {
    state.userInfo.tags.splice(index, 1);
  }
};

const inputBio = (e: any) => {
  state.userInfo.bio = e.detail.value;
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';
.container {
  padding: $up-box-pd;
}

:deep(.u-upload__wrap__preview__image) {
  border-radius: 50% !important;
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

/* 头像上传区域 */
.avatar-section {
  margin-bottom: $up-box-mg;
  padding: 34rpx;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

// .avatar-container {
//   position: relative;
//   width: 160rpx;
//   height: 160rpx;
//   border-radius: 50%;
//   overflow: hidden;
// }

.avatar {
  width: 100%;
  height: 100%;
}

.avatar-edit-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0.4;
  transition: opacity 0.3s;
}

.avatar-container:active .avatar-edit-mask {
  opacity: 1;
}

.icon-camera {
  width: 40rpx;
  height: 40rpx;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/></svg>')
    no-repeat center;
  background-size: contain;
  margin-bottom: 10rpx;
}

.edit-text {
  color: var(--text-4);
  font-size: 24rpx;
}

/* 表单卡片 */
.form-card {
  margin-bottom: 20rpx;
  padding: 30rpx;
}

.form-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.section-subtitle {
  font-size: 24rpx;
  color: #999;
}

.form-group {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #333;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.form-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.form-icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-arrow-right {
  width: 20rpx;
  height: 20rpx;
  border-top: 2rpx solid #999;
  border-right: 2rpx solid #999;
  transform: rotate(45deg);
}

/* 标签选择 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10rpx;
}

.tag-item {
  margin: 10rpx;
  padding: 10rpx 30rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s;
}

.tag-item.active {
  background: #007aff;
  color: #fff;
}

/* 个人简介 */
.bio-container {
  position: relative;
}

.bio-textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
  background: #fff;
  border-radius: 12rpx;
}

.word-count {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  font-size: 24rpx;
  color: #999;
}

/* 选择器弹窗 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.picker-container {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  transform: translateY(100%);
  animation: slideUp 0.3s forwards;
}

@keyframes slideUp {
  to {
    transform: translateY(0);
  }
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.picker-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.picker-close {
  font-size: 28rpx;
  color: #999;
}

.picker-body {
  max-height: 600rpx;
  overflow-y: auto;
}

.picker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.picker-item-text {
  font-size: 28rpx;
  color: #333;
}

.picker-item-text.active {
  color: #007aff;
}

.icon-check {
  width: 40rpx;
  height: 40rpx;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23007AFF"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>')
    no-repeat center;
  background-size: contain;
}

/* 日期选择器 */
.date-picker {
  width: 100%;
  height: 400rpx;
}

.picker-column-item {
  line-height: 88rpx;
  text-align: center;
  font-size: 28rpx;
  color: #333;
}

.picker-footer {
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #f5f5f5;
}

.picker-confirm {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: #007aff;
  color: #fff;
  font-size: 32rpx;
  border-radius: 40rpx;
  border: none;
}

/* 毛玻璃效果 */
.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.glass-btn {
  background: rgba(0, 122, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 4rpx 20rpx rgba(0, 122, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.glass-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent);
  pointer-events: none;
}
</style>
