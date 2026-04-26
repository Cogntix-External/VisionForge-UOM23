const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

// Parses normal JSON/text API responses safely
async function parseResponse(response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  const text = await response.text();
  return text || null;
}

// Sends normal JSON API requests with JWT token
async function request(path, options = {}) {
  const { baseUrl = API_BASE, headers: customHeaders = {}, ...rest } = options;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("crms_token") : null;

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...customHeaders,
      },
    });

    if (!response.ok) {
      let message = `HTTP ${response.status}`;

      try {
        const errorData = await parseResponse(response);

        if (typeof errorData === "string") {
          message = errorData || message;
        } else if (errorData && typeof errorData === "object") {
          message =
            errorData.message ||
            errorData.error ||
            errorData.detail ||
            message;
        }
      } catch (e) {
        console.error("Error parsing error response:", e);
      }

      throw new Error(message);
    }

    return await parseResponse(response);
  } catch (err) {
    console.error(`Request failed for ${path}:`, err);
    throw err;
  }
}

// Reads logged-in user details from localStorage
function getStoredUser() {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(localStorage.getItem("crms_user") || "{}");
  } catch (error) {
    console.error("Failed to parse stored user:", error);
    return {};
  }
}

// Resolves company ID from parameter, logged-in user, or localStorage
function getCompanyId(passedId) {
  if (passedId) return passedId;

  const user = getStoredUser();
  return user?.id || localStorage.getItem("companyId") || null;
}

// Reads auth token from localStorage
function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("crms_token") || localStorage.getItem("token");
}

// Extracts filename from Content-Disposition header
function getFileNameFromContentDisposition(contentDisposition, fallbackName) {
  if (!contentDisposition) return fallbackName;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].replace(/["']/g, ""));
  }

  const normalMatch = contentDisposition.match(
    /filename[^;=\n]*=(['"]?)([^'"\n;]*)\1/i,
  );

  if (normalMatch?.[2]) {
    return normalMatch[2];
  }

  return fallbackName;
}

// Downloads a blob response safely and prevents JSON error responses from being saved as files
async function downloadBlobFile(url, fallbackName = "download.pdf") {
  const token = getAuthToken();

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;

    try {
      if (contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage =
          errorData.message ||
          errorData.error ||
          errorData.detail ||
          errorMessage;
      } else {
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
    } catch (e) {
      console.error("Error parsing download error response:", e);
    }

    throw new Error(`Download failed: ${errorMessage}`);
  }

  if (contentType.includes("application/json")) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message ||
        errorData?.error ||
        "Invalid file response: server returned JSON instead of a file",
    );
  }

  const blob = await response.blob();

  if (!blob || blob.size === 0) {
    throw new Error("Download failed: Received empty file");
  }

  const contentDisposition = response.headers.get("content-disposition");
  let fileName = getFileNameFromContentDisposition(
    contentDisposition,
    fallbackName,
  );

  if (!fileName.includes(".")) {
    if (contentType.includes("pdf")) fileName += ".pdf";
    else fileName += ".bin";
  }

  return {
    blob,
    fileName,
    contentDisposition,
    contentType,
  };
}

// AUTH
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

// DASHBOARD
export function getClientDashboard() {
  return request("/client/dashboard", {
    method: "GET",
  });
}

export function getCompanyDashboard(companyId) {
  const resolvedCompanyId = getCompanyId(companyId);

  if (!resolvedCompanyId) {
    throw new Error("Company ID is required");
  }

  return request("/company/dashboard", {
    method: "GET",
    headers: {
      "X-Company-Id": resolvedCompanyId,
    },
  });
}

// PROPOSALS - CLIENT
export function getClientProposals() {
  return request("/client/proposals", {
    method: "GET",
  });
}

export function getClientProposalById(proposalId) {
  return request(`/client/proposals/${proposalId}`, {
    method: "GET",
  });
}

export function acceptProposal(proposalId) {
  return request(`/client/proposals/${proposalId}/accept`, {
    method: "PATCH",
  });
}

export function rejectProposal(proposalId, rejectionReason) {
  return request(`/client/proposals/${proposalId}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ rejectionReason }),
  });
}

// REGISTERED CLIENTS
export function getRegisteredClients() {
  return request("/v1/clients/list", {
    method: "GET",
  });
}

// PROPOSALS - COMPANY
export function getCompanyProposals(companyId) {
  const resolvedCompanyId = getCompanyId(companyId);

  if (!resolvedCompanyId) {
    throw new Error("Company ID is required");
  }

  return request("/company/proposals", {
    method: "GET",
    headers: {
      "X-Company-Id": resolvedCompanyId,
    },
  });
}

export function createCompanyProposal(payload, companyId) {
  const resolvedCompanyId = getCompanyId(companyId);

  if (!resolvedCompanyId) {
    throw new Error("Company ID is required");
  }

  return request("/company/proposals", {
    method: "POST",
    headers: {
      "X-Company-Id": resolvedCompanyId,
    },
    body: JSON.stringify(payload),
  });
}

// PROJECTS - CLIENT
export function getClientProjects() {
  return request("/client/projects", {
    method: "GET",
  });
}

export function getClientProjectById(projectId) {
  return request(`/client/projects/${projectId}`, {
    method: "GET",
  });
}

// PROJECTS - COMPANY
export function getCompanyProjects(companyId) {
  const resolvedCompanyId = getCompanyId(companyId);

  if (!resolvedCompanyId) {
    throw new Error("Company ID is required");
  }

  return request("/company/projects", {
    method: "GET",
    headers: {
      "X-Company-Id": resolvedCompanyId,
    },
  });
}

// PRD / DOCUMENTS - CLIENT
export function getClientProjectPrd(projectId) {
  return request(`/client/projects/${projectId}/prd`, {
    method: "GET",
  });
}

// PRD / DOCUMENTS - COMPANY
export function getAllPrds() {
  return request("/documents", {
    method: "GET",
  });
}

export async function fetchPrds(projectId) {
  const list = await getAllPrds();

  if (!projectId) {
    return list;
  }

  return Array.isArray(list)
    ? list.filter((item) => String(item.projectId || "") === String(projectId))
    : [];
}

export function fetchPrdById(prdId) {
  if (!prdId) {
    throw new Error("PRD ID is required");
  }

  return request(`/documents/${prdId}`, {
    method: "GET",
  });
}

export function createPrd(projectId, payload) {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  return request("/documents", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      projectId,
    }),
  });
}

export function updatePrd(prdId, payload) {
  if (!prdId) {
    throw new Error("PRD ID is required");
  }

  return request(`/documents/${prdId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function downloadDocument(documentId) {
  if (!documentId) {
    throw new Error("Document ID is required");
  }

  return downloadBlobFile(
    `${API_BASE}/documents/${documentId}/download`,
    "prd-document.pdf",
  );
}

// CHANGE REQUESTS - CLIENT
export function createClientChangeRequest(projectId, payload) {
  return request(`/client/projects/${projectId}/change-requests`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getClientChangeRequests() {
  return request("/client/change-requests", {
    method: "GET",
  });
}

// CHANGE REQUESTS - COMPANY
export function getCompanyChangeRequests(companyId) {
  const resolvedCompanyId = getCompanyId(companyId);

  if (!resolvedCompanyId) {
    throw new Error("Company ID is required");
  }

  return request("/company/change-requests", {
    method: "GET",
    headers: {
      "X-Company-Id": resolvedCompanyId,
    },
  });
}

export function getCompanyChangeRequestsByProject(projectId, companyId) {
  const resolvedCompanyId = getCompanyId(companyId);

  if (!resolvedCompanyId) {
    throw new Error("Company ID is required");
  }

  return request(`/company/projects/${projectId}/change-requests`, {
    method: "GET",
    headers: {
      "X-Company-Id": resolvedCompanyId,
    },
  });
}

export function getCompanyChangeRequestsByProjectAndPrd(
  projectId,
  prdId,
  companyId,
) {
  const resolvedCompanyId = getCompanyId(companyId);

  if (!resolvedCompanyId) {
    throw new Error("Company ID is required");
  }

  return request(`/company/projects/${projectId}/prds/${prdId}/change-requests`, {
    method: "GET",
    headers: {
      "X-Company-Id": resolvedCompanyId,
    },
  });
}

export function decideCompanyChangeRequest(changeRequestId, payload, companyId) {
  const resolvedCompanyId = getCompanyId(companyId);

  if (!resolvedCompanyId) {
    throw new Error("Company ID is required");
  }

  return request(`/company/change-requests/${changeRequestId}/decision`, {
    method: "PATCH",
    headers: {
      "X-Company-Id": resolvedCompanyId,
    },
    body: JSON.stringify(payload),
  });
}

export function markCompanyChangeRequestImplemented(
  changeRequestId,
  payload,
  companyId,
) {
  const resolvedCompanyId = getCompanyId(companyId);

  if (!resolvedCompanyId) {
    throw new Error("Company ID is required");
  }

  return request(`/company/change-requests/${changeRequestId}/implemented`, {
    method: "PATCH",
    headers: {
      "X-Company-Id": resolvedCompanyId,
    },
    body: JSON.stringify(payload),
  });
}

export async function downloadCompanyChangeRequest(changeRequestId) {
  if (!changeRequestId) {
    throw new Error("Change request ID is required");
  }

  return downloadBlobFile(
    `${API_BASE}/company/change-requests/${changeRequestId}/download`,
    "change-request.pdf",
  );
}

// VERSION HISTORY - COMPANY
export function getCompanyVersionHistory(companyId) {
  const resolvedCompanyId = getCompanyId(companyId);

  if (!resolvedCompanyId) {
    throw new Error("Company ID is required");
  }

  return request("/company/version-history", {
    method: "GET",
    headers: {
      "X-Company-Id": resolvedCompanyId,
    },
  });
}

export function getCompanyVersionHistoryEntries(projectId, prdId, companyId) {
  const resolvedCompanyId = getCompanyId(companyId);

  if (!resolvedCompanyId) {
    throw new Error("Company ID is required");
  }

  return request(`/company/version-history/projects/${projectId}/prds/${prdId}`, {
    method: "GET",
    headers: {
      "X-Company-Id": resolvedCompanyId,
    },
  });
}

// NOTIFICATIONS
export function getNotifications() {
  return request("/notifications", {
    method: "GET",
  });
}

export function getClientUnreadNotificationCount() {
  return request("/client/notifications/unread-count", {
    method: "GET",
  });
}

export function markNotificationAsRead(notificationId) {
  return request(`/client/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

export { API_BASE };

