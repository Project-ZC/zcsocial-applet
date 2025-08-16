Page({
  data: {
    userInfo: {
      id: '10086',
      nickname: '微醺一刻',
      avatar: '/static/images/avatar.png',
      gender: 'male',
      bio: '生活不止眼前的苟且，还有诗和远方的田野',
      tags: ['调酒爱好者', '社交达人', '派对控']
    }
  },
  onLoad: function() {
    this.fetchUserInfo();
  },
  fetchUserInfo: function() {
    // 实际项目中这里需要调用接口获取用户信息
    console.log('获取用户信息');
    
    // 使用模拟数据，实际情况下会从接口获取
  },
  saveProfile: function() {
    // 保存用户资料
    console.log('保存用户资料:', this.data.userInfo);
    
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 2000,
      success: function() {
        setTimeout(function() {
          wx.navigateBack();
        }, 2000);
      }
    });
  }
}) 