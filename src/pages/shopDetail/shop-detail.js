Page({
  data: {
    shopInfo: {
      logo: '/static/images/shop1.png',
      name: '醉美 Homebar',
      description: '提供精酿啤酒和鸡尾酒的静吧，配有专业调酒师，提供互动游戏。',
      openTime: '18:00',
      closeTime: '02:00',
      address: '北京市朝阳区三里屯SOHO 3号楼2层',

      tags: ['静吧', '精致', '鸡尾酒', '情调', '约会'],


      album: [] // 店铺相册
    },
    showTagInput: false,
    newTag: ''
  },
  
  onLoad: function(options) {
    // 获取店铺详情
    this.fetchShopDetail();
  },
  
  fetchShopDetail: function() {
    // 实际项目中这里需要调用接口获取店铺详情
    console.log('获取店铺详情');
    
    // 使用模拟数据代替接口数据
    // 实际项目中需要调用接口获取数据
    // wx.request({
    //   url: 'https://api.example.com/shop/detail',
    //   success: (res) => {
    //     this.setData({
    //       shopInfo: res.data
    //     });
    //   }
    // });
  },
  
  // 上传店铺LOGO
  uploadLogo: function() {
    try {
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          
          // 显示上传中
          wx.showLoading({
            title: '上传中...',
          });
          
          // 实际项目中这里需要调用接口上传图片
          // 这里只做本地预览
          setTimeout(() => {
            this.setData({
              'shopInfo.logo': tempFilePath
            });
            wx.hideLoading();
          }, 1000);
        },
        fail: (err) => {
          console.error('选择图片失败', err);
          // 如果不是用户取消，则显示错误提示
          if (err.errMsg !== 'chooseImage:fail cancel') {
            wx.showToast({
              title: '选择图片失败',
              icon: 'none'
            });
          }
        }
      });
    } catch (error) {
      console.error('上传图片错误', error);
      wx.showToast({
        title: '无法打开相册，请检查权限',
        icon: 'none'
      });
    }
  },
  
  // 输入店铺名称
  inputName: function(e) {
    this.setData({
      'shopInfo.name': e.detail.value
    });
  },
  
  // 输入店铺简介
  inputDescription: function(e) {
    this.setData({
      'shopInfo.description': e.detail.value
    });
  },
  
  // 修改开业时间
  changeOpenTime: function(e) {
    this.setData({
      'shopInfo.openTime': e.detail.value
    });
  },
  
  // 修改闭店时间
  changeCloseTime: function(e) {
    this.setData({
      'shopInfo.closeTime': e.detail.value
    });
  },


  
  // 选择店铺地址
  chooseLocation: function() {
    try {
      wx.chooseLocation({
        success: (res) => {
          this.setData({
            'shopInfo.address': res.address
          });
        },
        fail: (err) => {
          console.error('选择地址失败', err);
          // 如果是用户取消，不显示错误提示
          if (err.errMsg !== 'chooseLocation:fail cancel') {
            wx.showToast({
              title: '选择地址失败，请重试',
              icon: 'none'
            });
          }
        }
      });
    } catch (error) {
      console.error('地址选择器错误', error);
      wx.showToast({
        title: '无法打开地图，请检查位置权限',
        icon: 'none'
      });
    }
  },
  
  // 显示标签输入框
  showTagInput: function() {
    this.setData({
      showTagInput: true,
      newTag: ''
    });
  },
  
  // 隐藏标签输入框
  hideTagInput: function() {
    this.setData({
      showTagInput: false
    });
  },
  
  // 输入标签
  inputTag: function(e) {
    this.setData({
      newTag: e.detail.value
    });
  },
  
  // 添加标签
  addTag: function() {
    const { newTag, shopInfo } = this.data;
    
    if (!newTag.trim()) {
      return;
    }
    
    // 检查标签是否已存在
    if (shopInfo.tags.includes(newTag)) {
      wx.showToast({
        title: '标签已存在',
        icon: 'none'
      });
      return;
    }
    
    // 添加标签
    const tags = [...shopInfo.tags, newTag];
    
    this.setData({
      'shopInfo.tags': tags,
      newTag: '',
      showTagInput: false
    });
  },
  
  // 删除标签
  removeTag: function(e) {
    const index = e.currentTarget.dataset.index;
    const tags = [...this.data.shopInfo.tags];
    
    tags.splice(index, 1);
    
    this.setData({
      'shopInfo.tags': tags
    });
  },
  

  

  
  // 上传相册图片
  uploadAlbumImage: function() {
    const { album } = this.data.shopInfo;
    
    if (album.length >= 9) {
      wx.showToast({
        title: '最多上传9张照片',
        icon: 'none'
      });
      return;
    }
    
    try {
      wx.chooseImage({
        count: 9 - album.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths;
          
          // 显示上传中
          wx.showLoading({
            title: '上传中...',
          });
          
          // 实际项目中这里需要调用接口上传图片
          // 这里只做本地预览
          setTimeout(() => {
            this.setData({
              'shopInfo.album': [...album, ...tempFilePaths]
            });
            wx.hideLoading();
          }, 1000);
        },
        fail: (err) => {
          console.error('选择相册图片失败', err);
          // 如果不是用户取消，则显示错误提示
          if (err.errMsg !== 'chooseImage:fail cancel') {
            wx.showToast({
              title: '选择图片失败',
              icon: 'none'
            });
          }
        }
      });
    } catch (error) {
      console.error('上传相册图片错误', error);
      wx.showToast({
        title: '无法打开相册，请检查权限',
        icon: 'none'
      });
    }
  },
  
  // 删除相册图片
  deleteAlbumImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const album = [...this.data.shopInfo.album];
    
    album.splice(index, 1);
    
    this.setData({
      'shopInfo.album': album
    });
  },
  
  // 保存店铺信息
  saveShopInfo: function() {
    const { shopInfo } = this.data;
    
    // 表单验证
    if (!shopInfo.name.trim()) {
      wx.showToast({
        title: '请输入店铺名称',
        icon: 'none'
      });
      return;
    }
    
    if (!shopInfo.description.trim()) {
      wx.showToast({
        title: '请输入店铺简介',
        icon: 'none'
      });
      return;
    }
    
    if (!shopInfo.openTime || !shopInfo.closeTime) {
      wx.showToast({
        title: '请设置营业时间',
        icon: 'none'
      });
      return;
    }
    
    if (!shopInfo.address) {
      wx.showToast({
        title: '请选择店铺地址',
        icon: 'none'
      });
      return;
    }
    
    // 显示保存中
    wx.showLoading({
      title: '保存中...',
    });
    
    // 实际项目中这里需要调用接口保存店铺信息
    // 这里使用模拟数据
    console.log('保存店铺信息', shopInfo);
    
    try {
      setTimeout(() => {
        wx.hideLoading();
        
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 1500,
          complete: () => {
            // 返回上一页
            this.safeNavigateBack();
          }
        });
      }, 1500);
    } catch (error) {
      wx.hideLoading();
      console.error('保存店铺信息错误', error);
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    }
  },
  
  // 安全导航返回
  safeNavigateBack: function() {
    try {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack({
          delta: 1
        });
      } else {
        // 没有上一页时，跳转到个人中心
        wx.reLaunch({
          url: '/pages/profile/profile'
        });
      }
    } catch (error) {
      console.error('返回导航错误', error);
      // 尝试跳转到个人中心
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/profile/profile'
        });
      }, 200);
    }
  }
}) 