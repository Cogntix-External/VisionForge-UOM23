// ─────────────────────────────────────────────────────────
// projectService.js  —  Project API calls (Client + Company)
// ─────────────────────────────────────────────────────────

import { request, getCompanyId, API_BASE } from "./http.js";

// ── Client Projects ───────────────────────────────────────

export function getClientProjects() {
  return request("/client/projects", { method: "GET" });
}

export function getClientProjectById(projectId) {
  return request(`/client/projects/${projectId}`, { method: "GET" });
}

// ── Company Projects ──────────────────────────────────────

export async function getCompanyProjects(companyId) {
  const resolvedCompanyId = getCompanyId(companyId);
  if (!resolvedCompanyId) throw new Error("Company ID is required");

  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("crms_token")
        : null;

    const response = await fetch(`${API_BASE}/company/projects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "X-Company-Id": resolvedCompanyId,
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json().catch(() => null);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    const isNetworkError =
      error instanceof TypeError ||
      /Failed to fetch|NetworkError|Load failed/i.test(
        String(error?.message || "")
      );
    if (isNetworkError) return [];
    throw error;
  }
}

export function getCompanyProjectById(projectId) {
  if (!projectId) throw new Error("Project ID is required");
  return request(`/company/projects/${projectId}`, { method: "GET" });
}

export function getProjectById(projectId) {
  if (!projectId) throw new Error("Project ID is required");
  return request(`/projects/${projectId}`, { method: "GET" });
}
