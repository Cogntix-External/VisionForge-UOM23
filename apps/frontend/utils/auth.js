const TOKEN_KEY = "crms_token";
const USER_KEY = "crms_user";
const ROLE_KEY = "crms_role";

export function normalizeRole(rawRole) {
  if (!rawRole) return "";
  const role = String(rawRole).trim().toUpperCase();
  if (role === "ROLE_CLIENT") return "CLIENT";
  if (role === "ROLE_COMPANY") return "COMPANY";
  return role;
}

export function setSession(token, user) {
  if (typeof window === "undefined") return;

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Lax`;
  }

  if (user) {
    const normalizedRole = normalizeRole(user.role);
    const normalizedUser = {
      ...user,
      role: normalizedRole || user.role,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));

    if (normalizedRole) {
      localStorage.setItem(ROLE_KEY, normalizedRole);
      document.cookie = `${ROLE_KEY}=${normalizedRole}; path=/; SameSite=Lax`;
    }
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${ROLE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
