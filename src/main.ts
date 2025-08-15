import { createPinia } from "pinia";
import uviewPlus from "uview-plus";
import { createSSRApp } from "vue";
import App from "./App.vue";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

export function createApp() {
	const app = createSSRApp(App);
	const pinia = createPinia();
	pinia.use(piniaPluginPersistedstate);
	app.use(pinia).use(uviewPlus, () => {
		return {
			options: {
				// 修改$u.config对象的属性
				config: {
					// 修改默认单位为rpx，相当于执行 uni.$u.config.unit = 'rpx'
					unit: "rpx",
				},
			},
		};
	});
	return {
		app,
	};
}
