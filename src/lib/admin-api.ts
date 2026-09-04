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
