"use client";

import React, { useState } from "react";

export default function CreateProposalSection({
  newProposal = { title: "", clientId: "", clientName: "", description: "" },
  setNewProposal = () => {},
  showTimeline = true,
  setShowTimeline = () => {},
  showBudget = true,
  setShowBudget = () => {},
  timelineData = [],
  setTimelineData = () => {},
  budgetData = [],
  setBudgetData = () => {},
  onClear = () => {},
  onSubmit = () => {},
  clientOptions = [],
}) {
  const now = new Date();
  const minDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const isNonEmpty = (value) => String(value ?? "").trim() !== "";
  const isProposalComplete =
    isNonEmpty(newProposal.title) &&
    isNonEmpty(newProposal.clientId) &&
    isNonEmpty(newProposal.clientName) &&
    isNonEmpty(newProposal.description);
  const isTimelineComplete =
    timelineData.length > 0 &&
    timelineData.every(
      (row) =>
        isNonEmpty(row.phase) &&
        isNonEmpty(row.startDate) &&
        isNonEmpty(row.endDate) &&
        isNonEmpty(row.duration) &&
        isNonEmpty(row.assignedTo) &&
        isNonEmpty(row.status),
    );
  const isBudgetComplete =
    budgetData.length > 0 &&
    budgetData.every(
      (row) =>
        isNonEmpty(row.item) &&
        isNonEmpty(row.description) &&
        isNonEmpty(row.quantity) &&
        isNonEmpty(row.unitPrice) &&
        isNonEmpty(row.total),
    );
  const isFormValid =
    isProposalComplete && isTimelineComplete && isBudgetComplete;
  const [timelineSavedMessage, setTimelineSavedMessage] = useState("");
  const [budgetSavedMessage, setBudgetSavedMessage] = useState("");

  const calculateDurationInDays = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return "";
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const diffInDays = Math.floor((end - start) / oneDayInMs) + 1;

    if (Number.isNaN(diffInDays) || diffInDays < 1) {
      return "";
    }

    return `${diffInDays} days`;
  };

  const calculateRowTotal = (quantity, unitPrice) => {
    if (quantity === "" || unitPrice === "") {
      return "";
    }

    const parsedQuantity = Number(quantity);
    const parsedUnitPrice = Number(unitPrice);

    if (Number.isNaN(parsedQuantity) || Number.isNaN(parsedUnitPrice)) {
      return "";
    }

    return String(Number((parsedQuantity * parsedUnitPrice).toFixed(2)));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">
        New Project Proposal
      </h1>
      <div className="space-y-4 bg-white p-8 rounded-lg shadow-sm border border-slate-100">
        <div>
          <input
            value={newProposal.title}
            onChange={(event) =>
              setNewProposal({ ...newProposal, title: event.target.value })
            }
            placeholder="Project title *"
            className="w-full p-4 rounded bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <select
            value={newProposal.clientId}
            onChange={(event) => {
              const selectedClient = clientOptions.find(
                (client) => client.id === event.target.value,
              );
              setNewProposal({
                ...newProposal,
                clientId: event.target.value,
                clientName:
                  selectedClient?.fullName ||
                  selectedClient?.email ||
                  newProposal.clientName ||
                  "",
              });
            }}
            aria-label="Client ID"
            className="w-full p-4 rounded bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Client ID *</option>
            {clientOptions.map((client) => (
              <option key={client.id} value={client.id}>
                {client.id} - {client.fullName || client.email || "Client"}
              </option>
            ))}
          </select>
          {clientOptions.length === 0 && (
            <p className="mt-2 text-sm text-slate-500">
              No registered clients found. Register a client first to assign it.
            </p>
          )}
        </div>
        <div>
          <input
            value={newProposal.clientName || ""}
            onChange={(event) =>
              setNewProposal({ ...newProposal, clientName: event.target.value })
            }
            placeholder="Client name *"
            className="w-full p-4 rounded bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <textarea
            value={newProposal.description}
            onChange={(event) =>
              setNewProposal({
                ...newProposal,
                description: event.target.value,
              })
            }
            placeholder="Description *"
            className="w-full p-4 rounded bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={4}
          />
        </div>

        <div className="mt-6 border-t pt-6">
          <h3 className="font-bold text-slate-700 mb-4">Timeline *</h3>
          {showTimeline && (
            <div className="mb-4">
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-200 p-2 text-left">
                        Phase
                      </th>
                      <th className="border border-slate-200 p-2 text-left">
                        Start Date
                      </th>
                      <th className="border border-slate-200 p-2 text-left">
                        End Date
                      </th>
                      <th className="border border-slate-200 p-2 text-left">
                        Duration
                      </th>
                      <th className="border border-slate-200 p-2 text-left">
                        Assigned To
                      </th>
                      <th className="border border-slate-200 p-2 text-left">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {timelineData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-200 p-2">
                          <input
                            type="text"
                            value={row.phase}
                            onChange={(event) => {
                              const newData = [...timelineData];
                              newData[idx].phase = event.target.value;
                              setTimelineData(newData);
                            }}
                            placeholder="Phase"
                            className="w-full p-1 bg-slate-50 rounded"
                          />
                        </td>
                        <td className="border border-slate-200 p-2">
                          <input
                            type="date"
                            value={row.startDate}
                            onChange={(event) => {
                              const newData = [...timelineData];
                              newData[idx].startDate = event.target.value;
                              newData[idx].duration = calculateDurationInDays(
                                newData[idx].startDate,
                                newData[idx].endDate,
                              );
                              setTimelineData(newData);
                            }}
                            min={minDate}
                            className="w-full p-1 bg-slate-50 rounded"
                          />
                        </td>
                        <td className="border border-slate-200 p-2">
                          <input
                            type="date"
                            value={row.endDate}
                            onChange={(event) => {
                              const newData = [...timelineData];
                              newData[idx].endDate = event.target.value;
                              newData[idx].duration = calculateDurationInDays(
                                newData[idx].startDate,
                                newData[idx].endDate,
                              );
                              setTimelineData(newData);
                            }}
                            min={row.startDate || minDate}
                            className="w-full p-1 bg-slate-50 rounded"
                          />
                        </td>
                        <td className="border border-slate-200 p-2">
                          <input
                            type="text"
                            value={row.duration}
                            readOnly
                            placeholder="Duration"
                            className="w-full p-1 bg-slate-50 rounded"
                          />
                        </td>
                        <td className="border border-slate-200 p-2">
                          <input
                            type="text"
                            value={row.assignedTo}
                            onChange={(event) => {
                              const newData = [...timelineData];
                              newData[idx].assignedTo = event.target.value;
                              setTimelineData(newData);
                            }}
                            placeholder="Assigned To"
                            className="w-full p-1 bg-slate-50 rounded"
                          />
                        </td>
                        <td className="border border-slate-200 p-2">
                          <input
                            type="text"
                            value={row.status}
                            onChange={(event) => {
                              const newData = [...timelineData];
                              newData[idx].status = event.target.value;
                              setTimelineData(newData);
                            }}
                            placeholder="Status"
                            className="w-full p-1 bg-slate-50 rounded"
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
                    setTimelineData([
                      ...timelineData,
                      {
                        phase: "",
                        startDate: "",
                        endDate: "",
                        duration: "",
                        assignedTo: "",
                        status: "",
                      },
                    ])
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
                >
                  Add a Row
                </button>
                <button
                  onClick={() => setShowTimeline(false)}
                  className="px-4 py-2 bg-slate-400 text-white rounded hover:bg-slate-500 font-bold"
                >
                  Move Back
                </button>
                <button
                  onClick={() => {
                    setTimelineSavedMessage("Saved");
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
                >
                  Save Changes
                </button>
              </div>
              {timelineSavedMessage && (
                <p className="text-sm text-green-700 mt-3">
                  {timelineSavedMessage}
                </p>
              )}
            </div>
          )}
          {!showTimeline && (
            <button
              onClick={() => setShowTimeline(true)}
              className="px-6 py-2 bg-[#000066] text-white rounded hover:bg-blue-900 font-bold"
            >
              View Timeline
            </button>
          )}
        </div>

        <div className="mt-6 border-t pt-6">
          <h3 className="font-bold text-slate-700 mb-4">Estimated Budget *</h3>
          {showBudget && (
            <div className="mb-4">
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-200 p-2 text-left">
                        Item
                      </th>
                      <th className="border border-slate-200 p-2 text-left">
                        Description
                      </th>
                      <th className="border border-slate-200 p-2 text-left">
                        Quantity
                      </th>
                      <th className="border border-slate-200 p-2 text-left">
                        Unit price
                      </th>
                      <th className="border border-slate-200 p-2 text-left">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-200 p-2">
                          <input
                            type="text"
                            value={row.item}
                            onChange={(event) => {
                              const newData = [...budgetData];
                              newData[idx].item = event.target.value;
                              setBudgetData(newData);
                            }}
                            placeholder="Item"
                            className="w-full p-1 bg-slate-50 rounded"
                          />
                        </td>
                        <td className="border border-slate-200 p-2">
                          <input
                            type="text"
                            value={row.description}
                            onChange={(event) => {
                              const newData = [...budgetData];
                              newData[idx].description = event.target.value;
                              setBudgetData(newData);
                            }}
                            placeholder="Description"
                            className="w-full p-1 bg-slate-50 rounded"
                          />
                        </td>
                        <td className="border border-slate-200 p-2">
                          <input
                            type="number"
                            value={row.quantity}
                            onChange={(event) => {
                              const newData = [...budgetData];
                              newData[idx].quantity = event.target.value;
                              newData[idx].total = calculateRowTotal(
                                newData[idx].quantity,
                                newData[idx].unitPrice,
                              );
                              setBudgetData(newData);
                            }}
                            placeholder="Quantity"
                            className="w-full p-1 bg-slate-50 rounded"
                          />
                        </td>
                        <td className="border border-slate-200 p-2">
                          <input
                            type="number"
                            value={row.unitPrice}
                            onChange={(event) => {
                              const newData = [...budgetData];
                              newData[idx].unitPrice = event.target.value;
                              newData[idx].total = calculateRowTotal(
                                newData[idx].quantity,
                                newData[idx].unitPrice,
                              );
                              setBudgetData(newData);
                            }}
                            placeholder="Unit price"
                            className="w-full p-1 bg-slate-50 rounded"
                          />
                        </td>
                        <td className="border border-slate-200 p-2">
                          <input
                            type="number"
                            value={row.total}
                            readOnly
                            placeholder="Total"
                            className="w-full p-1 bg-slate-50 rounded"
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
                    setBudgetData([
                      ...budgetData,
                      {
                        item: "",
                        description: "",
                        quantity: "",
                        unitPrice: "",
                        total: "",
                      },
                    ])
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
                >
                  Add a Row
                </button>
                <button
                  onClick={() => setShowBudget(false)}
                  className="px-4 py-2 bg-slate-400 text-white rounded hover:bg-slate-500 font-bold"
                >
                  Move Back
                </button>
                <button
                  onClick={() => {
                    setBudgetSavedMessage("Saved");
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
                >
                  Save Changes
                </button>
              </div>
              {budgetSavedMessage && (
                <p className="text-sm text-green-700 mt-3">
                  {budgetSavedMessage}
                </p>
              )}
            </div>
          )}
          {!showBudget && (
            <button
              onClick={() => setShowBudget(true)}
              className="px-6 py-2 bg-[#000066] text-white rounded hover:bg-blue-900 font-bold"
            >
              View Budget
            </button>
          )}
        </div>

        {!isFormValid && (
          <p className="text-sm text-red-600 mt-6">
            All fields are required. Fill every column to enable submit.
          </p>
        )}
        <div className="flex gap-4 pt-6 border-t mt-6">
          <button
            onClick={onClear}
            className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 font-bold"
          >
            Clear
          </button>
          <button
            onClick={onSubmit}
            disabled={!isFormValid}
            className={`px-6 py-3 text-white rounded font-bold ${
              isFormValid
                ? "bg-blue-800 hover:bg-blue-900"
                : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
