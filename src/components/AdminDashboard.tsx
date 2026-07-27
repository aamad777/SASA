import { useEffect, useMemo, useState } from "react";
import {
  deleteAdminChild,
  deleteAdminParent,
  getAdminChildren,
  getAdminMediaLibrary,
  getAdminParents,
  getApiAssetUrl,
  updateAdminChild,
  updateAdminMediaAccess,
  updateAdminParent,
  type AdminChild,
  type AdminMediaItem,
  type AdminParent,
} from "../lib/api";

type AdminDashboardProps = {
  token: string;
  adminName: string;
  onLogout: () => void;
};

type AdminTab = "parents" | "children" | "media";

function getLoggedInAdminId(token: string): number | null {
  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return null;
    }

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");

    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

    const payload = JSON.parse(window.atob(padded));
    const subject = Number(payload.sub);

    return Number.isInteger(subject) ? subject : null;
  } catch {
    return null;
  }
}

export default function AdminDashboard({ token, adminName, onLogout }: AdminDashboardProps) {
  const [parents, setParents] = useState<AdminParent[]>([]);
  const [children, setChildren] = useState<AdminChild[]>([]);
  const [media, setMedia] = useState<AdminMediaItem[]>([]);
  const [tab, setTab] = useState<AdminTab>("parents");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingParent, setEditingParent] = useState<AdminParent | null>(null);

  const [editingChild, setEditingChild] = useState<AdminChild | null>(null);

  const [editingMedia, setEditingMedia] = useState<AdminMediaItem | null>(null);

  const [selectedMediaChildIds, setSelectedMediaChildIds] = useState<number[]>([]);

  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "photo" | "video">("all");

  const loggedInAdminId = getLoggedInAdminId(token);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [parentRows, childRows, mediaRows] = await Promise.all([
        getAdminParents(token),
        getAdminChildren(token),
        getAdminMediaLibrary(token),
      ]);

      setParents(parentRows);
      setChildren(childRows);
      setMedia(mediaRows);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load administrator data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredParents = useMemo(() => {
    if (!normalizedSearch) {
      return parents;
    }

    return parents.filter((parent) =>
      [parent.display_name, parent.email, parent.role].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedSearch),
      ),
    );
  }, [parents, normalizedSearch]);

  const filteredChildren = useMemo(() => {
    if (!normalizedSearch) {
      return children;
    }

    return children.filter((child) =>
      [child.display_name, child.login_name, child.parent_name, child.parent_email].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedSearch),
      ),
    );
  }, [children, normalizedSearch]);

  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      if (mediaTypeFilter !== "all" && item.media_type !== mediaTypeFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [item.title, item.original_name, item.filename, item.category, item.uploaded_by].some(
        (value) =>
          String(value || "")
            .toLowerCase()
            .includes(normalizedSearch),
      );
    });
  }, [media, mediaTypeFilter, normalizedSearch]);

  const showResult = (message: string) => {
    setSuccess(message);
    setError("");

    window.setTimeout(() => {
      setSuccess("");
    }, 3500);
  };

  const saveParent = async () => {
    if (!editingParent) {
      return;
    }

    if (!editingParent.display_name.trim()) {
      setError("Parent name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateAdminParent(token, editingParent.id, {
        display_name: editingParent.display_name.trim(),
        email: editingParent.email.trim(),
        role: editingParent.role,
        avatar_url: editingParent.avatar_url,
      });

      setEditingParent(null);
      await loadData();
      showResult("Parent account updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update parent.");
    } finally {
      setSaving(false);
    }
  };

  const removeParent = async (parent: AdminParent) => {
    if (parent.id === loggedInAdminId) {
      setError("You cannot delete the administrator account currently in use.");
      return;
    }

    const confirmed = window.confirm(
      `Delete parent "${parent.display_name}"?\n\n` +
        `This will also delete ${parent.child_count} linked child profile(s).\n` +
        "Media files will remain stored.",
    );

    if (!confirmed) {
      return;
    }

    const typedConfirmation = window.prompt(
      "Type DELETE to permanently remove this parent account.",
    );

    if (typedConfirmation !== "DELETE") {
      setError("Deletion cancelled. You must type DELETE exactly.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await deleteAdminParent(token, parent.id);
      await loadData();
      showResult("Parent account deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete parent.");
    } finally {
      setSaving(false);
    }
  };

  const saveChild = async () => {
    if (!editingChild) {
      return;
    }

    if (!editingChild.display_name.trim()) {
      setError("Child name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateAdminChild(token, editingChild.id, {
        parent_id: editingChild.parent_id,
        display_name: editingChild.display_name.trim(),
        login_name: editingChild.login_name?.trim() || null,
        age: editingChild.age,
        avatar_url: editingChild.avatar_url,
        selected_theme: editingChild.selected_theme || "rainbow",
        login_code: editingChild.login_code?.trim() || null,
      });

      setEditingChild(null);
      await loadData();
      showResult("Child profile updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update child.");
    } finally {
      setSaving(false);
    }
  };

  const unlinkChild = async (child: AdminChild) => {
    const confirmed = window.confirm(
      `Unlink "${child.display_name}" from ` +
        `"${child.parent_name || "the current parent"}"?\n\n` +
        "The child profile will remain in the database.",
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateAdminChild(token, child.id, {
        parent_id: null,
      });

      await loadData();
      showResult("Child profile unlinked from parent.");
    } catch (unlinkError) {
      setError(unlinkError instanceof Error ? unlinkError.message : "Unable to unlink child.");
    } finally {
      setSaving(false);
    }
  };

  const removeChild = async (child: AdminChild) => {
    const confirmed = window.confirm(
      `Delete child profile "${child.display_name}"?\n\n` +
        "Media assignments will be removed, but media files will remain.",
    );

    if (!confirmed) {
      return;
    }

    const typedConfirmation = window.prompt(
      "Type DELETE to permanently remove this child profile.",
    );

    if (typedConfirmation !== "DELETE") {
      setError("Deletion cancelled. You must type DELETE exactly.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await deleteAdminChild(token, child.id);
      await loadData();
      showResult("Child profile deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete child.");
    } finally {
      setSaving(false);
    }
  };

  const openMediaAssignment = (item: AdminMediaItem) => {
    setEditingMedia(item);
    setSelectedMediaChildIds(item.access.map((entry) => Number(entry.child_id)));
  };

  const toggleMediaChild = (childId: number) => {
    setSelectedMediaChildIds((current) =>
      current.includes(childId) ? current.filter((id) => id !== childId) : [...current, childId],
    );
  };

  const saveMediaAssignment = async () => {
    if (!editingMedia) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateAdminMediaAccess(token, editingMedia.id, selectedMediaChildIds);

      setEditingMedia(null);
      setSelectedMediaChildIds([]);
      await loadData();

      showResult(
        selectedMediaChildIds.length > 0
          ? "Media assignment updated."
          : "Media unassigned from all children.",
      );
    } catch (assignmentError) {
      setError(
        assignmentError instanceof Error
          ? assignmentError.message
          : "Unable to update media assignment.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <span>Connected administrator</span>
          <h1>{adminName}</h1>
        </div>

        <button type="button" className="admin-sign-out" onClick={onLogout}>
          Sign Out
        </button>
      </header>

      <section className="admin-dashboard-content">
        <div className="admin-dashboard-title">
          <div>
            <span className="admin-badge">SASA Admin</span>
            <h2>Family Account Management</h2>
            <p>Edit, delete, unlink and reassign parents and children.</p>
          </div>

          <button
            type="button"
            className="admin-refresh"
            onClick={loadData}
            disabled={loading || saving}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="admin-summary-grid">
          <article>
            <span>Total parents</span>
            <strong>{parents.length}</strong>
          </article>

          <article>
            <span>Total children</span>
            <strong>{children.length}</strong>
          </article>

          <article>
            <span>Administrators</span>
            <strong>{parents.filter((parent) => parent.role === "admin").length}</strong>
          </article>

          <article>
            <span>Media files</span>
            <strong>{media.length}</strong>
          </article>
        </div>

        <div className="admin-toolbar">
          <div className="admin-tabs">
            <button
              type="button"
              className={tab === "parents" ? "active" : ""}
              onClick={() => setTab("parents")}
            >
              Parents
            </button>

            <button
              type="button"
              className={tab === "children" ? "active" : ""}
              onClick={() => setTab("children")}
            >
              Children
            </button>

            <button
              type="button"
              className={tab === "media" ? "active" : ""}
              onClick={() => setTab("media")}
            >
              Media Library
            </button>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              tab === "parents"
                ? "Search parents..."
                : tab === "children"
                  ? "Search children..."
                  : "Search media..."
            }
          />
        </div>

        {success && <div className="admin-success">{success}</div>}

        {error && (
          <div className="admin-error">
            <strong>Action failed</strong>
            <p>{error}</p>

            <button type="button" onClick={() => setError("")}>
              Close
            </button>
          </div>
        )}

        {!error && loading && <div className="admin-loading">Loading administrator data...</div>}

        {!loading && tab === "parents" && (
          <div className="admin-table-card">
            <table>
              <thead>
                <tr>
                  <th>Parent</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Children</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredParents.map((parent) => (
                  <tr key={`admin-parent-${parent.id}`}>
                    <td>
                      <div className="admin-person">
                        <span>{parent.display_name.slice(0, 1).toUpperCase()}</span>

                        <strong>{parent.display_name}</strong>
                      </div>
                    </td>

                    <td>{parent.email}</td>

                    <td>
                      <span
                        className={
                          parent.role === "admin" ? "admin-role admin-role-admin" : "admin-role"
                        }
                      >
                        {parent.role}
                      </span>
                    </td>

                    <td>{parent.child_count}</td>

                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          onClick={() => setEditingParent({ ...parent })}
                          disabled={saving}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="danger"
                          disabled={saving || parent.id === loggedInAdminId}
                          onClick={() => removeParent(parent)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredParents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="admin-empty">
                      No matching parent accounts.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === "children" && (
          <div className="admin-table-card">
            <table>
              <thead>
                <tr>
                  <th>Child</th>
                  <th>Age</th>
                  <th>Login</th>
                  <th>Parent</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredChildren.map((child) => (
                  <tr key={`admin-child-${child.id}`}>
                    <td>
                      <div className="admin-person">
                        <span>⭐</span>
                        <strong>{child.display_name}</strong>
                      </div>
                    </td>

                    <td>{child.age ?? "—"}</td>
                    <td>{child.login_name || "—"}</td>

                    <td>{child.parent_name || <span className="admin-unlinked">Unlinked</span>}</td>

                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          onClick={() => setEditingChild({ ...child })}
                          disabled={saving}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={saving || child.parent_id === null}
                          onClick={() => unlinkChild(child)}
                        >
                          Unlink
                        </button>

                        <button
                          type="button"
                          className="danger"
                          disabled={saving}
                          onClick={() => removeChild(child)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredChildren.length === 0 && (
                  <tr>
                    <td colSpan={5} className="admin-empty">
                      No matching child profiles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === "media" && (
          <section className="admin-media-section">
            <div className="admin-media-toolbar">
              <div>
                <strong>NAS Media Library</strong>
                <span>{filteredMedia.length} item(s) shown</span>
              </div>

              <select
                value={mediaTypeFilter}
                onChange={(event) =>
                  setMediaTypeFilter(event.target.value as "all" | "photo" | "video")
                }
              >
                <option value="all">All media</option>
                <option value="photo">Photos</option>
                <option value="video">Videos</option>
              </select>
            </div>

            <div className="admin-media-grid">
              {filteredMedia.map((item) => {
                const mediaUrl = getApiAssetUrl(item.public_url);

                const isYouTube =
                  item.public_url.includes("youtube.com") || item.public_url.includes("youtu.be");

                return (
                  <article className="admin-media-card" key={`admin-media-${item.id}`}>
                    <div className="admin-media-preview">
                      {item.media_type === "photo" ? (
                        <img
                          src={mediaUrl}
                          alt={item.title || item.original_name || item.filename}
                          loading="lazy"
                        />
                      ) : isYouTube ? (
                        <div className="admin-youtube-preview">YouTube Video</div>
                      ) : (
                        <video controls preload="metadata" src={mediaUrl} />
                      )}
                    </div>

                    <div className="admin-media-card-body">
                      <span className="admin-media-type">{item.media_type}</span>

                      <h3>{item.title || item.original_name || item.filename}</h3>

                      <p>{item.filename}</p>

                      <div className="admin-media-access">
                        {item.access.length === 0 ? (
                          <span className="admin-unlinked">Not assigned</span>
                        ) : (
                          item.access.map((entry) => (
                            <span key={`${item.id}-${entry.child_id}`}>{entry.child_name}</span>
                          ))
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => openMediaAssignment(item)}
                        disabled={saving}
                      >
                        Assign to Children
                      </button>
                    </div>
                  </article>
                );
              })}

              {filteredMedia.length === 0 && (
                <div className="admin-media-empty">No matching media files.</div>
              )}
            </div>
          </section>
        )}
      </section>

      {editingMedia && (
        <div className="admin-modal-backdrop">
          <section className="admin-modal">
            <h3>Assign Media to Children</h3>

            <p className="admin-modal-description">
              {editingMedia.title || editingMedia.original_name || editingMedia.filename}
            </p>

            <div className="admin-child-checkbox-list">
              {children.map((child) => (
                <label key={`media-child-${child.id}`} className="admin-child-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedMediaChildIds.includes(child.id)}
                    onChange={() => toggleMediaChild(child.id)}
                  />

                  <span>
                    <strong>{child.display_name}</strong>
                    <small>{child.parent_name || "Unlinked child"}</small>
                  </span>
                </label>
              ))}

              {children.length === 0 && <p>No child profiles are available.</p>}
            </div>

            <p className="admin-modal-help">
              Clear every checkbox to unassign this media from all children. The NAS file will not
              be deleted.
            </p>

            <div className="admin-modal-actions">
              <button
                type="button"
                onClick={() => {
                  setEditingMedia(null);
                  setSelectedMediaChildIds([]);
                }}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary"
                onClick={saveMediaAssignment}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Assignment"}
              </button>
            </div>
          </section>
        </div>
      )}

      {editingParent && (
        <div className="admin-modal-backdrop">
          <section className="admin-modal">
            <h3>Edit Parent</h3>

            <label>
              Display name
              <input
                value={editingParent.display_name}
                onChange={(event) =>
                  setEditingParent({
                    ...editingParent,
                    display_name: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={editingParent.email}
                onChange={(event) =>
                  setEditingParent({
                    ...editingParent,
                    email: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Role
              <select
                value={editingParent.role}
                disabled={editingParent.id === loggedInAdminId}
                onChange={(event) =>
                  setEditingParent({
                    ...editingParent,
                    role: event.target.value as "parent" | "admin",
                  })
                }
              >
                <option value="parent">Parent</option>
                <option value="admin">Administrator</option>
              </select>
            </label>

            <div className="admin-modal-actions">
              <button type="button" onClick={() => setEditingParent(null)} disabled={saving}>
                Cancel
              </button>

              <button type="button" className="primary" onClick={saveParent} disabled={saving}>
                {saving ? "Saving..." : "Save Parent"}
              </button>
            </div>
          </section>
        </div>
      )}

      {editingChild && (
        <div className="admin-modal-backdrop">
          <section className="admin-modal">
            <h3>Edit Child</h3>

            <label>
              Display name
              <input
                value={editingChild.display_name}
                onChange={(event) =>
                  setEditingChild({
                    ...editingChild,
                    display_name: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Login name
              <input
                value={editingChild.login_name || ""}
                onChange={(event) =>
                  setEditingChild({
                    ...editingChild,
                    login_name: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Age
              <input
                type="number"
                min="0"
                max="18"
                value={editingChild.age ?? ""}
                onChange={(event) =>
                  setEditingChild({
                    ...editingChild,
                    age: event.target.value === "" ? null : Number(event.target.value),
                  })
                }
              />
            </label>

            <label>
              Parent account
              <select
                value={editingChild.parent_id ?? ""}
                onChange={(event) =>
                  setEditingChild({
                    ...editingChild,
                    parent_id: event.target.value === "" ? null : Number(event.target.value),
                  })
                }
              >
                <option value="">Unlinked</option>

                {parents.map((parent) => (
                  <option key={`parent-option-${parent.id}`} value={parent.id}>
                    {parent.display_name} — {parent.email}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Login code
              <input
                value={editingChild.login_code || ""}
                onChange={(event) =>
                  setEditingChild({
                    ...editingChild,
                    login_code: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Theme
              <select
                value={editingChild.selected_theme || "rainbow"}
                onChange={(event) =>
                  setEditingChild({
                    ...editingChild,
                    selected_theme: event.target.value,
                  })
                }
              >
                <option value="rainbow">Rainbow</option>
                <option value="space">Space</option>
                <option value="ocean">Ocean</option>
                <option value="forest">Forest</option>
              </select>
            </label>

            <div className="admin-modal-actions">
              <button type="button" onClick={() => setEditingChild(null)} disabled={saving}>
                Cancel
              </button>

              <button type="button" className="primary" onClick={saveChild} disabled={saving}>
                {saving ? "Saving..." : "Save Child"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
