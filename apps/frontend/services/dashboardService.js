// ─────────────────────────────────────────────────────────
// dashboardService.js  —  Dashboard API calls
// ─────────────────────────────────────────────────────────

import { request, getCompanyId } from "./http.js";

export function getClientDashboard() {
  return request("/client/dashboard", {
    method: "GET",
  });
}

export function getCompanyDashboard(companyId) {
  const resolvedCompanyId = getCompanyId(companyId);
  if (!resolvedCompanyId) throw new Error("Company ID is required");

  return request("/company/dashboard", {
    method: "GET",
    headers: { "X-Company-Id": resolvedCompanyId },
  });
}
