Page({
  data: {
    ticketList: [],
    showModal: false,
    isEditing: false,
    currentTicket: {
      id: '',
      name: '',
      malePrice: '',
      femalePrice: '',
      drinkCount: '',
      validHours: '',
      validDays: '',
      description: '',
      status: 'active'
    }
  },
  
  onLoad: function(options) {
    this.loadTicketList();
  },
  
  // 加载门票列表
  loadTicketList: function() {
    // 模拟数据
    const mockTickets = [
      {
        id: '1',
        name: '基础门票',
        malePrice: '88',
        femalePrice: '68',
        drinkCount: '3',
        validHours: '4',
        validDays: '7',
        description: '包含3杯酒水，4小时内使用，有效期7天',
        status: 'active'
      },
      {
        id: '2',
        name: '高级门票',
        malePrice: '128',
        femalePrice: '98',
        drinkCount: '5',
        validHours: '6',
        validDays: '15',
        description: '包含5杯酒水，6小时内使用，有效期15天',
        status: 'active'
      },
      {
        id: '3',
        name: 'VIP门票',
        malePrice: '188',
        femalePrice: '148',
        drinkCount: '8',
        validHours: '8',
        validDays: '30',
        description: '包含8杯酒水，8小时内使用，有效期30天',
        status: 'inactive'
      }
    ];
    
    this.setData({
      ticketList: mockTickets
    });
  },
  
  // 显示添加模态框
  showAddModal: function() {
    this.setData({
      showModal: true,
      isEditing: false,
      currentTicket: {
        id: '',
        name: '',
        malePrice: '',
        femalePrice: '',
        drinkCount: '',
        validHours: '',
        validDays: '',
        description: '',
        status: 'active'
      }
    });
  },
  
  // 编辑门票
  editTicket: function(e) {
    const id = e.currentTarget.dataset.id;
    const ticket = this.data.ticketList.find(item => item.id === id);
    
    if (ticket) {
      this.setData({
        showModal: true,
        isEditing: true,
        currentTicket: { ...ticket }
      });
    }
  },
  
  // 隐藏模态框
  hideModal: function() {
    this.setData({
      showModal: false
    });
  },
  
  // 阻止事件冒泡
  stopPropagation: function() {
    // 空函数，用于阻止事件冒泡
  },
  
  // 输入事件处理
  onNameInput: function(e) {
    this.setData({
      'currentTicket.name': e.detail.value
    });
  },
  
  onMalePriceInput: function(e) {
    this.setData({
      'currentTicket.malePrice': e.detail.value
    });
  },
  
  onFemalePriceInput: function(e) {
    this.setData({
      'currentTicket.femalePrice': e.detail.value
    });
  },
  
  onDrinkCountInput: function(e) {
    this.setData({
      'currentTicket.drinkCount': e.detail.value
    });
  },
  
  onValidHoursInput: function(e) {
    this.setData({
      'currentTicket.validHours': e.detail.value
    });
  },
  
  onValidDaysInput: function(e) {
    this.setData({
      'currentTicket.validDays': e.detail.value
    });
  },
  
  onDescriptionInput: function(e) {
    this.setData({
      'currentTicket.description': e.detail.value
    });
  },
  
  onStatusChange: function(e) {
    this.setData({
      'currentTicket.status': e.detail.value ? 'active' : 'inactive'
    });
  },
  
  // 保存门票
  saveTicket: function() {
    const ticket = this.data.currentTicket;
    
    // 验证必填字段
    if (!ticket.name.trim()) {
      wx.showToast({
        title: '请输入门票名称',
        icon: 'none'
      });
      return;
    }
    
    if (!ticket.malePrice || ticket.malePrice <= 0) {
      wx.showToast({
        title: '请输入有效男性价格',
        icon: 'none'
      });
      return;
    }
    
    if (!ticket.femalePrice || ticket.femalePrice <= 0) {
      wx.showToast({
        title: '请输入有效女性价格',
        icon: 'none'
      });
      return;
    }
    
    if (!ticket.drinkCount || ticket.drinkCount <= 0) {
      wx.showToast({
        title: '请输入酒水数量',
        icon: 'none'
      });
      return;
    }
    
    if (!ticket.validHours || ticket.validHours <= 0) {
      wx.showToast({
        title: '请输入使用时间',
        icon: 'none'
      });
      return;
    }
    
    if (!ticket.validDays || ticket.validDays <= 0) {
      wx.showToast({
        title: '请输入有效期',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '保存中...'
    });
    
    setTimeout(() => {
      wx.hideLoading();
      
      if (this.data.isEditing) {
        // 编辑模式
        const index = this.data.ticketList.findIndex(item => item.id === ticket.id);
        if (index !== -1) {
          const newList = [...this.data.ticketList];
          newList[index] = { ...ticket };
          this.setData({
            ticketList: newList
          });
        }
      } else {
        // 新增模式
        const newTicket = {
          ...ticket,
          id: Date.now().toString()
        };
        this.setData({
          ticketList: [...this.data.ticketList, newTicket]
        });
      }
      
      this.hideModal();
      
      wx.showToast({
        title: this.data.isEditing ? '编辑成功' : '添加成功',
        icon: 'success'
      });
    }, 1000);
  },
  
  // 切换门票状态
  toggleTicketStatus: function(e) {
    const id = e.currentTarget.dataset.id;
    const index = this.data.ticketList.findIndex(item => item.id === id);
    
    if (index !== -1) {
      const newList = [...this.data.ticketList];
      const newStatus = newList[index].status === 'active' ? 'inactive' : 'active';
      newList[index].status = newStatus;
      
      this.setData({
        ticketList: newList
      });
      
      wx.showToast({
        title: newStatus === 'active' ? '已启用' : '已停用',
        icon: 'success'
      });
    }
  },
  

  
  // 删除门票
  deleteTicket: function(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个门票吗？删除后无法恢复。',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...'
          });
          
          setTimeout(() => {
            const newList = this.data.ticketList.filter(item => item.id !== id);
            this.setData({
              ticketList: newList
            });
            
            wx.hideLoading();
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          }, 500);
        }
      }
    });
  }
})
