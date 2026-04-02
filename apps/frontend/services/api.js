const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api/v1/clients";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
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

// ── Proposal API Functions ─────────────────────────────────────
// Get client's proposals
export function getClientProposals(clientId) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";
  return request(`/client/proposals`, {
    method: "GET",
    headers: {
      "X-Client-Id": clientId,
    },
    baseUrl: baseUrl,
  });
}

// Get proposal by ID
export function getProposalById(proposalId) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";
  return fetch(`${baseUrl}/proposals/${proposalId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch proposal");
      return res.json();
    });
}

// Accept proposal
export function acceptProposal(proposalId, clientId) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";
  return fetch(`${baseUrl}/client/proposals/${proposalId}/accept`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Id": clientId,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to accept proposal");
      return res.json();
    });
}

// Reject proposal
export function rejectProposal(proposalId, clientId, reason) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";
  return fetch(`${baseUrl}/client/proposals/${proposalId}/reject`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Id": clientId,
    },
    body: JSON.stringify({ reason }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to reject proposal");
      return res.json();
    });
}

export { API_BASE, request };
