# 全局配置使用说明

## 概述

本项目使用统一的配置管理，支持多环境配置，方便在不同环境下使用不同的 API 地址。

## 配置文件结构

### 1. `src/config/env.ts` - 环境变量配置

```typescript
export const ENV_CONFIG = {
	development: {
		API_BASE_URL: "http://localhost:8080",
		API_TIMEOUT: 60000,
		DEBUG: true,
	},
	test: {
		API_BASE_URL: "http://test-api.example.com",
		API_TIMEOUT: 60000,
		DEBUG: true,
	},
	production: {
		API_BASE_URL: "http://115.190.120.193:8080",
		API_TIMEOUT: 60000,
		DEBUG: false,
	},
};
```

### 2. `src/config/index.ts` - 主配置文件

```typescript
import { api, app, env } from "@/config";

// 使用API配置
console.log(api.baseURL); // 当前环境的API地址
console.log(api.timeout); // 请求超时时间

// 使用应用配置
console.log(app.name); // 应用名称
console.log(app.version); // 应用版本

// 使用环境配置
console.log(env.isDev); // 是否为开发环境
console.log(env.isProd); // 是否为生产环境
```

## 使用方法

### 1. 在组件中使用

```typescript
import { api, env } from "@/config";

// 在组件中使用配置
const handleRequest = () => {
	if (env.isDev) {
		console.log("开发环境API地址:", api.baseURL);
	}

	// 发起请求时会自动使用配置的baseURL
	uni.request({
		url: "/api/user/info", // 会自动拼接为 http://localhost:8080/api/user/info
		method: "GET",
	});
};
```

### 2. 在 API 文件中使用

```typescript
import { http } from "@/utils/http";
import { api } from "@/config";

// API请求会自动使用配置的baseURL
export const getUserInfo = () => {
	return http({
		url: "/api/user/info",
		method: "GET",
	});
};
```

### 3. 修改 API 地址

如果需要修改 API 地址，只需要修改 `src/config/env.ts` 文件中对应环境的 `API_BASE_URL`：

```typescript
// 修改开发环境API地址
development: {
  API_BASE_URL: 'http://your-new-dev-api.com',
  // ...
}

// 修改生产环境API地址
production: {
  API_BASE_URL: 'http://your-new-prod-api.com',
  // ...
}
```

## 环境切换

项目会根据 `process.env.NODE_ENV` 自动选择对应的环境配置：

- `development` - 开发环境
- `test` - 测试环境
- `production` - 生产环境

## 注意事项

1. 修改配置后需要重启开发服务器
2. 生产环境构建时会自动使用 `production` 配置
3. 所有 API 请求都会自动使用配置的 baseURL，无需手动拼接
4. 可以通过 `env.isDev` 等判断当前环境，进行相应的逻辑处理
