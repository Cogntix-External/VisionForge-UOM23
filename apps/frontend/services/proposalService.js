// ─────────────────────────────────────────────────────────
// proposalService.js  —  Proposal API calls (Client + Company)
// ─────────────────────────────────────────────────────────

import { request, getCompanyId, isRecoverableNetworkError } from "./http.js";

// ── Client Proposals ─────────────────────────────────────

export function getClientProposals() {
  return request("/client/proposals", { method: "GET" });
}

export function getClientProposalById(proposalId) {
  return request(`/client/proposals/${proposalId}`, { method: "GET" });
}

export function acceptProposal(proposalId) {
  return request(`/client/proposals/${proposalId}/accept`, { method: "PATCH" });
}

export function rejectProposal(proposalId, rejectionReason) {
  return request(`/client/proposals/${proposalId}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ rejectionReason }),
  });
}

// ── Registered Clients ────────────────────────────────────

export async function getRegisteredClients() {
  try {
    return await request("/v1/clients/list", {
      method: "GET",
      suppressNetworkErrorLog: true,
    });
  } catch (error) {
    if (isRecoverableNetworkError(error)) return [];
    throw error;
  }
}

// ── Company Proposals ─────────────────────────────────────

export function getCompanyProposals(companyId) {
  const resolvedCompanyId = getCompanyId(companyId);
  if (!resolvedCompanyId) throw new Error("Company ID is required");

  return request("/company/proposals", {
    method: "GET",
    headers: { "X-Company-Id": resolvedCompanyId },
  });
}

export function createCompanyProposal(payload, companyId) {
  const resolvedCompanyId = getCompanyId(companyId);
  if (!resolvedCompanyId) throw new Error("Company ID is required");

  return request("/company/proposals", {
    method: "POST",
    headers: { "X-Company-Id": resolvedCompanyId },
    body: JSON.stringify(payload),
  });
}
