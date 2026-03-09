import React, { useMemo, useState } from "react";
import { Icons } from "../constants";

const MOCK_PROPOSALS = [
  {
    id: "PR-2026-001",
    projectName: "SmartCore",
    title: "Customer Analytics Module",
    summary:
      "Company proposes a new analytics module to track retention, churn, and engagement with weekly executive reports.",
    budget: 12000,
    timeline: "6 weeks",
    submittedBy: "Company PM - Alice Smith",
    submittedAt: "Jan 28, 2026",
    status: "Pending",
    scope: [
      "Behavior tracking dashboard",
      "Weekly automated report pack",
      "Data export to CSV",
    ],
    deliverables: ["Wireframes", "Data model", "Reporting UI", "QA plan"],
    risks: ["Data source consistency", "Stakeholder sign-off on KPIs"],
    techStack: ["React", "Spring Boot", "PostgreSQL"],
  },
  {
    id: "PR-2026-002",
    projectName: "NexaFlow",
    title: "Workflow Builder Enhancements",
    summary:
      "Add drag-and-drop nodes, conditional routing, and approval gates to improve workflow creation speed.",
    budget: 18500,
    timeline: "8 weeks",
    submittedBy: "Company Lead - Daniel Park",
    submittedAt: "Feb 02, 2026",
    status: "Accepted",
    scope: ["Node palette redesign", "Conditional routing", "Approval gates"],
    deliverables: ["Prototype", "UI kit", "Implementation", "Docs"],
    risks: ["Complex conditional logic", "Training updates"],
    techStack: ["React", "Node.js", "Redis"],
    decisionAt: "Feb 06, 2026",
  },
  {
    id: "PR-2026-003",
    projectName: "AppNest",
    title: "Security Hardening Phase",
    summary:
      "Company proposes adding MFA, audit trails, and improved role permissions across the platform.",
    budget: 9800,
    timeline: "5 weeks",
    submittedBy: "Company PM - Sarah Lee",
    submittedAt: "Feb 05, 2026",
    status: "Rejected",
    scope: ["MFA setup", "Audit logs", "Permission review"],
    deliverables: ["Security checklist", "Implementation", "Testing"],
    risks: ["User adoption", "Compliance review"],
    techStack: ["React", "Spring Boot", "Okta"],
    decisionAt: "Feb 09, 2026",
  },
];

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-100 text-rose-700 border-rose-200",
};

const Proposals = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [proposals, setProposals] = useState(MOCK_PROPOSALS);
  const [selectedProposalId, setSelectedProposalId] = useState(null);

  const getDisplayStatus = (proposal) =>
    proposal.decisionAt ? proposal.status : "Pending";

  const filteredProposals = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    return proposals.filter((proposal) => {
      const matchesSearch =
        !normalizedTerm ||
        proposal.title.toLowerCase().includes(normalizedTerm) ||
        proposal.projectName.toLowerCase().includes(normalizedTerm) ||
        proposal.id.toLowerCase().includes(normalizedTerm);
      const matchesStatus =
        filterStatus === "All" || getDisplayStatus(proposal) === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [filterStatus, proposals, searchTerm]);

  const selectedProposal = useMemo(
    () => proposals.find((proposal) => proposal.id === selectedProposalId),
    [proposals, selectedProposalId],
  );

  const statusCounts = useMemo(() => {
    return proposals.reduce(
      (acc, proposal) => {
        const displayStatus = getDisplayStatus(proposal);
        acc.total += 1;
        acc[displayStatus] += 1;
        return acc;
      },
      { total: 0, Pending: 0, Accepted: 0, Rejected: 0 },
    );
  }, [proposals]);

  const handleDecision = (proposalId, decision) => {
    setProposals((prev) =>
      prev.map((proposal) =>
        proposal.id === proposalId
          ? {
              ...proposal,
              status: decision,
              decisionAt: new Date().toLocaleDateString(),
            }
          : proposal,
      ),
    );
  };

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

      <div className="flex flex-wrap items-center gap-3 lg:gap-6">
        <div className="relative flex-1 min-w-[220px]">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400">
            <Icons.Search />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-6 py-4 border border-transparent rounded-2xl bg-[#e5e7eb]/60 text-gray-900 placeholder-gray-500 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm"
            placeholder="Search proposals by project, title, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search proposals"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-6 py-4 bg-[#e5e7eb]/60 text-gray-900 font-bold rounded-2xl border border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          aria-label="Filter proposals by status"
        >
          <option>All</option>
          <option>Pending</option>
          <option>Accepted</option>
          <option>Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-x-auto">
        <table className="min-w-[720px] w-full table-fixed">
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[22%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[18%]" />
          </colgroup>
          <thead className="bg-[#f9fafb]">
            <tr>
              <th className="px-3 lg:px-8 py-4 text-left text-sm lg:text-lg font-bold text-gray-900">
                Proposal ID
              </th>
              <th className="px-3 lg:px-8 py-4 text-left text-sm lg:text-lg font-bold text-gray-900">
                Project & Title
              </th>
              <th className="px-3 lg:px-6 py-4 text-left text-sm lg:text-lg font-bold text-gray-900">
                Budget
              </th>
              <th className="px-3 lg:px-6 py-4 text-left text-sm lg:text-lg font-bold text-gray-900">
                Timeline
              </th>
              <th className="px-3 lg:px-6 py-4 text-center text-sm lg:text-lg font-bold text-gray-900">
                Status
              </th>
              <th className="px-3 lg:px-6 py-4 text-center text-sm lg:text-lg font-bold text-gray-900">
                View
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredProposals.length > 0 ? (
              filteredProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50/50">
                  <td className="px-3 lg:px-8 py-4 align-middle">
                    <p className="text-sm font-bold text-gray-900">
                      {proposal.id}
                    </p>
                    <p className="text-xs text-gray-500 font-semibold">
                      {proposal.submittedAt}
                    </p>
                  </td>
                  <td className="px-3 lg:px-8 py-4 align-middle">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {proposal.projectName}
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {proposal.title}
                    </p>
                    <p className="text-xs text-gray-500 font-semibold">
                      {proposal.submittedBy}
                    </p>
                  </td>
                  <td className="px-3 lg:px-6 py-4 align-middle">
                    <span className="text-sm font-bold text-gray-900">
                      ${proposal.budget.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 lg:px-6 py-4 align-middle">
                    <span className="text-sm font-semibold text-gray-700">
                      {proposal.timeline}
                    </span>
                  </td>
                  <td className="px-3 lg:px-6 py-4 text-center align-middle">
                    {(() => {
                      const displayStatus = getDisplayStatus(proposal);
                      return (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold ${
                            STATUS_STYLES[displayStatus]
                          }`}
                        >
                          {displayStatus}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-3 lg:px-6 py-4 text-center align-middle">
                    <button
                      type="button"
                      onClick={() => setSelectedProposalId(proposal.id)}
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
                  No proposals match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedProposal && (
        <ProposalModal
          proposal={selectedProposal}
          onClose={() => setSelectedProposalId(null)}
          onDecision={handleDecision}
        />
      )}
    </div>
  );
};

const ProposalModal = ({ proposal, onClose, onDecision }) => (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-labelledby="proposal-modal-title"
  >
    <div
      className="bg-white rounded-2xl w-full max-w-[90vw] lg:max-w-4xl max-h-[90vh] overflow-auto"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="sticky top-0 bg-gradient-to-r from-[#7c3aed] to-[#a855f7] p-6 flex justify-between items-center">
        <div>
          <h2
            id="proposal-modal-title"
            className="text-white font-bold text-2xl"
          >
            {proposal.title}
          </h2>
          <p className="text-purple-100 text-sm mt-1">
            {proposal.id} • {proposal.projectName}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          aria-label="Close proposal details"
        >
          ✕
        </button>
      </div>
      <div className="p-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          {(() => {
            const displayStatus = proposal.decisionAt
              ? proposal.status
              : "Pending";
            return (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold ${
                  STATUS_STYLES[displayStatus]
                }`}
              >
                {displayStatus}
              </span>
            );
          })()}
          {proposal.decisionAt && (
            <span className="text-xs font-bold text-gray-500">
              Decision date: {proposal.decisionAt}
            </span>
          )}
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
          <p className="text-sm font-bold text-gray-600">Summary</p>
          <p className="text-gray-700 text-sm leading-relaxed mt-2">
            {proposal.summary}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DetailStat
            label="Budget"
            value={`$${proposal.budget.toLocaleString()}`}
          />
          <DetailStat label="Timeline" value={proposal.timeline} />
          <DetailStat label="Submitted By" value={proposal.submittedBy} />
          <DetailStat
            label="Tech Stack"
            value={proposal.techStack.join(", ")}
          />
        </div>

        <ListBlock title="Scope" items={proposal.scope} />
        <ListBlock title="Deliverables" items={proposal.deliverables} />
        <ListBlock title="Risks" items={proposal.risks} />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              onDecision(proposal.id, "Accepted");
              onClose();
            }}
            disabled={Boolean(proposal.decisionAt)}
            className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl font-bold transition ${
              proposal.decisionAt
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-emerald-500 text-white hover:bg-emerald-600"
            }`}
          >
            Accept Proposal
          </button>
          <button
            type="button"
            onClick={() => {
              onDecision(proposal.id, "Rejected");
              onClose();
            }}
            disabled={Boolean(proposal.decisionAt)}
            className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl font-bold transition ${
              proposal.decisionAt
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-rose-500 text-white hover:bg-rose-600"
            }`}
          >
            Reject Proposal
          </button>
        </div>
      </div>
    </div>
  </div>
);

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

const DetailStat = ({ label, value }) => (
  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
      {label}
    </p>
    <p className="text-sm font-bold text-gray-900 mt-2">{value}</p>
  </div>
);

const ListBlock = ({ title, items }) => (
  <div>
    <p className="text-sm font-bold text-gray-700 mb-2">{title}</p>
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700"
        >
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default Proposals;
