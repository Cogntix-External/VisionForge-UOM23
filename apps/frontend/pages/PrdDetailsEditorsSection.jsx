"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Eye,
  FileText,
  Pencil,
  Save,
  Send,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "../utils/cn.js";
import { fetchPrdById, updatePrd, getAllPrds } from "@/services/api";
import { getToken } from "@/utils/auth";

export const dynamic = "force-dynamic";

const splitLines = (value) =>
  String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const ensureList = (items) => (items && items.length > 0 ? items : [""]);

const hasText = (value) => String(value || "").trim().length > 0;

const initialEditForm = {
  title: "",
  lastModified: "",
  version: "1.0",
  functionalRequirements: [""],
  projectOverview: [""],
  reviewerName: "",
};

function mapPrdToEditForm(prd) {
  return {
    title: prd?.projectName || prd?.title || "",
    lastModified: prd?.author || "",
    version: prd?.version || "1.0",
    functionalRequirements: ensureList(splitLines(prd?.functionalRequirement)),
    projectOverview: ensureList([
      prd?.purpose || "",
      prd?.problemToSolve || "",
      prd?.projectGoal || "",
    ]),
    reviewerName: prd?.reviewerName || "",
  };
}

function mapEditFormToUpdatePayload(prd, editForm, action) {
  const projectOverview = [...editForm.projectOverview];

  while (projectOverview.length < 3) {
    projectOverview.push("");
  }

  return {
    projectName: editForm.title,
    author: editForm.lastModified,
    dateSubmitted: prd?.dateSubmitted || prd?.createdDate || "",
    reviewerName: editForm.reviewerName,
    purpose: projectOverview[0],
    problemToSolve: projectOverview[1],
    projectGoal: projectOverview[2],
    stakeholders: prd?.stakeholders || [],
    inScope: prd?.inScope || "",
    outOfScope: prd?.outOfScope || "",
    mainFeatures: prd?.mainFeatures || "",
    functionalRequirement: editForm.functionalRequirements
      .filter(hasText)
      .join("\n"),
    nonFunctionalRequirement: prd?.nonFunctionalRequirement || "",
    userRoles: prd?.userRoles || "",
    risksDependencies: prd?.risksDependencies || "",
    milestones: prd?.milestones || [],
    action,
  };
}

function PrdDetailsEditorsSectionView({
  selectedPrd,
  isEditingPrd,
  isSaving,
  canSavePrdEdits,
  editPrdForm,
  updateEditPrdField,
  updateEditPrdArrayItem,
  addEditPrdArrayItem,
  removeEditPrdArrayItem,
  onToggleEdit,
  onSaveDraft,
  onApprove,
  onReject,
}) {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const textOrNA = (value) => {
    if (typeof value === "string") return value.trim() || "N/A";
    return value || "N/A";
  };

  return (
    <div className="space-y-8">
    

          <div className="flex flex-wrap gap-3">
            <ActionButton
              onClick={() => setIsViewModalOpen(true)}
              disabled={!selectedPrd || isSaving}
              variant="white"
              icon={<Eye className="h-4 w-4" />}
            >
              View Full PRD
            </ActionButton>

            <ActionButton
              onClick={onToggleEdit}
              disabled={isSaving || (isEditingPrd && !canSavePrdEdits)}
              variant="dark"
              icon={
                isEditingPrd ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Pencil className="h-4 w-4" />
                )
              }
            >
              {isEditingPrd ? "Save Changes" : "Edit PRD"}
            </ActionButton>
          </div>

     

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <EditorCard title="Document Details">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-black text-indigo-700">
            PRD ID: {selectedPrd?.pid || selectedPrd?.id || "N/A"}
          </div>

          {isEditingPrd ? (
            <div className="space-y-4">
              <FormInput
                label="Project Name"
                value={editPrdForm.title}
                onChange={updateEditPrdField("title")}
              />
              <FormInput
                label="Client Name"
                value={editPrdForm.lastModified}
                onChange={updateEditPrdField("lastModified")}
              />
              <FormInput
                label="Current Version"
                value={editPrdForm.version}
                onChange={updateEditPrdField("version")}
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard
                label="Product Name"
                value={selectedPrd?.projectName || selectedPrd?.title}
              />
              <InfoCard label="Client Name" value={selectedPrd?.author} />
              <InfoCard
                label="Current Version"
                value={selectedPrd?.version || "1.0"}
              />
              <InfoCard
                label="Status"
                value={selectedPrd?.status || "In Review"}
              />
            </div>
          )}
        </EditorCard>

        <EditorCard title="Functional Requirements">
          {isEditingPrd ? (
            <div className="space-y-3">
              {editPrdForm.functionalRequirements.map((item, index) => (
                <div key={`req-${index}`} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={item}
                    onChange={updateEditPrdArrayItem(
                      "functionalRequirements",
                      index
                    )}
                    className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    placeholder="Add functional requirement"
                  />
                  {editPrdForm.functionalRequirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeEditPrdArrayItem("functionalRequirements", index)
                      }
                      className="rounded-2xl bg-rose-50 p-3 text-rose-600 transition hover:bg-rose-100"
                      aria-label="Remove requirement"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addEditPrdArrayItem("functionalRequirements")}
                className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-black text-indigo-700 transition hover:bg-indigo-100"
              >
                + Add Requirement
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {splitLines(selectedPrd?.functionalRequirement).length > 0 ? (
                splitLines(selectedPrd?.functionalRequirement).map(
                  (item, index) => (
                    <li
                      key={`req-view-${index}`}
                      className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/90 p-4 text-sm font-semibold text-slate-700"
                    >
                      <CheckCircle
                        size={18}
                        className="mt-0.5 shrink-0 text-emerald-500"
                      />
                      <span>{item}</span>
                    </li>
                  )
                )
              ) : (
                <EmptyText>No functional requirements available.</EmptyText>
              )}
            </ul>
          )}
        </EditorCard>

        <EditorCard title="Project Overview">
          {isEditingPrd ? (
            <div className="space-y-3">
              {editPrdForm.projectOverview.map((item, index) => (
                <div
                  key={`overview-${index}`}
                  className="flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={item}
                    onChange={updateEditPrdArrayItem(
                      "projectOverview",
                      index
                    )}
                    className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    placeholder="Add overview item"
                  />

                  {editPrdForm.projectOverview.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeEditPrdArrayItem("projectOverview", index)
                      }
                      className="rounded-2xl bg-rose-50 p-3 text-rose-600 transition hover:bg-rose-100"
                      aria-label="Remove overview item"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addEditPrdArrayItem("projectOverview")}
                className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-black text-indigo-700 transition hover:bg-indigo-100"
              >
                + Add Overview Item
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {[
                selectedPrd?.purpose || "",
                selectedPrd?.problemToSolve || "",
                selectedPrd?.projectGoal || "",
              ]
                .filter(Boolean)
                .map((item, index) => (
                  <li
                    key={`overview-view-${index}`}
                    className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4 text-sm font-semibold leading-relaxed text-slate-700"
                  >
                    {item}
                  </li>
                ))}

              {[
                selectedPrd?.purpose || "",
                selectedPrd?.problemToSolve || "",
                selectedPrd?.projectGoal || "",
              ].filter(Boolean).length === 0 && (
                <EmptyText>No project overview available.</EmptyText>
              )}
            </ul>
          )}
        </EditorCard>

        <EditorCard title="Reviewer">
          {isEditingPrd ? (
            <FormInput
              label="Reviewer Name"
              value={editPrdForm.reviewerName}
              onChange={updateEditPrdField("reviewerName")}
              placeholder="Type reviewer name"
            />
          ) : (
            <InfoCard
              label="Reviewer Name"
              value={selectedPrd?.reviewerName || "N/A"}
            />
          )}
        </EditorCard>
      </div>

      {isViewModalOpen && selectedPrd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-white/70">
                    Read-only PRD
                  </p>
                  <h3 className="mt-1 text-2xl font-black">View Full PRD</h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="rounded-2xl bg-white/15 p-2 transition hover:bg-white/25"
                  aria-label="Close PRD view"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-6 overflow-y-auto px-6 py-6">
              <ModalSection title="Basic Information">
                <Field label="PRD ID" value={selectedPrd.pid} />
                <Field
                  label="Project Name"
                  value={selectedPrd.projectName || selectedPrd.title}
                />
                <Field label="Author" value={selectedPrd.author} />
                <Field
                  label="Date Submitted"
                  value={selectedPrd.dateSubmitted || selectedPrd.createdDate}
                />
                <Field label="Reviewer" value={selectedPrd.reviewerName} />
                <Field label="Version" value={selectedPrd.version || "1.0"} />
                <Field
                  label="Status"
                  value={selectedPrd.status || "In Review"}
                />
              </ModalSection>

              <ModalSection title="Project Overview">
                <Field label="Purpose" value={selectedPrd.purpose} />
                <Field
                  label="Problem To Solve"
                  value={selectedPrd.problemToSolve}
                />
                <Field label="Project Goal" value={selectedPrd.projectGoal} />
              </ModalSection>

              <ModalSection title="Scope and Requirements">
                <Field label="In Scope" value={selectedPrd.inScope} />
                <Field label="Out Of Scope" value={selectedPrd.outOfScope} />
                <Field label="Main Features" value={selectedPrd.mainFeatures} />
                <Field
                  label="Non-Functional Requirement"
                  value={selectedPrd.nonFunctionalRequirement}
                />
                <Field label="User Roles" value={selectedPrd.userRoles} />
                <Field
                  label="Risks and Dependencies"
                  value={selectedPrd.risksDependencies}
                />
                <ListField
                  label="Functional Requirements"
                  items={splitLines(selectedPrd.functionalRequirement)}
                />
              </ModalSection>

              <div className="space-y-3">
                <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                  Key Stakeholders
                </h4>
                {(selectedPrd.stakeholders || []).length === 0 ? (
                  <EmptyText>N/A</EmptyText>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {(selectedPrd.stakeholders || []).map((item, index) => (
                      <div
                        key={`stakeholder-view-${index}`}
                        className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4 text-sm text-slate-800"
                      >
                        <p>
                          <span className="font-black text-slate-600">
                            Role:
                          </span>{" "}
                          {textOrNA(item?.role)}
                        </p>
                        <p>
                          <span className="font-black text-slate-600">
                            Name:
                          </span>{" "}
                          {textOrNA(item?.name)}
                        </p>
                        <p>
                          <span className="font-black text-slate-600">
                            Responsibility:
                          </span>{" "}
                          {textOrNA(item?.responsibility)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                  Milestones
                </h4>
                {(selectedPrd.milestones || []).length === 0 ? (
                  <EmptyText>N/A</EmptyText>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {(selectedPrd.milestones || []).map((item, index) => (
                      <div
                        key={`milestone-view-${index}`}
                        className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4 text-sm text-slate-800"
                      >
                        <p>
                          <span className="font-black text-slate-600">
                            Phase:
                          </span>{" "}
                          {textOrNA(item?.phase)}
                        </p>
                        <p>
                          <span className="font-black text-slate-600">
                            Task:
                          </span>{" "}
                          {textOrNA(item?.task)}
                        </p>
                        <p>
                          <span className="font-black text-slate-600">
                            Duration:
                          </span>{" "}
                          {textOrNA(item?.duration)}
                        </p>
                        <p>
                          <span className="font-black text-slate-600">
                            Responsibility:
                          </span>{" "}
                          {textOrNA(item?.responsibility)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompanyPrdDetailsEditorsContent() {
  const searchParams = useSearchParams();
  const prdId = searchParams.get("prdId");

  const [selectedPrd, setSelectedPrd] = useState(null);
  const [isEditingPrd, setIsEditingPrd] = useState(false);
  const [editPrdForm, setEditPrdForm] = useState(initialEditForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

useEffect(() => {
  const loadPrd = async () => {
    if (!prdId) {
      setErrorMessage("No PRD selected. Open from PRD Repository review button.");
      return;
    }

    const token = getToken();
    if (!token) {
      setErrorMessage("Please log in again.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const allPrds = await getAllPrds();

const prd = Array.isArray(allPrds)
  ? allPrds.find((item) =>
      String(item?.id || item?._id || "") === String(prdId) ||
      String(item?.projectId || "") === String(prdId) ||
      String(item?.pid || "") === String(prdId)
    )
  : null;

if (!prd) {
  throw new Error("PRD not found");
}

      setSelectedPrd(prd);
      setEditPrdForm(mapPrdToEditForm(prd));
    } catch (error) {
      setSelectedPrd(null);
      setErrorMessage("PRD not found. Please open it again from PRD Repository.");
    } finally {
      setIsLoading(false);
    }
  };

  loadPrd();
}, [prdId]);

  const canSavePrdEdits = useMemo(() => {
    return (
      hasText(editPrdForm.title) &&
      hasText(editPrdForm.lastModified) &&
      editPrdForm.functionalRequirements.every(hasText) &&
      editPrdForm.projectOverview.every(hasText) &&
      hasText(editPrdForm.reviewerName)
    );
  }, [editPrdForm]);

  const updateEditPrdField = (field) => (event) => {
    const value = event.target.value;
    setEditPrdForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateEditPrdArrayItem = (field, index) => (event) => {
    const value = event.target.value;

    setEditPrdForm((prev) => {
      const next = [...prev[field]];
      next[index] = value;
      return { ...prev, [field]: next };
    });
  };

  const addEditPrdArrayItem = (field) => {
    setEditPrdForm((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeEditPrdArrayItem = (field, index) => {
    setEditPrdForm((prev) => {
      if (prev[field].length === 1) return prev;

      return {
        ...prev,
        [field]: prev[field].filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const persistPrd = async (action) => {
    if (!selectedPrd?.id) {
      setErrorMessage("PRD id is missing.");
      return;
    }

    const token = getToken();

    if (!token) {
      setErrorMessage("Please log in again.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      const payload = mapEditFormToUpdatePayload(
        selectedPrd,
        editPrdForm,
        action
      );

      const realPrdId = selectedPrd.id || selectedPrd._id;

      await updatePrd(realPrdId, payload);
      const refreshed = await fetchPrdById(realPrdId);
      setSelectedPrd(refreshed);
      setEditPrdForm(mapPrdToEditForm(refreshed));
      setIsEditingPrd(false);

      if (action === "APPROVE") {
        setMessage("PRD approved and sent to client. Version updated.");
      } else if (action === "REJECTED") {
        setMessage("PRD marked as rejected.");
      } else if (action === "SAVE_DRAFT") {
        setMessage("PRD saved as draft.");
      } else {
        setMessage("PRD saved and moved to In Review.");
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to save PRD.");
    } finally {
      setIsSaving(false);
    }
  };

  const onToggleEdit = () => {
    setMessage("");

    if (!isEditingPrd) {
      setIsEditingPrd(true);
      return;
    }

    persistPrd("SAVE_CHANGES");
  };

  const onSaveDraft = () => {
    setMessage("");
    persistPrd("SAVE_DRAFT");
  };

  const onApprove = () => {
    setMessage("");
    persistPrd("APPROVE");
  };

  const onReject = () => {
    setMessage("");
    persistPrd("REJECTED");
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white bg-white/95 px-6 py-5 text-sm font-bold text-slate-500 shadow-sm">
        Loading selected PRD...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
          {errorMessage}
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
          {message}
        </div>
      )}

      {selectedPrd && (
        <div className="rounded-2xl border border-white bg-white/95 px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-slate-500 shadow-sm">
          Status: {selectedPrd.status || "In Review"} | Version:{" "}
          {selectedPrd.version || "1.0"}
          {selectedPrd.sentToClient ? " | Sent to Client" : ""}
        </div>
      )}

      <PrdDetailsEditorsSectionView
        selectedPrd={selectedPrd}
        isEditingPrd={isEditingPrd}
        isSaving={isSaving}
        canSavePrdEdits={!isSaving && canSavePrdEdits}
        editPrdForm={editPrdForm}
        updateEditPrdField={updateEditPrdField}
        updateEditPrdArrayItem={updateEditPrdArrayItem}
        addEditPrdArrayItem={addEditPrdArrayItem}
        removeEditPrdArrayItem={removeEditPrdArrayItem}
        onToggleEdit={onToggleEdit}
        onSaveDraft={onSaveDraft}
        onApprove={onApprove}
        onReject={onReject}
      />
    </div>
  );
}

export default function CompanyPrdDetailsEditorsSection() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-white bg-white/95 px-6 py-5 text-sm font-bold text-slate-500 shadow-sm">
          Loading selected PRD...
        </div>
      }
    >
      <CompanyPrdDetailsEditorsContent />
    </Suspense>
  );
}

function ActionButton({ children, onClick, disabled, variant = "white", icon }) {
  const variants = {
    white:
      "bg-white text-indigo-700 hover:bg-indigo-50 disabled:bg-white disabled:text-indigo-700 disabled:opacity-95 disabled:ring-2 disabled:ring-white/70",
    dark:
      "bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-700 disabled:text-white disabled:opacity-80",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-500 disabled:text-white disabled:opacity-80",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-500 disabled:text-white disabled:opacity-80",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:shadow-lg disabled:hover:translate-y-0",
        variants[variant]
      )}
    >
      {icon &&
        React.cloneElement(icon, {
          className: cn("h-4 w-4", disabled && variant === "white" ? "text-indigo-700" : ""),
        })}
      <span>{children}</span>
    </button>
  );
}

function EditorCard({ title, children }) {
  return (
    <div className="space-y-5 rounded-[32px] border border-white bg-white/95 p-7 shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div>
        <h3 className="text-xl font-black text-slate-950">{title}</h3>
        <div className="mt-2 h-1 w-14 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600" />
      </div>
      {children}
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      />
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 break-words text-sm font-black text-slate-900">
        {value || "N/A"}
      </p>
    </div>
  );
}

function EmptyText({ children }) {
  return (
    <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm font-bold text-slate-400">
      {children}
    </p>
  );
}

function ModalSection({ title, children }) {
  return (
    <section className="space-y-3">
      <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
        {title}
      </h4>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">{children}</div>
    </section>
  );
}

function Field({ label, value }) {
  const finalValue =
    typeof value === "string" ? value.trim() || "N/A" : value || "N/A";

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold text-slate-800">
        {finalValue}
      </p>
    </div>
  );
}

function ListField({ label, items = [] }) {
  const safeItems = items.filter(
    (item) => String(item || "").trim().length > 0
  );

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4 md:col-span-3">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      {safeItems.length === 0 ? (
        <p className="mt-2 text-sm font-semibold text-slate-500">N/A</p>
      ) : (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold text-slate-800">
          {safeItems.map((item, index) => (
            <li key={`${label}-${index}`} className="break-words">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}