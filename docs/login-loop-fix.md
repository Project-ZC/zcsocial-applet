# 登录死循环问题修复说明

## 问题描述

在原有代码中，当接口返回登录过期错误（code: 1002）时，会触发以下循环：

1. `http.ts` 检测到 1002 错误码
2. 触发 `onAuthErrorCallback` 回调
3. `App.vue` 中的回调函数调用 `init()`
4. `init()` 调用 `userStore.login()`
5. `login()` 调用 `loginTo()` → `toLogin()` → `http()`
6. 如果还是 1002 错误，又回到步骤 1

这导致了无限循环的登录请求。

## 修复方案

### 1. 登录状态管理 (`src/utils/auth-manager.ts`)

创建了专门的登录状态管理器，防止重复登录：

```typescript
class AuthManager {
  private isLoggingIn = false;
  private loginPromise: Promise<any> | null = null;
  private retryCount = 0;
  private maxRetries = 3;

  // 检查是否正在登录
  isCurrentlyLoggingIn(): boolean;

  // 开始登录（防重复）
  startLogin(loginFunction: () => Promise<any>): Promise<any>;

  // 重置状态
  reset(): void;
}
```

**核心特性：**

- 防止同时发起多个登录请求
- 自动管理重试次数
- 超过重试上限时跳转登录页面
- Promise 复用机制

### 2. HTTP 模块优化 (`src/utils/http.ts`)

在原有的 HTTP 拦截器中添加了登录状态检查：

```typescript
// 检查是否正在登录中，避免重复登录
if (isLoggingIn) {
  console.log('正在登录中，将请求加入队列等待');
  addRequest(options).then(resolve).catch(reject);
  return;
}
```

**改进点：**

- 添加登录状态标记 `isLoggingIn`
- 登录中时将请求加入队列等待
- 登录成功后重新发送队列中的请求
- 超过重试次数时停止循环

### 3. App.vue 登录处理优化

使用新的登录状态管理器：

```typescript
const handleAuthError = async (error: any) => {
  // 检查是否已经在登录中
  if (isCurrentlyLoggingIn()) {
    console.log('正在登录中，跳过重复登录');
    return;
  }

  try {
    await startLogin(async () => {
      const result = await userStore.login();
      // 登录成功后通知http模块
      notifyLoginSuccess();
      return result;
    });
  } catch (loginError) {
    // 登录失败跳转登录页面
    uni.reLaunch({ url: '/pages/login/login' });
  }
};
```

### 4. User Store 优化 (`src/stores/modules/user.ts`)

改进了登录函数的错误处理：

```typescript
const login = async (data = {}) => {
  try {
    // 登录逻辑
    const res = await loginTo(data);
    const userInfo = { ...res, ...data };
    setUserInfo(userInfo);

    // 设置权限
    if (res.roleList || res.roleId) {
      setPerms(res);
    }

    return userInfo;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  } finally {
    uni.hideLoading();
  }
};
```

## 修复效果

### 修复前的问题：

- ❌ 登录过期时无限循环请求
- ❌ 多个登录请求同时发起
- ❌ 没有重试次数限制
- ❌ 错误处理不完善

### 修复后的效果：

- ✅ 防止重复登录请求
- ✅ 智能重试机制（最多 3 次）
- ✅ 登录状态统一管理
- ✅ 完善的错误处理和降级策略
- ✅ 超过重试次数自动跳转登录页面

## 使用方式

### 1. 自动处理（推荐）

登录过期时会自动处理，无需手动干预。

### 2. 手动检查登录状态

```typescript
import { isCurrentlyLoggingIn } from '@/utils/auth-manager';

if (isCurrentlyLoggingIn()) {
  console.log('正在登录中，请稍候');
}
```

### 3. 手动重置状态

```typescript
import { resetAuthManager } from '@/utils/auth-manager';

// 在需要时重置登录状态
resetAuthManager();
```

## 注意事项

1. **重试次数限制**：默认最多重试 3 次，超过后跳转登录页面
2. **状态持久化**：登录状态在页面刷新后会重置
3. **错误降级**：登录失败时会跳转到登录页面，确保用户体验
4. **队列机制**：登录过程中的请求会被加入队列，登录成功后重新发送

## 测试建议

1. **模拟登录过期**：修改 token 使其失效，观察重试机制
2. **网络异常测试**：在网络异常情况下测试登录流程
3. **并发请求测试**：同时发起多个需要登录的请求
4. **重试次数测试**：验证超过重试次数后的处理逻辑
