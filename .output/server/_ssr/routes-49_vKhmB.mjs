import { a as __toESM } from "../_runtime.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { $ as Calculator, A as Menu, B as Eye, C as Play, D as Palette, E as PartyPopper, F as Info, G as Delete, H as Eraser, I as Image, J as CircleUser, K as Crown, L as House, M as Lock, N as LockOpen, O as Paintbrush, P as LockKeyhole, Q as Camera, R as Heart, S as Radio, T as Pause, U as Download, V as EyeOff, W as Disc, X as Check, Y as CircleCheck, Z as ChartColumn, _ as ShieldCheck, a as User, b as Search, c as Undo2, et as BookOpen, f as Sparkles, g as Shield, h as SkipBack, i as Users, it as ArrowLeft, j as Mail, k as Music, l as Trophy, m as SkipForward, n as VolumeX, nt as Bed, o as UserPlus, p as Smile, q as Clock3, r as Volume2, rt as ArrowRight, s as Upload, t as X, tt as Bell, u as Trash2, v as Settings, w as PenLine, x as RotateCcw, y as Send, z as Gamepad2 } from "../_libs/lucide-react.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as confetti_module_default } from "../_libs/canvas-confetti.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-49_vKhmB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var audioCtx = null;
function getAudioContext() {
	if (typeof window === "undefined") return null;
	if (!audioCtx) {
		const AudioContextClass = window.AudioContext || window.webkitAudioContext;
		if (AudioContextClass) audioCtx = new AudioContextClass();
	}
	if (audioCtx && audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
	return audioCtx;
}
function isSoundEnabled() {
	try {
		return localStorage.getItem("sasa-sound-enabled") !== "false";
	} catch {
		return true;
	}
}
function setSoundEnabled(enabled) {
	try {
		localStorage.setItem("sasa-sound-enabled", String(enabled));
	} catch {}
}
function playPopSound() {
	if (!isSoundEnabled()) return;
	const ctx = getAudioContext();
	if (!ctx) return;
	try {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sine";
		const now = ctx.currentTime;
		osc.frequency.setValueAtTime(320, now);
		osc.frequency.exponentialRampToValueAtTime(780, now + .08);
		gain.gain.setValueAtTime(.18, now);
		gain.gain.exponentialRampToValueAtTime(.001, now + .08);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start(now);
		osc.stop(now + .08);
	} catch {}
}
function playHeartSound() {
	if (!isSoundEnabled()) return;
	const ctx = getAudioContext();
	if (!ctx) return;
	try {
		const now = ctx.currentTime;
		[
			523.25,
			659.25,
			783.99,
			1046.5
		].forEach((freq, i) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = "triangle";
			osc.frequency.setValueAtTime(freq, now + i * .05);
			gain.gain.setValueAtTime(.15, now + i * .05);
			gain.gain.exponentialRampToValueAtTime(.001, now + i * .05 + .15);
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start(now + i * .05);
			osc.stop(now + i * .05 + .15);
		});
	} catch {}
}
function playSuccessSound() {
	if (!isSoundEnabled()) return;
	const ctx = getAudioContext();
	if (!ctx) return;
	try {
		const now = ctx.currentTime;
		[
			440,
			554.37,
			659.25,
			880
		].forEach((freq, i) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = "sine";
			osc.frequency.setValueAtTime(freq, now + i * .07);
			gain.gain.setValueAtTime(.2, now + i * .07);
			gain.gain.exponentialRampToValueAtTime(.001, now + i * .07 + .25);
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start(now + i * .07);
			osc.stop(now + i * .07 + .25);
		});
	} catch {}
}
var puppy_avatar_1784920038818_default = "/assets/puppy_avatar_1784920038818-C6_XcCU8.jpg";
var penguin_avatar_1784920051288_default = "/assets/penguin_avatar_1784920051288-DNBVqJmz.jpg";
var kitty_avatar_1784920065128_default = "/assets/kitty_avatar_1784920065128-DCAn6l9W.jpg";
var monkey_avatar_1784920076703_default = "/assets/monkey_avatar_1784920076703-BiLtTfzL.jpg";
var koala_avatar_1784920089417_default = "/assets/koala_avatar_1784920089417-D3xDh16S.jpg";
var cartoonAvatars = [
	{
		id: "lion",
		emoji: "🦁",
		color: "#ffb703",
		label: "Leo Lion",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXKmBbTEschT2fVlXzamCeETx0M3rctPouvJQ6jyWboczUe-WXt302CDJtMx5T_L9-zEaxhM_vxlITgSZt9_ApPXqHF9Vx39tEHo5gDXRFuGHRZ_rrEz6fOH5KlalMKiv82rUKm_4IRONsQ-wF064xYk_0ZIzAijLaovdE2H-qhe86S9qU1K70VcVvqOQ7GxR9ujHTTCg5GPHGI4VYoTLTPpwFitUSQ7JP8kSUjWRij6OOEIBXNKbLcaKkBrH4y-J_4PM1zmklxnA"
	},
	{
		id: "panda",
		emoji: "🐼",
		color: "#8ecae6",
		label: "Poppy Panda",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCONd4umMhgrulZ5f-ZZt2Uuy9-ach-KvWVrVKGmgiL58eNixQ0RjTvy4dEfDeZ1J7AjEKiLqrUKdXuuqdwFo-IF87mvFkdWZwpDs4hfs2FGU19CtmN6-k04UQXX4ibVERtYQS4ejdOmmIu6QKvrqVw2lGKdJHCiNNzzQGpdSP3Zir5sHO0B2Dt0_hf7PLpsbxeTuzJbU0-bxuCDZ2egbgYTHvpvt7p7Nl-GMz8P2cZlpqKbDqaybqBQFAYBqN6KlDGvQr8Yd7diDQ"
	},
	{
		id: "rabbit",
		emoji: "🐰",
		color: "#ffafcc",
		label: "Ruby Bunny",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSpgsSIXN0d0LIyQMwB5SQbDUf6iitsVRQwTNbcaYYxamCvTLMt2omcQa9RPFVNaWlGDX2OTgHS9ZHHumfzn4jTOqF8IM0wzwTvI6lEkYLR5e4j1moqa0_Wrartxg-46lIyoXuBdsEFX9pa7gJgLs0L0SshcnaM8a_OnasZM-Uogwwpf5DOLftEcb2sg4fUl5uLX5o-g-g9wxt8QgqtmJ1Zii35Iibp-f7PH3ACFzlM57Cuf4m8MVAwA0J5c_n1YsiT4-gFfBgNg0"
	},
	{
		id: "puppy",
		emoji: "🐶",
		color: "#fdb813",
		label: "Percy Puppy",
		image: puppy_avatar_1784920038818_default
	},
	{
		id: "penguin",
		emoji: "🐧",
		color: "#38bdf8",
		label: "Pippin Penguin",
		image: penguin_avatar_1784920051288_default
	},
	{
		id: "kitty",
		emoji: "🐱",
		color: "#f472b6",
		label: "Cleo Kitty",
		image: kitty_avatar_1784920065128_default
	},
	{
		id: "monkey",
		emoji: "🐵",
		color: "#fb923c",
		label: "Milo Monkey",
		image: monkey_avatar_1784920076703_default
	},
	{
		id: "koala",
		emoji: "🐨",
		color: "#a7f3d0",
		label: "Kiki Koala",
		image: koala_avatar_1784920089417_default
	}
];
function AddProfile({ onClose, onCreate }) {
	const [name, setName] = (0, import_react.useState)("");
	const [age, setAge] = (0, import_react.useState)(5);
	const [avatarMode, setAvatarMode] = (0, import_react.useState)("cartoon");
	const [selectedAvatar, setSelectedAvatar] = (0, import_react.useState)(cartoonAvatars[0]);
	const [customPhotoUrl, setCustomPhotoUrl] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const fileInputRef = (0, import_react.useRef)(null);
	const handleFileUpload = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 8 * 1024 * 1024) {
			playPopSound();
			setError("Image file is too large. Please choose an image under 8MB.");
			return;
		}
		const reader = new FileReader();
		reader.onload = (event) => {
			const result = event.target?.result;
			if (result) {
				playSuccessSound();
				setCustomPhotoUrl(result);
				setAvatarMode("upload");
				setError("");
			}
		};
		reader.readAsDataURL(file);
	};
	const handleCreate = (e) => {
		const cleanName = name.trim();
		if (cleanName.length < 2) {
			playPopSound();
			setError("Please enter at least 2 characters for the name.");
			return;
		}
		playSuccessSound();
		if (e) {
			const rect = e.currentTarget.getBoundingClientRect();
			confetti_module_default({
				particleCount: 45,
				spread: 80,
				origin: {
					x: (rect.left + rect.width / 2) / window.innerWidth,
					y: (rect.top + rect.height / 2) / window.innerHeight
				},
				colors: [
					"#ffb703",
					"#8ecae6",
					"#ffafcc",
					"#fb8500",
					"#66bb6a"
				]
			});
		}
		const avatarUrl = avatarMode === "upload" && customPhotoUrl ? customPhotoUrl : selectedAvatar.image;
		onCreate({
			id: Date.now(),
			name: cleanName,
			age,
			emoji: avatarMode === "upload" ? "👶" : selectedAvatar.emoji,
			color: avatarMode === "upload" ? "#38bdf8" : selectedAvatar.color,
			avatarUrl
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "add-profile-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			className: "add-profile-backdrop",
			initial: { opacity: 0 },
			animate: { opacity: 1 },
			exit: { opacity: 0 },
			onClick: () => {
				playPopSound();
				onClose();
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.section, {
			className: "add-profile-dialog",
			initial: {
				opacity: 0,
				scale: .9,
				y: 20
			},
			animate: {
				opacity: 1,
				scale: 1,
				y: 0
			},
			exit: {
				opacity: 0,
				scale: .9
			},
			transition: {
				type: "spring",
				damping: 25,
				stiffness: 300
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
				whileHover: {
					scale: 1.15,
					rotate: 90
				},
				whileTap: { scale: .85 },
				type: "button",
				className: "add-profile-close",
				onClick: () => {
					playPopSound();
					onClose();
				},
				"aria-label": "Close",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 22 })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "add-profile-content",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "new-buddy-badge",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 18 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "New Buddy" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Add Kid Profile" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "add-profile-form",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "add-profile-field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kid's Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: name,
									placeholder: "E.G. MILO",
									maxLength: 20,
									autoFocus: true,
									onChange: (event) => {
										setName(event.target.value);
										setError("");
									},
									onKeyDown: (event) => {
										if (event.key === "Enter") handleCreate();
									}
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "add-profile-field",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"Age (",
										age,
										" years old)"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "range",
										min: "2",
										max: "12",
										value: age,
										className: "add-profile-age-slider",
										onChange: (event) => {
											playPopSound();
											setAge(Number(event.target.value));
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "age-scale",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "2 years" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "12 years" })]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "add-profile-field",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between mb-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold text-slate-700 text-sm",
											children: "Choose Profile Photo"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1 bg-slate-100 p-1 rounded-xl",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => {
													playPopSound();
													setAvatarMode("cartoon");
												},
												className: `px-3 py-1 text-xs font-bold rounded-lg transition ${avatarMode === "cartoon" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
													size: 13,
													className: "inline mr-1"
												}), "Cartoons"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => {
													playPopSound();
													setAvatarMode("upload");
												},
												className: `px-3 py-1 text-xs font-bold rounded-lg transition ${avatarMode === "upload" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {
													size: 13,
													className: "inline mr-1"
												}), "Upload Photo"]
											})]
										})]
									}),
									avatarMode === "cartoon" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "add-avatar-list",
										children: cartoonAvatars.map((avatar) => {
											const selected = avatarMode === "cartoon" && avatar.id === selectedAvatar.id;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
												whileHover: { scale: 1.08 },
												whileTap: { scale: .92 },
												type: "button",
												className: selected ? "add-avatar-button selected" : "add-avatar-button",
												onClick: () => {
													playPopSound();
													setSelectedAvatar(avatar);
												},
												"aria-label": `Select ${avatar.label}`,
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "add-avatar-frame",
														style: { borderColor: selected ? avatar.color : "#e2e8f0" },
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
															src: avatar.image,
															alt: avatar.label,
															className: "w-full h-full object-cover rounded-full"
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[11px] font-bold text-slate-600 mt-1 block truncate max-w-[70px] text-center",
														children: avatar.label
													}),
													selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "avatar-selected-check",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
															size: 14,
															strokeWidth: 4
														})
													})
												]
											}, avatar.id);
										})
									}),
									avatarMode === "upload" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "bg-slate-50 border-2 border-dashed border-sky-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all hover:bg-sky-50/50",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "file",
											ref: fileInputRef,
											accept: "image/*",
											onChange: handleFileUpload,
											className: "hidden"
										}), customPhotoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: customPhotoUrl,
													alt: "Kid preview",
													className: "w-24 h-24 rounded-full object-cover border-4 border-sky-400 shadow-lg"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
														size: 14,
														strokeWidth: 3
													})
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: () => fileInputRef.current?.click(),
													className: "px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { size: 13 }), "Change Photo"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: () => {
														playPopSound();
														setCustomPhotoUrl(null);
														setAvatarMode("cartoon");
													},
													className: "px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-bold rounded-xl transition flex items-center gap-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 13 }), "Remove"]
												})]
											})]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											onClick: () => fileInputRef.current?.click(),
											className: "cursor-pointer flex flex-col items-center py-2 space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "w-16 h-16 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shadow-inner",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { size: 28 })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-extrabold text-slate-800",
												children: "Click or drag kid photo here"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-slate-400 mt-0.5",
												children: "PNG, JPG, or GIF (max 8MB)"
											})] })]
										})]
									})
								]
							}),
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "add-profile-error",
								children: error
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
								whileHover: { scale: 1.03 },
								whileTap: { scale: .97 },
								type: "button",
								className: "create-buddy-button shadow-lg",
								onClick: handleCreate,
								children: ["Create Buddy ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🎉" })]
							})
						]
					})
				]
			})]
		})]
	});
}
function DeviceLocked({ onParentUnlock, onChangeProfile }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "device-locked-page",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "device-locked-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "device-lock-icon",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { size: 48 })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Time for a Break!" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A parent has temporarily paused videos on this device." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "device-locked-actions",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "parent-unlock-button",
						onClick: onParentUnlock,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 21 }), "Parent Unlock"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "change-profile-button",
						onClick: onChangeProfile,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 21 }), "Change Profile"]
					})]
				})
			]
		})
	});
}
var profileEmojis = [
	"🦁",
	"🐼",
	"🐰",
	"🐻",
	"🦊",
	"🐸"
];
var profileColors = [
	"#ffa62b",
	"#95d5b2",
	"#ff8fa3",
	"#8ecae6",
	"#c89f7a",
	"#b8e986"
];
function getDatabaseProfileEmoji(childId) {
	return profileEmojis[Math.abs(childId) % profileEmojis.length];
}
function getDatabaseProfileColor(childId) {
	return profileColors[Math.abs(childId) % profileColors.length];
}
function DatabaseProfileSelection({ children, loading, error, parentName, onSelectChild, onRetry, onLogout }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "database-profile-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "database-profile-header",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Connected parent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: parentName })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onLogout,
				children: "Sign Out"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "database-profile-content",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "database-profile-title",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "☁️ ⭐ 🌈" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Who's Watching?" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "These profiles are loaded from the SARA Tube PostgreSQL database." })
					]
				}),
				loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "database-profile-status",
					children: "Loading child profiles..."
				}),
				error && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "database-profile-error",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Could not load profiles" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: error }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onRetry,
							children: "Try Again"
						})
					]
				}),
				!loading && !error && children.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "database-profile-status",
					children: "No child profiles exist for this parent."
				}),
				!loading && !error && children.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "database-profile-grid",
					children: children.map((child) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "database-profile-card",
						onClick: () => onSelectChild(child),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "database-profile-avatar",
								style: { backgroundColor: getDatabaseProfileColor(child.id) },
								children: child.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: child.avatar_url,
									alt: child.display_name
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: getDatabaseProfileEmoji(child.id) })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: child.display_name }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: child.age ? `Age ${child.age}` : "Child profile" })
						]
					}, `database-child-${child.id}`))
				})
			]
		})]
	});
}
var appThemes = [
	{
		id: "daylight",
		name: "Bright Daylight",
		emoji: "☀️",
		badge: "Classic",
		bgGradient: "from-amber-100/60 via-pink-100/40 to-sky-100/60",
		cardBg: "rgba(255, 255, 255, 0.88)",
		accentColor: "#ff6b9d",
		buttonBg: "linear-gradient(135deg, #ff72aa, #8b7cff)"
	},
	{
		id: "space",
		name: "Space Explorer",
		emoji: "🌌",
		badge: "Cosmic",
		bgGradient: "from-slate-900 via-indigo-950 to-purple-950",
		cardBg: "rgba(30, 27, 75, 0.85)",
		accentColor: "#38bdf8",
		buttonBg: "linear-gradient(135deg, #06b6d4, #8b5cf6)"
	},
	{
		id: "jungle",
		name: "Jungle Safari",
		emoji: "🌴",
		badge: "Adventure",
		bgGradient: "from-emerald-100 via-teal-50 to-amber-100/70",
		cardBg: "rgba(255, 255, 255, 0.88)",
		accentColor: "#10b981",
		buttonBg: "linear-gradient(135deg, #10b981, #059669)"
	},
	{
		id: "magic",
		name: "Magic Kingdom",
		emoji: "🦄",
		badge: "Sparkle",
		bgGradient: "from-pink-100 via-purple-100 to-indigo-100",
		cardBg: "rgba(255, 255, 255, 0.9)",
		accentColor: "#ec4899",
		buttonBg: "linear-gradient(135deg, #ec4899, #a855f7)"
	},
	{
		id: "dino",
		name: "Dino World",
		emoji: "🦖",
		badge: "Prehistoric",
		bgGradient: "from-orange-100 via-amber-50 to-lime-100/60",
		cardBg: "rgba(255, 255, 255, 0.88)",
		accentColor: "#f97316",
		buttonBg: "linear-gradient(135deg, #f97316, #eab308)"
	},
	{
		id: "night",
		name: "Cozy Night",
		emoji: "🌙",
		badge: "Bedtime",
		bgGradient: "from-slate-950 via-blue-950 to-slate-900",
		cardBg: "rgba(15, 23, 42, 0.88)",
		accentColor: "#818cf8",
		buttonBg: "linear-gradient(135deg, #6366f1, #3b82f6)"
	}
];
function getStoredTheme() {
	try {
		const saved = localStorage.getItem("sasa-app-theme");
		if (saved && appThemes.some((t) => t.id === saved)) return saved;
	} catch {}
	return "daylight";
}
function setStoredTheme(themeId) {
	try {
		localStorage.setItem("sasa-app-theme", themeId);
		document.documentElement.setAttribute("data-theme", themeId);
	} catch {}
}
var BRUSH_COLORS = [
	"#f43f5e",
	"#fb923c",
	"#facc15",
	"#4ade80",
	"#38bdf8",
	"#a855f7",
	"#f472b6",
	"#0f172a",
	"#ffffff",
	"#eab308"
];
var STAMPS = [
	"🐧",
	"🌟",
	"🎈",
	"🐶",
	"👑",
	"🌈",
	"🎨",
	"🚀",
	"🐥",
	"🦄"
];
var BG_COLORS = [
	{
		name: "White Canvas",
		value: "#ffffff"
	},
	{
		name: "Sky Blue",
		value: "#e0f2fe"
	},
	{
		name: "Pastel Pink",
		value: "#fce7f3"
	},
	{
		name: "Mint Green",
		value: "#d1fae5"
	},
	{
		name: "Night Sky",
		value: "#0f172a"
	}
];
function KidsDrawingStudio() {
	const canvasRef = (0, import_react.useRef)(null);
	const [selectedColor, setSelectedColor] = (0, import_react.useState)(BRUSH_COLORS[0]);
	const [brushSize, setBrushSize] = (0, import_react.useState)(12);
	const [tool, setTool] = (0, import_react.useState)("brush");
	const [selectedStamp, setSelectedStamp] = (0, import_react.useState)(STAMPS[0]);
	const [canvasBg, setCanvasBg] = (0, import_react.useState)(BG_COLORS[0].value);
	const [isDrawing, setIsDrawing] = (0, import_react.useState)(false);
	const [history, setHistory] = (0, import_react.useState)([]);
	const [gallery, setGallery] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("sasa-kids-artworks");
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	});
	const [showGallery, setShowGallery] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width * 2;
		canvas.height = rect.height * 2;
		ctx.scale(2, 2);
		ctx.fillStyle = canvasBg;
		ctx.fillRect(0, 0, rect.width, rect.height);
		saveState();
	}, []);
	const handleChangeBg = (color) => {
		playPopSound();
		setCanvasBg(color);
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const rect = canvas.getBoundingClientRect();
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, rect.width, rect.height);
		saveState();
	};
	const saveState = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		setHistory((prev) => [...prev.slice(-10), imageData]);
	};
	const handleUndo = () => {
		if (history.length <= 1) return;
		playPopSound();
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const newHistory = [...history];
		newHistory.pop();
		const previousState = newHistory[newHistory.length - 1];
		ctx.putImageData(previousState, 0, 0);
		setHistory(newHistory);
	};
	const getCanvasCoords = (e) => {
		const canvas = canvasRef.current;
		if (!canvas) return {
			x: 0,
			y: 0
		};
		const rect = canvas.getBoundingClientRect();
		let clientX = 0;
		let clientY = 0;
		if ("touches" in e && e.touches.length > 0) {
			clientX = e.touches[0].clientX;
			clientY = e.touches[0].clientY;
		} else if ("clientX" in e) {
			clientX = e.clientX;
			clientY = e.clientY;
		}
		return {
			x: clientX - rect.left,
			y: clientY - rect.top
		};
	};
	const startDrawing = (e) => {
		const { x, y } = getCanvasCoords(e);
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		if (tool === "stamp") {
			playHeartSound();
			ctx.font = `${brushSize * 3.5}px sans-serif`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(selectedStamp, x, y);
			saveState();
			confetti_module_default({
				particleCount: 15,
				spread: 40,
				origin: {
					x: e.type.includes("touch") ? .5 : e.clientX / window.innerWidth,
					y: e.clientY / window.innerHeight
				}
			});
			return;
		}
		setIsDrawing(true);
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.strokeStyle = tool === "eraser" ? canvasBg : selectedColor;
		ctx.lineWidth = tool === "eraser" ? brushSize * 2 : brushSize;
	};
	const draw = (e) => {
		if (!isDrawing || tool === "stamp") return;
		const { x, y } = getCanvasCoords(e);
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.lineTo(x, y);
		ctx.stroke();
	};
	const stopDrawing = () => {
		if (isDrawing) {
			setIsDrawing(false);
			saveState();
		}
	};
	const clearCanvas = () => {
		playPopSound();
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const rect = canvas.getBoundingClientRect();
		ctx.fillStyle = canvasBg;
		ctx.fillRect(0, 0, rect.width, rect.height);
		saveState();
	};
	const saveArtwork = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		playSuccessSound();
		const imageURL = canvas.toDataURL("image/png");
		const updatedGallery = [imageURL, ...gallery.slice(0, 11)];
		setGallery(updatedGallery);
		localStorage.setItem("sasa-kids-artworks", JSON.stringify(updatedGallery));
		const link = document.createElement("a");
		link.download = `pippin_drawing_${Date.now()}.png`;
		link.href = imageURL;
		link.click();
		confetti_module_default({
			particleCount: 70,
			spread: 70,
			origin: { y: .6 }
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full max-w-4xl mx-auto flex flex-col gap-4 p-4 sm:p-6 bg-gradient-to-b from-sky-100 via-purple-50 to-pink-100 rounded-3xl border-4 border-white shadow-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-purple-100 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-10 h-10 rounded-full overflow-hidden border-2 border-purple-400 bg-sky-200 shadow-md",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: penguin_avatar_1784920051288_default,
							alt: "Pippin",
							className: "w-full h-full object-cover"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-lg font-black text-purple-900 tracking-tight flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pippin's Art Studio" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
							className: "text-amber-400",
							size: 18
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-bold text-purple-600",
						children: "Draw, paint & place stickers on your canvas!"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
							whileHover: { scale: 1.05 },
							whileTap: { scale: .95 },
							type: "button",
							onClick: handleUndo,
							disabled: history.length <= 1,
							className: "p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 font-bold text-xs flex items-center gap-1 cursor-pointer transition",
							title: "Undo",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Undo"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
							whileHover: { scale: 1.05 },
							whileTap: { scale: .95 },
							type: "button",
							onClick: clearCanvas,
							className: "p-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition",
							title: "Clear Canvas",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Clear"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
							whileHover: { scale: 1.05 },
							whileTap: { scale: .95 },
							type: "button",
							onClick: () => setShowGallery((v) => !v),
							className: "px-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"Gallery (",
								gallery.length,
								")"
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
							whileHover: { scale: 1.08 },
							whileTap: { scale: .92 },
							type: "button",
							onClick: saveArtwork,
							className: "px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Save Picture" })]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative w-full h-[380px] sm:h-[460px] rounded-3xl overflow-hidden shadow-inner border-4 border-purple-200 bg-white",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: canvasRef,
					onMouseDown: startDrawing,
					onMouseMove: draw,
					onMouseUp: stopDrawing,
					onMouseLeave: stopDrawing,
					onTouchStart: startDrawing,
					onTouchMove: draw,
					onTouchEnd: stopDrawing,
					className: "w-full h-full touch-none cursor-crosshair"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showGallery && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						scale: .95
					},
					animate: {
						opacity: 1,
						scale: 1
					},
					exit: {
						opacity: 0,
						scale: .95
					},
					className: "absolute inset-0 z-20 bg-slate-900/90 backdrop-blur-md p-6 text-white overflow-y-auto flex flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "text-xl font-black text-amber-300 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { size: 22 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "My Saved Artworks 🎨" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setShowGallery(false),
							className: "px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-xs",
							children: "Close Gallery"
						})]
					}), gallery.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "my-auto text-center text-slate-300",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-4xl mb-2",
								children: "🖼️"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-bold text-sm",
								children: "No drawings saved yet!"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-slate-400",
								children: "Draw something and tap \"Save Picture\" above!"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 sm:grid-cols-3 gap-4",
						children: gallery.map((img, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative rounded-2xl overflow-hidden border-2 border-white/20 group",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: img,
								alt: `Artwork ${idx}`,
								className: "w-full h-32 object-cover bg-white"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: img,
								download: `pippin_art_${idx}.png`,
								className: "absolute bottom-2 right-2 bg-amber-400 text-amber-950 p-2 rounded-full shadow-lg font-black text-xs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 14 })
							})]
						}, idx))
					})]
				}) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-12 gap-3 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-purple-100 shadow-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:col-span-4 flex items-center gap-2 bg-purple-50 p-1.5 rounded-2xl border border-purple-100",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								playPopSound();
								setTool("brush");
							},
							className: `flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${tool === "brush" ? "bg-purple-600 text-white shadow-md" : "text-purple-900 hover:bg-purple-100"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paintbrush, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Paint" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								playPopSound();
								setTool("stamp");
							},
							className: `flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${tool === "stamp" ? "bg-amber-500 text-white shadow-md" : "text-amber-900 hover:bg-amber-100"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smile, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Stickers" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								playPopSound();
								setTool("eraser");
							},
							className: `flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${tool === "eraser" ? "bg-rose-500 text-white shadow-md" : "text-rose-900 hover:bg-rose-100"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eraser, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Eraser" })]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:col-span-8 flex flex-col justify-center gap-2",
					children: [tool === "stamp" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 overflow-x-auto py-1 scrollbar-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-black text-amber-900 shrink-0",
							children: "Sticker:"
						}), STAMPS.map((stamp) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								playPopSound();
								setSelectedStamp(stamp);
							},
							className: `w-9 h-9 text-2xl rounded-xl flex items-center justify-center shrink-0 transition ${selectedStamp === stamp ? "bg-amber-200 border-2 border-amber-500 scale-110 shadow-sm" : "bg-slate-100 hover:bg-slate-200"}`,
							children: stamp
						}, stamp))]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 overflow-x-auto py-1 scrollbar-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-black text-purple-900 shrink-0",
							children: "Colors:"
						}), BRUSH_COLORS.map((color) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								playPopSound();
								setSelectedColor(color);
								if (tool === "eraser") setTool("brush");
							},
							style: { backgroundColor: color },
							className: `w-8 h-8 rounded-full shrink-0 transition border-2 ${selectedColor === color && tool === "brush" ? "ring-4 ring-purple-400 scale-110 border-white shadow-md" : "border-slate-300 hover:scale-105"}`
						}, color))]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-black text-slate-700",
								children: "Size:"
							}), [
								6,
								12,
								22,
								36
							].map((size) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setBrushSize(size),
								className: `w-7 h-7 rounded-full font-black text-xs flex items-center justify-center border transition ${brushSize === size ? "bg-purple-600 text-white border-purple-600 scale-110" : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"}`,
								children: size < 12 ? "•" : size < 22 ? "●" : "🔴"
							}, size))]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] font-extrabold text-slate-500",
								children: "Paper:"
							}), BG_COLORS.map((bg) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => handleChangeBg(bg.value),
								style: { backgroundColor: bg.value },
								className: `w-5 h-5 rounded-md border shadow-2xl transition ${canvasBg === bg.value ? "ring-2 ring-purple-600 scale-110" : "border-slate-300"}`,
								title: bg.name
							}, bg.name))]
						})]
					})]
				})]
			})
		]
	});
}
var CARDS_DATA = [
	{
		num: 1,
		label: "1",
		items: "🎈"
	},
	{
		num: 2,
		label: "2",
		items: "🐥🐥"
	},
	{
		num: 3,
		label: "3",
		items: "🌟🌟🌟"
	},
	{
		num: 4,
		label: "4",
		items: "🍎🍎🍎🍎"
	},
	{
		num: 5,
		label: "5",
		items: "🦋🦋🦋🦋🦋"
	},
	{
		num: 6,
		label: "6",
		items: "🚗🚗🚗🚗🚗🚗"
	}
];
function KidsGamesStudio() {
	const [activeGame, setActiveGame] = (0, import_react.useState)("memory");
	const [cards, setCards] = (0, import_react.useState)([]);
	const [flippedCards, setFlippedCards] = (0, import_react.useState)([]);
	const [score, setScore] = (0, import_react.useState)(0);
	const [streak, setStreak] = (0, import_react.useState)(0);
	const [gameWon, setGameWon] = (0, import_react.useState)(false);
	const [quizQuestionIndex, setQuizQuestionIndex] = (0, import_react.useState)(0);
	const [quizScore, setQuizScore] = (0, import_react.useState)(0);
	const quizQuestions = [
		{
			question: "Which number comes after 4?",
			options: [
				"3",
				"5",
				"7"
			],
			answer: "5",
			emoji: "🔢"
		},
		{
			question: "How many stars are here? 🌟 🌟 🌟",
			options: [
				"2",
				"3",
				"4"
			],
			answer: "3",
			emoji: "⭐"
		},
		{
			question: "Which animal swims in the ice with Pippin? 🐧",
			options: [
				"Penguin",
				"Monkey",
				"Koala"
			],
			answer: "Penguin",
			emoji: "❄️"
		},
		{
			question: "Count the apples: 🍎 🍎 🍎 🍎 🍎",
			options: [
				"5",
				"6",
				"4"
			],
			answer: "5",
			emoji: "🍎"
		}
	];
	const initMemoryGame = () => {
		playPopSound();
		const newCards = [];
		let idCounter = 1;
		CARDS_DATA.slice(0, 4).forEach((item) => {
			newCards.push({
				id: idCounter++,
				value: item.label,
				matchKey: item.num,
				type: "num",
				isFlipped: false,
				isMatched: false
			});
			newCards.push({
				id: idCounter++,
				value: item.items,
				matchKey: item.num,
				type: "items",
				isFlipped: false,
				isMatched: false
			});
		});
		setCards([...newCards].sort(() => Math.random() - .5));
		setFlippedCards([]);
		setScore(0);
		setGameWon(false);
	};
	(0, import_react.useEffect)(() => {
		initMemoryGame();
	}, []);
	const handleCardClick = (cardId) => {
		if (flippedCards.length === 2) return;
		const target = cards.find((c) => c.id === cardId);
		if (!target || target.isFlipped || target.isMatched) return;
		playPopSound();
		const updated = cards.map((c) => c.id === cardId ? {
			...c,
			isFlipped: true
		} : c);
		setCards(updated);
		const newFlipped = [...flippedCards, cardId];
		setFlippedCards(newFlipped);
		if (newFlipped.length === 2) {
			const firstCard = updated.find((c) => c.id === newFlipped[0]);
			const secondCard = updated.find((c) => c.id === newFlipped[1]);
			if (firstCard.matchKey === secondCard.matchKey) {
				playSuccessSound();
				setTimeout(() => {
					setCards((prev) => prev.map((c) => c.matchKey === firstCard.matchKey ? {
						...c,
						isMatched: true
					} : c));
					setFlippedCards([]);
					setScore((s) => s + 10);
					setStreak((st) => st + 1);
					if (updated.filter((c) => !c.isMatched && c.matchKey !== firstCard.matchKey).length === 0) {
						setGameWon(true);
						confetti_module_default({
							particleCount: 100,
							spread: 80,
							origin: { y: .6 }
						});
					}
				}, 500);
			} else setTimeout(() => {
				setCards((prev) => prev.map((c) => c.id === newFlipped[0] || c.id === newFlipped[1] ? {
					...c,
					isFlipped: false
				} : c));
				setFlippedCards([]);
				setStreak(0);
			}, 1e3);
		}
	};
	const handleQuizAnswer = (option) => {
		if (option === quizQuestions[quizQuestionIndex].answer) {
			playSuccessSound();
			setQuizScore((s) => s + 1);
			confetti_module_default({
				particleCount: 30,
				spread: 50
			});
		} else playPopSound();
		if (quizQuestionIndex + 1 < quizQuestions.length) setQuizQuestionIndex((prev) => prev + 1);
		else setGameWon(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full max-w-4xl mx-auto flex flex-col gap-4 p-4 sm:p-6 bg-gradient-to-b from-indigo-900 via-sky-900 to-slate-900 text-white rounded-3xl border-4 border-sky-400 shadow-2xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-10 h-10 rounded-full overflow-hidden border-2 border-amber-300 bg-sky-200",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: penguin_avatar_1784920051288_default,
						alt: "Pippin",
						className: "w-full h-full object-cover"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-lg font-black text-amber-300 tracking-tight flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pippin's Fun Arcade" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gamepad2, {
						className: "text-sky-300",
						size: 18
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-bold text-sky-200",
					children: "Play mini-games, earn stars & learn numbers!"
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex bg-slate-950/60 p-1 rounded-xl border border-white/10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						playPopSound();
						setActiveGame("memory");
						setGameWon(false);
					},
					className: `px-3 py-1.5 rounded-lg text-xs font-black transition ${activeGame === "memory" ? "bg-amber-400 text-amber-950 shadow-md" : "text-slate-300 hover:text-white"}`,
					children: "🧩 Number Match"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						playPopSound();
						setActiveGame("quiz");
						setQuizQuestionIndex(0);
						setQuizScore(0);
						setGameWon(false);
					},
					className: `px-3 py-1.5 rounded-lg text-xs font-black transition ${activeGame === "quiz" ? "bg-amber-400 text-amber-950 shadow-md" : "text-slate-300 hover:text-white"}`,
					children: "⭐ Kids Quiz"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-[360px] flex flex-col justify-center items-center py-6 relative",
			children: gameWon ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				initial: {
					scale: .8,
					opacity: 0
				},
				animate: {
					scale: 1,
					opacity: 1
				},
				className: "text-center p-6 bg-white/15 backdrop-blur-md rounded-3xl border-2 border-amber-300 max-w-md w-full shadow-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-20 h-20 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-4xl mx-auto mb-3 shadow-lg animate-bounce",
						children: "👑"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-2xl font-black text-amber-300",
						children: "YOU ARE A WINNER!"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-sky-100 mt-1 font-medium",
						children: "Pippin is super proud of you! You earned 3 Gold Stars!"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center justify-center gap-2 my-4 text-3xl",
						children: "⭐ ⭐ ⭐"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							if (activeGame === "memory") initMemoryGame();
							else {
								setQuizQuestionIndex(0);
								setQuizScore(0);
								setGameWon(false);
							}
						},
						className: "px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-lg transition inline-flex items-center gap-2 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Play Again" })]
					})
				]
			}) : activeGame === "memory" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full flex flex-col items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-xl w-full",
					children: cards.map((card) => {
						const showContent = card.isFlipped || card.isMatched;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
							whileHover: { scale: 1.05 },
							whileTap: { scale: .92 },
							type: "button",
							onClick: () => handleCardClick(card.id),
							className: `h-28 sm:h-32 rounded-2xl border-4 font-black text-2xl sm:text-3xl flex flex-col items-center justify-center transition shadow-xl cursor-pointer ${card.isMatched ? "bg-emerald-500/30 border-emerald-400 text-emerald-200 opacity-60" : showContent ? "bg-amber-400 text-amber-950 border-white" : "bg-sky-700 hover:bg-sky-600 border-sky-400 text-sky-200"}`,
							children: showContent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "p-2 text-center leading-tight break-all max-w-full",
								children: card.value
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-3xl opacity-80",
								children: "❓"
							})
						}, card.id);
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: initMemoryGame,
					className: "mt-6 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sky-200 font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Shuffle Cards" })]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-md w-full bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center flex flex-col items-center shadow-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-4xl mb-2",
						children: quizQuestions[quizQuestionIndex].emoji
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs font-bold text-amber-300 uppercase tracking-widest",
						children: [
							"Question ",
							quizQuestionIndex + 1,
							" of ",
							quizQuestions.length
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xl font-black text-white my-3",
						children: quizQuestions[quizQuestionIndex].question
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-2.5 w-full mt-2",
						children: quizQuestions[quizQuestionIndex].options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
							whileHover: { scale: 1.03 },
							whileTap: { scale: .95 },
							type: "button",
							onClick: () => handleQuizAnswer(option),
							className: "w-full py-3 px-4 rounded-2xl bg-white/20 hover:bg-amber-400 hover:text-amber-950 font-black text-base transition shadow-md border border-white/10 cursor-pointer",
							children: option
						}, option))
					})
				]
			})
		})]
	});
}
var SONGS = [
	{
		id: 1,
		title: "Twinkle Twinkle Little Star",
		artist: "Nursery Rhyme",
		emoji: "⭐",
		duration: 32,
		color: "#f59e0b",
		bgGradient: "from-amber-400 via-orange-500 to-amber-600",
		notes: [
			{
				freq: 261.63,
				duration: .5
			},
			{
				freq: 261.63,
				duration: .5
			},
			{
				freq: 392,
				duration: .5
			},
			{
				freq: 392,
				duration: .5
			},
			{
				freq: 440,
				duration: .5
			},
			{
				freq: 440,
				duration: .5
			},
			{
				freq: 392,
				duration: 1
			},
			{
				freq: 349.23,
				duration: .5
			},
			{
				freq: 349.23,
				duration: .5
			},
			{
				freq: 329.63,
				duration: .5
			},
			{
				freq: 329.63,
				duration: .5
			},
			{
				freq: 293.66,
				duration: .5
			},
			{
				freq: 293.66,
				duration: .5
			},
			{
				freq: 261.63,
				duration: 1
			}
		],
		lyrics: [
			"Twinkle, twinkle, little star, 🌟",
			"How I wonder what you are! ✨",
			"Up above the world so high, ☁️",
			"Like a diamond in the sky. 💎",
			"Twinkle, twinkle, little star, ⭐",
			"How I wonder what you are! 💖"
		]
	},
	{
		id: 2,
		title: "The ABC Alphabet Song",
		artist: "Learning Tunes",
		emoji: "🔤",
		duration: 28,
		color: "#8b5cf6",
		bgGradient: "from-purple-500 via-indigo-600 to-purple-700",
		notes: [
			{
				freq: 261.63,
				duration: .4
			},
			{
				freq: 261.63,
				duration: .4
			},
			{
				freq: 392,
				duration: .4
			},
			{
				freq: 392,
				duration: .4
			},
			{
				freq: 440,
				duration: .4
			},
			{
				freq: 440,
				duration: .4
			},
			{
				freq: 392,
				duration: .8
			},
			{
				freq: 349.23,
				duration: .4
			},
			{
				freq: 349.23,
				duration: .4
			},
			{
				freq: 329.63,
				duration: .4
			},
			{
				freq: 329.63,
				duration: .4
			},
			{
				freq: 293.66,
				duration: .4
			},
			{
				freq: 293.66,
				duration: .4
			},
			{
				freq: 261.63,
				duration: .8
			}
		],
		lyrics: [
			"A B C D E F G 🎵",
			"H I J K L M N O P 🎶",
			"Q R S, T U V 🌟",
			"W X Y and Z! 🚀",
			"Now I know my ABCs, 🎉",
			"Next time won't you sing with me! ❤️"
		]
	},
	{
		id: 3,
		title: "Old MacDonald Had a Farm",
		artist: "Farm Animals",
		emoji: "🐮",
		duration: 35,
		color: "#10b981",
		bgGradient: "from-emerald-400 via-teal-500 to-green-600",
		notes: [
			{
				freq: 261.63,
				duration: .4
			},
			{
				freq: 261.63,
				duration: .4
			},
			{
				freq: 261.63,
				duration: .4
			},
			{
				freq: 196,
				duration: .4
			},
			{
				freq: 220,
				duration: .4
			},
			{
				freq: 220,
				duration: .4
			},
			{
				freq: 196,
				duration: .8
			},
			{
				freq: 329.63,
				duration: .4
			},
			{
				freq: 329.63,
				duration: .4
			},
			{
				freq: 293.66,
				duration: .4
			},
			{
				freq: 293.66,
				duration: .4
			},
			{
				freq: 261.63,
				duration: .8
			}
		],
		lyrics: [
			"Old MacDonald had a farm, E-I-E-I-O! 🚜",
			"And on his farm he had a cow, E-I-E-I-O! 🐮",
			"With a moo-moo here, and a moo-moo there! 🌾",
			"Here a moo, there a moo, everywhere a moo-moo! 🐮",
			"Old MacDonald had a farm, E-I-E-I-O! 🎉"
		]
	},
	{
		id: 4,
		title: "The Wheels on the Bus",
		artist: "City Adventures",
		emoji: "🚌",
		duration: 30,
		color: "#ef4444",
		bgGradient: "from-red-500 via-rose-600 to-pink-600",
		notes: [
			{
				freq: 261.63,
				duration: .4
			},
			{
				freq: 329.63,
				duration: .4
			},
			{
				freq: 392,
				duration: .4
			},
			{
				freq: 329.63,
				duration: .4
			},
			{
				freq: 261.63,
				duration: .4
			},
			{
				freq: 329.63,
				duration: .4
			},
			{
				freq: 392,
				duration: .8
			},
			{
				freq: 349.23,
				duration: .4
			},
			{
				freq: 329.63,
				duration: .4
			},
			{
				freq: 293.66,
				duration: .4
			},
			{
				freq: 261.63,
				duration: .8
			}
		],
		lyrics: [
			"The wheels on the bus go round and round! 🚌",
			"Round and round, round and round! 🔄",
			"The wheels on the bus go round and round, 🚌",
			"All through the town! 🌆",
			"The wipers on the bus go swish, swish, swish! 🌧️",
			"All through the town! 💖"
		]
	},
	{
		id: 5,
		title: "Five Little Ducks",
		artist: "Pippin & Friends",
		emoji: "🐥",
		duration: 26,
		color: "#06b6d4",
		bgGradient: "from-cyan-400 via-sky-500 to-blue-600",
		notes: [
			{
				freq: 392,
				duration: .4
			},
			{
				freq: 392,
				duration: .4
			},
			{
				freq: 329.63,
				duration: .4
			},
			{
				freq: 261.63,
				duration: .4
			},
			{
				freq: 293.66,
				duration: .4
			},
			{
				freq: 329.63,
				duration: .4
			},
			{
				freq: 261.63,
				duration: .8
			}
		],
		lyrics: [
			"Five little ducks went out one day, 🐥",
			"Over the hill and far away! 🏞️",
			"Mother duck said, \"Quack, quack, quack, quack!\" 🦆",
			"But only four little ducks came back! 🐥",
			"Quack quack quack quack! 🎉"
		]
	}
];
function KidsSongsStudio() {
	const [currentSongIndex, setCurrentSongIndex] = (0, import_react.useState)(0);
	const [isPlaying, setIsPlaying] = (0, import_react.useState)(false);
	const [currentTime, setCurrentTime] = (0, import_react.useState)(0);
	const [isMuted, setIsMuted] = (0, import_react.useState)(false);
	const [favorites, setFavorites] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("sasa-favorite-songs");
			return saved ? JSON.parse(saved) : [1];
		} catch {
			return [1];
		}
	});
	const song = SONGS[currentSongIndex];
	const isFavorite = favorites.includes(song.id);
	const audioCtxRef = (0, import_react.useRef)(null);
	const timerRef = (0, import_react.useRef)(null);
	const noteIndexRef = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		if (!isPlaying) {
			if (timerRef.current) clearInterval(timerRef.current);
			return;
		}
		const playNextNote = () => {
			try {
				if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
				const ctx = audioCtxRef.current;
				if (ctx.state === "suspended") ctx.resume();
				if (!isMuted) {
					const note = song.notes[noteIndexRef.current % song.notes.length];
					const osc = ctx.createOscillator();
					const gain = ctx.createGain();
					osc.type = "triangle";
					osc.frequency.setValueAtTime(note.freq, ctx.currentTime);
					gain.gain.setValueAtTime(.12, ctx.currentTime);
					gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + note.duration);
					osc.connect(gain);
					gain.connect(ctx.destination);
					osc.start();
					osc.stop(ctx.currentTime + note.duration);
				}
				noteIndexRef.current += 1;
			} catch {}
		};
		playNextNote();
		const interval = setInterval(() => {
			setCurrentTime((prev) => {
				if (prev >= song.duration) {
					setIsPlaying(false);
					return 0;
				}
				return prev + 1;
			});
			playNextNote();
		}, 1e3);
		timerRef.current = window.setInterval(() => {}, 1e3);
		return () => {
			clearInterval(interval);
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [
		isPlaying,
		currentSongIndex,
		isMuted,
		song
	]);
	const handleTogglePlay = () => {
		if (!isPlaying) {
			playSuccessSound();
			setIsPlaying(true);
			confetti_module_default({
				particleCount: 20,
				spread: 50,
				origin: {
					x: .5,
					y: .6
				},
				colors: [
					"#f59e0b",
					"#8b5cf6",
					"#10b981",
					"#ef4444"
				]
			});
		} else {
			playPopSound();
			setIsPlaying(false);
		}
	};
	const handleNextSong = () => {
		playPopSound();
		noteIndexRef.current = 0;
		setCurrentTime(0);
		setCurrentSongIndex((prev) => (prev + 1) % SONGS.length);
	};
	const handlePrevSong = () => {
		playPopSound();
		noteIndexRef.current = 0;
		setCurrentTime(0);
		setCurrentSongIndex((prev) => (prev - 1 + SONGS.length) % SONGS.length);
	};
	const handleToggleFavorite = () => {
		const updated = isFavorite ? favorites.filter((id) => id !== song.id) : [...favorites, song.id];
		setFavorites(updated);
		localStorage.setItem("sasa-favorite-songs", JSON.stringify(updated));
		if (!isFavorite) {
			playHeartSound();
			confetti_module_default({
				particleCount: 25,
				spread: 60,
				origin: {
					x: .5,
					y: .5
				},
				colors: [
					"#ff72aa",
					"#ffb703",
					"#fb8500"
				]
			});
		} else playPopSound();
	};
	const currentLyricIndex = Math.min(Math.floor(currentTime / song.duration * song.lyrics.length), song.lyrics.length - 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl mx-auto w-full flex flex-col gap-5 p-4 sm:p-6 bg-white/95 backdrop-blur-md rounded-3xl border-4 border-amber-200 shadow-xl my-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `p-5 rounded-3xl bg-gradient-to-r ${song.bgGradient} text-white shadow-lg flex items-center justify-between relative overflow-hidden`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						animate: isPlaying ? { rotate: 360 } : { rotate: 0 },
						transition: isPlaying ? {
							repeat: Infinity,
							duration: 6,
							ease: "linear"
						} : { duration: .5 },
						className: "w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/40 flex items-center justify-center text-4xl shadow-inner shrink-0",
						children: song.emoji
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[10px] sm:text-xs font-black uppercase text-amber-200 tracking-wider flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 13 }), " Sing-Along Nursery Rhymes"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl sm:text-2xl font-black drop-shadow-sm",
							children: song.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-bold text-white/90",
							children: song.artist
						})
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
					whileHover: { scale: 1.1 },
					whileTap: { scale: .9 },
					type: "button",
					onClick: handleToggleFavorite,
					className: `p-3 rounded-2xl shadow-md border-2 transition cursor-pointer shrink-0 ${isFavorite ? "bg-pink-500 border-pink-300 text-white" : "bg-white/20 border-white/40 text-white"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
						size: 22,
						fill: isFavorite ? "currentColor" : "none"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-inner flex flex-col items-center justify-center text-center gap-3 relative min-h-[160px] overflow-hidden",
				children: [
					isPlaying && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 pointer-events-none opacity-20 flex items-center justify-around",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, {
								className: "animate-bounce text-amber-300",
								size: 32
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
								className: "animate-pulse text-purple-300",
								size: 28
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disc, {
								className: "animate-spin text-pink-300",
								size: 36
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
						mode: "wait",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
							initial: {
								opacity: 0,
								y: 10,
								scale: .95
							},
							animate: {
								opacity: 1,
								y: 0,
								scale: 1
							},
							exit: {
								opacity: 0,
								y: -10,
								scale: .95
							},
							className: "text-lg sm:text-2xl font-black text-amber-300 drop-shadow-md px-2",
							children: song.lyrics[currentLyricIndex] || song.lyrics[0]
						}, currentLyricIndex)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-bold text-slate-400",
						children: [
							"Line ",
							currentLyricIndex + 1,
							" of ",
							song.lyrics.length,
							" • Keep singing! 🎤"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 p-4 bg-amber-50/80 rounded-2xl border border-amber-200",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-xs font-black text-amber-900",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["0:", (currentTime % 60).toString().padStart(2, "0")] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1 mx-3 h-3 bg-amber-200 rounded-full overflow-hidden relative",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
								className: "h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full",
								style: { width: `${currentTime / song.duration * 100}%` }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["0:", song.duration] })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between pt-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setIsMuted(!isMuted),
							className: "p-2.5 rounded-xl bg-white text-amber-800 border border-amber-300 hover:bg-amber-100 transition cursor-pointer",
							title: isMuted ? "Unmute" : "Mute",
							children: isMuted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { size: 18 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { size: 18 })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
									whileHover: { scale: 1.1 },
									whileTap: { scale: .9 },
									type: "button",
									onClick: handlePrevSong,
									className: "p-3 rounded-2xl bg-white text-slate-800 border-2 border-slate-200 shadow-sm hover:bg-slate-100 transition cursor-pointer",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { size: 20 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
									whileHover: { scale: 1.08 },
									whileTap: { scale: .92 },
									type: "button",
									onClick: handleTogglePlay,
									className: `p-4 rounded-3xl text-white font-black shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${isPlaying ? "bg-amber-500 hover:bg-amber-600" : "bg-purple-600 hover:bg-purple-700"}`,
									children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {
										size: 26,
										fill: "currentColor"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
										size: 26,
										fill: "currentColor"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
									whileHover: { scale: 1.1 },
									whileTap: { scale: .9 },
									type: "button",
									onClick: handleNextSong,
									className: "p-3 rounded-2xl bg-white text-slate-800 border-2 border-slate-200 shadow-sm hover:bg-slate-100 transition cursor-pointer",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { size: 20 })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs font-black text-amber-800 px-2",
							children: [
								"Song ",
								currentSongIndex + 1,
								"/",
								SONGS.length
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, {
						size: 16,
						className: "text-purple-600"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"More Nursery Rhymes Playlist (",
						SONGS.length,
						")"
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 gap-2",
					children: SONGS.map((s, idx) => {
						const active = idx === currentSongIndex;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								playPopSound();
								noteIndexRef.current = 0;
								setCurrentTime(0);
								setCurrentSongIndex(idx);
								setIsPlaying(true);
							},
							className: `p-3 rounded-2xl border-2 flex items-center gap-3 text-left transition cursor-pointer ${active ? "bg-amber-100 border-amber-400 shadow-md scale-[1.01]" : "bg-white hover:bg-slate-50 border-slate-200 shadow-sm"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-10 h-10 rounded-xl bg-slate-100 text-2xl flex items-center justify-center shrink-0",
									children: s.emoji
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-black text-slate-900 truncate",
										children: s.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[10px] font-bold text-slate-500",
										children: [
											s.artist,
											" • 0:",
											s.duration
										]
									})]
								}),
								active && isPlaying && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
									size: 16,
									className: "text-amber-600 animate-spin shrink-0"
								})
							]
						}, s.id);
					})
				})]
			})
		]
	});
}
var numbers_kids_video_1784920463079_default = "/assets/numbers_kids_video_1784920463079-BPB5loUy.jpg";
var categories = [
	{
		name: "Numbers",
		image: numbers_kids_video_1784920463079_default
	},
	{
		name: "Animals",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjAp5NZ48TuzQUwagJX3BEsOoRnHOfOQFRiaHzC_6VTHBusH5vdnyE-dw2wknaAdkSD_sTsjy4_S035njloXzb9SfVsBpcozUKLuAk_Ru8t6VD9syxltNOKUoSvF3oUXsLo8akWhFvxPSm2k8HawcXFK9cvfvBSAUSSj-l_0flPJq2RHEuQ0kZCj_WR_krtqKF_ZdJ7EFdeLJYMLZRPv_YRK6UERduzBqHzOsLRKnUVUsh20dZNsLaXSmOmukV0-omLmxDf1yuxsA"
	},
	{
		name: "Science",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHx_6VcyyyAkMrQ7Y-w-OURZAkou1lzLfFPib9MJvZ8Q474OGB979tU1_jyn_95spx9jIpSNEy85GZQopqNO0YfQ9pUBwLBuUHqOTLbPJ5of_LNsURwBaiZi3QIy5je5_p64nOmb_s4c_6o5NBFDnM00Ova9JScEElI9-jWPKobWVu9oXtbNfP3_831wYXyLFyVhtH9oYsNKShDEFyZj5ao_bC8_QH_i0D4NSHwZDg0iZDGPhm6ZUApCXn67AXGvsf6S8g6rW_uOo"
	},
	{
		name: "Music",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1Xbm9EFIAa_mvtnoDyzgtc-A7uv8qtl0H_QNFVxh_WPQMF9XSYZ5oSoHBEMAtRXUi88dYmVPx_NAoLEZmVVTT4zjVdlMLl3fAT5IXLbgAsx8fnF440SBIgWZPAkymQlht1Z6NlIVJhHiLDMxYkRbdG27zpypLTYY8hQEFwTUNt_KY_u58FDDX9sPm4sNKmSfNds47k4N0SBuwe3uu1k5WmnsHMxhxacfccE_jj5avy0fi0PQr-5I7cyEhMK702e3wlHKCooQGqXE"
	},
	{
		name: "Space",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBV2uFqV3SsOxGG5OZoIPxSK9n-z2uooMZoXphzsg7XNM_7SOnRPS-T5nk0rwvrJjl8gUyds1SkY_Jpk2XkRWF-cQLWjcXXwtG8fD5gaYqbhKO8ZedsubYFwOwwEHx7TKGdAqG-GrMzOyKejZlU9mAfQ3f-lCVUM1HSnlw4vK9VBxcc_DLbVchaJ2XXzovD_bHU6AWHEdIOU5hgJyd1aOgZU2Yph7EIVdcucHErhwbhR_9agLdyYpNOLUXwgLiaj9qd6f_Wbyxjd8I"
	}
];
var kidsVideos = [
	{
		id: 7,
		title: "Learn Numbers 1 to 10 with Pippin!",
		duration: "04:30",
		category: "Numbers",
		image: numbers_kids_video_1784920463079_default
	},
	{
		id: 1,
		title: "Learn to Count with Dinosaurs!",
		duration: "10:15",
		category: "Numbers",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjwcBvDtG1fe9LxHnoNeNrMGk4fTivdubiwP3TV_DPY0hq0PJKfoljdtzGCLvfWssM7kOIgxD91CkIQjV5T4wDSnMhK8XBfG8BW0ML4IYpsgiKhz8Anpj6pMGuINoL8YZOGFOedj-GecrNAlbW6xYDigch_X_Poia5K8nEDaa-WRCCeNtM4KsoU_LRARwtMPxvsh-5KfqA1iLf5Mgs1uQxd8GjNjHCvVNalC6ezmoLMkoLE6znAFA1tB7fDx5zhsVYhr49qiEXBpc"
	},
	{
		id: 2,
		title: "The Amazing Solar System",
		duration: "15:30",
		category: "Space",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYCIE5ObL0I7VLAVlu9S4guu3tZis6FpFWIbfo3lt8h7YwHELMjkXWpUm22oWdAvXGzdDqARBkSTL-G5nSSoHo0pby2o8GRQjz0iOlERwoh7WQoQieYKB7ey9KRjIunSXvRvXqfz95W-oOhohOmbwvGo7_9ha9VsYEH2DUbRvqXHWcYV5ZiTBQ0onEHIbr1qx7IHfklS01xpqKgxnOHpEY3zF0dgZZ7ncmW4uRlf1yLPkdr-oaAuDESMde65XhKhFE5lOOx9MnGS8"
	},
	{
		id: 3,
		title: "Sing-Along Nursery Rhymes",
		duration: "5:00",
		category: "Music",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBngTUq4TMGud68bpX563YhKS8fpUybHgPm2FagY7uqjDSjn5YnxN8QITXS3cqI1VSAKAySB6-GzuEXMNY38P1zE1hvCSwk9C0WUZwvOG1mwB40_k4Jl5rexXug-ap7N0H9j2JlCEHM-y7B7m14hTzTRm5PZcXs3ipLcNfFe_Jh7nTWeIOxB3luWZzuCZ2cr6_DOgUJS4T96D-WL0W1xUpoPWamZrCEa26f78ucd3uhaEVdHDv4f-paFw3t-nMDJcqNSYRdb1wQ7sQ"
	},
	{
		id: 4,
		title: "DIY Volcano Experiment",
		duration: "12:45",
		category: "Science",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAR6gvme4x0nZTflLk5canbiFllbfBKw-83LwR_D4Ea7GYRY8gTDi06DKL-1Vfmy-tPUivApwcH0LQf5jU1wOTdJQkGniE2iutdRwlnFibzzqKFCATB8OQwwndmGOHesq5NmBWUes66WDey5HENcFjeFZq3FCDmiz-3HIASq1Gqpo10NZOUYtk5XMr7sW8nkthJOAiWVFagHSq8rbaeyK418dVshiELkpoXUJEEbS4cNnDwLvAxeQx439IU6YDzVqYgVQQ8jINlF_c"
	},
	{
		id: 5,
		title: "Plant and Grow Together",
		duration: "10:10",
		category: "Science",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGoW-xoowXiPjR8TL8V7ULpkCvanUpu4zojqDQZ4HYJjoRiJma4RaYu_h-1UaDzr1B9OU95WqQkZvqNRwBajNMo7uRIvVsTfP6YnNanz_oVLCzFT7wufVJ8Gxa5Ko6JP0hxyP0NMEmmujaZFJh8dLXSWcdDD7bZCWSmpufjS8JAM_e4l3Z5iu2-OV-g2Ir-YYXnNiSJTi6t4-zes9z3INlewm5J7yjp2owcaoZmRUMR5SsE-cIvOfSFCj56zAL7mER7JXOl4WyGwY"
	},
	{
		id: 6,
		title: "Friendly Animal Adventure",
		duration: "8:20",
		category: "Animals",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOqr2ccQdse7AfIKOtjwamQ3RJS_kac37xmabWYdAvdrYc0wDWpKIIXEQOUxuyp8YcDZiy-KXKFXylUdmQEXwwJZZZQT8OER_GGE4MKTDQm7tpZZ9mOUfSnBpT3945Pb4IfPhiFyLTOf1nZwGCVupEyJgr9Eh77u28xt4yU1sI2RCxGqX5fKH2955kRFincic4iL0YZHgSudq2f7uRlbQo8kY2ze-hrRIUvu6MIcKCyFVtXa1752c9e7ZdJ_UheNXB4G1FHxKLZ_0"
	}
];
function loadLibrary() {
	try {
		const value = localStorage.getItem("sasa-video-library");
		return value ? JSON.parse(value) : [];
	} catch {
		return [];
	}
}
function loadBlockedVideoIds() {
	try {
		const saved = localStorage.getItem("sasa-parent-controls");
		if (!saved) return [];
		const settings = JSON.parse(saved);
		return Array.isArray(settings.blockedVideoIds) ? settings.blockedVideoIds : [];
	} catch {
		return [];
	}
}
var KID_AVATARS = [
	"🦁",
	"🐼",
	"🐰",
	"🐶",
	"🐧",
	"🐱",
	"🐒",
	"🐨",
	"🦄",
	"🐥",
	"🚀",
	"🌟",
	"👑",
	"🎨"
];
var BANNER_THEMES = [
	{
		id: "rainbow",
		name: "Rainbow",
		gradient: "from-purple-600 via-pink-500 to-amber-400",
		border: "border-amber-300"
	},
	{
		id: "ocean",
		name: "Ocean Sky",
		gradient: "from-sky-500 via-blue-600 to-indigo-700",
		border: "border-sky-300"
	},
	{
		id: "sunshine",
		name: "Sunshine",
		gradient: "from-amber-400 via-orange-500 to-red-500",
		border: "border-orange-300"
	},
	{
		id: "forest",
		name: "Mint Meadow",
		gradient: "from-emerald-400 via-teal-500 to-cyan-600",
		border: "border-emerald-300"
	}
];
function KidsVideoHome({ profileName, profileEmoji, profileImage, initialTab = "home", activeTab: activeTabProp, onTabChange, onOpenVideo, onOpenParentalControls, onChangeProfile, onOpenFreeAccount }) {
	const [currentTab, setCurrentTab] = (0, import_react.useState)(activeTabProp || initialTab);
	const [selectedCategory, setSelectedCategory] = (0, import_react.useState)("All");
	const [searchText, setSearchText] = (0, import_react.useState)("");
	const [libraryIds, setLibraryIds] = (0, import_react.useState)(loadLibrary);
	const [soundOn, setSoundOn] = (0, import_react.useState)(isSoundEnabled);
	const [showThemePicker, setShowThemePicker] = (0, import_react.useState)(false);
	const [showFreeModal, setShowFreeModal] = (0, import_react.useState)(false);
	const [currentTheme, setCurrentTheme] = (0, import_react.useState)(getStoredTheme);
	(0, import_react.useEffect)(() => {
		if (activeTabProp && activeTabProp !== currentTab) setCurrentTab(activeTabProp);
	}, [activeTabProp]);
	const [activeEmoji, setActiveEmoji] = (0, import_react.useState)(() => {
		return localStorage.getItem("sasa-active-kid-emoji") || profileEmoji;
	});
	const [activeName, setActiveName] = (0, import_react.useState)(() => {
		return localStorage.getItem("sasa-active-kid-name") || profileName;
	});
	const [activeImage, setActiveImage] = (0, import_react.useState)(() => {
		return profileImage || localStorage.getItem("sasa-active-kid-image") || void 0;
	});
	(0, import_react.useEffect)(() => {
		if (profileImage) {
			setActiveImage(profileImage);
			localStorage.setItem("sasa-active-kid-image", profileImage);
		} else if (profileImage === "") {
			setActiveImage(void 0);
			localStorage.removeItem("sasa-active-kid-image");
		}
	}, [profileImage]);
	(0, import_react.useEffect)(() => {
		if (profileName) {
			setActiveName(profileName);
			setTempName(profileName);
		}
		if (profileEmoji) setActiveEmoji(profileEmoji);
	}, [profileName, profileEmoji]);
	const [isEditingName, setIsEditingName] = (0, import_react.useState)(false);
	const [tempName, setTempName] = (0, import_react.useState)(activeName);
	const [bannerThemeId, setBannerThemeId] = (0, import_react.useState)(() => {
		return localStorage.getItem("sasa-kid-banner-theme") || "rainbow";
	});
	const [showAvatarPicker, setShowAvatarPicker] = (0, import_react.useState)(false);
	const [badgeToast, setBadgeToast] = (0, import_react.useState)(null);
	(0, import_react.useMemo)(() => {
		return BANNER_THEMES.find((t) => t.id === bannerThemeId) || BANNER_THEMES[0];
	}, [bannerThemeId]);
	const savedArtworksCount = (0, import_react.useMemo)(() => {
		try {
			const saved = localStorage.getItem("sasa-kids-artworks");
			return saved ? JSON.parse(saved).length : 0;
		} catch {
			return 0;
		}
	}, [currentTab]);
	(0, import_react.useMemo)(() => {
		return kidsVideos.filter((v) => libraryIds.includes(v.id));
	}, [libraryIds]);
	const handleSelectAvatar = (emoji, imageUrl) => {
		playSuccessSound();
		setActiveEmoji(emoji);
		localStorage.setItem("sasa-active-kid-emoji", emoji);
		if (imageUrl) {
			setActiveImage(imageUrl);
			localStorage.setItem("sasa-active-kid-image", imageUrl);
		} else {
			setActiveImage(void 0);
			localStorage.removeItem("sasa-active-kid-image");
		}
		setShowAvatarPicker(false);
	};
	const handleSaveName = () => {
		if (tempName.trim()) {
			playSuccessSound();
			setActiveName(tempName.trim());
			localStorage.setItem("sasa-active-kid-name", tempName.trim());
		}
		setIsEditingName(false);
	};
	const handleTapBadge = (title, msg, event) => {
		playSuccessSound();
		const rect = event.currentTarget.getBoundingClientRect();
		confetti_module_default({
			particleCount: 28,
			spread: 70,
			origin: {
				x: (rect.left + rect.width / 2) / window.innerWidth,
				y: (rect.top + rect.height / 2) / window.innerHeight
			},
			colors: [
				"#ff8fa3",
				"#ffa62b",
				"#ffde59",
				"#95d5b2",
				"#8ecae6"
			]
		});
		setBadgeToast(`🌟 Unlocked: ${title}! ${msg}`);
		setTimeout(() => setBadgeToast(null), 3500);
	};
	const displayedVideos = (0, import_react.useMemo)(() => {
		const blockedVideoIds = loadBlockedVideoIds();
		let list = kidsVideos.filter((video) => !blockedVideoIds.includes(video.id));
		if (currentTab === "library") list = list.filter((video) => libraryIds.includes(video.id));
		if (selectedCategory !== "All") list = list.filter((video) => video.category === selectedCategory);
		if (searchText.trim()) {
			const query = searchText.trim().toLowerCase();
			list = list.filter((video) => video.title.toLowerCase().includes(query) || video.category.toLowerCase().includes(query));
		}
		return list;
	}, [
		currentTab,
		libraryIds,
		searchText,
		selectedCategory
	]);
	const toggleLibrary = (videoId, event) => {
		event.stopPropagation();
		const isAdding = !libraryIds.includes(videoId);
		const updated = isAdding ? [...libraryIds, videoId] : libraryIds.filter((id) => id !== videoId);
		setLibraryIds(updated);
		localStorage.setItem("sasa-video-library", JSON.stringify(updated));
		if (isAdding) {
			playHeartSound();
			const rect = event.currentTarget.getBoundingClientRect();
			confetti_module_default({
				particleCount: 22,
				spread: 60,
				origin: {
					x: (rect.left + rect.width / 2) / window.innerWidth,
					y: (rect.top + rect.height / 2) / window.innerHeight
				},
				colors: [
					"#ff72aa",
					"#8b7cff",
					"#ffc107",
					"#2563eb"
				]
			});
		} else playPopSound();
	};
	const changeTab = (tab) => {
		playPopSound();
		setCurrentTab(tab);
		if (onTabChange) onTabChange(tab);
		setSearchText("");
		setSelectedCategory("All");
	};
	const handleToggleSound = () => {
		const nextState = !soundOn;
		setSoundOn(nextState);
		setSoundEnabled(nextState);
		if (nextState) playPopSound();
	};
	const handleSelectTheme = (themeId) => {
		playPopSound();
		setCurrentTheme(themeId);
		setStoredTheme(themeId);
		setShowThemePicker(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		className: "kids-video-home",
		initial: {
			opacity: 0,
			y: 12
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .35,
			ease: "easeOut"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "kids-video-sticky",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "kids-video-header flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between sm:justify-start gap-3 flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5 font-bold text-amber-200 text-xs sm:text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-lg sm:text-xl",
										children: profileEmoji
									}),
									" Hello, ",
									profileName,
									"!"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-xs",
								children: currentTab === "library" ? "My Library ❤️" : currentTab === "search" ? "Search Cartoons 🔍" : currentTab === "songs" ? "Sing-Along Songs 🎵" : currentTab === "games" ? "Fun Arcade 🎮" : currentTab === "studio" ? "Drawing Studio 🎨" : currentTab === "profile" ? "Kid Profile 👤" : "Kids Video 🌟"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
								type: "button",
								whileHover: { scale: 1.05 },
								whileTap: { scale: .94 },
								onClick: () => {
									playSuccessSound();
									if (onOpenFreeAccount) onOpenFreeAccount();
									else setShowFreeModal(true);
								},
								className: "bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm px-3.5 py-2 rounded-2xl shadow-md border-2 border-white flex items-center gap-1.5 cursor-pointer shrink-0",
								title: "Free Account Status & Details",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
										size: 16,
										className: "text-amber-900 fill-amber-300"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Free Account" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "bg-amber-900 text-amber-100 text-[10px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider",
										children: "FREE"
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "topbar-actions flex items-center justify-end gap-2 shrink-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
									type: "button",
									whileHover: { scale: 1.08 },
									whileTap: { scale: .92 },
									className: "icon-button shadow-sm cursor-pointer",
									onClick: () => {
										playPopSound();
										setShowThemePicker((v) => !v);
									},
									title: "Change Theme & Background",
									"aria-label": "Theme selector",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, {
										size: 20,
										className: "text-purple-600"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
									type: "button",
									whileHover: { scale: 1.08 },
									whileTap: { scale: .92 },
									className: "icon-button shadow-sm cursor-pointer",
									onClick: handleToggleSound,
									title: soundOn ? "Mute Sound Effects" : "Enable Sound Effects",
									"aria-label": "Toggle Sound",
									children: soundOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {
										size: 20,
										className: "text-teal-600"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, {
										size: 20,
										className: "text-slate-400"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
									type: "button",
									whileHover: { scale: 1.05 },
									whileTap: { scale: .94 },
									className: "kids-parent-btn font-extrabold text-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-md rounded-2xl px-4 py-2 flex items-center gap-2 cursor-pointer shrink-0",
									onClick: () => {
										playPopSound();
										onOpenParentalControls();
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { size: 18 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Parental Settings" })]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none bg-white/60 backdrop-blur-md border-y border-purple-100/60 my-1",
						children: [
							{
								id: "home",
								label: "Home",
								icon: "🏠"
							},
							{
								id: "search",
								label: "Search",
								icon: "🔍"
							},
							{
								id: "library",
								label: "Library",
								icon: "❤️"
							},
							{
								id: "songs",
								label: "Songs",
								icon: "🎵"
							},
							{
								id: "games",
								label: "Arcade",
								icon: "🎮"
							},
							{
								id: "studio",
								label: "Studio",
								icon: "🎨"
							},
							{
								id: "profile",
								label: "Profile",
								icon: activeEmoji || "👤"
							}
						].map((tab) => {
							const active = currentTab === tab.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
								type: "button",
								whileHover: { scale: 1.06 },
								whileTap: { scale: .94 },
								onClick: () => changeTab(tab.id),
								className: `px-3.5 py-1.5 rounded-2xl font-black text-xs flex items-center gap-1.5 shrink-0 border-2 transition cursor-pointer ${active ? "bg-purple-600 text-white border-purple-600 shadow-md scale-105" : "bg-white text-slate-700 border-slate-200 hover:bg-purple-50 hover:border-purple-200"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tab.icon }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tab.label })]
							}, tab.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showThemePicker && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							scale: .9,
							y: -10
						},
						animate: {
							opacity: 1,
							scale: 1,
							y: 0
						},
						exit: {
							opacity: 0,
							scale: .9,
							y: -10
						},
						className: "mx-4 my-2 p-4 rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl border border-purple-200/60 z-30 flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 font-extrabold text-slate-800",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, {
								size: 20,
								className: "text-purple-500"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Choose Cartoon Theme:" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: appThemes.map((theme) => {
								const active = currentTheme === theme.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
									type: "button",
									whileHover: { scale: 1.06 },
									whileTap: { scale: .94 },
									onClick: () => handleSelectTheme(theme.id),
									className: `px-3 py-1.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 border-2 transition-all ${active ? "border-purple-600 bg-purple-100 text-purple-900 shadow-sm" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-base",
										children: theme.emoji
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: theme.name })]
								}, theme.id);
							})
						})]
					}) }),
					currentTab === "search" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 p-3 bg-white/70 backdrop-blur-md rounded-3xl border border-purple-100/80 mx-2 my-2 shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							className: "kids-search-panel",
							initial: {
								opacity: 0,
								scale: .96
							},
							animate: {
								opacity: 1,
								scale: 1
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { size: 21 }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "search",
									value: searchText,
									placeholder: "Search cartoons, numbers, dinos, music...",
									autoFocus: true,
									onChange: (event) => setSearchText(event.target.value)
								}),
								searchText && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
									whileTap: { scale: .85 },
									type: "button",
									onClick: () => {
										playPopSound();
										setSearchText("");
									},
									"aria-label": "Clear search",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 20 })
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] font-black text-slate-400 shrink-0 uppercase tracking-wider",
								children: "Quick Topics:"
							}), [
								{
									label: "Numbers",
									icon: "🔢"
								},
								{
									label: "Dinosaurs",
									icon: "🦕"
								},
								{
									label: "Solar System",
									icon: "🪐"
								},
								{
									label: "Sing-Along",
									icon: "🎵"
								},
								{
									label: "Experiment",
									icon: "🧪"
								},
								{
									label: "Animals",
									icon: "🐾"
								}
							].map((topic) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									playPopSound();
									setSearchText(topic.label);
								},
								className: `px-3 py-1 rounded-xl text-xs font-black shrink-0 border transition flex items-center gap-1 ${searchText.toLowerCase() === topic.label.toLowerCase() ? "bg-purple-600 text-white border-purple-600 shadow-sm" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: topic.icon }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: topic.label })]
							}, topic.label))]
						})]
					}),
					(currentTab === "home" || currentTab === "search" || currentTab === "library") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "kids-category-nav",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
							whileHover: { scale: 1.06 },
							whileTap: { scale: .93 },
							type: "button",
							className: selectedCategory === "All" ? "selected" : "",
							onClick: () => {
								playPopSound();
								setSelectedCategory("All");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "kids-all-category",
								children: "🌈"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "All Cartoons" })]
						}), categories.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
							whileHover: { scale: 1.06 },
							whileTap: { scale: .93 },
							type: "button",
							className: selectedCategory === category.name ? "selected" : "",
							onClick: () => {
								playPopSound();
								setSelectedCategory(category.name);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: category.image,
								alt: category.name
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: category.name })]
						}, category.name))]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: `pb-28 ${[
					"home",
					"search",
					"library"
				].includes(currentTab) ? "kids-video-grid" : "w-full px-3 sm:px-6 py-4"}`,
				children: currentTab === "games" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KidsGamesStudio, {}) : currentTab === "studio" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KidsDrawingStudio, {}) : currentTab === "songs" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KidsSongsStudio, {}) : currentTab === "profile" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-lg mx-auto w-full flex flex-col items-center text-center gap-6 p-6 sm:p-8 bg-white/95 backdrop-blur-md rounded-3xl border-4 border-amber-300 shadow-2xl my-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative flex flex-col items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								whileHover: { scale: 1.05 },
								whileTap: { scale: .95 },
								className: "relative cursor-pointer group",
								onClick: () => {
									playPopSound();
									setShowAvatarPicker(!showAvatarPicker);
								},
								title: "Tap to change avatar!",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -inset-2 rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-pink-400 opacity-75 blur-md group-hover:opacity-100 transition duration-300 animate-pulse" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-tr from-amber-100 to-orange-100 flex items-center justify-center",
										children: activeImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: activeImage,
											alt: activeName,
											className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-6xl sm:text-7xl select-none",
											children: activeEmoji
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "absolute bottom-1 right-1 z-20 bg-amber-400 hover:bg-amber-300 text-amber-950 p-2.5 rounded-full border-2 border-white shadow-lg transition transform group-hover:scale-110 cursor-pointer",
										title: "Change profile avatar",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { size: 16 })
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-1.5 w-full",
							children: [isEditingName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-center gap-2 w-full max-w-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: tempName,
									onChange: (e) => setTempName(e.target.value),
									className: "w-full bg-slate-100 text-slate-900 font-black text-2xl px-4 py-2 rounded-2xl border-2 border-amber-400 focus:outline-none text-center shadow-inner",
									autoFocus: true,
									maxLength: 16
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: handleSaveName,
									className: "p-2.5 bg-amber-400 text-amber-950 rounded-2xl font-bold shadow-md hover:bg-amber-300 cursor-pointer shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 20 })
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-3xl sm:text-4xl font-black text-slate-900 tracking-tight",
									children: activeName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										playPopSound();
										setTempName(activeName);
										setIsEditingName(true);
									},
									className: "p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition text-slate-600 cursor-pointer",
									title: "Edit profile name",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { size: 16 })
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black tracking-wide border border-emerald-300",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
									size: 14,
									className: "text-emerald-600"
								}), "100% Safe Kid Account"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showAvatarPicker && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								scale: .95
							},
							animate: {
								opacity: 1,
								scale: 1
							},
							exit: {
								opacity: 0,
								scale: .95
							},
							className: "w-full bg-amber-50 border-2 border-amber-200 p-4 rounded-3xl flex flex-col gap-3 shadow-inner",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs font-black text-amber-900 flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, {
											size: 16,
											className: "text-amber-600"
										}), " Choose Character or Emoji Avatar:"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setShowAvatarPicker(false),
										className: "text-amber-800 p-1 rounded-xl hover:bg-amber-200 cursor-pointer",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center justify-center gap-3 py-1",
									children: [
										{
											name: "Leo",
											emoji: "🦁",
											image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXKmBbTEschT2fVlXzamCeETx0M3rctPouvJQ6jyWboczUe-WXt302CDJtMx5T_L9-zEaxhM_vxlITgSZt9_ApPXqHF9Vx39tEHo5gDXRFuGHRZ_rrEz6fOH5KlalMKiv82rUKm_4IRONsQ-wF064xYk_0ZIzAijLaovdE2H-qhe86S9qU1K70VcVvqOQ7GxR9ujHTTCg5GPHGI4VYoTLTPpwFitUSQ7JP8kSUjWRij6OOEIBXNKbLcaKkBrH4y-J_4PM1zmklxnA"
										},
										{
											name: "Poppy",
											emoji: "🐼",
											image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCONd4umMhgrulZ5f-ZZt2Uuy9-ach-KvWVrVKGmgiL58eNixQ0RjTvy4dEfDeZ1J7AjEKiLqrUKdXuuqdwFo-IF87mvFkdWZwpDs4hfs2FGU19CtmN6-k04UQXX4ibVERtYQS4ejdOmmIu6QKvrqVw2lGKdJHCiNNzzQGpdSP3Zir5sHO0B2Dt0_hf7PLpsbxeTuzJbU0-bxuCDZ2egbgYTHvpvt7p7Nl-GMz8P2cZlpqKbDqaybqBQFAYBqN6KlDGvQr8Yd7diDQ"
										},
										{
											name: "Ruby",
											emoji: "🐰",
											image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSpgsSIXN0d0LIyQMwB5SQbDUf6iitsVRQwTNbcaYYxamCvTLMt2omcQa9RPFVNaWlGDX2OTgHS9ZHHumfzn4jTOqF8IM0wzwTvI6lEkYLR5e4j1moqa0_Wrartxg-46lIyoXuBdsEFX9pa7gJgLs0L0SshcnaM8a_OnasZM-Uogwwpf5DOLftEcb2sg4fUl5uLX5o-g-g9wxt8QgqtmJ1Zii35Iibp-f7PH3ACFzlM57Cuf4m8MVAwA0J5c_n1YsiT4-gFfBgNg0"
										}
									].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => handleSelectAvatar(item.emoji, item.image),
										className: `flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition cursor-pointer ${activeImage === item.image ? "bg-amber-300 border-amber-600 shadow-md scale-105" : "bg-white hover:bg-amber-100 border-amber-200"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-12 h-12 rounded-full overflow-hidden border border-white shadow-xs",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: item.image,
												alt: item.name,
												className: "w-full h-full object-cover"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-black text-amber-950",
											children: item.name
										})]
									}, item.name))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-t border-amber-200 my-1" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-7 gap-2",
									children: KID_AVATARS.map((emoji) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => handleSelectAvatar(emoji, void 0),
										className: `text-2xl p-2 rounded-2xl transition cursor-pointer flex items-center justify-center ${activeEmoji === emoji && !activeImage ? "bg-amber-400 border-2 border-amber-600 shadow-md scale-110" : "bg-white hover:bg-amber-100 border border-amber-200"}`,
										children: emoji
									}, emoji))
								})
							]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3 w-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => changeTab("library"),
								className: "p-4 rounded-2xl bg-pink-50 border-2 border-pink-200 hover:bg-pink-100 transition text-center flex flex-col items-center gap-1 cursor-pointer shadow-sm group",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-3xl group-hover:scale-110 transition-transform",
										children: "❤️"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-2xl font-black text-pink-700",
										children: libraryIds.length
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-black text-pink-800 uppercase tracking-wider",
										children: "Saved Cartoons"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => changeTab("studio"),
								className: "p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 hover:bg-purple-100 transition text-center flex flex-col items-center gap-1 cursor-pointer shadow-sm group",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-3xl group-hover:scale-110 transition-transform",
										children: "🎨"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-2xl font-black text-purple-700",
										children: savedArtworksCount
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-black text-purple-800 uppercase tracking-wider",
										children: "Artworks Drawn"
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3 w-full bg-slate-50 p-4 rounded-3xl border border-slate-200",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-xs font-black text-slate-700 uppercase tracking-wide flex items-center justify-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, {
									size: 16,
									className: "text-amber-500"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kid Badges (Tap to celebrate!)" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-3 gap-2",
								children: [
									{
										title: "Star Watcher",
										icon: "⭐",
										bg: "bg-amber-100 text-amber-900 border-amber-300"
									},
									{
										title: "Junior Artist",
										icon: "🎨",
										bg: "bg-purple-100 text-purple-900 border-purple-300"
									},
									{
										title: "Super Kid",
										icon: "🚀",
										bg: "bg-indigo-100 text-indigo-900 border-indigo-300"
									}
								].map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
									whileHover: { scale: 1.05 },
									whileTap: { scale: .95 },
									type: "button",
									onClick: (e) => handleTapBadge(b.title, "Great job!", e),
									className: `p-3 rounded-2xl border-2 font-black text-xs flex flex-col items-center gap-1 cursor-pointer shadow-xs ${b.bg}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-2xl",
										children: b.icon
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: b.title })]
								}, b.title))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col sm:flex-row gap-3 w-full pt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									playPopSound();
									onChangeProfile();
								},
								className: "flex-1 py-3.5 px-5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-95",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { size: 18 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Switch Profile" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									playPopSound();
									onOpenParentalControls();
								},
								className: "flex-1 py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition border border-slate-300 active:scale-95",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
									size: 18,
									className: "text-purple-600"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Parent Controls" })]
							})]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
					mode: "popLayout",
					children: displayedVideos.map((video, index) => {
						const saved = libraryIds.includes(video.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.article, {
							layout: true,
							initial: {
								opacity: 0,
								scale: .9,
								y: 15
							},
							animate: {
								opacity: 1,
								scale: 1,
								y: 0
							},
							exit: {
								opacity: 0,
								scale: .9,
								y: -10
							},
							transition: {
								duration: .28,
								delay: index * .04
							},
							whileHover: { y: -6 },
							className: "group",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "kids-video-thumbnail overflow-hidden relative",
								onClick: () => {
									playPopSound();
									onOpenVideo(video);
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: video.image,
										alt: video.title,
										className: "transition-transform duration-300 group-hover:scale-105"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "kids-video-dark-overlay" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
										className: "kids-video-main-play",
										whileHover: { scale: 1.15 },
										whileTap: { scale: .9 },
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
											size: 24,
											fill: "currentColor"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "kids-video-duration",
										children: video.duration
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "kids-video-small-play",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
											size: 11,
											fill: "currentColor"
										})
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "kids-video-title-row flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: video.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
									type: "button",
									whileHover: {
										scale: 1.25,
										rotate: 10
									},
									whileTap: { scale: .8 },
									className: saved ? "kids-library-button saved" : "kids-library-button",
									onClick: (e) => toggleLibrary(video.id, e),
									"aria-label": saved ? "Remove from library" : "Add to library",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
										size: 22,
										fill: saved ? "currentColor" : "none"
									})
								})]
							})]
						}, video.id);
					})
				}), displayedVideos.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.section, {
					initial: {
						opacity: 0,
						scale: .9
					},
					animate: {
						opacity: 1,
						scale: 1
					},
					className: "kids-empty-view",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentTab === "library" ? "📚" : "🔍" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: currentTab === "library" ? "Your library is empty" : "No cartoons found" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: currentTab === "library" ? "Tap the heart on any video to save it to your library!" : "Try searching another title or select \"All Cartoons\"." }),
						currentTab === "library" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => changeTab("home"),
							className: "mt-3 px-5 py-2.5 rounded-2xl bg-amber-400 text-amber-950 font-black text-sm shadow-md hover:bg-amber-500 transition cursor-pointer",
							children: "Browse Cartoons 🚀"
						})
					]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "kids-home-bottom-nav",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
						whileTap: { scale: .9 },
						className: currentTab === "home" ? "active" : "",
						type: "button",
						onClick: () => changeTab("home"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, {
							size: 20,
							fill: currentTab === "home" ? "currentColor" : "none"
						}) }), "Home"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
						whileTap: { scale: .9 },
						className: currentTab === "search" ? "active" : "",
						type: "button",
						onClick: () => changeTab("search"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { size: 20 }), "Search"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
						whileTap: { scale: .9 },
						className: currentTab === "library" ? "active" : "",
						type: "button",
						onClick: () => changeTab("library"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { size: 20 }), "Library"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
						whileTap: { scale: .9 },
						className: currentTab === "songs" ? "active" : "",
						type: "button",
						onClick: () => changeTab("songs"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { size: 20 }), "Songs"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
						whileTap: { scale: .9 },
						className: currentTab === "games" ? "active" : "",
						type: "button",
						onClick: () => changeTab("games"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gamepad2, { size: 20 }), "Games"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
						whileTap: { scale: .9 },
						className: currentTab === "studio" ? "active" : "",
						type: "button",
						onClick: () => changeTab("studio"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paintbrush, { size: 20 }), "Studio"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
						whileTap: { scale: .9 },
						className: currentTab === "profile" ? "active" : "",
						type: "button",
						onClick: () => changeTab("profile"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "kids-nav-profile flex items-center justify-center w-6 h-6 rounded-full overflow-hidden shrink-0",
							children: activeImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: activeImage,
								alt: activeName,
								className: "w-full h-full object-cover"
							}) : activeEmoji || profileEmoji
						}), "Profile"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showFreeModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				initial: { opacity: 0 },
				animate: { opacity: 1 },
				exit: { opacity: 0 },
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm",
				onClick: () => setShowFreeModal(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						scale: .9,
						opacity: 0,
						y: 20
					},
					animate: {
						scale: 1,
						opacity: 1,
						y: 0
					},
					exit: {
						scale: .9,
						opacity: 0,
						y: 20
					},
					onClick: (e) => e.stopPropagation(),
					className: "bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center gap-4 relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setShowFreeModal(false),
							className: "absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer transition",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 20 })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-16 h-16 rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-800 shadow-md",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
								size: 32,
								className: "fill-amber-400 text-amber-600"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-2xl font-black text-slate-900",
								children: "100% Free Kid Account"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-black uppercase text-amber-600 tracking-wider",
								children: "Safe • Unlimited • Fun"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-slate-600 text-sm font-medium leading-relaxed",
							children: "You are enjoying the 100% Free Kids Experience! Stream endless cartoons, play learning games, and create custom kid avatars without any subscription."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "w-full bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex flex-col gap-2 text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-xs font-bold text-slate-700",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										size: 16,
										className: "text-emerald-600 shrink-0"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Unlimited Kid Videos & Sing-Along Songs" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-xs font-bold text-slate-700",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										size: 16,
										className: "text-emerald-600 shrink-0"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Interactive Drawing & Arcade Games" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-xs font-bold text-slate-700",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										size: 16,
										className: "text-emerald-600 shrink-0"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "100% Safe Parent-Controlled Environment" })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col sm:flex-row gap-2 w-full pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setShowFreeModal(false);
									onOpenParentalControls();
								},
								className: "flex-1 py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Parent Settings" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setShowFreeModal(false),
								className: "flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs border border-slate-300 cursor-pointer transition",
								children: "Awesome!"
							})]
						})
					]
				})
			}) })
		]
	});
}
function WatchPartyModal({ isOpen, onClose, currentProfileName, currentProfileEmoji, currentProfileAvatarUrl, availableBuddies, activeBuddy, onStartWatchParty, onEndWatchParty, isPlaying, onTogglePlay, videoTitle }) {
	const [selectedBuddy, setSelectedBuddy] = (0, import_react.useState)(activeBuddy || (availableBuddies.length > 0 ? availableBuddies[0] : null));
	const [inviteSent, setInviteSent] = (0, import_react.useState)(false);
	if (!isOpen) return null;
	const handleSendInvite = (buddy) => {
		playSuccessSound();
		setSelectedBuddy(buddy);
		setInviteSent(true);
		confetti_module_default({
			particleCount: 50,
			spread: 70,
			origin: { y: .6 },
			colors: [
				"#ff72aa",
				"#ffd166",
				"#06d6a0",
				"#118ab2",
				"#38bdf8"
			]
		});
		setTimeout(() => {
			onStartWatchParty(buddy);
			setInviteSent(false);
		}, 1200);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				scale: .9,
				y: 20
			},
			animate: {
				opacity: 1,
				scale: 1,
				y: 0
			},
			exit: {
				opacity: 0,
				scale: .9,
				y: 20
			},
			className: "bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border-4 border-sky-200 relative overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 opacity-90 -z-0" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						playPopSound();
						onClose();
					},
					className: "absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition cursor-pointer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 20 })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative z-10 pt-2 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-sky-700 shadow-md font-black text-xs uppercase tracking-wider mb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartyPopper, {
								size: 14,
								className: "text-amber-500"
							}), "Watch Party Together"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-black text-white drop-shadow-md",
							children: activeBuddy ? "Synced Watch Party" : "Invite a Buddy to Watch!"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-sky-100 font-medium mt-0.5 max-w-xs mx-auto truncate",
							children: [
								"\"",
								videoTitle,
								"\""
							]
						}),
						activeBuddy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 space-y-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-center gap-4 bg-sky-50/80 p-4 rounded-2xl border border-sky-100",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col items-center",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "w-16 h-16 rounded-full border-4 border-sky-400 shadow-md overflow-hidden bg-amber-100 flex items-center justify-center text-3xl",
												children: currentProfileAvatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: currentProfileAvatarUrl,
													alt: currentProfileName,
													className: "w-full h-full object-cover"
												}) : currentProfileEmoji
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-black text-slate-800 mt-1",
												children: currentProfileName
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col items-center",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 to-purple-500 text-white flex items-center justify-center shadow-lg animate-pulse",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { size: 20 })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest mt-1",
												children: "SYNCED"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col items-center",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "w-16 h-16 rounded-full border-4 border-purple-400 shadow-md overflow-hidden flex items-center justify-center text-3xl",
												style: { backgroundColor: activeBuddy.color || "#e0e7ff" },
												children: activeBuddy.avatarUrl || activeBuddy.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: activeBuddy.avatarUrl || activeBuddy.image,
													alt: activeBuddy.name,
													className: "w-full h-full object-cover"
												}) : activeBuddy.emoji
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-black text-slate-800 mt-1",
												children: activeBuddy.name
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-bold text-emerald-900",
											children: isPlaying ? "Video playing synchronously" : "Playback paused for both"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											playPopSound();
											onTogglePlay();
										},
										className: "p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition",
										children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 16 })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										playPopSound();
										onEndWatchParty();
										onClose();
									},
									className: "w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-black rounded-2xl transition flex items-center justify-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 }), "End Watch Party"]
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-bold text-slate-500 text-left",
								children: "Select a profile to invite to watch together:"
							}), inviteSent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								initial: {
									scale: .8,
									opacity: 0
								},
								animate: {
									scale: 1,
									opacity: 1
								},
								className: "py-8 bg-sky-50 rounded-2xl border border-sky-200 flex flex-col items-center space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
										size: 48,
										className: "text-emerald-500"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-lg font-black text-slate-800",
										children: "Invitation Sent!"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-slate-500 font-medium",
										children: [
											"Joining watch party with ",
											selectedBuddy?.name,
											"..."
										]
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto pr-1",
								children: availableBuddies.map((buddy) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
									whileHover: { scale: 1.02 },
									whileTap: { scale: .98 },
									type: "button",
									onClick: () => handleSendInvite(buddy),
									className: "flex items-center justify-between p-3 rounded-2xl border-2 border-slate-100 hover:border-sky-300 bg-slate-50 hover:bg-sky-50/50 transition group cursor-pointer text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-2xl shrink-0",
											style: { backgroundColor: buddy.color || "#bae6fd" },
											children: buddy.avatarUrl || buddy.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: buddy.avatarUrl || buddy.image,
												alt: buddy.name,
												className: "w-full h-full object-cover"
											}) : buddy.emoji
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-extrabold text-sm text-slate-800 block",
											children: buddy.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] font-bold text-emerald-600 flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 rounded-full bg-emerald-500 inline-block" }), "Ready to watch"]
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "px-3 py-1.5 rounded-xl bg-sky-500 group-hover:bg-sky-600 text-white font-black text-xs shadow-sm flex items-center gap-1 transition",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { size: 12 }), "Invite"]
									})]
								}, buddy.id))
							})]
						})
					]
				})
			]
		})
	}) });
}
var numberItems = [
	{
		num: 1,
		word: "ONE",
		emoji: "🎈",
		name: "Balloons",
		count: 1,
		bg: "from-amber-400 to-rose-400"
	},
	{
		num: 2,
		word: "TWO",
		emoji: "🐥",
		name: "Little Ducks",
		count: 2,
		bg: "from-sky-400 to-indigo-400"
	},
	{
		num: 3,
		word: "THREE",
		emoji: "🌟",
		name: "Shining Stars",
		count: 3,
		bg: "from-yellow-400 to-amber-500"
	},
	{
		num: 4,
		word: "FOUR",
		emoji: "🍎",
		name: "Juicy Apples",
		count: 4,
		bg: "from-emerald-400 to-teal-500"
	},
	{
		num: 5,
		word: "FIVE",
		emoji: "🦋",
		name: "Butterflies",
		count: 5,
		bg: "from-pink-400 to-purple-500"
	},
	{
		num: 6,
		word: "SIX",
		emoji: "🚗",
		name: "Speedy Cars",
		count: 6,
		bg: "from-blue-400 to-cyan-500"
	},
	{
		num: 7,
		word: "SEVEN",
		emoji: "🚀",
		name: "Rockets",
		count: 7,
		bg: "from-indigo-500 to-violet-600"
	},
	{
		num: 8,
		word: "EIGHT",
		emoji: "🍦",
		name: "Ice Creams",
		count: 8,
		bg: "from-fuchsia-400 to-pink-500"
	},
	{
		num: 9,
		word: "NINE",
		emoji: "🐬",
		name: "Playful Dolphins",
		count: 9,
		bg: "from-sky-500 to-blue-600"
	},
	{
		num: 10,
		word: "TEN",
		emoji: "👑",
		name: "Golden Crowns",
		count: 10,
		bg: "from-amber-400 to-yellow-500"
	}
];
function NumbersLearningVideo({ isPlaying, onTogglePlay }) {
	const [currentNumIndex, setCurrentNumIndex] = (0, import_react.useState)(0);
	const [tappedItems, setTappedItems] = (0, import_react.useState)([]);
	const [completedAll, setCompletedAll] = (0, import_react.useState)(false);
	const activeItem = numberItems[currentNumIndex];
	(0, import_react.useEffect)(() => {
		let timer;
		if (isPlaying && !completedAll) timer = setInterval(() => {
			setCurrentNumIndex((prev) => {
				if (prev >= numberItems.length - 1) {
					setCompletedAll(true);
					confetti_module_default({
						particleCount: 80,
						spread: 80,
						origin: { y: .6 }
					});
					return prev;
				}
				playPopSound();
				return prev + 1;
			});
		}, 3500);
		return () => clearInterval(timer);
	}, [isPlaying, completedAll]);
	const handleItemTap = (idx) => {
		playHeartSound();
		if (!tappedItems.includes(idx)) setTappedItems((prev) => [...prev, idx]);
		if (tappedItems.length + 1 >= activeItem.count) playSuccessSound();
	};
	const handleSelectNumber = (index) => {
		playPopSound();
		setCurrentNumIndex(index);
		setTappedItems([]);
		setCompletedAll(false);
	};
	const handleRestart = () => {
		playPopSound();
		setCurrentNumIndex(0);
		setTappedItems([]);
		setCompletedAll(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-4 border-sky-300 text-white min-h-[360px] flex flex-col justify-between p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between z-10 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-sky-200 shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: penguin_avatar_1784920051288_default,
							alt: "Pippin",
							className: "w-full h-full object-cover"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-black tracking-tight block text-amber-300",
						children: "Pippin's Number School 🐧"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] text-sky-200 font-bold",
						children: completedAll ? "Yay! You counted to 10!" : `Counting Number ${activeItem.num}`
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-xs scrollbar-none py-1",
					children: numberItems.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => handleSelectNumber(idx),
						className: `w-7 h-7 sm:w-8 sm:h-8 rounded-full font-black text-xs sm:text-sm flex items-center justify-center transition cursor-pointer shrink-0 ${currentNumIndex === idx ? "bg-amber-400 text-amber-950 scale-110 shadow-lg shadow-amber-400/40 ring-2 ring-white" : "bg-white/15 text-white hover:bg-white/30"}`,
						children: item.num
					}, item.num))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
				mode: "wait",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: {
						opacity: 0,
						scale: .85,
						y: 15
					},
					animate: {
						opacity: 1,
						scale: 1,
						y: 0
					},
					exit: {
						opacity: 0,
						scale: 1.1,
						y: -15
					},
					transition: { duration: .4 },
					className: "my-auto py-6 flex flex-col items-center text-center relative z-10",
					children: completedAll ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: { scale: .8 },
						animate: { scale: 1 },
						className: "flex flex-col items-center space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-20 h-20 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-4xl shadow-xl animate-bounce",
								children: "👑"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-2xl sm:text-3xl font-black text-amber-300",
								children: "GREAT JOB! YOU LEARNED 1 TO 10!"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs sm:text-sm text-sky-100 font-medium max-w-sm",
								children: "Pippin the Penguin is so proud of you! Tap play or restart to count again!"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleRestart,
								className: "mt-2 px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Count Again" })]
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							whileHover: { scale: 1.08 },
							className: `w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr ${activeItem.bg} border-4 border-white/80 shadow-2xl flex flex-col items-center justify-center text-white relative`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-6xl sm:text-7xl font-black drop-shadow-lg leading-none",
								children: activeItem.num
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs sm:text-sm font-black uppercase tracking-widest mt-1 opacity-90",
								children: activeItem.word
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-center sm:text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "text-2xl sm:text-3xl font-black tracking-tight text-amber-300",
									children: [
										activeItem.count,
										" ",
										activeItem.name,
										"!"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs sm:text-sm text-sky-200 font-medium mt-1",
									children: [
										"Tap the ",
										activeItem.name.toLowerCase(),
										" below to count together!"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full mt-2 text-xs font-bold text-amber-200",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"Counted: ",
										tappedItems.length,
										" / ",
										activeItem.count
									] })]
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-lg mt-2",
						children: Array.from({ length: activeItem.count }).map((_, idx) => {
							const isTapped = tappedItems.includes(idx);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
								whileHover: {
									scale: 1.25,
									rotate: 8
								},
								whileTap: { scale: .85 },
								type: "button",
								onClick: () => handleItemTap(idx),
								className: `w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg border-2 transition cursor-pointer relative ${isTapped ? "bg-amber-300/30 border-amber-400 scale-110 shadow-amber-400/20" : "bg-white/10 border-white/20 hover:bg-white/20"}`,
								children: [activeItem.emoji, isTapped && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute -top-2 -right-2 w-5 h-5 bg-amber-400 text-amber-950 rounded-full text-[10px] font-black flex items-center justify-center border border-white",
									children: "✓"
								})]
							}, idx);
						})
					})] })
				}, activeItem.num)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between z-10 pt-2 border-t border-white/10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onTogglePlay,
						className: "px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer",
						children: [isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isPlaying ? "Pause Counting" : "Play Auto-Count" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleRestart,
						className: "p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer",
						title: "Restart counting from 1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 16 })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] font-bold text-sky-200 hidden sm:block",
					children: "Interactive Numbers Video · 1 to 10"
				})]
			})
		]
	});
}
var defaultBuddies = [
	{
		id: 101,
		name: "Leo",
		emoji: "🦁",
		color: "#ffa62b",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXKmBbTEschT2fVlXzamCeETx0M3rctPouvJQ6jyWboczUe-WXt302CDJtMx5T_L9-zEaxhM_vxlITgSZt9_ApPXqHF9Vx39tEHo5gDXRFuGHRZ_rrEz6fOH5KlalMKiv82rUKm_4IRONsQ-wF064xYk_0ZIzAijLaovdE2H-qhe86S9qU1K70VcVvqOQ7GxR9ujHTTCg5GPHGI4VYoTLTPpwFitUSQ7JP8kSUjWRij6OOEIBXNKbLcaKkBrH4y-J_4PM1zmklxnA"
	},
	{
		id: 102,
		name: "Poppy",
		emoji: "🐼",
		color: "#95d5b2",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCONd4umMhgrulZ5f-ZZt2Uuy9-ach-KvWVrVKGmgiL58eNixQ0RjTvy4dEfDeZ1J7AjEKiLqrUKdXuuqdwFo-IF87mvFkdWZwpDs4hfs2FGU19CtmN6-k04UQXX4ibVERtYQS4ejdOmmIu6QKvrqVw2lGKdJHCiNNzzQGpdSP3Zir5sHO0B2Dt0_hf7PLpsbxeTuzJbU0-bxuCDZ2egbgYTHvpvt7p7Nl-GMz8P2cZlpqKbDqaybqBQFAYBqN6KlDGvQr8Yd7diDQ"
	},
	{
		id: 103,
		name: "Ruby",
		emoji: "🐰",
		color: "#ff8fa3",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSpgsSIXN0d0LIyQMwB5SQbDUf6iitsVRQwTNbcaYYxamCvTLMt2omcQa9RPFVNaWlGDX2OTgHS9ZHHumfzn4jTOqF8IM0wzwTvI6lEkYLR5e4j1moqa0_Wrartxg-46lIyoXuBdsEFX9pa7gJgLs0L0SshcnaM8a_OnasZM-Uogwwpf5DOLftEcb2sg4fUl5uLX5o-g-g9wxt8QgqtmJ1Zii35Iibp-f7PH3ACFzlM57Cuf4m8MVAwA0J5c_n1YsiT4-gFfBgNg0"
	},
	{
		id: 104,
		name: "Percy Puppy",
		emoji: "🐶",
		color: "#fdb813",
		image: puppy_avatar_1784920038818_default
	},
	{
		id: 105,
		name: "Pippin Penguin",
		emoji: "🐧",
		color: "#38bdf8",
		image: penguin_avatar_1784920051288_default
	},
	{
		id: 106,
		name: "Cleo Kitty",
		emoji: "🐱",
		color: "#f472b6",
		image: kitty_avatar_1784920065128_default
	},
	{
		id: 107,
		name: "Milo Monkey",
		emoji: "🐵",
		color: "#fb923c",
		image: monkey_avatar_1784920076703_default
	},
	{
		id: 108,
		name: "Kiki Koala",
		emoji: "🐨",
		color: "#a7f3d0",
		image: koala_avatar_1784920089417_default
	}
];
var reactions = [
	{
		id: "love",
		label: "Love it",
		emoji: "❤️",
		className: "love"
	},
	{
		id: "super",
		label: "Super",
		emoji: "⭐",
		className: "super"
	},
	{
		id: "funny",
		label: "Funny",
		emoji: "😂",
		className: "funny"
	},
	{
		id: "wow",
		label: "Wow",
		emoji: "😲",
		className: "wow"
	}
];
function KidsVideoPlayer({ video, profileName = "Leo", profileEmoji = "🦁", customProfiles = [], onBack, onOpenVideo, onOpenHomeTab, onChangeProfile }) {
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [showAll, setShowAll] = (0, import_react.useState)(false);
	const [showWatchPartyModal, setShowWatchPartyModal] = (0, import_react.useState)(false);
	const [activeWatchPartyBuddy, setActiveWatchPartyBuddy] = (0, import_react.useState)(null);
	const [syncToast, setSyncToast] = (0, import_react.useState)(null);
	const [floatingEmojis, setFloatingEmojis] = (0, import_react.useState)([]);
	const [reaction, setReaction] = (0, import_react.useState)(() => {
		return localStorage.getItem(`sasa-video-reaction-${video.id}`) ?? "";
	});
	const upNext = kidsVideos.filter((item) => item.id !== video.id).slice(0, showAll ? kidsVideos.length : 3);
	const availableBuddies = [...defaultBuddies, ...customProfiles.map((cp) => ({
		id: cp.id,
		name: cp.name,
		emoji: cp.emoji,
		color: cp.color,
		avatarUrl: cp.avatarUrl || cp.image
	}))].filter((b) => b.name.toLowerCase() !== profileName.toLowerCase());
	const showToast = (message) => {
		setSyncToast(message);
		setTimeout(() => setSyncToast(null), 2500);
	};
	const handleTogglePlay = () => {
		playPopSound();
		const nextState = !playing;
		setPlaying(nextState);
		if (activeWatchPartyBuddy) showToast(nextState ? `Synced! Playing for ${profileName} & ${activeWatchPartyBuddy.name}` : `Synced! Paused for both profiles`);
	};
	const handleSendEmojiReaction = (emoji) => {
		playHeartSound();
		const newId = Date.now() + Math.random();
		const leftPos = Math.floor(Math.random() * 70) + 15;
		setFloatingEmojis((prev) => [...prev, {
			id: newId,
			emoji,
			left: leftPos,
			sender: activeWatchPartyBuddy?.name || profileName
		}]);
		setTimeout(() => {
			setFloatingEmojis((prev) => prev.filter((e) => e.id !== newId));
		}, 2e3);
		if (activeWatchPartyBuddy) showToast(`${activeWatchPartyBuddy.name} sent ${emoji}`);
	};
	const handleReactionClick = (id, e) => {
		const updated = reaction === id ? "" : id;
		setReaction(updated);
		if (updated) {
			localStorage.setItem(`sasa-video-reaction-${video.id}`, updated);
			playHeartSound();
			const rect = e.currentTarget.getBoundingClientRect();
			confetti_module_default({
				particleCount: 30,
				spread: 70,
				origin: {
					x: (rect.left + rect.width / 2) / window.innerWidth,
					y: (rect.top + rect.height / 2) / window.innerHeight
				},
				colors: [
					"#ff72aa",
					"#ffd166",
					"#06d6a0",
					"#118ab2",
					"#8338ec"
				]
			});
			if (activeWatchPartyBuddy) handleSendEmojiReaction(reactions.find((r) => r.id === id)?.emoji || "❤️");
		} else {
			localStorage.removeItem(`sasa-video-reaction-${video.id}`);
			playPopSound();
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		className: "kids-player-page relative overflow-hidden",
		initial: {
			opacity: 0,
			scale: .98
		},
		animate: {
			opacity: 1,
			scale: 1
		},
		exit: { opacity: 0 },
		transition: { duration: .3 },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "kids-player-header flex items-center justify-between",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
						whileHover: { scale: 1.1 },
						whileTap: { scale: .9 },
						type: "button",
						onClick: () => {
							playPopSound();
							onBack();
						},
						"aria-label": "Go back",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { size: 25 })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "flex items-center gap-1.5 font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600",
						children: ["WonderWatch ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
							size: 18,
							className: "text-amber-400 inline"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
						whileHover: { scale: 1.05 },
						whileTap: { scale: .92 },
						type: "button",
						onClick: () => {
							playPopSound();
							setShowWatchPartyModal(true);
						},
						className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all shadow-sm cursor-pointer ${activeWatchPartyBuddy ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20" : "bg-purple-100 text-purple-700 hover:bg-purple-200"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 15 }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: activeWatchPartyBuddy ? "Watch Party Active" : "Invite to Watch" }),
							activeWatchPartyBuddy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 rounded-full bg-emerald-300 animate-ping" })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: syncToast && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				initial: {
					opacity: 0,
					y: -20
				},
				animate: {
					opacity: 1,
					y: 0
				},
				exit: {
					opacity: 0,
					y: -20
				},
				className: "fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-black flex items-center gap-2 border border-sky-400/40 backdrop-blur-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, {
					size: 14,
					className: "text-emerald-400 animate-pulse"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: syncToast })]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "kids-player-content",
				children: [
					activeWatchPartyBuddy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: -10
						},
						animate: {
							opacity: 1,
							y: 0
						},
						className: "mb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-3 text-white flex items-center justify-between shadow-lg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex -space-x-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-8 h-8 rounded-full border-2 border-white bg-amber-400 flex items-center justify-center text-sm shadow",
									children: profileEmoji
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm shadow overflow-hidden",
									style: { backgroundColor: activeWatchPartyBuddy.color || "#bae6fd" },
									children: activeWatchPartyBuddy.avatarUrl || activeWatchPartyBuddy.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: activeWatchPartyBuddy.avatarUrl || activeWatchPartyBuddy.image,
										alt: activeWatchPartyBuddy.name,
										className: "w-full h-full object-cover"
									}) : activeWatchPartyBuddy.emoji
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-black tracking-tight block",
								children: [
									profileName,
									" & ",
									activeWatchPartyBuddy.name,
									"'s Party"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[10px] text-purple-200 font-bold flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" }), "Synced Playback Active"]
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5",
							children: [[
								"🍿",
								"🎉",
								"💖",
								"👏"
							].map((emoji) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => handleSendEmojiReaction(emoji),
								className: "p-1.5 hover:bg-white/20 rounded-xl text-sm transition active:scale-90",
								title: `Send ${emoji}`,
								children: emoji
							}, emoji)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									playPopSound();
									setShowWatchPartyModal(true);
								},
								className: "ml-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-xl text-[11px] font-bold text-white transition",
								children: "Manage"
							})]
						})]
					}),
					video.id === 7 || video.category === "Numbers" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumbersLearningVideo, {
						isPlaying: playing,
						onTogglePlay: handleTogglePlay
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "kids-player-hero relative group rounded-3xl overflow-hidden shadow-xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: video.image,
								alt: video.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-0 pointer-events-none overflow-hidden z-20",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: floatingEmojis.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
									initial: {
										opacity: 1,
										y: 160,
										scale: .5
									},
									animate: {
										opacity: 0,
										y: -100,
										scale: 1.8
									},
									exit: { opacity: 0 },
									transition: {
										duration: 1.8,
										ease: "easeOut"
									},
									style: { left: `${item.left}%` },
									className: "absolute bottom-10 text-4xl filter drop-shadow-lg flex flex-col items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.emoji }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-black bg-slate-900/80 text-white px-1.5 py-0.5 rounded-md mt-0.5",
										children: item.sender
									})]
								}, item.id)) })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
								whileHover: { scale: 1.12 },
								whileTap: { scale: .88 },
								type: "button",
								className: "kids-player-play-button shadow-2xl z-30",
								onClick: handleTogglePlay,
								"aria-label": playing ? "Pause video" : "Play video",
								children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {
									size: 42,
									fill: "currentColor"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
									size: 42,
									fill: "currentColor"
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "kids-player-progress rounded-full overflow-hidden mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
							className: "bg-gradient-to-r from-pink-500 to-purple-500 h-full block",
							initial: { width: "0%" },
							animate: { width: playing ? "65%" : "40%" },
							transition: { duration: .5 }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "kids-player-info mt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-xl sm:text-2xl font-black text-slate-800",
									children: video.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold text-slate-500 text-xs sm:text-sm mt-0.5",
									children: "2.4M Views · Safe Kids Content"
								})] }), !activeWatchPartyBuddy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
									whileHover: { scale: 1.05 },
									whileTap: { scale: .95 },
									type: "button",
									onClick: () => {
										playPopSound();
										setShowWatchPartyModal(true);
									},
									className: "shrink-0 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 text-white font-black text-xs shadow-md hover:shadow-sky-400/30 flex items-center gap-1.5 cursor-pointer transition",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartyPopper, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Invite to Watch" })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "kids-reaction-section mt-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "How do you feel about this cartoon?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "kids-reaction-grid",
									children: reactions.map((item) => {
										const selected = reaction === item.id;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
											whileHover: {
												scale: 1.08,
												y: -3
											},
											whileTap: { scale: .9 },
											type: "button",
											className: [
												"kids-reaction-choice",
												item.className,
												selected ? "selected ring-4 ring-purple-400" : ""
											].filter(Boolean).join(" "),
											onClick: (e) => handleReactionClick(item.id, e),
											"aria-pressed": selected,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "kids-reaction-face text-3xl",
												children: item.emoji
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "kids-reaction-label font-bold",
												children: item.label
											})]
										}, item.id);
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "kids-up-next-heading flex items-center justify-between mt-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-xl font-black",
									children: "Up Next Cartoons"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
									whileTap: { scale: .95 },
									type: "button",
									className: "font-bold text-purple-600 bg-purple-100 hover:bg-purple-200 px-3 py-1 rounded-full text-sm cursor-pointer",
									onClick: () => {
										playPopSound();
										setShowAll((value) => !value);
									},
									children: showAll ? "Show Less" : "See All"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "kids-up-next-list grid gap-3 mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: upNext.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
									initial: {
										opacity: 0,
										x: -10
									},
									animate: {
										opacity: 1,
										x: 0
									},
									transition: { delay: idx * .05 },
									whileHover: { scale: 1.02 },
									whileTap: { scale: .97 },
									type: "button",
									className: "kids-up-next-card text-left cursor-pointer",
									onClick: () => {
										playPopSound();
										setPlaying(false);
										setReaction(localStorage.getItem(`sasa-video-reaction-${item.id}`) ?? "");
										onOpenVideo(item);
										window.scrollTo({
											top: 0,
											behavior: "smooth"
										});
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: item.image,
										alt: item.title,
										className: "rounded-2xl object-cover"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex flex-col justify-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-base text-slate-800",
											children: item.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
											className: "text-slate-500",
											children: [item.duration, " · Safe Kids"]
										})]
									})]
								}, item.id)) })
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatchPartyModal, {
				isOpen: showWatchPartyModal,
				onClose: () => setShowWatchPartyModal(false),
				currentProfileName: profileName,
				currentProfileEmoji: profileEmoji,
				availableBuddies,
				activeBuddy: activeWatchPartyBuddy,
				onStartWatchParty: (buddy) => {
					setActiveWatchPartyBuddy(buddy);
					showToast(`Watch Party started with ${buddy.name}! 🍿`);
				},
				onEndWatchParty: () => {
					setActiveWatchPartyBuddy(null);
					showToast(`Watch Party ended.`);
				},
				isPlaying: playing,
				onTogglePlay: handleTogglePlay,
				videoTitle: video.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "kids-player-bottom-nav",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
						whileTap: { scale: .9 },
						type: "button",
						className: "active",
						onClick: () => {
							playPopSound();
							onOpenHomeTab("home");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { size: 24 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Home" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
						whileTap: { scale: .9 },
						type: "button",
						onClick: () => {
							playPopSound();
							onOpenHomeTab("search");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { size: 24 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Search" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
						whileTap: { scale: .9 },
						type: "button",
						onClick: () => {
							playPopSound();
							onOpenHomeTab("library");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { size: 24 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Library" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
						whileTap: { scale: .9 },
						type: "button",
						onClick: () => {
							playPopSound();
							onChangeProfile();
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleUser, { size: 24 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Profile" })]
					})
				]
			})
		]
	});
}
function generateMathQuestion() {
	const num1 = Math.floor(Math.random() * 8) + 5;
	const num2 = Math.floor(Math.random() * 8) + 4;
	const correctAnswer = num1 + num2;
	const offset1 = Math.random() > .5 ? 2 : -2;
	const offset2 = Math.random() > .5 ? 3 : -1;
	return {
		num1,
		num2,
		correctAnswer,
		choices: [
			correctAnswer,
			correctAnswer + offset1,
			correctAnswer + offset2
		].sort(() => Math.random() - .5)
	};
}
function ParentalGate({ onSuccess, onCancel, parentPin, requireParentPin }) {
	const [gateMode, setGateMode] = (0, import_react.useState)(requireParentPin ? "pin" : "math");
	const [pin, setPin] = (0, import_react.useState)("");
	const [showPin, setShowPin] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [mathProblem, setMathProblem] = (0, import_react.useState)(generateMathQuestion);
	const triggerSuccess = (e) => {
		playSuccessSound();
		if (e) {
			const rect = e.currentTarget.getBoundingClientRect();
			confetti_module_default({
				particleCount: 45,
				spread: 90,
				origin: {
					x: (rect.left + rect.width / 2) / window.innerWidth,
					y: (rect.top + rect.height / 2) / window.innerHeight
				},
				colors: [
					"#3a86ff",
					"#8338ec",
					"#ff006e",
					"#fb5607",
					"#ffbe0b"
				]
			});
		}
		setTimeout(() => {
			onSuccess();
		}, 400);
	};
	const handleKeypadPress = (digit) => {
		playPopSound();
		setError("");
		if (pin.length < 6) {
			const nextPin = pin + digit;
			setPin(nextPin);
			if (nextPin === parentPin) triggerSuccess();
		}
	};
	const handleKeypadDelete = () => {
		playPopSound();
		setError("");
		setPin((prev) => prev.slice(0, -1));
	};
	const submitPin = (e) => {
		if (pin === parentPin) triggerSuccess(e);
		else {
			playPopSound();
			setError("Incorrect PIN. Please try again.");
			setPin("");
		}
	};
	const handleMathAnswer = (answer, e) => {
		if (answer === mathProblem.correctAnswer) triggerSuccess(e);
		else {
			playPopSound();
			setError("That answer is incorrect. Try another one!");
			setMathProblem(generateMathQuestion());
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.main, {
		className: "parental-gate-page relative min-h-screen w-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-sky-400 via-sky-300 to-sky-500 overflow-hidden",
		initial: {
			opacity: 0,
			scale: .96
		},
		animate: {
			opacity: 1,
			scale: 1
		},
		exit: { opacity: 0 },
		transition: { duration: .3 },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "gate-floating gate-star-one pointer-events-none opacity-80",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StarIcon, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "gate-floating gate-star-two pointer-events-none opacity-80",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StarIcon, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gate-floating gate-bubble-one pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gate-floating gate-bubble-two pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "relative z-10 pt-8 pb-4 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-sm mb-3 shadow-sm border border-white/30",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
							size: 18,
							className: "text-amber-300"
						}), " Grown-Ups Only"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "parental-gate-title text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md",
						children: "Parental Gate"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-lg sm:text-xl font-bold text-sky-100 drop-shadow",
						children: "Verify to access parent settings & controls"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex items-center bg-sky-900/20 p-1.5 rounded-2xl backdrop-blur-md border border-white/30 shadow-inner mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						playPopSound();
						setGateMode("pin");
						setError("");
					},
					className: `flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black transition-all ${gateMode === "pin" ? "bg-white text-sky-800 shadow-md scale-105" : "text-white hover:bg-white/10"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { size: 16 }), " Parent PIN"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						playPopSound();
						setGateMode("math");
						setError("");
					},
					className: `flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black transition-all ${gateMode === "math" ? "bg-white text-sky-800 shadow-md scale-105" : "text-white hover:bg-white/10"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { size: 16 }), " Math Challenge"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative z-10 flex w-full max-w-md flex-1 flex-col items-center justify-center my-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						animate: {
							y: [
								0,
								-8,
								0
							],
							rotate: [
								0,
								2,
								-2,
								0
							]
						},
						transition: {
							repeat: Infinity,
							duration: 3.5,
							ease: "easeInOut"
						},
						className: "relative z-10 -mb-6 flex flex-col items-center pointer-events-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								scale: .8,
								opacity: 0
							},
							animate: {
								scale: 1,
								opacity: 1
							},
							className: "mb-2 bg-white text-sky-900 font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-lg border-2 border-sky-200 flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm",
								children: "🐧"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pippin the Penguin is guarding the gate!" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative w-36 h-36 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-b from-sky-200 to-indigo-300 ring-4 ring-sky-300/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: penguin_avatar_1784920051288_default,
								alt: "Pippin the Cute Penguin Mascot",
								className: "w-full h-full object-cover scale-105"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute bottom-1 right-1 bg-amber-400 text-amber-950 p-1.5 rounded-full border-2 border-white shadow-md",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
									size: 16,
									className: "stroke-[2.5]"
								})
							})]
						})]
					}),
					gateMode === "pin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 15
						},
						animate: {
							opacity: 1,
							y: 0
						},
						exit: {
							opacity: 0,
							y: -15
						},
						className: "relative z-10 w-full bg-white p-6 sm:p-8 text-center shadow-2xl rounded-3xl border-4 border-sky-100",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "text-2xl font-black text-slate-800 flex items-center justify-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
									className: "text-sky-500",
									size: 22
								}), " Enter Parent PIN"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-slate-500 font-medium mt-1 mb-4",
								children: "Enter your 4 to 6 digit private PIN"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative flex items-center justify-center gap-3 my-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-2.5 bg-slate-100 px-6 py-3 rounded-2xl border-2 border-slate-200",
									children: Array.from({ length: Math.max(4, pin.length) }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-4 w-4 rounded-full transition-all ${i < pin.length ? "bg-sky-500 scale-110 shadow-sm" : "bg-slate-300"}` }, i))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setShowPin(!showPin),
									className: "text-slate-400 hover:text-sky-600 p-2",
									title: showPin ? "Hide PIN" : "Show PIN",
									children: showPin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { size: 20 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 20 })
								})]
							}),
							showPin && pin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-lg font-mono font-bold text-sky-600 tracking-widest my-1",
								children: pin
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-2.5 max-w-xs mx-auto mt-4",
								children: [
									[
										"1",
										"2",
										"3",
										"4",
										"5",
										"6",
										"7",
										"8",
										"9"
									].map((digit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
										whileHover: { scale: 1.05 },
										whileTap: { scale: .92 },
										type: "button",
										onClick: () => handleKeypadPress(digit),
										className: "h-12 rounded-2xl bg-sky-50 hover:bg-sky-100 font-black text-xl text-sky-800 shadow-sm border border-sky-100 flex items-center justify-center",
										children: digit
									}, digit)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
										whileTap: { scale: .9 },
										type: "button",
										onClick: () => {
											playPopSound();
											setPin("");
											setError("");
										},
										className: "h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-600 flex items-center justify-center",
										children: "Clear"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
										whileHover: { scale: 1.05 },
										whileTap: { scale: .92 },
										type: "button",
										onClick: () => handleKeypadPress("0"),
										className: "h-12 rounded-2xl bg-sky-50 hover:bg-sky-100 font-black text-xl text-sky-800 shadow-sm border border-sky-100 flex items-center justify-center",
										children: "0"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
										whileTap: { scale: .9 },
										type: "button",
										onClick: handleKeypadDelete,
										className: "h-12 rounded-2xl bg-rose-50 hover:bg-rose-100 font-bold text-rose-600 flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delete, { size: 20 })
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
								whileHover: { scale: 1.02 },
								whileTap: { scale: .96 },
								type: "button",
								className: "mt-5 w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black rounded-2xl shadow-lg transition-all text-base",
								onClick: submitPin,
								children: "Unlock Dashboard"
							})
						]
					}, "pin-box") : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 15
						},
						animate: {
							opacity: 1,
							y: 0
						},
						exit: {
							opacity: 0,
							y: -15
						},
						className: "relative z-10 w-full bg-white p-6 sm:p-8 text-center shadow-2xl rounded-3xl border-4 border-sky-100",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-extrabold text-sky-600 uppercase tracking-wider mb-2",
								children: "Solve to Prove You're an Adult"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-sky-50 rounded-2xl p-6 border-2 border-sky-100 my-2 shadow-inner",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-5xl font-black text-slate-800 tracking-wider flex items-center justify-center gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sky-600",
											children: mathProblem.num1
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-amber-500",
											children: "+"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sky-600",
											children: mathProblem.num2
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-slate-400",
											children: "="
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-purple-600 font-extrabold",
											children: "?"
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6 grid grid-cols-3 gap-3",
								children: mathProblem.choices.map((choice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
									whileHover: { scale: 1.08 },
									whileTap: { scale: .92 },
									type: "button",
									className: "py-4 rounded-2xl bg-gradient-to-b from-sky-100 to-sky-200 hover:from-sky-200 hover:to-sky-300 border-2 border-sky-300 shadow-md text-3xl font-black text-sky-900 transition-all",
									onClick: (e) => handleMathAnswer(choice, e),
									children: choice
								}, choice))
							})
						]
					}, "math-box"),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.p, {
						initial: {
							opacity: 0,
							y: 5
						},
						animate: {
							opacity: 1,
							y: 0
						},
						exit: { opacity: 0 },
						className: "mt-4 font-black text-rose-600 bg-white/95 border-2 border-rose-200 px-5 py-2.5 rounded-full shadow-lg text-sm",
						children: ["⚠️ ", error]
					}) })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "relative z-10 pb-6 pt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
					whileHover: { scale: 1.06 },
					whileTap: { scale: .94 },
					type: "button",
					className: "flex items-center gap-2 rounded-full border-2 border-white/40 bg-white/80 hover:bg-white px-8 py-3 text-lg font-black text-sky-800 shadow-lg backdrop-blur-md transition-all",
					onClick: () => {
						playPopSound();
						onCancel();
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GearIcon, {}), "Cancel & Return"]
				})
			})
		]
	});
}
function StarIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		fill: "currentColor",
		height: "24",
		width: "24",
		viewBox: "0 0 24 24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" })
	});
}
function GearIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		className: "h-5 w-5",
		fill: "currentColor",
		viewBox: "0 0 24 24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm7.43-2.53c.04-.32.07-.64.07-.97s-.03-.66-.07-1l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1s.03.66.07 1l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.31.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65z" })
	});
}
var API_BASE_URL = "http://192.168.0.113:30081/api";
async function getApiHealth() {
	const response = await fetch(`${API_BASE_URL}/health`);
	if (!response.ok) throw new Error(`API health check failed: ${response.status}`);
	return response.json();
}
async function registerParent(name, email, password) {
	const response = await fetch(`${API_BASE_URL}/auth/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			name,
			email,
			password
		})
	});
	const data = await response.json();
	if (!response.ok) throw new Error(data.error || "Parent registration failed.");
	return data;
}
async function loginParent(email, password) {
	const response = await fetch(`${API_BASE_URL}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			email,
			password
		})
	});
	const data = await response.json();
	if (!response.ok) throw new Error(data.error || "Parent login failed.");
	return data;
}
async function getChildren(token) {
	const response = await fetch(`${API_BASE_URL}/children`, { headers: { Authorization: `Bearer ${token}` } });
	if (!(response.headers.get("content-type") || "").includes("application/json")) throw new Error(`Children API returned invalid content: ${response.status}`);
	const data = await response.json();
	if (!response.ok) throw new Error(data.error || "Unable to load child profiles.");
	return Array.isArray(data) ? data : [];
}
async function readJsonResponse(response) {
	if (!(response.headers.get("content-type") || "").includes("application/json")) {
		const body = await response.text();
		throw new Error(`API returned invalid content (${response.status}): ` + body.slice(0, 100));
	}
	const data = await response.json();
	if (!response.ok) throw new Error(data.error || `API request failed (${response.status}).`);
	return data;
}
async function getAdminParents(token) {
	const data = await readJsonResponse(await fetch(`${API_BASE_URL}/admin/parents`, { headers: { Authorization: `Bearer ${token}` } }));
	return Array.isArray(data) ? data : [];
}
async function getAdminChildren(token) {
	const data = await readJsonResponse(await fetch(`${API_BASE_URL}/admin/children`, { headers: { Authorization: `Bearer ${token}` } }));
	return Array.isArray(data) ? data : [];
}
function ParentLogin({ onSuccess, onGuest }) {
	const [mode, setMode] = (0, import_react.useState)("login");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const handleSubmit = async () => {
		const cleanEmail = email.trim();
		const cleanName = name.trim();
		if (mode === "register" && !cleanName) {
			setError("Please enter your parent name.");
			return;
		}
		if (!cleanEmail || !password) {
			setError("Enter your parent email and password.");
			return;
		}
		setLoading(true);
		setError("");
		try {
			let result;
			if (mode === "register") result = await registerParent(cleanName, cleanEmail, password);
			else result = await loginParent(cleanEmail, password);
			localStorage.setItem("sasa-parent-token", result.token);
			localStorage.setItem("sasa-parent-name", result.user.display_name);
			onSuccess(result.token, result.user.display_name);
		} catch (err) {
			setError(err instanceof Error ? err.message : mode === "register" ? "Parent registration failed." : "Parent login failed.");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "parent-login-page",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "parent-login-card max-w-md w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "parent-login-icon bg-purple-100 text-purple-700 p-3 rounded-full inline-flex",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 36 })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex bg-slate-100 p-1.5 rounded-2xl my-4 w-full border border-slate-200",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setMode("login");
							setError("");
						},
						className: `flex-1 py-2 text-xs font-black rounded-xl transition ${mode === "login" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`,
						children: "Sign In"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setMode("register");
							setError("");
						},
						className: `flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1 ${mode === "register" ? "bg-purple-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Register Parent" })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-black text-slate-800",
					children: mode === "register" ? "Register Parent Account" : "Parent Login"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-slate-500 mb-4",
					children: mode === "register" ? "Create a parent account to set up and manage your kids' custom profiles." : "Sign in using your SARA Tube parent account."
				}),
				mode === "register" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "parent-login-field",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Parent Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { size: 20 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						value: name,
						autoComplete: "name",
						placeholder: "e.g. Sarah Connor",
						onChange: (event) => {
							setName(event.target.value);
							setError("");
						}
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "parent-login-field",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Email address" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { size: 20 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "email",
						value: email,
						autoComplete: "email",
						placeholder: "parent@example.com",
						onChange: (event) => {
							setEmail(event.target.value);
							setError("");
						}
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "parent-login-field",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Password" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, { size: 20 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: showPassword ? "text" : "password",
							value: password,
							autoComplete: mode === "register" ? "new-password" : "current-password",
							placeholder: "Enter password",
							onChange: (event) => {
								setPassword(event.target.value);
								setError("");
							},
							onKeyDown: (event) => {
								if (event.key === "Enter") handleSubmit();
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "parent-login-password-toggle",
							onClick: () => setShowPassword((current) => !current),
							"aria-label": showPassword ? "Hide password" : "Show password",
							children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { size: 19 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 19 })
						})
					] })]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "parent-login-error",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "parent-login-submit cursor-pointer",
					disabled: loading,
					onClick: handleSubmit,
					children: loading ? mode === "register" ? "Creating Parent Account..." : "Signing in..." : mode === "register" ? "Create Parent Account" : "Sign In"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "parent-login-divider",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "or" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "parent-login-guest cursor-pointer",
					disabled: loading,
					onClick: onGuest,
					children: "Continue as Guest"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
					className: "text-[11px] text-slate-400 mt-3 block",
					children: "Guest mode lets kids jump straight into watching safe videos without an account. Registering a parent account enables multi-profile setup and time limits."
				})
			]
		})
	});
}
var defaultParentControlSettings = {
	screenLimitEnabled: true,
	screenMinutes: 90,
	bedtimeEnabled: true,
	bedtimeStart: "20:00",
	bedtimeEnd: "07:00",
	deviceLocked: false,
	blockedChannels: [{
		id: 1,
		name: "Ryan's World",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8h0FQFA_8laRvvyvA_y-9UW7CQCVYZOXp05jh6hY9RzIIKuCFjHFgJF2sH0mJJu-6QAScLVnpDSc5Qqt45FLvRuiEXkfhW1f0PUdmLaaNfdUg_ETpRcasrArWIqd6UAJaTlS23T7Xv6FHJl52qK_Ne18bS5vRBf-KECJGXoDXJ4m-V9mntUPZNU3IP0JMQaKBcpNgGfMPal72INZ-nZsV3kxwWmQR7qQ7YATvoFfENLw6vuo4rNCjM36opXdBDeGzbxH-q86bZpA"
	}, {
		id: 2,
		name: "Blippi",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkKQ_iYk7Pblor4K10ZrejHUaTmoJnbg6Pa_8p0N8Kh1_HY5N6jEQylBbiKVesLm5D9ZqpWOk1TGxkHOv4jf8BhTWyzLUhPiiPMJshxPRcje4ql5BAcBA_6aLmBjZY2Ttrt8ALso9NkjDxG4qOQXNLviIcsop8vKUfhsgDxXnnQcl2i9s8bkPYe2ViG02TUee_njZ2YpkOchFJOzTBZAba1wAOAg0_G-8Brw1oDxW6s3jqU-4LRZOS-SCOX14oRefpl7S09zyQvAc"
	}],
	blockedVideoIds: [],
	parentPin: "1234",
	requireParentPin: true
};
var chartData = [
	{
		day: "Mon",
		videos: 10,
		games: 40,
		reading: 30
	},
	{
		day: "Tue",
		videos: 20,
		games: 50,
		reading: 20
	},
	{
		day: "Wed",
		videos: 15,
		games: 30,
		reading: 40
	},
	{
		day: "Thu",
		videos: 10,
		games: 60,
		reading: 10
	},
	{
		day: "Fri",
		videos: 25,
		games: 40,
		reading: 30
	},
	{
		day: "Sat",
		videos: 5,
		games: 20,
		reading: 50
	},
	{
		day: "Sun",
		videos: 15,
		games: 35,
		reading: 25
	}
];
function ParentDashboard({ onClose, settings, profileId, profileName, customProfiles, onDeleteCustomProfile, onUpdateCustomProfile, onToggleProfileProtection, onSettingsChange }) {
	const [activeSection, setActiveSection] = (0, import_react.useState)("screen-time");
	const [newBlockedChannel, setNewBlockedChannel] = (0, import_react.useState)("");
	const [videoFilterQuery, setVideoFilterQuery] = (0, import_react.useState)("");
	const [filterCategory, setFilterCategory] = (0, import_react.useState)("All");
	const [newParentPin, setNewParentPin] = (0, import_react.useState)(settings.parentPin || "1234");
	const [settingsMessage, setSettingsMessage] = (0, import_react.useState)("");
	const [editingProfileId, setEditingProfileId] = (0, import_react.useState)(null);
	const [editProfileName, setEditProfileName] = (0, import_react.useState)("");
	const [editProfileAge, setEditProfileAge] = (0, import_react.useState)(5);
	const [editProfileEmoji, setEditProfileEmoji] = (0, import_react.useState)("🦁");
	const [editProfileColor, setEditProfileColor] = (0, import_react.useState)("#ffb703");
	const profileAvatarOptions = [
		"🦁",
		"🐼",
		"🐰",
		"🐻",
		"🦊"
	];
	const startEditingProfile = (child) => {
		setEditingProfileId(child.id);
		setEditProfileName(child.name);
		setEditProfileAge(child.age ?? 5);
		setEditProfileEmoji(child.emoji);
		setEditProfileColor(child.color);
	};
	const cancelEditingProfile = () => {
		setEditingProfileId(null);
	};
	const saveEditedProfile = (child) => {
		const cleanName = editProfileName.trim();
		if (cleanName.length < 2) {
			window.alert("Profile name must contain at least 2 characters.");
			return;
		}
		onUpdateCustomProfile({
			...child,
			name: cleanName,
			age: editProfileAge,
			emoji: editProfileEmoji,
			color: editProfileColor
		});
		setEditingProfileId(null);
	};
	const loadWatchHistory = () => {
		try {
			const saved = localStorage.getItem("sasa-watch-history");
			if (!saved) return [];
			const parsed = JSON.parse(saved);
			if (!Array.isArray(parsed)) return [];
			return parsed.filter((item) => item && Number(item.profileId) === Number(profileId));
		} catch {
			return [];
		}
	};
	const [watchHistory, setWatchHistory] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		setWatchHistory(loadWatchHistory());
	}, [profileId, activeSection]);
	const { screenLimitEnabled, screenMinutes, bedtimeEnabled, bedtimeStart, bedtimeEnd, deviceLocked, blockedChannels, blockedVideoIds = [], parentPin = "1234", requireParentPin = true } = settings;
	const updateSettings = (changes) => {
		onSettingsChange({
			...settings,
			...changes
		});
	};
	const formattedTime = formatMinutes(screenMinutes);
	const unblockChannel = (channelId) => {
		updateSettings({ blockedChannels: blockedChannels.filter((channel) => channel.id !== channelId) });
	};
	const blockChannel = () => {
		const name = newBlockedChannel.trim();
		if (!name) return;
		if (blockedChannels.some((channel) => channel.name.toLowerCase() === name.toLowerCase())) {
			setNewBlockedChannel("");
			return;
		}
		const initial = name.charAt(0).toUpperCase();
		const avatar = `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <rect width="120" height="120" rx="28" fill="#dbeafe"/>
        <text x="60" y="76" text-anchor="middle"
          font-family="Arial" font-size="58" font-weight="700"
          fill="#2563eb">${initial}</text>
      </svg>
    `)}`;
		updateSettings({ blockedChannels: [...blockedChannels, {
			id: Date.now(),
			name,
			image: avatar
		}] });
		setNewBlockedChannel("");
	};
	const toggleVideoBlock = (videoId) => {
		updateSettings({ blockedVideoIds: blockedVideoIds.includes(videoId) ? blockedVideoIds.filter((id) => id !== videoId) : [...blockedVideoIds, videoId] });
	};
	const saveParentPin = () => {
		const cleanPin = newParentPin.trim();
		if (!/^\d{4,6}$/.test(cleanPin)) {
			setSettingsMessage("PIN must contain 4 to 6 numbers.");
			return;
		}
		updateSettings({ parentPin: cleanPin });
		setSettingsMessage("Parent PIN saved.");
	};
	const resetScreenTimer = () => {
		if (profileId !== null) {
			const expiryKey = `sasa-screen-expiry-${profileId}`;
			if (screenLimitEnabled) localStorage.setItem(expiryKey, String(Date.now() + screenMinutes * 60 * 1e3));
			else localStorage.removeItem(expiryKey);
		}
		setSettingsMessage("Screen-time timer restarted.");
	};
	const resetAllParentSettings = () => {
		const resetSettings = {
			...defaultParentControlSettings,
			deviceLocked: false
		};
		onSettingsChange(resetSettings);
		setNewParentPin(resetSettings.parentPin);
		if (profileId !== null) localStorage.removeItem(`sasa-screen-expiry-${profileId}`);
		setSettingsMessage("Parental settings restored to defaults.");
	};
	const clearWatchHistory = () => {
		try {
			const saved = localStorage.getItem("sasa-watch-history");
			const parsed = saved ? JSON.parse(saved) : [];
			const remaining = (Array.isArray(parsed) ? parsed : []).filter((item) => Number(item.profileId) !== Number(profileId));
			localStorage.setItem("sasa-watch-history", JSON.stringify(remaining));
			setWatchHistory([]);
		} catch {
			setWatchHistory([]);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "parent-dashboard",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileHeader, {
				activeSection,
				onSelectSection: (section) => {
					playPopSound();
					setActiveSection(section);
				},
				onClose
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "parent-sidebar",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "parent-brand",
						children: "WonderWatch"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "parent-sidebar-nav",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: activeSection === "screen-time" ? "parent-nav-item active" : "parent-nav-item",
								onClick: () => {
									playPopSound();
									setActiveSection("screen-time");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 26 }), "Screen Time"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: activeSection === "content-filters" ? "parent-nav-item active" : "parent-nav-item",
								onClick: () => {
									playPopSound();
									setActiveSection("content-filters");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { size: 26 }), "Content Filters"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: activeSection === "profiles" ? "parent-nav-item active" : "parent-nav-item",
								onClick: () => {
									playPopSound();
									setActiveSection("profiles");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "parent-nav-emoji",
									children: "👨‍👩‍👧"
								}), "Profiles"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: activeSection === "activity-history" ? "parent-nav-item active" : "parent-nav-item",
								onClick: () => {
									playPopSound();
									setActiveSection("activity-history");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { size: 26 }), "Activity & History"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "parent-sidebar-footer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: activeSection === "settings" ? "parent-settings-button active" : "parent-settings-button",
							onClick: () => {
								playPopSound();
								setActiveSection("settings");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { size: 21 }), "Settings"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "parent-close-button",
							onClick: () => {
								playPopSound();
								onClose();
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 21 }), "Exit dashboard"]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "parent-dashboard-main",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "parent-desktop-header",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: activeSection === "screen-time" ? "Screen Time Dashboard" : activeSection === "content-filters" ? "Content Filters" : activeSection === "activity-history" ? "Activity & History" : activeSection === "profiles" ? "Profile Management" : "Parent Settings" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "parent-account-area",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "parent-round-button",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { size: 21 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "parent-account",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "P" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Parent Account" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "parent-round-button",
								onClick: onClose,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 21 })
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "parent-dashboard-content",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "parent-mobile-title",
							children: activeSection === "screen-time" ? "Screen Time" : activeSection === "content-filters" ? "Content Filters" : activeSection === "activity-history" ? "Activity & History" : activeSection === "profiles" ? "Profiles" : "Parent Settings"
						}),
						activeSection === "screen-time" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-6 max-w-6xl mx-auto",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-100",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, {
												className: "text-sky-500",
												size: 24
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "text-2xl font-black text-slate-800",
												children: "Daily Screen Time Limit"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-slate-500 text-sm font-medium mt-1",
											children: "Set maximum viewing time per day. App locks automatically when limit is reached."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${screenLimitEnabled ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`,
												children: screenLimitEnabled ? `Active: ${formattedTime}` : "Limit Disabled"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => {
													playPopSound();
													updateSettings({ screenLimitEnabled: !screenLimitEnabled });
												},
												className: `relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${screenLimitEnabled ? "bg-sky-500" : "bg-slate-300"}`,
												"aria-label": "Toggle screen limit",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${screenLimitEnabled ? "translate-x-6" : "translate-x-0"}` })
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "py-6 space-y-6",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col sm:flex-row items-center justify-between gap-4 bg-sky-50/60 p-5 rounded-2xl border border-sky-100",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-center sm:text-left",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs font-black uppercase tracking-wider text-sky-600",
														children: "Target Daily Limit"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-4xl font-black text-sky-950 mt-0.5",
														children: screenLimitEnabled ? formattedTime : "Unlimited"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														disabled: !screenLimitEnabled || screenMinutes <= 15,
														onClick: () => {
															playPopSound();
															updateSettings({ screenMinutes: Math.max(15, screenMinutes - 15) });
														},
														className: "px-3.5 py-2 rounded-xl bg-white hover:bg-sky-100 disabled:opacity-40 font-black text-sky-700 shadow-sm border border-sky-200 text-sm transition",
														children: "-15 min"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														disabled: !screenLimitEnabled,
														onClick: () => {
															playPopSound();
															updateSettings({ screenMinutes: screenMinutes + 15 });
														},
														className: "px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 font-black text-white shadow-sm text-sm transition",
														children: "+15 min"
													})]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between text-xs font-bold text-slate-500",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "15 min" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "1 hour" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "2 hours" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "3 hours" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "4 hours" })
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "range",
													min: "15",
													max: "240",
													step: "15",
													value: screenMinutes,
													disabled: !screenLimitEnabled,
													onChange: (e) => {
														updateSettings({ screenMinutes: Number(e.target.value) });
													},
													className: "w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-40"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-bold text-slate-400 block mb-2",
												children: "Quick Time Presets:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5",
												children: [
													15,
													30,
													45,
													60,
													90,
													120,
													180
												].map((minutes) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: `py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm border transition-all ${screenLimitEnabled && screenMinutes === minutes ? "bg-sky-500 text-white border-sky-600 shadow-md scale-105" : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"}`,
													onClick: () => {
														playPopSound();
														updateSettings({
															screenLimitEnabled: true,
															screenMinutes: minutes
														});
													},
													children: minutes < 60 ? `${minutes} min` : minutes === 60 ? "1 hour" : `${Math.floor(minutes / 60)}h ${minutes % 60 ? minutes % 60 + "m" : ""}`
												}, minutes))
											})] })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
											className: "text-amber-600 shrink-0 mt-0.5",
											size: 18
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-amber-900 font-medium",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Timer behavior:" }), " The daily countdown activates when your child enters the kid profile and pauses when returning to the parent dashboard."]
										})]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-100",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between mb-6 pb-4 border-b border-slate-100",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "text-xl font-black text-slate-800",
												children: "Weekly Usage Overview"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-slate-500 font-medium",
												children: "Total watch & play activity this week"
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "px-3 py-1 bg-sky-50 text-sky-700 font-bold text-xs rounded-full border border-sky-200",
												children: "14h 25m total"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "parent-chart",
											children: chartData.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "parent-chart-column",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "parent-bars",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "bar videos",
															style: { height: `${item.videos}%` },
															title: `Videos: ${item.videos}%`
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "bar reading",
															style: { height: `${item.reading}%` },
															title: `Reading: ${item.reading}%`
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "bar games",
															style: { height: `${item.games}%` },
															title: `Games: ${item.games}%`
														})
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.day })]
											}, item.day))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "chart-legend",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
													colorClass: "videos",
													label: "Videos"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
													colorClass: "games",
													label: "Games"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
													colorClass: "reading",
													label: "Reading"
												})
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
										className: "bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "absolute top-0 right-0 p-8 opacity-10 pointer-events-none",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bed, { size: 120 })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between mb-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bed, { size: 22 })
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
														className: "text-lg font-black text-white",
														children: "Bedtime Curfew"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs text-slate-400",
														children: "Lock app during sleep hours"
													})] })]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => {
														playPopSound();
														updateSettings({ bedtimeEnabled: !bedtimeEnabled });
													},
													className: `px-3 py-1 rounded-full text-xs font-extrabold uppercase transition ${bedtimeEnabled ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400 border border-slate-700"}`,
													children: bedtimeEnabled ? "ACTIVE" : "OFF"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3 my-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "bg-slate-800/80 p-3 rounded-2xl border border-slate-700",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] font-bold text-slate-400 block uppercase",
														children: "Curfew Starts"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "time",
														value: bedtimeStart,
														onChange: (e) => updateSettings({ bedtimeStart: e.target.value }),
														className: "w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none cursor-pointer mt-0.5"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "bg-slate-800/80 p-3 rounded-2xl border border-slate-700",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] font-bold text-slate-400 block uppercase",
														children: "Curfew Ends"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "time",
														value: bedtimeEnd,
														onChange: (e) => updateSettings({ bedtimeEnd: e.target.value }),
														className: "w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none cursor-pointer mt-0.5"
													})]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs text-indigo-200/70 font-medium",
												children: [
													"🌙 Screen locks automatically between ",
													bedtimeStart,
													" and ",
													bedtimeEnd,
													"."
												]
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
										className: "bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl p-6 border-2 border-rose-200 shadow-md",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-3 mb-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "p-2.5 rounded-2xl bg-rose-500 text-white shadow-sm",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { size: 20 })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
													className: "text-lg font-black text-rose-950",
													children: "Dinner / Study Break"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-rose-700 font-medium",
													children: "Instantly lock app anytime"
												})] })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-slate-600 mb-4 font-medium leading-relaxed",
												children: "Need immediate attention for dinner, homework, or bedtime? Tap below to lock the video player instantly."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => {
													playSuccessSound();
													updateSettings({ deviceLocked: !deviceLocked });
												},
												className: `w-full py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all ${deviceLocked ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"}`,
												children: deviceLocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { size: 18 }), " Unlock Device Now"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { size: 18 }), " Lock Device Instantly"] })
											})
										]
									})]
								})]
							})]
						}),
						activeSection === "content-filters" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "parent-content-filter-page",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "content-filter-card",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "content-filter-card-heading",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Blocked Channels" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Restricted channels will not appear in the child's view." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [blockedChannels.length, " blocked"] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "channel-block-form",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											value: newBlockedChannel,
											placeholder: "Enter channel name to block",
											onChange: (event) => setNewBlockedChannel(event.target.value),
											onKeyDown: (event) => {
												if (event.key === "Enter") blockChannel();
											}
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: blockChannel,
											children: "+ Block"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "content-blocked-list",
										children: [blockedChannels.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "content-blocked-row",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "content-blocked-info",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: channel.image,
													alt: channel.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: channel.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Restricted by Parent" })] })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => unblockChannel(channel.id),
												children: "Unblock"
											})]
										}, channel.id)), blockedChannels.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "content-filter-empty",
											children: "No channels are currently blocked."
										})]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "content-filter-card",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "content-filter-card-heading",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Video Catalog Management" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Toggle block or allow status for individual cartoons & shows." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition",
													onClick: () => {
														playSuccessSound();
														updateSettings({ blockedVideoIds: [] });
													},
													children: "Allow All"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition",
													onClick: () => {
														playPopSound();
														updateSettings({ blockedVideoIds: kidsVideos.map((v) => v.id) });
													},
													children: "Block All"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-slate-700 ml-2",
													children: [blockedVideoIds.length, " blocked"]
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 my-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
												className: "absolute left-3.5 top-3 text-slate-400",
												size: 18
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												placeholder: "Search videos by title...",
												value: videoFilterQuery,
												onChange: (e) => setVideoFilterQuery(e.target.value),
												className: "w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0",
											children: [
												"All",
												"Cartoons",
												"Learning",
												"Songs",
												"Stories"
											].map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => {
													playPopSound();
													setFilterCategory(cat);
												},
												className: `px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${filterCategory === cat ? "bg-sky-500 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`,
												children: cat
											}, cat))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "video-filter-grid",
										children: kidsVideos.filter((video) => {
											const matchesSearch = video.title.toLowerCase().includes(videoFilterQuery.toLowerCase());
											const matchesCategory = filterCategory === "All" || video.category.toLowerCase().includes(filterCategory.toLowerCase());
											return matchesSearch && matchesCategory;
										}).map((video) => {
											const blocked = blockedVideoIds.includes(video.id);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: blocked ? "video-filter-item blocked" : "video-filter-item",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
														src: video.image,
														alt: video.title
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "video-filter-details",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: video.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: video.category })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: blocked ? "allow-video-button" : "block-video-button",
														onClick: () => {
															playPopSound();
															toggleVideoBlock(video.id);
														},
														children: blocked ? "Allow" : "Block"
													})
												]
											}, video.id);
										})
									})
								]
							})]
						}),
						activeSection === "activity-history" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "activity-history-page",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "activity-summary-grid",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
										className: "activity-summary-card",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "▶️" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: watchHistory.length }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Total video opens" })] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
										className: "activity-summary-card",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🎬" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: new Set(watchHistory.map((item) => item.videoId)).size }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Unique videos" })] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
										className: "activity-summary-card",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "👤" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: profileName }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Selected profile" })] })]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "activity-history-card",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "activity-history-heading",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Watch History" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
										"Videos opened by ",
										profileName,
										"."
									] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: watchHistory.length === 0,
										onClick: clearWatchHistory,
										children: "Clear History"
									})]
								}), watchHistory.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "activity-history-empty",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "📺" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "No watch history yet" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Videos will appear here after the child opens them." })
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "activity-history-list",
									children: watchHistory.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
										className: "activity-history-row",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: item.image,
												alt: item.title
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "activity-history-details",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: item.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.category }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.duration })] })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", { children: new Date(item.watchedAt).toLocaleString() })
										]
									}, item.historyId))
								})]
							})]
						}),
						activeSection === "profiles" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "profile-management-page",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "profile-management-heading",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Child Profiles" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "View built-in profiles and manage profiles created by the parent." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [3 + customProfiles.length, " profiles"] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "profile-management-grid",
									children: [[
										{
											id: 1,
											name: "Leo",
											emoji: "🦁",
											color: "#ffa62b",
											image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXKmBbTEschT2fVlXzamCeETx0M3rctPouvJQ6jyWboczUe-WXt302CDJtMx5T_L9-zEaxhM_vxlITgSZt9_ApPXqHF9Vx39tEHo5gDXRFuGHRZ_rrEz6fOH5KlalMKiv82rUKm_4IRONsQ-wF064xYk_0ZIzAijLaovdE2H-qhe86S9qU1K70VcVvqOQ7GxR9ujHTTCg5GPHGI4VYoTLTPpwFitUSQ7JP8kSUjWRij6OOEIBXNKbLcaKkBrH4y-J_4PM1zmklxnA"
										},
										{
											id: 2,
											name: "Poppy",
											emoji: "🐼",
											color: "#95d5b2",
											image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCONd4umMhgrulZ5f-ZZt2Uuy9-ach-KvWVrVKGmgiL58eNixQ0RjTvy4dEfDeZ1J7AjEKiLqrUKdXuuqdwFo-IF87mvFkdWZwpDs4hfs2FGU19CtmN6-k04UQXX4ibVERtYQS4ejdOmmIu6QKvrqVw2lGKdJHCiNNzzQGpdSP3Zir5sHO0B2Dt0_hf7PLpsbxeTuzJbU0-bxuCDZ2egbgYTHvpvt7p7Nl-GMz8P2cZlpqKbDqaybqBQFAYBqN6KlDGvQr8Yd7diDQ"
										},
										{
											id: 3,
											name: "Ruby",
											emoji: "🐰",
											color: "#ff8fa3",
											image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSpgsSIXN0d0LIyQMwB5SQbDUf6iitsVRQwTNbcaYYxamCvTLMt2omcQa9RPFVNaWlGDX2OTgHS9ZHHumfzn4jTOqF8IM0wzwTvI6lEkYLR5e4j1moqa0_Wrartxg-46lIyoXuBdsEFX9pa7gJgLs0L0SshcnaM8a_OnasZM-Uogwwpf5DOLftEcb2sg4fUl5uLX5o-g-g9wxt8QgqtmJ1Zii35Iibp-f7PH3ACFzlM57Cuf4m8MVAwA0J5c_n1YsiT4-gFfBgNg0"
										}
									].map((child) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
										className: "profile-management-card",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "profile-management-avatar overflow-hidden",
												style: { backgroundColor: child.color },
												children: child.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: child.image,
													alt: child.name,
													className: "w-full h-full object-cover"
												}) : child.emoji
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "profile-management-info",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: child.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Built-in profile" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "profile-protected-badge",
												children: "Protected"
											})
										]
									}, child.id)), customProfiles.map((child) => {
										const isEditing = editingProfileId === child.id;
										const photoUrl = child.avatarUrl || child.image;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
											className: child.isProtected ? "profile-management-card protected" : "profile-management-card",
											children: isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "profile-edit-form",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "profile-edit-preview",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "profile-management-avatar overflow-hidden",
															style: { backgroundColor: editProfileColor },
															children: photoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
																src: photoUrl,
																alt: child.name,
																className: "w-full h-full object-cover"
															}) : editProfileEmoji
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "text",
														maxLength: 20,
														value: editProfileName,
														onChange: (event) => setEditProfileName(event.target.value)
													})] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Age" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "number",
														min: 2,
														max: 17,
														value: editProfileAge,
														onChange: (event) => setEditProfileAge(Math.min(17, Math.max(2, Number(event.target.value))))
													})] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "profile-edit-avatars",
														children: profileAvatarOptions.map((emoji) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															className: editProfileEmoji === emoji ? "selected" : "",
															onClick: () => setEditProfileEmoji(emoji),
															children: emoji
														}, emoji))
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Profile color" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "color",
														value: editProfileColor,
														onChange: (event) => setEditProfileColor(event.target.value)
													})] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "profile-edit-actions",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															className: "profile-save-button",
															onClick: () => saveEditedProfile(child),
															children: "Save"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															className: "profile-cancel-button",
															onClick: cancelEditingProfile,
															children: "Cancel"
														})]
													})
												]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "profile-management-avatar overflow-hidden",
													style: { backgroundColor: child.color },
													children: photoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
														src: photoUrl,
														alt: child.name,
														className: "w-full h-full object-cover"
													}) : child.emoji
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "profile-management-info",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [child.name, child.isProtected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "profile-lock-icon",
														title: "Protected profile",
														children: "🔒"
													})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: child.age ? `Age ${child.age}` : "Custom profile" })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "profile-management-actions",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															className: "profile-edit-button",
															onClick: () => startEditingProfile(child),
															children: "Edit"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															className: "profile-protect-button",
															onClick: () => onToggleProfileProtection(child.id),
															children: child.isProtected ? "Unprotect" : "Protect"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															className: "profile-delete-button",
															disabled: child.isProtected,
															onClick: () => {
																if (child.isProtected) return;
																if (window.confirm(`Delete ${child.name}'s profile?`)) onDeleteCustomProfile(child.id);
															},
															children: "Delete"
														})
													]
												})
											] })
										}, child.id);
									})]
								}),
								customProfiles.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "profile-management-empty",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "➕" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "No custom profiles yet" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Custom profiles created from the profile-selection page will appear here." })
									]
								})
							]
						}),
						activeSection === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "parent-settings-page",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "parent-settings-card",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "parent-settings-heading",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Parent Access" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Protect parental controls with a private numeric PIN." })] })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "parent-settings-toggle-row",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Require Parent PIN" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ask for the PIN before opening the parent dashboard." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: requireParentPin ? "parent-switch enabled" : "parent-switch",
												onClick: () => updateSettings({ requireParentPin: !requireParentPin }),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "parent-pin-form",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "New Parent PIN" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "password",
												inputMode: "numeric",
												maxLength: 6,
												value: newParentPin,
												onChange: (event) => {
													setNewParentPin(event.target.value.replace(/\D/g, ""));
													setSettingsMessage("");
												},
												placeholder: "4 to 6 numbers"
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: saveParentPin,
												children: "Save PIN"
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "parent-settings-card",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "parent-settings-heading",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Screen-Time Tools" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Restart the current child's screen-time allowance." })] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "parent-reset-timer-button",
										onClick: resetScreenTimer,
										children: "Restart Screen-Time Timer"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "parent-settings-card danger",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "parent-settings-heading",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Reset Parental Settings" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Restore screen time, bedtime, filters and PIN to their defaults." })] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "parent-reset-all-button",
										onClick: resetAllParentSettings,
										children: "Reset All Parental Settings"
									})]
								}),
								settingsMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "parent-settings-message",
									children: settingsMessage
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileBottomNavigation, {
				activeSection,
				onSelectSection: (section) => {
					playPopSound();
					setActiveSection(section);
				}
			})
		]
	});
}
function MobileHeader({ activeSection, onSelectSection, onClose }) {
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "relative z-30 bg-slate-900 text-white border-b border-slate-800 px-4 py-3 md:hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						playPopSound();
						setMenuOpen(!menuOpen);
					},
					className: "p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 transition",
					"aria-label": "Toggle navigation menu",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { size: 22 })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
						className: "text-sky-400",
						size: 20
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-base font-black tracking-tight text-white",
						children: {
							"screen-time": "Screen Time",
							"content-filters": "Content Filters",
							profiles: "Profiles",
							"activity-history": "Activity & History",
							settings: "Settings"
						}[activeSection] || "Parent Dashboard"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						playPopSound();
						onClose();
					},
					className: "p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition",
					"aria-label": "Exit dashboard",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 22 })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: menuOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.nav, {
			initial: {
				opacity: 0,
				height: 0
			},
			animate: {
				opacity: 1,
				height: "auto"
			},
			exit: {
				opacity: 0,
				height: 0
			},
			className: "overflow-hidden mt-3 pt-3 border-t border-slate-800 space-y-1",
			children: [[
				{
					id: "screen-time",
					label: "Screen Time",
					icon: Clock3
				},
				{
					id: "content-filters",
					label: "Content Filters",
					icon: Shield
				},
				{
					id: "profiles",
					label: "Profiles",
					icon: Users
				},
				{
					id: "activity-history",
					label: "Activity & History",
					icon: ChartColumn
				},
				{
					id: "settings",
					label: "Settings",
					icon: Settings
				}
			].map((tab) => {
				const Icon = tab.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						onSelectSection(tab.id);
						setMenuOpen(false);
					},
					className: `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition ${activeSection === tab.id ? "bg-sky-500 text-white shadow-md" : "text-slate-300 hover:bg-slate-800"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 18 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tab.label })]
				}, tab.id);
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => {
					onClose();
				},
				className: "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-rose-400 hover:bg-rose-500/10 mt-2 transition",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Exit Dashboard" })]
			})]
		}) })]
	});
}
function MobileBottomNavigation({ activeSection, onSelectSection }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "fixed bottom-0 left-0 right-0 z-30 bg-slate-900 border-t border-slate-800 px-2 py-1.5 flex items-center justify-around md:hidden shadow-2xl",
		children: [
			{
				id: "screen-time",
				label: "Screen",
				icon: Clock3
			},
			{
				id: "content-filters",
				label: "Filters",
				icon: Shield
			},
			{
				id: "profiles",
				label: "Profiles",
				icon: Users
			},
			{
				id: "activity-history",
				label: "Activity",
				icon: ChartColumn
			},
			{
				id: "settings",
				label: "Settings",
				icon: Settings
			}
		].map((tab) => {
			const Icon = tab.icon;
			const isActive = activeSection === tab.id;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onSelectSection(tab.id),
				className: `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${isActive ? "text-sky-400 font-extrabold" : "text-slate-400 hover:text-slate-200"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					size: 20,
					className: isActive ? "scale-110" : ""
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] mt-0.5 tracking-tight",
					children: tab.label
				})]
			}, tab.id);
		})
	});
}
function Legend({ colorClass, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `legend-color ${colorClass}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: label })] });
}
function formatMinutes(totalMinutes) {
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	if (hours === 0) return `${minutes} min`;
	if (minutes === 0) return `${hours} hr`;
	return `${hours} hr ${minutes} min`;
}
var profiles = [
	{
		id: 1,
		name: "Leo",
		emoji: "🦁",
		color: "#ffa62b",
		background: "bg-orange-100",
		nameColor: "text-[#ffa62b]",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXKmBbTEschT2fVlXzamCeETx0M3rctPouvJQ6jyWboczUe-WXt302CDJtMx5T_L9-zEaxhM_vxlITgSZt9_ApPXqHF9Vx39tEHo5gDXRFuGHRZ_rrEz6fOH5KlalMKiv82rUKm_4IRONsQ-wF064xYk_0ZIzAijLaovdE2H-qhe86S9qU1K70VcVvqOQ7GxR9ujHTTCg5GPHGI4VYoTLTPpwFitUSQ7JP8kSUjWRij6OOEIBXNKbLcaKkBrH4y-J_4PM1zmklxnA"
	},
	{
		id: 2,
		name: "Poppy",
		emoji: "🐼",
		color: "#95d5b2",
		background: "bg-green-100",
		nameColor: "text-white",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCONd4umMhgrulZ5f-ZZt2Uuy9-ach-KvWVrVKGmgiL58eNixQ0RjTvy4dEfDeZ1J7AjEKiLqrUKdXuuqdwFo-IF87mvFkdWZwpDs4hfs2FGU19CtmN6-k04UQXX4ibVERtYQS4ejdOmmIu6QKvrqVw2lGKdJHCiNNzzQGpdSP3Zir5sHO0B2Dt0_hf7PLpsbxeTuzJbU0-bxuCDZ2egbgYTHvpvt7p7Nl-GMz8P2cZlpqKbDqaybqBQFAYBqN6KlDGvQr8Yd7diDQ"
	},
	{
		id: 3,
		name: "Ruby",
		emoji: "🐰",
		color: "#ff8fa3",
		background: "bg-pink-100",
		nameColor: "text-[#ff8fa3]",
		image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSpgsSIXN0d0LIyQMwB5SQbDUf6iitsVRQwTNbcaYYxamCvTLMt2omcQa9RPFVNaWlGDX2OTgHS9ZHHumfzn4jTOqF8IM0wzwTvI6lEkYLR5e4j1moqa0_Wrartxg-46lIyoXuBdsEFX9pa7gJgLs0L0SshcnaM8a_OnasZM-Uogwwpf5DOLftEcb2sg4fUl5uLX5o-g-g9wxt8QgqtmJ1Zii35Iibp-f7PH3ACFzlM57Cuf4m8MVAwA0J5c_n1YsiT4-gFfBgNg0"
	}
];
function ProfileSelection({ customProfiles, onSelectProfile, onOpenParentalControls, onAddProfile }) {
	const [selectingId, setSelectingId] = (0, import_react.useState)(null);
	const handleProfileClick = (name, emoji, color, id, image, event) => {
		if (selectingId !== null) return;
		setSelectingId(id);
		playSuccessSound();
		const rect = event.currentTarget.getBoundingClientRect();
		confetti_module_default({
			particleCount: 45,
			spread: 85,
			origin: {
				x: (rect.left + rect.width / 2) / window.innerWidth,
				y: (rect.top + rect.height / 2) / window.innerHeight
			},
			colors: [
				"#ff8fa3",
				"#ffa62b",
				"#ffde59",
				"#95d5b2",
				"#8ecae6"
			]
		});
		const numericId = typeof id === "number" ? id : Number(id) || 0;
		setTimeout(() => {
			onSelectProfile(name, emoji, color, numericId, image);
		}, 420);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		className: "kids-profile-page",
		initial: {
			opacity: 0,
			scale: .95
		},
		animate: {
			opacity: 1,
			scale: 1
		},
		exit: {
			opacity: 0,
			scale: .95
		},
		transition: {
			duration: .4,
			ease: "easeOut"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cloud cloud-one" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cloud cloud-two" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cloud cloud-three" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "kids-star star-one" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "kids-star star-two" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "kids-star star-three" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "relative z-10 flex w-full justify-end px-6 pt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
					type: "button",
					animate: selectingId !== null ? {
						opacity: .3,
						scale: .95
					} : {
						opacity: 1,
						scale: 1
					},
					transition: { duration: .3 },
					whileHover: selectingId === null ? { scale: 1.08 } : void 0,
					whileTap: selectingId === null ? { scale: .92 } : void 0,
					className: "flex items-center gap-2 rounded-full border-2 border-slate-400/30 bg-white/90 px-5 py-2.5 shadow-md backdrop-blur-md cursor-pointer",
					onClick: () => {
						if (selectingId !== null) return;
						playPopSound();
						onOpenParentalControls();
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						className: "h-7 w-7 text-slate-600",
						fill: "none",
						stroke: "currentColor",
						viewBox: "0 0 24 24",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z",
							strokeLinecap: "round",
							strokeLinejoin: "round",
							strokeWidth: "2"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z",
							strokeLinecap: "round",
							strokeLinejoin: "round",
							strokeWidth: "2"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-left text-sm font-bold leading-tight text-slate-700",
						children: [
							"Parental",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"Controls"
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "relative z-10 -mt-8 flex w-full flex-grow flex-col items-center justify-center px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					className: "mb-8 text-center",
					animate: selectingId !== null ? {
						opacity: .35,
						scale: .94
					} : {
						opacity: 1,
						scale: 1
					},
					transition: { duration: .3 },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "flex flex-col items-center text-5xl font-extrabold md:text-6xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "kids-title-text -mb-2 text-[#8ecae6]",
							children: "Who's"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "kids-title-text text-[#ff8fa3]",
									children: "W"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "kids-title-text text-[#ffa62b]",
									children: "a"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "kids-title-text text-[#ffde59]",
									children: "t"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "kids-title-text text-[#ff8fa3]",
									children: "c"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "kids-title-text text-[#95d5b2]",
									children: "h"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "kids-title-text text-[#8ecae6]",
									children: "i"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "kids-title-text text-[#ffa62b]",
									children: "n"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "kids-title-text text-[#ff8fa3]",
									children: "g"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "kids-title-text text-[#ffde59]",
									children: "?"
								})
							]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid w-full max-w-sm grid-cols-2 gap-x-8 gap-y-10",
					children: [
						profiles.map((profile, idx) => {
							const isSelected = selectingId === profile.id;
							const isOtherSelected = selectingId !== null && !isSelected;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
								initial: {
									opacity: 0,
									scale: .82,
									y: 20
								},
								animate: isSelected ? {
									opacity: 1,
									scale: 1.18,
									y: -10
								} : isOtherSelected ? {
									opacity: .15,
									scale: .8,
									y: 10
								} : {
									opacity: 1,
									scale: 1,
									y: 0
								},
								transition: isSelected ? {
									type: "spring",
									stiffness: 320,
									damping: 22
								} : {
									duration: .3,
									ease: "easeInOut",
									delay: idx * .06
								},
								whileHover: selectingId === null ? {
									scale: 1.1,
									rotate: idx % 2 === 0 ? 3 : -3
								} : void 0,
								whileTap: selectingId === null ? { scale: .92 } : void 0,
								type: "button",
								className: "group flex flex-col items-center gap-3 relative cursor-pointer",
								onClick: (e) => handleProfileClick(profile.name, profile.emoji, profile.color, profile.id, profile.image, e),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [(profile.name === "Leo" || isSelected) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
										animate: isSelected ? {
											scale: [
												1,
												1.3,
												1.18
											],
											opacity: [
												.6,
												1,
												.8
											]
										} : {
											scale: 1.1,
											opacity: .5
										},
										transition: isSelected ? {
											repeat: Infinity,
											duration: 1.2,
											ease: "easeInOut"
										} : { duration: .3 },
										className: `leo-halo absolute inset-0 rounded-full blur-md ${isSelected ? "bg-amber-400 scale-125" : "bg-amber-200/50 scale-110"}`
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `relative z-10 h-24 w-24 sm:h-32 sm:w-32 overflow-hidden rounded-full border-4 ${isSelected ? "border-amber-300 shadow-[0_0_35px_rgba(251,191,36,0.9)] ring-4 ring-amber-400/50" : "border-white shadow-xl"} transition-all duration-300 ${profile.background}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: profile.image,
											alt: profile.name,
											className: "h-full w-full object-cover"
										})
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `profile-name-text text-2xl sm:text-3xl font-black uppercase transition-transform ${profile.nameColor}`,
									children: profile.name
								})]
							}, profile.id);
						}),
						customProfiles.map((profile, idx) => {
							const photoUrl = profile.avatarUrl || profile.image;
							const isSelected = selectingId === profile.id;
							const isOtherSelected = selectingId !== null && !isSelected;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
								initial: {
									opacity: 0,
									scale: .82,
									y: 20
								},
								animate: isSelected ? {
									opacity: 1,
									scale: 1.18,
									y: -10
								} : isOtherSelected ? {
									opacity: .15,
									scale: .8,
									y: 10
								} : {
									opacity: 1,
									scale: 1,
									y: 0
								},
								transition: isSelected ? {
									type: "spring",
									stiffness: 320,
									damping: 22
								} : {
									duration: .3,
									ease: "easeInOut",
									delay: (profiles.length + idx) * .06
								},
								whileHover: selectingId === null ? {
									scale: 1.1,
									rotate: -2
								} : void 0,
								whileTap: selectingId === null ? { scale: .92 } : void 0,
								type: "button",
								className: "group flex flex-col items-center gap-3 relative cursor-pointer",
								onClick: (e) => handleProfileClick(profile.name, profile.emoji, profile.color, profile.id, photoUrl, e),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
										animate: {
											scale: [
												1,
												1.3,
												1.18
											],
											opacity: [
												.6,
												1,
												.8
											]
										},
										transition: {
											repeat: Infinity,
											duration: 1.2,
											ease: "easeInOut"
										},
										className: "absolute inset-0 rounded-full blur-md bg-purple-400 scale-125"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `relative z-10 grid h-24 w-24 sm:h-32 sm:w-32 place-items-center overflow-hidden rounded-full border-4 ${isSelected ? "border-amber-300 shadow-[0_0_35px_rgba(251,191,36,0.9)] ring-4 ring-amber-400/50" : "border-white shadow-xl"} transition-all duration-300`,
										style: { backgroundColor: profile.color },
										children: photoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: photoUrl,
											alt: profile.name,
											className: "h-full w-full object-cover"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-4xl sm:text-6xl",
											children: profile.emoji
										})
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "profile-name-text max-w-28 sm:max-w-32 truncate text-xl sm:text-2xl font-black uppercase",
									style: { color: profile.color },
									children: profile.name
								})]
							}, profile.id);
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
							initial: {
								opacity: 0,
								scale: .82,
								y: 20
							},
							animate: selectingId !== null ? {
								opacity: .15,
								scale: .8,
								y: 10
							} : {
								opacity: 1,
								scale: 1,
								y: 0
							},
							transition: {
								duration: .3,
								ease: "easeInOut",
								delay: (profiles.length + customProfiles.length) * .06
							},
							whileHover: selectingId === null ? { scale: 1.08 } : void 0,
							whileTap: selectingId === null ? { scale: .92 } : void 0,
							type: "button",
							className: "group flex flex-col items-center gap-3 cursor-pointer",
							onClick: () => {
								if (selectingId !== null) return;
								playPopSound();
								onAddProfile();
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full border-4 border-white bg-white/40 shadow-lg transition-transform group-hover:scale-105",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
									className: "h-12 w-12 sm:h-16 sm:w-16",
									viewBox: "0 0 100 100",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
										d: "M42 10 L58 10 L58 42 L90 42 L90 58 L58 58 L58 90 L42 90 L42 58 L10 58 L10 42 L42 42 Z",
										fill: "#66bb6a",
										stroke: "#1e293b",
										strokeLinejoin: "round",
										strokeWidth: "4"
									})
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "profile-name-text whitespace-nowrap text-center text-xl font-black uppercase text-[#66bb6a]",
								children: "Add Profile"
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNavigation, {})
		]
	});
}
function BottomNavigation() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		className: "relative z-20 flex w-full items-center justify-between rounded-t-3xl bg-white px-8 pb-8 pt-3 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationItem, {
				label: "Home",
				color: "text-[#8ecae6]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
					className: "h-8 w-8",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2.5",
					viewBox: "0 0 24 24",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3 12l2-2 7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationItem, {
				label: "Search",
				color: "text-[#f28482]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
					className: "h-8 w-8",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2.5",
					viewBox: "0 0 24 24",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
						strokeLinecap: "round",
						strokeLinejoin: "round"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationItem, {
				label: "Library",
				color: "text-[#84a59d]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-0.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-7 w-2 -rotate-[10deg] rounded-sm bg-current" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-7 w-2 rounded-sm bg-current" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-7 w-2 rotate-[10deg] rounded-sm bg-current" })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationItem, {
				label: "Profile",
				color: "text-[#ffa62b]",
				active: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
					className: "h-7 w-7",
					fill: "currentColor",
					viewBox: "0 0 24 24",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						fillRule: "evenodd",
						clipRule: "evenodd",
						d: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H5z"
					})
				})
			})
		]
	});
}
function NavigationItem({ label, color, active = false, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: "flex flex-col items-center gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `${color} ${active ? "rounded-full ring-4 ring-[#ffa62b]/20" : ""}`,
			children
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `text-xs font-bold uppercase ${active ? "text-[#ffa62b]" : "text-[#9a9a9a]"}`,
			children: label
		})]
	});
}
function AdminDashboard({ token, adminName, onLogout }) {
	const [parents, setParents] = (0, import_react.useState)([]);
	const [children, setChildren] = (0, import_react.useState)([]);
	const [tab, setTab] = (0, import_react.useState)("parents");
	const [search, setSearch] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)("");
	const loadData = async () => {
		setLoading(true);
		setError("");
		try {
			const [parentRows, childRows] = await Promise.all([getAdminParents(token), getAdminChildren(token)]);
			setParents(parentRows);
			setChildren(childRows);
		} catch (loadError) {
			setError(loadError instanceof Error ? loadError.message : "Unable to load administrator data.");
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		loadData();
	}, [token]);
	const normalizedSearch = search.trim().toLowerCase();
	const filteredParents = (0, import_react.useMemo)(() => {
		if (!normalizedSearch) return parents;
		return parents.filter((parent) => [
			parent.display_name,
			parent.email,
			parent.role
		].some((value) => String(value || "").toLowerCase().includes(normalizedSearch)));
	}, [parents, normalizedSearch]);
	const filteredChildren = (0, import_react.useMemo)(() => {
		if (!normalizedSearch) return children;
		return children.filter((child) => [
			child.display_name,
			child.login_name,
			child.parent_name,
			child.parent_email
		].some((value) => String(value || "").toLowerCase().includes(normalizedSearch)));
	}, [children, normalizedSearch]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "admin-dashboard",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "admin-dashboard-header",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Connected administrator" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: adminName })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "admin-sign-out",
				onClick: onLogout,
				children: "Sign Out"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "admin-dashboard-content",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "admin-dashboard-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "admin-badge",
							children: "SASA Admin"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Family Accounts" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "View every parent and child stored in the SARA Tube database." })
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "admin-refresh",
						onClick: loadData,
						disabled: loading,
						children: loading ? "Loading..." : "Refresh"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "admin-summary-grid",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total parents" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: parents.length })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total children" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: children.length })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Administrators" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: parents.filter((parent) => parent.role === "admin").length })] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "admin-toolbar",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "admin-tabs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: tab === "parents" ? "active" : "",
							onClick: () => setTab("parents"),
							children: "Parents"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: tab === "children" ? "active" : "",
							onClick: () => setTab("children"),
							children: "Children"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "search",
						value: search,
						onChange: (event) => setSearch(event.target.value),
						placeholder: tab === "parents" ? "Search parents..." : "Search children..."
					})]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "admin-error",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Unable to load data" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: error }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: loadData,
							children: "Try Again"
						})
					]
				}),
				!error && loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "admin-loading",
					children: "Loading administrator data..."
				}),
				!error && !loading && tab === "parents" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "admin-table-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Parent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Email" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Role" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Children" })
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [filteredParents.map((parent) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "admin-person",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: parent.display_name.slice(0, 1).toUpperCase() }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: parent.display_name })]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: parent.email }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: parent.role === "admin" ? "admin-role admin-role-admin" : "admin-role",
							children: parent.role
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: parent.child_count })
					] }, `admin-parent-${parent.id}`)), filteredParents.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 4,
						className: "admin-empty",
						children: "No matching parent accounts."
					}) })] })] })
				}),
				!error && !loading && tab === "children" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "admin-table-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Child" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Age" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Login name" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Parent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Parent email" })
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [filteredChildren.map((child) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "admin-person",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⭐" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: child.display_name })]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: child.age ?? "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: child.login_name || "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: child.parent_name || "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: child.parent_email || "—" })
					] }, `admin-child-${child.id}`)), filteredChildren.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 5,
						className: "admin-empty",
						children: "No matching child profiles."
					}) })] })] })
				})
			]
		})]
	});
}
function FreeAccountBanner({ onCreateAccount, className = "" }) {
	const [dismissed, setDismissed] = (0, import_react.useState)(false);
	if (dismissed) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: {
			opacity: 0,
			y: -16
		},
		animate: {
			opacity: 1,
			y: 0
		},
		exit: {
			opacity: 0,
			y: -16
		},
		className: `w-full bg-gradient-to-r from-amber-50 via-sky-50 to-indigo-50 border-b border-sky-200/80 px-3.5 py-2.5 sm:px-6 relative shadow-sm z-40 ${className}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-7xl mx-auto flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2.5 sm:gap-3 min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-2 bg-amber-400 text-amber-950 rounded-2xl shadow-sm shrink-0 flex items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
						size: 18,
						className: "stroke-[2.5]"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-extrabold text-xs sm:text-sm text-slate-800 tracking-tight",
							children: "Free Guest Account"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300 text-[10px] font-black tracking-wider uppercase",
							children: "FREE"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] sm:text-xs text-slate-600 font-medium truncate sm:whitespace-normal",
						children: "Create a free account to save custom profiles, time limits, & watch history!"
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						playSuccessSound();
						onCreateAccount();
					},
					className: "px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-black shadow-md hover:shadow-sky-500/20 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { size: 14 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden xs:inline sm:inline",
							children: "Create Free Account"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "xs:hidden sm:hidden",
							children: "Sign Up"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
							size: 13,
							className: "opacity-80"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						playPopSound();
						setDismissed(true);
					},
					className: "p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer",
					"aria-label": "Dismiss banner",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
				})]
			})]
		})
	}) });
}
function getAccountRoleFromToken(token) {
	if (!token) return "parent";
	try {
		const parts = token.split(".");
		if (parts.length !== 3) return "parent";
		const normalizedPayload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
		const paddedPayload = normalizedPayload + "=".repeat((4 - normalizedPayload.length % 4) % 4);
		return JSON.parse(window.atob(paddedPayload)).role === "admin" ? "admin" : "parent";
	} catch {
		return "parent";
	}
}
function SasaApp() {
	const [parentToken, setParentToken] = (0, import_react.useState)(() => typeof localStorage !== "undefined" ? localStorage.getItem("sasa-parent-token") : null);
	const [guestMode, setGuestMode] = (0, import_react.useState)(() => typeof localStorage !== "undefined" ? localStorage.getItem("sasa-account-mode") === "guest" : false);
	const [parentName, setParentName] = (0, import_react.useState)(() => typeof localStorage !== "undefined" ? localStorage.getItem("sasa-parent-name") || "Parent" : "Parent");
	const [databaseChildren, setDatabaseChildren] = (0, import_react.useState)([]);
	const [databaseChildrenLoading, setDatabaseChildrenLoading] = (0, import_react.useState)(false);
	const [databaseChildrenError, setDatabaseChildrenError] = (0, import_react.useState)("");
	const loadDatabaseChildren = async (token) => {
		setDatabaseChildrenLoading(true);
		setDatabaseChildrenError("");
		try {
			setDatabaseChildren(await getChildren(token));
		} catch (error) {
			setDatabaseChildrenError(error instanceof Error ? error.message : "Unable to load child profiles.");
		} finally {
			setDatabaseChildrenLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		if (parentToken) loadDatabaseChildren(parentToken);
	}, [parentToken]);
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [selectedKidsVideo, setSelectedKidsVideo] = (0, import_react.useState)(null);
	const [homeTab, setHomeTab] = (0, import_react.useState)("home");
	const [showAddProfile, setShowAddProfile] = (0, import_react.useState)(false);
	const [showParentGate, setShowParentGate] = (0, import_react.useState)(false);
	const [showParentDashboard, setShowParentDashboard] = (0, import_react.useState)(false);
	const [bedtimeActive, setBedtimeActive] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		getApiHealth().then((r) => console.log("API connected:", r.service)).catch((e) => console.log("API unavailable:", e.message));
	}, []);
	const [customProfiles, setCustomProfiles] = (0, import_react.useState)(() => {
		try {
			const saved = typeof localStorage !== "undefined" ? localStorage.getItem("sasa-custom-profiles") : null;
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	});
	const [parentControls, setParentControls] = (0, import_react.useState)(() => {
		try {
			const saved = typeof localStorage !== "undefined" ? localStorage.getItem("sasa-parent-controls") : null;
			if (!saved) return defaultParentControlSettings;
			return {
				...defaultParentControlSettings,
				...JSON.parse(saved)
			};
		} catch {
			return defaultParentControlSettings;
		}
	});
	const updateParentControls = (settings) => {
		if (profile) {
			const expiryKey = `sasa-screen-expiry-${profile.id}`;
			const limitWasChanged = settings.screenMinutes !== parentControls.screenMinutes || settings.screenLimitEnabled !== parentControls.screenLimitEnabled;
			const parentUnlockedDevice = parentControls.deviceLocked && !settings.deviceLocked;
			if (!settings.screenLimitEnabled) localStorage.removeItem(expiryKey);
			else if (limitWasChanged || parentUnlockedDevice || !localStorage.getItem(expiryKey)) localStorage.setItem(expiryKey, String(Date.now() + settings.screenMinutes * 60 * 1e3));
		}
		setParentControls(settings);
		localStorage.setItem("sasa-parent-controls", JSON.stringify(settings));
	};
	(0, import_react.useEffect)(() => {
		if (!profile || !parentControls.screenLimitEnabled || parentControls.deviceLocked) return;
		const expiryKey = `sasa-screen-expiry-${profile.id}`;
		const createExpiry = () => {
			const t = Date.now() + parentControls.screenMinutes * 60 * 1e3;
			localStorage.setItem(expiryKey, String(t));
			return t;
		};
		if (!localStorage.getItem(expiryKey)) createExpiry();
		const checkScreenTime = () => {
			let expiryTime = Number(localStorage.getItem(expiryKey));
			if (!expiryTime || Number.isNaN(expiryTime)) expiryTime = createExpiry();
			if (Date.now() >= expiryTime) {
				const locked = {
					...parentControls,
					deviceLocked: true
				};
				setParentControls(locked);
				localStorage.setItem("sasa-parent-controls", JSON.stringify(locked));
			}
		};
		checkScreenTime();
		const interval = window.setInterval(checkScreenTime, 1e3);
		return () => window.clearInterval(interval);
	}, [
		profile,
		parentControls.screenLimitEnabled,
		parentControls.screenMinutes,
		parentControls.deviceLocked
	]);
	(0, import_react.useEffect)(() => {
		const timeToMinutes = (v) => {
			const [h, m] = v.split(":").map(Number);
			return h * 60 + m;
		};
		const checkBedtime = () => {
			if (!parentControls.bedtimeEnabled) {
				setBedtimeActive(false);
				return;
			}
			const now = /* @__PURE__ */ new Date();
			const current = now.getHours() * 60 + now.getMinutes();
			const start = timeToMinutes(parentControls.bedtimeStart || "20:00");
			const end = timeToMinutes(parentControls.bedtimeEnd || "07:00");
			let active = false;
			if (start === end) active = true;
			else if (start < end) active = current >= start && current < end;
			else active = current >= start || current < end;
			setBedtimeActive(active);
		};
		checkBedtime();
		const interval = window.setInterval(checkBedtime, 1e3);
		return () => window.clearInterval(interval);
	}, [
		parentControls.bedtimeEnabled,
		parentControls.bedtimeStart,
		parentControls.bedtimeEnd
	]);
	const openParentGate = () => {
		setShowParentDashboard(false);
		setShowParentGate(true);
	};
	const changeProfile = () => {
		setSelectedKidsVideo(null);
		setProfile(null);
	};
	const openKidsVideo = (video) => {
		if (profile) {
			const historyKey = "sasa-watch-history";
			try {
				const saved = localStorage.getItem(historyKey);
				const existing = Array.isArray(saved ? JSON.parse(saved) : []) ? saved ? JSON.parse(saved) : [] : [];
				const entry = {
					historyId: `${Date.now()}-${profile.id}-${video.id}`,
					profileId: profile.id,
					profileName: profile.name,
					videoId: video.id,
					title: video.title,
					image: video.image,
					category: video.category,
					duration: video.duration,
					watchedAt: (/* @__PURE__ */ new Date()).toISOString()
				};
				localStorage.setItem(historyKey, JSON.stringify([entry, ...existing].slice(0, 300)));
			} catch {
				localStorage.setItem(historyKey, JSON.stringify([{
					historyId: `${Date.now()}-${profile.id}-${video.id}`,
					profileId: profile.id,
					profileName: profile.name,
					videoId: video.id,
					title: video.title,
					image: video.image,
					category: video.category,
					duration: video.duration,
					watchedAt: (/* @__PURE__ */ new Date()).toISOString()
				}]));
			}
		}
		setSelectedKidsVideo(video);
	};
	if (!parentToken && !guestMode) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParentLogin, {
		onSuccess: (token, name) => {
			localStorage.removeItem("sasa-account-mode");
			setGuestMode(false);
			setParentToken(token);
			setParentName(name);
		},
		onGuest: () => {
			localStorage.setItem("sasa-account-mode", "guest");
			setGuestMode(true);
			setProfile(null);
			setSelectedKidsVideo(null);
		}
	});
	if (showParentDashboard) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParentDashboard, {
		settings: parentControls,
		profileId: profile?.id ?? null,
		profileName: profile?.name ?? "Child",
		customProfiles,
		onDeleteCustomProfile: (profileId) => {
			if (customProfiles.find((c) => c.id === profileId)?.isProtected) {
				window.alert("Unprotect this profile before deleting it.");
				return;
			}
			const updated = customProfiles.filter((c) => c.id !== profileId);
			setCustomProfiles(updated);
			localStorage.setItem("sasa-custom-profiles", JSON.stringify(updated));
			localStorage.removeItem(`sasa-screen-expiry-${profileId}`);
			const savedHistory = localStorage.getItem("sasa-watch-history");
			if (savedHistory) try {
				const parsed = JSON.parse(savedHistory);
				const remaining = Array.isArray(parsed) ? parsed.filter((item) => Number(item.profileId) !== Number(profileId)) : [];
				localStorage.setItem("sasa-watch-history", JSON.stringify(remaining));
			} catch {}
			if (profile?.id === profileId) {
				setProfile(null);
				setSelectedKidsVideo(null);
			}
		},
		onUpdateCustomProfile: (updatedProfile) => {
			const updated = customProfiles.map((c) => c.id === updatedProfile.id ? {
				...c,
				...updatedProfile
			} : c);
			setCustomProfiles(updated);
			localStorage.setItem("sasa-custom-profiles", JSON.stringify(updated));
			if (profile?.id === updatedProfile.id) setProfile({
				id: updatedProfile.id,
				name: updatedProfile.name,
				emoji: updatedProfile.emoji,
				color: updatedProfile.color
			});
		},
		onToggleProfileProtection: (profileId) => {
			const updated = customProfiles.map((c) => c.id === profileId ? {
				...c,
				isProtected: !c.isProtected
			} : c);
			setCustomProfiles(updated);
			localStorage.setItem("sasa-custom-profiles", JSON.stringify(updated));
		},
		onSettingsChange: updateParentControls,
		onClose: () => {
			setShowParentDashboard(false);
			setShowParentGate(false);
		}
	});
	if (showParentGate) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParentalGate, {
		parentPin: parentControls.parentPin,
		requireParentPin: parentControls.requireParentPin,
		onSuccess: () => {
			setShowParentGate(false);
			setShowParentDashboard(true);
		},
		onCancel: () => setShowParentGate(false)
	});
	if ((parentControls.deviceLocked || bedtimeActive) && profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeviceLocked, {
		onParentUnlock: openParentGate,
		onChangeProfile: changeProfile
	});
	if (!profile && showAddProfile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddProfile, {
		onClose: () => setShowAddProfile(false),
		onCreate: (createdProfile) => {
			const updated = [...customProfiles, createdProfile];
			setCustomProfiles(updated);
			localStorage.setItem("sasa-custom-profiles", JSON.stringify(updated));
			setShowAddProfile(false);
		}
	});
	if (parentToken && getAccountRoleFromToken(parentToken) === "admin") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminDashboard, {
		token: parentToken,
		adminName: parentName,
		onLogout: () => {
			localStorage.removeItem("sasa-parent-token");
			localStorage.removeItem("sasa-parent-name");
			localStorage.removeItem("sasa-parent-role");
			setParentToken(null);
			setParentName("Parent");
			setDatabaseChildren([]);
			setProfile(null);
		}
	});
	if (!profile && parentToken) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DatabaseProfileSelection, {
		children: databaseChildren,
		loading: databaseChildrenLoading,
		error: databaseChildrenError,
		parentName,
		onRetry: () => loadDatabaseChildren(parentToken),
		onLogout: () => {
			localStorage.removeItem("sasa-parent-token");
			localStorage.removeItem("sasa-parent-name");
			setParentToken(null);
			setParentName("Parent");
			setDatabaseChildren([]);
			setProfile(null);
		},
		onSelectChild: (child) => {
			setProfile({
				id: child.id,
				name: child.display_name,
				emoji: getDatabaseProfileEmoji(child.id),
				color: getDatabaseProfileColor(child.id)
			});
			setSelectedKidsVideo(null);
		}
	});
	if (!profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [guestMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreeAccountBanner, { onCreateAccount: () => {
		localStorage.removeItem("sasa-account-mode");
		setGuestMode(false);
		setProfile(null);
		setSelectedKidsVideo(null);
	} }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileSelection, {
		customProfiles,
		onSelectProfile: (name, emoji, color, id, image) => {
			setProfile({
				id,
				name,
				emoji,
				color,
				image
			});
			if (image) localStorage.setItem("sasa-active-kid-image", image);
			else localStorage.removeItem("sasa-active-kid-image");
			localStorage.setItem("sasa-active-kid-emoji", emoji);
			localStorage.setItem("sasa-active-kid-name", name);
			if (parentControls.screenLimitEnabled) localStorage.setItem(`sasa-screen-expiry-${id}`, String(Date.now() + parentControls.screenMinutes * 60 * 1e3));
			setSelectedKidsVideo(null);
		},
		onOpenParentalControls: openParentGate,
		onAddProfile: () => setShowAddProfile(true)
	})] });
	if (selectedKidsVideo) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KidsVideoPlayer, {
		video: selectedKidsVideo,
		profileName: profile?.name,
		profileEmoji: profile?.emoji,
		customProfiles,
		onBack: () => {
			setHomeTab("home");
			setSelectedKidsVideo(null);
		},
		onOpenVideo: openKidsVideo,
		onOpenHomeTab: (tab) => {
			setHomeTab(tab);
			setSelectedKidsVideo(null);
		},
		onChangeProfile: changeProfile
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen flex flex-col",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KidsVideoHome, {
			profileName: profile.name,
			profileEmoji: profile.emoji,
			profileImage: profile.image,
			activeTab: homeTab,
			onTabChange: setHomeTab,
			onOpenVideo: openKidsVideo,
			onOpenParentalControls: openParentGate,
			onChangeProfile: changeProfile,
			onOpenFreeAccount: guestMode ? () => {
				localStorage.removeItem("sasa-account-mode");
				setGuestMode(false);
				setProfile(null);
				setSelectedKidsVideo(null);
			} : void 0
		})
	});
}
//#endregion
export { SasaApp as component };
