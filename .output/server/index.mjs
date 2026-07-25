globalThis.__nitro_main__ = import.meta.url;
import { a as FastResponse, i as defineLazyEventHandler, n as HTTPError, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-07-25T18:56:42.422Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/avatar-leo.png": {
		"type": "image/png",
		"etag": "\"6f758-VYzb7l8NRuBkig61IWkRSKT0LHU\"",
		"mtime": "2026-07-25T18:56:42.423Z",
		"size": 456536,
		"path": "../public/avatar-leo.png"
	},
	"/avatar-ruby.png": {
		"type": "image/png",
		"etag": "\"676c4-F+DnDLgSJFMKmoFpifOPbPON/sY\"",
		"mtime": "2026-07-25T18:56:42.422Z",
		"size": 423620,
		"path": "../public/avatar-ruby.png"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"17-ZZkCVrbr4BSdjt/K43J0tq8+Qq4\"",
		"mtime": "2026-07-25T18:56:42.427Z",
		"size": 23,
		"path": "../public/robots.txt"
	},
	"/assets/BottomNav-nUHIzx2D.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3f6-jzNMVnpae+xy+Efaz153/EdrNZM\"",
		"mtime": "2026-07-25T18:56:41.952Z",
		"size": 1014,
		"path": "../public/assets/BottomNav-nUHIzx2D.js"
	},
	"/assets/heart-B-qPA96E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f6-ln74XGWEOGUN0cAWklKgRW0LHZs\"",
		"mtime": "2026-07-25T18:56:41.952Z",
		"size": 246,
		"path": "../public/assets/heart-B-qPA96E.js"
	},
	"/assets/circle-check-DUpu71Fy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a6-cCcZQxhc/GHOW3Ex752IGaoELZ4\"",
		"mtime": "2026-07-25T18:56:41.952Z",
		"size": 166,
		"path": "../public/assets/circle-check-DUpu71Fy.js"
	},
	"/assets/learn-DCM-YTEn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7e4-S0Fox5qZcf0a4ZIl0+EKe8uKDCU\"",
		"mtime": "2026-07-25T18:56:41.952Z",
		"size": 2020,
		"path": "../public/assets/learn-DCM-YTEn.js"
	},
	"/assets/index-C6m4-CDa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"545d3-731jo9Akb9BvF+B/N7LnSMvCdxM\"",
		"mtime": "2026-07-25T18:56:41.950Z",
		"size": 345555,
		"path": "../public/assets/index-C6m4-CDa.js"
	},
	"/assets/photo-apple-453958n4.jpg": {
		"type": "image/jpeg",
		"etag": "\"e238-79S7wI1kRdLhCpdXQO52UdH9c28\"",
		"mtime": "2026-07-25T18:56:41.954Z",
		"size": 57912,
		"path": "../public/assets/photo-apple-453958n4.jpg"
	},
	"/assets/photo-ball-pbw-d6hF.jpg": {
		"type": "image/jpeg",
		"etag": "\"10222-avC781w7Aixc8RZAYRxlmzwfYOo\"",
		"mtime": "2026-07-25T18:56:41.954Z",
		"size": 66082,
		"path": "../public/assets/photo-ball-pbw-d6hF.jpg"
	},
	"/assets/photo-car-Bcms6A0G.jpg": {
		"type": "image/jpeg",
		"etag": "\"fa78-KuotQxBaueQLoVPCA+MWO+TjnLA\"",
		"mtime": "2026-07-25T18:56:41.954Z",
		"size": 64120,
		"path": "../public/assets/photo-car-Bcms6A0G.jpg"
	},
	"/assets/photo-fish-Cve3Er2A.jpg": {
		"type": "image/jpeg",
		"etag": "\"e5c1-uRANhAC73GCqw4w6oWHkpBmf22k\"",
		"mtime": "2026-07-25T18:56:41.954Z",
		"size": 58817,
		"path": "../public/assets/photo-fish-Cve3Er2A.jpg"
	},
	"/avatar-poppy.png": {
		"type": "image/png",
		"etag": "\"8817c-qcEfALZlbsMGahJXmVH7wEP1NsQ\"",
		"mtime": "2026-07-25T18:56:42.423Z",
		"size": 557436,
		"path": "../public/avatar-poppy.png"
	},
	"/kitty_avatar_1784920065128.jpg": {
		"type": "image/jpeg",
		"etag": "\"b61a3-k8juSBqwR16eDzduf+oyiqKwNk0\"",
		"mtime": "2026-07-25T18:56:42.423Z",
		"size": 745891,
		"path": "../public/kitty_avatar_1784920065128.jpg"
	},
	"/monkey_avatar_1784920076703.jpg": {
		"type": "image/jpeg",
		"etag": "\"a23d0-czUotf1MlQ37riViC7LDb4n16PQ\"",
		"mtime": "2026-07-25T18:56:42.423Z",
		"size": 664528,
		"path": "../public/monkey_avatar_1784920076703.jpg"
	},
	"/koala_avatar_1784920089417.jpg": {
		"type": "image/jpeg",
		"etag": "\"b66cc-yQot31kdC6+MzexLLM7+8+U742w\"",
		"mtime": "2026-07-25T18:56:42.423Z",
		"size": 747212,
		"path": "../public/koala_avatar_1784920089417.jpg"
	},
	"/penguin_avatar_1784920051288.jpg": {
		"type": "image/jpeg",
		"etag": "\"b07a8-2yLGTMUMy2WteqpnnCC/QxxifDw\"",
		"mtime": "2026-07-25T18:56:42.426Z",
		"size": 722856,
		"path": "../public/penguin_avatar_1784920051288.jpg"
	},
	"/numbers_kids_video_1784920463079.jpg": {
		"type": "image/jpeg",
		"etag": "\"cb1e7-oyPs1nBpIQ9kbeFYkEVLfayNbZ0\"",
		"mtime": "2026-07-25T18:56:42.423Z",
		"size": 831975,
		"path": "../public/numbers_kids_video_1784920463079.jpg"
	},
	"/puppy_avatar_1784920038818.jpg": {
		"type": "image/jpeg",
		"etag": "\"b0c98-RMYv78nTlQKhuYfTrrAkl5R42v8\"",
		"mtime": "2026-07-25T18:56:42.427Z",
		"size": 724120,
		"path": "../public/puppy_avatar_1784920038818.jpg"
	},
	"/assets/koala_avatar_1784920089417-D3xDh16S.jpg": {
		"type": "image/jpeg",
		"etag": "\"b66cc-yQot31kdC6+MzexLLM7+8+U742w\"",
		"mtime": "2026-07-25T18:56:41.953Z",
		"size": 747212,
		"path": "../public/assets/koala_avatar_1784920089417-D3xDh16S.jpg"
	},
	"/assets/kitty_avatar_1784920065128-DCAn6l9W.jpg": {
		"type": "image/jpeg",
		"etag": "\"b61a3-k8juSBqwR16eDzduf+oyiqKwNk0\"",
		"mtime": "2026-07-25T18:56:41.953Z",
		"size": 745891,
		"path": "../public/assets/kitty_avatar_1784920065128-DCAn6l9W.jpg"
	},
	"/assets/monkey_avatar_1784920076703-BiLtTfzL.jpg": {
		"type": "image/jpeg",
		"etag": "\"a23d0-czUotf1MlQ37riViC7LDb4n16PQ\"",
		"mtime": "2026-07-25T18:56:41.953Z",
		"size": 664528,
		"path": "../public/assets/monkey_avatar_1784920076703-BiLtTfzL.jpg"
	},
	"/assets/penguin_avatar_1784920051288-DNBVqJmz.jpg": {
		"type": "image/jpeg",
		"etag": "\"b07a8-2yLGTMUMy2WteqpnnCC/QxxifDw\"",
		"mtime": "2026-07-25T18:56:41.954Z",
		"size": 722856,
		"path": "../public/assets/penguin_avatar_1784920051288-DNBVqJmz.jpg"
	},
	"/assets/numbers_kids_video_1784920463079-BPB5loUy.jpg": {
		"type": "image/jpeg",
		"etag": "\"cb1e7-oyPs1nBpIQ9kbeFYkEVLfayNbZ0\"",
		"mtime": "2026-07-25T18:56:41.953Z",
		"size": 831975,
		"path": "../public/assets/numbers_kids_video_1784920463079-BPB5loUy.jpg"
	},
	"/assets/photo-flower-BU8N9N0S.jpg": {
		"type": "image/jpeg",
		"etag": "\"da03-bpTTGNdiBj6Ow17bMj7bd2VVNCM\"",
		"mtime": "2026-07-25T18:56:41.954Z",
		"size": 55811,
		"path": "../public/assets/photo-flower-BU8N9N0S.jpg"
	},
	"/assets/photo-moon-C9IIyOCU.jpg": {
		"type": "image/jpeg",
		"etag": "\"bb58-HtUnjBpSRt0q4FQYJMCCLzKVFYo\"",
		"mtime": "2026-07-25T18:56:41.954Z",
		"size": 47960,
		"path": "../public/assets/photo-moon-C9IIyOCU.jpg"
	},
	"/assets/photos-DUUG8_-7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"84e-PFC4VYTj9PslJTj7ey3ufUhsmiw\"",
		"mtime": "2026-07-25T18:56:41.952Z",
		"size": 2126,
		"path": "../public/assets/photos-DUUG8_-7.js"
	},
	"/assets/play-C9bVPZlq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"866-8jyfbJJEl+mse1o6qSj9/BWrAcE\"",
		"mtime": "2026-07-25T18:56:41.952Z",
		"size": 2150,
		"path": "../public/assets/play-C9bVPZlq.js"
	},
	"/assets/photo-puppy-Dz7jHmO8.jpg": {
		"type": "image/jpeg",
		"etag": "\"d77c-OCqafYZUpZ5IBR6Cvf+h2QOTItA\"",
		"mtime": "2026-07-25T18:56:41.954Z",
		"size": 55164,
		"path": "../public/assets/photo-puppy-Dz7jHmO8.jpg"
	},
	"/assets/photo-star-Cg3aX-sT.jpg": {
		"type": "image/jpeg",
		"etag": "\"b113-ZWQgPKqUHnCuK1Txr7qLzg1qh0s\"",
		"mtime": "2026-07-25T18:56:41.954Z",
		"size": 45331,
		"path": "../public/assets/photo-star-Cg3aX-sT.jpg"
	},
	"/assets/routes-DvMC_IXu.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1177-54y3ewG2wQVHg/NAVPyo2OlPHsE\"",
		"mtime": "2026-07-25T18:56:41.955Z",
		"size": 4471,
		"path": "../public/assets/routes-DvMC_IXu.css"
	},
	"/assets/videos-BnVxTw-F.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"943-SzDXlELCmowmPVFE7rUpRaEF4R8\"",
		"mtime": "2026-07-25T18:56:41.953Z",
		"size": 2371,
		"path": "../public/assets/videos-BnVxTw-F.js"
	},
	"/assets/routes-DEvRifzC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4cf67-81e94idOaJRSR+EPlxtF7WXRj8s\"",
		"mtime": "2026-07-25T18:56:41.952Z",
		"size": 315239,
		"path": "../public/assets/routes-DEvRifzC.js"
	},
	"/assets/styles-JvfiE8BF.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"3262f-pMvyqXB2banCzdxzV5sDgzVSAX0\"",
		"mtime": "2026-07-25T18:56:41.955Z",
		"size": 206383,
		"path": "../public/assets/styles-JvfiE8BF.css"
	},
	"/assets/puppy_avatar_1784920038818-C6_XcCU8.jpg": {
		"type": "image/jpeg",
		"etag": "\"b0c98-RMYv78nTlQKhuYfTrrAkl5R42v8\"",
		"mtime": "2026-07-25T18:56:41.954Z",
		"size": 724120,
		"path": "../public/assets/puppy_avatar_1784920038818-C6_XcCU8.jpg"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_EaWQQf = defineLazyEventHandler(() => import("./_chunks/renderer-template.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_EaWQQf
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
