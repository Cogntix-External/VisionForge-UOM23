import React, { useEffect, useState } from "react";
import { CR_API_BASE, Icons } from "../constants";

const MOCK_CRS = [
  {
    id: "CR-2025-001",
    displayId: "CR-2025-001",
    projectId: "1",
    projectName: "SmartCore",
    title: "Add dark mode",
    description: "Enable theme switching for better accessibility",
    status: "Approved",
    budget: 1500,
    timeline: "2 weeks",
    createdAt: "Feb 15, 2025",
    priority: "High",
  },
  {
    id: "CR-2025-002",
    displayId: "CR-2025-002",
    projectId: "2",
    projectName: "AppNest",
    title: "Stripe Integration",
    description: "Support multi-currency payments",
    status: "Proposed",
    budget: 3000,
    timeline: "4 weeks",
    createdAt: "Mar 01, 2025",
    priority: "Medium",
  },
  {
    id: "CR-2025-003",
    displayId: "CR-2025-003",
    projectId: "1",
    projectName: "SmartCore",
    title: "Social Auth",
    description: "Add Google login support",
    status: "Pending",
    budget: 2000,
    timeline: "3 weeks",
    createdAt: "Mar 05, 2025",
    priority: "High",
  },
];

const PROJECT_OPTIONS = ["SmartCore", "AppNest", "NexaFlow", "SecureGate"];

const API_TO_UI_STATUS = {
  PENDING_REVIEW: "Pending",
  PROPOSAL_SENT: "Proposed",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const UI_TO_API_STATUS = {
  Pending: "PENDING_REVIEW",
  Proposed: "PROPOSAL_SENT",
  Approved: "APPROVED",
  Rejected: "REJECTED",
};

const generateDisplayId = () => {
  const year = new Date().getFullYear();
  const seed = Date.now().toString().slice(-4);
  return `CR-${year}-${seed}`;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("crms_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatDate = (value) => {
  if (!value) return new Date().toLocaleDateString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toLocaleDateString();
  }
  return parsed.toLocaleDateString();
};

const mapCrFromApi = (cr) => ({
  id: cr.id || `CR-${Date.now()}`,
  displayId: cr.displayId || "",
  projectId: cr.projectId,
  projectName: cr.projectName || cr.projectId || "Unknown",
  title: cr.title || "Untitled",
  description: cr.description || "",
  status: API_TO_UI_STATUS[cr.status] || cr.status || "Pending",
  budget: Number(cr.requestedBudget ?? cr.proposedBudget ?? 0),
  timeline:
    cr.requestedTimeline ||
    (cr.proposedTimelineDays ? `${cr.proposedTimelineDays} days` : ""),
  createdAt: formatDate(cr.createdAt),
  priority: cr.priority || "Medium",
});

const mapCrToApi = (formData) => ({
  displayId: formData.displayId || generateDisplayId(),
  title: formData.title.trim(),
  description: formData.description.trim(),
  requestedBudget: Number(formData.budget) || 0,
  requestedTimeline: formData.timeline.trim(),
  priority: formData.priority,
  projectName: formData.projectName,
  status: UI_TO_API_STATUS.Pending,
});

const downloadCR = (cr) => {
  const resolvedId = cr.displayId || "";
  const content = `CHANGE REQUEST\nID: ${resolvedId}\nTitle: ${cr.title}\nProject: ${cr.projectName}\nStatus: ${cr.status}\nBudget: $${cr.budget}\nTimeline: ${cr.timeline}\nDescription: ${cr.description}`;
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`,
  );
  element.setAttribute("download", `${resolvedId || "change-request"}.txt`);
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const CRViewerModal = ({ cr, onClose }) => {
  if (!cr) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cr-viewer-title"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[90vw] lg:max-w-4xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex justify-between items-center">
          <div>
            <h2 id="cr-viewer-title" className="text-white font-bold text-2xl">
              {cr.title}
            </h2>
            <p className="text-purple-100 text-sm mt-1">
              {cr.displayId} • {cr.projectName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            aria-label="Close viewer"
          >
            ✕
          </button>
        </div>
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-100 p-4 rounded-xl">
              <p className="text-gray-600 text-sm font-bold">Status</p>
              <p
                className={`text-lg font-bold mt-1 ${cr.status === "Approved" ? "text-green-600" : cr.status === "Proposed" ? "text-blue-600" : "text-amber-600"}`}
              >
                {cr.status}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl">
              <p className="text-gray-600 text-sm font-bold">Budget</p>
              <p className="text-lg font-bold text-green-600 mt-1">
                ${cr.budget.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl">
              <p className="text-gray-600 text-sm font-bold">Timeline</p>
              <p className="text-lg font-bold text-purple-600 mt-1">
                {cr.timeline}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl">
              <p className="text-gray-600 text-sm font-bold">Priority</p>
              <p
                className={`text-lg font-bold mt-1 ${cr.priority === "High" ? "text-red-600" : "text-yellow-600"}`}
              >
                {cr.priority}
              </p>
            </div>
          </div>
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              {cr.description}
            </p>
          </div>
          <div className="flex gap-4 pt-6 border-t">
            <button
              onClick={() => downloadCR(cr)}
              className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
              aria-label={`Download ${cr.title} CR`}
            >
              ⬇️ Download PDF
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition"
              aria-label="Close"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddCRModal = ({ onClose, onAdd, isSubmitting, error }) => {
  const [formData, setFormData] = useState({
    projectName: "SmartCore",
    displayId: generateDisplayId(),
    title: "",
    description: "",
    budget: "",
    timeline: "",
    priority: "Medium",
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.displayId.trim()) return;
    const success = await onAdd(formData);
    if (success) onClose();
  };
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-cr-title"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[90vw] lg:max-w-2xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 sticky top-0">
          <h2 id="add-cr-title" className="text-white font-bold text-2xl">
            Raise New Change Request
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Project *
            </label>
            <select
              required
              value={formData.projectName}
              onChange={(e) =>
                setFormData({ ...formData, projectName: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
            >
              {PROJECT_OPTIONS.map((project) => (
                <option key={project}>{project}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">CR ID</label>
            <input
              type="text"
              value={formData.displayId}
              onChange={(e) =>
                setFormData({ ...formData, displayId: e.target.value })
              }
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="CR-2026-001"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="e.g., Add dark mode support"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none min-h-24"
              placeholder="Detailed description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Budget ($)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="2000"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Timeline
              </label>
              <input
                type="text"
                value={formData.timeline}
                onChange={(e) =>
                  setFormData({ ...formData, timeline: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="e.g., 2 weeks"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          {error && (
            <p className="text-sm text-red-600 font-semibold">{error}</p>
          )}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit CR"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChangeRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCR, setSelectedCR] = useState(null);
  const [crs, setCrs] = useState(MOCK_CRS);
  const [filterStatus, setFilterStatus] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadChangeRequests = async () => {
      setIsLoading(true);
      setError("");

      const results = await Promise.allSettled(
        PROJECT_OPTIONS.map(async (projectId) => {
          const response = await fetch(
            `${CR_API_BASE}/${encodeURIComponent(projectId)}/change-requests`,
            {
              headers: {
                ...getAuthHeaders(),
              },
            },
          );

          if (!response.ok) {
            const message = await response.text();
            if (response.status === 401) {
              throw new Error("Please log in again to load change requests.");
            }
            throw new Error(message || `Failed to load ${projectId} CRs`);
          }

          return response.json();
        }),
      );

      if (!isMounted) return;

      const loaded = [];
      const failures = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          loaded.push(...result.value);
        } else {
          failures.push(PROJECT_OPTIONS[index]);
        }
      });

      if (loaded.length > 0) {
        setCrs(loaded.map(mapCrFromApi));
      }

      if (failures.length > 0) {
        setError("Some change requests could not be loaded.");
      }

      setIsLoading(false);
    };

    loadChangeRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCRs = crs.filter((cr) => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    const matchesSearch =
      cr.title.toLowerCase().includes(normalizedTerm) ||
      cr.projectName.toLowerCase().includes(normalizedTerm) ||
      cr.createdAt.toLowerCase().includes(normalizedTerm) ||
      cr.id.toLowerCase().includes(normalizedTerm);
    const matchesStatus = filterStatus === "All" || cr.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddCR = async (formData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `${CR_API_BASE}/${encodeURIComponent(formData.projectName)}/change-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(mapCrToApi(formData)),
        },
      );

      if (!response.ok) {
        const message = await response.text();
        if (response.status === 401) {
          throw new Error("Please log in again to submit a change request.");
        }
        throw new Error(message || "Failed to create change request");
      }

      const saved = await response.json();
      const newCR = mapCrFromApi(saved);
      if (!newCR.displayId) {
        newCR.displayId = formData.displayId.trim();
      }
      setCrs((prev) => [newCR, ...prev]);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 -mt-6 relative z-10 px-2 sm:px-4 pb-10">
      <div className="flex justify-between items-center gap-3 lg:gap-6 flex-wrap">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
          <div className="relative flex-1 min-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400">
              <Icons.Search />
            </div>
            <input
              type="text"
              className="block w-full pl-14 pr-6 py-4 border border-transparent rounded-2xl bg-[#e5e7eb]/60 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-sm"
              placeholder="Search change requests...."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search change requests"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-6 py-4 bg-[#e5e7eb]/60 text-gray-900 font-bold rounded-2xl border border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            aria-label="Filter by status"
          >
            <option>All</option>
            <option>Approved</option>
            <option>Proposed</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
            aria-label="Raise new change request"
          >
            <span className="text-2xl">+</span>
            <span>Raise CR</span>
          </button>
        </div>
      </div>

      {(isLoading || error) && (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 shadow-sm">
          {isLoading && (
            <p className="text-gray-600 font-semibold">
              Loading change requests...
            </p>
          )}
          {!isLoading && error && (
            <p className="text-red-600 font-semibold">{error}</p>
          )}
        </div>
      )}

      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-x-auto">
        <table className="min-w-[520px] w-full table-fixed">
          <colgroup>
            <col className="w-[16%]" />
            <col className="w-[26%]" />
            <col className="w-[16%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead className="bg-[#f9fafb]">
            <tr>
              <th className="px-2 lg:px-10 py-2.5 lg:py-6 text-left align-middle text-[11px] sm:text-sm lg:text-xl font-medium text-gray-900">
                ID / Date
              </th>
              <th className="px-2 lg:px-10 py-2.5 lg:py-6 text-left align-middle text-[11px] sm:text-sm lg:text-xl font-medium text-gray-900">
                Title & Project
              </th>
              <th className="px-2 lg:px-10 py-2.5 lg:py-6 text-center align-middle text-[11px] sm:text-sm lg:text-xl font-medium text-gray-900">
                Status
              </th>
              <th className="px-2 lg:px-10 py-2.5 lg:py-6 text-right align-middle text-[11px] sm:text-sm lg:text-xl font-medium text-gray-900">
                Budget
              </th>
              <th className="px-2 lg:px-6 py-2.5 lg:py-6 text-center align-middle text-[11px] sm:text-sm lg:text-xl font-medium text-gray-900">
                View
              </th>
              <th className="px-2 lg:px-6 py-2.5 lg:py-6 text-center align-middle text-[11px] sm:text-sm lg:text-xl font-medium text-gray-900">
                Download
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {filteredCRs.length > 0 ? (
              filteredCRs.map((cr) => (
                <tr
                  key={cr.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-2 lg:px-10 py-3.5 lg:py-6 align-middle">
                    <div className="flex flex-col leading-tight">
                      <span className="text-gray-900 text-[11px] sm:text-sm lg:text-lg font-bold leading-tight break-all">
                        {cr.displayId}
                      </span>
                      <span className="text-gray-400 text-[11px] sm:text-sm font-bold leading-tight">
                        {cr.createdAt}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 lg:px-10 py-3.5 lg:py-6 align-middle">
                    <div className="flex flex-col gap-0.5 leading-tight">
                      <span className="text-gray-900 text-[11px] sm:text-sm lg:text-lg font-bold break-words leading-tight">
                        {cr.title}
                      </span>
                      <span className="text-[#7c3aed] text-[9px] sm:text-xs lg:text-sm font-extrabold uppercase leading-tight">
                        {cr.projectName}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 lg:px-10 py-3.5 lg:py-6 whitespace-nowrap text-center align-middle">
                    <span
                      className={`px-2 lg:px-6 py-0.5 lg:py-1.5 rounded-full text-[9px] sm:text-xs lg:text-base font-bold ${cr.status === "Approved" ? "bg-green-100 text-green-700" : cr.status === "Proposed" ? "bg-blue-100 text-blue-700" : cr.status === "Pending" ? "bg-amber-100 text-amber-700" : cr.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      {cr.status}
                    </span>
                  </td>
                  <td className="px-2 lg:px-10 py-3.5 lg:py-6 whitespace-nowrap text-right align-middle">
                    <span className="text-gray-900 text-sm sm:text-base lg:text-2xl font-black leading-tight">
                      ${Number(cr.budget || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-2 lg:px-6 py-3.5 lg:py-6 text-center align-middle">
                    <button
                      onClick={() => setSelectedCR(cr)}
                      className="inline-flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 bg-green-100 text-green-700 text-base lg:text-lg font-bold rounded-lg hover:bg-green-200 transition leading-none"
                      aria-label={`View ${cr.title}`}
                      title="View"
                    >
                      👁️
                    </button>
                  </td>
                  <td className="px-2 lg:px-6 py-3.5 lg:py-6 text-center align-middle">
                    <button
                      onClick={() => downloadCR(cr)}
                      className="inline-flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 bg-blue-100 text-blue-700 text-base lg:text-lg font-bold rounded-lg hover:bg-blue-200 transition leading-none"
                      aria-label={`Download ${cr.title}`}
                      title="Download"
                    >
                      ⬇️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-10 py-20 text-center text-xl font-bold text-gray-400"
                >
                  No change requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedCR && (
        <CRViewerModal cr={selectedCR} onClose={() => setSelectedCR(null)} />
      )}
      {showAddModal && (
        <AddCRModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddCR}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
    </div>
  );
};

export default ChangeRequests;
