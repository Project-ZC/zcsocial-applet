// 地图配置
export const MAP_CONFIG = {
	// 腾讯地图API配置
	TENCENT_MAP: {
		KEY: "GJ3BZ-WO463-4DF37-ROTXH-X7A3Q-WIB5R", // 请替换为您的腾讯地图API密钥
		BASE_URL: "https://apis.map.qq.com/ws",
		GEOCODER_URL: "https://apis.map.qq.com/ws/geocoder/v1/",
	},

	// 高德地图API配置
	AMAP: {
		KEY: "YOUR_AMAP_KEY", // 请替换为您的高德地图API密钥
		BASE_URL: "https://restapi.amap.com/v3",
		GEOCODER_URL: "https://restapi.amap.com/v3/geocode/regeo",
	},

	// 百度地图API配置
	BAIDU_MAP: {
		KEY: "YOUR_BAIDU_MAP_KEY", // 请替换为您的百度地图API密钥
		BASE_URL: "https://api.map.baidu.com",
		GEOCODER_URL: "https://api.map.baidu.com/reverse_geocoding/v3",
	},
};

// 地图服务类型
export enum MapServiceType {
	TENCENT = "tencent",
	AMAP = "amap",
	BAIDU = "baidu",
}

// 默认使用的地图服务
export const DEFAULT_MAP_SERVICE = MapServiceType.TENCENT;

// 获取地图API密钥
export const getMapApiKey = (
	serviceType: MapServiceType = DEFAULT_MAP_SERVICE
): string => {
	switch (serviceType) {
		case MapServiceType.TENCENT:
			return MAP_CONFIG.TENCENT_MAP.KEY;
		case MapServiceType.AMAP:
			return MAP_CONFIG.AMAP.KEY;
		case MapServiceType.BAIDU:
			return MAP_CONFIG.BAIDU_MAP.KEY;
		default:
			return MAP_CONFIG.TENCENT_MAP.KEY;
	}
};

// 检查API密钥是否已配置
export const isApiKeyConfigured = (
	serviceType: MapServiceType = DEFAULT_MAP_SERVICE
): boolean => {
	const key = getMapApiKey(serviceType);
	return (
		key !== "YOUR_TENCENT_MAP_KEY" &&
		key !== "YOUR_AMAP_KEY" &&
		key !== "YOUR_BAIDU_MAP_KEY" &&
		key.length > 0
	);
};
