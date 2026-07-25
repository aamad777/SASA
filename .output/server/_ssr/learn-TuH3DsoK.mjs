import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Y as CircleCheck, et as BookOpen, it as ArrowLeft } from "../_libs/lucide-react.mjs";
import { t as BottomNav } from "./BottomNav-B6YqhHlG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/learn-TuH3DsoK.js
var import_jsx_runtime = require_jsx_runtime();
var activities = [
	{
		id: 1,
		title: "ABC Match",
		subtitle: "Find the letters",
		color: "bg-sky-soft"
	},
	{
		id: 2,
		title: "Counting Bears",
		subtitle: "1, 2, 3",
		color: "bg-peach-soft"
	},
	{
		id: 3,
		title: "Shape Sorting",
		subtitle: "Circles & squares",
		color: "bg-mint"
	},
	{
		id: 4,
		title: "Color Mixing",
		subtitle: "What color is this?",
		color: "bg-sun"
	},
	{
		id: 5,
		title: "Animal Sounds",
		subtitle: "Moo, woof, meow",
		color: "bg-sky-soft"
	},
	{
		id: 6,
		title: "Story Time",
		subtitle: "Read together",
		color: "bg-peach-soft"
	}
];
function LearnPage() {
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
					children: "Play & Learn"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-muted-foreground",
					children: "Tiny games and lessons"
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
				children: activities.map((activity) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: `kid-card toddler-shadow flex items-center gap-5 text-left ${activity.color}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/60",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-8 w-8 text-foreground" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-heading text-xl font-bold text-foreground",
								children: activity.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-muted-foreground",
								children: activity.subtitle
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "ml-auto h-7 w-7 shrink-0 text-mint" })
					]
				}, activity.id))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNav, {})]
	});
}
//#endregion
export { LearnPage as component };
