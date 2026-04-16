"use client";

import React from "react";
import { FolderKanban, CalendarDays, Briefcase, ArrowRight } from "lucide-react";

const projects = [
  {
    id: 1,
    pid: "CRMS-001",
    name: "CRMS Company Portal",
    status: "In Progress",
    dueDate: "2026-04-15",
    role: "Project Manager",
  },
  {
    id: 2,
    pid: "CRMS-002",
    name: "Client Requirement Tracker",
    status: "Completed",
    dueDate: "2026-03-28",
    role: "Project Manager",
  },
  {
    id: 3,
    pid: "CRMS-003",
    name: "Kanban Workflow Module",
    status: "Pending",
    dueDate: "2026-04-30",
    role: "Project Manager",
  },
  {
    id: 4,
    pid: "CRMS-004",
    name: "Notification Management System",
    status: "In Progress",
    dueDate: "2026-05-10",
    role: "Project Manager",
  },
];

const getStatusStyle = (status) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-700";
    case "In Progress":
      return "bg-blue-100 text-blue-700";
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const ProjectsNuhaPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-500">Company Portal / Projects</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-800">Projects</h1>
        <p className="mt-2 text-slate-600">
          View all assigned projects and open each project to see related tasks.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total Projects</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">{projects.length}</h2>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">In Progress</p>
          <h2 className="mt-2 text-2xl font-bold text-blue-700">
            {projects.filter((p) => p.status === "In Progress").length}
          </h2>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Completed</p>
          <h2 className="mt-2 text-2xl font-bold text-green-700">
            {projects.filter((p) => p.status === "Completed").length}
          </h2>
        </div>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-3">
                  <FolderKanban className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {project.pid}
                  </p>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {project.name}
                  </h2>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                  project.status
                )}`}
              >
                {project.status}
              </span>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-slate-400" />
                <span>{project.role}</span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                <span>Due Date: {project.dueDate}</span>
              </div>
            </div>

            <div className="mt-5">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 font-medium text-blue-700 transition hover:bg-blue-100">
                View Tasks
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsNuhaPage;