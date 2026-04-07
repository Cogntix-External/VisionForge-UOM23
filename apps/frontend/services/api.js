const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

async function request(path, options = {}) {
  const { baseUrl = API_BASE, headers: customHeaders = {}, ...rest } = options;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("crms_token") : null;

  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...customHeaders,
    },
    ...rest,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export function login(payload) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function signup(payload) {
  return request("/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getRegisteredClients() {
  return request("/v1/clients/list", {
    method: "GET",
  });
}

// ── Proposal API Functions ─────────────────────────────────────
// Get client's proposals
export function getClientProposals(clientId) {
  return request(`/client/proposals`, {
    method: "GET",
    headers: {
      "X-Client-Id": clientId,
    },
  });
}

export function getCompanyProposals(companyId) {
  return request(`/company/proposals`, {
    method: "GET",
    headers: {
      "X-Company-Id": companyId,
    },
  });
}

export function createCompanyProposal(payload, companyId) {
  return request(`/company/proposals`, {
    method: "POST",
    headers: {
      "X-Company-Id": companyId,
    },
    body: JSON.stringify(payload),
  });
}

// Get proposal by ID
export function getProposalById(proposalId) {
  return request(`/proposals/${proposalId}`, {
    method: "GET",
  });
}

// Accept proposal
export function acceptProposal(proposalId, clientId) {
  return request(`/client/proposals/${proposalId}/accept`, {
    method: "PATCH",
    headers: {
      "X-Client-Id": clientId,
    },
  });
}

// Reject proposal
export function rejectProposal(proposalId, clientId, reason) {
  return request(`/client/proposals/${proposalId}/reject`, {
    method: "PATCH",
    headers: {
      "X-Client-Id": clientId,
    },
    body: JSON.stringify({ reason }),
  });
}

export { API_BASE, request };
