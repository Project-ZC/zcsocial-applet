import type { App } from "vue";
import EmptyDataComponent from "./index.vue";

export const EmptyData = {
	install: (app) => {
		app.component("emptyData", EmptyDataComponent);
	},
};
