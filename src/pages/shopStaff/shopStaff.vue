<template>
  <pageWrapper>
    <!-- 顶部导航栏 -->
    <up-navbar
      class="z-navbar"
      :title="'团队管理'"
      :border="true"
      leftIcon=""
    >
      <template #right>
        <view class="header-right">
          <!-- <up-icon name="scan" size="22" @click="generateQRCode"></up-icon> -->
          <up-icon name="plus" size="22" @click="openAddModal"></up-icon>
        </view>
      </template>
    </up-navbar>

    <!-- 员工管理页 -->
    <view class="staff-container">
      <!-- 角色筛选 -->
     <scroll-view scroll-x class="role-filter-scroll">
        <view class="role-filter">
          <view class="role-item" @click="filterByRole('all')" :class="{ active: state.currentRole === 'all' }">
            全部
          </view>
          <view
            v-for="(role, index) in state.roleList"
            :key="index"
            class="role-item"
            :class="{ active: state.currentRole === role.id }"
            @click="filterByRole(role.id)"
          >
            {{ role.name }}
          </view>
        </view>
      </scroll-view>

      <!-- 员工列表 -->
     <scroll-view  
       scroll-y 
       class="scroll-content" 
       @scrolltolower="debouncedLoadStaffList"
       :scroll-top="scrollTop"
       :scroll-with-animation="false"
       :enhanced="true"
       :bounces="false"
       :show-scrollbar="false"
       :fast-deceleration="true"
     >
      <up-list v-if="!state.isLoading && state.filteredStaffList.length > 0" >
        <up-list-item 
          v-for="(item, index) in state.filteredStaffList" 
          :key="item.id"
          :data-index="index"
        >
          <view class="staff-item">
            <view class="staff-avatar">
              <up-avatar :src="item.userAvatar" size="50"></up-avatar>
            </view>
            <view class="staff-info">
              <view class="staff-header">
                <view class="staff-name">{{ item.userNickname }}</view>
                <view class="staff-role" v-if="item.userRoleNames">{{ item.userRoleNames }}</view>
              </view>
              <view class="staff-intro">{{ item.userIntroduce }}</view>
              <view class="staff-contact" v-if="item.userMobile || item.id">
                <text v-if="item.userMobile">电话: {{ item.userMobile }}</text>
                <text v-if="item.userMobile && item.id"> | </text>
                <text v-if="item.id">零卡id: {{ item.id }}</text>
              </view>
              <view class="staff-roleIds" v-if="item.userRoleNames && item.userRoleNames.length > 0">
                <text class="permission-tag" v-for="(permission, pIndex) in item.userRoleNames" :key="pIndex">
                  {{ permission }}
                </text>
              </view>
            </view>
            <view class="staff-actions">
              <view class="action-edit" @click="openEditModal(item)">
                <up-icon name="edit-pen" color="#1890ff" size="26"></up-icon>
              </view>
              <view class="action-delete" @click="openDeleteModal(item)">
                <up-icon name="trash" color="#ff4d4f" size="26"></up-icon>
              </view>
            </view>
          </view>
        </up-list-item>
      </up-list>
      
      <!-- 加载更多状态 -->
      <view class="loading-more" v-if="state.isLoading && state.filteredStaffList.length > 0">
        <view class="loading-text">加载中...</view>
      </view>
      </scroll-view>

      <!-- 员工列表为空状态 -->
      <view class="empty-state" v-if="!state.isLoading && state.filteredStaffList.length === 0">
        <up-empty mode="data" icon="/static/images/empty-staff.png">
          <template #text>
            <view class="empty-text">暂无员工</view>
            <view class="empty-subtext">点击右上角"+"添加员工</view>
          </template>
        </up-empty>
      </view>
    </view>
  </pageWrapper>

    <!-- 添加/编辑员工模态框 -->
    <up-popup  
      :show="state.showModal"
      @close="closeModal"
      round="20rpx"
    >
    <view class="z-modal">
      <view class="modal-header">
        <view class="modal-title">{{ state.modalTitle }}</view>
        <view class="close-btn" @click="closeModal">
          <up-icon name="close" size="20"></up-icon>
        </view>
      </view>
      <scroll-view 
        scroll-y 
        class="scroll-content"
      >
      <view class="modal-body">
        <view class="unified-search-container" v-if="!state.isEdit">
          <view class="search-tabs">
            <view
              class="search-tab"
              :class="{ active: state.searchType === 'mobile' }"
              @click="switchSearchType('mobile')"
            >
              手机号
            </view>
            <view
              class="search-tab"
              :class="{ active: state.searchType === 'zero' }"
              @click="switchSearchType('zero')"
            >
              零卡ID
            </view>
          </view>
          <view class="search-box">
            <up-input
              v-model="state.searchKeyword"
              :placeholder="state.searchType === 'mobile' ? '请输入手机号码' : '请输入零卡ID'"
              :type="state.searchType === 'mobile' ? 'number' : 'text'"
              clearable
            />
            <up-button type="primary" class="search-btn-modal" @click="onSearch">搜索</up-button>
          </view>
        </view>
        <view v-if="state.resultList.length > 0">
          <view class="form-item">
            <view class="form-label">头像</view>
            <view class="avatar-picker" @click="state.isEdit ? null : chooseImage()">
              <up-avatar :src="state.tempStaff.avatar || '/static/images/default-avatar.png'" size="80"></up-avatar>
              <!-- <view class="avatar-upload-icon" v-if="!state.isEdit">
                <up-icon name="camera" color="#fff" size="16"></up-icon>
              </view> -->
            </view>
          </view>
          <view class="form-item">
            <view class="form-label">呢称</view>
            <up-input
              v-model="state.tempStaff.nickname"
              placeholder="请输入员工呢称"
              border="surround"
              disabled
            />
          </view>
          <view class="form-item">
            <view class="form-label">职位</view>
            <view class="role-display">
              <view class="current-role">{{ state.tempStaff.role || '暂无职位' }}</view>
              <view class="role-tip">职位将根据所选权限自动生成</view>
            </view>
          </view>

          <view class="form-item">
            <view class="form-label">手机号</view>
            <up-input
              v-model="state.tempStaff.mobile"
              type="number"
              placeholder="请输入手机号码"
              border="surround"
              disabled
            />
          </view>

          <view class="form-item">
            <view class="form-label">零卡id</view>
            <up-input
              v-model="state.tempStaff.id"
              placeholder="请输入零卡id"
              border="surround"
              disabled
            />
          </view>

             <view class="form-item">
              <view class="form-label">员工权限</view>
                <view class="roleIds-list">
                 <view
                   v-for="(item, index) in state.roleList"
                   :key="index"
                   class="permission-item"
                   @click="selectPermission(item.id)"
                 >
                   <view class="permission-checkbox" :class="{ checked: state.tempStaff.roleIds.includes(item.id) }">
                     <up-icon
                       v-if="state.tempStaff.roleIds.includes(item.id)"
                       name="checkbox-mark"
                       color="#fff"
                       size="16"
                     ></up-icon>
                   </view>
                   <view class="permission-content">
                     <view class="permission-name">{{ item.name }}</view>
                     <view class="permission-desc">{{ item.description || '暂无描述' }}</view>
                   </view>
                 </view>
               </view>
            </view>

          <view class="form-item">
            <view class="form-label">简介</view>
            <up-textarea
              v-model="state.tempStaff.introduce"
              placeholder="请输入员工简介"
              auto-height
              border="surround"
              disabled
            ></up-textarea>
          </view>
        </view>
        <emptyData v-else/>
      </view>
      </scroll-view>
      <view class="modal-footer" v-if="state.resultList.length > 0">
        <up-button @click="closeModal" shape="circle">取消</up-button>
        <up-button type="primary" shape="circle" @click="saveStaff">确定</up-button>
      </view>
      </view>
    </up-popup>

    <!-- 店铺二维码模态框 -->
    <up-modal
      :show="state.showQRCodeModal"
      title="店铺招募二维码"
      width="80%"
      :show-cancel-button="false"
      :show-confirm-button="false"
    >
      <view class="qrcode-container">
        <up-image
          :src="state.shopQRCode"
          width="300rpx"
          height="300rpx"
          mode="aspectFit"
          show-menu-by-longpress
        ></up-image>
        <view class="qrcode-tip">长按保存或分享该二维码</view>
        <view class="qrcode-actions">
          <up-button class="save-btn" @click="saveQRCodeToAlbum">保存到相册</up-button>
          <up-button class="share-btn" @click="shareQRCode">分享给好友</up-button>
        </view>
      </view>
    </up-modal>
</template>

<script lang="ts" setup>
import {cloneDeep} from 'lodash-es'
import pageWrapper from "@/components/page/index.vue";
import emptyData from "@/components/empty-data/index.vue";
import { ref, reactive, onMounted } from 'vue'

import { addShopStaff, getShopStaffList, getAllShopStaffList, editShopStaff, deleteShopStaff } from '@/api/shopStaff'
import { getAllUserList } from '@/api/userManage'
import { getAllRoleList } from '@/api/roleManage'

// 防抖函数
const debounce = (func: Function, wait: number) => {
  let timeout: number | undefined
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}


interface PermissionOption {
  value: string
  name: string
  description: string
}

// 滚动位置状态
const scrollTop = ref(0)

// 状态管理
const state = reactive({
  shopId: '123456',
  currentRole: 'all',
  roleList: [
    // { label: '全部', value: 'all' },
    // { label: '店长', value: '店长' },
    // { label: '调酒师', value: '调酒师' },
    // { label: '主理人', value: '主理人' },
    // { label: '其他', value: '其他' }
  ] ,

  resultList: [] as any,
  
  permissionOptions: [
    {
      value: 'manager_permission',
      name: '店长权限',
      description: '拥有店铺全面管理权限，包括员工管理、财务查看等'
    },
    {
      value: 'bartender_permission',
      name: '调酒师权限',
      description: '负责调酒制作、酒品管理和顾客服务相关权限'
    },
    {
      value: 'owner_permission',
      name: '主理人权限',
      description: '店铺运营决策权限，包括活动策划、品牌推广等'
    }
  ] as PermissionOption[],
  
  staffList: [],
  filteredStaffList: [],
  
  searchType: 'mobile',
  searchKeyword: '1384906259',
  
  showModal: false,
  showQRCodeModal: false,
  modalTitle: '添加员工',
  
  tempStaff: {
    id: '',
    avatar: '',
    nickname: '',
    role: '',
    mobile: '',
    introduce: '',
    roleIds: [] as string[],

  },
  
  isEdit: true,
  isLoading: true,
  shopQRCode: '',

  pageParams: {
    pageNum: 1,
    pageSize: 10,
    total: 0,
  },
})

// 加载员工列表
const loadStaffList = async() => {
  state.isLoading = true;
  try {
    const res = await getShopStaffList({
     pageNum: state.pageParams.pageNum,
     pageSize: state.pageParams.pageSize,
     roleId: state.currentRole == 'all'? '' : state.currentRole
    })
    const list = res.data.list;
    state.pageParams.total = res.data.total;
    if (state.pageParams.pageNum === 1) {
      state.filteredStaffList = list;
    } else {
      state.filteredStaffList.push(...list);
    }
    state.staffList = cloneDeep(state.filteredStaffList)
  } catch (error) {
  } finally {
    state.isLoading = false;
  }
}

// 防抖处理的滚动到底部加载
const debouncedLoadStaffList = debounce(() => {
  if (state.filteredStaffList.length < state.pageParams.total) {
    state.pageParams.pageNum++;
    loadStaffList();
  }
}, 200);

// 筛选员工角色
const filterByRole = (role: string = state.currentRole) => {
  state.pageParams.pageNum = 1;
  state.currentRole = role;
  loadStaffList();
  // if (role === 'all') {
  //   state.filteredStaffList = [...state.staffList]
  // } else {
  //   state.filteredStaffList = state.staffList.filter(item => item.role === role)
  // }
}

const GetAllRoleList = async()=>{
  try {
    const res = await getAllRoleList({})
    state.roleList = res.data || [];
  } catch (error) {
    console.log(error,1234)
  }
}

// 打开添加员工模态框
const openAddModal = async() => {
  state.modalTitle = '添加员工'
  state.isEdit = false
  state.showModal = true;
}

// 打开编辑员工模态框
const openEditModal = (staff: any) => {
  state.resultList = [staff]
  state.modalTitle = '编辑员工'
  state.isEdit = true
  for(const key in staff){
    state.tempStaff[key] = staff[key]
  }
  state.showModal = true
}

// 关闭员工模态框
const closeModal = () => {
  state.showModal = false;
  state.searchKeyword = '';
  state.searchType = 'mobile';
  state.tempStaff = {
    id: '',
    avatar: '',
    nickname: '',
    role: '',
    mobile: '',
    introduce: '',
    roleIds: []
  }
  state.resultList = []
}

// 选择权限（单选）
const selectPermission = (permissionId: string) => {
  console.log('选择权限:', permissionId)
  
  // 如果已经选中，则取消选中
  if (state.tempStaff.roleIds.includes(permissionId)) {
    state.tempStaff.roleIds = []
    state.tempStaff.role = ''
  } else {
    // 单选模式：只选中当前点击的权限
    state.tempStaff.roleIds = [permissionId]
    
    // 根据选中的权限生成职位描述
    const selectedRole = state.roleList.find(item => item.id === permissionId)
    state.tempStaff.role = selectedRole?.name || ''
  }
}

// 切换权限（保留原有函数以兼容）
const togglePermission = (permission: string) => {
  const roleIds = [...state.tempStaff.roleIds]
  const index = roleIds.indexOf(permission)
  
  if (index > -1) {
    roleIds.splice(index, 1)
  } else {
    roleIds.push(permission)
  }
  
  state.tempStaff.roleIds = roleIds
  state.tempStaff.role = generateRoleByPermissions(roleIds)
}

// 生成权限名称数组
const generatePermissionNames = (roleIds: string[]) => {
  // 单选模式，只处理第一个权限
  if (!roleIds || roleIds.length === 0) {
    return []
  }
  
  const permissionId = roleIds[0]
  const role = state.roleList.find(role => role.id === permissionId)
  return role ? [role.name] : []
}

// 根据权限生成职位描述
const generateRoleByPermissions = (roleIds: string[]) => {
  if (!roleIds || roleIds.length === 0) {
    return ''
  }
  
  // 单选模式，只取第一个权限
  const permissionId = roleIds[0]
  const selectedRole = state.roleList.find(role => role.id === permissionId)
  
  if (!selectedRole) {
    return ''
  }
  
  return selectedRole.name
}

// 打开删除确认模态框
const openDeleteModal = (staff: any) => {
  // 使用 uview-plus 的 up-modal 显示确认删除框
  uni.showModal ({
    title: '提示',
    content: '确定要删除该员工吗？此操作不可撤销。',
    confirmText: '删除',
    cancelText: '取消',
    confirmColor: '#f76560',
    success: (res) => {
      if (res.confirm) {
        // 用户点击了删除按钮
        deleteStaff(staff)
      }
    }
  })
}

// 保存员工
const saveStaff = async() => {
  // 表单验证
    if (!state.tempStaff.role) {
      uni.showToast({
        title: '请选择职位',
        icon: 'none'
      })
      return
    }
  // uni.showLoading({ title: '保存中...' })
  try {
    let params = {
      roleIds: state.tempStaff.roleIds,
      userId: state.tempStaff.id,
    }
    await addShopStaff(params);
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
    closeModal()
    loadStaffList()
  } catch (error) {}
  
  // setTimeout(() => {
  //   let staffList = [...state.staffList]
    
  //   if (staff.id && isEdit) {
  //     // 编辑现有员工
  //     const index = staffList.findIndex(item => item.id === staff.id)
  //     if (index !== -1) {
  //       staffList[index] = {
  //         ...staffList[index],
  //         roleIds: staff.roleIds || [],
  //         permissionNames: generatePermissionNames(staff.roleIds || []),
  //         role: generateRoleByPermissions(staff.roleIds || [])
  //       }
  //     }
  //   } else {
  //     // 添加新员工
  //     const newStaff: Staff = {
  //       ...staff,
  //       id: Date.now().toString(),
  //       avatar: staff.avatar || '/static/images/default-avatar.png',
  //       permissionNames: generatePermissionNames(staff.roleIds || [])
  //     }
  //     staffList.push(newStaff)
  //   }
    
  //   state.staffList = staffList
  //   state.showModal = false
  //   filterByRole()
    
  //   uni.hideLoading()
  //   uni.showToast({
  //     title: isEdit ? '权限更新成功' : '添加成功',
  //     icon: 'success'
  //   })
  // }, 800)
}

// 删除员工
const deleteStaff = async (staff: any) => {
  if (!staff || !staff.id) return
  // uni.showLoading({ title: '删除中...' })
  try {
    // 调用删除员工API
    await deleteShopStaff({ userId: staff.id })
    // 删除成功后刷新列表
    uni.showToast({
      title: '删除成功',
      icon: 'success'
    })
    await loadStaffList()
  } catch (error) {
  }
}

// 打开招募二维码模态框
const generateQRCode = () => {
  // state.shopQRCode = '/static/images/qrcode-placeholder.png'
  state.showQRCodeModal = true
}

// 切换搜索类型
const switchSearchType = (type: string) => {
  state.searchType = type
  state.searchKeyword = ''
}

// 执行搜索
const onSearch = async() => {
  const { searchType, searchKeyword } = state
  const keyword = searchKeyword.trim()
  
  if (!keyword) {
    uni.showToast({
      title: '请输入搜索内容',
      icon: 'none'
    })
    return
  }
  
  const searchTypeText = searchType === 'mobile' ? '手机号' : '零卡ID'
  const params = {} as any;
  if(searchType === 'mobile'){
    params.mobile = keyword;
  }else{
    params.id = keyword;
  }
  try {
    const res = await getAllUserList(params);
    console.log(res, 555);
    state.resultList = res.data || [];
    if(state.resultList.length>0){
      const data = state.resultList[0];
      for(const key in data){
        if(key !== 'roleIds') { // 不覆盖权限字段
          state.tempStaff[key] = data[key]
        }
      }
      // 确保权限字段是数组格式
      state.tempStaff.roleIds = Array.isArray(data.roleIds) ? data.roleIds : []
    }
    console.log( state.tempStaff,1234)
  } catch (error) {
    console.log(error,1234)
  }
}

// 选择图片
const chooseImage = () => {
  // uni.chooseImage({
  //   count: 1,
  //   sizeType: ['compressed'],
  //   sourceType: ['album', 'camera'],
  //   success: (res) => {
  //     const tempFilePath = res.tempFilePaths[0]
  //     uni.showLoading({ title: '上传中...' })
      
  //     setTimeout(() => {
  //       state.tempStaff.avatar = tempFilePath
  //       uni.hideLoading()
  //     }, 800)
  //   }
  // })
}

// 保存招募二维码到相册
const saveQRCodeToAlbum = () => {
  const filePath = state.shopQRCode
  uni.saveImageToPhotosAlbum({
    filePath: filePath,
    success: () => {
      uni.showToast({ title: '保存成功', icon: 'success' })
    },
    fail: (err) => {
      console.error('保存失败:', err)
      uni.showToast({ title: '保存失败', icon: 'none' })
    }
  })
}

// 分享二维码
const shareQRCode = () => {
  uni.share({
    title: '加入我们店铺的调酒团队',
    path: `/pages/zero/shop-join?id=${state.shopId}`,
    imageUrl: '/static/images/share_bartender.png'
  })
}


// 初始化
onMounted(async () => {
  await GetAllRoleList()  // 先获取角色列表
  loadStaffList()
})
</script>

<style lang="scss" scoped>
@import '@/uni.scss';
.header-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding-right: 20rpx;
}

.role-filter-scroll{
  // margin-bottom: $up-box-mg;
}
/* 角色筛选 */
.role-filter {
  display: flex;
  padding: 16rpx 16rpx 6rpx;
  background-color: #fff;
  margin-bottom: $up-box-mg;
  white-space: nowrap;
  height: 60rpx;
  /* 优化横向滚动性能 */
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  /* 启用硬件加速 */
  transform: translate3d(0, 0, 0);
}

.role-item {
  padding: 12rpx 24rpx;
  margin-right: 20rpx;
  font-size: $up-font-sm;
  color: #666;
  border-radius: 24rpx;
  background-color: #f5f5f5;
  transition: all 0.3s;
  flex-shrink: 0;
  height: 30rpx;
  width: fit-content;
}

.role-item.active {
  background-color: #e6f7ff;
  color: #1890ff;
  font-weight: 500;
}

/* 员工列表 */
.staff-item {
  padding: 30rpx;
  background-color: #fff;
  border-radius: 12rpx;
  margin: $up-box-mg;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  position: relative;
  /* 优化渲染性能 */
  transform: translate3d(0, 0, 0);
  will-change: transform;
  /* 防止子元素影响滚动 */
  contain: layout style paint;
}

.staff-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20rpx;
}

.staff-info {
  flex: 1;
}

.staff-header {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.staff-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-right: 20rpx;
}

.staff-role {
  font-size: 24rpx;
  color: #1890ff;
  background-color: #e6f7ff;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.staff-intro {
  font-size: 26rpx;
  color: #666;
  margin-top: 10rpx;
}

.staff-contact {
  font-size: 26rpx;
  color: #999;
  margin-top: 10rpx;
}

.staff-roleIds {
  margin-top: 12rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.permission-tag {
  font-size: 22rpx;
  background-color: #f0f5ff;
  color: #1890ff;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  border: 1rpx solid #d6e7ff;
}

.staff-actions {
  display: flex;
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  gap: 10rpx;
}

.action-edit, .action-delete {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-state image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 40rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.empty-subtext {
  font-size: 26rpx;
  color: #bbb;
}

/* 加载更多状态 */
.loading-more {
  padding: 30rpx;
  text-align: center;
}

.loading-text {
  font-size: 26rpx;
  color: #999;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.avatar-picker {
  width: 150rpx;
  height: 150rpx;
  border-radius: 50%;
  position: relative;
  margin: 0 auto;
}

.avatar-upload-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 50rpx;
  height: 50rpx;
  background-color: #1890ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24rpx;
}

.role-display {
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 8rpx;
  border: 1rpx solid #e6f7ff;
}

.current-role {
  font-size: 30rpx;
  color: #1890ff;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.role-tip {
  font-size: 24rpx;
  color: #999;
  line-height: 1.3;
}

.roleIds-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.permission-item {
  display: flex;
  align-items: flex-start;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 8rpx;
  border: 1rpx solid #eee;
  transition: all 0.3s;
  margin-bottom: 16rpx;
  width: 100%;
}

.permission-item:active {
  background-color: #e6f7ff;
  border-color: #91d5ff;
}

/* 自定义复选框样式 */
.permission-checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #d9d9d9;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  transition: all 0.3s;
  flex-shrink: 0;
}

.permission-checkbox.checked {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.permission-content {
  flex: 1;
}

.permission-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 6rpx;
}

.permission-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
}

/* 模态框内的统一搜索栏 */
.unified-search-container {
  background-color: #f8f9fa;
  padding: 30rpx;
  margin-bottom: 30rpx;
  border-radius: 12rpx;
  border: 1rpx solid #e9ecef;
}

.search-tabs {
  display: flex;
  margin-bottom: 20rpx;
  background-color: #fff;
  border-radius: 8rpx;
  padding: 4rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.search-tab {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 28rpx;
  color: #666;
  border-radius: 6rpx;
  transition: all 0.3s;
}

.search-tab.active {
  background-color: $u-primary;
  color: #fff;
  font-weight: 500;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 20rpx;
  .up-input{
   flex: 1;
  }
  .search-btn-modal {
    width: 120rpx;
  }  
}


/* 二维码模态框 */
.qrcode-container {
  padding: 40rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-tip {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 30rpx;
}

.qrcode-actions {
  display: flex;
  gap: 20rpx;
  width: 100%;
  padding: 0 20rpx;
}

.save-btn {
  background-color: #1890ff;
  color: #fff;
  flex: 1;
}

.share-btn {
  background-color: #52c41a;
  color: #fff;
  flex: 1;
}

.confirm-message {
  font-size: 28rpx;
  color: #666;
  padding: 20rpx;
  text-align: center;
}
</style>