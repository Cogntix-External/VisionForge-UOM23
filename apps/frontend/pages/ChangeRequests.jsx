import React, { useEffect, useMemo, useState } from "react";
import {
  createClientChangeRequest,
  getClientChangeRequests,
  getClientProjects,
} from "../services/api";
import { Icons } from "../constants";

const API_TO_UI_STATUS = {
  PENDING: "Pending",
  ACCEPTED: "Approved",
  REJECTED: "Rejected",
};

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
};

const mapCrFromApi = (cr, projects = []) => {
  const matchedProject = projects.find((p) => p.id === cr.projectId);

  return {
    id: cr.id,
    displayId: cr.id,
    projectId: cr.projectId,
    projectName:
      matchedProject?.name ||
      matchedProject?.title ||
      cr.projectId ||
      "Unknown Project",
    title: cr.title || "Untitled",
    description: cr.description || "",
    status: API_TO_UI_STATUS[cr.status] || cr.status || "Pending",
    budget: Number(cr.budget || 0),
    timeline: cr.timeline || "-",
    createdAt: formatDate(cr.createdAt),
    priority: cr.priority || "Medium",
    rejectionReason: cr.rejectionReason || "",
  };
};

const downloadCR = (cr) => {
  const content = `CHANGE REQUEST
ID: ${cr.displayId}
Title: ${cr.title}
Project: ${cr.projectName}
Status: ${cr.status}
Budget: $${cr.budget}
Timeline: ${cr.timeline}
Priority: ${cr.priority}
Description: ${cr.description}
Rejection Reason: ${cr.rejectionReason || "-"}`;

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`,
  );
  element.setAttribute("download", `${cr.displayId || "change-request"}.txt`);
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
            <InfoCard label="Status" value={cr.status} />
            <InfoCard
              label="Budget"
              value={`$${Number(cr.budget || 0).toLocaleString()}`}
            />
            <InfoCard label="Timeline" value={cr.timeline} />
            <InfoCard label="Priority" value={cr.priority} />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              {cr.description}
            </p>
          </div>

          {cr.status === "Rejected" && cr.rejectionReason && (
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-red-700 mb-2">
                Rejection Reason
              </h3>
              <p className="text-red-600 text-lg leading-relaxed">
                {cr.rejectionReason}
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-6 border-t">
            <button
              onClick={() => downloadCR(cr)}
              className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
            >
              ⬇️ Download
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ label, value }) => (
  <div className="bg-gray-100 p-4 rounded-xl">
    <p className="text-gray-600 text-sm font-bold">{label}</p>
    <p className="text-lg font-bold mt-1">{value}</p>
  </div>
);

const AddCRModal = ({ projects, onClose, onAdd, isSubmitting, error }) => {
  const [formData, setFormData] = useState({
    projectId: "",
    title: "",
    description: "",
    budget: "",
    timeline: "",
    priority: "Medium",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.projectId) {
      alert("Please select a project");
      return;
    }

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
              name="projectId"
              required
              value={formData.projectId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="">-- Select Project --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name || project.title || project.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="e.g., Add dark mode support"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Description *
            </label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
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
                name="budget"
                value={formData.budget}
                onChange={handleChange}
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
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
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
              name="priority"
              value={formData.priority}
              onChange={handleChange}
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
  const [crs, setCrs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjectsAndRequests();
  }, []);

  const fetchProjectsAndRequests = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [projectsData, crData] = await Promise.all([
        getClientProjects(),
        getClientChangeRequests(),
      ]);

      const safeProjects = Array.isArray(projectsData) ? projectsData : [];
      const safeCRs = Array.isArray(crData) ? crData : [];

      setProjects(safeProjects);
      setCrs(safeCRs.map((cr) => mapCrFromApi(cr, safeProjects)));
    } catch (err) {
      console.error(err);
      setError(err.message || "Some change requests could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCR = async (formData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        budget: formData.budget ? Number(formData.budget) : null,
        timeline: formData.timeline.trim(),
        priority: formData.priority,
      };

      const saved = await createClientChangeRequest(
        formData.projectId,
        payload,
      );
      const newCR = mapCrFromApi(saved, projects);

      setCrs((prev) => [newCR, ...prev]);
      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create change request");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCRs = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return crs.filter((cr) => {
      const matchesSearch =
        cr.title.toLowerCase().includes(normalizedTerm) ||
        cr.projectName.toLowerCase().includes(normalizedTerm) ||
        cr.createdAt.toLowerCase().includes(normalizedTerm) ||
        cr.id.toLowerCase().includes(normalizedTerm);

      const matchesStatus =
        filterStatus === "All" || cr.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [crs, filterStatus, searchTerm]);

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
            <option>Pending</option>
            <option>Rejected</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
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
        <table className="w-full">
          <thead className="bg-[#f9fafb] border-b border-gray-200">
            <tr>
              <th className="px-4 lg:px-8 py-4 lg:py-6 text-left text-sm lg:text-base font-semibold text-gray-900 whitespace-nowrap">
                ID / Date
              </th>
              <th className="px-4 lg:px-8 py-4 lg:py-6 text-left text-sm lg:text-base font-semibold text-gray-900">
                Title & Project
              </th>
              <th className="px-4 lg:px-8 py-4 lg:py-6 text-center text-sm lg:text-base font-semibold text-gray-900 whitespace-nowrap">
                Status
              </th>
              <th className="px-4 lg:px-8 py-4 lg:py-6 text-right text-sm lg:text-base font-semibold text-gray-900 whitespace-nowrap">
                Budget
              </th>
              <th className="px-4 lg:px-8 py-4 lg:py-6 text-center text-sm lg:text-base font-semibold text-gray-900 whitespace-nowrap">
                View
              </th>
              <th className="px-4 lg:px-8 py-4 lg:py-6 text-center text-sm lg:text-base font-semibold text-gray-900 whitespace-nowrap">
                Download
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {filteredCRs.length > 0 ? (
              filteredCRs.map((cr) => (
                <tr key={cr.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 lg:px-8 py-4 lg:py-6">
                    <div className="flex flex-col gap-1">
                      <span
                        className="text-gray-900 text-sm lg:text-base font-semibold cursor-help"
                        title={cr.displayId}
                      >
                        {cr.displayId.substring(0, 6)}...
                      </span>
                      <span className="text-gray-500 text-xs lg:text-sm">
                        {cr.createdAt}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 lg:px-8 py-4 lg:py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-900 text-sm lg:text-base font-semibold">
                        {cr.title}
                      </span>
                      <span className="text-purple-600 text-xs lg:text-sm font-bold uppercase">
                        {cr.projectName}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 lg:px-8 py-4 lg:py-6 text-center">
                    <span
                      className={`inline-block px-3 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-semibold ${
                        STATUS_STYLES[cr.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {cr.status}
                    </span>
                  </td>

                  <td className="px-4 lg:px-8 py-4 lg:py-6 text-right">
                    <span className="text-gray-900 text-base lg:text-lg font-bold">
                      ${Number(cr.budget || 0).toLocaleString()}
                    </span>
                  </td>

                  <td className="px-4 lg:px-8 py-4 lg:py-6 text-center">
                    <button
                      onClick={() => setSelectedCR(cr)}
                      className="px-4 lg:px-6 py-2 lg:py-2.5 bg-green-600 text-white text-sm lg:text-base font-semibold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      View
                    </button>
                  </td>

                  <td className="px-4 lg:px-8 py-4 lg:py-6 text-center">
                    <button
                      onClick={() => downloadCR(cr)}
                      className="px-4 lg:px-6 py-2 lg:py-2.5 bg-blue-600 text-white text-sm lg:text-base font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-8 py-12 text-center text-base lg:text-lg font-semibold text-gray-400"
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
          projects={projects}
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
