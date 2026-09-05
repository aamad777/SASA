import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, Search, Upload } from "lucide-react";
import AdminShell, { type AdminTab } from "@/components/admin/AdminShell";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { getApiAssetUrl } from "@/lib/api";
import {
  deletePublicMedia,
  getAdminOverview,
  getAdminParent,
  getAdminParents,
  getAdminPublicMedia,
  getAuditLog,
  revokeParentSessions,
  setParentStatus,
  retryThumbnail,
  updatePublicMedia,
  uploadPublicMedia,
  type AdminOverview,
  type AdminParent,
  type AdminParentDetail,
  type AuditEntry,
  type PublicMediaItem,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin")({ component: AdminPortal });

function readToken(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem("sasa-parent-token") || "";
  } catch {
    return "";
  }
}

/** Small helper so every screen shows the same three states honestly. */
function State({
  loading,
  error,
  empty,
  onRetry,
}: {
  loading: boolean;
  error: string;
  empty?: string;
  onRetry?: () => void;
}) {
  if (loading) return <p className="sasa-admin-state">Loading…</p>;

  if (error) {
    return (
      <div className="sasa-admin-state is-error" role="alert">
        <AlertTriangle size={16} /> {error}
        {onRetry ? (
          <button type="button" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
    );
  }

  if (empty) return <p className="sasa-admin-state">{empty}</p>;

  return null;
}

function AdminPortal() {
  const [token] = useState(readToken);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [openParent, setOpenParent] = useState<string | null>(null);

  // A non-admin reaching this route is refused by every API call it makes; the
  // portal simply has nothing to show. The server is the boundary.
  const [denied, setDenied] = useState(false);

  const signOut = () => {
    try {
      localStorage.removeItem("sasa-parent-token");
      localStorage.removeItem("sasa-parent-name");
    } catch {
      /* storage unavailable */
    }
    window.location.assign("/");
  };

  if (!token) {
    return (
      <div className="sasa-admin-gate">
        <h1>SASA Admin</h1>
        <p>Sign in with an administrator account to continue.</p>
        <a className="sasa-pin-btn is-primary" href="/?screen=parent-login">
          Go to sign in
        </a>
      </div>
    );
  }

  if (denied) {
    return (
      <div className="sasa-admin-gate">
        <h1>Administrator access required</h1>
        <p>This account is not an administrator.</p>
        <a className="sasa-pin-btn" href="/">
          Back to SASA
        </a>
      </div>
    );
  }

  return (
    <AdminShell
      active={tab}
      onSelect={(next) => {
        setTab(next);
        setOpenParent(null);
      }}
      onSignOut={signOut}
    >
      {tab === "overview" && <OverviewScreen token={token} onDenied={() => setDenied(true)} />}
      {tab === "parents" &&
        (openParent ? (
          <ParentDetailScreen token={token} id={openParent} onBack={() => setOpenParent(null)} />
        ) : (
          <ParentsScreen token={token} onOpen={setOpenParent} />
        ))}
      {tab === "media" && <PublicMediaScreen token={token} />}
      {tab === "audit" && <AuditScreen token={token} />}
    </AdminShell>
  );
}

function OverviewScreen({ token, onDenied }: { token: string; onDenied: () => void }) {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    getAdminOverview(token)
      .then(setData)
      .catch((err: Error) => {
        if (/administrator access/i.test(err.message)) onDenied();
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [token, onDenied]);

  useEffect(load, [load]);

  if (loading || error) return <State loading={loading} error={error} onRetry={load} />;
  if (!data) return null;

  const s = data.stats;

  return (
    <div className="sasa-admin-screen">
      <h1 className="sasa-admin-title">Overview</h1>

      <div className="sasa-admin-stats">
        {[
          ["Active parents", s.parentsActive],
          ["Suspended", s.parentsSuspended],
          ["Children", s.children],
          ["Public videos", s.publicVideosPublished],
          ["Public photos", s.publicPhotosPublished],
          ["Drafts", s.publicDrafts],
          ["Private family media", s.privateFamilyMedia],
        ].map(([label, value]) => (
          <div key={String(label)} className="sasa-admin-stat">
            <strong>{value as number}</strong>
            <span>{label as string}</span>
          </div>
        ))}
      </div>

      <h2 className="sasa-admin-subtitle">Recent uploads</h2>
      {data.recentUploads.length === 0 ? (
        <p className="sasa-admin-state">No media uploaded yet.</p>
      ) : (
        <ul className="sasa-admin-list">
          {data.recentUploads.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span>
                {item.media_type} · {item.visibility} · {item.publication_status}
              </span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="sasa-admin-subtitle">Recent administrative activity</h2>
      {data.recentActions.length === 0 ? (
        <p className="sasa-admin-state">No administrative actions recorded yet.</p>
      ) : (
        <ul className="sasa-admin-list">
          {data.recentActions.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.action}</strong>
              <span>
                {entry.actor_email || "unknown"} · {new Date(entry.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ParentsScreen({ token, onOpen }: { token: string; onOpen: (id: string) => void }) {
  const [rows, setRows] = useState<AdminParent[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    getAdminParents(token, { search, status, limit, offset })
      .then((data) => {
        setRows(data.parents);
        setTotal(data.total);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, search, status, offset]);

  useEffect(load, [load]);

  return (
    <div className="sasa-admin-screen">
      <h1 className="sasa-admin-title">Parent accounts</h1>

      <div className="sasa-admin-filters">
        <label className="sasa-admin-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={search}
            placeholder="Search by email"
            aria-label="Search parent accounts by email"
            onChange={(event) => {
              setOffset(0);
              setSearch(event.target.value);
            }}
          />
        </label>

        <div className="sasa-admin-chips" role="group" aria-label="Filter by status">
          {[
            ["", "All"],
            ["active", "Active"],
            ["suspended", "Suspended"],
          ].map(([value, label]) => (
            <button
              key={label}
              type="button"
              className={status === value ? "is-selected" : undefined}
              aria-pressed={status === value}
              onClick={() => {
                setOffset(0);
                setStatus(value);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <State
        loading={loading}
        error={error}
        empty={!loading && !error && rows.length === 0 ? "No accounts match." : undefined}
        onRetry={load}
      />

      {!loading && !error && rows.length > 0 && (
        <>
          {/* A table on desktop, readable rows on a phone - same markup. */}
          <ul className="sasa-admin-rows">
            {rows.map((row) => (
              <li key={row.id}>
                <button type="button" onClick={() => onOpen(row.id)}>
                  <span className="sasa-admin-rowmain">
                    <strong>{row.email}</strong>
                    <span>
                      {row.child_count} {row.child_count === 1 ? "child" : "children"} ·{" "}
                      {row.media_count} media · joined{" "}
                      {new Date(row.created_at).toLocaleDateString()}
                    </span>
                  </span>
                  <span
                    className={
                      row.status === "suspended" ? "sasa-admin-badge is-bad" : "sasa-admin-badge"
                    }
                  >
                    {row.status}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <Pager total={total} limit={limit} offset={offset} onOffset={setOffset} />
        </>
      )}
    </div>
  );
}

function Pager({
  total,
  limit,
  offset,
  onOffset,
}: {
  total: number;
  limit: number;
  offset: number;
  onOffset: (next: number) => void;
}) {
  const page = Math.floor(offset / limit) + 1;
  const pages = Math.max(1, Math.ceil(total / limit));

  if (pages <= 1) return null;

  return (
    <div className="sasa-admin-pager">
      <button
        type="button"
        disabled={offset <= 0}
        onClick={() => onOffset(Math.max(0, offset - limit))}
      >
        Previous
      </button>
      <span>
        Page {page} of {pages}
      </span>
      <button type="button" disabled={page >= pages} onClick={() => onOffset(offset + limit)}>
        Next
      </button>
    </div>
  );
}

function ParentDetailScreen({
  token,
  id,
  onBack,
}: {
  token: string;
  id: string;
  onBack: () => void;
}) {
  const [data, setData] = useState<AdminParentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<null | "suspend" | "restore" | "revoke">(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const busyRef = useRef(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    getAdminParent(token, id)
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, id]);

  useEffect(load, [load]);

  const run = async (what: "suspend" | "restore" | "revoke") => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setActionError("");

    try {
      if (what === "revoke") await revokeParentSessions(token, id);
      else await setParentStatus(token, id, what === "suspend" ? "suspended" : "active");

      setConfirm(null);
      load(); // refresh after every successful action
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  return (
    <div className="sasa-admin-screen">
      <button type="button" className="sasa-admin-back" onClick={onBack}>
        <ArrowLeft size={16} /> All accounts
      </button>

      <State loading={loading} error={error} onRetry={load} />

      {!loading && !error && data && (
        <>
          <h1 className="sasa-admin-title">{data.parent.email}</h1>
          <p className="sasa-admin-meta">
            <span
              className={
                data.parent.status === "suspended" ? "sasa-admin-badge is-bad" : "sasa-admin-badge"
              }
            >
              {data.parent.status}
            </span>{" "}
            joined {new Date(data.parent.created_at).toLocaleDateString()} · {data.media.count}{" "}
            media · {(data.media.bytes / (1024 * 1024)).toFixed(1)} MB
          </p>

          <div className="sasa-admin-actions">
            {data.parent.status === "active" ? (
              <button type="button" className="sasa-pin-btn" onClick={() => setConfirm("suspend")}>
                Suspend
              </button>
            ) : (
              <button
                type="button"
                className="sasa-pin-btn is-primary"
                onClick={() => setConfirm("restore")}
              >
                Restore
              </button>
            )}
            <button type="button" className="sasa-pin-btn" onClick={() => setConfirm("revoke")}>
              Revoke sessions
            </button>
          </div>

          <h2 className="sasa-admin-subtitle">Children</h2>
          {data.children.length === 0 ? (
            <p className="sasa-admin-state">This account has no child profiles.</p>
          ) : (
            <ul className="sasa-admin-list">
              {data.children.map((child) => (
                <li key={child.id}>
                  <strong>{child.display_name}</strong>
                  {/* has_pin only - the API never returns a PIN or its hash. */}
                  <span>
                    {child.age ? `Age ${child.age} · ` : ""}
                    {child.has_pin ? "PIN set" : "No PIN"}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <h2 className="sasa-admin-subtitle">Recent activity on this account</h2>
          {data.audit.length === 0 ? (
            <p className="sasa-admin-state">No administrative actions recorded.</p>
          ) : (
            <ul className="sasa-admin-list">
              {data.audit.map((entry) => (
                <li key={entry.id}>
                  <strong>{entry.action}</strong>
                  <span>
                    {entry.actor_email || "unknown"} · {new Date(entry.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {confirm === "suspend" && (
        <ConfirmDialog
          title="Suspend this account?"
          body="The parent will not be able to sign in, and their current sessions stop working immediately. Their children and media are left untouched."
          confirmLabel="Suspend account"
          requirePhrase="SUSPEND"
          busy={busy}
          error={actionError}
          onCancel={() => setConfirm(null)}
          onConfirm={() => run("suspend")}
        />
      )}

      {confirm === "restore" && (
        <ConfirmDialog
          title="Restore this account?"
          body="The parent will be able to sign in again."
          confirmLabel="Restore account"
          busy={busy}
          error={actionError}
          onCancel={() => setConfirm(null)}
          onConfirm={() => run("restore")}
        />
      )}

      {confirm === "revoke" && (
        <ConfirmDialog
          title="Revoke active sessions?"
          body="Everyone signed in on this account is signed out. They can sign in again straight away."
          confirmLabel="Revoke sessions"
          busy={busy}
          error={actionError}
          onCancel={() => setConfirm(null)}
          onConfirm={() => run("revoke")}
        />
      )}
    </div>
  );
}

function PublicMediaScreen({ token }: { token: string }) {
  const [items, setItems] = useState<PublicMediaItem[]>([]);
  const [kind, setKind] = useState<"photo" | "video">("photo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<PublicMediaItem | null>(null);
  const uploadingRef = useRef(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    getAdminPublicMedia(token, { limit: 50 })
      .then((data) => setItems(data.media))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(load, [load]);

  /* SASA_ASYNC_THUMBNAILS_V27 — an upload now answers before its frame is
   * extracted, so the list has to catch up on its own rather than leaving
   * "Processing" on screen until someone reloads. Polling stops as soon as
   * nothing is outstanding, so an idle admin screen makes no requests. */
  const awaitingThumbnail = items.some(
    (item) => item.thumbnail_status === "pending" || item.thumbnail_status === "processing",
  );

  useEffect(() => {
    if (!awaitingThumbnail) return;

    const id = window.setInterval(() => {
      getAdminPublicMedia(token, { limit: 50 })
        .then((data) => setItems(data.media))
        .catch(() => {
          /* A blip must not clear the list or stop the next poll. */
        });
    }, 4000);

    return () => window.clearInterval(id);
  }, [awaitingThumbnail, token]);

  const doRetryThumbnail = async (item: PublicMediaItem) => {
    try {
      await retryThumbnail(token, item.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not retry the thumbnail.");
    }
  };

  const doUpload = async () => {
    if (uploadingRef.current || !file) return;
    uploadingRef.current = true;
    setUploading(true);
    setUploadError("");

    try {
      await uploadPublicMedia(token, file, { title: title.trim() || file.name }, setProgress);
      setFile(null);
      setTitle("");
      load();
    } catch (err) {
      // Only a real 2xx clears this; a failure is never shown as success.
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      uploadingRef.current = false;
      setUploading(false);
      setProgress(0);
    }
  };

  const togglePublish = async (item: PublicMediaItem) => {
    try {
      await updatePublicMedia(token, item.id, {
        publication_status: item.publication_status === "published" ? "draft" : "published",
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change publication status.");
    }
  };

  const shown = items.filter((item) => item.media_type === kind);

  return (
    <div className="sasa-admin-screen">
      <h1 className="sasa-admin-title">Public media</h1>
      <p className="sasa-admin-meta">
        Visible to guests once published. Private family uploads never appear here.
      </p>

      <div className="sasa-admin-chips" role="group" aria-label="Media type">
        {(["photo", "video"] as const).map((value) => (
          <button
            key={value}
            type="button"
            className={kind === value ? "is-selected" : undefined}
            aria-pressed={kind === value}
            onClick={() => setKind(value)}
          >
            {value === "photo" ? "Photos" : "Videos"}
          </button>
        ))}
      </div>

      <div className="sasa-admin-upload">
        <label className="sasa-field">
          <span>Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Optional"
          />
        </label>

        <label className="sasa-field">
          <span>{kind === "photo" ? "Photo file" : "Video file"}</span>
          <input
            type="file"
            accept={
              kind === "photo"
                ? "image/jpeg,image/png,image/webp"
                : "video/mp4,video/webm,video/quicktime"
            }
            disabled={uploading}
            onChange={(event) => {
              setUploadError("");
              setFile(event.target.files?.[0] || null);
            }}
          />
        </label>

        {uploading ? (
          <div
            className="sasa-admin-progress"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${progress}%` }} />
            {/* The thumbnail is no longer extracted inside this request, so
                claiming "processing" here would overstate what is happening. */}
            <em>Uploading… {progress}%</em>
          </div>
        ) : null}

        {uploadError ? (
          <p className="sasa-formsheet-error" role="alert">
            {uploadError}
          </p>
        ) : null}

        <button
          type="button"
          className="sasa-pin-btn is-primary"
          onClick={doUpload}
          disabled={uploading || !file}
        >
          <Upload size={16} /> Upload as draft
        </button>
      </div>

      <State
        loading={loading}
        error={error}
        empty={!loading && !error && shown.length === 0 ? `No public ${kind}s yet.` : undefined}
        onRetry={load}
      />

      {!loading && shown.length > 0 && (
        <ul className="sasa-admin-media">
          {shown.map((item) => (
            <li key={item.id}>
              <span className="sasa-admin-thumb">
                {item.thumbnail_url ? (
                  <img src={getApiAssetUrl(item.thumbnail_url)} alt="" loading="lazy" />
                ) : item.thumbnail_status === "pending" ||
                  item.thumbnail_status === "processing" ? (
                  /* Not "No preview": the frame is on its way, and saying
                   * otherwise reads as a permanent failure. */
                  <em>Processing thumbnail…</em>
                ) : item.thumbnail_status === "failed" ? (
                  <em>Thumbnail failed</em>
                ) : (
                  <em>No preview</em>
                )}
              </span>

              <span className="sasa-admin-mediabody">
                <strong>{item.title}</strong>
                <span>
                  {item.category || "general"} ·{" "}
                  <span
                    className={
                      item.publication_status === "published"
                        ? "sasa-admin-badge"
                        : "sasa-admin-badge is-draft"
                    }
                  >
                    {item.publication_status}
                  </span>
                  {item.media_type === "video" &&
                  item.thumbnail_status &&
                  item.thumbnail_status !== "ready" ? (
                    <>
                      {" · "}
                      <span className="sasa-admin-badge is-draft" role="status">
                        {item.thumbnail_status === "failed"
                          ? `thumbnail failed${
                              item.thumbnail_attempts
                                ? ` after ${item.thumbnail_attempts} tries`
                                : ""
                            }`
                          : "processing thumbnail"}
                      </span>
                    </>
                  ) : null}
                </span>
              </span>

              <span className="sasa-admin-mediaactions">
                <button type="button" onClick={() => togglePublish(item)}>
                  {item.publication_status === "published" ? "Unpublish" : "Publish"}
                </button>
                {item.media_type === "video" && item.thumbnail_status === "failed" ? (
                  <button type="button" onClick={() => doRetryThumbnail(item)}>
                    Retry thumbnail
                  </button>
                ) : null}
                <button type="button" onClick={() => setConfirmDelete(item)}>
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this item?"
          body={`"${confirmDelete.title}" and its generated thumbnail are removed permanently.`}
          confirmLabel="Delete"
          requirePhrase="DELETE"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={async () => {
            await deletePublicMedia(token, confirmDelete.id);
            setConfirmDelete(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function AuditScreen({ token }: { token: string }) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const limit = 25;

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    getAuditLog(token, { limit, offset })
      .then((data) => {
        setEntries(data.entries);
        setTotal(data.total);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, offset]);

  useEffect(load, [load]);

  const shown = filter ? entries.filter((entry) => entry.action.includes(filter)) : entries;

  return (
    <div className="sasa-admin-screen">
      <h1 className="sasa-admin-title">Audit log</h1>

      <div className="sasa-admin-chips" role="group" aria-label="Filter by action">
        {[
          ["", "All"],
          ["parent.", "Accounts"],
          ["public_media.", "Media"],
        ].map(([value, label]) => (
          <button
            key={label}
            type="button"
            className={filter === value ? "is-selected" : undefined}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <State
        loading={loading}
        error={error}
        empty={
          !loading && !error && shown.length === 0
            ? "No administrative actions recorded."
            : undefined
        }
        onRetry={load}
      />

      {!loading && shown.length > 0 && (
        <>
          <ul className="sasa-admin-rows is-audit">
            {shown.map((entry) => (
              <li key={entry.id}>
                <span className="sasa-admin-rowmain">
                  <strong>{entry.action}</strong>
                  <span>
                    {entry.actor_email || "unknown"} · {entry.target_type || "—"} ·{" "}
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <Pager total={total} limit={limit} offset={offset} onOffset={setOffset} />
        </>
      )}
    </div>
  );
}
