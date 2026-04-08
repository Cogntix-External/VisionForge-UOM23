"use client";

import React, { useState } from "react";
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

  const handleAccept = async () => {
    if (!clientId || !proposal.id) {
      const missingError = `Missing client ID or proposal ID (clientId: ${clientId}, proposalId: ${proposal.id})`;
      setError(missingError);
      console.error(missingError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Accepting proposal ${proposal.id} for client ${clientId}`);
      const updatedProposal = await acceptProposal(proposal.id, clientId);
      console.log("Proposal accepted successfully:", updatedProposal);
      onProposalUpdate(updatedProposal);
      alert("Proposal accepted successfully!");
      onClose();
    } catch (err) {
      const errorMsg = err.message || "Failed to accept proposal";
      console.error("Accept proposal error:", err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!clientId || !proposal.id) {
      const missingError = `Missing client ID or proposal ID (clientId: ${clientId}, proposalId: ${proposal.id})`;
      setError(missingError);
      console.error(missingError);
      return;
    }

    if (!rejectionReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(
        `Rejecting proposal ${proposal.id} for client ${clientId} with reason: ${rejectionReason}`,
      );
      const updatedProposal = await rejectProposal(
        proposal.id,
        clientId,
        rejectionReason,
      );
      console.log("Proposal rejected successfully:", updatedProposal);
      onProposalUpdate(updatedProposal);
      setShowRejectForm(false);
      setRejectionReason("");
      alert("Proposal rejected successfully!");
      onClose();
    } catch (err) {
      const errorMsg = err.message || "Failed to reject proposal";
      console.error("Reject proposal error:", err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = String(status || "").toUpperCase();
    if (normalizedStatus === "ACCEPTED") return "bg-green-100 text-green-800";
    if (normalizedStatus === "REJECTED") return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const isStatusPending =
    String(proposal.status || "").toUpperCase() === "PENDING";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">
            Proposal Details
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Status Badge */}
          <div>
            <span
              className={`inline-block px-4 py-2 rounded-lg font-semibold ${getStatusColor(
                proposal.status,
              )}`}
            >
              {String(proposal.status || "PENDING").toUpperCase()}
            </span>
          </div>

          {/* Proposal Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-slate-600">
                Project Title
              </label>
              <p className="text-lg text-slate-900 mt-1">
                {proposal.title || "N/A"}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Proposal ID
              </label>
              <p className="text-lg text-slate-900 mt-1 font-mono text-sm break-all">
                {proposal.id || "N/A"}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Company Name
              </label>
              <p className="text-lg text-slate-900 mt-1">
                {proposal.companyId || "N/A"}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Submitted Date
              </label>
              <p className="text-lg text-slate-900 mt-1">
                {proposal.createdAt
                  ? new Date(proposal.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-slate-600">
              Description
            </label>
            <p className="text-slate-700 mt-2 leading-relaxed">
              {proposal.description || "No description provided"}
            </p>
          </div>

          {/* Rejection Reason (if applicable) */}
          {proposal.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <label className="text-sm font-semibold text-red-800">
                Rejection Reason
              </label>
              <p className="text-red-700 mt-2">{proposal.rejectionReason}</p>
            </div>
          )}

          {/* Reject Form */}
          {showRejectForm && isStatusPending && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                className="w-full p-3 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="4"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleRejectSubmit}
                  disabled={loading || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold"
                >
                  {loading ? "Processing..." : "Confirm Rejection"}
                </button>
                <button
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason("");
                  }}
                  className="flex-1 px-4 py-2 bg-slate-300 text-slate-800 rounded-lg hover:bg-slate-400 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Action Buttons */}
        {isStatusPending && !showRejectForm && (
          <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 flex gap-3 justify-end">
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold"
            >
              {loading ? "Processing..." : "Reject Proposal"}
            </button>
            <button
              onClick={handleAccept}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
            >
              {loading ? "Processing..." : "Accept Proposal"}
            </button>
          </div>
        )}

        {/* Footer - Close Button */}
        {!isStatusPending && (
          <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 font-semibold"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
