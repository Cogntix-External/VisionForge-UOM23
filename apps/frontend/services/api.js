const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  const text = await response.text();
  return text || null;
}

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
          message = errorData.message || errorData.error || message;
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

function getStoredUser() {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(localStorage.getItem("crms_user") || "{}");
  } catch (error) {
    console.error("Failed to parse stored user:", error);
    return {};
  }
}

function getCompanyId(passedId) {
  if (passedId) return passedId;
  const user = getStoredUser();
  return user?.id || localStorage.getItem("companyId") || null;
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
export function fetchPrds(projectId, companyId) {
  const resolvedCompanyId = getCompanyId(companyId);

  if (!resolvedCompanyId) {
    throw new Error("Company ID is required");
  }

  if (!projectId) {
    throw new Error("Project ID is required");
  }

  return request(`/company/projects/${projectId}/prds`, {
    method: "GET",
    headers: {
      "X-Company-Id": resolvedCompanyId,
    },
  });
}

export function fetchPrdById(projectId, prdId, companyId) {
  const resolvedCompanyId = getCompanyId(companyId);

  if (!resolvedCompanyId) {
    throw new Error("Company ID is required");
  }

  if (!projectId) {
    throw new Error("Project ID is required");
  }

  if (!prdId) {
    throw new Error("PRD ID is required");
  }

  return request(`/company/projects/${projectId}/prds/${prdId}`, {
    method: "GET",
    headers: {
      "X-Company-Id": resolvedCompanyId,
    },
  });
}

export function createPrd(projectId, payload, companyId) {
  const resolvedCompanyId = getCompanyId(companyId);

  if (!resolvedCompanyId) {
    throw new Error("Company ID is required");
  }

  if (!projectId) {
    throw new Error("Project ID is required");
  }

  return request(`/company/projects/${projectId}/prds`, {
    method: "POST",
    headers: {
      "X-Company-Id": resolvedCompanyId,
    },
    body: JSON.stringify(payload),
  });
}

export function updatePrd(projectId, prdId, payload, companyId) {
  const resolvedCompanyId = getCompanyId(companyId);

  if (!resolvedCompanyId) {
    throw new Error("Company ID is required");
  }

  if (!projectId) {
    throw new Error("Project ID is required");
  }

  if (!prdId) {
    throw new Error("PRD ID is required");
  }

  return request(`/company/projects/${projectId}/prds/${prdId}`, {
    method: "PUT",
    headers: {
      "X-Company-Id": resolvedCompanyId,
    },
    body: JSON.stringify(payload),
  });
}

export async function downloadDocument(documentId) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("crms_token") : null;

  try {
    const response = await fetch(`${API_BASE}/documents/${documentId}/download`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;

      try {
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage =
            errorData.message || errorData.error || errorMessage;
        } else {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
      } catch (e) {
        console.error("Error parsing download error response:", e);
      }

      throw new Error(`Download failed: ${errorMessage}`);
    }

    const blob = await response.blob();

    if (blob.size === 0) {
      throw new Error("Download failed: Received empty file");
    }

    return {
      blob,
      fileName: response.headers.get("content-disposition"),
    };
  } catch (err) {
    console.error(`Download failed for document ${documentId}:`, err);
    throw err;
  }
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

export function getCompanyChangeRequestsByProjectAndPrd(projectId, prdId, companyId) {
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

export function markCompanyChangeRequestImplemented(changeRequestId, payload, companyId) {
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
  const token =
    typeof window !== "undefined" ? localStorage.getItem("crms_token") : null;

  const response = await fetch(
    `${API_BASE}/company/change-requests/${changeRequestId}/download`,
    {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Download failed: HTTP ${response.status}`);
  }

  const blob = await response.blob();

  if (blob.size === 0) {
    throw new Error("Download failed: Received empty file");
  }

  return {
    blob,
    fileName: response.headers.get("content-disposition"),
  };
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

export { API_BASE };