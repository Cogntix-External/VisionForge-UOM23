// ─────────────────────────────────────────────────────────
// versionHistoryService.js  —  Version History API calls
// ─────────────────────────────────────────────────────────

import { request, getCompanyId } from "./http.js";

export function getCompanyVersionHistory(companyId) {
  const resolvedCompanyId = getCompanyId(companyId);
  if (!resolvedCompanyId) throw new Error("Company ID is required");

  return request("/company/version-history", {
    method: "GET",
    headers: { "X-Company-Id": resolvedCompanyId },
  });
}

export function getCompanyVersionHistoryEntries(projectId, prdId, companyId) {
  const resolvedCompanyId = getCompanyId(companyId);
  if (!resolvedCompanyId) throw new Error("Company ID is required");

  return request(
    `/company/version-history/projects/${projectId}/prds/${prdId}`,
    {
      method: "GET",
      headers: { "X-Company-Id": resolvedCompanyId },
    }
  );
}
