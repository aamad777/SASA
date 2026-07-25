export function AnimatedHero() {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-sky-soft to-peach-soft">
      <svg
        viewBox="0 0 400 260"
        className="w-full h-auto block"
        role="img"
        aria-label="A smiling sun with a bear and bunny playing on a grassy hill"
      >
        {/* Sky clouds */}
        <g className="cloud-drift" opacity="0.85">
          <ellipse cx="70" cy="55" rx="22" ry="10" fill="white" />
          <ellipse cx="88" cy="50" rx="16" ry="8" fill="white" />
        </g>
        <g className="cloud-drift-slow" opacity="0.85">
          <ellipse cx="300" cy="40" rx="26" ry="11" fill="white" />
          <ellipse cx="320" cy="36" rx="16" ry="8" fill="white" />
        </g>

        {/* Sun */}
        <g transform="translate(320 70)">
          <g className="sun-spin">
            {Array.from({ length: 12 }).map((_, i) => (
              <rect
                key={i}
                x="-2"
                y="-46"
                width="4"
                height="14"
                rx="2"
                fill="oklch(0.85 0.15 90)"
                transform={`rotate(${i * 30})`}
              />
            ))}
          </g>
          <g className="sun-pulse">
            <circle r="30" fill="oklch(0.92 0.14 95)" />
            <circle cx="-9" cy="-4" r="2.5" fill="#2b2b3d" />
            <circle cx="9" cy="-4" r="2.5" fill="#2b2b3d" />
            <path
              d="M -9 6 Q 0 14 9 6"
              stroke="#2b2b3d"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="-15" cy="4" r="3" fill="oklch(0.82 0.11 25)" opacity="0.7" />
            <circle cx="15" cy="4" r="3" fill="oklch(0.82 0.11 25)" opacity="0.7" />
          </g>
        </g>

        {/* Ground */}
        <path d="M 0 220 Q 200 190 400 220 L 400 260 L 0 260 Z" fill="oklch(0.9 0.09 150)" />
        <path d="M 0 235 Q 200 210 400 235 L 400 260 L 0 260 Z" fill="oklch(0.85 0.11 150)" />

        {/* Bear */}
        <g className="bear-bob" transform="translate(130 195)">
          {/* Ears */}
          <circle cx="-18" cy="-30" r="8" fill="oklch(0.62 0.08 60)" />
          <circle cx="18" cy="-30" r="8" fill="oklch(0.62 0.08 60)" />
          <circle cx="-18" cy="-30" r="4" fill="oklch(0.78 0.06 60)" />
          <circle cx="18" cy="-30" r="4" fill="oklch(0.78 0.06 60)" />
          {/* Body */}
          <ellipse cx="0" cy="10" rx="26" ry="24" fill="oklch(0.68 0.08 60)" />
          <ellipse cx="0" cy="14" rx="16" ry="14" fill="oklch(0.85 0.05 70)" />
          {/* Head */}
          <circle cx="0" cy="-16" r="22" fill="oklch(0.68 0.08 60)" />
          <ellipse cx="0" cy="-8" rx="12" ry="9" fill="oklch(0.88 0.05 70)" />
          {/* Eyes */}
          <circle cx="-7" cy="-20" r="2.5" fill="#2b2b3d" />
          <circle cx="7" cy="-20" r="2.5" fill="#2b2b3d" />
          {/* Nose */}
          <ellipse cx="0" cy="-11" rx="2.5" ry="2" fill="#2b2b3d" />
          {/* Mouth */}
          <path d="M -4 -6 Q 0 -3 4 -6" stroke="#2b2b3d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Cheeks */}
          <circle cx="-12" cy="-12" r="3" fill="oklch(0.82 0.11 25)" opacity="0.6" />
          <circle cx="12" cy="-12" r="3" fill="oklch(0.82 0.11 25)" opacity="0.6" />
          {/* Arm waving */}
          <g className="bear-wave" style={{ transformOrigin: "22px -4px" }}>
            <ellipse cx="30" cy="-14" rx="6" ry="10" fill="oklch(0.68 0.08 60)" transform="rotate(20 22 -4)" />
          </g>
        </g>

        {/* Bunny */}
        <g className="bunny-hop" transform="translate(240 200)">
          {/* Ears */}
          <ellipse cx="-6" cy="-38" rx="4" ry="14" fill="white" />
          <ellipse cx="6" cy="-38" rx="4" ry="14" fill="white" />
          <ellipse cx="-6" cy="-36" rx="2" ry="10" fill="oklch(0.88 0.06 20)" />
          <ellipse cx="6" cy="-36" rx="2" ry="10" fill="oklch(0.88 0.06 20)" />
          {/* Body */}
          <ellipse cx="0" cy="8" rx="20" ry="20" fill="white" />
          {/* Head */}
          <circle cx="0" cy="-18" r="17" fill="white" />
          {/* Eyes */}
          <circle cx="-6" cy="-20" r="2.2" fill="#2b2b3d" />
          <circle cx="6" cy="-20" r="2.2" fill="#2b2b3d" />
          {/* Nose */}
          <path d="M -2 -13 L 2 -13 L 0 -10 Z" fill="oklch(0.82 0.11 25)" />
          {/* Mouth */}
          <path d="M 0 -10 L 0 -7 M 0 -7 Q -3 -5 -4 -7 M 0 -7 Q 3 -5 4 -7" stroke="#2b2b3d" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          {/* Cheeks */}
          <circle cx="-10" cy="-14" r="2.5" fill="oklch(0.82 0.11 25)" opacity="0.6" />
          <circle cx="10" cy="-14" r="2.5" fill="oklch(0.82 0.11 25)" opacity="0.6" />
          {/* Tail */}
          <circle cx="-18" cy="10" r="5" fill="white" />
          {/* Feet */}
          <ellipse cx="-8" cy="26" rx="7" ry="4" fill="white" />
          <ellipse cx="8" cy="26" rx="7" ry="4" fill="white" />
        </g>

        {/* Flowers */}
        <g className="flower-sway">
          <circle cx="40" cy="225" r="4" fill="oklch(0.82 0.11 25)" />
          <circle cx="40" cy="225" r="1.5" fill="oklch(0.92 0.14 95)" />
          <rect x="39.3" y="225" width="1.4" height="12" fill="oklch(0.7 0.14 150)" />
        </g>
        <g className="flower-sway-2">
          <circle cx="370" cy="228" r="4" fill="oklch(0.85 0.12 300)" />
          <circle cx="370" cy="228" r="1.5" fill="oklch(0.92 0.14 95)" />
          <rect x="369.3" y="228" width="1.4" height="12" fill="oklch(0.7 0.14 150)" />
        </g>
      </svg>

      <style>{`
        .sun-spin { transform-origin: center; animation: sun-spin 18s linear infinite; }
        .sun-pulse { transform-origin: center; animation: sun-pulse 2.4s ease-in-out infinite; }
        .bear-bob { animation: bear-bob 2.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .bear-wave { animation: bear-wave 1.4s ease-in-out infinite; transform-box: fill-box; }
        .bunny-hop { animation: bunny-hop 1.2s ease-in-out infinite; transform-box: fill-box; }
        .cloud-drift { animation: cloud-drift 14s ease-in-out infinite; transform-box: fill-box; }
        .cloud-drift-slow { animation: cloud-drift 20s ease-in-out infinite reverse; transform-box: fill-box; }
        .flower-sway { animation: sway 3s ease-in-out infinite; transform-origin: 40px 237px; transform-box: fill-box; }
        .flower-sway-2 { animation: sway 3.6s ease-in-out infinite; transform-origin: 370px 240px; transform-box: fill-box; }

        @keyframes sun-spin { to { transform: rotate(360deg); } }
        @keyframes sun-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes bear-bob {
          0%,100% { transform: translate(130px, 195px) translateY(0); }
          50%     { transform: translate(130px, 195px) translateY(-4px); }
        }
        @keyframes bear-wave {
          0%,100% { transform: rotate(-10deg); }
          50%     { transform: rotate(25deg); }
        }
        @keyframes bunny-hop {
          0%,100% { transform: translate(240px, 200px) translateY(0) scaleY(1); }
          40%     { transform: translate(240px, 200px) translateY(-18px) scaleY(1.05); }
          60%     { transform: translate(240px, 200px) translateY(-18px) scaleY(1.05); }
          80%     { transform: translate(240px, 200px) translateY(0) scaleY(0.95); }
        }
        @keyframes cloud-drift {
          0%,100% { transform: translateX(0); }
          50%     { transform: translateX(14px); }
        }
        @keyframes sway {
          0%,100% { transform: rotate(-6deg); }
          50%     { transform: rotate(6deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .sun-spin,.sun-pulse,.bear-bob,.bear-wave,.bunny-hop,
          .cloud-drift,.cloud-drift-slow,.flower-sway,.flower-sway-2 {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
