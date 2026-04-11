const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("crms_token");
}

async function request(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      message = data.message || data.error || message;
    } catch (e) {
      console.error("Error parsing response:", e);
    }
    throw new Error(message);
  }
  return response.json();
}
// login
export function login(payload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
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
//PRD viewer for client
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

// create company proposal
export function createCompanyProposal(payload, companyId) {
  const resolvedCompanyId =
    companyId || JSON.parse(localStorage.getItem("crms_user"))?.id;

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
// get clients project
export function getClientProjects() {
  return request("/client/projects", {
    method: "GET",
  });
}

export function downloadDocument(documentId) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("crms_token") : null;

  return fetch(`${API_BASE}/documents/${documentId}/download`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
function getCompanyId(passedId) {
  if (passedId) return passedId;

  if (typeof window !== "undefined") {
    const user = JSON.parse(localStorage.getItem("crms_user"));
    return user?.id;
  }

  return null;
}
export { API_BASE };
