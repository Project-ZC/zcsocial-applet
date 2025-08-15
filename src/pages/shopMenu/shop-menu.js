const app = getApp()

Page({
  data: {
    shopId: '',
    categories: [],  // 酒水分类列表
    drinks: [],      // 当前分类下的饮品列表
    currentCategoryId: null, // 当前选中的分类ID
    
    // 模态框状态
    showCategoryModal: false,
    showDrinkModal: false,
    showDeleteModal: false,
    
    // 编辑状态
    isEditing: false,
    editItemId: null,
    deleteType: '', // 'category' 或 'drink'
    
    // 表单数据
    formData: {
      name: '',
      description: '',
      price: '',
      isFree: false,
      image: ''
    },

    // 菜单类型切换
    menuType: 'regular', // regular: 常规酒单, diy: DIY酒料

    // 常规酒单相关数据
    filteredDrinks: [], // 根据分类筛选后的酒水列表
    
    // DIY酒料相关数据
    diyTypes: [], // DIY酒料分类列表
    diyIngredients: [], // 所有DIY酒料列表
    filteredDiyIngredients: [], // 根据分类筛选后的DIY酒料列表
    currentDiyTypeId: '', // 当前选中的DIY酒料分类ID
    
    // DIY酒料模态框显示控制
    showDiyTypeModal: false, // 显示DIY酒料分类模态框
    showDiyIngredientModal: false, // 显示DIY酒料模态框
    showDeleteDiyTypeModal: false, // 显示删除DIY酒料分类确认框
    showDeleteDiyIngredientModal: false, // 显示删除DIY酒料确认框
    
    // 编辑状态标识
    isEditingCategory: false, // 是否在编辑分类
    isEditingDrink: false, // 是否在编辑酒水
    isEditingDiyType: false, // 是否在编辑DIY酒料分类
    isEditingDiyIngredient: false, // 是否在编辑DIY酒料
    
    // 临时数据，用于新增/编辑
    tempCategory: {
      id: '',
      name: '',
      sort: 0
    },
    tempDrink: {
      id: '',
      categoryId: '',
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      image: '',
      sort: 0,
      isRecommended: false,
      isAvailable: true,
      enableOrdering: true // 是否启用点单制，默认启用
    },
    tempDiyType: {
      id: '',
      name: '',
      sort: 0
    },
    tempDiyIngredient: {
      id: '',
      typeId: '',
      name: '',
      description: '',
      price: 0,
      unit: '份',
      image: '',
      sort: 0,
      isRecommended: false,
      isAvailable: true
    },
    
    // 编辑项ID
    editCategoryId: '',
    editDrinkId: '',
    editDiyTypeId: '',
    editDiyIngredientId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取shopId
    this.setData({
      shopId: options.shopId || '123456'
    });
    
    // 加载分类
    this.loadCategories();
    
    // 加载DIY酒料类型
    this.loadDiyTypes();
    
    // 加载DIY酒料
    this.loadDiyIngredients();
  },

  /**
   * 获取分类列表
   */
  loadCategories() {
    const self = this;
    wx.showLoading({
      title: '加载中...',
    });
    
    // 模拟数据，实际应该从服务器获取
    setTimeout(() => {
      const mockCategories = [
        { id: 1, name: '精酿啤酒' },
        { id: 2, name: '调酒' },
        { id: 3, name: '软饮' },
        { id: 4, name: '零食' },
        { id: 5, name: '威士忌' }
      ];
      
      self.setData({
        categories: mockCategories,
        currentCategoryId: mockCategories.length > 0 ? mockCategories[0].id : null
      });
      
      if (mockCategories.length > 0) {
        self.loadDrinksByCategory(mockCategories[0].id);
      }
      
      wx.hideLoading();
    }, 500);
  },

  /**
   * 获取饮品列表
   */
  loadDrinksByCategory(categoryId) {
    const self = this;
    wx.showLoading({
      title: '加载中...',
    });
    
    // 模拟数据，实际应该从服务器获取
    setTimeout(() => {
      const mockDrinks = [
        // 精酿啤酒类（categoryId: 1）
        { 
          id: 1, 
          categoryId: 1, 
          name: '柏林小麦精酿', 
          description: '清爽柔顺的口感，带有独特的香蕉与丁香气息，泡沫雪白细腻。', 
          price: 0, 
          isFree: true, 
          image: '/images/beer.jpg',
          enableOrdering: true
        },
        { 
          id: 2, 
          categoryId: 1, 
          name: 'IPA精酿', 
          description: '浓郁的啤酒花香气，略带苦味，泡沫丰富。', 
          price: 0, 
          isFree: true, 
          image: '/images/beer.jpg',
          enableOrdering: true
        },
        { 
          id: 3, 
          categoryId: 1, 
          name: '波特黑啤', 
          description: '浓郁的咖啡和巧克力风味，口感醇厚饱满，略带甜味。', 
          price: 0, 
          isFree: true, 
          image: '/images/black-beer.jpg',
          enableOrdering: true
        },
        { 
          id: 4, 
          categoryId: 1, 
          name: '比利时修道院啤酒', 
          description: '酒体丰满，口感复杂，带有水果和香料的风味。', 
          price: 60, 
          isFree: false, 
          image: '/images/belgian-beer.jpg',
          enableOrdering: true
        },
        { 
          id: 101, 
          categoryId: 1, 
          name: '德国小麦啤酒', 
          description: '充满香蕉和丁香风味，口感轻盈爽口，泡沫丰富持久。', 
          price: 45, 
          isFree: false, 
          image: '/images/wheat-beer.jpg',
          enableOrdering: true
        },
        { 
          id: 102, 
          categoryId: 1, 
          name: '美式淡色艾尔', 
          description: '清爽平衡的口感，带有柑橘和花香，苦味适中。', 
          price: 0, 
          isFree: true, 
          image: '/images/pale-ale.jpg',
          enableOrdering: true
        },
        
        // 调酒类（categoryId: 2）
        { 
          id: 5, 
          categoryId: 2, 
          name: '莫吉托', 
          description: '新鲜薄荷与青柠的清爽风味，搭配朗姆酒与苏打水。', 
          price: 65, 
          isFree: false, 
          image: '/images/mojito.jpg',
          enableOrdering: true
        },
        { 
          id: 6, 
          categoryId: 2, 
          name: '马提尼', 
          description: '经典鸡尾酒，由金酒和味美思调配，搭配橄榄或柠檬皮。', 
          price: 70, 
          isFree: false, 
          image: '/images/martini.jpg',
          enableOrdering: true
        },
        { 
          id: 7, 
          categoryId: 2, 
          name: '玛格丽特', 
          description: '龙舌兰酒、君度橙酒和新鲜柠檬汁的经典组合，杯口撒盐。', 
          price: 68, 
          isFree: false, 
          image: '/images/margarita.jpg',
          enableOrdering: true
        },
        { 
          id: 8, 
          categoryId: 2, 
          name: '椰林飘香', 
          description: '朗姆酒、椰奶和菠萝汁的热带风情调酒，清甜可口。', 
          price: 72, 
          isFree: false, 
          image: '/images/pina-colada.jpg',
          enableOrdering: true
        },
        { 
          id: 9, 
          categoryId: 2, 
          name: '蓝色珊瑚礁', 
          description: '蓝色柑橙酒、朗姆酒与柠檬汁混合，颜色如同加勒比海的碧蓝海水。', 
          price: 78, 
          isFree: false, 
          image: '/images/blue-lagoon.jpg',
          enableOrdering: true
        },
        { 
          id: 103, 
          categoryId: 2, 
          name: '长岛冰茶', 
          description: '五种烈酒与柠檬汁和可乐混合，酒精含量高但口感顺滑。', 
          price: 88, 
          isFree: false, 
          image: '/images/long-island.jpg',
          enableOrdering: true
        },
        { 
          id: 104, 
          categoryId: 2, 
          name: '血腥玛丽', 
          description: '伏特加与番茄汁的完美结合，加入辣酱、盐和黑胡椒。', 
          price: 75, 
          isFree: false, 
          image: '/images/bloody-mary.jpg',
          enableOrdering: true
        },
        { 
          id: 105, 
          categoryId: 2, 
          name: '曼哈顿', 
          description: '威士忌与甜苦艾酒混合，加入安格斯特拉苦精，搭配樱桃装饰。', 
          price: 82, 
          isFree: false, 
          image: '/images/manhattan.jpg',
          enableOrdering: true
        },
        
        // 软饮类（categoryId: 3）
        { 
          id: 10, 
          categoryId: 3, 
          name: '可乐', 
          description: '经典汽水饮料，冰镇后口感更佳。', 
          price: 0, 
          isFree: true, 
          image: '/images/cola.jpg',
          enableOrdering: true
        },
        { 
          id: 11, 
          categoryId: 3, 
          name: '莓果气泡水', 
          description: '新鲜草莓和蓝莓混合，加入气泡水，清爽提神。', 
          price: 0, 
          isFree: true, 
          image: '/images/berry-soda.jpg',
          enableOrdering: true
        },
        { 
          id: 12, 
          categoryId: 3, 
          name: '薄荷柠檬水', 
          description: '新鲜薄荷叶与柠檬片浸泡的冰水，添加少量蜂蜜。', 
          price: 0, 
          isFree: true, 
          image: '/images/mint-lemonade.jpg',
          enableOrdering: true
        },
        { 
          id: 106, 
          categoryId: 3, 
          name: '热带水果茶', 
          description: '热带水果混合茶饮，带有菠萝、芒果和百香果的香甜味道。', 
          price: 0, 
          isFree: true, 
          image: '/images/fruit-tea.jpg',
          enableOrdering: true
        },
        { 
          id: 107, 
          categoryId: 3, 
          name: '青柠姜汁汽水', 
          description: '辛辣的姜汁与酸甜的青柠汁混合，加入苏打水，提神醒脑。', 
          price: 0, 
          isFree: true, 
          image: '/images/lime-ginger.jpg',
          enableOrdering: true
        },
        
        // 零食类（categoryId: 4）
        { 
          id: 13, 
          categoryId: 4, 
          name: '混合坚果', 
          description: '精选腰果、杏仁、核桃等坚果混合，略带咸味。', 
          price: 38, 
          isFree: false, 
          image: '/images/mixed-nuts.jpg',
          enableOrdering: true
        },
        { 
          id: 14, 
          categoryId: 4, 
          name: '薯片拼盘', 
          description: '原味、番茄、海苔三种口味薯片拼盘。', 
          price: 30, 
          isFree: false, 
          image: '/images/chips.jpg',
          enableOrdering: true
        },
        { 
          id: 15, 
          categoryId: 4, 
          name: '芝士条', 
          description: '金黄酥脆的芝士条，撒上少许辣椒粉和香草碎。', 
          price: 45, 
          isFree: false, 
          image: '/images/cheese-sticks.jpg',
          enableOrdering: true
        },
        { 
          id: 108, 
          categoryId: 4, 
          name: '西班牙橄榄', 
          description: '精选西班牙橄榄，腌制入味，搭配啤酒或鸡尾酒风味绝佳。', 
          price: 42, 
          isFree: false, 
          image: '/images/olives.jpg',
          enableOrdering: true
        },
        { 
          id: 109, 
          categoryId: 4, 
          name: '炸鱿鱼圈', 
          description: '外酥里嫩的炸鱿鱼圈，配以特制蒜香美乃滋。', 
          price: 58, 
          isFree: false, 
          image: '/images/calamari.jpg',
          enableOrdering: true
        },
        { 
          id: 110, 
          categoryId: 4, 
          name: '墨西哥玉米片配莎莎酱', 
          description: '香脆玉米片配以新鲜手工番茄莎莎酱和牛油果酱。', 
          price: 48, 
          isFree: false, 
          image: '/images/nachos.jpg',
          enableOrdering: true
        },
        
        // 威士忌类（categoryId: 5）
        { 
          id: 16, 
          categoryId: 5, 
          name: '单一麦芽威士忌', 
          description: '12年陈酿单一麦芽威士忌，带有橡木桶与麦芽的香气。', 
          price: 120, 
          isFree: false, 
          image: '/images/whisky.jpg',
          enableOrdering: true
        },
        { 
          id: 17, 
          categoryId: 5, 
          name: '日本威士忌', 
          description: '精致纯净的日本威士忌，风味清雅平衡。', 
          price: 150, 
          isFree: false, 
          image: '/images/japanese-whisky.jpg',
          enableOrdering: true
        },
        { 
          id: 18, 
          categoryId: 5, 
          name: '波本威士忌', 
          description: '美国肯塔基州产波本威士忌，香甜醇厚。', 
          price: 100, 
          isFree: false, 
          image: '/images/bourbon.jpg',
          enableOrdering: true
        },
        { 
          id: 111, 
          categoryId: 5, 
          name: '苏格兰调和威士忌', 
          description: '精选多款苏格兰单一麦芽威士忌调和而成，风味平衡丰富。', 
          price: 95, 
          isFree: false, 
          image: '/images/blended-scotch.jpg',
          enableOrdering: true
        },
        { 
          id: 112, 
          categoryId: 5, 
          name: '爱尔兰威士忌', 
          description: '三次蒸馏的爱尔兰威士忌，口感柔和顺滑，带有淡淡的果香。', 
          price: 105, 
          isFree: false, 
          image: '/images/irish-whiskey.jpg',
          enableOrdering: true
        },
        { 
          id: 113, 
          categoryId: 5, 
          name: '18年陈酿高地威士忌', 
          description: '陈酿18年的苏格兰高地威士忌，带有蜂蜜、香料和坚果的复杂风味。', 
          price: 180, 
          isFree: false, 
          image: '/images/highland-whisky.jpg',
          enableOrdering: true
        }
      ];
      
      const filteredDrinks = mockDrinks.filter(item => item.categoryId === categoryId);
      
      self.setData({
        drinks: mockDrinks,
        filteredDrinks: filteredDrinks,
        currentCategoryId: categoryId
      });
      
      wx.hideLoading();
    }, 500);
  },

  /**
   * 切换分类
   */
  switchCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    const filteredDrinks = this.data.drinks.filter(item => item.categoryId === categoryId);
    
    this.setData({
      currentCategoryId: categoryId,
      filteredDrinks: filteredDrinks
    });
  },

  /**
   * 显示添加分类模态框
   */
  showAddCategory() {
    this.setData({
      showCategoryModal: true,
      isEditingCategory: false,
      tempCategory: {
        id: '',
        name: '',
        sort: 0
      }
    })
  },

  /**
   * 显示编辑分类模态框
   */
  openEditCategoryModal() {
    const categoryId = this.data.currentCategoryId;
    const category = this.data.categories.find(item => item.id === categoryId);
    
    if (category) {
      this.setData({
        showCategoryModal: true,
        isEditingCategory: true,
        editCategoryId: categoryId,
        tempCategory: { ...category }
      });
    } else {
      wx.showToast({
        title: '请先选择一个分类',
        icon: 'none'
      });
    }
  },

  /**
   * 显示删除分类确认模态框
   */
  openDeleteCategoryModal() {
    const categoryId = this.data.currentCategoryId;
    
    if (categoryId) {
      this.setData({
        showDeleteModal: true,
        deleteType: 'category',
        editItemId: categoryId
      });
    } else {
      wx.showToast({
        title: '请先选择一个分类',
        icon: 'none'
      });
    }
  },

  /**
   * 显示添加饮品模态框
   */
  openAddDrinkModal() {
    const categoryId = this.data.currentCategoryId;
    
    if (!categoryId) {
      wx.showToast({
        title: '请先选择一个分类',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      showDrinkModal: true,
      isEditingDrink: false,
      tempDrink: {
        id: '',
        categoryId: categoryId,
        name: '',
        description: '',
        price: 0,
        originalPrice: '',
        image: '',
        sort: 0,
        isRecommended: false,
        isAvailable: true
      }
    });
  },

  /**
   * 显示编辑饮品模态框
   */
  openEditDrinkModal(e) {
    const drinkId = e.currentTarget.dataset.id;
    const drink = this.data.drinks.find(item => item.id === drinkId);
    
    if (drink) {
      this.setData({
        showDrinkModal: true,
        isEditingDrink: true,
        editDrinkId: drinkId,
        tempDrink: { ...drink }
      });
    }
  },

  /**
   * 显示删除饮品确认模态框
   */
  openDeleteDrinkModal(e) {
    const drinkId = e.currentTarget.dataset.id;
    
    this.setData({
      showDeleteModal: true,
      deleteType: 'drink',
      editItemId: drinkId
    });
  },

  /**
   * 关闭分类模态框
   */
  closeCategoryModal() {
    this.setData({
      showCategoryModal: false
    });
  },

  /**
   * 关闭饮品模态框
   */
  closeDrinkModal() {
    this.setData({
      showDrinkModal: false
    });
  },

  /**
   * 关闭删除确认模态框
   */
  closeDeleteModal() {
    this.setData({
      showDeleteModal: false
    });
  },

  /**
   * 保存分类
   */
  saveCategory() {
    const { tempCategory, isEditingCategory, editCategoryId, categories } = this.data;
    
    if (!tempCategory.name) {
      wx.showToast({
        title: '请输入分类名称',
        icon: 'none'
      });
      return;
    }
    
    let newCategories = [...categories];
    
    if (isEditingCategory) {
      // 编辑现有分类
      const index = newCategories.findIndex(item => item.id === editCategoryId);
      if (index > -1) {
        newCategories[index] = { ...tempCategory, id: editCategoryId };
      }
    } else {
      // 添加新分类
      const newId = Date.now();
      newCategories.push({ ...tempCategory, id: newId });
      
      // 如果是第一个分类，自动选中
      if (newCategories.length === 1) {
        this.setData({
          currentCategoryId: newId
        });
      }
    }
    
    // 按sort排序
    newCategories.sort((a, b) => a.sort - b.sort);
    
    this.setData({
      categories: newCategories,
      showCategoryModal: false
    });
    
    wx.showToast({
      title: isEditingCategory ? '编辑成功' : '添加成功',
      icon: 'success'
    });
  },

  /**
   * 上传饮品图片
   */
  uploadDrinkImage() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        // 实际项目中应上传到服务器，这里直接使用临时路径
        that.setData({
          'tempDrink.image': res.tempFilePaths[0]
        });
      }
    });
  },
  
  /**
   * 饮品表单字段绑定
   */
  onDrinkNameInput(e) {
    this.setData({
      'tempDrink.name': e.detail.value
    });
  },
  
  onDrinkDescInput(e) {
    this.setData({
      'tempDrink.description': e.detail.value
    });
  },
  
  onDrinkPriceInput(e) {
    this.setData({
      'tempDrink.price': parseFloat(e.detail.value) || 0
    });
  },
  
  onDrinkOriginalPriceInput(e) {
    this.setData({
      'tempDrink.originalPrice': parseFloat(e.detail.value) || 0
    });
  },
  
  onDrinkSortInput(e) {
    this.setData({
      'tempDrink.sort': parseInt(e.detail.value) || 0
    });
  },
  
  onDrinkRecommendedChange(e) {
    this.setData({
      'tempDrink.isRecommended': e.detail.value
    });
  },
  
  onDrinkAvailableChange(e) {
    this.setData({
      'tempDrink.isAvailable': e.detail.value
    });
  },

  onDrinkOrderingChange(e) {
    this.setData({
      'tempDrink.enableOrdering': e.detail.value
    });
  },
  
  /**
   * 分类表单字段绑定
   */
  onCategoryNameInput(e) {
    this.setData({
      'tempCategory.name': e.detail.value
    });
  },
  
  onCategorySortInput(e) {
    this.setData({
      'tempCategory.sort': parseInt(e.detail.value) || 0
    });
  },

  // 切换菜单类型（常规酒单/DIY酒料）
  switchMenuType: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      menuType: type
    });
  },
  
  // ======== 常规酒单管理功能 ========
  
  // 筛选酒水
  filterDrinks: function(categoryId) {
    const filteredDrinks = this.data.drinks.filter(item => item.categoryId === categoryId);
    this.setData({
      filteredDrinks: filteredDrinks
    });
  },
  
  // ======== DIY酒料管理功能 ========
  
  // 加载DIY酒料分类
  loadDiyTypes: function() {
    // 实际项目中应通过接口获取数据
    // 这里使用模拟数据
    const diyTypes = [
      {
        id: '1',
        name: '基酒',
        sort: 1
      },
      {
        id: '2',
        name: '调味酒',
        sort: 2
      },
      {
        id: '3',
        name: '果汁/糖浆',
        sort: 3
      },
      {
        id: '4',
        name: '装饰物',
        sort: 4
      },
      {
        id: '5',
        name: '气泡饮料',
        sort: 5
      }
    ];
    
    this.setData({
      diyTypes: diyTypes
    });
  },
  
  // 加载DIY酒料数据
  loadDiyIngredients: function() {
    // 实际项目中应通过接口获取数据
    // 这里使用模拟数据
    const diyIngredients = [
      {
        id: '1',
        typeId: '1',
        name: '伏特加',
        description: '无色、无味的蒸馏酒，酒精度40%左右',
        price: 20,
        unit: '份',
        image: '/static/images/ingredient1.png',
        sort: 1,
        isRecommended: true,
        isAvailable: true
      },
      {
        id: '2',
        typeId: '1',
        name: '金酒',
        description: '以杜松子调味的蒸馏酒，酒精度40-47%',
        price: 25,
        unit: '份',
        image: '/static/images/ingredient2.png',
        sort: 2,
        isRecommended: false,
        isAvailable: true
      },
      {
        id: '3',
        typeId: '1',
        name: '朗姆酒',
        description: '由甘蔗制成的烈酒，有白朗姆和黑朗姆之分',
        price: 22,
        unit: '份',
        image: '/static/images/rum.png',
        sort: 3,
        isRecommended: true,
        isAvailable: true
      },
      {
        id: '4',
        typeId: '1',
        name: '龙舌兰',
        description: '由墨西哥龙舌兰植物制成的烈酒',
        price: 28,
        unit: '份',
        image: '/static/images/tequila.png',
        sort: 4,
        isRecommended: false,
        isAvailable: true
      },
      {
        id: '5',
        typeId: '2',
        name: '君度橙酒',
        description: '甜橙口味的利口酒，常用于调制鸡尾酒',
        price: 15,
        unit: '份',
        image: '/static/images/cointreau.png',
        sort: 1,
        isRecommended: true,
        isAvailable: true
      },
      {
        id: '6',
        typeId: '2',
        name: '蓝色柑橙酒',
        description: '蓝色的甜味利口酒，常用于调制蓝色鸡尾酒',
        price: 15,
        unit: '份',
        image: '/static/images/blue-curacao.png',
        sort: 2,
        isRecommended: false,
        isAvailable: true
      },
      {
        id: '7',
        typeId: '2',
        name: '咖啡利口酒',
        description: '浓郁的咖啡风味酒，后味微甜',
        price: 18,
        unit: '份',
        image: '/static/images/coffee-liqueur.png',
        sort: 3,
        isRecommended: true,
        isAvailable: true
      },
      {
        id: '8',
        typeId: '3',
        name: '柠檬汁',
        description: '新鲜压榨的柠檬汁',
        price: 5,
        unit: '份',
        image: '/static/images/ingredient3.png',
        sort: 1,
        isRecommended: true,
        isAvailable: true
      },
      {
        id: '9',
        typeId: '3',
        name: '香草糖浆',
        description: '带有香草风味的甜糖浆',
        price: 3,
        unit: '份',
        image: '/static/images/vanilla-syrup.png',
        sort: 2,
        isRecommended: false,
        isAvailable: true
      },
      {
        id: '10',
        typeId: '3',
        name: '蔓越莓汁',
        description: '酸甜可口的蔓越莓果汁',
        price: 8,
        unit: '份',
        image: '/static/images/cranberry-juice.png',
        sort: 3,
        isRecommended: true,
        isAvailable: true
      },
      {
        id: '11',
        typeId: '3',
        name: '西瓜汁',
        description: '新鲜压榨的西瓜汁，清甜爽口',
        price: 10,
        unit: '份',
        image: '/static/images/watermelon-juice.png',
        sort: 4,
        isRecommended: false,
        isAvailable: true
      },
      {
        id: '12',
        typeId: '4',
        name: '薄荷叶',
        description: '新鲜薄荷叶，用于装饰和增香',
        price: 3,
        unit: '份',
        image: '/static/images/ingredient4.png',
        sort: 1,
        isRecommended: false,
        isAvailable: true
      },
      {
        id: '13',
        typeId: '4',
        name: '柠檬片',
        description: '切片柠檬，用于装饰和调味',
        price: 2,
        unit: '份',
        image: '/static/images/lemon-slice.png',
        sort: 2,
        isRecommended: true,
        isAvailable: true
      },
      {
        id: '14',
        typeId: '4',
        name: '橄榄',
        description: '腌制橄榄，常用于马提尼等鸡尾酒装饰',
        price: 4,
        unit: '份',
        image: '/static/images/olive.png',
        sort: 3,
        isRecommended: false,
        isAvailable: true
      },
      {
        id: '15',
        typeId: '4',
        name: '樱桃',
        description: '鸡尾酒专用樱桃，色泽鲜艳',
        price: 5,
        unit: '份',
        image: '/static/images/cocktail-cherry.png',
        sort: 4,
        isRecommended: true,
        isAvailable: true
      },
      {
        id: '16',
        typeId: '5',
        name: '苏打水',
        description: '无味气泡水，用于调和鸡尾酒',
        price: 0,
        unit: '份',
        image: '/static/images/soda-water.png',
        sort: 1,
        isRecommended: true,
        isAvailable: true
      },
      {
        id: '17',
        typeId: '5',
        name: '汤力水',
        description: '带有奎宁苦味的气泡水，常与金酒搭配',
        price: 5,
        unit: '份',
        image: '/static/images/tonic-water.png',
        sort: 2,
        isRecommended: true,
        isAvailable: true
      },
      {
        id: '18',
        typeId: '5',
        name: '姜汁汽水',
        description: '辛辣微甜的姜味汽水，搭配朗姆酒风味绝佳',
        price: 8,
        unit: '份',
        image: '/static/images/ginger-ale.png',
        sort: 3,
        isRecommended: false,
        isAvailable: true
      }
    ];
    
    this.setData({
      diyIngredients: diyIngredients
    });
    
    // 如果已经有选中的分类，则筛选DIY酒料
    if (this.data.currentDiyTypeId) {
      this.filterDiyIngredients(this.data.currentDiyTypeId);
    }
  },
  
  // 筛选DIY酒料
  filterDiyIngredients: function(typeId) {
    const filteredDiyIngredients = this.data.diyIngredients.filter(item => item.typeId === typeId);
    this.setData({
      filteredDiyIngredients: filteredDiyIngredients
    });
  },
  
  // 切换DIY酒料分类
  switchDiyType: function(e) {
    const typeId = e.currentTarget.dataset.id;
    this.setData({
      currentDiyTypeId: typeId
    });
    
    this.filterDiyIngredients(typeId);
  },
  
  // 打开添加DIY酒料分类模态框
  openAddDiyTypeModal: function() {
    this.setData({
      showDiyTypeModal: true,
      isEditingDiyType: false,
      tempDiyType: {
        id: '',
        name: '',
        sort: 0
      }
    });
  },
  
  // 打开编辑DIY酒料分类模态框
  openEditDiyTypeModal: function() {
    const typeId = this.data.currentDiyTypeId;
    const diyType = this.data.diyTypes.find(item => item.id === typeId);
    
    if (diyType) {
      this.setData({
        showDiyTypeModal: true,
        isEditingDiyType: true,
        editDiyTypeId: typeId,
        tempDiyType: { ...diyType }
      });
    } else {
      wx.showToast({
        title: '请先选择一个分类',
        icon: 'none'
      });
    }
  },
  
  // 关闭DIY酒料分类模态框
  closeDiyTypeModal: function() {
    this.setData({
      showDiyTypeModal: false
    });
  },
  
  // 打开删除DIY酒料分类确认框
  openDeleteDiyTypeModal: function() {
    const typeId = this.data.currentDiyTypeId;
    
    if (typeId) {
      this.setData({
        showDeleteDiyTypeModal: true,
        editDiyTypeId: typeId
      });
    } else {
      wx.showToast({
        title: '请先选择一个分类',
        icon: 'none'
      });
    }
  },
  
  // 关闭删除DIY酒料分类确认框
  closeDeleteDiyTypeModal: function() {
    this.setData({
      showDeleteDiyTypeModal: false
    });
  },
  
  // 保存DIY酒料分类
  saveDiyType: function() {
    const { tempDiyType, isEditingDiyType, editDiyTypeId, diyTypes } = this.data;
    
    if (!tempDiyType.name) {
      wx.showToast({
        title: '请输入分类名称',
        icon: 'none'
      });
      return;
    }
    
    let newDiyTypes = [...diyTypes];
    
    if (isEditingDiyType) {
      // 编辑现有分类
      const index = newDiyTypes.findIndex(item => item.id === editDiyTypeId);
      if (index > -1) {
        newDiyTypes[index] = { ...tempDiyType, id: editDiyTypeId };
      }
    } else {
      // 添加新分类
      const newId = Date.now().toString();
      newDiyTypes.push({ ...tempDiyType, id: newId });
      
      // 如果是第一个分类，自动选中
      if (newDiyTypes.length === 1) {
        this.setData({
          currentDiyTypeId: newId
        });
      }
    }
    
    // 按sort排序
    newDiyTypes.sort((a, b) => a.sort - b.sort);
    
    this.setData({
      diyTypes: newDiyTypes,
      showDiyTypeModal: false
    });
    
    wx.showToast({
      title: isEditingDiyType ? '编辑成功' : '添加成功',
      icon: 'success'
    });
  },
  
  // 删除DIY酒料分类
  deleteDiyType: function() {
    const { editDiyTypeId, diyTypes, diyIngredients } = this.data;
    
    // 过滤掉要删除的分类
    const newDiyTypes = diyTypes.filter(item => item.id !== editDiyTypeId);
    
    // 过滤掉该分类下的所有DIY酒料
    const newDiyIngredients = diyIngredients.filter(item => item.typeId !== editDiyTypeId);
    
    // 选中第一个分类，若没有分类则置空
    const nextDiyTypeId = newDiyTypes.length > 0 ? newDiyTypes[0].id : '';
    
    this.setData({
      diyTypes: newDiyTypes,
      diyIngredients: newDiyIngredients,
      currentDiyTypeId: nextDiyTypeId,
      showDeleteDiyTypeModal: false
    });
    
    // 重新筛选DIY酒料
    if (nextDiyTypeId) {
      this.filterDiyIngredients(nextDiyTypeId);
    } else {
      this.setData({
        filteredDiyIngredients: []
      });
    }
    
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });
  },
  
  // 打开添加DIY酒料模态框
  openAddDiyIngredientModal: function() {
    const typeId = this.data.currentDiyTypeId;
    
    if (!typeId) {
      wx.showToast({
        title: '请先选择或创建一个分类',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      showDiyIngredientModal: true,
      isEditingDiyIngredient: false,
      tempDiyIngredient: {
        id: '',
        typeId: typeId,
        name: '',
        description: '',
        price: 0,
        unit: '份',
        image: '',
        sort: 0,
        isRecommended: false,
        isAvailable: true
      }
    });
  },
  
  // 打开编辑DIY酒料模态框
  openEditDiyIngredientModal: function(e) {
    const ingredientId = e.currentTarget.dataset.id;
    const ingredient = this.data.diyIngredients.find(item => item.id === ingredientId);
    
    if (ingredient) {
      this.setData({
        showDiyIngredientModal: true,
        isEditingDiyIngredient: true,
        editDiyIngredientId: ingredientId,
        tempDiyIngredient: { ...ingredient }
      });
    }
  },
  
  // 关闭DIY酒料模态框
  closeDiyIngredientModal: function() {
    this.setData({
      showDiyIngredientModal: false
    });
  },
  
  // 打开删除DIY酒料确认框
  openDeleteDiyIngredientModal: function(e) {
    const ingredientId = e.currentTarget.dataset.id;
    
    this.setData({
      showDeleteDiyIngredientModal: true,
      editDiyIngredientId: ingredientId
    });
  },
  
  // 关闭删除DIY酒料确认框
  closeDeleteDiyIngredientModal: function() {
    this.setData({
      showDeleteDiyIngredientModal: false
    });
  },
  
  // 上传DIY酒料图片
  uploadDiyIngredientImage: function() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        // 实际项目中应上传到服务器，这里直接使用临时路径
        that.setData({
          'tempDiyIngredient.image': res.tempFilePaths[0]
        });
      }
    });
  },
  
  // 保存DIY酒料
  saveDiyIngredient: function() {
    const { tempDiyIngredient, isEditingDiyIngredient, editDiyIngredientId, diyIngredients, currentDiyTypeId } = this.data;
    
    if (!tempDiyIngredient.name) {
      wx.showToast({
        title: '请输入酒料名称',
        icon: 'none'
      });
      return;
    }
    
    let newDiyIngredients = [...diyIngredients];
    
    if (isEditingDiyIngredient) {
      // 编辑现有DIY酒料
      const index = newDiyIngredients.findIndex(item => item.id === editDiyIngredientId);
      if (index > -1) {
        newDiyIngredients[index] = { ...tempDiyIngredient, id: editDiyIngredientId };
      }
    } else {
      // 添加新DIY酒料
      const newId = Date.now().toString();
      newDiyIngredients.push({ ...tempDiyIngredient, id: newId, typeId: currentDiyTypeId });
    }
    
    this.setData({
      diyIngredients: newDiyIngredients,
      showDiyIngredientModal: false
    });
    
    // 重新筛选当前分类下的DIY酒料
    this.filterDiyIngredients(currentDiyTypeId);
    
    wx.showToast({
      title: isEditingDiyIngredient ? '编辑成功' : '添加成功',
      icon: 'success'
    });
  },
  
  // 删除DIY酒料
  deleteDiyIngredient: function() {
    const { editDiyIngredientId, diyIngredients, currentDiyTypeId } = this.data;
    
    // 过滤掉要删除的DIY酒料
    const newDiyIngredients = diyIngredients.filter(item => item.id !== editDiyIngredientId);
    
    this.setData({
      diyIngredients: newDiyIngredients,
      showDeleteDiyIngredientModal: false
    });
    
    // 重新筛选当前分类下的DIY酒料
    this.filterDiyIngredients(currentDiyTypeId);
    
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });
  },
  
  // DIY酒料表单字段绑定
  onDiyTypeNameInput: function(e) {
    this.setData({
      'tempDiyType.name': e.detail.value
    });
  },
  
  onDiyTypeSortInput: function(e) {
    this.setData({
      'tempDiyType.sort': parseInt(e.detail.value) || 0
    });
  },
  
  onDiyIngredientNameInput: function(e) {
    this.setData({
      'tempDiyIngredient.name': e.detail.value
    });
  },
  
  onDiyIngredientDescInput: function(e) {
    this.setData({
      'tempDiyIngredient.description': e.detail.value
    });
  },
  
  onDiyIngredientPriceInput: function(e) {
    this.setData({
      'tempDiyIngredient.price': parseFloat(e.detail.value) || 0
    });
  },
  
  onDiyIngredientUnitInput: function(e) {
    this.setData({
      'tempDiyIngredient.unit': e.detail.value
    });
  },
  
  onDiyIngredientSortInput: function(e) {
    this.setData({
      'tempDiyIngredient.sort': parseInt(e.detail.value) || 0
    });
  },
  
  onDiyIngredientRecommendedChange: function(e) {
    this.setData({
      'tempDiyIngredient.isRecommended': e.detail.value
    });
  },
  
  onDiyIngredientAvailableChange: function(e) {
    this.setData({
      'tempDiyIngredient.isAvailable': e.detail.value
    });
  },
  
  // 返回上一页
  navigateBack: function() {
    // 防止直接退出小程序
    try {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        // 如果有上一页，则正常返回
        wx.navigateBack({
          delta: 1
        });
      } else {
        // 如果没有上一页，则跳转到首页(个人中心)
        // 使用reLaunch而不是switchTab，避免某些情况下的兼容性问题
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/profile/profile'
          });
        }, 100);
      }
    } catch (error) {
      console.error('导航返回出错:', error);
      // 发生错误时，延迟一下再跳转，避免连续跳转导致的问题
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/profile/profile'
        });
      }, 200);
    }
  }
}) 