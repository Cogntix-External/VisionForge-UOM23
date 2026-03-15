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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-xl">
              <p className="text-gray-600 text-xs font-bold">Type</p>
              <p className="text-gray-900 text-base font-bold mt-1">
                {doc.title}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl">
              <p className="text-gray-600 text-xs font-bold">Version</p>
              <p className="text-gray-900 text-base font-bold mt-1">
                v{doc.version}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl">
              <p className="text-gray-600 text-xs font-bold">Last Updated</p>
              <p className="text-gray-900 text-base font-bold mt-1">
                {doc.startDate}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl">
              <p className="text-gray-600 text-xs font-bold">Format</p>
              <p className="text-gray-900 text-base font-bold mt-1">
                {doc.format} • {doc.size}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Document Summary
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {doc.description} for the {doc.projectName} project. This document
              captures the latest requirements and changes for version v
              {doc.version}.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="space-y-2">
              <p>
                <strong>Project:</strong> {doc.projectName}
              </p>
              <p>
                <strong>Document Type:</strong> {doc.title}
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <strong>Version:</strong> {doc.version}
              </p>
              <p>
                <strong>File Size:</strong> {doc.size}
              </p>
            </div>
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
  const [searchField, setSearchField] = useState("All");
  const [activeFilter, setActiveFilter] = useState("All Documents");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docs, setDocs] = useState(MOCK_DOCS);

  const filterOptions = [
    "All Documents",
    "Type: PRD",
    "Type: CR",
    "Version: v3.0+",
    "Recent Uploads",
  ];

  const filteredDocs = docs.filter((doc) => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    const matchesSearch = (() => {
      if (!normalizedTerm) return true;
      if (searchField === "Project")
        return doc.projectName.toLowerCase().includes(normalizedTerm);
      if (searchField === "Title")
        return doc.title.toLowerCase().includes(normalizedTerm);
      if (searchField === "Version")
        return doc.version.toLowerCase().includes(normalizedTerm);
      if (searchField === "Date")
        return doc.startDate.toLowerCase().includes(normalizedTerm);
      return (
        doc.projectName.toLowerCase().includes(normalizedTerm) ||
        doc.title.toLowerCase().includes(normalizedTerm) ||
        doc.version.toLowerCase().includes(normalizedTerm) ||
        doc.startDate.toLowerCase().includes(normalizedTerm)
      );
    })();
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

  return (
    <div className="space-y-6 lg:space-y-8 -mt-6 relative z-10 px-2 sm:px-4 pb-10">
      <div className="flex items-center gap-3 lg:gap-6 flex-wrap">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400">
              <Icons.Search />
            </div>
            <input
              type="text"
              className="block w-full pl-14 pr-6 py-4 border border-transparent rounded-2xl bg-[#e5e7eb]/60 text-gray-900 placeholder-gray-500 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-sm"
              placeholder="Search documents...."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search documents"
            />
          </div>
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="px-4 py-4 bg-[#e5e7eb]/60 text-gray-900 font-bold rounded-2xl border border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            aria-label="Search by field"
          >
            <option>All</option>
            <option>Project</option>
            <option>Title</option>
            <option>Version</option>
            <option>Date</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-x-auto">
        <table className="min-w-[520px] w-full table-fixed">
          <colgroup>
            <col className="w-[26%]" />
            <col className="w-[16%]" />
            <col className="w-[14%]" />
            <col className="w-[18%]" />
            <col className="w-[13%]" />
            <col className="w-[13%]" />
          </colgroup>
          <thead className="bg-[#f9fafb]">
            <tr>
              <th className="px-2 lg:px-10 py-2.5 lg:py-6 text-left align-middle text-[11px] sm:text-sm lg:text-xl font-medium text-gray-900">
                Project name
              </th>
              <th className="px-2 lg:px-10 py-2.5 lg:py-6 text-left align-middle text-[11px] sm:text-sm lg:text-xl font-medium text-gray-900">
                Title
              </th>
              <th className="px-2 lg:px-10 py-2.5 lg:py-6 text-center align-middle text-[11px] sm:text-sm lg:text-xl font-medium text-gray-900">
                Version
              </th>
              <th className="px-2 lg:px-10 py-2.5 lg:py-6 text-left align-middle text-[11px] sm:text-sm lg:text-xl font-medium text-gray-900">
                Date
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
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-2 lg:px-10 py-3.5 lg:py-6 align-middle">
                    <span className="text-gray-600 text-[11px] sm:text-sm lg:text-lg font-medium break-words leading-tight">
                      {doc.projectName}
                    </span>
                  </td>
                  <td className="px-2 lg:px-10 py-3.5 lg:py-6 align-middle">
                    <span className="text-gray-900 text-[11px] sm:text-sm lg:text-lg font-bold break-words leading-tight">
                      {doc.title}
                    </span>
                  </td>
                  <td className="px-2 lg:px-10 py-3.5 whitespace-nowrap text-center align-middle">
                    <span className="text-gray-500 text-[11px] sm:text-sm lg:text-lg font-medium leading-tight">
                      {doc.version}
                    </span>
                  </td>
                  <td className="px-2 lg:px-10 py-3.5 lg:py-6 whitespace-nowrap align-middle">
                    <span className="text-gray-900 text-[11px] sm:text-sm lg:text-lg font-bold leading-tight">
                      {doc.startDate}
                    </span>
                  </td>
                  <td className="px-2 lg:px-6 py-3.5 lg:py-6 text-center align-middle">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="inline-flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 bg-green-100 text-green-700 text-base lg:text-lg font-bold rounded-lg hover:bg-green-200 transition leading-none"
                      aria-label={`View ${doc.title}`}
                      title="View"
                    >
                      👁️
                    </button>
                  </td>
                  <td className="px-2 lg:px-6 py-3.5 lg:py-6 text-center align-middle">
                    <button
                      onClick={() => downloadDocument(doc)}
                      className="inline-flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 bg-blue-100 text-blue-700 text-base lg:text-lg font-bold rounded-lg hover:bg-blue-200 transition leading-none"
                      aria-label={`Download ${doc.title}`}
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
    </div>
  );
};

export default Documents;
