/* SARA FUNCTIONAL REPAIR V5 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

/**
 * SARA_AUTH_ERROR_SURFACE_V16 — when the API is unreachable the ingress
 * answers with an HTML error page (a 502 while the backend is down, for
 * example). `response.json()` then throws a raw `SyntaxError: Unexpected
 * token '<'`, which is what parents actually saw on the login and register
 * screens instead of a usable message. This reads the body once and reports
 * the real condition. It changes no URL, method, header or payload — only
 * how a response that is not JSON is described.
 */
async function parseJsonOrExplain(response: Response, action: string) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const body = await response.text().catch(() => "");

  if (response.status >= 502 && response.status <= 504) {
    throw new Error(
      `The SARA API is not responding right now (HTTP ${response.status}). ` +
        `${action} is unavailable until the API is back.`,
    );
  }

  throw new Error(
    `The SARA API returned an unexpected response (HTTP ${response.status}) ` +
      `while ${action.toLowerCase()}. ${body.slice(0, 120)}`.trim(),
  );
}

export type ApiHealth = {
  status: string;
  service: string;
  uploads?: string;
};

export type ParentUser = {
  id: number;
  display_name: string;
  email: string;
};

export type ParentLoginResponse = {
  token: string;
  user: ParentUser;
};

export async function getApiHealth(): Promise<ApiHealth> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`API health check failed: ${response.status}`);
  }

  return parseJsonOrExplain(response, "Checking the API");
}

export async function registerParent(
  name: string,
  email: string,
  password: string,
): Promise<ParentLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      displayName: name,
      email,
      password,
    }),
  });

  const data = await parseJsonOrExplain(response, "Creating your account");

  if (!response.ok) {
    throw new Error(data.error || "Parent registration failed.");
  }

  return loginParent(email, password);
}

export async function loginParent(email: string, password: string): Promise<ParentLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await parseJsonOrExplain(response, "Signing in");

  if (!response.ok) {
    throw new Error(data.error || "Parent login failed.");
  }

  return data;
}

export async function getCurrentUser(token: string): Promise<{
  sub: number;
  role: string;
  name: string;
}> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // A 5xx means the API is down, not that the saved login expired —
    // telling a parent to sign in again would be wrong and would throw away
    // a perfectly valid token.
    if (response.status >= 500) {
      throw new Error(
        `The SARA API is not responding right now (HTTP ${response.status}). ` +
          `Your saved login was kept.`,
      );
    }

    throw new Error("Saved login is no longer valid.");
  }

  return parseJsonOrExplain(response, "Checking your login");
}

export type DatabaseChild = {
  // The backend's numeric child id is stringified below (getChildren,
  // createChild) so every consumer compares/stores it the same way as
  // localStorage-keyed activity/PIN/screen-time state (all string-keyed).
  // This type previously said `number` while the real value was always a
  // string — a stale annotation that never matched what these functions
  // actually returned.
  id: string;
  display_name: string;
  login_name: string | null;
  age: number | null;
  avatar_url: string | null;
  selected_theme: string | null;
  login_code: string | null;
  has_pin: boolean;
  created_at: string;
};

export async function getChildren(token: string): Promise<DatabaseChild[]> {
  const response = await fetch(`${API_BASE_URL}/parent/children`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseJsonOrExplain(response, "Loading child profiles");

  if (!response.ok) {
    throw new Error(data.error || "Unable to load child profiles.");
  }

  const children = Array.isArray(data.children)
    ? (data.children as Array<{
        id: number;
        display_name: string;
        child_login_id: string | null;
        age: number | null;
        avatar_url: string | null;
        selected_theme: string | null;
        created_at: string;
        has_pin?: boolean;
        pin_set?: boolean;
      }>)
    : [];

  return children.map((child) => ({
    id: String(child.id),
    display_name: child.display_name,
    login_name: child.child_login_id ?? null,
    age: child.age ?? null,
    avatar_url: child.avatar_url ?? null,
    selected_theme: child.selected_theme ?? null,
    login_code: child.child_login_id ?? null,
    // SASA_CHILD_PIN_V20 — GET /parent/children now returns an explicit
    // has_pin boolean, derived server-side from whether a usable bcrypt hash
    // exists (the hash itself is never sent). The old fallback guessed from
    // child_login_id, which every child has, so every child looked
    // PIN-protected and a child with no PIN could never be opened at all.
    // With no flag from the API the honest answer is "no PIN known" — the
    // PIN-less path is itself authenticated (see selectChildProfile), so
    // defaulting to false does not hand anything to an anonymous caller.
    has_pin:
      typeof child.has_pin === "boolean"
        ? child.has_pin
        : typeof child.pin_set === "boolean"
          ? child.pin_set
          : false,
    created_at: child.created_at,
  }));
}

/**
 * SASA_CHILD_PIN_V20 — open a child profile that has no PIN.
 *
 * This deliberately goes through the backend on the parent's own bearer token
 * rather than letting the client decide locally: the server re-checks that the
 * caller is the parent who created the profile, and refuses (409) if the child
 * actually does have a PIN, so a tampered client cannot skip the PIN prompt.
 */
export async function selectChildProfile(
  token: string,
  childId: string,
): Promise<ChildLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/parent/children/${childId}/select`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await parseJsonOrExplain(response, "Opening the child profile");

  if (!response.ok) {
    throw new Error(data.error || "Unable to open this child profile.");
  }

  return data;
}

export type CreateChildInput = {
  display_name: string;
  login_name: string;
  age: number | null;
  pin?: string;
};

export async function createChild(token: string, input: CreateChildInput): Promise<DatabaseChild> {
  const response = await fetch(`${API_BASE_URL}/parent/children`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      displayName: input.display_name,
      childLoginId: input.login_name,
      age: input.age,
      pin: input.pin,
      selectedTheme: "rainbow",
    }),
  });

  const data = await parseJsonOrExplain(response, "Creating the child profile");

  if (!response.ok) {
    throw new Error(data.error || "Unable to create child profile.");
  }

  const child = data.child;

  return {
    id: String(child.id),
    display_name: child.display_name,
    login_name: child.child_login_id ?? null,
    age: child.age ?? null,
    avatar_url: child.avatar_url ?? null,
    selected_theme: child.selected_theme ?? null,
    login_code: child.child_login_id ?? null,
    has_pin: Boolean(input.pin),
    created_at: child.created_at ?? new Date().toISOString(),
  };
}

export type ChildLoginResponse = {
  status: string;
  child: {
    id: number;
    userId: number;
    name: string;
    avatarUrl: string | null;
    age: number | null;
    theme: string;
    childLoginId: string;
    parentId: number | null;
  };
};

export async function loginChild(loginName: string, pin: string): Promise<ChildLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/child/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      childLoginId: loginName,
      pin,
    }),
  });

  const data = await parseJsonOrExplain(response, "Checking the child PIN");

  if (!response.ok) {
    throw new Error(data.error || "Child PIN verification failed.");
  }

  return data;
}

// SARA_KIDS_PIN_V7 — the V5 pass guessed `PUT /parent/children/:id` here with
// no evidence it exists on the real backend, which is why "PIN reset" was
// still broken after that fix. Git archaeology gives a stronger answer:
// commit 821a313 ("Add parent child management, PIN protection and profile
// photo fixes") shipped a real, working-shaped call to
// `POST /auth/set-kid-pin` with body `{ child_id, pin }` — the exact same
// `/auth/*` namespace that still backs the currently-working
// register/login/me calls above. Commit eb19912 ("fix frontend API routes
// and response mappings") later rewrote every other route to match the real
// backend (`/parent/children`, `childLoginId`, `/child/login`, ...) and, in
// that SAME pass, gave up on this one and stubbed it out — the strongest
// signal in the repo's history that this was a deliberate "couldn't get this
// endpoint working" call, not an accidental omission.
//
// Restoring the historically-real request shape here rather than inventing
// a new one. This sandbox has no network access to confirm the endpoint is
// still live on the current backend — if it 404s/500s, the caller's
// catch block already surfaces that error message rather than a false
// success (see DatabaseProfileSelection.saveManagedPin and
// ParentDashboard.saveChildPin). Treat this as BACKEND REQUIRED /
// needs-manual-verification until confirmed against the live API.
export async function setChildPin(
  token: string,
  childId: string | number,
  pin: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/set-kid-pin`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // SASA_UPLOAD_UUID_FIX_V18 — `profiles.id` is a uuid, so Number() here
      // produced NaN, which JSON.stringify writes as null. Sent unchanged.
      child_id: childId,
      pin,
    }),
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new Error(
      data?.error ||
        "Unable to update child PIN. This backend may not support resetting an existing child PIN yet.",
    );
  }
}

export type AccountRole = "parent" | "admin";

export type AdminParent = {
  id: number;
  display_name: string;
  email: string;
  role: AccountRole;
  avatar_url: string | null;
  created_at: string;
  child_count: number;
};

export type AdminChild = {
  id: number;
  // Nullable: AdminDashboard already treats an "Unlinked" child (no parent
  // account) as a real, valid state (see the parent_id === null check and
  // the "Unlinked" <option> in its edit form).
  parent_id: number | null;
  display_name: string;
  login_name: string | null;
  age: number | null;
  avatar_url: string | null;
  selected_theme: string | null;
  login_code: string | null;
  created_at: string;
  parent_name: string | null;
  parent_email: string | null;
};

async function readJsonResponse(response: Response) {
  const data = await parseJsonOrExplain(response, "Talking to the SARA API");

  if (!response.ok) {
    throw new Error(data.error || `API request failed (${response.status}).`);
  }

  return data;
}

export async function getAdminParents(token: string): Promise<AdminParent[]> {
  const response = await fetch(`${API_BASE_URL}/admin/parents`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await readJsonResponse(response);
  return Array.isArray(data) ? data : [];
}

export async function getAdminChildren(token: string): Promise<AdminChild[]> {
  const response = await fetch(`${API_BASE_URL}/admin/children`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await readJsonResponse(response);
  return Array.isArray(data) ? data : [];
}

export type AdminParentUpdate = {
  display_name?: string;
  email?: string;
  role?: AccountRole;
  avatar_url?: string | null;
};

export type AdminChildUpdate = {
  parent_id?: number | null;
  display_name?: string;
  login_name?: string | null;
  age?: number | null;
  avatar_url?: string | null;
  selected_theme?: string;
  login_code?: string | null;
};

export async function updateAdminParent(
  token: string,
  parentId: number,
  input: AdminParentUpdate,
): Promise<AdminParent> {
  const response = await fetch(`${API_BASE_URL}/admin/parents/${parentId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return readJsonResponse(response);
}

export async function deleteAdminParent(token: string, parentId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/parents/${parentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      confirmation: "DELETE",
    }),
  });

  await readJsonResponse(response);
}

export async function updateAdminChild(
  token: string,
  childId: number,
  input: AdminChildUpdate,
): Promise<AdminChild> {
  const response = await fetch(`${API_BASE_URL}/admin/children/${childId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return readJsonResponse(response);
}

export async function deleteAdminChild(token: string, childId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/children/${childId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      confirmation: "DELETE",
    }),
  });

  await readJsonResponse(response);
}

export type AdminMediaAccess = {
  child_id: number;
  child_name: string;
  parent_id: number | null;
};

export type AdminMediaItem = {
  id: number;
  filename: string;
  original_name: string | null;
  media_type: "photo" | "video";
  storage_path: string;
  public_url: string;
  visibility: string;
  title: string | null;
  description: string | null;
  category: string | null;
  uploaded_by: string | null;
  uploaded_by_parent_id: number | null;
  created_at: string;
  access: AdminMediaAccess[];
};

export async function getAdminMediaLibrary(token: string): Promise<AdminMediaItem[]> {
  const response = await fetch(`${API_BASE_URL}/admin/media-library`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await readJsonResponse(response);
  return Array.isArray(data) ? data : [];
}

export async function updateAdminMediaAccess(
  token: string,
  mediaId: number,
  childIds: number[],
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/media-library/${mediaId}/access`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      child_ids: childIds,
    }),
  });

  await readJsonResponse(response);
}

export { API_BASE_URL };

export type ParentMediaInput = {
  title: string;
  category: string;
  childIds: string[];
};

async function readApiResponse(response: Response) {
  return parseJsonOrExplain(response, "Talking to the SARA API");
}

/* SASA_UPLOAD_UUID_FIX_V18
 *
 * Photo and video uploads both failed here, and the cause was this function,
 * not the form or the backend. `child_profile_id` in `media_child_access` is a
 * `uuid NOT NULL` referencing `profiles(id)`, and `DatabaseChild.id` already
 * carries that uuid as a string. The previous line ran the ids through
 * `.map(Number)`, which turns a uuid into `NaN`, and `JSON.stringify` then
 * serialises `NaN` as `null`. The backend received `[null]`, tried to insert
 * it, and Postgres rejected the row:
 *
 *   null value in column "child_profile_id" of relation "media_child_access"
 *   violates not-null constraint
 *
 * The file itself uploaded fine every time — the assignment insert is what
 * failed, so the whole request errored and the parent saw a failed upload.
 * The ids are sent unchanged now, exactly like updateMediaChildren already
 * does with `child_ids`. No URL, method, header or field name changed.
 */
export const ALLOWED_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

// Client-side guard only, and deliberately well under the ingress's
// `proxy-body-size: 500m` so an oversized file is rejected instantly instead
// of being uploaded for minutes and then refused. The backend's own limit
// still applies and its error is surfaced verbatim.
export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Returns an error message, or null when the file is acceptable. */
export function validateUploadFile(file: File): string | null {
  if (file.size === 0) {
    return `"${file.name}" is empty (0 bytes). Choose a different file.`;
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return (
      `"${file.name}" is ${formatBytes(file.size)}, over the ` +
      `${formatBytes(MAX_UPLOAD_BYTES)} limit. Choose a smaller file.`
    );
  }

  if (!(ALLOWED_UPLOAD_MIME_TYPES as readonly string[]).includes(file.type)) {
    return (
      `"${file.name}" is not a supported format` +
      `${file.type ? ` (${file.type})` : ""}. ` +
      `Photos: JPG, PNG, WEBP, GIF. Videos: MP4, WEBM, MOV.`
    );
  }

  return null;
}

export async function uploadParentVideo(
  token: string,
  file: File,
  input: ParentMediaInput,
  onProgress?: (percent: number) => void,
) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("title", input.title);
  formData.append("category", input.category);
  // Sent as-is: these are `profiles.id` uuids, not numbers. See the block
  // comment above — coercing them was the upload bug.
  formData.append("childProfileIds", JSON.stringify(input.childIds));

  // XMLHttpRequest rather than fetch purely because fetch cannot report
  // upload progress. Same URL, same POST, same Authorization header, same
  // multipart field names.
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${API_BASE_URL}/media/upload`);
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
      const contentType = xhr.getResponseHeader("content-type") || "";
      let data: Record<string, unknown> | null = null;

      if (contentType.includes("application/json")) {
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          data = null;
        }
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve(data ?? {});
        return;
      }

      // Surface what the server actually said — never a generic success.
      const serverError = typeof data?.error === "string" ? data.error : "";

      if (serverError) {
        reject(new Error(serverError));
        return;
      }

      if (xhr.status === 401 || xhr.status === 403) {
        reject(new Error("Your parent session has expired. Sign in again to upload media."));
        return;
      }

      if (xhr.status === 413) {
        reject(new Error(`"${file.name}" was rejected by the server as too large.`));
        return;
      }

      if (xhr.status >= 502 && xhr.status <= 504) {
        reject(
          new Error(
            `The SARA API is not responding right now (HTTP ${xhr.status}). Try again shortly.`,
          ),
        );
        return;
      }

      reject(
        new Error(`Upload failed (HTTP ${xhr.status}). ${xhr.responseText.slice(0, 160)}`.trim()),
      );
    };

    xhr.onerror = () => {
      reject(new Error("Upload failed: the network request could not be completed."));
    };

    xhr.onabort = () => {
      reject(new Error("Upload cancelled."));
    };

    xhr.send(formData);
  });
}

export async function addParentYoutubeVideo(
  _token: string,
  _input: ParentMediaInput & {
    url: string;
    description?: string;
  },
) {
  throw new Error("Adding YouTube links is not supported by the backend yet.");
}

export async function deleteChild(token: string, childId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/parent/children/${childId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    return;
  }

  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json") ? await response.json() : null;

  throw new Error(data?.error || "Unable to delete child profile.");
}

export type AssignedChildMedia = {
  id: number;
  filename: string | null;
  original_name: string | null;
  media_type: string;
  storage_path: string | null;
  public_url: string | null;
  // Optional — mirrors ParentMediaItem.thumbnail_url from the sibling
  // /media/manage endpoint on the same media table. Not every deployment of
  // the child-media endpoint returns it, so consumers must fall back
  // gracefully when it's absent.
  thumbnail_url?: string | null;
  visibility: string | null;
  title: string | null;
  description: string | null;
  category: string | null;
  created_at: string;
};

export async function getChildAssignedMedia(
  token: string,
  childId: string | number,
): Promise<AssignedChildMedia[]> {
  const response = await fetch(`${API_BASE_URL}/child/${childId}/media`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseJsonOrExplain(response, "Loading the child's media");

  if (!response.ok) {
    throw new Error(data.error || "Unable to load child media.");
  }

  return Array.isArray(data.media) ? data.media : [];
}

export function getApiAssetUrl(value: string | null | undefined): string {
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
    return value;
  }

  const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, "");

  return `${apiOrigin}${value.startsWith("/") ? value : `/${value}`}`;
}

export type ParentMediaItem = {
  id: string;
  filename: string | null;
  original_name: string | null;
  media_type: "photo" | "video";
  storage_path: string | null;
  public_url: string | null;
  visibility: string | null;
  title: string | null;
  description: string | null;
  category: string | null;
  created_at: string;
  access: Array<{
    child_id: string;
    name: string;
  }>;
};

export async function getParentMedia(token: string): Promise<ParentMediaItem[]> {
  const response = await fetch(`${API_BASE_URL}/media/manage`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await readApiResponse(response);

  if (!response.ok) {
    throw new Error(data.error || "Unable to load parent media.");
  }

  const media = Array.isArray(data.media)
    ? (data.media as Array<{
        id: string;
        owner_user_id: string;
        media_type: "photo" | "video";
        title: string | null;
        description: string | null;
        category: string | null;
        public_url: string | null;
        thumbnail_url: string | null;
        original_filename: string | null;
        mime_type: string | null;
        size_bytes: number | null;
        created_at: string;
        child_access: Array<{
          child_profile_id: string;
          display_name: string;
        }>;
      }>)
    : [];

  return media.map((item) => ({
    ...item,
    filename: item.original_filename ?? null,
    original_name: item.original_filename ?? null,
    storage_path: item.public_url ?? null,
    visibility: "assigned",
    access: Array.isArray(item.child_access)
      ? item.child_access.map((entry) => ({
          child_id: String(entry.child_profile_id),
          name: entry.display_name,
        }))
      : [],
  }));
}

export async function updateParentMedia(
  token: string,
  mediaId: string,
  input: {
    title: string;
    category: string;
    description?: string;
  },
): Promise<ParentMediaItem> {
  const response = await fetch(`${API_BASE_URL}/media/${mediaId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: input.title,
      category: input.category,
      description: input.description || "",
    }),
  });

  const data = await readApiResponse(response);

  if (!response.ok) {
    throw new Error(data.error || "Unable to update media.");
  }

  return data.media ?? data;
}

export async function updateParentMediaAccess(
  token: string,
  mediaId: string,
  childIds: string[],
): Promise<void> {
  const mediaItems = await getParentMedia(token);
  const media = mediaItems.find((item) => item.id === mediaId);

  const currentIds = media ? media.access.map((entry) => String(entry.child_id)) : [];

  const idsToAdd = childIds.filter((id) => !currentIds.includes(id));
  const idsToRemove = currentIds.filter((id) => !childIds.includes(id));

  for (const childProfileId of idsToAdd) {
    const response = await fetch(`${API_BASE_URL}/media/${mediaId}/access`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        childProfileId,
        noLimit: true,
      }),
    });

    await readJsonResponse(response);
  }

  for (const childProfileId of idsToRemove) {
    const response = await fetch(`${API_BASE_URL}/media/${mediaId}/access/${childProfileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await readJsonResponse(response);
  }
}

export async function deleteParentMedia(token: string, mediaId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/media/${mediaId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await readApiResponse(response);

  if (!response.ok) {
    throw new Error(data.error || "Unable to delete media.");
  }
}
