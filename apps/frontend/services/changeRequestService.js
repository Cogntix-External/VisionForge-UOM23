// ─────────────────────────────────────────────────────────
// changeRequestService.js  —  Change Request API calls
//                            (Client + Company)
// ─────────────────────────────────────────────────────────

import { request, getCompanyId, API_BASE } from "./http.js";

// ── Client Change Requests ────────────────────────────────

export function createClientChangeRequest(projectId, payload) {
  const hasAttachment =
    typeof File !== "undefined" && payload?.attachmentFile instanceof File;

  if (hasAttachment) {
    const formData = new FormData();
    if (payload.prdId) formData.append("prdId", payload.prdId);
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    if (
      payload.budget !== null &&
      payload.budget !== undefined &&
      payload.budget !== ""
    ) {
      formData.append("budget", String(payload.budget));
    }
    if (payload.timeline) formData.append("timeline", payload.timeline);
    if (payload.priority) formData.append("priority", payload.priority);
    formData.append("attachment", payload.attachmentFile);

    return request(`/client/projects/${projectId}/change-requests`, {
      method: "POST",
      body: formData,
    });
  }

  return request(`/client/projects/${projectId}/change-requests`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getClientChangeRequests() {
  return request("/client/change-requests", { method: "GET" });
}

export async function downloadClientChangeRequestAttachment(
  changeRequestId,
  fileName
) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("crms_token") : null;
  const downloadUrl = `${API_BASE}/client/change-requests/${encodeURIComponent(changeRequestId)}/attachment`;

  const response = await fetch(downloadUrl, {
    method: "GET",
    cache: "no-store",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });

  if (!response.ok) {
    if (response.status === 404) return false;
    throw new Error(`Request failed with status code ${response.status}`);
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition") || "";
  const matchedFileName = contentDisposition.match(
    /filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i
  );
  const resolvedFileName =
    fileName ||
    (matchedFileName?.[1] ? decodeURIComponent(matchedFileName[1]) : "") ||
    "attachment";

  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = resolvedFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
  return true;
}

// ── Company Change Requests ───────────────────────────────

export function getCompanyChangeRequests(companyId) {
  const resolvedCompanyId = getCompanyId(companyId);
  if (!resolvedCompanyId) throw new Error("Company ID is required");

  return request("/company/change-requests", {
    method: "GET",
    headers: { "X-Company-Id": resolvedCompanyId },
  });
}

export function getCompanyChangeRequestsByProject(projectId, companyId) {
  const resolvedCompanyId = getCompanyId(companyId);
  if (!resolvedCompanyId) throw new Error("Company ID is required");

  return request(`/company/projects/${projectId}/change-requests`, {
    method: "GET",
    headers: { "X-Company-Id": resolvedCompanyId },
  });
}

export function getCompanyChangeRequestsByProjectAndPrd(
  projectId,
  prdId,
  companyId
) {
  const resolvedCompanyId = getCompanyId(companyId);
  if (!resolvedCompanyId) throw new Error("Company ID is required");

  return request(
    `/company/projects/${projectId}/prds/${prdId}/change-requests`,
    {
      method: "GET",
      headers: { "X-Company-Id": resolvedCompanyId },
    }
  );
}

export function decideCompanyChangeRequest(changeRequestId, payload, companyId) {
  const resolvedCompanyId = getCompanyId(companyId);
  if (!resolvedCompanyId) throw new Error("Company ID is required");

  return request(`/company/change-requests/${changeRequestId}/decision`, {
    method: "PATCH",
    headers: { "X-Company-Id": resolvedCompanyId },
    body: JSON.stringify(payload),
  });
}

export function markCompanyChangeRequestImplemented(
  changeRequestId,
  payload,
  companyId
) {
  const resolvedCompanyId = getCompanyId(companyId);
  if (!resolvedCompanyId) throw new Error("Company ID is required");

  return request(`/company/change-requests/${changeRequestId}/implemented`, {
    method: "PATCH",
    headers: { "X-Company-Id": resolvedCompanyId },
    body: JSON.stringify(payload),
  });
}

export async function downloadCompanyChangeRequest(changeRequestId) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("crms_token") : null;

  const response = await fetch(
    `${API_BASE}/company/change-requests/${changeRequestId}/download`,
    {
      method: "GET",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    }
  );

  if (!response.ok)
    throw new Error(`Download failed: HTTP ${response.status}`);

  const blob = await response.blob();
  if (blob.size === 0) throw new Error("Download failed: Received empty file");

  const contentDisposition = response.headers.get("content-disposition") || "";

  function parseContentDisposition(header) {
    if (!header) return null;
    const starMatch = header.match(/filename\*=UTF-8''([^;\n]+)/i);
    if (starMatch?.[1]) {
      try {
        return decodeURIComponent(starMatch[1].trim());
      } catch {
        return starMatch[1].trim();
      }
    }
    const plainMatch = header.match(/filename\s*=\s*"?([^";\n]+)"?/i);
    return plainMatch?.[1]?.trim() ?? null;
  }

  return {
    blob,
    fileName: parseContentDisposition(contentDisposition) || null,
    contentType: response.headers.get("content-type") || "",
    contentDispositionHeader: contentDisposition,
  };
}
