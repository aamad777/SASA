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
  id: number;
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
      }>)
    : [];

  return children.map((child) => ({
    id: Number(child.id),
    display_name: child.display_name,
    login_name: child.child_login_id ?? null,
    age: child.age ?? null,
    avatar_url: child.avatar_url ?? null,
    selected_theme: child.selected_theme ?? null,
    login_code: child.child_login_id ?? null,
    has_pin: Boolean(child.child_login_id),
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
    id: Number(child.id),
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

export async function setChildPin(_token: string, _childId: number, _pin: string): Promise<void> {
  throw new Error("Updating an existing child PIN is not supported by the backend yet.");
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
  parent_id: number;
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
  childIds: number[];
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
  formData.append("child_ids", JSON.stringify(input.childIds));

  const response = await fetch(`${API_BASE_URL}/parent/media/upload`, {
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
  token: string,
  input: ParentMediaInput & {
    url: string;
    description?: string;
  },
) {
  const response = await fetch(`${API_BASE_URL}/parent/media/youtube`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: input.url,
      title: input.title,
      description: input.description || "",
      category: input.category,
      child_ids: input.childIds,
    }),
  });

  const data = await readApiResponse(response);

  if (!response.ok) {
    throw new Error(data.error || "Unable to add YouTube video.");
  }

  return data;
}

export async function deleteChild(token: string, childId: number): Promise<void> {
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
  visibility: string | null;
  title: string | null;
  description: string | null;
  category: string | null;
  created_at: string;
};

export async function getChildAssignedMedia(
  token: string,
  childId: number,
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

  return Array.isArray(data) ? data : [];
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
  id: number;
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
    child_id: number;
    name: string;
  }>;
};

export async function getParentMedia(token: string): Promise<ParentMediaItem[]> {
  const response = await fetch(`${API_BASE_URL}/media`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await readApiResponse(response);

  if (!response.ok) {
    throw new Error(data.error || "Unable to load parent media.");
  }

  return Array.isArray(data) ? data : [];
}

export async function updateParentMedia(
  token: string,
  mediaId: number,
  input: {
    title: string;
    category: string;
    description?: string;
  },
): Promise<ParentMediaItem> {
  const response = await fetch(`${API_BASE_URL}/media/${mediaId}`, {
    method: "PUT",
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

  return data;
}

export async function updateParentMediaAccess(
  token: string,
  mediaId: number,
  childIds: number[],
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/media/${mediaId}/access`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      child_ids: childIds,
    }),
  });

  const data = await readApiResponse(response);

  if (!response.ok) {
    throw new Error(data.error || "Unable to update media access.");
  }
}

export async function deleteParentMedia(token: string, mediaId: number): Promise<void> {
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
