import type { App } from "vue";
import PageWrapperComponent from "./index.vue";

export const PageWrapper = {
	install: (app) => {
		app.component("PageWrapper", PageWrapperComponent);
	},
};
