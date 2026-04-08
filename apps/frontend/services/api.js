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
      // ignore
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

export { API_BASE };
