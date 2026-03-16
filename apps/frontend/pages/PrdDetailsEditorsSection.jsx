"use client";

import React from "react";
import { CheckCircle, Trash2 } from "lucide-react";
import { cn } from "../utils/cn.js";

export default function PrdDetailsEditorsSection({
  selectedPrd,
  isEditingPrd,
  canSavePrdEdits,
  editPrdForm,
  updateEditPrdField,
  updateEditPrdArrayItem,
  addEditPrdArrayItem,
  removeEditPrdArrayItem,
  onToggleEdit,
  onSaveDraft,
  onApprove
}) {
  return (
    <div className="space-y-8">
      <div className="flex justify-end gap-4">
        <button
          onClick={onToggleEdit}
          className={cn(
            "px-6 py-2 rounded-md text-sm font-semibold",
            canSavePrdEdits
              ? "bg-[#1A1A40] text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
          disabled={!canSavePrdEdits}
        >
          {isEditingPrd ? "Save Changes" : "Edit Prd"}
        </button>
        <button
          onClick={onSaveDraft}
          className={cn(
            "border px-6 py-2 rounded-md text-sm font-semibold",
            canSavePrdEdits
              ? "border-[#1A1A40] text-[#1A1A40]"
              : "border-gray-300 text-gray-400 cursor-not-allowed"
          )}
          disabled={!canSavePrdEdits}
        >
          Save Draft
        </button>
        <button
          onClick={onApprove}
          className={cn(
            "border px-6 py-2 rounded-md text-sm font-semibold transition-colors",
            canSavePrdEdits
              ? "border-[#1A1A40] text-[#1A1A40] hover:bg-[#1A1A40] hover:text-white"
              : "border-gray-300 text-gray-400 cursor-not-allowed"
          )}
          disabled={!canSavePrdEdits}
        >
          Approve
        </button>
      </div>
      {isEditingPrd && !canSavePrdEdits && (
        <p className="text-right text-xs font-semibold text-red-500">
          Please keep at least one item in each list and fill all fields before
          saving.
        </p>
      )}

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
                  Product Name: {selectedPrd?.title || "Smart Task Allocation and Tracking System"}
                </p>
                <p>Client Name: {selectedPrd?.lastModified || "John Doe"}</p>
                <p>Current Version: {selectedPrd?.version || "1.1"}</p>
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
              {(selectedPrd?.functionalRequirements || []).map((item, index) => (
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
              {(selectedPrd?.projectOverview || []).map((item, index) => (
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
              {editPrdForm.reviewers.map((item, index) => (
                <div key={`reviewer-${index}`} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={item}
                    onChange={updateEditPrdArrayItem("reviewers", index)}
                    className="flex-1 bg-white border-none rounded-lg p-3"
                  />
                  {editPrdForm.reviewers.length > 1 && (
                    <button
                      onClick={() => removeEditPrdArrayItem("reviewers", index)}
                      className="text-red-500 hover:text-red-600"
                      aria-label="Remove reviewer"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addEditPrdArrayItem("reviewers")}
                className="text-xs font-semibold text-[#1A1A40]"
              >
                + Add Reviewer
              </button>
            </div>
          ) : (
            <ul className="space-y-4 text-gray-700 font-medium list-disc list-inside">
              {(selectedPrd?.reviewers || []).map((item, index) => (
                <li key={`reviewer-view-${index}`}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
