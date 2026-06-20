// ─────────────────────────────────────────────────────────
// userProfileService.js  —  User Profile API calls
// ─────────────────────────────────────────────────────────

import { API_BASE, getAuthToken } from "./http.js";

export const getCurrentUserProfile = async () => {
  const token = getAuthToken();

  const res = await fetch(`${API_BASE}/user-profile/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  const text = await res.text();

  if (!res.ok) {
    console.error(
      `Profile API Error → status: ${res.status}, url: ${API_BASE}/user-profile/me, response: ${text}`
    );
    throw new Error(`Failed to fetch profile. Status: ${res.status}`);
  }

  return text ? JSON.parse(text) : {};
};

export const updateCurrentUserProfile = async (data) => {
  const token = getAuthToken();

  const res = await fetch(`${API_BASE}/user-profile/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error(
      `Profile Update Error → status: ${res.status}, url: ${API_BASE}/user-profile/me, response: ${text}`
    );
    throw new Error(`Failed to update profile. Status: ${res.status}`);
  }

  return text ? JSON.parse(text) : {};
};
