"use client";

import React, { useState } from "react";
import { Paperclip } from "lucide-react";
import { acceptProposal, rejectProposal } from "@/services/api";

const fallbackProject = {
  id: "N/A",
  title: "No proposal selected",
  lastUpdated: "Not available",
  client: "Not assigned",
  status: "Draft",
  budgetData: [],
  timelines: [],
};

const emptyBudgetRow = {
  item: "",
  description: "",
  quantity: "",
  unitPrice: "",
  total: "",
};

const emptyTimelineRow = {
  phase: "",
  startDate: "",
  endDate: "",
  duration: "",
  assignedTo: "",
  status: "",
};

const emptyMilestoneRow = {
  milestone: "",
  targetDate: "",
  paymentAmount: "",
};

export default function ProposalDetailsSection({
  selectedProject,
  onBack = () => {},
  detailsView = null,
  setDetailsView = () => {},
  projectBudgetData = [],
  setProjectBudgetData = () => {},
  projectTimelineData = [],
  setProjectTimelineData = () => {},
  projectMilestoneData = [],
  setProjectMilestoneData = () => {},
  uploadedFile = null,
  setUploadedFile = () => {},
  clientId = null,
  onProposalUpdate = () => {},
}) {
  const project = selectedProject || fallbackProject;
  const isFallbackProject = !selectedProject;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "ACCEPTED":
        return "bg-green-100 text-green-800 border-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const handleAccept = async () => {
    if (!clientId || !project.id) {
      setError("Missing client ID or proposal ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedProposal = await acceptProposal(project.id, clientId);
      onProposalUpdate(updatedProposal);
      alert("Proposal accepted successfully!");
    } catch (err) {
      setError(err.message || "Failed to accept proposal");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!clientId || !project.id) {
      setError("Missing client ID or proposal ID");
      return;
    }

    if (!rejectionReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedProposal = await rejectProposal(project.id, clientId, rejectionReason);
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

  const addBudgetRow = () => {
    setProjectBudgetData([...projectBudgetData, { ...emptyBudgetRow }]);
  };

  const addTimelineRow = () => {
    setProjectTimelineData([...projectTimelineData, { ...emptyTimelineRow }]);
  };

  const addMilestoneRow = () => {
    setProjectMilestoneData([...projectMilestoneData, { ...emptyMilestoneRow }]);
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
          Open this page from the proposals list to view a specific proposal. Placeholder data is shown until a proposal is selected.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100 mb-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-lg font-bold text-slate-800">Proposal Details</h2>
          {!isFallbackProject && project.status === "PENDING" && (
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
          <InfoCard label="Project Title" value={project.title} />
          <InfoCard label="Last Updater" value={project.lastUpdated} />
          <InfoCard label="Proposal ID" value={project.id} />
          <InfoCard label="Client name" value={project.client || "John Doe"} />
          <InfoCard
            label="Status"
            value={project.status}
            valueClassName={`inline-block border rounded px-3 py-1 ${getStatusColor(project.status)}`}
          />
          {project.rejectionReason && project.status === "REJECTED" && (
            <InfoCard label="Rejection Reason" value={project.rejectionReason} valueClassName="text-red-700" />
          )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100 mb-6">
        <p className="text-slate-600 leading-relaxed mb-6">
          to help teams achieve timely and manageable results with intelligent decision making.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <button
            onClick={() => setDetailsView("milestone")}
            className="px-4 py-3 bg-[#000066] text-white rounded hover:bg-blue-900 font-semibold"
          >
            Payment Milestone
          </button>
        </div>
      </div>

      {detailsView === "budget" && (
        <SectionCard title="Estimated Budget">
          <EditableTable
            headers={["Item", "Description", "Quantity", "Unit price", "Total"]}
            rows={projectBudgetData}
            renderRow={(row, idx) => (
              <tr key={idx}>
                <TableCell>
                  <TextInput
                    value={row.item}
                    onChange={(value) => updateRow(setProjectBudgetData, projectBudgetData, idx, "item", value)}
                  />
                </TableCell>
                <TableCell>
                  <TextInput
                    value={row.description}
                    onChange={(value) => updateRow(setProjectBudgetData, projectBudgetData, idx, "description", value)}
                  />
                </TableCell>
                <TableCell>
                  <NumberInput
                    value={row.quantity}
                    onChange={(value) => updateRow(setProjectBudgetData, projectBudgetData, idx, "quantity", value)}
                  />
                </TableCell>
                <TableCell>
                  <NumberInput
                    value={row.unitPrice}
                    onChange={(value) => updateRow(setProjectBudgetData, projectBudgetData, idx, "unitPrice", value)}
                  />
                </TableCell>
                <TableCell>
                  <NumberInput
                    value={row.total}
                    onChange={(value) => updateRow(setProjectBudgetData, projectBudgetData, idx, "total", value)}
                  />
                </TableCell>
              </tr>
            )}
          />
          <ActionRow
            onAdd={addBudgetRow}
            onBack={() => setDetailsView(null)}
            onSave={() => {}}
          />
        </SectionCard>
      )}

      {detailsView === "timeline" && (
        <SectionCard title="Estimated Timeline">
          <EditableTable
            headers={["Phase", "Start Date", "End Date", "Duration", "Assigned To", "Status"]}
            rows={projectTimelineData}
            renderRow={(row, idx) => (
              <tr key={idx}>
                <TableCell>
                  <TextInput value={row.phase} onChange={(value) => updateRow(setProjectTimelineData, projectTimelineData, idx, "phase", value)} />
                </TableCell>
                <TableCell>
                  <DateInput value={row.startDate} onChange={(value) => updateRow(setProjectTimelineData, projectTimelineData, idx, "startDate", value)} />
                </TableCell>
                <TableCell>
                  <DateInput value={row.endDate} onChange={(value) => updateRow(setProjectTimelineData, projectTimelineData, idx, "endDate", value)} />
                </TableCell>
                <TableCell>
                  <TextInput value={row.duration} onChange={(value) => updateRow(setProjectTimelineData, projectTimelineData, idx, "duration", value)} />
                </TableCell>
                <TableCell>
                  <TextInput value={row.assignedTo} onChange={(value) => updateRow(setProjectTimelineData, projectTimelineData, idx, "assignedTo", value)} />
                </TableCell>
                <TableCell>
                  <TextInput value={row.status} onChange={(value) => updateRow(setProjectTimelineData, projectTimelineData, idx, "status", value)} />
                </TableCell>
              </tr>
            )}
          />
          <ActionRow
            onAdd={addTimelineRow}
            onBack={() => setDetailsView(null)}
            onSave={() => {}}
          />
        </SectionCard>
      )}

      {detailsView === "milestone" && (
        <SectionCard title="Payment Milestone Structure">
          <EditableTable
            headers={["Milestone", "Target Date", "Payment Amount"]}
            rows={projectMilestoneData}
            renderRow={(row, idx) => (
              <tr key={idx}>
                <TableCell>
                  <TextInput value={row.milestone} onChange={(value) => updateRow(setProjectMilestoneData, projectMilestoneData, idx, "milestone", value)} />
                </TableCell>
                <TableCell>
                  <DateInput value={row.targetDate} onChange={(value) => updateRow(setProjectMilestoneData, projectMilestoneData, idx, "targetDate", value)} />
                </TableCell>
                <TableCell>
                  <TextInput value={row.paymentAmount} onChange={(value) => updateRow(setProjectMilestoneData, projectMilestoneData, idx, "paymentAmount", value)} />
                </TableCell>
              </tr>
            )}
          />
          <ActionRow
            onAdd={addMilestoneRow}
            onBack={() => setDetailsView(null)}
            onSave={() => {}}
          />
        </SectionCard>
      )}

      {detailsView === null && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Technical Specifications</h2>
          <div className="space-y-4 mb-6">
            <p className="font-semibold text-slate-700">Required Technologies</p>
            <p className="font-semibold text-slate-700">Required Milestone Structure</p>
            <p className="font-semibold text-slate-700">Additional teamwork</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <input
              type="file"
              id="fileInput"
              onChange={(event) => setUploadedFile(event.target.files?.[0] || null)}
              style={{ display: "none" }}
              accept="*/*"
            />
            <button
              onClick={() => document.getElementById("fileInput")?.click()}
              className="px-6 py-3 bg-slate-600 text-white rounded hover:bg-slate-700 font-semibold flex items-center gap-2"
            >
              <Paperclip className="w-4 h-4" />
              {uploadedFile ? uploadedFile.name : "Attach: Technical Document"}
            </button>
            {uploadedFile && <span className="text-sm text-green-600 font-semibold">File attached: {uploadedFile.name}</span>}
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Reject Proposal</h3>
            <p className="text-slate-600 mb-6">Please provide a reason for rejecting this proposal. This will be saved for your records.</p>
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

function InfoCard({ label, value, valueClassName = "font-semibold text-slate-700" }) {
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

function EditableTable({ headers, rows, renderRow }) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50">
            {headers.map((header) => (
              <th key={header} className="border border-slate-200 p-3 text-left">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows.map(renderRow)}</tbody>
      </table>
    </div>
  );
}

function ActionRow({ onAdd, onBack, onSave }) {
  return (
    <div className="flex gap-3 flex-wrap">
      <button onClick={onAdd} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold">
        Add a Row
      </button>
      <button onClick={onBack} className="px-4 py-2 bg-slate-400 text-white rounded hover:bg-slate-500 font-bold">
        Move Back
      </button>
      <button onClick={onSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold">
        Save Changes
      </button>
    </div>
  );
}

function TableCell({ children }) {
  return <td className="border border-slate-200 p-3">{children}</td>;
}

function TextInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full p-2 bg-slate-50 rounded border border-slate-200"
    />
  );
}

function NumberInput({ value, onChange }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full p-2 bg-slate-50 rounded border border-slate-200"
    />
  );
}

function DateInput({ value, onChange }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full p-2 bg-slate-50 rounded border border-slate-200"
    />
  );
}

function updateRow(setter, rows, index, key, value) {
  const nextRows = [...rows];
  nextRows[index] = { ...nextRows[index], [key]: value };
  setter(nextRows);
}
