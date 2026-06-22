const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function clearAuthToken() {
  fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include"
  }).catch(() => {});
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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
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
    if (response.status === 401) {
      clearAuthToken();
      clearAuthUser();

      const path = window.location.pathname;
      if (!path.startsWith("/login/") && !path.startsWith("/register/")) {
        window.location.assign("/login/");
        return;
      }
    }

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

export async function exportScore(musicxml, format, imageBase64) {
  const body = { musicxml, format };
  if (imageBase64) body.imageBase64 = imageBase64;

  const response = await fetch(`${API_BASE_URL}/api/scores/export`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { error: text }; }
    const message = data?.error || `Error al exportar (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.blob();
}

export function requestPasswordReset(email) {
  return request("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export function resetPassword(token, newPassword) {
  return request("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword })
  });
}
