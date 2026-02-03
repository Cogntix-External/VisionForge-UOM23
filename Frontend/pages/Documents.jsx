import React, { useState } from "react";
import { Icons } from "../constants";

const MOCK_DOCS = [
  {
    id: "1",
    projectName: "NexaFlow",
    title: "PRD",
    version: "3.0",
    startDate: "15/01/2024",
    size: "2.4 MB",
    format: "PDF",
    description: "Product Requirements Document",
  },
  {
    id: "2",
    projectName: "SmartCore",
    title: "CR",
    version: "2.5",
    startDate: "Mar 3, 2025",
    size: "1.8 MB",
    format: "PDF",
    description: "Change Request Document",
  },
  {
    id: "3",
    projectName: "AppNest",
    title: "CR",
    version: "1.0",
    startDate: "Jan 14, 2025",
    size: "1.2 MB",
    format: "PDF",
    description: "Change Request Document",
  },
  {
    id: "4",
    projectName: "SecureGate",
    title: "CR",
    version: "1.5",
    startDate: "Aug 28, 2025",
    size: "3.1 MB",
    format: "PDF",
    description: "Change Request Document",
  },
  {
    id: "5",
    projectName: "AIFlow",
    title: "PRD",
    version: "2.0",
    startDate: "Jan 15, 2025",
    size: "2.8 MB",
    format: "PDF",
    description: "Product Requirements Document",
  },
];

// Accessible Modal Components
const ViewerModal = ({ doc, onClose }) => {
  if (!doc) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewer-title"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[90vw] lg:max-w-4xl max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex justify-between items-center">
          <div>
            <h2 id="viewer-title" className="text-white font-bold text-2xl">
              {doc.title}
            </h2>
            <p className="text-purple-100 text-sm mt-1">
              {doc.projectName} • v{doc.version}
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
        <div className="p-8">
          <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center mb-6">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-600 font-medium">Document Preview</p>
              <p className="text-gray-500 text-sm mt-2">
                {doc.format} Document • {doc.size}
              </p>
            </div>
          </div>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Description:</strong> {doc.description}
            </p>
            <p>
              <strong>Version:</strong> {doc.version}
            </p>
            <p>
              <strong>Last Updated:</strong> {doc.startDate}
            </p>
            <p>
              <strong>Document Size:</strong> {doc.size}
            </p>
          </div>
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => downloadDocument(doc)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2"
              aria-label={`Download ${doc.title} document`}
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

const AddDocumentModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    projectName: "",
    title: "PRD",
    version: "1.0",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-doc-title"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[90vw] lg:max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
          <h2 id="add-doc-title" className="text-white font-bold text-2xl">
            Add New Document
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={formData.projectName}
              onChange={(e) =>
                setFormData({ ...formData, projectName: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="e.g., SmartCore"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Document Type *
              </label>
              <select
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option>PRD</option>
                <option>CR</option>
                <option>Design</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Version *
              </label>
              <input
                type="text"
                required
                value={formData.version}
                onChange={(e) =>
                  setFormData({ ...formData, version: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="1.0"
              />
            </div>
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
              placeholder="Document description..."
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition"
              aria-label="Submit new document"
            >
              Add Document
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition"
              aria-label="Cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const downloadDocument = (doc) => {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    `data:text/plain;charset=utf-8,${encodeURIComponent(`${doc.title} - ${doc.projectName} v${doc.version}`)}`,
  );
  element.setAttribute(
    "download",
    `${doc.projectName}_${doc.title}_v${doc.version}.pdf`,
  );
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Documents");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docs, setDocs] = useState(MOCK_DOCS);
  const [showAddModal, setShowAddModal] = useState(false);

  const filterOptions = [
    "All Documents",
    "Type: PRD",
    "Type: CR",
    "Version: v3.0+",
    "Recent Uploads",
  ];

  const filteredDocs = docs.filter((doc) => {
    const matchesSearch =
      doc.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = true;

    if (activeFilter === "Type: PRD") matchesFilter = doc.title === "PRD";
    else if (activeFilter === "Type: CR") matchesFilter = doc.title === "CR";
    else if (activeFilter === "Version: v3.0+")
      matchesFilter = parseFloat(doc.version) >= 3.0;
    else if (activeFilter === "Recent Uploads")
      matchesFilter =
        doc.startDate.includes("2025") || doc.startDate.includes("Mar");

    return matchesSearch && matchesFilter;
  });

  const handleAddDocument = (formData) => {
    const newDoc = {
      id: (docs.length + 1).toString(),
      ...formData,
      startDate: new Date().toLocaleDateString(),
      size: "1.5 MB",
      format: "PDF",
    };
    setDocs([newDoc, ...docs]);
  };

  return (
    <div className="space-y-8 -mt-6 relative z-10 px-4 pb-10">
      <div className="flex items-center gap-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400">
            <Icons.Search />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-6 py-4 border border-transparent rounded-2xl bg-[#e5e7eb]/60 text-gray-900 placeholder-gray-500 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-sm"
            placeholder="Search documents by project or title...."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all shadow-sm whitespace-nowrap"
          aria-label="Add new document"
        >
          <span className="text-2xl">+</span>
          <span>Add Document</span>
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-[#f9fafb]">
            <tr>
              <th className="px-10 py-8 text-left text-xl font-medium text-gray-900">
                Project name
              </th>
              <th className="px-10 py-8 text-left text-xl font-medium text-gray-900">
                Title
              </th>
              <th className="px-10 py-8 text-left text-xl font-medium text-gray-900 text-center">
                Version
              </th>
              <th className="px-10 py-8 text-left text-xl font-medium text-gray-900">
                Date
              </th>
              <th className="px-10 py-8 text-center text-xl font-medium text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-10 py-10 whitespace-nowrap">
                    <span className="text-gray-600 text-lg font-medium">
                      {doc.projectName}
                    </span>
                  </td>
                  <td className="px-10 py-10 whitespace-nowrap">
                    <span className="text-gray-900 text-lg font-bold">
                      {doc.title}
                    </span>
                  </td>
                  <td className="px-10 py-8 whitespace-nowrap text-center">
                    <span className="text-gray-500 text-lg font-medium">
                      {doc.version}
                    </span>
                  </td>
                  <td className="px-10 py-10 whitespace-nowrap">
                    <span className="text-gray-900 text-lg font-bold">
                      {doc.startDate}
                    </span>
                  </td>
                  <td className="px-10 py-10 whitespace-nowrap text-center">
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="px-6 py-2 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200 transition"
                        aria-label={`View ${doc.title}`}
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => downloadDocument(doc)}
                        className="px-6 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 transition"
                        aria-label={`Download ${doc.title}`}
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
                  No documents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedDoc && (
        <ViewerModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
      {showAddModal && (
        <AddDocumentModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddDocument}
        />
      )}
    </div>
  );
};

export default Documents;
