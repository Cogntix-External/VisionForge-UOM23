"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

 

const AddCardModal = ({
  show,
  onCancel,
  onSave,
  initialData,
  isEditMode,
  minDate,
  companyId,
}) => {
  const [form, setForm] = useState({
    title: "",
    tag: "Medium",
    date: "",
    assignee: "unassigned",
    attachments: [],
  });
  const [team, setTeam] = useState([{ id: "unassigned", name: "Unassigned" }]);

  useEffect(() => {
    if (show) {
      if (initialData) {
        setForm({
          title: initialData.title || "",
          tag: initialData.tag || "Medium",
          date: initialData.date || "",
          assignee: initialData.assignee || "unassigned",
          attachments: initialData.attachments || [],
        });
      } else {
        setForm({
          title: "",
          tag: "Medium",
          date: "",
          assignee: "unassigned",
          attachments: [],
        });
      }
    }
  }, [show, initialData]);

  // fetch company users for assignee dropdown
  useEffect(() => {
    let mounted = true;

    async function loadUsers() {
      try {
        const { getCompanyUsers } = await import("../../services/api");
        const users = await getCompanyUsers(companyId);
        if (!mounted) return;

        const mappedUsers = Array.isArray(users) && users.length
          ? users.map((u) => ({ id: u.id || u._id || u.userId || u.name, name: u.name || u.fullName || u.email }))
          : [];
        const list = [{ id: "unassigned", name: "Unassigned" }, ...mappedUsers.filter((u) => u?.id && u.id !== "unassigned")];

        setTeam(list);

        // if current assignee is a name, try to map to id
        setForm((prev) => {
          const matched = list.find((p) => p.name === prev.assignee || p.id === prev.assignee);
          return matched ? { ...prev, assignee: matched.id } : prev;
        });
      } catch (e) {
        setTeam([{ id: "unassigned", name: "Unassigned" }]);
      }
    }

    loadUsers();

    return () => {
      mounted = false;
    };
  }, [show]);

  if (!show) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    setForm((prev) => {
      const existingNames = prev.attachments.map((file) =>
        typeof file === "string" ? file : file.name
      );

      const newFiles = files.filter((file) => !existingNames.includes(file.name));

      return {
        ...prev,
        attachments: [...prev.attachments, ...newFiles],
      };
    });

    e.target.value = "";
  };

  const removeAttachment = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }

    onSave({
      ...form,
      attachments: form.attachments,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEditMode ? "Edit Ticket" : "Add Ticket"}
          </h2>
          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Title
            </label>
            <input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter a concise task title"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Priority
            </label>
            <select
              value={form.tag}
              onChange={(e) => handleChange("tag", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Due Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              min={minDate}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Assignee
            </label>
            <select
              value={form.assignee}
              onChange={(e) => handleChange("assignee", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {team.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          {/* Attachments */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Attachments
            </label>

            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm"
            />

            {form.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {form.attachments.map((file, index) => {
                  const fileName = typeof file === "string" ? file : file.name;

                  return (
                    <div
                      key={`${fileName}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                    >
                      <p className="truncate pr-3 text-xs text-slate-600">
                        {fileName}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-xs font-medium text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            type="button"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            type="button"
          >
            {isEditMode ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCardModal;
