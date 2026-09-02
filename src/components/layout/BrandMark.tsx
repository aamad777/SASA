/* Original SARA mark — a soft purple disc with an off-centre play glyph and
   a small spark. Drawn here as inline vector so it scales crisply and stays
   entirely ours: no third-party logo, wordmark, or brand shape is copied. */
export function BrandMark({ className = "sasa-brand-mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" role="img" aria-label="SARA" focusable="false">
      <circle cx="16" cy="16" r="15" fill="var(--sasa-brand)" />
      <path
        d="M13 10.6c0-.9 1-1.5 1.8-1.05l8 4.6a1.2 1.2 0 0 1 0 2.1l-8 4.6A1.2 1.2 0 0 1 13 19.8z"
        fill="#fff"
      />
      <circle cx="9.6" cy="21.6" r="2.6" fill="var(--sasa-pink)" />
    </svg>
  );
}

export default BrandMark;
