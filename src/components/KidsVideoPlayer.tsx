import { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Home,
  MoreVertical,
  Pause,
  Play,
  Search,
  UserCircle,
} from 'lucide-react';
import type { KidsVideoItem } from './KidsVideoHome';
import { kidsVideos } from './KidsVideoHome';

type KidsVideoPlayerProps = {
  video: KidsVideoItem;
  onBack: () => void;
  onOpenVideo: (video: KidsVideoItem) => void;
  onOpenHomeTab: (
    tab: 'home' | 'search' | 'library',
  ) => void;
  onChangeProfile: () => void;
};

const reactions = [
  {
    id: 'love',
    label: 'Love it',
    emoji: '❤️',
    className: 'love',
  },
  {
    id: 'super',
    label: 'Super',
    emoji: '⭐',
    className: 'super',
  },
  {
    id: 'funny',
    label: 'Funny',
    emoji: '😂',
    className: 'funny',
  },
  {
    id: 'wow',
    label: 'Wow',
    emoji: '😲',
    className: 'wow',
  },
];

export default function KidsVideoPlayer({
  video,
  onBack,
  onOpenVideo,
  onOpenHomeTab,
  onChangeProfile,
}: KidsVideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [reaction, setReaction] = useState(() => {
    return (
      localStorage.getItem(
        `sasa-video-reaction-${video.id}`,
      ) ?? ''
    );
  });

  const upNext = kidsVideos
    .filter((item) => item.id !== video.id)
    .slice(0, showAll ? kidsVideos.length : 3);

  return (
    <div className="kids-player-page">
      <header className="kids-player-header">
        <button type="button" onClick={onBack} aria-label="Go back">
          <ArrowLeft size={25} />
        </button>

        <h1>WonderWatch</h1>

        <button type="button" aria-label="More options">
          <MoreVertical size={25} />
        </button>
      </header>

      <main className="kids-player-content">
        <section className="kids-player-hero">
          <img src={video.image} alt={video.title} />

          <button
            type="button"
            className="kids-player-play-button"
            onClick={() => setPlaying((value) => !value)}
            aria-label={playing ? 'Pause video' : 'Play video'}
          >
            {playing ? (
              <Pause size={40} fill="currentColor" />
            ) : (
              <Play size={40} fill="currentColor" />
            )}
          </button>
        </section>

        <div className="kids-player-progress">
          <span style={{ width: playing ? '55%' : '40%' }} />
        </div>

        <section className="kids-player-info">
          <h2>{video.title}</h2>
          <p>2.4M Views · 1 Week Ago</p>

          <section className="kids-reaction-section">
            <h3>How do you feel?</h3>

            <div className="kids-reaction-grid">
              {reactions.map((item) => {
                const selected = reaction === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={[
                      'kids-reaction-choice',
                      item.className,
                      selected ? 'selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      const updated =
                        reaction === item.id ? '' : item.id;

                      setReaction(updated);

                      if (updated) {
                        localStorage.setItem(
                          `sasa-video-reaction-${video.id}`,
                          updated,
                        );
                      } else {
                        localStorage.removeItem(
                          `sasa-video-reaction-${video.id}`,
                        );
                      }
                    }}
                    aria-pressed={selected}
                  >
                    <span className="kids-reaction-face">
                      {item.emoji}
                    </span>

                    <span className="kids-reaction-label">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="kids-up-next-heading">
            <h3>Up Next</h3>

            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
            >
              {showAll ? 'Show Less' : 'See All'}
            </button>
          </div>

          <div className="kids-up-next-list">
            {upNext.map((item) => (
              <button
                type="button"
                className="kids-up-next-card"
                key={item.id}
                onClick={() => {
                  setPlaying(false);
                  setReaction(
                    localStorage.getItem(
                      `sasa-video-reaction-${item.id}`,
                    ) ?? '',
                  );
                  onOpenVideo(item);
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                  });
                }}
              >
                <img src={item.image} alt={item.title} />

                <span>
                  <strong>{item.title}</strong>
                  <small>{item.duration} · 1.2M Views</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <nav className="kids-player-bottom-nav">
        <button
          type="button"
          className="active"
          onClick={() => onOpenHomeTab('home')}
        >
          <Home size={24} />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenHomeTab('search')}
        >
          <Search size={24} />
          <span>Search</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenHomeTab('library')}
        >
          <BookOpen size={24} />
          <span>Library</span>
        </button>

        <button type="button" onClick={onChangeProfile}>
          <UserCircle size={24} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}
