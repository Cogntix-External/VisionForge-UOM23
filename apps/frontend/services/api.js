const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("crms_token");
}

async function request(path, options = {}) {
  const {
    baseUrl = API_BASE,
    headers: customHeaders = {},
    suppressErrorLog = false,
    ...rest
  } = options;
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
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const errorData = await response.json();
          message = errorData.message || errorData.error || message;
        } else {
          const text = await response.text();
          message = text || message;
        }
      } catch (e) {
        console.error("Error parsing error response:", e);
      }
      throw new Error(message);
    }

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
  } catch (err) {
    if (!suppressErrorLog) {
      console.error(`Request failed for ${path}:`, err);
    }
    throw err;
  }
}

function getStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    return JSON.parse(localStorage.getItem("crms_user") || "null");
  } catch (e) {
    return null;
  }
}
function getCompanyId(passedId) {
  if (passedId) return passedId;

  if (typeof window !== "undefined") {
    const user = JSON.parse(localStorage.getItem("crms_user") || "{}");
    return user?.id;
  }

  return null;
}

// login
export function login(payload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// client dashboard
export function getClientDashboard() {
  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("crms_user") || "{}")
      : {};

  return request("/client/dashboard", {
    method: "GET",
    headers: {
      "X-Client-Id": storedUser.id,
    },
  });
}

// company dashboard
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

// client proposals list
export function getClientProposals() {
  return request("/client/proposals", {
    method: "GET",
  });
}

// client single proposal detail
export function getClientProposalById(proposalId) {
  return request(`/client/proposals/${proposalId}`, {
    method: "GET",
  });
}

// accept proposal
export function acceptProposal(proposalId) {
  return request(`/client/proposals/${proposalId}/accept`, {
    method: "PATCH",
  });
}

// reject proposal
export function rejectProposal(proposalId, rejectionReason) {
  return request(`/client/proposals/${proposalId}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ rejectionReason }),
  });
}

// get registered clients
export function getRegisteredClients() {
  return request("/v1/clients/list", {
    method: "GET",
  });
}

// company proposals list
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

// PRD viewer for client
export function getClientProjectPrd(projectId) {
  return request(`/client/projects/${projectId}/prd`, {
    method: "GET",
  });
}

// company projects list
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

export function getProjectById(projectId) {
  return request(`/projects/${projectId}`, {
    method: "GET",
  });
}

// fetch company users
export async function getCompanyUsers(companyId) {
  const resolvedCompanyId = getCompanyId(companyId);
  const storedUser = getStoredUser();
  const fallbackUsers = storedUser?.id
    ? [
        {
          id: storedUser.id,
          name:
            storedUser.fullName ||
            storedUser.name ||
            storedUser.email ||
            "Current User",
          email: storedUser.email || "",
        },
      ]
    : [];

  if (!resolvedCompanyId) {
    // No company id available in client context — return empty list
    return fallbackUsers;
  }

  try {
    const users = await request("/company/users", {
      method: "GET",
      suppressErrorLog: true,
      headers: {
        "X-Company-Id": resolvedCompanyId,
      },
    });

    return Array.isArray(users) && users.length ? users : fallbackUsers;
  } catch (err) {
    return fallbackUsers;
  }
}

// create company proposal
export function createCompanyProposal(payload, companyId) {
  const resolvedCompanyId =
    companyId || JSON.parse(localStorage.getItem("crms_user") || "{}")?.id;

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

// PRD management
export function fetchPrds(token) {
  return request("", {
    method: "GET",
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function createPrd(payload, token) {
  return request("", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(payload),
  });
}

export function fetchPrdById(id, token) {
  return request(`/${encodeURIComponent(id)}?ts=${Date.now()}`, {
    method: "GET",
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function updatePrd(id, payload, token) {
  return request(`/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(payload),
  });
}

// get client projects
export function getClientProjects() {
  return request("/client/projects", {
    method: "GET",
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
      const contentType = response.headers.get("content-type") || "";
      let errorMessage = `HTTP ${response.status}`;
      
      if (contentType.includes("application/json")) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
      } else {
        try {
          const text = await response.text();
          errorMessage = text || errorMessage;
        } catch (e) {
          console.error("Error reading error response:", e);
        }
      }
      
      throw new Error(`Download failed: ${errorMessage}`);
    }

    const contentType = response.headers.get("content-type") || "";
    const contentLength = response.headers.get("content-length");
    
    if (!contentType && !contentLength) {
      throw new Error("Invalid response: No content type or length provided");
    }

    const blob = await response.blob();
    
    if (blob.size === 0) {
      throw new Error("Download failed: Received empty file");
    }

    return { blob, fileName: response.headers.get("content-disposition") };
  } catch (err) {
    console.error(`Download failed for document ${documentId}:`, err);
    throw err;
  }
}

// CLIENT CHANGE REQUESTS
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

// COMPANY CHANGE REQUESTS
export function getCompanyChangeRequests() {
  return request("/company/change-requests", {
    method: "GET",
  });
}

export function getCompanyChangeRequestsByProject(projectId) {
  return request(`/company/projects/${projectId}/change-requests`, {
    method: "GET",
  });
}

export function getCompanyChangeRequestsByProjectAndPrd(projectId, prdId) {
  return request(`/company/projects/${projectId}/prds/${prdId}/change-requests`, {
    method: "GET",
  });
}

export function decideCompanyChangeRequest(changeRequestId, payload) {
  return request(`/company/change-requests/${changeRequestId}/decision`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function markCompanyChangeRequestImplemented(changeRequestId, payload) {
  return request(`/company/change-requests/${changeRequestId}/implemented`, {
    method: "PATCH",
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
    },
  );

  if (!response.ok) {
    throw new Error(`Download failed: HTTP ${response.status}`);
  }

  const blob = await response.blob();
  if (blob.size === 0) {
    throw new Error("Download failed: Received empty file");
  }

  return { blob, fileName: response.headers.get("content-disposition") };
}

// COMPANY VERSION HISTORY
export function getCompanyVersionHistory() {
  return request("/company/version-history", {
    method: "GET",
  });
}

export function getCompanyVersionHistoryEntries(projectId, prdId) {
  return request(`/company/version-history/projects/${projectId}/prds/${prdId}`, {
    method: "GET",
  });
}

export { API_BASE };
