import { request } from "./client";

export function registerUser(payload) {
  return request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
}

export function loginUser(payload) {
  return request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
}

export function requestPasswordReset(email) {
  return request("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
}

export function resetPassword(token, newPassword) {
  return request("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword }) });
}

export function updateProfile(payload) {
  return request("/api/auth/profile", { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteAccount(password) {
  return request("/api/auth/account", { method: "DELETE", body: JSON.stringify({ password }) });
}
