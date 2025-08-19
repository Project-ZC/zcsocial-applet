<template>
  <pageWrapper showFooter>
    <view class="shop-detail">
      <!-- 店铺信息表单 -->
      <view class="shop-form z-glass-card">
        <up-form :model="form" ref="formRef" :rules="state.rules" labelPosition="top" labelWidth="auto">
          <!-- 店铺LOGO -->
          <up-form-item label="店铺LOGO" prop="logo">
            <view class="logo-uploader" @click="uploadLogo">
              <image class="shop-logo" :src="form.logo" mode="aspectFill" v-if="form.logo"></image>
              <view class="upload-placeholder" v-else>
                <!-- <view class="upload-icon"></view> -->
                <text class="add-icon">+</text>
              </view>
            </view>
          </up-form-item>
          
          <!-- 店铺名称 -->
          <up-form-item label="店铺名称" prop="name">
            <up-input v-model="form.name" placeholder="请输入店铺名称" />
          </up-form-item>
          
          <!-- 店铺简介 -->
          <up-form-item label="店铺简介" prop="description">
            <up-textarea  v-model="form.description"  :rows="4" placeholder="请输入店铺简介" maxlength="200" count/>
            <!-- <text class="textarea-counter">{{ form.description.length || 0 }}/200</text> -->
          </up-form-item>
          
          <!-- 营业时间 -->
          <up-form-item label="营业时间" prop="openTime" >
            <view class="time-picker-row">
              <up-input class="time-picker"  v-model="form.openTime" placeholder="请选择" @focus="showOpenTimePicker = true" />
              <text class="time-separator">至</text>
               <up-input class="time-picker" v-model="form.closeTime" placeholder="请选择" @focus="showCloseTimePicker = true" />
            </view>
          </up-form-item>
          
          <!-- 店铺地址 -->
          <up-form-item label="店铺地址" prop="address">
            <view class="location-picker" @click="chooseLocation">
              <text class="placeholder-text">{{form.address || '点击选择地址'}}</text>
              <view class="location-icon"></view>
            </view>
          </up-form-item>
          
          <!-- 店铺标签 -->
          <up-form-item label="店铺标签" prop="tags">
            <view class="tags-container">
              <view class="tags-list" >
                <view class="tag-item" v-for="(item, index) in form.tags" :key="index">
                  {{ item }}
                  <text class="remove-tag" @click="removeTag(index)">×</text>
                </view>
                <view class="add-tag" @click="showTagInput=true" v-if="!showTagInput && form.tags.length < 5">+</view>
              </view>
              <view class="tag-input-container" v-if="showTagInput">
                <up-input class="tag-input" v-model="newTag" :focus="showTagInput" @blur="hideTagInput" placeholder="输入标签名称" maxlength="6"  />
                <up-button class="add-tag-btn" @click="addTag" :disabled="!newTag">添加</up-button>
              </view>
            </view>
          </up-form-item>
          
          <!-- Homebar相册 -->
          <up-form-item label="Homebar相册" prop="photo">
            <view class="photo-container">
              <view class="photo-list">
                <view class="photo-item" v-for="(item, index) in form.photo" :key="index">
                  <image :src="item" mode="aspectFill"></image>
                  <view class="delete-image" @click="deleteAlbumImage(index)">×</view>
                </view>
                <view class="add-image" @click="uploadAlbumImage" v-if="form.photo?.length < 9">
                  <view class="add-icon">+</view>
                </view>
              </view>
              <text class="photo-tip">最多上传9张照片，建议上传店铺环境、特色酒水等照片</text>
            </view>
          </up-form-item>
        </up-form>
      </view>
    </view> 
     <!-- 保存按钮 -->
      <template #footer>
        <view class="save-button">
          <up-button class="" type="primary" shape="circle" @click="saveShopInfo">保存</up-button>
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

<script lang="ts" setup>
// import pageWrapper from "@/components/page/index.vue";
import { reactive, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getShopDetail, getAllShopConfig, editShopConfig } from "@/api/shopManage";

// 定义组件选项
defineOptions({
  name: "ShopDetailPage",
});

// 表单引用
const formRef = ref(null);

// 状态管理
const form = reactive({
  logo: '',
  name: '',
  description: '',
  openTime: '18:00',
  closeTime: '02:00',
  address: '',
  phone: '',
  tags: [],
  photo: [],
  state: '',
  shopId: '',
  provinceId: '',
  cityId: '',
  distinctId: '',
  latitude: '',
  longitude: ''
});

const showTagInput = ref(false);
const newTag = ref('');
const showOpenTimePicker = ref(false);
const showCloseTimePicker = ref(false);

const state = reactive({
  rules: {
    name: [{ required: true, message: "请输入店铺名称", trigger: "blur" }]
  }
})

const GtShopDetail = ()=>{
  getAllShopConfig({
    shopId: form.shopId
  }).then(res=>{
    let data = res.data?.[0] || {};
    console.log(data,1234)
      for(const key in form){
        if(key == 'tags' || key == 'photo'){
          form[key] = data[key] || [];
        }else{
          form[key] = data[key] || ''
        }
    }
  })
}

// 生命周期钩子
onLoad((options) => {
  form.shopId = options.shopId;
  GtShopDetail();
});


// // 安全返回
// const safeNavigateBack = () => {
//   uni.navigateBack();
// };

// 上传LOGO
const uploadLogo = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['photo', 'camera'],
    success: (res) => {
      form.logo = res.tempFilePaths[0];
    }
  });
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
    success: (res:any) => {
      form.address = res.address || ''
      form.latitude = res.latitude || ''
      form.longitude = res.longitude || ''
      form.provinceId = res.provinceId || ''
      form.cityId = res.cityId || ''
      form.distinctId = res.distinctId||''
    }
  });
};

// 隐藏标签输入框
const hideTagInput = () => {
  // showTagInput.value = false;
  // newTag.value = '';
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
    count: 9 - form.photo.length,
    sizeType: ['original', 'compressed'],
    sourceType: ['photo', 'camera'],
    success: (res) => {
      form.photo = form.photo.concat(res.tempFilePaths);
    }
  });
};

// 删除相册图片
const deleteAlbumImage = (index) => {
  form.photo.splice(index, 1);
};

// 保存店铺信息
const saveShopInfo = async() => {// 表单验证
  try {
    await formRef.value.validate();
    await editShopConfig(form);
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    });
  } catch (error) {
    uni.showToast({
      title: '保存失败: ' + (error.message || '未知错误'),
      icon: 'none'
    });
    console.error('保存店铺信息失败:', error);
  }
};
</script>

<style lang="scss" scoped>
.shop-detail {
  // padding: $up-box-pd;
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
  border: 1px solid #eee;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  font-size: $up-font-base;
  width: 100%;
}

.placeholder-text {
  color: #999;
}

.location-icon {
  width: 8px;
  height: 8px;
  border-right: 2px solid #999;
  border-bottom: 2px solid #999;
  transform: rotate(-45deg);
}

.tags-container {
  // display: flex;
  // flex-direction: column;
  width: 100%;
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
}

.tag-input-container {
  display: flex;
  margin-bottom: 10px;
  align-items: center;

  .tag-input {
    flex: 1;
    margin-right: 10px;
  }
  .add-tag-btn {
    width: 60px;
    height: 36px;
    background-color: #007AFF;
    color: white;
    font-size: 12px;
    border-radius: 8px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
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

.photo-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.photo-item {
  width: 100%;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.photo-item image {
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

.photo-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.save-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0 $up-box-pd;
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
