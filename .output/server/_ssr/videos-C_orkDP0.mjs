import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Play, d as Star, it as ArrowLeft } from "../_libs/lucide-react.mjs";
import { t as BottomNav } from "./BottomNav-B6YqhHlG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/videos-C_orkDP0.js
var import_jsx_runtime = require_jsx_runtime();
var videos = [
	{
		id: 1,
		title: "Sunny Morning Song",
		duration: "2:30",
		color: "bg-sky-soft"
	},
	{
		id: 2,
		title: "Animal Friends",
		duration: "3:15",
		color: "bg-peach-soft"
	},
	{
		id: 3,
		title: "Counting Clouds",
		duration: "2:45",
		color: "bg-mint"
	},
	{
		id: 4,
		title: "Color Parade",
		duration: "4:00",
		color: "bg-sun"
	},
	{
		id: 5,
		title: "Bedtime Lullaby",
		duration: "3:30",
		color: "bg-sky-soft"
	},
	{
		id: 6,
		title: "Shapes Everywhere",
		duration: "2:10",
		color: "bg-peach-soft"
	}
];
function VideosPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background pb-28",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-3xl px-4 pt-6 sm:pt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6 flex items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "grid h-12 w-12 place-items-center rounded-2xl bg-muted text-foreground transition-colors hover:bg-muted/80",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-6 w-6" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-heading text-3xl font-extrabold text-foreground",
					children: "Watch Videos"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-muted-foreground",
					children: "Fun, safe videos for little ones"
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
				children: videos.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: `kid-card toddler-shadow flex items-center gap-5 text-left ${video.color}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/60",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-8 w-8 fill-current text-foreground" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-heading text-lg font-bold text-foreground",
								children: video.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-muted-foreground",
								children: video.duration
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "ml-auto h-6 w-6 shrink-0 text-sun" })
					]
				}, video.id))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNav, {})]
	});
}
//#endregion
export { VideosPage as component };
