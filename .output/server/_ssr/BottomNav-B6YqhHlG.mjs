import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link, l as useLocation } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Play, L as House, Q as Camera, et as BookOpen } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/BottomNav-B6YqhHlG.js
var import_jsx_runtime = require_jsx_runtime();
var navItems = [
	{
		to: "/",
		label: "Home",
		icon: House
	},
	{
		to: "/videos",
		label: "Videos",
		icon: Play
	},
	{
		to: "/photos",
		label: "Photos",
		icon: Camera
	},
	{
		to: "/learn",
		label: "Learn",
		icon: BookOpen
	}
];
function BottomNav() {
	const { pathname } = useLocation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-area-pb",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto flex max-w-md items-center justify-around px-2 py-3",
			children: navItems.map((item) => {
				const isActive = pathname === item.to;
				const Icon = item.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.to,
					className: `flex flex-col items-center gap-1 rounded-2xl px-4 py-2 transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: "h-7 w-7",
						strokeWidth: 2.5
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold",
						children: item.label
					})]
				}, item.to);
			})
		})
	});
}
//#endregion
export { BottomNav as t };
