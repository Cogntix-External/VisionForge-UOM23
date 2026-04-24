import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getClientProposals,
  getCompanyProposals,
} from "../services/api";
import { mergeProposalWithCachedDetails } from "../utils/proposalDetailsCache";

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
  title: proposal.title || "Untitled Proposal",
  companyName:
    role === "COMPANY"
      ? proposal.clientName || proposal.clientId || "Unassigned Client"
      : proposal.companyId || "Unknown Company",
  companyId: proposal.companyId || "",
  clientId: proposal.clientId || "",
  clientName: proposal.clientName || "",
  description: proposal.description || "No description provided",
  submittedAt: proposal.createdAt
    ? new Date(proposal.createdAt).toLocaleDateString()
    : "-",
  createdAt: proposal.createdAt || null,
  updatedAt: proposal.updatedAt || null,
  totalBudget: proposal.totalBudget ?? null,
  totalDurationDays: proposal.totalDurationDays ?? null,
  budgetData: proposal.budgetData || [],
  timelines: proposal.timelines || [],
  status: normalizeStatus(proposal.status),
  rawStatus: String(proposal.status || "PENDING").toUpperCase(),
  rejectionReason: proposal.rejectionReason || "",
});

const Proposals = ({ role }) => {
  const router = useRouter();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

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
    const fetchProposals = async () => {
      try {
        setLoading(true);
        setPageError("");
        const data =
          currentRole === "COMPANY"
            ? await getCompanyProposals()
            : await getClientProposals();

        setProposals(
          (Array.isArray(data) ? data : []).map((proposal) =>
            formatProposal(
              mergeProposalWithCachedDetails(proposal),
              currentRole,
            ),
          ),
        );
      } catch (error) {
        console.error(error);
        setPageError(error.message || "Failed to fetch proposals");
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [currentRole]);

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

  const handleViewProposal = (proposalId) => {
    const selected =
      proposals.find((proposal) => proposal.id === proposalId) || null;

    if (typeof window !== "undefined" && selected) {
      window.sessionStorage.setItem(
        "crms:selectedProposal",
        JSON.stringify(selected),
      );
    }

    const basePath =
      currentRole === "COMPANY"
        ? "/company/ProposalDetailsSection"
        : "/client/ProposalDetailsSection";

    router.push(`${basePath}?proposalId=${encodeURIComponent(proposalId)}`);
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
        <table className="w-full">
          <thead className="bg-[#f9fafb] sticky top-0">
            <tr>
              <th className="px-6 py-5 text-left text-base font-bold text-gray-900 w-[16%]">
                Proposal ID
              </th>
              <th className="px-6 py-5 text-left text-base font-bold text-gray-900 w-[24%]">
                Title
              </th>
              <th className="px-6 py-5 text-left text-base font-bold text-gray-900 w-[20%]">
                {currentRole === "COMPANY" ? "Client" : "Company"}
              </th>
              <th className="px-6 py-5 text-left text-base font-bold text-gray-900 w-[16%]">
                Submitted
              </th>
              <th className="px-6 py-5 text-center text-base font-bold text-gray-900 w-[14%]">
                Status
              </th>
              <th className="px-6 py-5 text-center text-base font-bold text-gray-900 w-[10%]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {proposals.length > 0 ? (
              proposals.map((proposal) => (
                <tr
                  key={proposal.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td
                    className="px-6 py-4 font-semibold text-gray-900 truncate"
                    title={proposal.id}
                  >
                    {proposal.id.substring(0, 12)}...
                  </td>
                  <td
                    className="px-6 py-4 text-gray-700 truncate"
                    title={proposal.title}
                  >
                    {proposal.title}
                  </td>
                  <td
                    className="px-6 py-4 text-gray-700 truncate"
                    title={proposal.companyName}
                  >
                    {proposal.companyName}
                  </td>
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                    {proposal.submittedAt}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold whitespace-nowrap ${
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
                      className="inline-flex items-center justify-center px-3 py-2 bg-[#bbf7d0] text-[#166534] text-xs font-bold rounded-full hover:bg-[#86efac] transition-all whitespace-nowrap"
                    >
                      View More
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

export default Proposals;
