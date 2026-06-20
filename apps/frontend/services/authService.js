// ─────────────────────────────────────────────────────────
// authService.js  —  Authentication API calls
// ─────────────────────────────────────────────────────────

import { request } from "./http.js";

export function login(payload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function forgotPassword(email) {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token, newPassword) {
  return request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function changePassword(payload) {
  const normalizedPayload = {
    currentPassword: payload?.currentPassword ?? "",
    newPassword: payload?.newPassword ?? "",
    confirmPassword: payload?.confirmPassword ?? "",
  };

  try {
    return await request("/user/change-password", {
      method: "POST",
      body: JSON.stringify(normalizedPayload),
      suppressNetworkErrorLog: true,
    });
  } catch (error) {
    if (/Not Found|HTTP 404/i.test(String(error?.message || ""))) {
      return request("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(normalizedPayload),
        suppressNetworkErrorLog: true,
      });
    }
    throw error;
  }
}
