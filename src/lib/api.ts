/* SARA FUNCTIONAL REPAIR V5 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
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

  return response.json();
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

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const body = await response.text();

    throw new Error(
      `Registration API returned invalid content ` + `(${response.status}): ${body.slice(0, 100)}`,
    );
  }

  const data = await response.json();

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

  const data = await response.json();

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
    throw new Error("Saved login is no longer valid.");
  }

  return response.json();
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

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(`Children API returned invalid content: ${response.status}`);
  }

  const data = await response.json();

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
    // A login name is required for every child, so it is not a valid stand-in
    // for "has a PIN" — that made every child look PIN-protected even when no
    // PIN was ever set, locking kids out of their own profile. Prefer the
    // backend's own has_pin/pin_set flag when it's present; only fall back to
    // the login-name heuristic if the API doesn't send one.
    has_pin:
      typeof child.has_pin === "boolean"
        ? child.has_pin
        : typeof child.pin_set === "boolean"
          ? child.pin_set
          : Boolean(child.child_login_id),
    created_at: child.created_at,
  }));
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

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const body = await response.text();

    throw new Error(
      `Child API returned invalid content ` + `(${response.status}): ${body.slice(0, 100)}`,
    );
  }

  const data = await response.json();

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

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const body = await response.text();

    throw new Error(
      `Child login returned invalid content ` + `(${response.status}): ${body.slice(0, 100)}`,
    );
  }

  const data = await response.json();

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
      child_id: Number(childId),
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
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const body = await response.text();

    throw new Error(`API returned invalid content (${response.status}): ` + body.slice(0, 100));
  }

  const data = await response.json();

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
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const body = await response.text();

  throw new Error(`API returned invalid content (${response.status}): ` + body.slice(0, 120));
}

export async function uploadParentVideo(token: string, file: File, input: ParentMediaInput) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("title", input.title);
  formData.append("category", input.category);
  // childIds are the frontend's stringified DatabaseChild.id (see api.ts's
  // DatabaseChild type) — convert back to numbers for the wire payload,
  // matching the real numeric child id the backend returns/expects
  // elsewhere (e.g. setChildPin's child_id).
  formData.append("childProfileIds", JSON.stringify(input.childIds.map(Number)));

  const response = await fetch(`${API_BASE_URL}/media/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await readApiResponse(response);

  if (!response.ok) {
    throw new Error(data.error || "Video upload failed.");
  }

  return data;
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

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const body = await response.text();

    throw new Error(
      `Child media API returned invalid content ` + `(${response.status}): ${body.slice(0, 120)}`,
    );
  }

  const data = await response.json();

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
