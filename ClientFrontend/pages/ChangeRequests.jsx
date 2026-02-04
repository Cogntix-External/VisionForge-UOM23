import React, { useState } from "react";
import { Icons } from "../constants";

const MOCK_CRS = [
  {
    id: "CR-2025-001",
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

const downloadCR = (cr) => {
  const content = `CHANGE REQUEST\nID: ${cr.id}\nTitle: ${cr.title}\nProject: ${cr.projectName}\nStatus: ${cr.status}\nBudget: $${cr.budget}\nTimeline: ${cr.timeline}\nDescription: ${cr.description}`;
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`,
  );
  element.setAttribute("download", `${cr.id}.txt`);
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
              {cr.id} • {cr.projectName}
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

const AddCRModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    projectName: "SmartCore",
    title: "",
    description: "",
    budget: "",
    timeline: "",
    priority: "Medium",
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return;
    onAdd(formData);
    onClose();
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
              <option>SmartCore</option>
              <option>AppNest</option>
              <option>NexaFlow</option>
              <option>SecureGate</option>
            </select>
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
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition"
            >
              Submit CR
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition"
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

  const filteredCRs = crs.filter((cr) => {
    const matchesSearch =
      cr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cr.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || cr.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddCR = (formData) => {
    const newCR = {
      ...formData,
      id: `CR-2025-${String(crs.length + 1).padStart(3, "0")}`,
      status: "Pending",
      createdAt: new Date().toLocaleDateString(),
      budget: parseInt(formData.budget) || 0,
    };
    setCrs([newCR, ...crs]);
  };

  return (
    <div className="space-y-8 -mt-6 relative z-10 px-4 pb-10">
      <div className="flex justify-between items-center gap-6 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
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
        <div className="flex gap-4">
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

      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-[#f9fafb]">
            <tr>
              <th className="px-10 py-8 text-left text-xl font-medium text-gray-900">
                ID / Date
              </th>
              <th className="px-10 py-8 text-left text-xl font-medium text-gray-900">
                Title & Project
              </th>
              <th className="px-10 py-8 text-left text-xl font-medium text-gray-900">
                Status
              </th>
              <th className="px-10 py-8 text-right text-xl font-medium text-gray-900">
                Budget
              </th>
              <th className="px-10 py-8 text-center text-xl font-medium text-gray-900">
                Actions
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
                  <td className="px-10 py-10 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-gray-900 text-lg font-bold">
                        {cr.id}
                      </span>
                      <span className="text-gray-400 text-sm font-bold">
                        {cr.createdAt}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-10 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-gray-900 text-lg font-bold">
                        {cr.title}
                      </span>
                      <span className="text-[#7c3aed] text-sm font-extrabold uppercase">
                        {cr.projectName}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-10 whitespace-nowrap">
                    <span
                      className={`px-6 py-2 rounded-full text-base font-bold ${cr.status === "Approved" ? "bg-green-100 text-green-700" : cr.status === "Proposed" ? "bg-blue-100 text-blue-700" : cr.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      {cr.status}
                    </span>
                  </td>
                  <td className="px-10 py-10 whitespace-nowrap text-right">
                    <span className="text-gray-900 text-2xl font-black">
                      ${cr.budget.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-10 py-10 whitespace-nowrap text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setSelectedCR(cr)}
                        className="px-6 py-2 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200 transition"
                        aria-label={`View ${cr.title}`}
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => downloadCR(cr)}
                        className="px-6 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 transition"
                        aria-label={`Download ${cr.title}`}
                      >
                        ⬇️ Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
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
        />
      )}
    </div>
  );
};

export default ChangeRequests;
