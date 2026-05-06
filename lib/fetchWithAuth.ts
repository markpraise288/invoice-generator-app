const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let res = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: "include", // 🔥 critical
  });

  // If access token expired → try refresh
  if (res.status === 401) {
    const refreshRes = await fetch(`${API_BASE}/auth/accessToken`, {
      method: "GET",
      credentials: "include",
    });

    if (!refreshRes.ok) {
      throw new Error("Session expired");
    }

    // Retry original request
    res = await fetch(`${API_BASE}${url}`, {
      ...options,
      credentials: "include",
    });
  }

  if (!res.ok) {
    throw new Error("Request failed");
  }

  return res.json();
}