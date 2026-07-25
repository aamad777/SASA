import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { R as Heart, it as ArrowLeft } from "../_libs/lucide-react.mjs";
import { t as BottomNav } from "./BottomNav-B6YqhHlG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/photos-B7wLSy5b.js
var import_jsx_runtime = require_jsx_runtime();
var photos = [
	{
		id: 1,
		label: "Puppy",
		image: "/assets/photo-puppy-Dz7jHmO8.jpg",
		color: "bg-peach-soft"
	},
	{
		id: 2,
		label: "Flower",
		image: "/assets/photo-flower-BU8N9N0S.jpg",
		color: "bg-sky-soft"
	},
	{
		id: 3,
		label: "Car",
		image: "/assets/photo-car-Bcms6A0G.jpg",
		color: "bg-mint"
	},
	{
		id: 4,
		label: "Star",
		image: "/assets/photo-star-Cg3aX-sT.jpg",
		color: "bg-sun"
	},
	{
		id: 5,
		label: "Apple",
		image: "/assets/photo-apple-453958n4.jpg",
		color: "bg-peach-soft"
	},
	{
		id: 6,
		label: "Fish",
		image: "/assets/photo-fish-Cve3Er2A.jpg",
		color: "bg-sky-soft"
	},
	{
		id: 7,
		label: "Ball",
		image: "/assets/photo-ball-pbw-d6hF.jpg",
		color: "bg-mint"
	},
	{
		id: 8,
		label: "Moon",
		image: "/assets/photo-moon-C9IIyOCU.jpg",
		color: "bg-sun"
	}
];
function PhotosPage() {
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
					children: "See Photos"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-muted-foreground",
					children: "Tap a picture to say its name"
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid grid-cols-2 gap-4 sm:grid-cols-4",
				children: photos.map((photo) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: `kid-card toddler-shadow flex flex-col items-center gap-3 p-4 ${photo.color}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "aspect-square w-full overflow-hidden rounded-2xl bg-white/60",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: photo.image,
								alt: photo.label,
								loading: "lazy",
								className: "h-full w-full object-cover"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-heading text-lg font-bold text-foreground",
							children: photo.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-5 w-5 text-peach" })
					]
				}, photo.id))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNav, {})]
	});
}
//#endregion
export { PhotosPage as component };
