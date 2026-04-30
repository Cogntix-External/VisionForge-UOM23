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
    status: "todo",
    assignee: "unassigned",
    attachments: [],
  });

  const [team, setTeam] = useState([
    { id: "unassigned", name: "Unassigned", label: "Unassigned" },
  ]);

  useEffect(() => {
    if (!show) return;

    if (initialData) {
      setForm({
        title: initialData.title || "",
        tag: initialData.tag || "Medium",
        date: initialData.date || "",
        status: initialData.status || "todo",
        assignee: initialData.assignee || "unassigned",
        attachments: initialData.attachments || [],
      });
    } else {
      setForm({
        title: "",
        tag: "Medium",
        date: "",
        status: "todo",
        assignee: "unassigned",
        attachments: [],
      });
    }
  }, [show, initialData]);

  useEffect(() => {
    if (!show) return;

    let mounted = true;

    async function loadUsers() {
      try {
        const { getCompanyUsers } = await import("@/services/api");
        const users = await getCompanyUsers(companyId);

        if (!mounted) return;

        const mapped = Array.isArray(users)
          ? users.map((u) => {
              const id = u.id || u._id || u.userId || u.name || "unknown";
              const displayName = u.name || u.fullName || u.email || "User";

              return {
                id,
                label:
                  String(displayName) === String(id)
                    ? String(displayName)
                    : `${displayName} (${id})`,
              };
            })
          : [];

        setTeam([
          { id: "unassigned", label: "Unassigned" },
          ...mapped,
        ]);
      } catch {
        setTeam([{ id: "unassigned", label: "Unassigned" }]);
      }
    }

    loadUsers();
    return () => (mounted = false);
  }, [companyId, show]);

  if (!show) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setForm((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (i) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, idx) => idx !== i),
    }));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return alert("Title required");
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">

      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden">

        {/* 🔥 HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <h2 className="text-lg font-bold">
            {isEditMode ? "Edit Task" : "Create Task"}
          </h2>
          <button onClick={onCancel} className="hover:bg-white/20 p-2 rounded-full">
            <X size={18} />
          </button>
        </div>

        {/* 🔥 BODY */}
        <div className="p-6 space-y-5">

          <Input label="Title">
            <input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter task title"
              className="input"
            />
          </Input>

          <Input label="Priority">
            <select
              value={form.tag}
              onChange={(e) => handleChange("tag", e.target.value)}
              className="input"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </Input>

          <Input label="Due Date">
            <input
              type="date"
              value={form.date}
              min={minDate}
              onChange={(e) => handleChange("date", e.target.value)}
              className="input"
            />
          </Input>

          <Input label="Assignee">
            <select
              value={form.assignee}
              onChange={(e) => handleChange("assignee", e.target.value)}
              className="input"
            >
              {team.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </Input>

          {/* FILE */}
          <Input label="Attachments">
            <input type="file" multiple onChange={handleFileChange} className="input" />

            {form.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {form.attachments.map((f, i) => (
                  <div key={i} className="flex justify-between bg-slate-100 px-3 py-2 rounded-lg text-sm">
                    <span>{f.name || f}</span>
                    <button onClick={() => removeAttachment(i)} className="text-red-500">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Input>

        </div>

        {/* 🔥 FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button onClick={onCancel} className="btn-outline">
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-main">
            {isEditMode ? "Update" : "Create"}
          </button>
        </div>

      </div>
    </div>
  );
};

const Input = ({ label, children }) => (
  <div>
    <label className="block text-sm font-semibold mb-1">{label}</label>
    {children}
  </div>
);

/* 🔥 STYLES */
const styles = `
.input { width:100%; padding:12px; border-radius:12px; border:1px solid #e5e7eb }
.btn-main { background:#4f46e5; color:white; padding:10px 18px; border-radius:12px }
.btn-outline { border:1px solid #ddd; padding:10px 18px; border-radius:12px }
`;

if (typeof window !== "undefined") {
  const s = document.createElement("style");
  s.innerHTML = styles;
  document.head.appendChild(s);
}

export default AddCardModal;
