import { currentEnv } from "./env";

// 全局配置文件
interface Config {
	// API配置
	api: {
		baseURL: string;
		timeout: number;
		version: string;
		platform: string;
	};

	// 应用配置
	app: {
		name: string;
		version: string;
	};

	// 环境配置
	env: {
		isDev: boolean;
		isProd: boolean;
		isTest: boolean;
	};
}

// 根据环境设置不同的配置
const getConfig = (): Config => {
	// 判断当前环境
	const isDev = process.env.NODE_ENV === "development";
	const isProd = process.env.NODE_ENV === "production";
	const isTest = process.env.NODE_ENV === "test";

	return {
		api: {
			// 使用环境变量配置的API地址
			baseURL: currentEnv.API_BASE_URL,
			timeout: currentEnv.API_TIMEOUT,
			version: "1.0.0",
			platform: "wechat",
		},

		app: {
			name: "玩点社交",
			version: "1.0.0",
		},

		env: {
			isDev,
			isProd,
			isTest,
		},
	};
};

export const config = getConfig();

// 导出常用的配置项
export const { api, app, env } = config;

// 默认导出整个配置对象
export default config;
