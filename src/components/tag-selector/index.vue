<template>
  <view class="tag-selector">
    <!-- 已选标签展示 -->
    <view class="selected-tags">
      <!-- <view class="tags-title">已选标签：</view> -->
      <view class="tags-container">
        <view
          class="tag-item selected"
          v-for="(tag, index) in selectedTags"
          :key="tag.id + tag.name + index"
          @click="removeTag(tag)"
        >
          <text class="tag-text">{{ tag.name }}</text>
          <up-icon name="close" size="12" color="#fff"></up-icon>
        </view>

        <view
          class="add-tag"
          @click="
            showInput = true;
            showAvailableTags = true;
          "
          v-if="!showInput && selectedTags.length < props.maxTags"
        >
          +
        </view>
      </view>
    </view>

    <!-- 标签输入/选择区域 -->
    <view class="tag-input-section">
      <!-- 输入框 -->
      <view class="tag-input-container" v-if="showInput && props.allowCustom">
        <view class="tag-input">
          <up-input
            v-model="inputValue"
            :focus="showInput"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
            @confirm="addCustomTag"
            placeholder="输入标签名称或选择已有标签"
            maxlength="10"
          />
        </view>
        <view class="add-btn">
          <up-button class="btn" type="primary" @click="addCustomTag" :disabled="!inputValue.trim()">添加</up-button>
        </view>
      </view>

      <!-- 可选标签列表 -->
      <view class="available-tags" v-if="showInput && showAvailableTags && availableTags.length > 0">
        <view class="tags-title">可选标签：</view>
        <view class="tags-container">
          <view
            class="tag-item available"
            v-for="tag in availableTags"
            :key="tag.id + tag.name"
            @click="selectTag(tag)"
          >
            <text class="tag-text">{{ tag.name }}</text>
            <up-icon name="plus" size="12" color="var(--primary-6)"></up-icon>
          </view>
        </view>
      </view>

      <!-- 搜索建议 -->
      <view class="search-suggestions" v-if="showSuggestions && filteredTags.length > 0">
        <view class="suggestions-title">搜索建议：</view>
        <view class="suggestions-list">
          <view class="suggestion-item" v-for="tag in filteredTags" :key="tag.id + tag.name" @click="selectTag(tag)">
            <text class="suggestion-text">{{ tag.name }}</text>
            <up-icon name="plus" size="12" color="var(--primary-6)"></up-icon>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<!-- <script lang="ts">
export default {
	options: { styleIsolation: "shared" },
};
</script> -->

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
// import { getTagList } from "@/api/common/dict";

interface Tag {
  id: string | number;
  name: string;
  [key: string]: any;
}

interface Props {
  tags?: Tag[]; // 可选标签列表
  selectedTags?: Tag[]; // 已选标签
  maxTags?: number; // 最大可选标签数
  allowCustom?: boolean; // 是否允许自定义输入
}

const props = withDefaults(defineProps<Props>(), {
  tags: () => [],
  selectedTags: () => [],
  maxTags: 10,
  allowCustom: true,
});

const emit = defineEmits<{
  'update:selectedTags': [tags: Tag[]];
  tagChange: [tags: Tag[]];
  tagAdd: [tag: Tag];
  tagRemove: [tag: Tag];
  focus: [];
  blur: [];
}>();

// 响应式数据
const inputValue = ref('');
const showInput = ref(false);
const showAvailableTags = ref(false);
const showSuggestions = ref(false);

// 计算属性
const availableTags = computed(() => {
  const selectedIds = props.selectedTags.map(tag => tag.name);
  return props.tags.filter(tag => !selectedIds.includes(tag.name));
});

const filteredTags = computed(() => {
  if (!inputValue.value.trim()) return [];
  const keyword = inputValue.value.toLowerCase();
  return availableTags.value.filter(tag => tag.name.toLowerCase().includes(keyword));
});

// 方法
const handleInputFocus = () => {
  showInput.value = true;
  showAvailableTags.value = true;
  showSuggestions.value = false;
  emit('focus');
};

const handleInputBlur = () => {
  setTimeout(() => {
    showInput.value = false;
    showAvailableTags.value = false;
    showSuggestions.value = false;
    inputValue.value = '';
    emit('blur');
  }, 200);
};

const selectTag = (tag: Tag) => {
  if (props.selectedTags.length >= props.maxTags) {
    uni.showToast({
      title: `最多只能选择${props.maxTags}个标签`,
      icon: 'none',
    });
    return;
  }

  const newSelectedTags = [...props.selectedTags, tag];
  emit('update:selectedTags', newSelectedTags);
  emit('tagChange', newSelectedTags);
  emit('tagAdd', tag);

  inputValue.value = '';
  showSuggestions.value = false;
  showInput.value = false;
};

const addCustomTag = () => {
  if (!props.allowCustom) {
    uni.showToast({
      title: '不允许自定义输入',
      icon: 'none',
    });
    return;
  }

  const tagName = inputValue.value.trim();
  if (!tagName) return;

  if (props.selectedTags.length >= props.maxTags) {
    uni.showToast({
      title: `最多只能选择${props.maxTags}个标签`,
      icon: 'none',
    });
    return;
  }

  // 检查是否已存在相同名称的标签
  const existingTag = props.selectedTags.find(tag => tag.name === tagName);
  if (existingTag) {
    uni.showToast({
      title: '标签已存在',
      icon: 'none',
    });
    return;
  }

  const newTag: Tag = {
    id: `custom_${Date.now()}`,
    name: tagName,
    isCustom: true,
  };

  const newSelectedTags = [...props.selectedTags, newTag];
  emit('update:selectedTags', newSelectedTags);
  emit('tagChange', newSelectedTags);
  emit('tagAdd', newTag);

  inputValue.value = '';
  showSuggestions.value = false;
};

const removeTag = (tag: Tag) => {
  const newSelectedTags = props.selectedTags.filter(t => t.name !== tag.name);
  emit('update:selectedTags', newSelectedTags);
  emit('tagChange', newSelectedTags);
  emit('tagRemove', tag);
};

// 监听输入值变化，显示搜索建议
watch(inputValue, newValue => {
  if (newValue.trim() && availableTags.value.length > 0) {
    showSuggestions.value = true;
    showAvailableTags.value = false;
  } else {
    showSuggestions.value = false;
    showAvailableTags.value = true;
  }
});

defineOptions({
  options: { styleIsolation: 'shared' },
});
</script>

<style lang="scss" scoped>
.test-btn ::v-deep .u-button {
  height: 208rpx !important;
}
.tag-selector {
  width: 100%;
  display: flex;
  flex-direction: column;

  .add-tag {
    width: 54rpx;
    height: 54rpx;
    background-color: #f0f0f0;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
    color: var(--text-3);
  }
  .selected-tags {
    margin-bottom: 10rpx;

    .tags-title {
      font-size: 28rpx;
      color: var(--text-2);
      margin-bottom: 12rpx;
      font-weight: 500;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
    }
  }

  .tag-input-section {
    width: 100%;
    .tag-input-container {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12rpx;
      .tag-input {
        flex: 1;
        // padding: 16rpx;
        font-size: 28rpx;

        .u-input {
          height: 68rpx;
          padding: 0 20rpx !important;
        }
      }
      .add-btn ::v-deep {
        flex-shrink: 0;
        width: 100rpx;
        .u-button {
          height: 68rpx !important;
        }
      }
    }
  }

  .available-tags,
  .search-suggestions {
    // margin-top: 16rpx;

    .tags-title,
    .suggestions-title {
      font-size: 26rpx;
      color: var(--text-3);
      margin: 8rpx 0;
    }

    .tags-container,
    .suggestions-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
    }
  }

  .tag-item,
  .suggestion-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    cursor: pointer;
    transition: all 0.3s ease;

    &.selected {
      background: var(--primary-6);
      color: #fff;

      &:active {
        transform: scale(0.95);
      }
    }

    &.available {
      background: var(--primary-1);
      color: var(--primary-6);
      border: 1px solid var(--primary-3);

      &:active {
        background: var(--primary-2);
        transform: scale(0.95);
      }
    }

    .tag-text {
      font-weight: 500;
    }
  }

  .suggestion-item {
    background: var(--fill-2);
    color: var(--text-2);
    border: 1px solid var(--border-1);

    &:active {
      background: var(--fill-3);
      transform: scale(0.95);
    }

    .suggestion-text {
      font-weight: 400;
    }
  }
}
</style>
