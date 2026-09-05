import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Play } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { kidsVideos } from "@/components/KidsVideoHome";
import { mediaThumbnailFallback } from "@/components/KidsVideoHome";
import { usePublicLibrary } from "@/lib/use-public-library";

export const Route = createFileRoute("/videos")({
  component: VideosPage,
});

/**
 * Standalone catalogue of the built-in video library. The cards are real
 * entries from the same `kidsVideos` list the app itself plays, and each one
 * opens the app on the Home section rather than pretending to play here.
 */
function VideosPage() {
  /* SASA_PUBLIC_LIBRARY_V26 — published library videos, from the public
   * endpoint. Guests included: the endpoint needs no session, and it can only
   * return published public rows. */
  const library = usePublicLibrary("video");

  return (
    <div className="sasa-standalone">
      <header className="sasa-auth-topbar">
        <Link to="/" className="sasa-iconbtn" aria-label="Back to SARA">
          <ArrowLeft size={22} />
        </Link>
        <div style={{ minWidth: 0, flex: "1 1 auto" }}>
          <h1 className="sasa-standalone-title">Videos</h1>
          <p className="sasa-standalone-sub">The built-in video library</p>
        </div>
        <Link to="/" className="sasa-btn is-primary">
          Open the app
        </Link>
      </header>

      <main className="sasa-container">
        {library.error && (
          <p className="sasa-standalone-note" role="status">
            The SASA library could not be loaded. {library.error}
          </p>
        )}

        <div className="sasa-grid">
          {library.items.map((item) => (
            <article className="sasa-card" key={item.id}>
              <Link
                to="/"
                search={{ section: "home" }}
                className="sasa-card-link"
                aria-label={`Open ${item.title} in SARA`}
              >
                <span className="sasa-card-thumb">
                  <img
                    src={item.image || mediaThumbnailFallback}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = mediaThumbnailFallback;
                    }}
                  />
                  <span className="sasa-card-play" aria-hidden="true">
                    <Play size={30} fill="currentColor" />
                  </span>
                </span>
              </Link>

              <div className="sasa-card-body">
                <div className="sasa-card-text">
                  <h2 className="sasa-card-title">{item.title}</h2>
                  <p className="sasa-card-channel">SASA library</p>
                  <p className="sasa-card-meta">
                    Video{item.category ? ` · ${item.category}` : ""}
                  </p>
                </div>
              </div>
            </article>
          ))}

          {kidsVideos.map((video) => (
            <article className="sasa-card" key={video.id}>
              <Link
                to="/"
                search={{ section: "home" }}
                className="sasa-card-link"
                aria-label={`Open ${video.title} in SARA`}
              >
                <span className="sasa-card-thumb">
                  <img
                    src={video.image}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = mediaThumbnailFallback;
                    }}
                  />
                  <span className="sasa-card-play" aria-hidden="true">
                    <Play size={30} fill="currentColor" />
                  </span>
                  <span className="sasa-card-badge">{video.duration}</span>
                </span>
              </Link>

              <div className="sasa-card-body">
                <div className="sasa-card-text">
                  <h2 className="sasa-card-title">{video.title}</h2>
                  <p className="sasa-card-channel">SARA Kids</p>
                  <p className="sasa-card-meta">Video · {video.category}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
