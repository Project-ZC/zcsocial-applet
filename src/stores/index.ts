import type { App } from "vue";
import { createPinia } from "pinia";
// pinia 持久化插件
import { createPersistedState } from "pinia-plugin-persistedstate";
import { uniCache } from "@/utils/storage";

// 导入子模块
import { useUserStore } from "./modules/user";
import { useShopStore } from "./modules/shop";

// 安装pinia状态管理插件
function setupStore(app: App) {
	const store = createPinia();

	const piniaPersist = createPersistedState({
		storage: {
			getItem: uniCache.getItem,
			setItem: uniCache.setItem,
		},
	});
	store.use(piniaPersist);

	app.use(store);
}

// 导出模块
export { useUserStore, useShopStore };
export default setupStore;
