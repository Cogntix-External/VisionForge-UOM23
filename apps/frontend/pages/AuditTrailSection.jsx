"use client";

import React, { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("crms_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export default function AuditTrailSection({ auditRequests = [], onOpenReview, onShowVersionHistory }) {
  const [requests, setRequests] = useState(auditRequests);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [reviewItem, setReviewItem] = useState(null);
  const [decision, setDecision] = useState("ACCEPTED");
  const [decisionReason, setDecisionReason] = useState("");

  const projectOptions = useMemo(() => {
    const ids = [...new Set(requests.map((r) => r.projectId).filter(Boolean))];
    return ids;
  }, [requests]);

  async function loadCompanyRequests(projectId = "") {
    setLoading(true);
    setError("");
    try {
      const path = projectId
        ? `/company/projects/${encodeURIComponent(projectId)}/change-requests`
        : "/company/change-requests";
      const data = await apiRequest(path, { method: "GET" });
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load audit trail data");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompanyRequests("");
  }, []);

  async function handleDecision(item, accepted) {
    const reason = window.prompt(
      accepted ? "Enter acceptance reason" : "Enter rejection reason",
      ""
    );
    if (reason === null) return;

    try {
      await apiRequest(`/company/change-requests/${encodeURIComponent(item.id)}/decision`, {
        method: "PATCH",
        body: JSON.stringify({
          accepted,
          decisionReason: reason,
          rejectionReason: accepted ? null : reason,
        }),
      });
      await loadCompanyRequests(projectFilter);
    } catch (err) {
      setError(err.message || "Failed to submit decision");
    }
  }

  async function handleDownload(item) {
    try {
      const response = await fetch(
        `${API_BASE}/company/change-requests/${encodeURIComponent(item.id)}/download`,
        {
          method: "GET",
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `change-request-${item.id}.txt`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Failed to download change request");
    }
  }

  const mappedRows = requests.map((item) => ({
    ...item,
    viewStatus: item.status || "-",
    submittedDate: item.createdAt
      ? new Date(item.createdAt).toLocaleDateString()
      : "-",
  }));

  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <select
          value={projectFilter}
          onChange={(e) => {
            const next = e.target.value;
            setProjectFilter(next);
            loadCompanyRequests(next);
          }}
          className="bg-white border-none rounded-xl px-4 py-3 text-sm font-semibold shadow-sm focus:ring-2 focus:ring-[#5D57A3]/20"
        >
          <option value="">All projects</option>
          {projectOptions.map((projectId) => (
            <option key={projectId} value={projectId}>
              {projectId}
            </option>
          ))}
        </select>
        <select className="bg-white border-none rounded-xl px-4 py-3 text-sm font-semibold shadow-sm focus:ring-2 focus:ring-[#5D57A3]/20">
          <option>Sort by date: Newest</option>
        </select>
        <select className="bg-white border-none rounded-xl px-4 py-3 text-sm font-semibold shadow-sm focus:ring-2 focus:ring-[#5D57A3]/20">
          <option>Sort by name: Newest</option>
        </select>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Change Request Review</h2>
          <select className="bg-[#F8F9FE] border-none rounded-lg px-4 py-2 text-xs font-semibold">
            <option>Short by: Newest</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading && <p className="text-sm text-gray-500">Loading audit trail...</p>}
          {!!error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-300 text-xs uppercase tracking-wider">
                <th className="pb-4 font-semibold px-4">Project ID</th>
                <th className="pb-4 font-semibold px-4">Client ID</th>
                <th className="pb-4 font-semibold text-center">Status</th>
                <th className="pb-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mappedRows.map((item) => (
                <tr key={item.id} className="group">
                  <td className="py-6 px-4 font-bold text-gray-600 text-sm">{item.projectId || "-"}</td>
                  <td className="py-6 px-4 font-bold text-gray-800 text-sm">{item.clientId || "-"}</td>
                  <td className="py-6 px-4 text-center">
                    <span className="font-bold text-sm text-gray-800">{item.viewStatus}</span>
                  </td>
                  <td className="py-6 px-4">
                      <button
                        onClick={() => {
                          setReviewItem(item);
                          setDecision(item.status === "REJECTED" ? "REJECTED" : "ACCEPTED");
                          setDecisionReason(item.decisionReason || item.rejectionReason || "");
                          onOpenReview?.(item);
                        }}
                        className="border border-[#B2EBF2] text-teal-600 px-6 py-2 rounded-lg text-xs font-semibold hover:bg-cyan-50 transition-colors"
                      >
                        Review
                      </button>
                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50">
            &lt;
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#5D57A3] text-white">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">
            4
          </button>
          <span className="flex items-center text-gray-400 px-1">...</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">
            40
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50">
            &gt;
          </button>
        </div>
      </div>

      {reviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-4 sm:px-4 sm:py-6">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-2xl border border-gray-100">
            <div className="px-8 pt-8 pb-5 border-b border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Change Request Review</h3>
                  <p className="mt-2 text-sm text-gray-500 break-all">
                    {reviewItem.crid || reviewItem.id} for {reviewItem.projectId || "-"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewItem(null)}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 rounded-2xl bg-[#FAFBFF] p-4 sm:p-5 border border-gray-100">
                <InfoCard label="Project ID" value={reviewItem.projectId} />
                <InfoCard label="PRD ID" value={reviewItem.prdId} />
                <InfoCard label="Client ID" value={reviewItem.clientId} />
                <InfoCard label="Change Request ID" value={reviewItem.id} />
                <InfoCard label="Status" value={reviewItem.status} />
                <InfoCard label="Submitted" value={reviewItem.submittedDate} />
              </div>

              <div className="rounded-2xl bg-[#FAFBFF] p-4 sm:p-5 border border-gray-100">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Summary</div>
                <div className="mt-2 text-base sm:text-lg font-bold text-gray-800 break-words">{reviewItem.title || "-"}</div>
                <p className="mt-3 text-sm leading-6 text-gray-600 whitespace-pre-wrap break-words max-h-40 overflow-y-auto pr-1">
                  {reviewItem.description || "-"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleDownload(reviewItem)}
                  className="rounded-xl bg-[#1A1A40] px-5 py-3 text-sm font-semibold text-white hover:bg-[#11112d]"
                >
                  Download client submission
                </button>
                <button
                  type="button"
                  onClick={() => setDecision("ACCEPTED")}
                  className={`rounded-xl px-5 py-3 text-sm font-semibold border ${
                    decision === "ACCEPTED"
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-gray-700"
                  }`}
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => setDecision("REJECTED")}
                  className={`rounded-xl px-5 py-3 text-sm font-semibold border ${
                    decision === "REJECTED"
                      ? "border-rose-400 bg-rose-50 text-rose-700"
                      : "border-gray-200 text-gray-700"
                  }`}
                >
                  Reject
                </button>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Reason (sent to client)
                </label>
                <textarea
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  className="min-h-[120px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm outline-none focus:border-[#5D57A3]"
                  placeholder="Write the reason for accepting or rejecting the change request..."
                />
              </div>

              <div className="sticky bottom-0 -mx-6 sm:-mx-8 border-t border-gray-100 bg-white px-6 sm:px-8 py-4 flex justify-end gap-3 shadow-[0_-6px_20px_rgba(0,0,0,0.04)]">
                <button
                  type="button"
                  onClick={() => setReviewItem(null)}
                  className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await apiRequest(`/company/change-requests/${encodeURIComponent(reviewItem.id)}/decision`, {
                        method: "PATCH",
                        body: JSON.stringify({
                          accepted: decision === "ACCEPTED",
                          decisionReason,
                          rejectionReason: decision === "REJECTED" ? decisionReason : null,
                        }),
                      });
                      setReviewItem(null);
                      await loadCompanyRequests(projectFilter);
                    } catch (err) {
                      setError(err.message || "Failed to submit decision");
                    }
                  }}
                  className="rounded-xl bg-[#5D57A3] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4b4592]"
                >
                  Submit decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 border border-gray-100 shadow-sm">
      <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">{label}</div>
      <div className="mt-1 text-sm font-semibold text-gray-800 break-words">{value || "-"}</div>
    </div>
  );
}
