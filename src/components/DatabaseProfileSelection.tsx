import type { DatabaseChild } from '../lib/api';

type DatabaseProfileSelectionProps = {
  children: DatabaseChild[];
  loading: boolean;
  error: string;
  parentName: string;
  onSelectChild: (child: DatabaseChild) => void;
  onRetry: () => void;
  onLogout: () => void;
};

const profileEmojis = [
  '🦁',
  '🐼',
  '🐰',
  '🐻',
  '🦊',
  '🐸',
];

const profileColors = [
  '#ffa62b',
  '#95d5b2',
  '#ff8fa3',
  '#8ecae6',
  '#c89f7a',
  '#b8e986',
];

export function getDatabaseProfileEmoji(
  childId: number,
): string {
  return profileEmojis[
    Math.abs(childId) % profileEmojis.length
  ];
}

export function getDatabaseProfileColor(
  childId: number,
): string {
  return profileColors[
    Math.abs(childId) % profileColors.length
  ];
}

export default function DatabaseProfileSelection({
  children,
  loading,
  error,
  parentName,
  onSelectChild,
  onRetry,
  onLogout,
}: DatabaseProfileSelectionProps) {
  return (
    <main className="database-profile-page">
      <header className="database-profile-header">
        <div>
          <span>Connected parent</span>
          <strong>{parentName}</strong>
        </div>

        <button
          type="button"
          onClick={onLogout}
        >
          Sign Out
        </button>
      </header>

      <section className="database-profile-content">
        <div className="database-profile-title">
          <span>☁️ ⭐ 🌈</span>
          <h1>Who&apos;s Watching?</h1>
          <p>
            These profiles are loaded from the
            SARA Tube PostgreSQL database.
          </p>
        </div>

        {loading && (
          <div className="database-profile-status">
            Loading child profiles...
          </div>
        )}

        {error && !loading && (
          <div className="database-profile-error">
            <strong>Could not load profiles</strong>
            <p>{error}</p>

            <button
              type="button"
              onClick={onRetry}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          children.length === 0 && (
            <div className="database-profile-status">
              No child profiles exist for this parent.
            </div>
          )}

        {!loading &&
          !error &&
          children.length > 0 && (
            <div className="database-profile-grid">
              {children.map((child) => (
                <button
                  type="button"
                  key={`database-child-${child.id}`}
                  className="database-profile-card"
                  onClick={() =>
                    onSelectChild(child)
                  }
                >
                  <div
                    className="database-profile-avatar"
                    style={{
                      backgroundColor:
                        getDatabaseProfileColor(
                          child.id,
                        ),
                    }}
                  >
                    {child.avatar_url ? (
                      <img
                        src={child.avatar_url}
                        alt={child.display_name}
                      />
                    ) : (
                      <span>
                        {getDatabaseProfileEmoji(
                          child.id,
                        )}
                      </span>
                    )}
                  </div>

                  <h2>{child.display_name}</h2>

                  <p>
                    {child.age
                      ? `Age ${child.age}`
                      : 'Child profile'}
                  </p>
                </button>
              ))}
            </div>
          )}
      </section>
    </main>
  );
}
