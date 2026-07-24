import { useMemo, useState } from 'react';
import {
  BookOpen,
  Heart,
  Home,
  Play,
  Search,
  Settings,
  X,
} from 'lucide-react';

export type KidsVideoItem = {
  id: number;
  title: string;
  duration: string;
  image: string;
  category: string;
};

export type KidsHomeTab = 'home' | 'search' | 'library';

type KidsVideoHomeProps = {
  profileName: string;
  profileEmoji: string;
  initialTab?: KidsHomeTab;
  onOpenVideo: (video: KidsVideoItem) => void;
  onOpenParentalControls: () => void;
  onChangeProfile: () => void;
};

const categories = [
  {
    name: 'Animals',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDjAp5NZ48TuzQUwagJX3BEsOoRnHOfOQFRiaHzC_6VTHBusH5vdnyE-dw2wknaAdkSD_sTsjy4_S035njloXzb9SfVsBpcozUKLuAk_Ru8t6VD9syxltNOKUoSvF3oUXsLo8akWhFvxPSm2k8HawcXFK9cvfvBSAUSSj-l_0flPJq2RHEuQ0kZCj_WR_krtqKF_ZdJ7EFdeLJYMLZRPv_YRK6UERduzBqHzOsLRKnUVUsh20dZNsLaXSmOmukV0-omLmxDf1yuxsA',
  },
  {
    name: 'Science',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBHx_6VcyyyAkMrQ7Y-w-OURZAkou1lzLfFPib9MJvZ8Q474OGB979tU1_jyn_95spx9jIpSNEy85GZQopqNO0YfQ9pUBwLBuUHqOTLbPJ5of_LNsURwBaiZi3QIy5je5_p64nOmb_s4c_6o5NBFDnM00Ova9JScEElI9-jWPKobWVu9oXtbNfP3_831wYXyLFyVhtH9oYsNKShDEFyZj5ao_bC8_QH_i0D4NSHwZDg0iZDGPhm6ZUApCXn67AXGvsf6S8g6rW_uOo',
  },
  {
    name: 'Music',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA1Xbm9EFIAa_mvtnoDyzgtc-A7uv8qtl0H_QNFVxh_WPQMF9XSYZ5oSoHBEMAtRXUi88dYmVPx_NAoLEZmVVTT4zjVdlMLl3fAT5IXLbgAsx8fnF440SBIgWZPAkymQlht1Z6NlIVJhHiLDMxYkRbdG27zpypLTYY8hQEFwTUNt_KY_u58FDDX9sPm4sNKmSfNds47k4N0SBuwe3uu1k5WmnsHMxhxacfccE_jj5avy0fi0PQr-5I7cyEhMK702e3wlHKCooQGqXE',
  },
  {
    name: 'Space',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBV2uFqV3SsOxGG5OZoIPxSK9n-z2uooMZoXphzsg7XNM_7SOnRPS-T5nk0rwvrJjl8gUyds1SkY_Jpk2XkRWF-cQLWjcXXwtG8fD5gaYqbhKO8ZedsubYFwOwwEHx7TKGdAqG-GrMzOyKejZlU9mAfQ3f-lCVUM1HSnlw4vK9VBxcc_DLbVchaJ2XXzovD_bHU6AWHEdIOU5hgJyd1aOgZU2Yph7EIVdcucHErhwbhR_9agLdyYpNOLUXwgLiaj9qd6f_Wbyxjd8I',
  },
];

export const kidsVideos: KidsVideoItem[] = [
  {
    id: 1,
    title: 'Learn to Count with Dinosaurs!',
    duration: '10:15',
    category: 'Animals',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDjwcBvDtG1fe9LxHnoNeNrMGk4fTivdubiwP3TV_DPY0hq0PJKfoljdtzGCLvfWssM7kOIgxD91CkIQjV5T4wDSnMhK8XBfG8BW0ML4IYpsgiKhz8Anpj6pMGuINoL8YZOGFOedj-GecrNAlbW6xYDigch_X_Poia5K8nEDaa-WRCCeNtM4KsoU_LRARwtMPxvsh-5KfqA1iLf5Mgs1uQxd8GjNjHCvVNalC6ezmoLMkoLE6znAFA1tB7fDx5zhsVYhr49qiEXBpc',
  },
  {
    id: 2,
    title: 'The Amazing Solar System',
    duration: '15:30',
    category: 'Space',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAYCIE5ObL0I7VLAVlu9S4guu3tZis6FpFWIbfo3lt8h7YwHELMjkXWpUm22oWdAvXGzdDqARBkSTL-G5nSSoHo0pby2o8GRQjz0iOlERwoh7WQoQieYKB7ey9KRjIunSXvRvXqfz95W-oOhohOmbwvGo7_9ha9VsYEH2DUbRvqXHWcYV5ZiTBQ0onEHIbr1qx7IHfklS01xpqKgxnOHpEY3zF0dgZZ7ncmW4uRlf1yLPkdr-oaAuDESMde65XhKhFE5lOOx9MnGS8',
  },
  {
    id: 3,
    title: 'Sing-Along Nursery Rhymes',
    duration: '5:00',
    category: 'Music',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBngTUq4TMGud68bpX563YhKS8fpUybHgPm2FagY7uqjDSjn5YnxN8QITXS3cqI1VSAKAySB6-GzuEXMNY38P1zE1hvCSwk9C0WUZwvOG1mwB40_k4Jl5rexXug-ap7N0H9j2JlCEHM-y7B7m14hTzTRm5PZcXs3ipLcNfFe_Jh7nTWeIOxB3luWZzuCZ2cr6_DOgUJS4T96D-WL0W1xUpoPWamZrCEa26f78ucd3uhaEVdHDv4f-paFw3t-nMDJcqNSYRdb1wQ7sQ',
  },
  {
    id: 4,
    title: 'DIY Volcano Experiment',
    duration: '12:45',
    category: 'Science',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAR6gvme4x0nZTflLk5canbiFllbfBKw-83LwR_D4Ea7GYRY8gTDi06DKL-1Vfmy-tPUivApwcH0LQf5jU1wOTdJQkGniE2iutdRwlnFibzzqKFCATB8OQwwndmGOHesq5NmBWUes66WDey5HENcFjeFZq3FCDmiz-3HIASq1Gqpo10NZOUYtk5XMr7sW8nkthJOAiWVFagHSq8rbaeyK418dVshiELkpoXUJEEbS4cNnDwLvAxeQx439IU6YDzVqYgVQQ8jINlF_c',
  },
  {
    id: 5,
    title: 'Plant and Grow Together',
    duration: '10:10',
    category: 'Science',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoW-xoowXiPjR8TL8V7ULpkCvanUpu4zojqDQZ4HYJjoRiJma4RaYu_h-1UaDzr1B9OU95WqQkZvqNRwBajNMo7uRIvVsTfP6YnNanz_oVLCzFT7wufVJ8Gxa5Ko6JP0hxyP0NMEmmujaZFJh8dLXSWcdDD7bZCWSmpufjS8JAM_e4l3Z5iu2-OV-g2Ir-YYXnNiSJTi6t4-zes9z3INlewm5J7yjp2owcaoZmRUMR5SsE-cIvOfSFCj56zAL7mER7JXOl4WyGwY',
  },
  {
    id: 6,
    title: 'Friendly Animal Adventure',
    duration: '8:20',
    category: 'Animals',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBOqr2ccQdse7AfIKOtjwamQ3RJS_kac37xmabWYdAvdrYc0wDWpKIIXEQOUxuyp8YcDZiy-KXKFXylUdmQEXwwJZZZQT8OER_GGE4MKTDQm7tpZZ9mOUfSnBpT3945Pb4IfPhiFyLTOf1nZwGCVupEyJgr9Eh77u28xt4yU1sI2RCxGqX5fKH2955kRFincic4iL0YZHgSudq2f7uRlbQo8kY2ze-hrRIUvu6MIcKCyFVtXa1752c9e7ZdJ_UheNXB4G1FHxKLZ_0',
  },
];

function loadLibrary(): number[] {
  try {
    const value = localStorage.getItem('sasa-video-library');
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function loadBlockedVideoIds(): number[] {
  try {
    const saved = localStorage.getItem(
      'sasa-parent-controls',
    );

    if (!saved) {
      return [];
    }

    const settings = JSON.parse(saved);

    return Array.isArray(settings.blockedVideoIds)
      ? settings.blockedVideoIds
      : [];
  } catch {
    return [];
  }
}

export default function KidsVideoHome({
  profileName,
  profileEmoji,
  initialTab = 'home',
  onOpenVideo,
  onOpenParentalControls,
  onChangeProfile,
}: KidsVideoHomeProps) {
  const [activeTab, setActiveTab] = useState<KidsHomeTab>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [libraryIds, setLibraryIds] = useState<number[]>(loadLibrary);

  const displayedVideos = useMemo(() => {
    const blockedVideoIds = loadBlockedVideoIds();

    let list = kidsVideos.filter(
      (video) => !blockedVideoIds.includes(video.id),
    );

    if (activeTab === 'library') {
      list = list.filter((video) => libraryIds.includes(video.id));
    }

    if (selectedCategory !== 'All') {
      list = list.filter(
        (video) => video.category === selectedCategory,
      );
    }

    if (searchText.trim()) {
      const query = searchText.trim().toLowerCase();

      list = list.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.category.toLowerCase().includes(query),
      );
    }

    return list;
  }, [activeTab, libraryIds, searchText, selectedCategory]);

  const toggleLibrary = (videoId: number) => {
    const updated = libraryIds.includes(videoId)
      ? libraryIds.filter((id) => id !== videoId)
      : [...libraryIds, videoId];

    setLibraryIds(updated);

    localStorage.setItem(
      'sasa-video-library',
      JSON.stringify(updated),
    );
  };

  const changeTab = (tab: KidsHomeTab) => {
    setActiveTab(tab);
    setSearchText('');
    setSelectedCategory('All');
  };

  return (
    <div className="kids-video-home">
      <div className="kids-video-sticky">
        <header className="kids-video-header">
          <div>
            <span>Hello, {profileName}</span>
            <h1>
              {activeTab === 'library'
                ? 'My Library'
                : activeTab === 'search'
                  ? 'Search Videos'
                  : 'Kids Video'}
            </h1>
          </div>

          <button
            type="button"
            onClick={onOpenParentalControls}
          >
            <Settings size={18} />
            <span>Parental Settings</span>
          </button>
        </header>

        {activeTab === 'search' && (
          <div className="kids-search-panel">
            <Search size={21} />

            <input
              type="search"
              value={searchText}
              placeholder="Search safe videos..."
              autoFocus
              onChange={(event) =>
                setSearchText(event.target.value)
              }
            />

            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText('')}
                aria-label="Clear search"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        <nav className="kids-category-nav">
          <button
            type="button"
            className={
              selectedCategory === 'All' ? 'selected' : ''
            }
            onClick={() => setSelectedCategory('All')}
          >
            <span className="kids-all-category">🌈</span>
            <strong>All</strong>
          </button>

          {categories.map((category) => (
            <button
              type="button"
              key={category.name}
              className={
                selectedCategory === category.name
                  ? 'selected'
                  : ''
              }
              onClick={() =>
                setSelectedCategory(category.name)
              }
            >
              <span>
                <img
                  src={category.image}
                  alt={category.name}
                />
              </span>
              <strong>{category.name}</strong>
            </button>
          ))}
        </nav>
      </div>

      <main className="kids-video-grid">
        {displayedVideos.map((video) => {
          const saved = libraryIds.includes(video.id);

          return (
            <article key={video.id}>
              <button
                type="button"
                className="kids-video-thumbnail"
                onClick={() => onOpenVideo(video)}
              >
                <img src={video.image} alt={video.title} />
                <span className="kids-video-dark-overlay" />

                <span className="kids-video-main-play">
                  <Play size={23} fill="currentColor" />
                </span>

                <span className="kids-video-duration">
                  {video.duration}
                </span>

                <span className="kids-video-small-play">
                  <Play size={11} fill="currentColor" />
                </span>
              </button>

              <div className="kids-video-title-row">
                <h2>{video.title}</h2>

                <button
                  type="button"
                  className={
                    saved
                      ? 'kids-library-button saved'
                      : 'kids-library-button'
                  }
                  onClick={() => toggleLibrary(video.id)}
                  aria-label={
                    saved
                      ? 'Remove from library'
                      : 'Add to library'
                  }
                >
                  <Heart
                    size={21}
                    fill={saved ? 'currentColor' : 'none'}
                  />
                </button>
              </div>
            </article>
          );
        })}

        {displayedVideos.length === 0 && (
          <section className="kids-empty-view">
            <span>
              {activeTab === 'library' ? '📚' : '🔍'}
            </span>

            <h2>
              {activeTab === 'library'
                ? 'Your library is empty'
                : 'No videos found'}
            </h2>

            <p>
              {activeTab === 'library'
                ? 'Tap the heart on a video to save it here.'
                : 'Try another title or category.'}
            </p>
          </section>
        )}
      </main>

      <nav className="kids-home-bottom-nav">
        <button
          className={activeTab === 'home' ? 'active' : ''}
          type="button"
          onClick={() => changeTab('home')}
        >
          <span>
            <Home
              size={25}
              fill={
                activeTab === 'home' ? 'currentColor' : 'none'
              }
            />
          </span>
          Home
        </button>

        <button
          className={activeTab === 'search' ? 'active' : ''}
          type="button"
          onClick={() => changeTab('search')}
        >
          <Search size={25} />
          Search
        </button>

        <button
          className={activeTab === 'library' ? 'active' : ''}
          type="button"
          onClick={() => changeTab('library')}
        >
          <BookOpen size={25} />
          Library
        </button>

        <button type="button" onClick={onChangeProfile}>
          <span className="kids-nav-profile">
            {profileEmoji}
          </span>
          Profile
        </button>
      </nav>
    </div>
  );
}
