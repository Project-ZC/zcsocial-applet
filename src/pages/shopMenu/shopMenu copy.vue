<template>
  <view class="container">
    <!-- 顶部菜单栏 -->
    <view class="menu-tabs">
      <view class="menu-tab" :class="{ 'active': state.menuType === 'regular' }" @click="switchMenuType('regular')">常规酒单</view>
      <view class="menu-tab" :class="{ 'active': state.menuType === 'diy' }" @click="switchMenuType('diy')">DIY酒料</view>
    </view>

    <!-- 常规酒单内容 -->
    <block v-if="state.menuType === 'regular'">
      <!-- 分类导航 -->
      <view class="categories-nav">
        <scroll-view class="categories-scroll" scroll-x="true" enhanced="true" show-scrollbar="false">
          <view 
            class="category-item" 
            v-for="(item, index) in state.categories" 
            :key="item.id"
            :class="{ 'active': state.currentCategoryId === item.id }" 
            @click="switchCategory(item.id)"
          >
            {{ item.name }}
          </view>
        </scroll-view>
        <view class="category-actions" v-if="state.categories.length > 0">
          <view class="action-btn edit-category-btn" @click="openEditCategoryModal">
            <!-- <image src="/static/images/icons/edit.png" mode="aspectFit"></image> -->
            <u-icon name="plus-circle-fill" size="26"></u-icon>
          </view>
          <view class="action-btn delete-category-btn" @click="openDeleteCategoryModal">
            <!-- <image src="/static/images/icons/delete.png" mode="aspectFit"></image> -->
            <u-icon name="minus-circle-fill" size="26"></u-icon>
          </view>
        </view>
      </view>

      <!-- 酒水列表 -->
      <view class="drink-list" v-if="filteredDrinks.length > 0">
        <view class="drink-item" v-for="(item, index) in filteredDrinks" :key="item.id">
          <view class="drink-info">
            <image class="drink-image" :src="item.image || '/static/images/default-drink.png'" mode="aspectFill"></image>
            <view class="drink-detail">
              <view class="drink-name-row">
                <text class="drink-name">{{ item.name }}</text>
                <text class="drink-badge" v-if="item.isRecommended">推荐</text>
              </view>
              <view class="drink-desc">{{ item.description || '暂无描述' }}</view>
              <view class="drink-price-row">
                <text class="drink-price">¥{{ item.price }}</text>
                <text class="drink-original-price" v-if="item.originalPrice && item.originalPrice > item.price">¥{{ item.originalPrice }}</text>
              </view>
            </view>
          </view>
          <view class="drink-actions">
            <u-button  type="warning" class="edit-btn"  plain shape="circle" @click="openEditDrinkModal(item.id)">编辑</u-button>
            <u-button type="error" class="delete-btn"   plain shape="circle" @click="openDeleteDrinkModal(item.id)">删除</u-button>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else-if="state.currentCategoryId && state.categories.length > 0">
        <image src="/static/images/empty-drinks.png" mode="aspectFit"></image>
        <text>当前分类还没有酒水</text>
        <u-button class="add-drink-btn" @click="openAddDrinkModal">添加酒水</u-button>
      </view>

      <view class="empty-state" v-else-if="state.categories.length === 0">
        <image src="/static/images/empty-category.png" mode="aspectFit"></image>
        <text>还没有创建分类</text>
        <u-button class="add-category-btn" @click="openAddCategoryModal">创建分类</u-button>
      </view>

      <!-- 添加按钮 -->
      <view class="floating-btn" @click="openAddDrinkModal" v-if="state.currentCategoryId && state.categories.length > 0">
        <!-- <image src="/static/images/icons/add-white.png" mode="aspectFit"></image> -->
          <u-icon name="plus" size="32" color="#fff"></u-icon>
      </view>
    </block>

    <!-- DIY酒料管理内容 -->
    <block v-if="state.menuType === 'diy'">
      <!-- DIY酒料分类导航 -->
      <view class="categories-nav">
        <scroll-view class="categories-scroll" scroll-x="true" enhanced="true" show-scrollbar="false">
          <view 
            class="category-item" 
            v-for="(item, index) in state.diyTypes" 
            :key="item.id"
            :class="{ 'active': state.currentDiyTypeId === item.id }" 
            @click="switchDiyType(item.id)"
          >
            {{ item.name }}
          </view>
        </scroll-view>
        <view class="category-actions" v-if="state.diyTypes.length > 0">
          <view class="action-btn edit-category-btn" @click="openEditDiyTypeModal">
            <!-- <image src="/static/images/icons/edit.png" mode="aspectFit"></image> -->
            <u-icon name="plus-circle-fill" size="26"></u-icon>
          </view>
          <view class="action-btn delete-category-btn" @click="openDeleteDiyTypeModal">
            <!-- <image src="/static/images/icons/delete.png" mode="aspectFit"></image> -->
            <u-icon name="minus-circle-fill" size="26"></u-icon>
          </view>
        </view>
      </view>

      <!-- DIY酒料列表 -->
      <view class="diy-list" v-if="filteredDiyIngredients.length > 0">
        <view class="diy-item" v-for="(item, index) in filteredDiyIngredients" :key="item.id">
          <view class="diy-info">
            <image class="diy-image" :src="item.image || '/static/images/default-ingredient.png'" mode="aspectFill"></image>
            <view class="diy-detail">
              <view class="diy-name-row">
                <text class="diy-name">{{ item.name }}</text>
              </view>
              <view class="diy-desc">{{ item.description || '暂无描述' }}</view>
              <view class="diy-price-row" v-if="item.price > 0">
                <text class="diy-price">¥{{ item.price }}</text>
                <text class="diy-unit">/{{ item.unit }}</text>
              </view>
            </view>
          </view>
          <view class="diy-actions">
            <view class="edit-btn" @click="openEditDiyIngredientModal(item.id)">编辑</view>
            <view class="delete-btn" @click="openDeleteDiyIngredientModal(item.id)">删除</view>
          </view>
        </view>
      </view>

      <!-- DIY酒料空状态 -->
      <view class="empty-state" v-else-if="state.currentDiyTypeId && state.diyTypes.length > 0">
        <image src="/static/images/empty-ingredients.png" mode="aspectFit"></image>
        <text>当前分类还没有酒料</text>
        <u-button class="add-diy-btn" @click="openAddDiyIngredientModal">添加酒料</u-button>
      </view>

      <view class="empty-state" v-else-if="state.diyTypes.length === 0">
        <image src="/static/images/empty-category.png" mode="aspectFit"></image>
        <text>还没有创建DIY酒料分类</text>
        <u-button class="add-category-btn" @click="openAddDiyTypeModal">创建酒料分类</u-button>
      </view>

      <!-- 添加DIY酒料按钮 -->
      <view class="floating-btn" @click="openAddDiyIngredientModal" v-if="state.currentDiyTypeId && state.diyTypes.length > 0">
        <image src="/static/images/icons/add-white.png" mode="aspectFit"></image>
      </view>
    </block>

    <!-- 分类模态框 -->
    <u-popup :show="state.showCategoryModal" mode="center" @close="closeCategoryModal">
      <view class="z-modal-lg z-modal ">
        <view class="modal-header">
          <text>{{ state.isEditingCategory ? '编辑分类' : '添加分类' }}</text>
          <view class="close-btn" @click="closeCategoryModal">×</view>
        </view>
        <view class="modal-body">
          <view class="form-group">
            <label>分类名称</label>
            <u-input v-model="state.tempCategory.name" placeholder="请输入分类名称" />
          </view>
          <view class="form-group">
            <label>排序 (数字越小排序越靠前)</label>
            <u-input v-model.number="state.tempCategory.sort" placeholder="请输入排序数字" type="number" />
          </view>
        </view>
        <view class="modal-footer">
          <u-button @click="closeCategoryModal">取消</u-button>
          <u-button type="primary" @click="saveCategory">确定</u-button>
        </view>
      </view>
    </u-popup>

    <!-- DIY酒料分类模态框 -->
    <u-popup :show="state.showDiyTypeModal" mode="center" @close="closeDiyTypeModal">
      <view class="z-modal-lg z-modal">
        <view class="modal-header">
          <text>{{ state.isEditingDiyType ? '编辑酒料分类' : '添加酒料分类' }}</text>
          <view class="close-btn" @click="closeDiyTypeModal">×</view>
        </view>
        <view class="modal-body">
          <view class="form-group">
            <label>分类名称</label>
            <u-input v-model="state.tempDiyType.name" placeholder="请输入分类名称" />
          </view>
          <view class="form-group">
            <label>排序 (数字越小排序越靠前)</label>
            <u-input v-model.number="state.tempDiyType.sort" placeholder="请输入排序数字" type="number" />
          </view>
        </view>
        <view class="modal-footer">
          <u-button class="cancel-btn" @click="closeDiyTypeModal">取消</u-button>
          <u-button class="confirm-btn" @click="saveDiyType">确定</u-button>
        </view>
      </view>
    </u-popup>

    <!-- 酒水模态框 -->
    <u-popup :show="state.showDrinkModal" mode="center" @close="closeDrinkModal">
      <view class="z-modal-lg z-modal">
        <view class="modal-header">
          <text>{{ state.isEditingDrink ? '编辑酒水' : '添加酒水' }}</text>
          <view class="close-btn" @click="closeDrinkModal">×</view>
        </view>
        <view class="modal-body">
          <view class="image-upload" @click="uploadDrinkImage">
            <image 
              class="drink-image-preview" 
              :src="state.tempDrink.image || '/static/images/default-drink.png'" 
              mode="aspectFill"
            ></image>
            <view class="upload-icon">
              <!-- <image src="/static/images/icons/camera.png" mode="aspectFit"></image> -->
            </view>
          </view>

          <view class="form-group">
            <label>酒水名称</label>
            <u-input v-model="state.tempDrink.name" placeholder="请输入酒水名称" />
          </view>

          <view class="form-group">
            <label>描述</label>
            <u-input v-model="state.tempDrink.description" type="textarea" placeholder="请输入酒水描述" />
          </view>

          <view class="form-group">
            <label>价格 (元)</label>
            <u-input v-model.number="state.tempDrink.price" placeholder="请输入价格" type="number" />
          </view>

          <view class="form-group">
            <label>原价 (元，可选)</label>
            <u-input v-model.number="state.tempDrink.originalPrice" placeholder="请输入原价" type="number" />
          </view>

          <view class="form-group">
            <label>排序 (数字越小排序越靠前)</label>
            <u-input v-model.number="state.tempDrink.sort" placeholder="请输入排序数字" type="number" />
          </view>

          <view class="form-group switch-group">
            <label>推荐酒水</label>
            <u-switch v-model="state.tempDrink.isRecommended" active-color="#1989fa"></u-switch>
          </view>

          <view class="form-group switch-group">
            <label>上架状态</label>
            <u-switch v-model="state.tempDrink.isAvailable" active-color="#1989fa"></u-switch>
          </view>

          <view class="form-group switch-group">
            <label>启用点单制</label>
            <u-switch v-model="state.tempDrink.enableOrdering" active-color="#1989fa"></u-switch>
          </view>
          <view class="form-tip">
            <text class="tip-text">开启后，顾客可以通过扫码点单选择此酒水</text>
          </view>
        </view>
        <view class="modal-footer">
          <u-button  @click="closeDrinkModal">取消</u-button>
          <u-button  type="primary" @click="saveDrink">确定</u-button>
        </view>
      </view>
    </u-popup>

    <!-- DIY酒料模态框 -->
    <u-popup :show="state.showDiyIngredientModal" mode="center" @close="closeDiyIngredientModal">
      <view class="z-modal-lg z-modal">
        <view class="modal-header">
          <text>{{ state.isEditingDiyIngredient ? '编辑酒料' : '添加酒料' }}</text>
          <view class="close-btn" @click="closeDiyIngredientModal">×</view>
        </view>
        <view class="modal-body">
          <view class="image-upload" @click="uploadDiyIngredientImage">
            <image 
              class="drink-image-preview" 
              :src="state.tempDiyIngredient.image || '/static/images/default-ingredient.png'" 
              mode="aspectFill"
            ></image>
            <view class="upload-icon">
              <image src="/static/images/icons/camera.png" mode="aspectFit"></image>
            </view>
          </view>

          <view class="form-group">
            <label>酒料名称</label>
            <u-input v-model="state.tempDiyIngredient.name" placeholder="请输入酒料名称" />
          </view>

          <view class="form-group">
            <label>描述</label>
            <u-input v-model="state.tempDiyIngredient.description" type="textarea" placeholder="请输入酒料描述" />
          </view>

          <view class="form-group">
            <label>附加价格 (元，可选)</label>
            <u-input v-model.number="state.tempDiyIngredient.price" placeholder="请输入附加价格，0表示免费" type="number" />
          </view>

          <view class="form-group">
            <label>计量单位</label>
            <u-input v-model="state.tempDiyIngredient.unit" placeholder="例如：份、杯、瓶等" />
          </view>

          <view class="form-group">
            <label>排序 (数字越小排序越靠前)</label>
            <u-input v-model.number="state.tempDiyIngredient.sort" placeholder="请输入排序数字" type="number" />
          </view>

          <view class="form-group switch-group">
            <label>推荐酒料</label>
            <u-switch v-model="state.tempDiyIngredient.isRecommended" active-color="#1989fa"></u-switch>
          </view>

          <view class="form-group switch-group">
            <label>上架状态</label>
            <u-switch v-model="state.tempDiyIngredient.isAvailable" active-color="#1989fa"></u-switch>
          </view>
        </view>
        <view class="modal-footer">
          <u-button class="cancel-btn" @click="closeDiyIngredientModal">取消</u-button>
          <u-button class="confirm-btn" @click="saveDiyIngredient">确定</u-button>
        </view>
      </view>
    </u-popup>

    <!-- 删除分类确认模态框 -->
    <u-modal :show="state.showDeleteCategoryModal" @cancel="closeDeleteCategoryModal" @confirm="deleteCategory" showCancelButton title="提示" 
    content='删除分类将同时删除该分类下的所有酒水，此操作不可恢复，确定要删除吗？'></u-modal>
    

    <!-- 删除DIY酒料分类确认模态框 -->
    <u-modal :show="state.showDeleteDiyTypeModal" @cancel="closeDeleteDiyTypeModal" @confirm="deleteDiyType" showCancelButton title="提示" 
    content='删除分类将同时删除该分类下的所有DIY酒料，此操作不可恢复，确定要删除吗？'></u-modal>

    <!-- 删除酒水确认模态框 -->
    <u-modal :show="state.showDeleteDrinkModal" @cancel="closeDeleteDrinkModal" @confirm="deleteDrink" showCancelButton title="提示" 
    content='删除酒水后将无法恢复，确定要删除吗？'></u-modal>

    <!-- 删除DIY酒料确认模态框 -->
    <u-modal :show="state.showDeleteDiyIngredientModal" @cancel="closeDeleteDiyIngredientModal" @confirm="deleteDiyIngredient" showCancelButton title="提示" 
    content='删除酒料后将无法恢复，确定要删除吗？'></u-modal>
  </view> 
</template>

<script lang="ts" setup>
import { reactive, computed, onMounted } from "vue";

// 定义组件选项
defineOptions({
  name: "ShopMenuPage",
});

// 定义接口类型
interface Drink {
  id: string;
  name: string;
  image: string;
  description: string;
  price: number;
  originalPrice: number;
  sort: number;
  isRecommended: boolean;
  isAvailable: boolean;
  enableOrdering: boolean;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  sort: number;
  drinks: Drink[];
}

interface DiyIngredient {
  id: string;
  name: string;
  image: string;
  description: string;
  price: number;
  unit: string;
  sort: number;
  isRecommended: boolean;
  isAvailable: boolean;
  diyTypeId: string;
}

interface DiyType {
  id: string;
  name: string;
  sort: number;
  ingredients: DiyIngredient[];
}

// 状态管理
const state = reactive({
  menuType: 'regular' as 'regular' | 'diy',
  categories: [
    {
      id: '1',
      name: '鸡尾酒',
      sort: 1,
      drinks: [
        {
          id: '101',
          name: '玛格丽塔',
          image: '/static/logo.png',
          description: '经典柑橘风味，酸甜平衡',
          price: 48,
          originalPrice: 58,
          sort: 1,
          isRecommended: true,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '1'
        },
        {
          id: '102',
          name: '莫吉托',
          image: '/static/logo.png',
          description: '清新薄荷与朗姆酒的完美结合',
          price: 45,
          originalPrice: 0,
          sort: 2,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '1'
        },
        {
          id: '103',
          name: '老式鸡尾酒',
          image: '/static/logo.png',
          description: '威士忌基底，经典苦味',
          price: 52,
          originalPrice: 0,
          sort: 3,
          isRecommended: false,
          isAvailable: false,
          enableOrdering: false,
          categoryId: '1'
        },
        {
          id: '104',
          name: '曼哈顿',
          image: '/static/logo.png',
          description: '威士忌与甜苦艾酒的优雅融合',
          price: 55,
          originalPrice: 0,
          sort: 4,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '1'
        },
        {
          id: '105',
          name: '皮纳科拉达',
          image: '/static/logo.png',
          description: '椰子与菠萝的热带风情',
          price: 48,
          originalPrice: 0,
          sort: 5,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '1'
        },
        {
          id: '106',
          name: '蓝色夏威夷',
          image: '/static/logo.png',
          description: '蓝色库拉索与柑橘的奇妙组合',
          price: 50,
          originalPrice: 0,
          sort: 6,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '1'
        },
        {
          id: '107',
          name: '长岛冰茶',
          image: '/static/logo.png',
          description: '多种烈酒混合，强劲有力',
          price: 58,
          originalPrice: 0,
          sort: 7,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '1'
        },
        {
          id: '108',
          name: '血腥玛丽',
          image: '/static/logo.png',
          description: '番茄汁与伏特加的独特风味',
          price: 45,
          originalPrice: 0,
          sort: 8,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '1'
        }
      ]
    },
    {
      id: '2',
      name: '威士忌',
      sort: 2,
      drinks: [
        {
          id: '201',
          name: '杰克丹尼',
          image: '/static/logo.png',
          description: '美国田纳西州经典威士忌',
          price: 68,
          originalPrice: 0,
          sort: 1,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '2'
        },
        {
          id: '202',
          name: '占边',
          image: '/static/logo.png',
          description: '经典波本威士忌',
          price: 65,
          originalPrice: 0,
          sort: 2,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '2'
        },
        {
          id: '203',
          name: '格兰菲迪12年',
          image: '/static/logo.png',
          description: '苏格兰单一麦芽威士忌',
          price: 88,
          originalPrice: 0,
          sort: 3,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '2'
        },
        {
          id: '204',
          name: '麦卡伦12年',
          image: '/static/logo.png',
          description: '雪莉桶陈酿，口感丰富',
          price: 98,
          originalPrice: 0,
          sort: 4,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '2'
        },
        {
          id: '205',
          name: '山崎',
          image: '/static/logo.png',
          description: '日本威士忌代表作',
          price: 108,
          originalPrice: 0,
          sort: 5,
          isRecommended: false,
          isAvailable: false,
          enableOrdering: false,
          categoryId: '2'
        }
      ]
    },
    {
      id: '3',
      name: '啤酒',
      sort: 3,
      drinks: [
        {
          id: '301',
          name: '百威',
          image: '/static/logo.png',
          description: '美国经典拉格啤酒',
          price: 28,
          originalPrice: 0,
          sort: 1,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '3'
        },
        {
          id: '302',
          name: '科罗娜',
          image: '/static/logo.png',
          description: '墨西哥清爽啤酒，搭配柠檬',
          price: 30,
          originalPrice: 0,
          sort: 2,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '3'
        },
        {
          id: '303',
          name: '喜力',
          image: '/static/logo.png',
          description: '荷兰优质拉格啤酒',
          price: 32,
          originalPrice: 0,
          sort: 3,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '3'
        },
        {
          id: '304',
          name: '青岛',
          image: '/static/logo.png',
          description: '中国经典啤酒',
          price: 25,
          originalPrice: 0,
          sort: 4,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '3'
        },
        {
          id: '305',
          name: '鹅岛IPA',
          image: '/static/logo.png',
          description: '美国精酿IPA，浓郁啤酒花香',
          price: 38,
          originalPrice: 0,
          sort: 5,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '3'
        },
        {
          id: '306',
          name: '凯旋1664白啤',
          image: '/static/logo.png',
          description: '法国小麦啤酒，果香浓郁',
          price: 35,
          originalPrice: 0,
          sort: 6,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '3'
        }
      ]
    },
    {
      id: '4',
      name: '葡萄酒',
      sort: 4,
      drinks: [
        {
          id: '401',
          name: '拉菲传奇波尔多红',
          image: '/static/logo.png',
          description: '法国波尔多经典红酒',
          price: 88,
          originalPrice: 0,
          sort: 1,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '4'
        },
        {
          id: '402',
          name: '黄尾袋鼠西拉',
          image: '/static/logo.png',
          description: '澳大利亚果香型红酒',
          price: 78,
          originalPrice: 0,
          sort: 2,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '4'
        },
        {
          id: '403',
          name: '桑塔丽塔珍藏霞多丽',
          image: '/static/logo.png',
          description: '智利清爽白葡萄酒',
          price: 75,
          originalPrice: 0,
          sort: 3,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '4'
        },
        {
          id: '404',
          name: '卡斯特罗起泡酒',
          image: '/static/logo.png',
          description: '西班牙清爽起泡酒',
          price: 68,
          originalPrice: 0,
          sort: 4,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '4'
        }
      ]
    },
    {
      id: '5',
      name: '清酒',
      sort: 5,
      drinks: [
        {
          id: '501',
          name: '月桂冠',
          image: '/static/logo.png',
          description: '日本传统清酒',
          price: 58,
          originalPrice: 0,
          sort: 1,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '5'
        },
        {
          id: '502',
          name: '獭祭二割三分',
          image: '/static/logo.png',
          description: '日本顶级大吟酿',
          price: 128,
          originalPrice: 0,
          sort: 2,
          isRecommended: false,
          isAvailable: false,
          enableOrdering: false,
          categoryId: '5'
        },
        {
          id: '503',
          name: '白鹤银笺',
          image: '/static/logo.png',
          description: '口感清爽，适合搭配海鲜',
          price: 68,
          originalPrice: 0,
          sort: 3,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '5'
        }
      ]
    },
    {
      id: '6',
      name: '无酒精饮品',
      sort: 6,
      drinks: [
        {
          id: '601',
          name: '可口可乐',
          image: '/static/logo.png',
          description: '经典碳酸饮料',
          price: 15,
          originalPrice: 0,
          sort: 1,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '6'
        },
        {
          id: '602',
          name: '雪碧',
          image: '/static/logo.png',
          description: '柠檬风味碳酸饮料',
          price: 15,
          originalPrice: 0,
          sort: 2,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '6'
        },
        {
          id: '603',
          name: '椰树牌椰汁',
          image: '/static/logo.png',
          description: '天然椰子汁',
          price: 18,
          originalPrice: 0,
          sort: 3,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '6'
        },
        {
          id: '604',
          name: '巴黎水',
          image: '/static/logo.png',
          description: '天然气泡矿泉水',
          price: 22,
          originalPrice: 0,
          sort: 4,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '6'
        },
        {
          id: '605',
          name: '鲜榨橙汁',
          image: '/static/logo.png',
          description: '现场鲜榨，富含维生素C',
          price: 28,
          originalPrice: 0,
          sort: 5,
          isRecommended: false,
          isAvailable: true,
          enableOrdering: true,
          categoryId: '6'
        }
      ]
    }
  ] as Category[],
  currentCategoryId: '1',
  diyTypes:  [
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
    ] as DiyType[],
  currentDiyTypeId: '',
  showCategoryModal: false,
  isEditingCategory: false,
  tempCategory: {
    id: '',
    name: '',
    sort: 0
  },
  showDiyTypeModal: false,
  isEditingDiyType: false,
  tempDiyType: {
    id: '',
    name: '',
    sort: 0
  },
  showDrinkModal: false,
  isEditingDrink: false,
  tempDrink: {
    id: '',
    name: '',
    image: '',
    description: '',
    price: 0,
    originalPrice: 0,
    sort: 0,
    isRecommended: false,
    isAvailable: true,
    enableOrdering: true,
    categoryId: '1'
  } as Drink,
  showDiyIngredientModal: false,
  isEditingDiyIngredient: false,
  tempDiyIngredient: {
    id: '',
    name: '',
    image: '',
    description: '',
    price: 0,
    unit: '份',
    sort: 0,
    isRecommended: false,
    isAvailable: true,
    diyTypeId: ''
  } as DiyIngredient,
  showDeleteCategoryModal: false,
  showDeleteDiyTypeModal: false,
  showDeleteDrinkModal: false,
  deleteDrinkId: '',
  showDeleteDiyIngredientModal: false,
  deleteDiyIngredientId: ''
});

// 计算属性
const filteredDrinks = computed(() => {
  const category = state.categories.find(cat => cat.id === state.currentCategoryId);
  return category ? category.drinks.sort((a, b) => a.sort - b.sort) : [];
});

const filteredDiyIngredients = computed(() => {
  const diyType = state.diyTypes.find(type => type.id === state.currentDiyTypeId);
  return diyType ? diyType.ingredients.sort((a, b) => a.sort - b.sort) : [];
});

// 生命周期钩子
onMounted(() => {
  // 初始化数据，如果需要从接口获取数据，可以在这里调用
  console.log('页面加载完成');
});

// 页面方法
const navigateBack = () => {
  uni.navigateBack();
};

const switchMenuType = (type: 'regular' | 'diy') => {
  state.menuType = type;
};

const switchCategory = (id: string) => {
  state.currentCategoryId = id;
};

const switchDiyType = (id: string) => {
  state.currentDiyTypeId = id;
};

const openAddCategoryModal = () => {
  state.isEditingCategory = false;
  state.tempCategory = {
    id: '',
    name: '',
    sort: 0
  };
  state.showCategoryModal = true;
};

const openEditCategoryModal = () => {
  const currentCategory = state.categories.find(cat => cat.id === state.currentCategoryId);
  if (currentCategory) {
    state.isEditingCategory = true;
    state.tempCategory = { ...currentCategory };
    state.showCategoryModal = true;
  }
};

const closeCategoryModal = () => {
  state.showCategoryModal = false;
};

const saveCategory = () => {
  if (!state.tempCategory.name) {
    uni.showToast({
      title: '请输入分类名称',
      icon: 'none'
    });
    return;
  }

  if (state.isEditingCategory) {
    const index = state.categories.findIndex(cat => cat.id === state.tempCategory.id);
    if (index !== -1) {
      state.categories[index] = { ...state.tempCategory, drinks: state.categories[index].drinks };
    }
  } else {
    const newCategory = {
      ...state.tempCategory,
      id: Date.now().toString(),
      drinks: []
    };
    state.categories.push(newCategory as Category);
    if (state.categories.length === 1) {
      state.currentCategoryId = newCategory.id;
    }
  }

  state.categories.sort((a, b) => a.sort - b.sort);
  state.showCategoryModal = false;
  uni.showToast({
    title: state.isEditingCategory ? '分类已更新' : '分类已添加',
    icon: 'success'
  });
};

const openDeleteCategoryModal = () => {
  state.showDeleteCategoryModal = true;
};

const closeDeleteCategoryModal = () => {
  state.showDeleteCategoryModal = false;
};

const deleteCategory = () => {
  const index = state.categories.findIndex(cat => cat.id === state.currentCategoryId);
  if (index !== -1) {
    state.categories.splice(index, 1);
    if (state.categories.length > 0) {
      state.currentCategoryId = state.categories[0].id;
    } else {
      state.currentCategoryId = '';
    }
  }
  state.showDeleteCategoryModal = false;
  uni.showToast({
    title: '分类已删除',
    icon: 'success'
  });
};

const openAddDrinkModal = () => {
  state.isEditingDrink = false;
  state.tempDrink = {
    id: '',
    name: '',
    image: '',
    description: '',
    price: 0,
    originalPrice: 0,
    sort: 0,
    isRecommended: false,
    isAvailable: true,
    enableOrdering: true,
    categoryId: state.currentCategoryId
  };
  state.showDrinkModal = true;
};

const openEditDrinkModal = (id: string) => {
  const category = state.categories.find(cat => cat.id === state.currentCategoryId);
  if (category) {
    const drink = category.drinks.find(d => d.id === id);
    if (drink) {
      state.isEditingDrink = true;
      state.tempDrink = { ...drink };
      state.showDrinkModal = true;
    }
  }
};

const closeDrinkModal = () => {
  state.showDrinkModal = false;
};

const saveDrink = () => {
  if (!state.tempDrink.name) {
    uni.showToast({
      title: '请输入酒水名称',
      icon: 'none'
    });
    return;
  }
  if (state.tempDrink.price <= 0) {
    uni.showToast({
      title: '价格必须大于0',
      icon: 'none'
    });
    return;
  }

  const categoryIndex = state.categories.findIndex(cat => cat.id === state.tempDrink.categoryId);
  if (categoryIndex !== -1) {
    if (state.isEditingDrink) {
      const drinkIndex = state.categories[categoryIndex].drinks.findIndex(d => d.id === state.tempDrink.id);
      if (drinkIndex !== -1) {
        state.categories[categoryIndex].drinks[drinkIndex] = { ...state.tempDrink };
      }
    } else {
      const newDrink = {
        ...state.tempDrink,
        id: Date.now().toString()
      };
      state.categories[categoryIndex].drinks.push(newDrink);
    }
    state.categories[categoryIndex].drinks.sort((a, b) => a.sort - b.sort);
  }

  state.showDrinkModal = false;
  uni.showToast({
    title: state.isEditingDrink ? '酒水已更新' : '酒水已添加',
    icon: 'success'
  });
};

const openDeleteDrinkModal = (id: string) => {
  state.deleteDrinkId = id;
  state.showDeleteDrinkModal = true;
};

const closeDeleteDrinkModal = () => {
  state.showDeleteDrinkModal = false;
  state.deleteDrinkId = '';
};

const deleteDrink = () => {
  const categoryIndex = state.categories.findIndex(cat => cat.id === state.currentCategoryId);
  if (categoryIndex !== -1) {
    const drinkIndex = state.categories[categoryIndex].drinks.findIndex(d => d.id === state.deleteDrinkId);
    if (drinkIndex !== -1) {
      state.categories[categoryIndex].drinks.splice(drinkIndex, 1);
    }
  }
  state.showDeleteDrinkModal = false;
  state.deleteDrinkId = '';
  uni.showToast({
    title: '酒水已删除',
    icon: 'success'
  });
};

const uploadDrinkImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      state.tempDrink.image = res.tempFilePaths[0];
    }
  });
};

const openAddDiyTypeModal = () => {
  state.isEditingDiyType = false;
  state.tempDiyType = {
    id: '',
    name: '',
    sort: 0
  };
  state.showDiyTypeModal = true;
};

const openEditDiyTypeModal = () => {
  const currentDiyType = state.diyTypes.find(type => type.id === state.currentDiyTypeId);
  if (currentDiyType) {
    state.isEditingDiyType = true;
    state.tempDiyType = { ...currentDiyType };
    state.showDiyTypeModal = true;
  }
};

const closeDiyTypeModal = () => {
  state.showDiyTypeModal = false;
};

const saveDiyType = () => {
  if (!state.tempDiyType.name) {
    uni.showToast({
      title: '请输入分类名称',
      icon: 'none'
    });
    return;
  }

  if (state.isEditingDiyType) {
    const index = state.diyTypes.findIndex(type => type.id === state.tempDiyType.id);
    if (index !== -1) {
      state.diyTypes[index] = { ...state.tempDiyType, ingredients: state.diyTypes[index].ingredients };
    }
  } else {
    const newDiyType = {
      ...state.tempDiyType,
      id: Date.now().toString(),
      ingredients: []
    };
    state.diyTypes.push(newDiyType as DiyType);
    if (state.diyTypes.length === 1) {
      state.currentDiyTypeId = newDiyType.id;
    }
  }

  state.diyTypes.sort((a, b) => a.sort - b.sort);
  state.showDiyTypeModal = false;
  uni.showToast({
    title: state.isEditingDiyType ? '分类已更新' : '分类已添加',
    icon: 'success'
  });
};

const openDeleteDiyTypeModal = () => {
  state.showDeleteDiyTypeModal = true;
};

const closeDeleteDiyTypeModal = () => {
  state.showDeleteDiyTypeModal = false;
};

const deleteDiyType = () => {
  const index = state.diyTypes.findIndex(type => type.id === state.currentDiyTypeId);
  if (index !== -1) {
    state.diyTypes.splice(index, 1);
    if (state.diyTypes.length > 0) {
      state.currentDiyTypeId = state.diyTypes[0].id;
    } else {
      state.currentDiyTypeId = '';
    }
  }
  state.showDeleteDiyTypeModal = false;
  uni.showToast({
    title: '分类已删除',
    icon: 'success'
  });
};

const openAddDiyIngredientModal = () => {
  state.isEditingDiyIngredient = false;
  state.tempDiyIngredient = {
    id: '',
    name: '',
    image: '',
    description: '',
    price: 0,
    unit: '份',
    sort: 0,
    isRecommended: false,
    isAvailable: true,
    diyTypeId: state.currentDiyTypeId
  };
  state.showDiyIngredientModal = true;
};

const openEditDiyIngredientModal = (id: string) => {
  const diyType = state.diyTypes.find(type => type.id === state.currentDiyTypeId);
  if (diyType) {
    const ingredient = diyType.ingredients.find(i => i.id === id);
    if (ingredient) {
      state.isEditingDiyIngredient = true;
      state.tempDiyIngredient = { ...ingredient };
      state.showDiyIngredientModal = true;
    }
  }
};

const closeDiyIngredientModal = () => {
  state.showDiyIngredientModal = false;
};

const saveDiyIngredient = () => {
  if (!state.tempDiyIngredient.name) {
    uni.showToast({
      title: '请输入酒料名称',
      icon: 'none'
    });
    return;
  }

  const diyTypeIndex = state.diyTypes.findIndex(type => type.id === state.tempDiyIngredient.diyTypeId);
  if (diyTypeIndex !== -1) {
    if (state.isEditingDiyIngredient) {
      const ingredientIndex = state.diyTypes[diyTypeIndex].ingredients.findIndex(i => i.id === state.tempDiyIngredient.id);
      if (ingredientIndex !== -1) {
        state.diyTypes[diyTypeIndex].ingredients[ingredientIndex] = { ...state.tempDiyIngredient };
      }
    } else {
      const newIngredient = {
        ...state.tempDiyIngredient,
        id: Date.now().toString()
      };
      state.diyTypes[diyTypeIndex].ingredients.push(newIngredient);
    }
    state.diyTypes[diyTypeIndex].ingredients.sort((a, b) => a.sort - b.sort);
  }

  state.showDiyIngredientModal = false;
  uni.showToast({
    title: state.isEditingDiyIngredient ? '酒料已更新' : '酒料已添加',
    icon: 'success'
  });
};

const openDeleteDiyIngredientModal = (id: string) => {
  state.deleteDiyIngredientId = id;
  state.showDeleteDiyIngredientModal = true;
};

const closeDeleteDiyIngredientModal = () => {
  state.showDeleteDiyIngredientModal = false;
  state.deleteDiyIngredientId = '';
};

const deleteDiyIngredient = () => {
  const diyTypeIndex = state.diyTypes.findIndex(type => type.id === state.currentDiyTypeId);
  if (diyTypeIndex !== -1) {
    const ingredientIndex = state.diyTypes[diyTypeIndex].ingredients.findIndex(i => i.id === state.deleteDiyIngredientId);
    if (ingredientIndex !== -1) {
      state.diyTypes[diyTypeIndex].ingredients.splice(ingredientIndex, 1);
    }
  }
  state.showDeleteDiyIngredientModal = false;
  state.deleteDiyIngredientId = '';
  uni.showToast({
    title: '酒料已删除',
    icon: 'success'
  });
};

const uploadDiyIngredientImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      state.tempDiyIngredient.image = res.tempFilePaths[0];
    }
  });
};
</script>

<style lang="scss" scoped>
.container {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn,
.add-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn image,
.add-btn image {
  width: 100%;
  height: 100%;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.menu-tabs {
  display: flex;
  margin-top: 10px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.menu-tab {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 14px;
  color: #666;
  position: relative;
  transition: all 0.3s;
}

.menu-tab.active {
  color: #1989fa;
  font-weight: bold;
}

.menu-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 2px;
  background-color: #1989fa;
  border-radius: 2px;
}

.categories-nav {
  display: flex;
  align-items: center;
  background-color: white;
  margin-top: 10px;
  padding: 0 10px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.categories-scroll {
  // flex: 1;
  width: 80%;
  white-space: nowrap;
  height: 44px;
}

.category-item {
  display: inline-block;
  padding: 12px 16px;
  font-size: 14px;
  color: #666;
  position: relative;
  transition: all 0.3s;
}

.category-item.active {
  color: #1989fa;
  font-weight: bold;
}

.category-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background-color: #1989fa;
  border-radius: 2px;
}

.category-actions {
  display: flex;
  align-items: center;
}

.action-btn {
  width: 24px;
  height: 24px;
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn image {
  width: 16px;
  height: 16px;
}

.drink-list,
.diy-list {
  margin-top: 10px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.drink-item,
.diy-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.drink-item:last-child,
.diy-item:last-child {
  border-bottom: none;
}

.drink-info,
.diy-info {
  display: flex;
  flex: 1;
}

.drink-image,
.diy-image {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  margin-right: 12px;
  background-color: #f5f5f5;
}

.drink-detail,
.diy-detail {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
}

.drink-name-row,
.diy-name-row {
  display: flex;
  align-items: center;
}

.drink-name,
.diy-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.drink-badge {
  font-size: 12px;
  color: white;
  background-color: #ff4545;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
}

.drink-desc,
.diy-desc {
  font-size: 12px;
  color: #999;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drink-price-row,
.diy-price-row {
  display: flex;
  align-items: center;
}

.drink-price,
.diy-price {
  font-size: 16px;
  font-weight: bold;
  color: #ff4545;
}

.drink-original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
  margin-left: 8px;
}

.diy-unit {
  font-size: 12px;
  color: #999;
}

.drink-actions,
.diy-actions {
  display: flex;
  align-items: center;

.edit-btn {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 15px;
  margin-right: 8px;
  width: 100rpx;
}

.delete-btn {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 15px;
  width: 100rpx;
}
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  background-color: white;
  margin-top: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  height: calc(100vh - 200px);
}

.empty-state image {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
}

.empty-state text {
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}

.add-drink-btn,
.add-diy-btn,
.add-category-btn {
  background-color: #1989fa;
  color: white;
  border: none;
  border-radius: 22px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
}

.floating-btn {
  position: fixed;
  bottom: 30px;
  right: 20px;
  width: 50px;
  height: 50px;
  background-color: #1989fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(25, 137, 250, 0.3);
  z-index: 99;
  cursor: pointer;
}

.floating-btn image {
  width: 24px;
  height: 24px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 5px;
  padding: 8px 20px;
  cursor: pointer;
  font-size: 14px;
}

.confirm-btn {
  background-color: #1989fa;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 20px;
  cursor: pointer;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  border: 1px solid #e5e5e5;
  border-radius: 5px;
  padding: 10px 15px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}

.form-group textarea {
  height: 80px;
  resize: none;
}

.switch-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.switch-group switch {
  transform: scale(0.8);
}

.form-tip {
  margin-top: -10px;
  margin-bottom: 20px;
}

.tip-text {
  font-size: 12px;
  color: #999;
}

.image-upload {
  width: 80px;
  height: 80px;
  position: relative;
  margin-bottom: 20px;
  cursor: pointer;
}

.drink-image-preview {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  background-color: #f5f5f5;
}

.upload-icon {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon image {
  width: 12px;
  height: 12px;
}

.confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-content {
  background-color: white;
  border-radius: 10px;
  width: 80%;
  max-width: 450px;
  padding: 20px;
}

.confirm-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 15px;
}

.confirm-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  text-align: center;
}

.confirm-btns {
  display: flex;
  justify-content: space-between;
}

.confirm-btns .cancel-btn {
  flex: 1;
  margin-right: 10px;
}

.delete-btn {
  flex: 1;
  background-color: #ff4545;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 20px;
  cursor: pointer;
  font-size: 14px;
}
</style>

