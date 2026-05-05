const API_BASE = "http://localhost:5000/api";

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(`${API_BASE}/auth/accessToken`, {
        method: "GET",
        credentials: "include",
      });

      refreshPromise = null;

      if (!res.ok) return false;
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
    return fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
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
