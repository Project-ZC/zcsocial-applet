const app = getApp();

// 店铺员工管理
Page({
  data: {
    shopId: '',
         currentRole: 'all', // 当前筛选的角色
         roleOptions: ['实习生', '普通员工', '调酒师', '店长', '主理人', '店长兼调酒师', '主理人调酒师', '店铺主理人', '创始人/主理人'],
    roleIndex: 0,
    
         // 权限选项定义
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
     ],
    
              staffList: [], // 员工列表
     filteredStaffList: [], // 筛选后的员工列表
     
     // 搜索相关
     searchType: 'phone', // 'phone' | 'zero'
     searchKeyword: '', // 搜索关键词
     
     // 模态框相关
    showAddStaffModal: false,
    showScanModal: false,
    showDeleteConfirmModal: false,
    showQrcodeModal: false,
    modalTitle: '添加员工',
    
    // 表单数据
    tempStaff: {
      id: '',
      avatar: '',
      name: '',
      role: '调酒师',
      phone: '',
      wechat: '',
      intro: '',
      permissions: []
    },
    
    isEdit: false,
    showModal: false,
    showDeleteModal: false,
    showQRCodeModal: false,
    isLoading: true,
    shopQRCode: '',
    
    // 删除确认
    deleteStaffId: '',
    
    // 正在加载
    loading: true
  },

  onLoad(options) {
    const shopId = options.id || '123456';
    this.setData({
      shopId: shopId,
      loading: true
    });
    
         // 加载数据
     this.loadStaffList();
  },
  
  // 加载员工列表
  loadStaffList() {
    // 模拟请求数据
    setTimeout(() => {
      const staffList = [
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
      ];
      
      this.setData({
        staffList,
        filteredStaffList: staffList,
        isLoading: false
      });
      
      this.filterByRole();
    }, 500);
  },
  
  
  

  
  // 筛选员工角色
  filterByRole(e) {
    let role = this.data.currentRole;
    
    if (e) {
      role = e.currentTarget.dataset.role;
      this.setData({
        currentRole: role
      });
    }
    
    const filteredStaffList = role === 'all' 
      ? this.data.staffList 
      : this.data.staffList.filter(item => item.role === role);
    
    this.setData({
      filteredStaffList
    });
  },
  

  
     // 打开添加员工模态框
   openAddModal() {
     this.setData({
       showModal: true,
       isEdit: false,
       tempStaff: {
         id: '',
         avatar: '',
         name: '',
         role: '实习生',
         phone: '',
         wechat: '',
         intro: '',
         permissions: []
       },
       roleIndex: 0
     });
   },
  
  // 打开编辑员工模态框
  openEditModal(e) {
    const staffId = e.currentTarget.dataset.id;
    const staff = this.data.staffList.find(item => item.id === staffId);
    
    if (staff) {
      const roleIndex = this.data.roleOptions.findIndex(role => role === staff.role);
      this.setData({
        showModal: true,
        isEdit: true,
        tempStaff: { ...staff },
        roleIndex: roleIndex >= 0 ? roleIndex : 0
      });
    }
  },
  
  // 关闭员工模态框
  closeModal() {
    this.setData({
      showModal: false
    });
  },
  
     // 切换权限
   togglePermission(e) {
     const permission = e.currentTarget.dataset.permission;
     let permissions = this.data.tempStaff.permissions || [];
     
     if (permissions.includes(permission)) {
       // 移除权限
       permissions = permissions.filter(p => p !== permission);
     } else {
       // 添加权限
       permissions.push(permission);
     }
     
     // 根据权限自动生成职位
     const autoRole = this.generateRoleByPermissions(permissions);
     
     this.setData({
       'tempStaff.permissions': permissions,
       'tempStaff.role': autoRole
     });
     
     // 更新roleIndex以同步picker显示
     const roleIndex = this.data.roleOptions.findIndex(role => role === autoRole);
     if (roleIndex >= 0) {
       this.setData({
         roleIndex: roleIndex
       });
     }
   },
  
     // 生成权限名称数组（用于显示）
   generatePermissionNames(permissions) {
     const permissionMap = {
       'manager_permission': '店长权限',
       'bartender_permission': '调酒师权限',
       'owner_permission': '主理人权限'
     };
     
     return permissions.map(p => permissionMap[p]).filter(Boolean);
   },
   
   // 根据权限生成职位描述
   generateRoleByPermissions(permissions) {
     if (!permissions || permissions.length === 0) {
       return '实习生';
     }
     
     const hasManager = permissions.includes('manager_permission');
     const hasBartender = permissions.includes('bartender_permission');
     const hasOwner = permissions.includes('owner_permission');
     
     // 根据权限组合生成职位
     if (hasOwner && hasManager && hasBartender) {
       return '创始人/主理人';
     } else if (hasOwner && hasManager) {
       return '店铺主理人';
     } else if (hasManager && hasBartender) {
       return '店长兼调酒师';
     } else if (hasOwner && hasBartender) {
       return '主理人调酒师';
     } else if (hasOwner) {
       return '主理人';
     } else if (hasManager) {
       return '店长';
     } else if (hasBartender) {
       return '调酒师';
     } else {
       return '普通员工';
     }
   },
  
  // 打开删除确认模态框
  openDeleteModal(e) {
    const staffId = e.currentTarget.dataset.id;
    const staff = this.data.staffList.find(item => item.id === staffId);
    
    if (staff) {
      this.setData({
        showDeleteModal: true,
        deleteStaffId: staffId
      });
    }
  },
  
  // 关闭删除确认模态框
  closeDeleteModal() {
    this.setData({
      showDeleteModal: false,
      deleteStaffId: ''
    });
  },
  
  // 打开招募二维码模态框
  generateQRCode() {
    this.setData({
      showQRCodeModal: true,
      shopQRCode: '/static/images/qrcode-placeholder.png' // 这里应该是实际生成的二维码
    });
  },
  
  // 关闭招募二维码模态框
  closeQRCodeModal() {
    this.setData({
      showQRCodeModal: false
    });
  },
  
     // 保存员工
   saveStaff() {
     const staff = this.data.tempStaff;
     const isEdit = this.data.isEdit;
     
     // 表单验证
     if (!isEdit) {
       // 新增员工时的验证
       if (!staff.name.trim()) {
         wx.showToast({
           title: '请填写姓名',
           icon: 'none'
         });
         return;
       }
       
       if (!staff.role) {
         wx.showToast({
           title: '请选择职位',
           icon: 'none'
         });
         return;
       }
     }
     
     // 模拟提交数据
     wx.showLoading({
       title: '保存中...'
     });
     
     setTimeout(() => {
       let staffList = [...this.data.staffList];
       
       if (staff.id && isEdit) {
         // 编辑现有员工 - 只更新权限和职位
         const index = staffList.findIndex(item => item.id === staff.id);
         if (index !== -1) {
           staffList[index] = {
             ...staffList[index], // 保持原有的个人信息
             permissions: staff.permissions || [],
             permissionNames: this.generatePermissionNames(staff.permissions || []),
             role: this.generateRoleByPermissions(staff.permissions || [])
           };
         }
       } else {
         // 添加新员工
         const newStaff = {
           ...staff,
           id: new Date().getTime().toString(),
           avatar: staff.avatar || '/static/images/default-avatar.png',
           permissionNames: this.generatePermissionNames(staff.permissions || [])
         };
         staffList.push(newStaff);
       }
       
       this.setData({
         staffList,
         showModal: false
       });
       
       this.filterByRole();
       
       wx.hideLoading();
       wx.showToast({
         title: isEdit ? '权限更新成功' : '添加成功',
         icon: 'success'
       });
     }, 800);
   },
  
  // 删除员工
  deleteStaff() {
    const staffId = this.data.deleteStaffId;
    
    if (!staffId) return;
    
    // 模拟删除请求
    wx.showLoading({
      title: '删除中...'
    });
    
    setTimeout(() => {
      const staffList = this.data.staffList.filter(item => item.id !== staffId);
      
      this.setData({
        staffList,
        showDeleteModal: false,
        deleteStaffId: ''
      });
      
      this.filterByRole();
      
      wx.hideLoading();
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    }, 800);
  },
  

  
  // 选择角色
  bindRoleChange(e) {
    const value = e.detail.value;
    const role = this.data.roleOptions[value];
    
    this.setData({
      'tempStaff.role': role,
      roleIndex: value
    });
  },
  
  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        // 模拟上传
        wx.showLoading({
          title: '上传中...'
        });
        
        setTimeout(() => {
          this.setData({
            'tempStaff.avatar': tempFilePath
          });
          
          wx.hideLoading();
        }, 800);
      }
    });
  },
  
  // 姓名输入
  bindStaffName(e) {
    this.setData({
      'tempStaff.name': e.detail.value
    });
  },
  
  // 电话输入
  bindStaffPhone(e) {
    this.setData({
      'tempStaff.phone': e.detail.value
    });
  },
  
     // 零卡id输入
   bindStaffWechat(e) {
     this.setData({
       'tempStaff.wechat': e.detail.value
     });
   },
  
     // 简介输入
   bindStaffIntro(e) {
     this.setData({
       'tempStaff.intro': e.detail.value
     });
   },
   
       // 切换搜索类型
    switchSearchType(e) {
      const type = e.currentTarget.dataset.type;
      this.setData({
        searchType: type,
        searchKeyword: '' // 切换类型时清空搜索关键词
      });
    },
    
    // 搜索输入
    onSearchInput(e) {
      this.setData({
        searchKeyword: e.detail.value
      });
    },
    
    // 执行搜索（暂无逻辑）
    onSearch() {
      const { searchType, searchKeyword } = this.data;
      const keyword = searchKeyword.trim();
      
      if (!keyword) {
        wx.showToast({
          title: '请输入搜索内容',
          icon: 'none'
        });
        return;
      }
      
      const searchTypeText = searchType === 'phone' ? '手机号' : '零卡ID';
      wx.showToast({
        title: `搜索${searchTypeText}: ${keyword}`,
        icon: 'none',
        duration: 1500
      });
      
      // TODO: 这里添加搜索逻辑
      // 根据searchType和keyword调用不同的搜索接口
    },
  

  
  // 保存招募二维码到相册
  saveQRCodeToAlbum() {
    const filePath = this.data.shopQRCode;
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('保存失败:', err);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 返回上一页
  safeNavigateBack() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({
          url: '/pages/profile/profile'
        });
      }
    });
  },
  
  // 用户分享
  onShareAppMessage() {
    return {
      title: '加入我们店铺的调酒团队',
      path: `/pages/zero/shop-join?id=${this.data.shopId}`,
      imageUrl: '/images/share_bartender.png' // 分享图片
    };
  }
}); 