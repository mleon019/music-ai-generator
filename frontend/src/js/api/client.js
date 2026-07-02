import { clearCurrentScoreState } from "../utils/scoreState";
import { redirect, isPublicPage } from "../utils/routes";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function clearAuthToken() {
  fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST", credentials: "include"
  }).catch(() => {});
}

export function clearAuthUser() {
  localStorage.removeItem("authUser");
}

export function getAuthUser() {
  try { return JSON.parse(localStorage.getItem("authUser")); }
  catch { return null; }
}

export function setAuthUser(user) {
  if (user) localStorage.setItem("authUser", JSON.stringify(user));
}

export function logout() {
  clearAuthToken();
  clearAuthUser();
  clearCurrentScoreState();
  redirect("home");
}

function handleUnauthorized() {
  clearAuthToken();
  clearAuthUser();
  if (!isPublicPage()) redirect("login");
}

export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = { error: text }; }
  }

  if (!response.ok) {
    if (response.status === 401) handleUnauthorized();
    const err = new Error(data?.error || "Request failed");
    err.status = response.status;
    throw err;
  }

  return data;
}
