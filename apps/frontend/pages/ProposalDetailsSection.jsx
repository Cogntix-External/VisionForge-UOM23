"use client";

import React from "react";
import { Paperclip } from "lucide-react";

export default function ProposalDetailsSection({
  selectedProject,
  onBack,
  detailsView,
  setDetailsView,
  projectBudgetData,
  setProjectBudgetData,
  projectTimelineData,
  setProjectTimelineData,
  projectMilestoneData,
  setProjectMilestoneData,
  uploadedFile,
  setUploadedFile
}) {
  if (!selectedProject) return null;

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

      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Proposal Details</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs text-slate-400 uppercase font-bold mb-2">
              Project Title
            </p>
            <p className="font-semibold text-slate-700">{selectedProject.title}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs text-slate-400 uppercase font-bold mb-2">
              Last Updater
            </p>
            <p className="font-semibold text-slate-700">
              {selectedProject.lastUpdated}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs text-slate-400 uppercase font-bold mb-2">
              Proposal ID
            </p>
            <p className="font-semibold text-slate-700">{selectedProject.id}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs text-slate-400 uppercase font-bold mb-2">
              Client name
            </p>
            <p className="font-semibold text-slate-700">
              {selectedProject.client || "John Doe"}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs text-slate-400 uppercase font-bold mb-2">Status</p>
            <p className="font-semibold text-slate-700">{selectedProject.status}</p>
          </div>
          <div />
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6">
          Budget and Timeline
        </h2>
        <p className="text-slate-600 mb-6">
          Project details: {selectedProject.title} is a state-of-the-art system
          designed to help teams achieve timely and manageable results with
          intelligent decision making.
        </p>
        <div className="grid grid-cols-3 gap-6">
          <button
            onClick={() => {
              setDetailsView("budget");
              setProjectBudgetData(
                selectedProject.budgetData || [
                  { item: "", description: "", quantity: "", unitPrice: "", total: "" }
                ]
              );
            }}
            className="px-4 py-3 bg-[#000066] text-white rounded hover:bg-blue-900 font-semibold"
          >
            Estimated Budget
          </button>
          <button
            onClick={() => {
              setDetailsView("timeline");
              setProjectTimelineData(
                selectedProject.timelines || [
                  { phase: "", startDate: "", endDate: "", duration: "", assignedTo: "", status: "" }
                ]
              );
            }}
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
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Estimated Budget</h2>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 p-3 text-left">Item</th>
                  <th className="border border-slate-200 p-3 text-left">Description</th>
                  <th className="border border-slate-200 p-3 text-left">Quantity</th>
                  <th className="border border-slate-200 p-3 text-left">Unit price</th>
                  <th className="border border-slate-200 p-3 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {projectBudgetData.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-200 p-3">
                      <input
                        type="text"
                        value={row.item}
                        onChange={(event) => {
                          const newData = [...projectBudgetData];
                          newData[idx].item = event.target.value;
                          setProjectBudgetData(newData);
                        }}
                        placeholder="Item"
                        className="w-full p-2 bg-slate-50 rounded border border-slate-200"
                      />
                    </td>
                    <td className="border border-slate-200 p-3">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(event) => {
                          const newData = [...projectBudgetData];
                          newData[idx].description = event.target.value;
                          setProjectBudgetData(newData);
                        }}
                        placeholder="Description"
                        className="w-full p-2 bg-slate-50 rounded border border-slate-200"
                      />
                    </td>
                    <td className="border border-slate-200 p-3">
                      <input
                        type="number"
                        value={row.quantity}
                        onChange={(event) => {
                          const newData = [...projectBudgetData];
                          newData[idx].quantity = event.target.value;
                          setProjectBudgetData(newData);
                        }}
                        placeholder="Quantity"
                        className="w-full p-2 bg-slate-50 rounded border border-slate-200"
                      />
                    </td>
                    <td className="border border-slate-200 p-3">
                      <input
                        type="number"
                        value={row.unitPrice}
                        onChange={(event) => {
                          const newData = [...projectBudgetData];
                          newData[idx].unitPrice = event.target.value;
                          setProjectBudgetData(newData);
                        }}
                        placeholder="Unit price"
                        className="w-full p-2 bg-slate-50 rounded border border-slate-200"
                      />
                    </td>
                    <td className="border border-slate-200 p-3">
                      <input
                        type="number"
                        value={row.total}
                        onChange={(event) => {
                          const newData = [...projectBudgetData];
                          newData[idx].total = event.target.value;
                          setProjectBudgetData(newData);
                        }}
                        placeholder="Total"
                        className="w-full p-2 bg-slate-50 rounded border border-slate-200"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() =>
                setProjectBudgetData([
                  ...projectBudgetData,
                  { item: "", description: "", quantity: "", unitPrice: "", total: "" }
                ])
              }
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
            >
              Add a Row
            </button>
            <button
              onClick={() => setDetailsView(null)}
              className="px-4 py-2 bg-slate-400 text-white rounded hover:bg-slate-500 font-bold"
            >
              Move Back
            </button>
            <button
              onClick={() => {}}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {detailsView === "timeline" && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Estimated Timeline</h2>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 p-3 text-left">Phase</th>
                  <th className="border border-slate-200 p-3 text-left">Start Date</th>
                  <th className="border border-slate-200 p-3 text-left">End Date</th>
                  <th className="border border-slate-200 p-3 text-left">Duration</th>
                  <th className="border border-slate-200 p-3 text-left">Assigned To</th>
                  <th className="border border-slate-200 p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {projectTimelineData.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-200 p-3">
                      <input
                        type="text"
                        value={row.phase}
                        onChange={(event) => {
                          const newData = [...projectTimelineData];
                          newData[idx].phase = event.target.value;
                          setProjectTimelineData(newData);
                        }}
                        placeholder="Phase"
                        className="w-full p-2 bg-slate-50 rounded border border-slate-200"
                      />
                    </td>
                    <td className="border border-slate-200 p-3">
                      <input
                        type="date"
                        value={row.startDate}
                        onChange={(event) => {
                          const newData = [...projectTimelineData];
                          newData[idx].startDate = event.target.value;
                          setProjectTimelineData(newData);
                        }}
                        className="w-full p-2 bg-slate-50 rounded border border-slate-200"
                      />
                    </td>
                    <td className="border border-slate-200 p-3">
                      <input
                        type="date"
                        value={row.endDate}
                        onChange={(event) => {
                          const newData = [...projectTimelineData];
                          newData[idx].endDate = event.target.value;
                          setProjectTimelineData(newData);
                        }}
                        className="w-full p-2 bg-slate-50 rounded border border-slate-200"
                      />
                    </td>
                    <td className="border border-slate-200 p-3">
                      <input
                        type="text"
                        value={row.duration}
                        onChange={(event) => {
                          const newData = [...projectTimelineData];
                          newData[idx].duration = event.target.value;
                          setProjectTimelineData(newData);
                        }}
                        placeholder="Duration"
                        className="w-full p-2 bg-slate-50 rounded border border-slate-200"
                      />
                    </td>
                    <td className="border border-slate-200 p-3">
                      <input
                        type="text"
                        value={row.assignedTo}
                        onChange={(event) => {
                          const newData = [...projectTimelineData];
                          newData[idx].assignedTo = event.target.value;
                          setProjectTimelineData(newData);
                        }}
                        placeholder="Assigned To"
                        className="w-full p-2 bg-slate-50 rounded border border-slate-200"
                      />
                    </td>
                    <td className="border border-slate-200 p-3">
                      <input
                        type="text"
                        value={row.status}
                        onChange={(event) => {
                          const newData = [...projectTimelineData];
                          newData[idx].status = event.target.value;
                          setProjectTimelineData(newData);
                        }}
                        placeholder="Status"
                        className="w-full p-2 bg-slate-50 rounded border border-slate-200"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() =>
                setProjectTimelineData([
                  ...projectTimelineData,
                  {
                    phase: "",
                    startDate: "",
                    endDate: "",
                    duration: "",
                    assignedTo: "",
                    status: ""
                  }
                ])
              }
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
            >
              Add a Row
            </button>
            <button
              onClick={() => setDetailsView(null)}
              className="px-4 py-2 bg-slate-400 text-white rounded hover:bg-slate-500 font-bold"
            >
              Move Back
            </button>
            <button
              onClick={() => {}}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {detailsView === "milestone" && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">
            Payment Milestone Structure
          </h2>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 p-3 text-left">Milestone</th>
                  <th className="border border-slate-200 p-3 text-left">Target Date</th>
                  <th className="border border-slate-200 p-3 text-left">Payment Amount</th>
                </tr>
              </thead>
              <tbody>
                {projectMilestoneData.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-200 p-3">
                      <input
                        type="text"
                        value={row.milestone}
                        onChange={(event) => {
                          const newData = [...projectMilestoneData];
                          newData[idx].milestone = event.target.value;
                          setProjectMilestoneData(newData);
                        }}
                        placeholder="Milestone"
                        className="w-full p-2 bg-slate-50 rounded border border-slate-200"
                      />
                    </td>
                    <td className="border border-slate-200 p-3">
                      <input
                        type="date"
                        value={row.targetDate}
                        onChange={(event) => {
                          const newData = [...projectMilestoneData];
                          newData[idx].targetDate = event.target.value;
                          setProjectMilestoneData(newData);
                        }}
                        className="w-full p-2 bg-slate-50 rounded border border-slate-200"
                      />
                    </td>
                    <td className="border border-slate-200 p-3">
                      <input
                        type="text"
                        value={row.paymentAmount}
                        onChange={(event) => {
                          const newData = [...projectMilestoneData];
                          newData[idx].paymentAmount = event.target.value;
                          setProjectMilestoneData(newData);
                        }}
                        placeholder="Payment Amount"
                        className="w-full p-2 bg-slate-50 rounded border border-slate-200"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() =>
                setProjectMilestoneData([
                  ...projectMilestoneData,
                  { milestone: "", targetDate: "", paymentAmount: "" }
                ])
              }
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
            >
              Add a Row
            </button>
            <button
              onClick={() => setDetailsView(null)}
              className="px-4 py-2 bg-slate-400 text-white rounded hover:bg-slate-500 font-bold"
            >
              Move Back
            </button>
            <button
              onClick={() => {}}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {detailsView === null && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">
            Technical Specifications
          </h2>
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-1">-</span>
              <div>
                <p className="font-semibold text-slate-700">Required Technologies</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-1">-</span>
              <div>
                <p className="font-semibold text-slate-700">
                  Required Milestone Structure
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-1">-</span>
              <div>
                <p className="font-semibold text-slate-700">Additional teamwork</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="file"
              id="fileInput"
              onChange={(event) => setUploadedFile(event.target.files[0])}
              style={{ display: "none" }}
              accept="*/*"
            />
            <button
              onClick={() => document.getElementById("fileInput").click()}
              className="px-6 py-3 bg-slate-600 text-white rounded hover:bg-slate-700 font-semibold flex items-center gap-2"
            >
              <Paperclip className="w-4 h-4" />
              {uploadedFile ? uploadedFile.name : "Attach: Technical Document"}
            </button>
            {uploadedFile && (
              <span className="text-sm text-green-600 font-semibold">
                File attached: {uploadedFile.name}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
