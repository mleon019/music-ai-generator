const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = "authToken";

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function clearAuthUser() {
  localStorage.removeItem("authUser");
}

export function getAuthUser() {
  const raw = localStorage.getItem("authUser");
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuthUser(user) {
  if (user) {
    localStorage.setItem("authUser", JSON.stringify(user));
  }
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    const message = data?.error || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

export function generateScore(config) {
  return request("/api/scores/generate", {
    method: "POST",
    body: JSON.stringify({ config })
  });
}

export function regenerateScore(config, id) {
  return request("/api/scores/regenerate", {
    method: "POST",
    body: JSON.stringify({ config, id })
  });
}

export function registerUser(payload) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function loginUser(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchScores() {
  return request("/api/scores");
}

export function updateProfile(payload) {
  return request("/api/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteAccount() {
  return request("/api/auth/account", {
    method: "DELETE"
  });
}

export function updateScoreTitle(id, title) {
  return request(`/api/scores/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title })
  });
}

export function deleteScore(id) {
  return request(`/api/scores/${id}`, {
    method: "DELETE"
  });
}

export function deleteAllScores() {
  return request("/api/scores", {
    method: "DELETE"
  });
}
