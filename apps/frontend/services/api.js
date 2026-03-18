import { getToken } from "../utils/auth";

const inferredHost =
  globalThis.window !== undefined
    ? globalThis.window.location.hostname
    : "localhost";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || `http://${inferredHost}:8080`;

const AUTH_BASE = `${API_BASE}/api/auth`;

async function request(path, options = {}) {
  const token = getToken();
  const requestHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (options.headers) {
    Object.assign(requestHeaders, options.headers);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    headers: requestHeaders,
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export function login(payload) {
  return request(`${AUTH_BASE.replace(API_BASE, "")}/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function signup(payload) {
  return request(`${AUTH_BASE.replace(API_BASE, "")}/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export { API_BASE, AUTH_BASE, request };
