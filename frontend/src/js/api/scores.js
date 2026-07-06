import { API_BASE_URL, request, clearAuthToken, clearAuthUser } from "./client";
import { redirect, isPublicPage } from "../utils/routes";

export function generateScore(config) {
  return request("/api/scores/generate", { method: "POST", body: JSON.stringify({ config }) });
}

export function regenerateScore(config, id) {
  return request("/api/scores/regenerate", { method: "POST", body: JSON.stringify({ config, id }) });
}

export function fetchScores(page = 1, limit = 10) {
  return request(`/api/scores?page=${page}&limit=${limit}`);
}

export function updateScoreTitle(id, title) {
  return request(`/api/scores/${id}`, { method: "PATCH", body: JSON.stringify({ title }) });
}

export function deleteScore(id) {
  return request(`/api/scores/${id}`, { method: "DELETE" });
}

export function deleteAllScores() {
  return request("/api/scores", { method: "DELETE" });
}

export async function exportScore(musicxml, format, imageBase64) {
  const body = { musicxml, format };
  if (imageBase64) body.imageBase64 = imageBase64;

  const response = await fetch(`${API_BASE_URL}/api/scores/export`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
      clearAuthUser();
      if (!isPublicPage()) redirect("login");
    }
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { error: text }; }
    const err = new Error(data?.error || `Error al exportar (${response.status})`);
    err.status = response.status;
    throw err;
  }

  return response.blob();
}
