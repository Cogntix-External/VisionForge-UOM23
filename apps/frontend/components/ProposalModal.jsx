"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { acceptProposal, rejectProposal } from "@/services/api";

export default function ProposalModal({
  isOpen,
  onClose,
  proposal,
  clientId,
  onProposalUpdate,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!isOpen || !proposal) return null;

  const isStatusPending =
    String(proposal.status || "").toUpperCase() === "PENDING";

  const getStatusStyle = (status) => {
    const normalized = String(status || "").toUpperCase();

    if (normalized === "ACCEPTED") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (normalized === "REJECTED") {
      return "border-rose-200 bg-rose-50 text-rose-700";
    }

    return "border-amber-200 bg-amber-50 text-amber-700";
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    const amount = Number(value);
    if (Number.isNaN(amount)) return String(value);
    return `$${amount.toFixed(2)}`;
  };

  const budgetRows = Array.isArray(proposal.budgetData)
    ? proposal.budgetData
    : [];
  const timelineRows = Array.isArray(proposal.timelines)
    ? proposal.timelines
    : [];

  const handleAccept = async () => {
    if (!clientId || !proposal.id) {
      setError(
        `Missing client ID or proposal ID (clientId: ${clientId}, proposalId: ${proposal.id})`
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedProposal = await acceptProposal(proposal.id, clientId);
      onProposalUpdate(updatedProposal);
      alert("Proposal accepted successfully!");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to accept proposal");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!clientId || !proposal.id) {
      setError(
        `Missing client ID or proposal ID (clientId: ${clientId}, proposalId: ${proposal.id})`
      );
      return;
    }

    if (!rejectionReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedProposal = await rejectProposal(
        proposal.id,
        rejectionReason.trim()
      );

      onProposalUpdate(updatedProposal);
      setShowRejectForm(false);
      setRejectionReason("");
      alert("Proposal rejected successfully!");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to reject proposal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-black uppercase tracking-[0.22em] text-white/70">
                Proposal Review
              </p>
              <h2 className="text-2xl font-black">Proposal Details</h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-white/15 p-2 transition hover:bg-white/25"
              aria-label="Close proposal modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {error}
            </div>
          )}

          <span
            className={`inline-flex rounded-full border px-4 py-2 text-xs font-black uppercase ${getStatusStyle(
              proposal.status
            )}`}
          >
            {String(proposal.status || "PENDING").toUpperCase()}
          </span>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Project Title" value={proposal.title || "N/A"} />

            <Field label="Proposal ID" value={proposal.id || "N/A"} mono />

            <Field label="Company Name" value={proposal.companyId || "N/A"} />

            <Field
              label="Submitted Date"
              value={
                proposal.createdAt
                  ? new Date(proposal.createdAt).toLocaleDateString()
                  : "N/A"
              }
            />
          </div>

          <div className="rounded-[24px] border border-slate-100 bg-slate-50/90 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Description
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-600">
              {proposal.description || "No description provided"}
            </p>
          </div>

          <DetailTable
            title="Estimated Budget"
            headers={["Item", "Unit", "Qty", "Unit Cost", "Total"]}
            rows={budgetRows}
            emptyMessage="No budget details available."
            renderRow={(row, idx) => (
              <tr key={`${row.item || "budget"}-${idx}`}>
                <TableCell>{row.item || "-"}</TableCell>
                <TableCell>{row.unit || "-"}</TableCell>
                <TableCell>{row.qty ?? row.quantity ?? "-"}</TableCell>
                <TableCell>
                  {(row.unitCost ?? row.unitPrice) &&
                  (row.unitCost ?? row.unitPrice) !== "-"
                    ? formatCurrency(row.unitCost ?? row.unitPrice)
                    : "-"}
                </TableCell>
                <TableCell>{formatCurrency(row.total)}</TableCell>
              </tr>
            )}
          />

          <DetailTable
            title="Estimated Timeline"
            headers={["Phase", "Start Date", "End Date", "Duration", "Assigned To"]}
            rows={timelineRows}
            emptyMessage="No timeline details available."
            renderRow={(row, idx) => (
              <tr key={`${row.phase || "timeline"}-${idx}`}>
                <TableCell>{row.phase || "-"}</TableCell>
                <TableCell>{row.startDate || "-"}</TableCell>
                <TableCell>{row.endDate || "-"}</TableCell>
                <TableCell>{row.duration || "-"}</TableCell>
                <TableCell>{row.assignedTo || "-"}</TableCell>
              </tr>
            )}
          />

          {proposal.rejectionReason && (
            <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-500">
                Rejection Reason
              </p>
              <p className="mt-3 text-sm font-bold leading-relaxed text-rose-700">
                {proposal.rejectionReason}
              </p>
            </div>
          )}

          {showRejectForm && isStatusPending && (
            <div className="space-y-4 rounded-[24px] border border-rose-200 bg-rose-50 p-5">
              <div>
                <label className="mb-2 block text-sm font-black text-rose-700">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  className="min-h-[120px] w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                  rows="4"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleRejectSubmit}
                  disabled={loading || !rejectionReason.trim()}
                  className="flex-1 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-black text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading ? "Processing..." : "Confirm Rejection"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason("");
                  }}
                  className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {isStatusPending && !showRejectForm && (
          <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5">
            <button
              type="button"
              onClick={() => setShowRejectForm(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-rose-700 disabled:bg-slate-300"
            >
              <XCircle className="h-4 w-4" />
              {loading ? "Processing..." : "Reject Proposal"}
            </button>

            <button
              type="button"
              onClick={handleAccept}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:bg-slate-300"
            >
              <CheckCircle2 className="h-4 w-4" />
              {loading ? "Processing..." : "Accept Proposal"}
            </button>
          </div>
        )}

        {!isStatusPending && (
          <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-indigo-600"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const Field = ({ label, value, mono = false }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-5">
    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
      {label}
    </p>
    <p
      className={`mt-3 break-words text-sm font-black text-slate-900 ${
        mono ? "font-mono" : ""
      }`}
    >
      {value || "-"}
    </p>
  </div>
);

function DetailTable({ title, headers, rows, renderRow, emptyMessage }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-white p-5">
      <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {title}
      </p>
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="bg-slate-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length > 0 ? (
              rows.map(renderRow)
            ) : (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-6 text-center text-sm font-bold text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableCell({ children }) {
  return <td className="px-4 py-3 font-semibold text-slate-700">{children}</td>;
}
