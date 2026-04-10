import React, { useEffect, useMemo, useState } from "react";
import {
  getClientProposals,
  getCompanyProposals,
  getClientProposalById,
  acceptProposal,
  rejectProposal,
} from "../services/api";

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-100 text-rose-700 border-rose-200",
};

const normalizeStatus = (rawStatus) => {
  const value = String(rawStatus || "")
    .trim()
    .toUpperCase();
  if (value === "ACCEPTED") return "Accepted";
  if (value === "REJECTED") return "Rejected";
  return "Pending";
};

const formatProposal = (proposal, role) => ({
  id: proposal.id,
  title: proposal.title,
  projectName: proposal.title || "Untitled Project",
  companyName:
    role === "COMPANY"
      ? proposal.clientId || "Unassigned Client"
      : proposal.companyId,
  companyId: proposal.companyId,
  clientId: proposal.clientId,
  description: proposal.description || "No description provided",
  submittedAt: proposal.createdAt
    ? new Date(proposal.createdAt).toLocaleDateString()
    : "-",
  status: normalizeStatus(proposal.status),
  rejectionReason: proposal.rejectionReason || "",
});

const Proposals = ({ role }) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const currentRole = useMemo(() => {
    if (role) return String(role).toUpperCase();

    if (typeof window === "undefined") return "CLIENT";

    try {
      const storedUser = JSON.parse(localStorage.getItem("crms_user") || "{}");
      return String(storedUser.role || "CLIENT").toUpperCase();
    } catch {
      return "CLIENT";
    }
  }, [role]);

  useEffect(() => {
    fetchProposals();
  }, [currentRole]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setPageError("");
      const data =
        currentRole === "COMPANY"
          ? await getCompanyProposals()
          : await getClientProposals();
      setProposals(data.map((proposal) => formatProposal(proposal, currentRole)));
    } catch (error) {
      console.error(error);
      setPageError(error.message || "Failed to fetch proposals");
    } finally {
      setLoading(false);
    }
  };

  const statusCounts = useMemo(() => {
    return proposals.reduce(
      (acc, proposal) => {
        acc.total += 1;
        acc[proposal.status] += 1;
        return acc;
      },
      { total: 0, Pending: 0, Accepted: 0, Rejected: 0 },
    );
  }, [proposals]);

  const handleViewProposal = async (proposalId) => {
    try {
      setModalLoading(true);
      setModalError("");
      if (currentRole === "COMPANY") {
        setSelectedProposal(
          proposals.find((proposal) => proposal.id === proposalId) || null,
        );
        return;
      }

      const data = await getClientProposalById(proposalId);
      setSelectedProposal(formatProposal(data, currentRole));
    } catch (error) {
      console.error(error);
      setModalError(error.message || "Failed to fetch proposal details");
      setSelectedProposal((prev) =>
        prev ? prev : proposals.find((p) => p.id === proposalId) || null,
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!selectedProposal) return;

    try {
      setModalLoading(true);
      setModalError("");
      const updated = await acceptProposal(selectedProposal.id);
      const formatted = formatProposal(updated, currentRole);

      setSelectedProposal(formatted);
      setProposals((prev) =>
        prev.map((p) => (p.id === formatted.id ? formatted : p)),
      );
    } catch (error) {
      console.error(error);
      setModalError(error.message || "Failed to accept proposal");
    } finally {
      setModalLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProposal) return;

    try {
      setModalLoading(true);
      setModalError("");
      const updated = await rejectProposal(
        selectedProposal.id,
        rejectReason || "No reason provided",
      );
      const formatted = formatProposal(updated, currentRole);

      setSelectedProposal(formatted);
      setProposals((prev) =>
        prev.map((p) => (p.id === formatted.id ? formatted : p)),
      );
      setRejectReason("");
    } catch (error) {
      console.error(error);
      setModalError(error.message || "Failed to reject proposal");
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg">
        Loading proposals...
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 text-red-800 rounded-lg">
        {pageError}
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 -mt-6 relative z-10 px-2 sm:px-4 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Proposals" value={statusCounts.total} />
        <SummaryCard
          label="Pending"
          value={statusCounts.Pending}
          tone="amber"
        />
        <SummaryCard
          label="Accepted"
          value={statusCounts.Accepted}
          tone="emerald"
        />
        <SummaryCard
          label="Rejected"
          value={statusCounts.Rejected}
          tone="rose"
        />
      </div>

      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-x-auto">
        <table className="min-w-[720px] w-full table-fixed">
          <thead className="bg-[#f9fafb]">
            <tr>
              <th className="px-6 py-4 text-left text-lg font-bold text-gray-900">
                Proposal ID
              </th>
              <th className="px-6 py-4 text-left text-lg font-bold text-gray-900">
                Title
              </th>
              <th className="px-6 py-4 text-left text-lg font-bold text-gray-900">
                {currentRole === "COMPANY" ? "Client" : "Company"}
              </th>
              <th className="px-6 py-4 text-left text-lg font-bold text-gray-900">
                Submitted
              </th>
              <th className="px-6 py-4 text-center text-lg font-bold text-gray-900">
                Status
              </th>
              <th className="px-6 py-4 text-center text-lg font-bold text-gray-900">
                View
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {proposals.length > 0 ? (
              proposals.map((proposal) => (
                <tr key={proposal.id}>
                  <td className="px-6 py-4 font-bold">{proposal.id}</td>
                  <td className="px-6 py-4">{proposal.title}</td>
                  <td className="px-6 py-4">{proposal.companyName}</td>
                  <td className="px-6 py-4">{proposal.submittedAt}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold ${
                        STATUS_STYLES[proposal.status]
                      }`}
                    >
                      {proposal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleViewProposal(proposal.id)}
                      className="inline-flex items-center justify-center px-4 py-2 bg-[#bbf7d0] text-[#166534] text-sm font-bold rounded-full hover:bg-[#86efac] transition-all"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-8 py-16 text-center text-lg font-bold text-gray-400"
                >
                  No proposals available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedProposal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedProposal(null);
            setModalError("");
            setRejectReason("");
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">
                Proposal Details
              </h2>
              <button
                onClick={() => {
                  setSelectedProposal(null);
                  setModalError("");
                  setRejectReason("");
                }}
                className="text-3xl text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="p-8 space-y-6">
              {modalError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {modalError}
                </div>
              )}

              {modalLoading && (
                <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
                  Processing...
                </div>
              )}

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-bold ${
                  STATUS_STYLES[selectedProposal.status]
                }`}
              >
                {selectedProposal.status}
              </span>

              <div className="grid grid-cols-2 gap-6">
                <DetailBlock
                  label="Project Title"
                  value={selectedProposal.title}
                />
                <DetailBlock label="Proposal ID" value={selectedProposal.id} />
                <DetailBlock
                  label="Company Name"
                  value={selectedProposal.companyName}
                />
                <DetailBlock
                  label="Submitted Date"
                  value={selectedProposal.submittedAt}
                />
              </div>

              <DetailBlock
                label="Description"
                value={
                  selectedProposal.description || "No description provided"
                }
              />

              {currentRole !== "COMPANY" && selectedProposal.status === "Pending" && (
                <div className="space-y-4">
                  <textarea
                    className="w-full border rounded-xl p-4"
                    rows={4}
                    placeholder="Enter rejection reason (optional)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleReject}
                      className="flex-1 px-4 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700"
                    >
                      Reject Proposal
                    </button>

                    <button
                      type="button"
                      onClick={handleAccept}
                      className="flex-1 px-4 py-3 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700"
                    >
                      Accept Proposal
                    </button>
                  </div>
                </div>
              )}

              {selectedProposal.status === "Rejected" &&
                selectedProposal.rejectionReason && (
                  <DetailBlock
                    label="Rejection Reason"
                    value={selectedProposal.rejectionReason}
                  />
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, tone }) => {
  const toneStyles = {
    amber: "from-amber-400 to-amber-500",
    emerald: "from-emerald-400 to-emerald-500",
    rose: "from-rose-400 to-rose-500",
  };

  return (
    <div className="bg-white p-6 rounded-[28px] shadow-lg border border-gray-100 relative overflow-hidden">
      {tone && (
        <div
          className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${toneStyles[tone]} opacity-10 -mr-6 -mt-6 rounded-full`}
        />
      )}
      <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
        {label}
      </p>
      <p className="text-3xl font-extrabold text-gray-900 mt-3">{value}</p>
    </div>
  );
};

const DetailBlock = ({ label, value }) => (
  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
    <p className="text-sm font-bold text-gray-600">{label}</p>
    <p className="text-gray-900 text-lg mt-2">{value}</p>
  </div>
);

export default Proposals;
