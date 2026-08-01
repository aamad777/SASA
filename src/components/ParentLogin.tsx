import { useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";

import { loginParent, registerParent } from "../lib/api";

type ParentLoginProps = {
  onSuccess: (token: string, parentName: string) => void;
  onGuest: () => void;
};

const flowerImages = [
  {
    alt: "Orange flower",
    src: "/welcome-assets/orange-flower.png",
  },
  {
    alt: "Pink flower",
    src: "/welcome-assets/pink-flower.png",
  },
  {
    alt: "Yellow flower",
    src: "/welcome-assets/yellow-flower.png",
  },
  {
    alt: "Red flower",
    src: "/welcome-assets/red-flower.png",
  },
];

const penguinImage = "/welcome-assets/penguin.png";

export default function ParentLogin({ onSuccess, onGuest }: ParentLoginProps) {
  const [screen, setScreen] = useState<"welcome" | "auth">("auth");

  const [mode, setMode] = useState<"login" | "register">("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const openAuth = (nextMode: "login" | "register") => {
    setMode(nextMode);
    setError("");
    setScreen("auth");
  };

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
      const result =
        mode === "register"
          ? await registerParent(cleanName, cleanEmail, password)
          : await loginParent(cleanEmail, password);

      localStorage.setItem("sasa-parent-token", result.token);

      const safeParentName =
        result.user.display_name?.trim() || cleanName || cleanEmail.split("@")[0] || "Parent";

      localStorage.setItem("sasa-parent-name", safeParentName);

      onSuccess(result.token, safeParentName);
      window.location.replace("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : mode === "register"
            ? "Parent registration failed."
            : "Parent login failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (screen === "welcome") {
    return (
      <main className="sasa-welcome-page">
        <div className="sasa-welcome-water-line" />

        <div className="sasa-welcome-star sasa-star-one">★</div>

        <div className="sasa-welcome-star sasa-star-two">★</div>

        <div className="sasa-beach-ball">
          <div />
        </div>

        <section className="sasa-welcome-content">
          <div className="sasa-flower-grid">
            {flowerImages.map((flower) => (
              <img key={flower.alt} src={flower.src} alt={flower.alt} draggable={false} />
            ))}
          </div>

          <div className="sasa-penguin-area">
            <div className="sasa-penguin-shadow" />

            <img
              src={penguinImage}
              alt="Cool penguin wearing sunglasses and a flower necklace"
              className="sasa-penguin-image"
              draggable={false}
            />
          </div>

          <div className="sasa-entry-actions">
            <button type="button" className="sasa-entry-button sasa-entry-green" onClick={onGuest}>
              Continue as Guest
            </button>

            <div className="sasa-entry-button-wrap">
              <span className="sasa-button-star star-left">★</span>

              <span className="sasa-button-star star-right">★</span>

              <button
                type="button"
                className="sasa-entry-button sasa-entry-blue"
                onClick={() => openAuth("login")}
              >
                Login
              </button>
            </div>

            <div className="sasa-entry-button-wrap">
              <span className="sasa-button-star register-star-one">★</span>

              <span className="sasa-button-star register-star-two">★</span>

              <button
                type="button"
                className="sasa-entry-button sasa-entry-orange"
                onClick={() => openAuth("register")}
              >
                Register for Free
              </button>
            </div>
          </div>
        </section>

        <style>{`
          .sasa-welcome-page {
            position: relative;
            width: 100%;
            min-height: 100dvh;
            overflow: hidden;
            font-family: Nunito, ui-rounded, system-ui, sans-serif;
            background:
              linear-gradient(
                to bottom,
                #a6e7ff 0%,
                #a6e7ff 40%,
                #8fd6ef 40%,
                #8fd6ef 45%,
                #ffe99b 45%,
                #ffe99b 100%
              );
          }

          .sasa-welcome-content {
            position: relative;
            z-index: 5;
            min-height: 100dvh;
            width: min(100%, 720px);
            margin: 0 auto;
            padding: 24px 22px 34px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .sasa-welcome-water-line {
            position: absolute;
            z-index: 1;
            left: 0;
            right: 0;
            top: 40%;
            height: 5%;
            border-top: 2px solid rgba(255,255,255,.9);
            background:
              linear-gradient(
                180deg,
                rgba(255,255,255,.45),
                rgba(255,255,255,0)
              );
          }

          .sasa-flower-grid {
            width: min(62vw, 320px);
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px 30px;
          }

          .sasa-flower-grid img {
            display: block;
            width: 100%;
            max-width: 135px;
            aspect-ratio: 1;
            object-fit: contain;
            user-select: none;
          }

          .sasa-penguin-area {
            position: relative;
            z-index: 6;
            width: min(72vw, 355px);
            margin-top: -14px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            background: transparent;
          }

          .sasa-penguin-image {
            position: relative;
            z-index: 2;
            display: block;
            width: 100%;
            height: auto;
            object-fit: contain;
            background: transparent;
            border: 0;
            box-shadow: none;
            user-select: none;
            animation:
              sasaPenguinFloat 3.5s ease-in-out infinite;
          }

          .sasa-penguin-shadow {
            position: absolute;
            z-index: 1;
            width: 52%;
            height: 22px;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 999px;
            background: rgba(0,0,0,.15);
            filter: blur(8px);
          }

          .sasa-entry-actions {
            width: min(88vw, 560px);
            margin-top: auto;
            display: flex;
            flex-direction: column;
            gap: 18px;
          }

          .sasa-entry-button-wrap {
            position: relative;
            width: 100%;
          }

          .sasa-entry-button {
            position: relative;
            width: 100%;
            min-height: 80px;
            overflow: hidden;
            border-radius: 999px;
            border: 4px solid rgba(0,0,0,.13);
            color: white;
            font-size: clamp(1.55rem, 5vw, 2.25rem);
            font-weight: 1000;
            letter-spacing: .03em;
            text-shadow:
              0 3px 2px rgba(0,0,0,.15);
            cursor: pointer;
            transition:
              transform .14s ease,
              filter .14s ease;
            box-shadow:
              0 10px 0 rgba(0,0,0,.12),
              0 15px 25px rgba(0,0,0,.15),
              inset 0 5px 7px rgba(255,255,255,.55),
              inset 0 -7px 10px rgba(0,0,0,.12);
          }

          .sasa-entry-button::before {
            content: '';
            position: absolute;
            inset: 0 0 48% 0;
            border-radius: inherit;
            background:
              linear-gradient(
                to bottom,
                rgba(255,255,255,.5),
                rgba(255,255,255,0)
              );
            pointer-events: none;
          }

          .sasa-entry-button:hover {
            filter: brightness(1.05);
            transform: translateY(-2px);
          }

          .sasa-entry-button:active {
            transform: translateY(5px) scale(.985);
            box-shadow:
              0 5px 0 rgba(0,0,0,.12),
              0 8px 15px rgba(0,0,0,.13),
              inset 0 5px 7px rgba(255,255,255,.45),
              inset 0 -6px 9px rgba(0,0,0,.12);
          }

          .sasa-entry-green {
            background:
              linear-gradient(
                to bottom,
                #9de254,
                #72c82f
              );
          }

          .sasa-entry-blue {
            background:
              linear-gradient(
                to bottom,
                #7bbaf2,
                #428bd7
              );
          }

          .sasa-entry-orange {
            background:
              linear-gradient(
                to bottom,
                #ffb15a,
                #f58616
              );
            box-shadow:
              0 10px 0 rgba(179,89,0,.22),
              0 0 28px rgba(247,148,30,.65),
              inset 0 5px 7px rgba(255,255,255,.55),
              inset 0 -7px 10px rgba(0,0,0,.12);
          }

          .sasa-button-star {
            position: absolute;
            z-index: 10;
            color: #ffe548;
            text-shadow:
              0 2px 2px rgba(173,113,0,.25);
            pointer-events: none;
          }

          .star-left {
            left: 8%;
            top: -14px;
            font-size: 24px;
          }

          .star-right {
            right: 9%;
            bottom: -12px;
            font-size: 20px;
          }

          .register-star-one {
            right: 8%;
            top: -19px;
            font-size: 28px;
            animation:
              sasaStarPulse 1.6s ease-in-out infinite;
          }

          .register-star-two {
            left: 4%;
            bottom: -15px;
            font-size: 23px;
            animation:
              sasaStarBounce 1.8s ease-in-out infinite;
          }

          .sasa-beach-ball {
            position: absolute;
            z-index: 2;
            left: -72px;
            bottom: -82px;
            width: 230px;
            height: 230px;
            transform: rotate(15deg);
            opacity: .95;
          }

          .sasa-beach-ball div {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 5px solid rgba(0,0,0,.12);
            background:
              conic-gradient(
                #ee2929 0 25%,
                #fff21e 25% 50%,
                #2d37e7 50% 75%,
                #1ca537 75% 100%
              );
          }

          .sasa-welcome-star {
            position: absolute;
            z-index: 3;
            color: #f9df36;
            opacity: .72;
          }

          .sasa-star-one {
            left: 6%;
            top: 43%;
            font-size: 35px;
          }

          .sasa-star-two {
            right: 7%;
            top: 47%;
            font-size: 27px;
          }

          @keyframes sasaPenguinFloat {
            0%, 100% {
              transform: translateY(0) rotate(-1deg);
            }
            50% {
              transform: translateY(-8px) rotate(1deg);
            }
          }

          @keyframes sasaStarPulse {
            0%, 100% {
              transform: scale(1);
              opacity: .8;
            }
            50% {
              transform: scale(1.25);
              opacity: 1;
            }
          }

          @keyframes sasaStarBounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-8px);
            }
          }

          @media (max-height: 820px) {
            .sasa-welcome-content {
              padding-top: 12px;
              padding-bottom: 22px;
            }

            .sasa-flower-grid {
              width: min(48vw, 230px);
            }

            .sasa-penguin-area {
              width: min(54vw, 270px);
              margin-top: -20px;
            }

            .sasa-entry-actions {
              gap: 12px;
            }

            .sasa-entry-button {
              min-height: 64px;
              font-size: clamp(1.3rem, 4vw, 1.8rem);
            }
          }

          @media (max-width: 768px) {
            .sasa-welcome-page {
              min-height: 100svh;
              overflow-y: auto;
              background:
                linear-gradient(
                  to bottom,
                  #a6e7ff 0%,
                  #a6e7ff 34%,
                  #8fd6ef 34%,
                  #8fd6ef 39%,
                  #ffe99b 39%,
                  #ffe99b 100%
                );
            }

            .sasa-welcome-water-line {
              top: 34%;
              height: 5%;
            }

            .sasa-welcome-content {
              min-height: 100svh;
              width: 100%;
              padding:
                max(12px, env(safe-area-inset-top))
                16px
                max(22px, env(safe-area-inset-bottom));
            }

            .sasa-flower-grid {
              width: min(56vw, 220px);
              gap: 2px 14px;
            }

            .sasa-flower-grid img {
              max-width: 94px;
            }

            .sasa-penguin-area {
              width: min(64vw, 265px);
              margin-top: -18px;
            }

            .sasa-penguin-shadow {
              height: 15px;
              bottom: 7px;
            }

            .sasa-entry-actions {
              width: min(100%, 390px);
              margin-top: auto;
              gap: 12px;
              padding: 8px 4px 0;
            }

            .sasa-entry-button {
              min-height: 58px;
              border-width: 3px;
              font-size: clamp(1.12rem, 5.6vw, 1.45rem);
              box-shadow:
                0 7px 0 rgba(0,0,0,.12),
                0 10px 18px rgba(0,0,0,.14),
                inset 0 4px 6px rgba(255,255,255,.5),
                inset 0 -5px 8px rgba(0,0,0,.1);
              touch-action: manipulation;
            }

            .sasa-entry-button:hover {
              transform: none;
            }

            .sasa-entry-button:active {
              transform: translateY(3px) scale(.985);
            }

            .sasa-beach-ball {
              left: -48px;
              bottom: -52px;
              width: 145px;
              height: 145px;
            }

            .sasa-star-one {
              left: 4%;
              top: 38%;
              font-size: 25px;
            }

            .sasa-star-two {
              right: 5%;
              top: 41%;
              font-size: 21px;
            }

            .star-left {
              top: -10px;
              font-size: 19px;
            }

            .star-right {
              bottom: -9px;
              font-size: 17px;
            }

            .register-star-one {
              top: -13px;
              font-size: 21px;
            }

            .register-star-two {
              bottom: -10px;
              font-size: 18px;
            }
          }

          @media (max-width: 380px) {
            .sasa-flower-grid {
              width: 180px;
            }

            .sasa-penguin-area {
              width: 220px;
            }

            .sasa-entry-button {
              min-height: 54px;
              font-size: 1.08rem;
            }
          }


          @media (min-width: 900px) {
            .sasa-welcome-content {
              width: min(100%, 850px);
              padding-top: 28px;
            }

            .sasa-flower-grid {
              width: 300px;
            }

            .sasa-penguin-area {
              width: 360px;
            }

            .sasa-entry-actions {
              width: 520px;
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100 flex items-center justify-center px-4 py-8">
      <section className="relative bg-white rounded-[2rem] shadow-2xl border border-white/80 p-5 sm:p-7 max-w-md w-full">
        <button
          type="button"
          onClick={() => {
            window.location.assign("/");
          }}
          className="absolute left-4 top-4 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
          aria-label="Back to welcome screen"
        >
          <ArrowLeft size={21} />
        </button>

        <div className="text-center pt-5">
          <div className="mx-auto bg-purple-100 text-purple-700 p-3 rounded-full inline-flex">
            {mode === "register" ? <UserPlus size={34} /> : <ShieldCheck size={34} />}
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl my-5 w-full border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
                mode === "login" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500"
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-1 ${
                mode === "register" ? "bg-purple-600 text-white shadow-sm" : "text-slate-500"
              }`}
            >
              <UserPlus size={14} />
              Register
            </button>
          </div>

          <h1 className="text-2xl font-black text-slate-800">
            {mode === "register" ? "Register Parent Account" : "Parent Login"}
          </h1>

          <p className="text-sm text-slate-500 mt-1 mb-5">
            {mode === "register"
              ? "Create an account to manage child profiles and media."
              : "Sign in using your parent account."}
          </p>
        </div>

        <div className="space-y-4">
          {mode === "register" && (
            <label className="block">
              <span className="text-sm font-black text-slate-700">Parent Name</span>

              <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-slate-300 px-3 focus-within:ring-2 focus-within:ring-purple-400">
                <User size={19} className="text-slate-400" />

                <input
                  type="text"
                  value={name}
                  autoComplete="name"
                  placeholder="Parent name"
                  onChange={(event) => {
                    setName(event.target.value);
                    setError("");
                  }}
                  className="w-full py-3 outline-none border-0 focus:ring-0"
                />
              </div>
            </label>
          )}

          <label className="block">
            <span className="text-sm font-black text-slate-700">Email address</span>

            <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-slate-300 px-3 focus-within:ring-2 focus-within:ring-purple-400">
              <Mail size={19} className="text-slate-400" />

              <input
                type="email"
                value={email}
                autoComplete="email"
                placeholder="parent@example.com"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                className="w-full py-3 outline-none border-0 focus:ring-0"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-black text-slate-700">Password</span>

            <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-slate-300 px-3 focus-within:ring-2 focus-within:ring-purple-400">
              <LockKeyhole size={19} className="text-slate-400" />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                placeholder="Enter password"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSubmit();
                  }
                }}
                className="w-full py-3 outline-none border-0 focus:ring-0"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="text-slate-500"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </label>

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black py-3.5 shadow-lg"
          >
            {loading
              ? mode === "register"
                ? "Creating Account..."
                : "Signing In..."
              : mode === "register"
                ? "Create Parent Account"
                : "Sign In"}
          </button>
        </div>
      </section>
    </main>
  );
}
