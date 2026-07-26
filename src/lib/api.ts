const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://192.168.0.113:30081/api';

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
  const response = await fetch(
    `${API_BASE_URL}/health`,
  );

  if (!response.ok) {
    throw new Error(
      `API health check failed: ${response.status}`,
    );
  }

  return response.json();
}

export async function registerParent(
  name: string,
  email: string,
  password: string,
): Promise<ParentLoginResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/signup`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        display_name: name,
        email,
        password,
      }),
    },
  );

  const contentType =
    response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const body = await response.text();

    throw new Error(
      `Registration API returned invalid content ` +
      `(${response.status}): ${body.slice(0, 100)}`,
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || 'Parent registration failed.',
    );
  }

  return loginParent(email, password);
}

export async function loginParent(
  email: string,
  password: string,
): Promise<ParentLoginResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || 'Parent login failed.',
    );
  }

  return data;
}

export async function getCurrentUser(
  token: string,
): Promise<{
  sub: number;
  role: string;
  name: string;
}> {
  const response = await fetch(
    `${API_BASE_URL}/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Saved login is no longer valid.');
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

export async function getChildren(
  token: string,
): Promise<DatabaseChild[]> {
  const response = await fetch(
    `${API_BASE_URL}/children`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const contentType =
    response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new Error(
      `Children API returned invalid content: ${response.status}`,
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || 'Unable to load child profiles.',
    );
  }

  return Array.isArray(data) ? data : [];
}



export type CreateChildInput = {
  display_name: string;
  login_name: string;
  age: number | null;
  pin?: string;
};

export async function createChild(
  token: string,
  input: CreateChildInput,
): Promise<DatabaseChild> {
  const response = await fetch(
    `${API_BASE_URL}/children`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    },
  );

  const contentType =
    response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const body = await response.text();

    throw new Error(
      `Child API returned invalid content ` +
      `(${response.status}): ${body.slice(0, 100)}`,
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || 'Unable to create child profile.',
    );
  }

  return data;
}


export type ChildLoginResponse = {
  token: string;
  child: {
    id: number;
    display_name: string;
    login_name: string;
    parent_id: number;
  };
};

export async function loginChild(
  loginName: string,
  pin: string,
): Promise<ChildLoginResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/kid-login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        login_name: loginName,
        pin,
      }),
    },
  );

  const contentType =
    response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const body = await response.text();

    throw new Error(
      `Child login returned invalid content ` +
      `(${response.status}): ${body.slice(0, 100)}`,
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || 'Child PIN verification failed.',
    );
  }

  return data;
}


export async function setChildPin(
  token: string,
  childId: number,
  pin: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/auth/set-kid-pin`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        child_id: childId,
        pin,
      }),
    },
  );

  const contentType =
    response.headers.get('content-type') || '';

  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(
      data?.error || 'Unable to update child PIN.',
    );
  }
}

export type AccountRole = 'parent' | 'admin';

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
  const contentType =
    response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const body = await response.text();

    throw new Error(
      `API returned invalid content (${response.status}): ` +
      body.slice(0, 100),
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || `API request failed (${response.status}).`,
    );
  }

  return data;
}

export async function getAdminParents(
  token: string,
): Promise<AdminParent[]> {
  const response = await fetch(
    `${API_BASE_URL}/admin/parents`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await readJsonResponse(response);
  return Array.isArray(data) ? data : [];
}

export async function getAdminChildren(
  token: string,
): Promise<AdminChild[]> {
  const response = await fetch(
    `${API_BASE_URL}/admin/children`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await readJsonResponse(response);
  return Array.isArray(data) ? data : [];
}

export { API_BASE_URL };
