"use client";

import React from "react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Trash2, X } from "lucide-react";
import { cn } from "../utils/cn.js";
import { fetchPrdById, updatePrd } from "@/services/api";
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
    functionalRequirement: editForm.functionalRequirements.filter(hasText).join("\n"),
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
  onReject
}) {
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);

  const textOrNA = (value) => {
    if (typeof value === "string") {
      return value.trim() || "N/A";
    }
    return value || "N/A";
  };

  const splitLines = (value) =>
    String(value || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

  const Field = ({ label, value }) => (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-800 whitespace-pre-wrap break-words">{textOrNA(value)}</p>
    </div>
  );

  const ListField = ({ label, items = [] }) => {
    const safeItems = items.filter((item) => String(item || "").trim().length > 0);
    return (
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        {safeItems.length === 0 ? (
          <p className="mt-1 text-sm text-slate-600">N/A</p>
        ) : (
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-slate-800">
            {safeItems.map((item, index) => (
              <li key={`${label}-${index}`} className="break-words">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end gap-4">
        <button
          onClick={() => setIsViewModalOpen(true)}
          className={cn(
            "border px-6 py-2 rounded-md text-sm font-semibold transition-colors",
            "border-[#1A1A40] text-[#1A1A40] hover:bg-[#1A1A40] hover:text-white"
          )}
          disabled={!selectedPrd || isSaving}
        >
          View Full PRD
        </button>
        <button
          onClick={onToggleEdit}
          className={cn(
            "px-6 py-2 rounded-md text-sm font-semibold",
            "bg-[#1A1A40] text-white"
          )}
          disabled={isSaving}
        >
          {isEditingPrd ? "Save Changes" : "Edit Prd"}
        </button>
        <button
          onClick={onSaveDraft}
          className={cn(
            "border px-6 py-2 rounded-md text-sm font-semibold",
            "border-[#1A1A40] text-[#1A1A40]"
          )}
          disabled={isSaving}
        >
          Save Draft
        </button>
        <button
          onClick={onReject}
          className={cn(
            "border px-6 py-2 rounded-md text-sm font-semibold transition-colors",
            "border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
          )}
          disabled={isSaving}
        >
          Rejected
        </button>
        <button
          onClick={onApprove}
          className={cn(
            "border px-6 py-2 rounded-md text-sm font-semibold transition-colors",
            "border-[#1A1A40] text-[#1A1A40] hover:bg-[#1A1A40] hover:text-white"
          )}
          disabled={isSaving}
        >
          Approve
        </button>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-[#F0EBEB] p-8 rounded-[2rem] min-h-[250px] shadow-inner">
          <h3 className="text-[#5D57A3] font-bold text-center mb-6 text-lg border-b border-gray-300 pb-2">
            Document Details
          </h3>
          <div className="space-y-4 text-gray-700 font-medium">
            <p>PRD ID: {selectedPrd?.pid || "001A"}</p>
            {isEditingPrd ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={editPrdForm.title}
                    onChange={updateEditPrdField("title")}
                    className="w-full bg-white border-none rounded-lg p-3"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={editPrdForm.lastModified}
                    onChange={updateEditPrdField("lastModified")}
                    className="w-full bg-white border-none rounded-lg p-3"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">
                    Current Version
                  </label>
                  <input
                    type="text"
                    value={editPrdForm.version}
                    onChange={updateEditPrdField("version")}
                    className="w-full bg-white border-none rounded-lg p-3"
                  />
                </div>
              </div>
            ) : (
              <>
                <p>
                  Product Name: {selectedPrd?.projectName || selectedPrd?.title || "N/A"}
                </p>
                <p>Client Name: {selectedPrd?.author || "N/A"}</p>
                <p>Current Version: {selectedPrd?.version || "1.0"}</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-[#F0EBEB] p-8 rounded-[2rem] min-h-[250px] shadow-inner">
          <h3 className="text-[#5D57A3] font-bold text-center mb-6 text-lg border-b border-gray-300 pb-2">
            Functional Requirements
          </h3>
          {isEditingPrd ? (
            <div className="space-y-3">
              {editPrdForm.functionalRequirements.map((item, index) => (
                <div key={`req-${index}`} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={item}
                    onChange={updateEditPrdArrayItem("functionalRequirements", index)}
                    className="flex-1 bg-white border-none rounded-lg p-3"
                  />
                  {editPrdForm.functionalRequirements.length > 1 && (
                    <button
                      onClick={() =>
                        removeEditPrdArrayItem("functionalRequirements", index)
                      }
                      className="text-red-500 hover:text-red-600"
                      aria-label="Remove requirement"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addEditPrdArrayItem("functionalRequirements")}
                className="text-xs font-semibold text-[#1A1A40]"
              >
                + Add Requirement
              </button>
            </div>
          ) : (
            <ul className="space-y-4 text-gray-700 font-medium">
              {(selectedPrd?.functionalRequirement || "")
                .split(/\r?\n/)
                .filter(Boolean)
                .map((item, index) => (
                  <li key={`req-view-${index}`} className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-gray-400" />
                    {item}
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="bg-[#F0EBEB] p-8 rounded-[2rem] min-h-[250px] shadow-inner">
          <h3 className="text-[#5D57A3] font-bold text-center mb-6 text-lg border-b border-gray-300 pb-2">
            Project Overview
          </h3>
          {isEditingPrd ? (
            <div className="space-y-3">
              {editPrdForm.projectOverview.map((item, index) => (
                <div key={`overview-${index}`} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={item}
                    onChange={updateEditPrdArrayItem("projectOverview", index)}
                    className="flex-1 bg-white border-none rounded-lg p-3"
                  />
                  {editPrdForm.projectOverview.length > 1 && (
                    <button
                      onClick={() => removeEditPrdArrayItem("projectOverview", index)}
                      className="text-red-500 hover:text-red-600"
                      aria-label="Remove overview item"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addEditPrdArrayItem("projectOverview")}
                className="text-xs font-semibold text-[#1A1A40]"
              >
                + Add Overview Item
              </button>
            </div>
          ) : (
            <ul className="space-y-4 text-gray-700 font-medium list-disc list-inside">
              {[
                selectedPrd?.purpose || "",
                selectedPrd?.problemToSolve || "",
                selectedPrd?.projectGoal || "",
              ]
                .filter(Boolean)
                .map((item, index) => (
                  <li key={`overview-view-${index}`}>{item}</li>
                ))}
            </ul>
          )}
        </div>

        <div className="bg-[#F0EBEB] p-8 rounded-[2rem] min-h-[250px] shadow-inner">
          <h3 className="text-[#5D57A3] font-bold text-center mb-6 text-lg border-b border-gray-300 pb-2">
            Reviewers
          </h3>
          {isEditingPrd ? (
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-600">
                Reviewer Name (Manual)
              </label>
              <input
                type="text"
                value={editPrdForm.reviewerName}
                onChange={updateEditPrdField("reviewerName")}
                className="w-full bg-white border-none rounded-lg p-3"
                placeholder="Type reviewer name"
              />
            </div>
          ) : (
            <ul className="space-y-4 text-gray-700 font-medium list-disc list-inside">
              <li>{selectedPrd?.reviewerName || "N/A"}</li>
            </ul>
          )}
        </div>
      </div>

      {isViewModalOpen && selectedPrd && (
        <div className="fixed inset-0 z-50 bg-black/45 p-4 flex items-center justify-center">
          <div className="w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-[#1A1A40]">View Full PRD</h3>
                <p className="text-xs text-slate-500 mt-1">Read-only details of all submitted fields</p>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                aria-label="Close PRD view"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto space-y-5">
              <section className="space-y-3">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Field label="PRD ID" value={selectedPrd.pid} />
                  <Field label="Project Name" value={selectedPrd.projectName || selectedPrd.title} />
                  <Field label="Author" value={selectedPrd.author} />
                  <Field label="Date Submitted" value={selectedPrd.dateSubmitted || selectedPrd.createdDate} />
                  <Field label="Reviewer" value={selectedPrd.reviewerName} />
                  <Field label="Version" value={selectedPrd.version || "1.0"} />
                  <Field label="Status" value={selectedPrd.status || "In Review"} />
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Project Overview</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Field label="Purpose" value={selectedPrd.purpose} />
                  <Field label="Problem To Solve" value={selectedPrd.problemToSolve} />
                  <Field label="Project Goal" value={selectedPrd.projectGoal} />
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Scope and Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="In Scope" value={selectedPrd.inScope} />
                  <Field label="Out Of Scope" value={selectedPrd.outOfScope} />
                  <Field label="Main Features" value={selectedPrd.mainFeatures} />
                  <Field label="Non-Functional Requirement" value={selectedPrd.nonFunctionalRequirement} />
                  <Field label="User Roles" value={selectedPrd.userRoles} />
                  <Field label="Risks and Dependencies" value={selectedPrd.risksDependencies} />
                </div>
                <ListField
                  label="Functional Requirements"
                  items={splitLines(selectedPrd.functionalRequirement)}
                />
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Key Stakeholders</h4>
                {(selectedPrd.stakeholders || []).length === 0 ? (
                  <p className="text-sm text-slate-600">N/A</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(selectedPrd.stakeholders || []).map((item, index) => (
                      <div
                        key={`stakeholder-view-${index}`}
                        className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-800"
                      >
                        <p><span className="font-semibold text-slate-600">Role:</span> {textOrNA(item?.role)}</p>
                        <p><span className="font-semibold text-slate-600">Name:</span> {textOrNA(item?.name)}</p>
                        <p><span className="font-semibold text-slate-600">Responsibility:</span> {textOrNA(item?.responsibility)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Milestones</h4>
                {(selectedPrd.milestones || []).length === 0 ? (
                  <p className="text-sm text-slate-600">N/A</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(selectedPrd.milestones || []).map((item, index) => (
                      <div
                        key={`milestone-view-${index}`}
                        className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-800"
                      >
                        <p><span className="font-semibold text-slate-600">Phase:</span> {textOrNA(item?.phase)}</p>
                        <p><span className="font-semibold text-slate-600">Task:</span> {textOrNA(item?.task)}</p>
                        <p><span className="font-semibold text-slate-600">Duration:</span> {textOrNA(item?.duration)}</p>
                        <p><span className="font-semibold text-slate-600">Responsibility:</span> {textOrNA(item?.responsibility)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2 rounded-md bg-[#1A1A40] text-white text-sm font-semibold"
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
        const prd = await fetchPrdById(prdId, token);
        setSelectedPrd(prd);
        setEditPrdForm(mapPrdToEditForm(prd));
      } catch (error) {
        setErrorMessage(error.message || "Failed to load PRD.");
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
      if (prev[field].length === 1) {
        return prev;
      }
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
      const payload = mapEditFormToUpdatePayload(selectedPrd, editPrdForm, action);
      await updatePrd(selectedPrd.id, payload, token);
      const refreshed = await fetchPrdById(selectedPrd.id, token);
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
    return <p className="text-sm text-gray-500">Loading selected PRD...</p>;
  }

  return (
    <div className="space-y-4">
      {errorMessage && <p className="text-sm font-semibold text-red-500">{errorMessage}</p>}
      {message && <p className="text-sm font-semibold text-green-600">{message}</p>}
      {selectedPrd && (
        <p className="text-xs font-semibold text-gray-500">
          Status: {selectedPrd.status || "In Review"} | Version: {selectedPrd.version || "1.0"}
          {selectedPrd.sentToClient ? " | Sent to Client" : ""}
        </p>
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
    <Suspense fallback={<p className="text-sm text-gray-500">Loading selected PRD...</p>}>
      <CompanyPrdDetailsEditorsContent />
    </Suspense>
  );
}
