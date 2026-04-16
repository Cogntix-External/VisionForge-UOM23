"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import Layout from "./Layout";
import {
  canViewProject,
  canDeleteProject,
  createProject,
  currentUser,
  deleteProject,
  getProjects,
} from "@/lib/projects";

import { getCompanyProjects, getClientProjects } from "@/services/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("crms_token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("token")
    );
  }
  return null;
};

const KanbanOverviewPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({
    pid: "",
    name: "",
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Use shared API helpers that set required headers (X-Company-Id / auth)
        let data = [];
        if (currentUser.role === "COMPANY" || currentUser.role === "company") {
          data = await getCompanyProjects();
        } else if (currentUser.role === "CLIENT" || currentUser.role === "client") {
          data = await getClientProjects();
        } else {
          // fallback to company projects
          data = await getCompanyProjects();
        }
        
        // Transform backend response to frontend format
        const transformedProjects = Array.isArray(data)
          ? data.map((proj) => ({
              pid: proj.id,
              name: proj.name,
              description: proj.description,
              proposalId: proj.proposalId,
              clientId: proj.clientId,
              clientName: proj.clientName,
              companyId: proj.companyId,
              status: proj.status,
              accessRoles: [currentUser.role],
              isCustom: false,
              createdAt: proj.createdAt,
              updatedAt: proj.updatedAt,
            }))
          : [];

        // Merge backend projects with locally created projects (from localStorage)
        const local = getProjects();
        const backendPidSet = new Set(transformedProjects.map((p) => String(p.pid).toLowerCase()));
        const merged = [
          ...transformedProjects,
          ...local.filter((p) => !backendPidSet.has(String(p.pid).toLowerCase())),
        ];

        setProjects(merged);
        setError(null);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects");
        // Do not fall back to mock data — show empty list when backend unavailable
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const roleBasedProjects = projects.filter((project) =>
      canViewProject(project, currentUser.role)
    );

    const term = searchTerm.trim().toLowerCase();
    if (!term) return roleBasedProjects;

    const termNoSpace = term.replace(/\s+/g, "");

    return roleBasedProjects.filter((project) => {
      const projectId = (project.pid || "").toLowerCase();
      const projectIdNoSpace = projectId.replace(/\s+/g, "");
      const name = (project.name || "").toLowerCase();
      const desc = (project.description || "").toLowerCase();

      return (
        projectId.includes(term) ||
        projectIdNoSpace.includes(termNoSpace) ||
        name.includes(term) ||
        desc.includes(term)
      );
    });
  }, [projects, searchTerm]);

  const handleView = (project) => {
    router.push(`/company/KanbanBoardPage/${encodeURIComponent(project.pid)}`);
  };

  const handleDelete = (project) => {
    if (!canDeleteProject(currentUser.role)) return;

    const shouldDelete = window.confirm(
      `Delete the board "${project.name}" (${project.pid})?`
    );
    if (!shouldDelete) return;

    deleteProject(project.pid);
    const updatedProjects = getProjects();

    setProjects(updatedProjects);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateError("");
    setFormData({
      pid: "",
      name: "",
    });
  };

  const handleCreateBoard = () => {
    try {
      const newProject = createProject({
        pid: formData.pid,
        name: formData.name,
        accessRoles: [currentUser.role],
      });

      if (!newProject) return;

      const updatedProjects = getProjects();
      setProjects(updatedProjects);
      closeCreateModal();
      router.push(
        `/company/KanbanBoardPage/${encodeURIComponent(newProject.pid)}`
      );
    } catch (error) {
      setCreateError(error.message || "Unable to create the Kanban board.");
    }
  };

  const isCreateDisabled =
    !formData.pid.trim() || !formData.name.trim();

  return (
    <Layout title="Kanban Board Overview">
      <div className="mx-auto max-w-6xl">
        {/* Search */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              className="h-10 w-full rounded-xl border border-[#94a3b8] bg-white pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#2563eb] focus:ring-2 focus:ring-[rgba(37,99,235,0.15)]"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-md bg-[#2563eb] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8]"
          >
            <Plus className="h-4 w-4" />
            Create
          </button>
        </div>

        {/* Table Card */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <p className="text-base font-semibold text-slate-700">Loading projects...</p>
              <p className="mt-1 text-sm text-slate-500">Please wait while we fetch your projects.</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <p className="text-base font-semibold text-red-700">{error}</p>
              <p className="mt-1 text-sm text-red-500">Failed to load projects. Showing cached projects if available.</p>
            </div>
          ) : (
            <div className="max-h-[520px] overflow-auto">
              <table className="min-w-full table-fixed">
                <colgroup>
                  <col className="w-[130px]" />
                  <col />
                  <col className="w-[150px]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50">
                    <th className="border-r border-slate-200 px-5 py-3 text-left text-sm font-medium text-slate-700">
                      Project ID
                    </th>
                    <th className="border-r border-slate-200 px-5 py-3 text-left text-sm font-medium text-slate-700">
                      Project
                    </th>
                    <th className="px-5 py-3 text-center text-sm font-medium text-slate-700">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProjects.map((project) => (
                    <tr
                      key={project.pid}
                      className="border-b border-slate-200 transition-colors hover:bg-slate-50"
                    >
                      <td className="border-r border-slate-200 px-5 py-4 text-sm font-normal text-slate-700">
                        {project.pid}
                      </td>

                      <td className="border-r border-slate-200 px-5 py-4">
                        <div className="min-w-0">
                          <p className="break-words text-base font-normal text-slate-900">
                            {project.name}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleView(project)}
                            className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-all hover:bg-blue-100"
                          >
                            View
                          </button>
                          {canDeleteProject(currentUser.role) && (
                            <button
                              onClick={() => handleDelete(project)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700 transition-all hover:bg-red-100"
                              title="Delete board"
                              aria-label={`Delete ${project.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProjects.length === 0 && (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="mb-3 rounded-full bg-[var(--surface-muted)] p-3">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-base font-semibold text-slate-700">
                    No projects found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try searching with another project ID or name.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
        </div>

        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-950/35"
              onClick={closeCreateModal}
            />

            <div className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
              <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Create Kanban Board
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-700"
                  aria-label="Close create board modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5 px-6 py-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Project ID
                  </label>
                  <input
                    type="text"
                    value={formData.pid}
                    onChange={(e) => {
                      setCreateError("");
                      setFormData((prev) => ({
                        ...prev,
                        pid: e.target.value,
                      }));
                    }}
                    placeholder="e.g. 009 J"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setCreateError("");
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                    }}
                    placeholder="Name your board"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                {createError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {createError}
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateBoard}
                  disabled={isCreateDisabled}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-100 disabled:shadow-none"
                >
                  <Plus className="h-4 w-4" />
                  Create Board
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default KanbanOverviewPage;
