import type { App } from "vue";
import uviewPlus, { setConfig } from "uview-plus";
import { PageWrapper } from "@/components/page/index";
import { EmptyData } from "@/components/empty-data/index";

function setupUI(app: App) {
	// 注册
	app.use(PageWrapper); // layout布局
	app.use(EmptyData); // 数据空

	// 下面的在特殊场景下才需要配置，通常不用配置即可直接使用uview-plus框架。
	// 调用setConfig方法，方法内部会进行对象属性深度合并，可以放心嵌套配置
	// 需要在app.use(uview-plus)之后执行
	setConfig({
		// 修改$u.config对象的属性
		config: {
			// 修改默认单位为rpx，相当于执行 uni.$u.config.unit = 'rpx'
			unit: "rpx",
		},
		// 修改$u.props对象的属性
		props: {
			// 修改radio组件的size参数的默认值，相当于执行 uni.$u.props.radio.size = 30
			radio: {
				// size: 20
			},
			subsection: {
				mode: "subsection",
				border: false,
			},

			// 设置input组件的全局默认属性
			input: {
				// // 始终嵌入键盘
				// "alwaysEmbed": true, // 无此数据
				// // 自动调整位置
				// "adjustPosition": true,
				// // 光标距离键盘的距离
				// "cursorSpacing": 30,
				// 光标颜色
				cursorColor: "var(--primary-6)",
				color: "var(--text-2)",
				borderColor: "var(--border-2)",
				bgColor: "var(--bg-2)",
			},
			// 设置image组件的全局默认属性
			image: {
				// 设置默认的错误图片
				errorIcon: "photo",
				radius: 4,
				bgColor: "var(--bg-1)",
			},
			popup: {
				round: 15,
				bgColor: "var(--bg-2)",
			},
			picker: {
				bgColor: "var(--bg-2)",
			},
			datetimePicker:{
				cancelColor: "var(--text-1)",
				confirmColor: "var(--text-1)",
				bgColor: "var(--bg-2)",
			},
			// 其他组件属性配置
			// ......
		},
	});
	app.use(uviewPlus);
}

export default setupUI;
