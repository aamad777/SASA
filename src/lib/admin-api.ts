/* SASA_ADMIN_UI_V25 — typed client for the administrator API.
 *
 * Every call here is authorised server-side; nothing in this file is a
 * security boundary. Hiding the admin navigation from non-admins is a
 * courtesy, and typing /admin by hand still gets a 403 from the API.
 */
import { API_BASE_URL, parseJsonOrExplainPublic } from "./api";

export type AdminOverview = {
  stats: {
    parentsActive: number;
    parentsSuspended: number;
    children: number;
    publicVideosPublished: number;
    publicPhotosPublished: number;
    publicDrafts: number;
    privateFamilyMedia: number;
  };
  recentUploads: Array<{
    id: string;
    title: string;
    media_type: string;
    visibility: string;
    publication_status: string;
    created_at: string;
  }>;
  recentActions: Array<{
    id: string;
    actor_email: string | null;
    action: string;
    target_type: string | null;
    target_id: string | null;
    created_at: string;
  }>;
};

export type AdminParent = {
  id: string;
  email: string;
  status: "active" | "suspended";
  created_at: string;
  suspended_at: string | null;
  child_count: number;
  media_count: number;
};

export type AdminParentDetail = {
  parent: AdminParent & { role: string; tokens_valid_after: string | null };
  children: Array<{
    id: string;
    display_name: string;
    age: number | null;
    child_login_id: string | null;
    avatar_url: string | null;
    created_at: string;
    has_pin: boolean;
  }>;
  media: { count: number; bytes: number };
  audit: Array<{
    id: string;
    actor_email: string | null;
    action: string;
    created_at: string;
    details: Record<string, unknown>;
  }>;
};

export type PublicMediaItem = {
  id: string;
  media_type: "video" | "photo";
  title: string;
  description: string | null;
  category: string | null;
  public_url: string | null;
  thumbnail_url: string | null;
  publication_status: "draft" | "published";
  is_featured: boolean;
  size_bytes: number | null;
  created_at: string;
  /* SASA_ASYNC_THUMBNAILS_V27 — a video's frame is extracted by a worker after
   * the upload responds, so the admin needs the job state, not just the URL.
   * Optional: an older backend answers without these fields. */
  thumbnail_status?: "pending" | "processing" | "ready" | "failed";
  thumbnail_attempts?: number;
  thumbnail_error?: string | null;
};

export type AuditEntry = {
  id: string;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

async function adminFetch<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers || {}),
    },
  });

  const data = await parseJsonOrExplainPublic(response, "Talking to the admin API");

  if (!response.ok) {
    throw new Error(
      (data as { error?: string }).error || `Request failed (HTTP ${response.status}).`,
    );
  }

  return data as T;
}

export function getAdminOverview(token: string) {
  return adminFetch<AdminOverview>(token, "/admin/overview");
}

export function getAdminParents(
  token: string,
  options: { search?: string; status?: string; limit?: number; offset?: number } = {},
) {
  const params = new URLSearchParams();

  if (options.search) params.set("search", options.search);
  if (options.status) params.set("status", options.status);
  params.set("limit", String(options.limit ?? 20));
  params.set("offset", String(options.offset ?? 0));

  return adminFetch<{ total: number; parents: AdminParent[]; limit: number; offset: number }>(
    token,
    `/admin/parents?${params.toString()}`,
  );
}

export function getAdminParent(token: string, id: string) {
  return adminFetch<AdminParentDetail>(token, `/admin/parents/${id}`);
}

export function setParentStatus(token: string, id: string, status: "active" | "suspended") {
  return adminFetch<{ accountStatus: string }>(token, `/admin/parents/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

export function revokeParentSessions(token: string, id: string) {
  return adminFetch<{ status: string }>(token, `/admin/parents/${id}/revoke-sessions`, {
    method: "POST",
  });
}

export function getAuditLog(token: string, options: { limit?: number; offset?: number } = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(options.limit ?? 25));
  params.set("offset", String(options.offset ?? 0));

  return adminFetch<{ total: number; entries: AuditEntry[]; limit: number; offset: number }>(
    token,
    `/admin/audit?${params.toString()}`,
  );
}

export function getAdminPublicMedia(
  token: string,
  options: { limit?: number; offset?: number } = {},
) {
  const params = new URLSearchParams();
  params.set("limit", String(options.limit ?? 24));
  params.set("offset", String(options.offset ?? 0));

  return adminFetch<{ total: number; media: PublicMediaItem[]; limit: number; offset: number }>(
    token,
    `/admin/public-media?${params.toString()}`,
  );
}

/** Upload with real progress. fetch cannot report it, so XHR is used here too. */
export function uploadPublicMedia(
  token: string,
  file: File,
  input: { title: string; description?: string; category?: string },
  onProgress?: (percent: number) => void,
): Promise<{ media: PublicMediaItem }> {
  const form = new FormData();

  form.append("file", file);
  form.append("title", input.title);
  if (input.description) form.append("description", input.description);
  if (input.category) form.append("category", input.category);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${API_BASE_URL}/admin/public-media`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    if (onProgress) {
      onProgress(0);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
        }
      };
    }

    xhr.onload = () => {
      let data: { media?: PublicMediaItem; message?: string; error?: string } = {};

      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = {};
      }

      if (xhr.status >= 200 && xhr.status < 300 && data.media) {
        onProgress?.(100);
        resolve({ media: data.media });
        return;
      }

      // Never report an upload as successful on anything but a real 2xx.
      reject(new Error(data.message || data.error || `Upload failed (HTTP ${xhr.status}).`));
    };

    xhr.onerror = () => reject(new Error("Upload failed: the network request could not complete."));
    xhr.send(form);
  });
}

/* SASA_RESUMABLE_UPLOADS_V28 — chunked upload for large videos.
 *
 * Cloudflare refuses a proxied body over 100MB outright, so a single-request
 * upload could never reach the 500MB application limit through the real
 * portal. Each chunk is well under the cap, and because the server records
 * which chunks it holds, an interrupted upload continues instead of starting
 * again. The simple single-request path above stays in use for small files.
 */

export type UploadSession = {
  id: string;
  status?: string;
  chunkSize: number;
  totalChunks: number;
  totalBytes: number;
  receivedChunks: number[];
  mediaId?: string | null;
};

export async function createUploadSession(
  token: string,
  input: {
    filename: string;
    mimeType: string;
    totalBytes: number;
    title?: string;
    category?: string;
  },
): Promise<UploadSession> {
  const data = await adminFetch<{ session: UploadSession }>(token, "/admin/uploads/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.session;
}

export async function getUploadSession(token: string, id: string): Promise<UploadSession> {
  const data = await adminFetch<{ session: UploadSession }>(token, `/admin/uploads/session/${id}`);
  return data.session;
}

export function abortUploadSession(token: string, id: string) {
  return adminFetch<{ status: string }>(token, `/admin/uploads/session/${id}`, {
    method: "DELETE",
  });
}

/** Sends one chunk as a raw body. Rejects on anything but a 2xx. */
async function putChunk(token: string, id: string, index: number, blob: Blob) {
  const response = await fetch(`${API_BASE_URL}/admin/uploads/session/${id}/chunk/${index}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
    },
    body: blob,
  });

  if (!response.ok) {
    let message = `Chunk ${index} failed (HTTP ${response.status}).`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      /* Non-JSON error page; the status line is all we have. */
    }
    throw new Error(message);
  }
}

/**
 * Uploads a video in chunks, resuming an existing session when one is given.
 *
 * Each chunk is retried a few times before the whole upload gives up, because
 * a single dropped connection should not cost the chunks already stored. The
 * session id is handed back through onSession so the caller can resume later
 * even after the page is closed.
 */
export async function uploadVideoResumable(
  token: string,
  file: File,
  input: { title: string; description?: string; category?: string },
  options: {
    onProgress?: (percent: number) => void;
    onSession?: (session: UploadSession) => void;
    resumeSessionId?: string;
    signal?: AbortSignal;
    retriesPerChunk?: number;
  } = {},
): Promise<{ media: PublicMediaItem }> {
  const { onProgress, onSession, signal, retriesPerChunk = 3 } = options;

  const session = options.resumeSessionId
    ? await getUploadSession(token, options.resumeSessionId)
    : await createUploadSession(token, {
        filename: file.name,
        mimeType: file.type || "video/mp4",
        totalBytes: file.size,
        title: input.title,
        category: input.category,
      });

  onSession?.(session);

  // The server is the authority on what it already holds; a resume never
  // trusts the browser's memory of how far it got.
  const held = new Set(session.receivedChunks || []);
  const report = () =>
    onProgress?.(Math.min(99, Math.round((held.size / session.totalChunks) * 100)));

  report();

  for (let index = 0; index < session.totalChunks; index += 1) {
    if (signal?.aborted) throw new Error("Upload cancelled.");
    if (held.has(index)) continue;

    const start = index * session.chunkSize;
    const blob = file.slice(start, Math.min(start + session.chunkSize, file.size));

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < retriesPerChunk; attempt += 1) {
      try {
        await putChunk(token, session.id, index, blob);
        lastError = null;
        break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Chunk failed.");
        // Linear backoff; a flaky connection usually recovers within seconds.
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    if (lastError) throw lastError;

    held.add(index);
    report();
  }

  const data = await adminFetch<{ media: PublicMediaItem }>(
    token,
    `/admin/uploads/session/${session.id}/complete`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: input.title,
        description: input.description,
        category: input.category,
      }),
    },
  );

  onProgress?.(100);
  return data;
}

export function updatePublicMedia(
  token: string,
  id: string,
  patch: Partial<Pick<PublicMediaItem, "title" | "description" | "category" | "is_featured">> & {
    publication_status?: "draft" | "published";
  },
) {
  return adminFetch<{ media: PublicMediaItem }>(token, `/admin/public-media/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function deletePublicMedia(token: string, id: string) {
  return adminFetch<{ status: string }>(token, `/admin/public-media/${id}`, { method: "DELETE" });
}

/* SASA_ASYNC_THUMBNAILS_V27 — re-queues a failed thumbnail. Returns as soon as
 * the row is marked pending; the worker does the extraction, so the admin sees
 * "Processing" rather than a request that hangs on ffmpeg. */
export function retryThumbnail(token: string, id: string) {
  return adminFetch<{ media: PublicMediaItem }>(
    token,
    `/admin/public-media/${id}/thumbnail/retry`,
    { method: "POST" },
  );
}
