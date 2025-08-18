// 环境变量配置
export const ENV_CONFIG = {
	// 开发环境
	development: {
		API_BASE_URL: "http://localhost:8080",
		API_TIMEOUT: 60000,
		DEBUG: true,
	},

	// 测试环境
	test: {
		API_BASE_URL: "http://test-api.example.com",
		API_TIMEOUT: 60000,
		DEBUG: true,
	},

	// 生产环境
	production: {
		API_BASE_URL: "http://115.190.120.193:8080",
		API_TIMEOUT: 60000,
		DEBUG: false,
	},
};

// 获取当前环境配置
export const getEnvConfig = () => {
	const env = process.env.NODE_ENV || "development";
	return ENV_CONFIG[env as keyof typeof ENV_CONFIG] || ENV_CONFIG.development;
};

// 导出当前环境配置
export const currentEnv = getEnvConfig();
