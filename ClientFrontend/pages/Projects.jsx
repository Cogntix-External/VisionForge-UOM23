import React, { useState } from "react";
import { Icons } from "../constants";

const MOCK_PROJECTS = [
  {
    id: "1",
    name: "NexaFlow",
    status: "In Development",
    progress: 65,
    startDate: "Jun 2024-Jan 2025",
    manager: "Alice Smith",
    budget: 95000,
  },
  {
    id: "2",
    name: "SmartCore",
    status: "In Development",
    progress: 100,
    startDate: "Feb 2024-July 2024",
    manager: "Alice Smith",
    budget: 75000,
  },
  {
    id: "3",
    name: "AppNest",
    status: "Testing",
    progress: 80,
    startDate: "Mar 2025-Dec 2025",
    manager: "Bob Johnson",
    budget: 50000,
  },
  {
    id: "4",
    name: "WebNexus",
    status: "Requirements",
    progress: 35,
    startDate: "Aug 2025-Jan 2026",
    manager: "Charlie Brown",
    budget: 100000,
  },
  {
    id: "5",
    name: "SecureGate",
    status: "In Development",
    progress: 50,
    startDate: "Aug 2025-Dec 2025",
    manager: "David Wilson",
    budget: 70000,
  },
  {
    id: "6",
    name: "AIFlow",
    status: "In Development",
    progress: 60,
    startDate: "April 2025-July 2025",
    manager: "Eve Miller",
    budget: 82000,
  },
  {
    id: "7",
    name: "AppNest New",
    status: "Testing",
    progress: 30,
    startDate: "Jan 2026-July 2026",
    manager: "Frank Castle",
    budget: 55000,
  },
];

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Projects");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const filters = [
    "All Projects",
    "Status: In Development",
    "Status: Testing",
    "Status: Requirements",
    "Progress: > 50%",
    "Progress: < 50%",
  ];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    let matchesFilter = true;

    if (activeFilter === "Status: In Development")
      matchesFilter = project.status === "In Development";
    else if (activeFilter === "Status: Testing")
      matchesFilter = project.status === "Testing";
    else if (activeFilter === "Status: Requirements")
      matchesFilter = project.status === "Requirements";
    else if (activeFilter === "Progress: > 50%")
      matchesFilter = project.progress > 50;
    else if (activeFilter === "Progress: < 50%")
      matchesFilter = project.progress < 50;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 -mt-6 relative z-10 px-4 pb-10">
      <div className="flex items-center gap-6 relative">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400">
            <Icons.Search />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-6 py-4 border border-transparent rounded-[20px] bg-[#e5e7eb]/80 text-gray-900 placeholder-gray-500 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-inner"
            placeholder="Search projects by name...."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center space-x-4 px-8 py-4 bg-[#e5e7eb]/80 text-gray-900 font-bold rounded-[18px] hover:bg-gray-200 transition-all shadow-sm border border-gray-100 min-w-[220px] justify-between"
          >
            <div className="flex items-center space-x-3">
              <Icons.Filter />
              <span className="text-lg">{activeFilter}</span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showFilterDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-6 py-3 text-lg font-bold hover:bg-gray-50 transition-colors ${activeFilter === filter ? "text-[#7c3aed] bg-purple-50" : "text-gray-600"}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[400px]">
        <table className="min-w-full">
          <thead className="bg-[#f9fafb]/50">
            <tr>
              <th className="px-12 py-10 text-left text-2xl font-black text-gray-800">
                Project Name
              </th>
              <th className="px-12 py-10 text-left text-2xl font-black text-gray-800">
                Progress
              </th>
              <th className="px-12 py-10 text-left text-2xl font-black text-gray-800">
                Timeline
              </th>
              <th className="px-12 py-10 text-left text-2xl font-black text-gray-800">
                Budget
              </th>
              <th className="px-12 py-10 text-center text-2xl font-black text-gray-800">
                View
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-12 py-12 whitespace-nowrap text-xl font-bold text-gray-600">
                    {project.name}
                  </td>
                  <td className="px-12 py-12 whitespace-nowrap text-xl font-black text-gray-900">
                    <div className="flex items-center space-x-3">
                      <span className="min-w-[50px]">{project.progress}%</span>
                      <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-green-500 h-full rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-12 whitespace-nowrap text-xl font-black text-gray-900">
                    {project.startDate}
                  </td>
                  <td className="px-12 py-12 whitespace-nowrap text-xl font-black text-gray-900">
                    ${project.budget.toLocaleString()}
                  </td>
                  <td className="px-12 py-12 whitespace-nowrap text-center">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="px-12 py-3 bg-[#bbf7d0] text-[#166534] text-xl font-black rounded-[24px] hover:bg-[#86efac] transition-all shadow-sm active:scale-95"
                    >
                      view
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-12 py-32 text-center text-2xl font-bold text-gray-400"
                >
                  No projects found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedProject && (
        <div
          onClick={() => setSelectedProject(null)}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#111827]/60 backdrop-blur-md p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 relative cursor-default"
          >
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full transition-all"
            >
              <svg
                className="w-8 h-8 text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M6 18L18 6M6 6l18 18"
                />
              </svg>
            </button>
            <div className="p-12">
              <h3 className="text-4xl font-black text-gray-900 mb-2">
                {selectedProject.name}
              </h3>
              <p className="text-2xl font-bold text-gray-500 mb-10 max-w-3xl leading-relaxed">
                A comprehensive platform development involving inventory
                management, customer analytics, and high-performance secure gate
                integration.
              </p>

              <div className="flex items-center space-x-12 mb-10">
                <div className="flex items-center space-x-4 bg-gray-50 p-6 rounded-[24px] border border-gray-100">
                  <div className="bg-white p-3 rounded-xl text-amber-600 shadow-sm">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-900">
                      Timeline: {selectedProject.startDate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-8 mb-12">
                <StatPill
                  label="Progress"
                  value={`${selectedProject.progress}%`}
                />
                <StatPill label="Total CRs" value="12" icon="📄" />
                <StatPill label="Completed" value="9" icon="✔" />
                <StatPill label="Pending" value="3" icon="!" />
              </div>

              <div className="bg-[#e5e7eb]/50 p-2 rounded-[32px] flex mb-8">
                <button className="flex-1 py-5 text-2xl font-black rounded-[28px] bg-white shadow-xl text-gray-900">
                  Change Requests
                </button>
                <button className="flex-1 py-5 text-2xl font-black rounded-[28px] text-gray-400 hover:text-gray-600">
                  Documents
                </button>
              </div>

              <div className="border border-gray-200 rounded-[32px] overflow-hidden bg-white shadow-lg">
                <table className="w-full text-xl">
                  <thead className="bg-[#f9fafb] border-b border-gray-200">
                    <tr>
                      <th className="px-10 py-8 text-left font-black text-gray-800">
                        ID
                      </th>
                      <th className="px-10 py-8 text-left font-black text-gray-800">
                        Title
                      </th>
                      <th className="px-10 py-8 text-left font-black text-gray-800">
                        Date
                      </th>
                      <th className="px-10 py-8 text-left font-black text-gray-800">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <Row
                      id="CR-001"
                      title="Update Payment gateway"
                      date="Oct 2024"
                      status="completed"
                    />
                    <Row
                      id="CR-002"
                      title="Add product filters"
                      date="Nov 2025"
                      status="In progress"
                    />
                    <Row
                      id="CR-003"
                      title="Improve Checkout flow"
                      date="July 2025"
                      status="Approved"
                    />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatPill = ({ label, value, icon }) => (
  <div className="bg-[#f8fafc] rounded-[32px] p-8 text-center border-2 border-gray-100 shadow-lg transition-all hover:scale-105 hover:border-purple-200">
    <p className="text-xl font-bold text-gray-500 mb-2 uppercase tracking-widest">
      {label}
    </p>
    <div className="flex items-center justify-center space-x-3">
      {icon && <span className="text-2xl">{icon}</span>}
      <p className="text-4xl font-black text-[#111827]">{value}</p>
    </div>
  </div>
);

const Row = ({ id, title, date, status }) => (
  <tr className="hover:bg-gray-50/50">
    <td className="px-10 py-8 font-bold text-gray-500">{id}</td>
    <td className="px-10 py-8 font-black text-gray-900">{title}</td>
    <td className="px-10 py-8 font-black text-gray-900">{date}</td>
    <td className="px-10 py-8">
      <span
        className={`px-8 py-2 rounded-full text-lg font-black border-2 ${
          status === "completed"
            ? "bg-[#dcfce7] text-green-800 border-green-200"
            : status === "In progress"
              ? "bg-[#ffedd5] text-orange-800 border-orange-200"
              : "bg-[#f0f9ff] text-blue-800 border-blue-200"
        }`}
      >
        {status}
      </span>
    </td>
  </tr>
);

export default Projects;
