const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
