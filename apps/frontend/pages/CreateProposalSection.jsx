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
  const minDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;

  const [timelineSavedMessage, setTimelineSavedMessage] = useState("");
  const [budgetSavedMessage, setBudgetSavedMessage] = useState("");

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
        isNonEmpty(row.assignedTo)
    );

  const isBudgetComplete =
    budgetData.length > 0 &&
    budgetData.every(
      (row) =>
        isNonEmpty(row.item) &&
        isNonEmpty(row.unit) &&
        isNonEmpty(row.qty) &&
        isNonEmpty(row.unitCost) &&
        isNonEmpty(row.total)
    );

  const isFormValid =
    isProposalComplete && isTimelineComplete && isBudgetComplete;

  const calculateDurationInDays = (startDate, endDate) => {
    if (!startDate || !endDate) return "";

    const start = new Date(startDate);
    const end = new Date(endDate);
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const diffInDays = Math.floor((end - start) / oneDayInMs) + 1;

    if (Number.isNaN(diffInDays) || diffInDays < 1) return "";

    return `${diffInDays} days`;
  };

  const calculateRowTotal = (qty, unitCost) => {
    if (qty === "" || unitCost === "") return "";

    const parsedQuantity = Number(qty);
    const parsedUnitCost = Number(unitCost);

    if (Number.isNaN(parsedQuantity) || Number.isNaN(parsedUnitCost)) {
      return "";
    }

    return String(Number((parsedQuantity * parsedUnitCost).toFixed(2)));
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8">
      

      <div className="space-y-8 rounded-[32px] border border-white bg-white/95 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl">
        <section>
          <h2 className="mb-5 text-xl font-black text-slate-950">
            Proposal Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <input
              value={newProposal.title}
              onChange={(event) =>
                setNewProposal({ ...newProposal, title: event.target.value })
              }
              placeholder="Project title *"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 md:col-span-2"
            />

            <div>
              <select
                value={newProposal.clientId}
                onChange={(event) => {
                  const selectedClient = clientOptions.find(
                    (client) => client.id === event.target.value
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
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="">Select Client ID *</option>
                {clientOptions.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.id} - {client.fullName || client.email || "Client"}
                  </option>
                ))}
              </select>

              {clientOptions.length === 0 && (
                <p className="mt-2 text-sm font-medium text-slate-500">
                  No registered clients found. Register a client first to assign it.
                </p>
              )}
            </div>

            <input
              value={newProposal.clientName || ""}
              onChange={(event) =>
                setNewProposal({
                  ...newProposal,
                  clientName: event.target.value,
                })
              }
              placeholder="Client name *"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />

            <textarea
              value={newProposal.description}
              onChange={(event) =>
                setNewProposal({
                  ...newProposal,
                  description: event.target.value,
                })
              }
              placeholder="Description *"
              rows={4}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 md:col-span-2"
            />
          </div>
        </section>

        <SectionCard
          title="Timeline *"
          subtitle="Add delivery phases, dates and assigned members."
        >
          {showTimeline ? (
            <>
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <TableHead>Phase</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Assigned To</TableHead>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {timelineData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <TableCell>
                          <TableInput
                            value={row.phase}
                            placeholder="Phase"
                            onChange={(value) => {
                              const newData = [...timelineData];
                              newData[idx].phase = value;
                              setTimelineData(newData);
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <TableInput
                            type="date"
                            value={row.startDate}
                            min={minDate}
                            onChange={(value) => {
                              const newData = [...timelineData];
                              newData[idx].startDate = value;
                              newData[idx].duration = calculateDurationInDays(
                                newData[idx].startDate,
                                newData[idx].endDate
                              );
                              setTimelineData(newData);
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <TableInput
                            type="date"
                            value={row.endDate}
                            min={row.startDate || minDate}
                            onChange={(value) => {
                              const newData = [...timelineData];
                              newData[idx].endDate = value;
                              newData[idx].duration = calculateDurationInDays(
                                newData[idx].startDate,
                                newData[idx].endDate
                              );
                              setTimelineData(newData);
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <TableInput value={row.duration} readOnly placeholder="Duration" />
                        </TableCell>

                        <TableCell>
                          <TableInput
                            value={row.assignedTo}
                            placeholder="Assigned To"
                            onChange={(value) => {
                              const newData = [...timelineData];
                              newData[idx].assignedTo = value;
                              setTimelineData(newData);
                            }}
                          />
                        </TableCell>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ActionRow>
                <Button
                  onClick={() =>
                    setTimelineData([
                      ...timelineData,
                      {
                        phase: "",
                        startDate: "",
                        endDate: "",
                        duration: "",
                        assignedTo: "",
                      },
                    ])
                  }
                  variant="primary"
                >
                  Add Row
                </Button>

                <Button onClick={() => setShowTimeline(false)} variant="muted">
                  Move Back
                </Button>

                <Button
                  onClick={() => setTimelineSavedMessage("Saved")}
                  variant="success"
                >
                  Save Changes
                </Button>
              </ActionRow>

              {timelineSavedMessage && (
                <p className="text-sm font-bold text-emerald-600">
                  {timelineSavedMessage}
                </p>
              )}
            </>
          ) : (
            <Button onClick={() => setShowTimeline(true)} variant="primary">
              View Timeline
            </Button>
          )}
        </SectionCard>

        <SectionCard
          title="Estimated Budget *"
          subtitle="Add line items, units, quantity and cost estimates."
        >
          {showBudget ? (
            <>
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <TableHead>Item</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Total</TableHead>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {budgetData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <TableCell>
                          <TableInput
                            value={row.item}
                            placeholder="Item"
                            onChange={(value) => {
                              const newData = [...budgetData];
                              newData[idx].item = value;
                              setBudgetData(newData);
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <TableSelect
                            value={row.unit || "hours"}
                            onChange={(value) => {
                              const newData = [...budgetData];
                              newData[idx].unit = value;
                              setBudgetData(newData);
                            }}
                          >
                            <option value="hours">hours</option>
                            <option value="days">days</option>
                            <option value="weeks">weeks</option>
                            <option value="months">months</option>
                          </TableSelect>
                        </TableCell>

                        <TableCell>
                          <TableInput
                            type="number"
                            min="0"
                            value={row.qty}
                            placeholder="Qty"
                            onChange={(value) => {
                              const newData = [...budgetData];
                              newData[idx].qty = value;
                              newData[idx].total = calculateRowTotal(
                                newData[idx].qty,
                                newData[idx].unitCost
                              );
                              setBudgetData(newData);
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <TableInput
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.unitCost}
                            placeholder="Unit Cost"
                            onChange={(value) => {
                              const newData = [...budgetData];
                              newData[idx].unitCost = value;
                              newData[idx].total = calculateRowTotal(
                                newData[idx].qty,
                                newData[idx].unitCost
                              );
                              setBudgetData(newData);
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <TableInput value={row.total} readOnly placeholder="Total" />
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ActionRow>
                <Button
                  onClick={() =>
                    setBudgetData([
                      ...budgetData,
                      {
                        item: "",
                        unit: "hours",
                        qty: "",
                        unitCost: "",
                        total: "",
                      },
                    ])
                  }
                  variant="primary"
                >
                  Add Row
                </Button>

                <Button onClick={() => setShowBudget(false)} variant="muted">
                  Move Back
                </Button>

                <Button
                  onClick={() => setBudgetSavedMessage("Saved")}
                  variant="success"
                >
                  Save Changes
                </Button>
              </ActionRow>

              {budgetSavedMessage && (
                <p className="text-sm font-bold text-emerald-600">
                  {budgetSavedMessage}
                </p>
              )}
            </>
          ) : (
            <Button onClick={() => setShowBudget(true)} variant="primary">
              View Estimated Budget
            </Button>
          )}
        </SectionCard>


        {!isFormValid && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-600">
            All fields are required. Fill every column to enable submit.
          </div>
        )}

        <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-6">
          <Button onClick={onClear} variant="danger">
            Clear
          </Button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!isFormValid}
            className={`rounded-2xl px-7 py-3 text-sm font-black text-white shadow-lg transition ${
              isFormValid
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:-translate-y-0.5 hover:shadow-xl"
                : "cursor-not-allowed bg-slate-300"
            }`}
          >
            Submit Proposal
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <section className="space-y-5 border-t border-slate-100 pt-7">
      <div>
        <h3 className="text-xl font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function TableHead({ children }) {
  return (
    <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
      {children}
    </th>
  );
}

function TableCell({ children }) {
  return <td className="px-3 py-3">{children}</td>;
}

function TableInput({ value, onChange, ...props }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      {...props}
    />
  );
}

function TableSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
    >
      {children}
    </select>
  );
}

function ActionRow({ children }) {
  return <div className="flex flex-wrap gap-3">{children}</div>;
}

function Button({ children, onClick, variant = "primary" }) {
  const styles = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:-translate-y-0.5",
    muted: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-lg",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-5 py-3 text-sm font-black transition ${styles[variant]}`}
    >
      {children}
    </button>
  );
}
