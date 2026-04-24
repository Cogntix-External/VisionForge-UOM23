"use client";

import React, { useMemo, useState } from "react";
import { acceptProposal, rejectProposal } from "@/services/api";

const fallbackProject = {
  id: "N/A",
  title: "No proposal selected",
  clientId: "Not assigned",
  clientName: "",
  companyId: "",
  description: "No proposal was selected.",
  status: "PENDING",
  totalBudget: null,
  totalDurationDays: null,
  budgetData: [],
  timelines: [],
};

function normalizeStatus(status) {
  return String(status || "PENDING").trim().toUpperCase();
}

function getStatusColor(status) {
  switch (normalizeStatus(status)) {
    case "ACCEPTED":
      return "bg-green-100 text-green-800 border-green-300";
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
  }
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "-";
  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value);
  return `$${amount.toFixed(2)}`;
}

function buildBudgetRows(project, projectBudgetData) {
  if (Array.isArray(projectBudgetData) && projectBudgetData.length > 0) {
    return projectBudgetData;
  }

  if (Array.isArray(project.budgetData) && project.budgetData.length > 0) {
    return project.budgetData;
  }

  if (project.totalBudget !== null && project.totalBudget !== undefined) {
    return [
      {
        item: "Total Budget",
        description: project.description || "Budget summary",
        quantity: "-",
        unitPrice: "-",
        total: project.totalBudget,
      },
    ];
  }

  return [];
}

function buildTimelineRows(project, projectTimelineData) {
  if (Array.isArray(projectTimelineData) && projectTimelineData.length > 0) {
    return projectTimelineData;
  }

  if (Array.isArray(project.timelines) && project.timelines.length > 0) {
    return project.timelines;
  }

  if (
    project.totalDurationDays !== null &&
    project.totalDurationDays !== undefined
  ) {
    return [
      {
        phase: "Overall Delivery",
        startDate: "-",
        endDate: "-",
        duration: `${project.totalDurationDays} days`,
        assignedTo: "-",
        status: normalizeStatus(project.status),
      },
    ];
  }

  return [];
}

export default function ProposalDetailsSection({
  selectedProject,
  onBack = () => {},
  detailsView = null,
  setDetailsView = () => {},
  projectBudgetData = [],
  projectTimelineData = [],
  clientId = null,
  companyId = null,
  onProposalUpdate = () => {},
}) {
  const project = selectedProject || fallbackProject;
  const isFallbackProject = !selectedProject;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const budgetRows = useMemo(
    () => buildBudgetRows(project, projectBudgetData),
    [project, projectBudgetData],
  );
  const timelineRows = useMemo(
    () => buildTimelineRows(project, projectTimelineData),
    [project, projectTimelineData],
  );

  const submittedDate = project.submittedAt
    ? project.submittedAt
    : project.createdAt
      ? new Date(project.createdAt).toLocaleDateString()
      : "-";
  const updatedDate = project.updatedAt
    ? new Date(project.updatedAt).toLocaleDateString()
    : submittedDate;

  const handleAccept = async () => {
    if (!clientId || !project.id || companyId) return;

    setLoading(true);
    setError(null);

    try {
      const updatedProposal = await acceptProposal(project.id);
      onProposalUpdate(updatedProposal);
      alert("Proposal accepted successfully!");
    } catch (err) {
      setError(err.message || "Failed to accept proposal");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!clientId || !project.id || companyId) return;

    if (!rejectionReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedProposal = await rejectProposal(
        project.id,
        rejectionReason.trim(),
      );
      onProposalUpdate(updatedProposal);
      setShowRejectModal(false);
      setRejectionReason("");
      alert("Proposal rejected successfully!");
    } catch (err) {
      setError(err.message || "Failed to reject proposal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Proposal Details</h1>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-slate-400 text-white rounded hover:bg-slate-500"
        >
          Back to Proposals
        </button>
      </div>

      {isFallbackProject && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 mb-6">
          Open this page from the proposals list to view a specific proposal.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100 mb-6">
        <div className="flex justify-between items-start gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{project.title}</h2>
            <p className="text-slate-600 mt-2">{project.description}</p>
          </div>

          {!isFallbackProject &&
            !companyId &&
            normalizeStatus(project.status) === "PENDING" && (
              <div className="flex gap-3">
                <button
                  onClick={handleAccept}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                >
                  {loading ? "Processing..." : "Accept Proposal"}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 font-semibold"
                >
                  {loading ? "Processing..." : "Reject Proposal"}
                </button>
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard label="Proposal ID" value={project.id} />
          <InfoCard
            label="Client"
            value={project.clientName || project.clientId || project.client || "-"}
          />
          <InfoCard label="Company ID" value={project.companyId || "-"} />
          <InfoCard label="Submitted Date" value={submittedDate} />
          <InfoCard label="Last Updated" value={updatedDate} />
          <InfoCard
            label="Status"
            value={normalizeStatus(project.status)}
            valueClassName={`inline-block border rounded px-3 py-1 ${getStatusColor(project.status)}`}
          />
          <InfoCard
            label="Total Budget"
            value={formatCurrency(project.totalBudget)}
          />
          <InfoCard
            label="Total Duration"
            value={
              project.totalDurationDays !== null &&
              project.totalDurationDays !== undefined
                ? `${project.totalDurationDays} days`
                : "-"
            }
          />
          {project.rejectionReason && normalizeStatus(project.status) === "REJECTED" && (
            <InfoCard
              label="Rejection Reason"
              value={project.rejectionReason}
              valueClassName="text-red-700"
            />
          )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setDetailsView("budget")}
            className="px-4 py-3 bg-[#000066] text-white rounded hover:bg-blue-900 font-semibold"
          >
            Estimated Budget
          </button>
          <button
            onClick={() => setDetailsView("timeline")}
            className="px-4 py-3 bg-[#000066] text-white rounded hover:bg-blue-900 font-semibold"
          >
            Estimated Timeline
          </button>
        </div>
      </div>

      {detailsView === "budget" && (
        <SectionCard title="Estimated Budget">
          <ReadOnlyTable
            headers={["Item", "Description", "Quantity", "Unit Price", "Total"]}
            rows={budgetRows}
            emptyMessage="No budget details available."
            renderRow={(row, idx) => (
              <tr key={`${row.item || "budget"}-${idx}`}>
                <TableCell>{row.item || "-"}</TableCell>
                <TableCell>{row.description || "-"}</TableCell>
                <TableCell>{row.quantity || "-"}</TableCell>
                <TableCell>
                  {row.unitPrice && row.unitPrice !== "-"
                    ? formatCurrency(row.unitPrice)
                    : "-"}
                </TableCell>
                <TableCell>{formatCurrency(row.total)}</TableCell>
              </tr>
            )}
          />
          <BackRow onBack={() => setDetailsView(null)} />
        </SectionCard>
      )}

      {detailsView === "timeline" && (
        <SectionCard title="Estimated Timeline">
          <ReadOnlyTable
            headers={[
              "Phase",
              "Start Date",
              "End Date",
              "Duration",
              "Assigned To",
              "Status",
            ]}
            rows={timelineRows}
            emptyMessage="No timeline details available."
            renderRow={(row, idx) => (
              <tr key={`${row.phase || "timeline"}-${idx}`}>
                <TableCell>{row.phase || "-"}</TableCell>
                <TableCell>{row.startDate || "-"}</TableCell>
                <TableCell>{row.endDate || "-"}</TableCell>
                <TableCell>{row.duration || "-"}</TableCell>
                <TableCell>{row.assignedTo || "-"}</TableCell>
                <TableCell>{row.status || "-"}</TableCell>
              </tr>
            )}
          />
          <BackRow onBack={() => setDetailsView(null)} />
        </SectionCard>
      )}

      {detailsView === null && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Overview</h2>
          <p className="text-slate-600 leading-relaxed">
            Use the buttons above to view the submitted budget and timeline
            details for this proposal.
          </p>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Reject Proposal
            </h3>
            <p className="text-slate-600 mb-6">
              Please provide a reason for rejecting this proposal.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-slate-200 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows="4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                className="flex-1 px-4 py-2 bg-slate-400 text-white rounded hover:bg-slate-500 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={loading || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 font-semibold"
              >
                {loading ? "Processing..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({
  label,
  value,
  valueClassName = "font-semibold text-slate-700",
}) {
  return (
    <div className="bg-slate-50 p-4 rounded-lg">
      <p className="text-xs text-slate-400 uppercase font-bold mb-2">{label}</p>
      <p className={valueClassName}>{value}</p>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100 mb-6">
      <h2 className="text-lg font-bold text-slate-800 mb-6">{title}</h2>
      {children}
    </div>
  );
}

function ReadOnlyTable({ headers, rows, renderRow, emptyMessage }) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50">
            {headers.map((header) => (
              <th
                key={header}
                className="border border-slate-200 p-3 text-left"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map(renderRow)
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="border border-slate-200 p-4 text-center text-slate-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function BackRow({ onBack }) {
  return (
    <div className="flex gap-3 flex-wrap">
      <button
        onClick={onBack}
        className="px-4 py-2 bg-slate-400 text-white rounded hover:bg-slate-500 font-bold"
      >
        Back
      </button>
    </div>
  );
}

function TableCell({ children }) {
  return <td className="border border-slate-200 p-3">{children}</td>;
}
