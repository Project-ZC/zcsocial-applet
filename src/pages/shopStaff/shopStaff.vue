<template>
  <div class="container">
    <!-- 顶部导航栏 -->
    <u-navbar
      :title="'团队管理'"
      :placeholder="true"
      :border="true"
      leftIcon=""
      @leftClick="safeNavigateBack"
    >
      <template #right>
        <view class="header-right">
          <!-- <u-icon name="scan" size="22" @click="generateQRCode"></u-icon> -->
          <u-icon name="plus" size="22" @click="openAddModal"></u-icon>
        </view>
      </template>
    </u-navbar>

    <!-- 员工管理页 -->
    <view class="staff-container">
      <!-- 角色筛选 -->
      <view class="role-filter">
        <view
          v-for="(role, index) in state.roleFilterOptions"
          :key="index"
          class="role-item"
          :class="{ active: state.currentRole === role.value }"
          @click="filterByRole(role.value)"
        >
          {{ role.label }}
        </view>
      </view>

      <!-- 员工列表 -->
      <u-list v-if="!state.isLoading && state.filteredStaffList.length > 0">
        <u-list-item v-for="item in state.filteredStaffList" :key="item.id">
          <view class="staff-item">
            <view class="staff-avatar">
              <u-avatar :src="item.avatar" size="50"></u-avatar>
            </view>
            <view class="staff-info">
              <view class="staff-header">
                <view class="staff-name">{{ item.name }}</view>
                <view class="staff-role">{{ item.role }}</view>
              </view>
              <view class="staff-intro">{{ item.intro }}</view>
              <view class="staff-contact" v-if="item.phone || item.wechat">
                <text v-if="item.phone">电话: {{ item.phone }}</text>
                <text v-if="item.phone && item.wechat"> | </text>
                <text v-if="item.wechat">零卡id: {{ item.wechat }}</text>
              </view>
              <view class="staff-permissions" v-if="item.permissionNames && item.permissionNames.length > 0">
                <text class="permission-tag" v-for="(permission, pIndex) in item.permissionNames" :key="pIndex">
                  {{ permission }}
                </text>
              </view>
            </view>
            <view class="staff-actions">
              <view class="action-edit" @click="openEditModal(item.id)">
                <u-icon name="edit-pen" color="#1890ff" size="18"></u-icon>
              </view>
              <view class="action-delete" @click="openDeleteModal(item.id)">
                <u-icon name="trash" color="#ff4d4f" size="18"></u-icon>
              </view>
            </view>
          </view>
        </u-list-item>
      </u-list>

      <!-- 员工列表为空状态 -->
      <view class="empty-state" v-if="!state.isLoading && state.filteredStaffList.length === 0">
        <u-empty mode="data" icon="/static/images/empty-staff.png">
          <template #text>
            <view class="empty-text">暂无员工</view>
            <view class="empty-subtext">点击右上角"+"添加员工</view>
          </template>
        </u-empty>
      </view>
    </view>

    <!-- 加载状态 -->
    <u-loading-page v-if="state.isLoading" loading loading-text="加载中..."></u-loading-page>

    <!-- 添加/编辑员工模态框 -->
    <u-popup
      :show="state.showModal"
      width="90%"
      closeOnClickOverlay
    >
    <view class="z-modal">
      <view class="modal-body">
        <!-- 统一搜索栏（仅在添加模式显示） -->
        <view class="unified-search-container" v-if="!state.isEdit">
          <view class="search-tabs">
            <view
              class="search-tab"
              :class="{ active: state.searchType === 'phone' }"
              @click="switchSearchType('phone')"
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
            <u-input
              v-model="state.searchKeyword"
              :placeholder="state.searchType === 'phone' ? '请输入手机号码' : '请输入零卡ID'"
              :type="state.searchType === 'phone' ? 'number' : 'text'"
              clearable
              border="surround"
            />
            <u-button class="search-btn-modal" @click="onSearch">搜索</u-button>
          </view>
        </view>

        <view class="form-item">
          <view class="form-label">头像</view>
          <view class="avatar-picker" @click="state.isEdit ? null : chooseImage()">
            <u-avatar :src="state.tempStaff.avatar || '/static/images/default-avatar.png'" size="80"></u-avatar>
            <view class="avatar-upload-icon" v-if="!state.isEdit">
              <u-icon name="camera" color="#fff" size="16"></u-icon>
            </view>
          </view>
        </view>

        <view class="form-item">
          <view class="form-label">姓名</view>
          <u-input
            v-model="state.tempStaff.name"
            placeholder="请输入员工姓名"
            border="surround"
            :disabled="state.isEdit"
          />
        </view>

        <view class="form-item">
          <view class="form-label">职位</view>
          <view class="role-display">
            <view class="current-role">{{ state.tempStaff.role || '实习生' }}</view>
            <view class="role-tip">职位将根据所选权限自动生成</view>
          </view>
        </view>

        <view class="form-item">
          <view class="form-label">手机号</view>
          <u-input
            v-model="state.tempStaff.phone"
            type="number"
            placeholder="请输入手机号码"
            border="surround"
            :disabled="state.isEdit"
          />
        </view>

        <view class="form-item">
          <view class="form-label">零卡id</view>
          <u-input
            v-model="state.tempStaff.wechat"
            placeholder="请输入零卡id"
            border="surround"
            :disabled="state.isEdit"
          />
        </view>

        <view class="form-item">
          <view class="form-label">员工权限</view>
          <view class="permissions-list">
            <view
              v-for="(item, index) in state.permissionOptions"
              :key="index"
              class="permission-item"
              @click="togglePermission(item.value)"
            >
              <view
                class="permission-checkbox"
                :class="{ checked: state.tempStaff.permissions.includes(item.value) }"
              >
                <u-icon
                  v-if="state.tempStaff.permissions.includes(item.value)"
                  name="checkbox-mark"
                  color="#fff"
                  size="16"
                ></u-icon>
              </view>
              <view class="permission-content">
                <view class="permission-name">{{ item.name }}</view>
                <view class="permission-desc">{{ item.description }}</view>
              </view>
            </view>
          </view>
        </view>

        <view class="form-item">
          <view class="form-label">简介</view>
          <u-textarea
            v-model="state.tempStaff.intro"
            placeholder="请输入员工简介"
            auto-height
            border="surround"
            :disabled="state.isEdit"
          ></u-textarea>
        </view>
      </view>
      <view class="modal-footer">
        <u-button @click="closeModal">取消</u-button>
        <u-button type="primary" @click="saveStaff">确定</u-button>
      </view>
      </view>
    </u-popup>

    <!-- 删除确认模态框 -->
    <u-modal
      :show="state.showDeleteModal"
      title="提示"
      :show-cancel-button="true"
      cancel-text="取消"
      confirm-text="删除"
      @cancel="closeDeleteModal"
      @confirm="deleteStaff"
    >
      <view class="confirm-message">确定要删除该员工吗？此操作不可撤销。</view>
    </u-modal>

    <!-- 店铺二维码模态框 -->
    <u-modal
      :show="state.showQRCodeModal"
      title="店铺招募二维码"
      width="80%"
      :show-cancel-button="false"
      :show-confirm-button="false"
    >
      <view class="qrcode-container">
        <u-image
          :src="state.shopQRCode"
          width="300rpx"
          height="300rpx"
          mode="aspectFit"
          show-menu-by-longpress
        ></u-image>
        <view class="qrcode-tip">长按保存或分享该二维码</view>
        <view class="qrcode-actions">
          <u-button class="save-btn" @click="saveQRCodeToAlbum">保存到相册</u-button>
          <u-button class="share-btn" @click="shareQRCode">分享给好友</u-button>
        </view>
      </view>
    </u-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'

// 定义接口
interface Staff {
  id: string
  avatar: string
  name: string
  role: string
  phone: string
  wechat: string
  intro: string
  permissions: string[]
  permissionNames: string[]
}

interface PermissionOption {
  value: string
  name: string
  description: string
}

interface RoleFilterOption {
  label: string
  value: string
}

// 状态管理
const state = reactive({
  shopId: '123456',
  currentRole: 'all',
  roleFilterOptions: [
    { label: '全部', value: 'all' },
    { label: '店长', value: '店长' },
    { label: '调酒师', value: '调酒师' },
    { label: '主理人', value: '主理人' },
    { label: '其他', value: '其他' }
  ] as RoleFilterOption[],
  
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
  
  staffList: [] as Staff[],
  filteredStaffList: [] as Staff[],
  
  searchType: 'phone',
  searchKeyword: '',
  
  showModal: false,
  showDeleteModal: false,
  showQRCodeModal: false,
  modalTitle: '添加员工',
  
  tempStaff: {
    id: '',
    avatar: '',
    name: '',
    role: '调酒师',
    phone: '',
    wechat: '',
    intro: '',
    permissions: [] as string[]
  },
  
  isEdit: false,
  isLoading: true,
  shopQRCode: '/static/images/qrcode-placeholder.png',
  deleteStaffId: '',
})

// 加载员工列表
const loadStaffList = () => {
  state.isLoading = true
  setTimeout(() => {
    state.staffList = [
      {
        id: '1001',
        avatar: '/static/images/avatar1.png',
        name: '张三',
        role: '店铺主理人',
        phone: '13800138001',
        wechat: 'zero001',
        intro: '5年调酒经验，擅长经典鸡尾酒调制，特调创新能力强',
        permissions: ['manager_permission', 'owner_permission'],
        permissionNames: ['店长权限', '主理人权限']
      },
      {
        id: '1002',
        avatar: '/static/images/avatar2.png',
        name: '李四',
        role: '调酒师',
        phone: '13800138002',
        wechat: 'zero002',
        intro: '3年酒吧工作经验，擅长客户沟通和花式调酒',
        permissions: ['bartender_permission'],
        permissionNames: ['调酒师权限']
      },
      {
        id: '1003',
        avatar: '/static/images/avatar3.png',
        name: '王五',
        role: '普通员工',
        phone: '13800138003',
        wechat: 'zero003',
        intro: '热情大方，善于活跃气氛，熟悉各类酒水知识',
        permissions: [],
        permissionNames: []
      }
    ]
    
    state.filteredStaffList = [...state.staffList]
    state.isLoading = false
    filterByRole()
  }, 500)
}

// 筛选员工角色
const filterByRole = (role: string = state.currentRole) => {
  state.currentRole = role
  if (role === 'all') {
    state.filteredStaffList = [...state.staffList]
  } else {
    state.filteredStaffList = state.staffList.filter(item => item.role === role)
  }
}

// 打开添加员工模态框
const openAddModal = () => {
  state.modalTitle = '添加员工'
  state.isEdit = false
  state.tempStaff = {
    id: '',
    avatar: '',
    name: '',
    role: '实习生',
    phone: '',
    wechat: '',
    intro: '',
    permissions: []
  }
  state.showModal = true
}

// 打开编辑员工模态框
const openEditModal = (staffId: string) => {
  const staff = state.staffList.find(item => item.id === staffId)
  if (staff) {
    state.modalTitle = '编辑员工'
    state.isEdit = true
    state.tempStaff = { ...staff }
    state.showModal = true
  }
}

// 关闭员工模态框
const closeModal = () => {
  state.showModal = false
}

// 切换权限
const togglePermission = (permission: string) => {
  const permissions = [...state.tempStaff.permissions]
  const index = permissions.indexOf(permission)
  
  if (index > -1) {
    permissions.splice(index, 1)
  } else {
    permissions.push(permission)
  }
  
  state.tempStaff.permissions = permissions
  state.tempStaff.role = generateRoleByPermissions(permissions)
}

// 生成权限名称数组
const generatePermissionNames = (permissions: string[]) => {
  const permissionMap: Record<string, string> = {
    'manager_permission': '店长权限',
    'bartender_permission': '调酒师权限',
    'owner_permission': '主理人权限'
  }
  
  return permissions.map(p => permissionMap[p]).filter(Boolean)
}

// 根据权限生成职位描述
const generateRoleByPermissions = (permissions: string[]) => {
  if (!permissions || permissions.length === 0) {
    return '实习生'
  }
  
  const hasManager = permissions.includes('manager_permission')
  const hasBartender = permissions.includes('bartender_permission')
  const hasOwner = permissions.includes('owner_permission')
  
  // 根据权限组合生成职位
  if (hasOwner && hasManager && hasBartender) {
    return '创始人/主理人'
  } else if (hasOwner && hasManager) {
    return '店铺主理人'
  } else if (hasManager && hasBartender) {
    return '店长兼调酒师'
  } else if (hasOwner && hasBartender) {
    return '主理人调酒师'
  } else if (hasOwner) {
    return '主理人'
  } else if (hasManager) {
    return '店长'
  } else if (hasBartender) {
    return '调酒师'
  } else {
    return '普通员工'
  }
}

// 打开删除确认模态框
const openDeleteModal = (staffId: string) => {
  state.deleteStaffId = staffId
  state.showDeleteModal = true
}

// 关闭删除确认模态框
const closeDeleteModal = () => {
  state.showDeleteModal = false
  state.deleteStaffId = ''
}

// 保存员工
const saveStaff = () => {
  const staff = { ...state.tempStaff }
  const isEdit = state.isEdit
  
  // 表单验证
  if (!isEdit) {
    if (!staff.name.trim()) {
      uni.showToast({
        title: '请填写姓名',
        icon: 'none'
      })
      return
    }
    
    if (!staff.role) {
      uni.showToast({
        title: '请选择职位',
        icon: 'none'
      })
      return
    }
  }
  
  // 模拟提交数据
  uni.showLoading({ title: '保存中...' })
  
  setTimeout(() => {
    let staffList = [...state.staffList]
    
    if (staff.id && isEdit) {
      // 编辑现有员工
      const index = staffList.findIndex(item => item.id === staff.id)
      if (index !== -1) {
        staffList[index] = {
          ...staffList[index],
          permissions: staff.permissions || [],
          permissionNames: generatePermissionNames(staff.permissions || []),
          role: generateRoleByPermissions(staff.permissions || [])
        }
      }
    } else {
      // 添加新员工
      const newStaff: Staff = {
        ...staff,
        id: Date.now().toString(),
        avatar: staff.avatar || '/static/images/default-avatar.png',
        permissionNames: generatePermissionNames(staff.permissions || [])
      }
      staffList.push(newStaff)
    }
    
    state.staffList = staffList
    state.showModal = false
    filterByRole()
    
    uni.hideLoading()
    uni.showToast({
      title: isEdit ? '权限更新成功' : '添加成功',
      icon: 'success'
    })
  }, 800)
}

// 删除员工
const deleteStaff = () => {
  if (!state.deleteStaffId) return
  
  uni.showLoading({ title: '删除中...' })
  
  setTimeout(() => {
    state.staffList = state.staffList.filter(item => item.id !== state.deleteStaffId)
    state.showDeleteModal = false
    state.deleteStaffId = ''
    
    filterByRole()
    
    uni.hideLoading()
    uni.showToast({
      title: '删除成功',
      icon: 'success'
    })
  }, 800)
}

// 打开招募二维码模态框
const generateQRCode = () => {
  state.shopQRCode = '/static/images/qrcode-placeholder.png'
  state.showQRCodeModal = true
}

// 切换搜索类型
const switchSearchType = (type: string) => {
  state.searchType = type
  state.searchKeyword = ''
}

// 执行搜索
const onSearch = () => {
  const { searchType, searchKeyword } = state
  const keyword = searchKeyword.trim()
  
  if (!keyword) {
    uni.showToast({
      title: '请输入搜索内容',
      icon: 'none'
    })
    return
  }
  
  const searchTypeText = searchType === 'phone' ? '手机号' : '零卡ID'
  uni.showToast({
    title: `搜索${searchTypeText}: ${keyword}`,
    icon: 'none',
    duration: 1500
  })
}

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      uni.showLoading({ title: '上传中...' })
      
      setTimeout(() => {
        state.tempStaff.avatar = tempFilePath
        uni.hideLoading()
      }, 800)
    }
  })
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

// 返回上一页
const safeNavigateBack = () => {
  uni.navigateBack()
}

// 初始化
onMounted(() => {
  loadStaffList()
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

/* 顶部导航栏 */
.header-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding-right: 20rpx;
}

/* 员工管理页 */
.staff-container {
  padding: 20rpx;
}

/* 角色筛选 */
.role-filter {
  display: flex;
  padding: 20rpx 0;
  background-color: #fff;
  margin-bottom: 20rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.role-item {
  padding: 12rpx 24rpx;
  margin-right: 20rpx;
  font-size: 26rpx;
  color: #666;
  border-radius: 24rpx;
  background-color: #f5f5f5;
  transition: all 0.3s;
  flex-shrink: 0;
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
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  position: relative;
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

.staff-permissions {
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

/* 模态框 */
.modal-body {
  padding: 20rpx;
  max-height: 80vh;
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

.permissions-list {
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
}

.permission-item:active {
  background-color: #e6f7ff;
  border-color: #91d5ff;
}

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
  background-color: #1890ff;
  color: #fff;
  font-weight: 500;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 20rpx;
  .u-input{
   flex: 1
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