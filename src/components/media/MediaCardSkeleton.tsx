/** Placeholder cell shown while assigned media is loading. */
export function MediaCardSkeleton() {
  return (
    <div className="sasa-card" aria-hidden="true">
      <div className="sasa-skel is-thumb" />
      <div className="sasa-card-body">
        <div className="sasa-skel" style={{ width: 32, height: 32, borderRadius: 999 }} />
        <div className="sasa-card-text" style={{ display: "grid", gap: 8, paddingTop: 4 }}>
          <div className="sasa-skel is-line" style={{ width: "88%" }} />
          <div className="sasa-skel is-line" style={{ width: "56%" }} />
        </div>
      </div>
    </div>
  );
}

export default MediaCardSkeleton;
