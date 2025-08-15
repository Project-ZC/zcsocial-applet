const app = getApp();

Page({
  data: {
    shopId: '',
    games: [],
    currentEditIndex: -1,
    showGameModal: false,
    showDeleteModal: false,
    deleteId: '',
    gameForm: {
      name: '',
      type: '',
      description: '',
      playerCount: '',
      likeRate: '',
      icon: '',
      isActive: true
    },
    gameTypes: ['娱乐游戏', '酒桌游戏', '互动游戏', '其他'],
    showAddModal: false,
    currentGame: null,
    isEdit: false,
    tempGame: {
      id: '',
      name: '',
      type: '',
      description: '',
      playerCount: '',
      likeRate: '',
      icon: '',
      isActive: true
    }
  },
  
  onLoad: function(options) {
    if (options.shopId) {
      this.setData({
        shopId: options.shopId
      });
    }
    this.loadGames();
  },
  
  // 加载游戏列表
  loadGames: function() {
    // 模拟从API获取数据
    const mockGames = [
      {
        id: '1',
        name: '真心话大冒险',
        type: '桌游',
        description: '经典聚会游戏，玩家轮流回答问题或执行指令',
        playerCount: '3-10人',
        likeRate: '96%',
        icon: '/static/images/game-truth.png',
        isActive: true
      },
      {
        id: '2',
        name: '狼人杀',
        type: '身份推理',
        description: '玩家扮演不同角色，通过推理找出狼人',
        playerCount: '8-12人',
        likeRate: '92%',
        icon: '/static/images/game-wolf.png',
        isActive: true
      },
      {
        id: '3',
        name: '飞镖',
        type: '技巧',
        description: '考验准确度的休闲游戏',
        playerCount: '1-4人',
        likeRate: '85%',
        icon: '/static/images/game-dart.png',
        isActive: false
      }
    ];

    this.setData({
      games: mockGames
    });

    // 实际项目中，使用网络请求获取数据
    // wx.request({
    //   url: 'your-api-url/games',
    //   success: (res) => {
    //     this.setData({
    //       games: res.data
    //     });
    //   }
    // });
  },
  
  // 添加游戏
  addGame: function() {
    this.setData({
      currentEditIndex: -1,
      gameForm: {
        name: '',
        type: '娱乐游戏',
        description: '',
        playerCount: '',
        likeRate: '',
        icon: '',
        isActive: true
      },
      showGameModal: true
    });
  },
  
  // 编辑游戏
  editGame: function(e) {
    const index = e.currentTarget.dataset.index;
    const game = this.data.games[index];
    
    this.setData({
      currentEditIndex: index,
      gameForm: {
        name: game.name,
        type: game.type,
        description: game.description,
        playerCount: game.playerCount,
        likeRate: game.likeRate,
        icon: game.icon,
        isActive: game.isActive
      },
      showGameModal: true
    });
  },
  
  // 更新表单字段
  inputChange: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`gameForm.${field}`]: value
    });
  },
  
  // 选择游戏类型
  typeChange: function(e) {
    this.setData({
      'gameForm.type': this.data.gameTypes[e.detail.value]
    });
  },
  
  // 上传游戏图标
  uploadIcon: function() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        
        // 实际项目中，应将图片上传到服务器
        // 这里仅展示本地路径
        this.setData({
          'gameForm.icon': tempFilePath
        });

        // wx.uploadFile({
        //   url: 'your-api-url/upload',
        //   filePath: tempFilePath,
        //   name: 'file',
        //   success: (uploadRes) => {
        //     const data = JSON.parse(uploadRes.data);
        //     this.setData({
        //       'gameForm.icon': data.url
        //     });
        //   }
        // });
      }
    });
  },
  
  // 保存游戏信息
  saveGame: function() {
    const { tempGame, isEdit, games } = this.data;
    
    // 表单验证
    if (!tempGame.name) {
      wx.showToast({
        title: '请输入游戏名称',
        icon: 'none'
      });
      return;
    }

    if (!tempGame.type) {
      wx.showToast({
        title: '请输入游戏类型',
        icon: 'none'
      });
      return;
    }

    // 如果是编辑模式，更新现有游戏
    if (isEdit) {
      const updatedGames = games.map(game => {
        if (game.id === tempGame.id) {
          return { ...tempGame };
        }
        return game;
      });

      this.setData({
        games: updatedGames,
        showGameModal: false
      });

      wx.showToast({
        title: '游戏更新成功',
        icon: 'success'
      });
    } 
    // 如果是新增模式，添加新游戏
    else {
      // 生成随机ID (实际项目中应由后端生成)
      const newId = Date.now().toString();
      const newGame = {
        ...tempGame,
        id: newId
      };

      this.setData({
        games: [...games, newGame],
        showGameModal: false
      });

      wx.showToast({
        title: '游戏添加成功',
        icon: 'success'
      });
    }

    // 实际项目中，将数据保存到服务器
    // wx.request({
    //   url: isEdit ? 'your-api-url/games/update' : 'your-api-url/games/create',
    //   method: 'POST',
    //   data: tempGame,
    //   success: (res) => {
    //     // 处理成功响应
    //   }
    // });
  },
  
  // 关闭游戏编辑弹窗
  closeGameModal: function() {
    this.setData({
      showGameModal: false
    });
  },
  
  // 切换游戏状态
  toggleGameStatus: function(e) {
    const { index } = e.currentTarget.dataset;
    const games = [...this.data.games];
    games[index].isActive = !games[index].isActive;

    this.setData({
      games
    });

    // 实际项目中，更新服务器上的状态
    // wx.request({
    //   url: 'your-api-url/games/toggle-status',
    //   method: 'POST',
    //   data: { 
    //     id: games[index].id,
    //     isActive: games[index].isActive
    //   },
    //   success: (res) => {
    //     // 处理成功响应
    //   }
    // });
  },
  
  // 确认删除游戏
  deleteGame: function(e) {
    const { index } = e.currentTarget.dataset;
    const game = this.data.games[index];
    
    this.setData({
      currentGame: game,
      showDeleteModal: true
    });
  },
  
  // 关闭删除确认弹窗
  closeDeleteModal: function() {
    this.setData({
      showDeleteModal: false,
      currentGame: null
    });
  },
  
  // 确认删除操作
  confirmDelete: function() {
    wx.showLoading({
      title: '删除中...',
    });
    
    // 模拟删除
    setTimeout(() => {
      const games = this.data.games.filter(game => game.id !== this.data.deleteId);
      
      this.setData({
        games: games,
        showDeleteModal: false,
        deleteId: ''
      });
      
      wx.hideLoading();
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    }, 800);
  },
  
  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 打开添加游戏弹窗
  openAddModal: function() {
    this.setData({
      isEdit: false,
      tempGame: {
        id: '',
        name: '',
        type: '',
        description: '',
        playerCount: '',
        likeRate: '',
        icon: '',
        isActive: true
      },
      showAddModal: true
    });
  },

  // 打开编辑游戏弹窗
  openEditModal: function(e) {
    const { index } = e.currentTarget.dataset;
    const game = this.data.games[index];
    
    this.setData({
      isEdit: true,
      tempGame: { ...game },
      showAddModal: true
    });
  },

  // 关闭添加/编辑弹窗
  closeAddModal: function() {
    this.setData({
      showAddModal: false
    });
  },

  // 绑定表单输入
  bindInputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`tempGame.${field}`]: value
    });
  },

  // 切换游戏活跃状态
  switchChange: function(e) {
    this.setData({
      'tempGame.isActive': e.detail.value
    });
  },

  // 回到上一页
  navigateBack: function() {
    wx.navigateBack();
  }
}); 