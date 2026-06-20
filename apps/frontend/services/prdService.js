// ─────────────────────────────────────────────────────────
// prdService.js  —  PRD / Document API calls
// ─────────────────────────────────────────────────────────

import { request, API_BASE } from "./http.js";

// ── PRD - Client ──────────────────────────────────────────

export function getClientProjectPrd(projectId) {
  return request(`/client/projects/${projectId}/prd`, { method: "GET" });
}

// ── PRD - Company ─────────────────────────────────────────

export function getAllPrds() {
  return request("/prds", { method: "GET" });
}

export async function fetchPrds(projectId) {
  const list = await getAllPrds();
  if (!projectId) return list;
  return Array.isArray(list)
    ? list.filter((item) => String(item.projectId || "") === String(projectId))
    : [];
}

export function fetchPrdById(prdId) {
  if (!prdId) throw new Error("PRD ID is required");
  return request(`/prds/${prdId}`, { method: "GET" });
}

export function createPrd(projectId, payload) {
  if (!projectId) throw new Error("Project ID is required");
  return request("/prds", {
    method: "POST",
    body: JSON.stringify({ ...payload, projectId }),
  });
}

export function updatePrd(prdId, payload) {
  if (!prdId) throw new Error("PRD ID is required");
  return request(`/prds/${prdId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ── Document Download ─────────────────────────────────────

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

export async function downloadDocument(documentId) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("crms_token") : null;

  try {
    const response = await fetch(`${API_BASE}/documents/${documentId}/download`, {
      method: "GET",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const ct = response.headers.get("content-type") || "";
        errorMessage = ct.includes("application/json")
          ? (await response.json())?.message || errorMessage
          : (await response.text()) || errorMessage;
      } catch {}
      throw new Error(`Download failed: ${errorMessage}`);
    }

    const blob = await response.blob();
    if (blob.size === 0) throw new Error("Download failed: Received empty file");

    return {
      blob,
      fileName:
        parseContentDisposition(
          response.headers.get("content-disposition") || ""
        ) || null,
      contentType: response.headers.get("content-type") || "",
      contentDispositionHeader:
        response.headers.get("content-disposition") || "",
    };
  } catch (err) {
    console.error(`Download failed for document ${documentId}:`, err);
    throw err;
  }
}
