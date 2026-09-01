const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

let refreshPromise: Promise<boolean> | null = null;

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(`${API_BASE}/auth/accessToken`, {
        method: "GET",
        credentials: "include",
      });

      refreshPromise = null;

      if (res.status === 403) {
        window.location.href = "/login";
        return false;
      };
      return true;
    })();
  }

  return refreshPromise;
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const makeRequest = async () => {
    // FormData needs the browser to set its own Content-Type with a
    // multipart boundary — forcing "application/json" here (the old
    // default) breaks every file upload, since the server can't parse a
    // multipart body without that boundary parameter.
    const isFormData = options.body instanceof FormData;

    return fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        "ngrok-skip-browser-warning": "true",
        ...(options.headers || {}),
      },
    });
  };

  let res = await makeRequest();

  // 🔴 If access token expired
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      throw new Error("Session expired. Please login again.");
    }

    // Retry original request
    res = await makeRequest();
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Request failed");
  }

  const data = await res.json();
  return data;
}