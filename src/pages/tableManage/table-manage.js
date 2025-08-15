const app = getApp()

Page({
  data: {
    tableList: [],
    showTableModal: false,
    isEdit: false,
    // 服务模式选项
    serviceModeOptions: [
      { value: 'ticket', label: '门票制' },
      { value: 'order', label: '点单制' }
    ],
    currentTable: {
      id: '',
      number: '',
      maxCount: '',
      currentCount: '',
      status: 'available',
      serviceMode: 'ticket', // 默认门票制
      qrcode: '' // 二维码图片路径
    }
  },

  onLoad() {
    this.fetchTableList()
  },

  // 获取桌位列表
  fetchTableList() {
    // TODO: 从服务器获取桌位列表
    // 这里使用模拟数据
    const mockTableList = [
      {
        id: '1',
        number: '1号桌',
        status: 'available',
        currentCount: 2,
        maxCount: 4,
        serviceMode: 'ticket',
        qrcode: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=QR1'
      },
      {
        id: '2',
        number: '2号桌',
        status: 'occupied',
        currentCount: 4,
        maxCount: 4,
        serviceMode: 'order',
        qrcode: ''
      }
    ]
    this.setData({
      tableList: mockTableList
    })
  },

  // 添加桌位
  addTable() {
    this.setData({
      showTableModal: true,
      isEdit: false,
      currentTable: {
        id: '',
        number: '',
        maxCount: '',
        currentCount: '0',
        status: 'available',
        serviceMode: 'ticket',
        qrcode: ''
      }
    })
  },

  // 编辑桌位
  editTable(e) {
    const { id } = e.currentTarget.dataset
    const table = this.data.tableList.find(item => item.id === id)
    if (table) {
      this.setData({
        showTableModal: true,
        isEdit: true,
        currentTable: { ...table }
      })
    }
  },

  // 删除桌位
  deleteTable(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个桌位吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用删除接口
          const tableList = this.data.tableList.filter(item => item.id !== id)
          this.setData({ tableList })
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 关闭弹窗
  closeModal() {
    this.setData({
      showTableModal: false
    })
  },

  // 输入桌号
  inputTableNumber(e) {
    this.setData({
      'currentTable.number': e.detail.value
    })
  },

  // 输入最大人数
  inputMaxCount(e) {
    this.setData({
      'currentTable.maxCount': e.detail.value
    })
  },

  // 输入当前人数
  inputCurrentCount(e) {
    const count = parseInt(e.detail.value)
    const maxCount = parseInt(this.data.currentTable.maxCount)
    
    if (count > maxCount) {
      wx.showToast({
        title: '当前人数不能超过最大人数',
        icon: 'none'
      })
      return
    }

    this.setData({
      'currentTable.currentCount': count,
      'currentTable.status': count >= maxCount ? 'occupied' : 'available'
    })
  },

  // 选择服务模式
  selectServiceMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      'currentTable.serviceMode': mode
    });
  },

  // 上传二维码
  uploadQRCode() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        
        // TODO: 这里应该上传图片到服务器，获取永久链接
        // 目前先使用临时路径
        this.setData({
          'currentTable.qrcode': tempFilePath
        })
        
        wx.showToast({
          title: '二维码上传成功',
          icon: 'success'
        })
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        })
      }
    })
  },

  // 查看二维码
  viewQRCode() {
    if (this.data.currentTable.qrcode) {
      wx.previewImage({
        urls: [this.data.currentTable.qrcode],
        current: this.data.currentTable.qrcode
      })
    }
  },

  // 删除二维码
  deleteQRCode() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个二维码吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            'currentTable.qrcode': ''
          })
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 确认添加/编辑
  confirmTable() {
    const { number, maxCount, currentCount } = this.data.currentTable
    
    if (!number || !maxCount) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    if (parseInt(currentCount) > parseInt(maxCount)) {
      wx.showToast({
        title: '当前人数不能超过最大人数',
        icon: 'none'
      })
      return
    }

    // TODO: 调用添加/编辑接口
    if (this.data.isEdit) {
      // 编辑模式
      const tableList = this.data.tableList.map(item => {
        if (item.id === this.data.currentTable.id) {
          return this.data.currentTable
        }
        return item
      })
      this.setData({ tableList })
    } else {
      // 添加模式
      const newTable = {
        ...this.data.currentTable,
        id: Date.now().toString()
      }
      this.setData({
        tableList: [...this.data.tableList, newTable]
      })
    }

    this.closeModal()
    wx.showToast({
      title: this.data.isEdit ? '编辑成功' : '添加成功',
      icon: 'success'
    })
  }
}) 