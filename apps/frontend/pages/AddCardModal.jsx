"use client";

import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const emptyData = {
  title: "",
  tag: "Medium",
  description: "",
  date: "", // store as YYYY-MM-DD
  attachments: [],
  assignee: "",
};

const AddCardModal = ({ show, initialData = emptyData, onCancel, onSave }) => {
  const fileInputRef = useRef(null);

  // Refs to focus first error field
  const titleRef = useRef(null);
  const assigneeRef = useRef(null);
  const dateRef = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [form, setForm] = useState(() => ({
    ...emptyData,
    ...initialData,
    tag: initialData.tag || "Medium",
    attachments: initialData.attachments || [],
  }));

  const [errors, setErrors] = useState({});
  const [showTopError, setShowTopError] = useState(false);

  // Reset when opening
  useEffect(() => {
    if (!show) return;

    setForm({
      ...emptyData,
      ...initialData,
      tag: initialData.tag || "Medium",
      attachments: initialData.attachments || [],
    });

    setErrors({});
    setShowTopError(false);
  }, [initialData, show]);

  // ESC close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    if (show) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, onCancel]);

  if (!show) return null;

  const validate = () => {
    const e = {};

    if (!form.title?.trim()) e.title = "Title is required";
    if (!form.assignee?.trim()) e.assignee = "Assignee is required";
    if (!form.date?.trim()) e.date = "Due date is required";

    setErrors(e);
    const hasErrors = Object.keys(e).length > 0;
    setShowTopError(hasErrors);

    // Focus first error (nice UX)
    if (hasErrors) {
      if (e.title) titleRef.current?.focus();
      else if (e.assignee) assigneeRef.current?.focus();
      else if (e.date) dateRef.current?.setFocus?.(); // react-datepicker special method
    }

    return !hasErrors;
  };

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setShowTopError(false);
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setForm((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...files.map((f) => f.name)],
    }));

    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || []);
    if (!files.length) return;

    setForm((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...files.map((f) => f.name)],
    }));
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave?.(form);
  };

  // Convert form.date (YYYY-MM-DD) -> Date object for DatePicker
  const selectedDate = form.date ? new Date(form.date) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-0 bg-black/40 backdrop-blur-sm"
        onMouseDown={(e) => {
          e.stopPropagation();
          onCancel?.();
        }}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-[680px] mx-4 bg-white rounded-xl shadow-2xl p-6 sm:p-7"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Create new ticket</h3>
            <p className="text-sm text-slate-500 mt-1">
              Add task details and assign it to a team member.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Top error */}
        {showTopError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Please fill all required fields.
          </div>
        )}

        <div className="mt-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleRef}
              name="title"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Enter task title"
              className={`mt-2 w-full h-11 rounded-xl border px-3 outline-none focus:ring-2 ${
                errors.title
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={4}
              placeholder="Enter task details..."
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* Assignee + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Assignee <span className="text-red-500">*</span>
              </label>
              <select
                ref={assigneeRef}
                name="assignee"
                value={form.assignee || ""}
                onChange={(e) => setField("assignee", e.target.value)}
                className={`mt-2 w-full h-11 rounded-xl border px-3 outline-none focus:ring-2 ${
                  errors.assignee
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"
                }`}
              >
                <option value="">Select assignee</option>
                {/* add your real users here */}
                {/* <option value="u001">Amanda</option> */}
              </select>
              {errors.assignee ? (
                <p className="mt-1 text-xs text-red-600">{errors.assignee}</p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">Choose a team member.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Priority</label>
              <select
                name="tag"
                value={form.tag || "Medium"}
                onChange={(e) => setField("tag", e.target.value)}
                className="mt-2 w-full h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Due date <span className="text-red-500">*</span>
            </label>

            <DatePicker
              ref={dateRef}
              selected={selectedDate}
              onChange={(date) => {
                if (!date) return;
                // prevent past dates
                if (date < today) return;
                setField("date", date.toISOString().slice(0, 10)); // store YYYY-MM-DD
              }}
              minDate={today}
              dateFormat="yyyy/MM/dd"
              placeholderText="yyyy/MM/dd"
              className={`mt-2 w-full h-11 rounded-xl border px-3 outline-none focus:ring-2 ${
                errors.date
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"
              }`}
            />

            {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Attachment</label>

            <div className="mt-2">
              <div
                className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 px-4 py-5 text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div className="text-sm text-slate-600">Drop files or click to upload</div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFiles}
                className="hidden"
              />

              {form.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.attachments.map((name, idx) => (
                    <span
                      key={`${name}-${idx}`}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
                    >
                      <span className="max-w-[240px] truncate">{name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            attachments: prev.attachments.filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-slate-400 hover:text-slate-700"
                        aria-label="Remove file"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-11 rounded-xl bg-slate-100 px-5 text-slate-800 hover:bg-slate-200"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="h-11 rounded-xl bg-indigo-600 px-5 text-white hover:bg-indigo-700"
            >
              Create ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCardModal;




