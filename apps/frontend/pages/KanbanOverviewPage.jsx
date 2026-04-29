"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, X, Trash2, Eye } from "lucide-react";
import Layout from "./Layout";
import { projects as seedProjects } from "@/lib/projects";
import { getUser, normalizeRole } from "@/utils/auth";
import {
  getAssignedKanbanProjects,
  getCompanyProjects,
  getClientProjects,
} from "@/services/api";

const normalizeProjectKey = (project) =>
  String(project?.pid || project?.id || "").trim().toLowerCase();

const shortId = (value) => {
  const text = String(value || "").trim();
  if (!text) return "-";
  return text.length > 4 ? `${text.slice(0, 4)}...` : text;
};

const dedupeProjects = (items) => {
  const seen = new Set();

  return (Array.isArray(items) ? items : []).filter((project) => {
    const key = normalizeProjectKey(project);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getStoredProjects = () => {
  if (typeof window === "undefined") return seedProjects;

  try {
    return JSON.parse(localStorage.getItem("kanban_projects") || "[]");
  } catch {
    return [];
  }
};

const saveStoredProjects = (projects) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("kanban_projects", JSON.stringify(projects));
};

const KANBAN_BOARD_META_KEY = "kanban_board_meta";

const getStoredBoardMeta = () => {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(localStorage.getItem(KANBAN_BOARD_META_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveStoredBoardMeta = (meta) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KANBAN_BOARD_META_KEY, JSON.stringify(meta || {}));
};

const canViewProject = () => true;

const canDeleteProject = (role) =>
  ["ADMIN", "MANAGER", "COMPANY"].includes(String(role || "").toUpperCase());

const createProject = (data) => {
  const pid = String(data?.pid || "").trim();
  const name = String(data?.name || "").trim();

  if (!pid || !name) {
    throw new Error("Project ID and name are required");
  }

  const timestamp = new Date().toISOString();

  const project = {
    pid,
    name,
    description: data?.description || "",
    accessRoles: data?.accessRoles || [],
    isCustom: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  saveStoredProjects(dedupeProjects([...getStoredProjects(), project]));
  saveStoredBoardMeta({
    ...getStoredBoardMeta(),
    [pid.toLowerCase()]: {
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  });
  return project;
};

const deleteProject = (pid) => {
  const key = String(pid || "").trim().toLowerCase();

  saveStoredProjects(
    getStoredProjects().filter(
      (project) => String(project?.pid || "").trim().toLowerCase() !== key
    )
  );

  const meta = getStoredBoardMeta();
  if (meta[key]) {
    delete meta[key];
    saveStoredBoardMeta(meta);
  }
};

const getLocalKanbanProjects = () =>
  getStoredProjects().filter((project) => Boolean(project?.isCustom));

const getSavedBoardColumns = (projectId) => {
  if (typeof window === "undefined") return [];

  try {
    const storageKey = `kanban_columns_${projectId || "default"}`;
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const resolveProjectBoardStatus = (project) => {
  const currentStatus = String(project?.status || "").trim().toUpperCase();

  if (currentStatus === "DONE" || currentStatus === "COMPLETED") {
    return "COMPLETED";
  }

  const savedColumns = getSavedBoardColumns(project?.pid);
  if (!savedColumns.length) {
    return currentStatus || "ACTIVE";
  }

  const totalCards = savedColumns.reduce(
    (sum, column) =>
      sum + (Array.isArray(column?.cards) ? column.cards.length : 0),
    0
  );

  if (totalCards === 0) {
    return currentStatus || "ACTIVE";
  }

  const hasPendingCards = savedColumns.some((column) => {
    const columnId = String(column?.id || "").trim().toLowerCase();
    const cardCount = Array.isArray(column?.cards) ? column.cards.length : 0;
    return columnId !== "done" && cardCount > 0;
  });

  return hasPendingCards ? "ACTIVE" : "COMPLETED";
};

const resolveProjectUpdatedAt = (project) => {
  const projectId = String(project?.pid || project?.id || "")
    .trim()
    .toLowerCase();
  const meta = getStoredBoardMeta();
  const storedMeta = meta?.[projectId];

  return (
    storedMeta?.updatedAt ||
    storedMeta?.createdAt ||
    project?.updatedAt ||
    project?.createdAt ||
    ""
  );
};

const backfillMissingBoardDates = (projects) => {
  const list = Array.isArray(projects) ? projects : [];
  const currentMeta = getStoredBoardMeta();
  const nextMeta = { ...currentMeta };
  let hasChanges = false;

  list.forEach((project) => {
    const projectId = String(project?.pid || project?.id || "")
      .trim()
      .toLowerCase();

    if (!projectId) return;

    const existingMeta = nextMeta[projectId];
    const hasDate =
      existingMeta?.updatedAt ||
      existingMeta?.createdAt ||
      project?.updatedAt ||
      project?.createdAt;

    if (hasDate) return;

    const fallbackTimestamp = new Date().toISOString();
    nextMeta[projectId] = {
      createdAt: fallbackTimestamp,
      updatedAt: fallbackTimestamp,
    };
    hasChanges = true;
  });

  if (hasChanges) {
    saveStoredBoardMeta(nextMeta);
  }
};

export default function KanbanOverviewPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({
    pid: "",
    name: "",
  });

  const sessionUser = useMemo(() => {
    const storedUser = getUser();

    return {
      role: normalizeRole(storedUser?.role) || "COMPANY",
    };
  }, []);

  const userRole = sessionUser.role;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        let data = [];

        if (userRole === "COMPANY") {
          data = await getCompanyProjects();
        } else if (userRole === "CLIENT") {
          data = await getClientProjects();
        } else {
          data = await getCompanyProjects();
        }

        const assignedKanbanProjects = await getAssignedKanbanProjects();

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
              accessRoles: [userRole],
              isCustom: false,
              createdAt: proj.createdAt,
              updatedAt: proj.updatedAt,
            }))
          : [];

        const transformedAssignedProjects = Array.isArray(
          assignedKanbanProjects
        )
          ? assignedKanbanProjects.map((project) => ({
              pid: project.id || project.pid,
              name: project.name || "Assigned Kanban Board",
              description: project.description || "",
              accessRoles: [userRole],
              isCustom: false,
              isAssignedKanban: true,
            }))
          : [];

        const local = getLocalKanbanProjects();

        const remoteProjects = dedupeProjects([
          ...transformedProjects,
          ...transformedAssignedProjects,
        ]);

        const backendPidSet = new Set(
          remoteProjects.map((project) => normalizeProjectKey(project))
        );

        const merged = dedupeProjects([
          ...remoteProjects,
          ...local.filter(
            (project) => !backendPidSet.has(normalizeProjectKey(project))
          ),
        ]);

        backfillMissingBoardDates(merged);
        setProjects(merged);
      } catch (err) {
        console.error("Error fetching projects:", err);
        const localProjects = getLocalKanbanProjects();
        backfillMissingBoardDates(localProjects);
        setProjects(localProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userRole]);

  const filteredProjects = useMemo(() => {
    const roleBasedProjects = projects.filter((project) =>
      canViewProject(project, userRole)
    );

    const term = searchTerm.trim().toLowerCase();

    if (!term) return roleBasedProjects;

    const termNoSpace = term.replace(/\s+/g, "");

    return roleBasedProjects.filter((project) => {
      const projectId = String(project.pid || "").toLowerCase();
      const projectIdNoSpace = projectId.replace(/\s+/g, "");
      const name = String(project.name || "").toLowerCase();

      return (
        projectId.includes(term) ||
        projectIdNoSpace.includes(termNoSpace) ||
        name.includes(term)
      );
    });
  }, [projects, searchTerm, userRole]);

  const handleView = (project) => {
    router.push(`/company/KanbanBoardPage/${encodeURIComponent(project.pid)}`);
  };

  const handleDelete = (project) => {
    if (!canDeleteProject(userRole)) return;

    const shouldDelete = window.confirm(
      `Delete the board "${project.name}" (${project.pid})?`
    );

    if (!shouldDelete) return;

    deleteProject(project.pid);

    setProjects((prev) =>
      prev.filter(
        (item) => normalizeProjectKey(item) !== normalizeProjectKey(project)
      )
    );
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
        accessRoles: [userRole],
      });

      setProjects((prev) =>
        dedupeProjects([...prev, newProject]).sort((a, b) =>
          String(a?.name || "").localeCompare(String(b?.name || ""))
        )
      );

      closeCreateModal();

      router.push(
        `/company/KanbanBoardPage/${encodeURIComponent(newProject.pid)}`
      );
    } catch (error) {
      setCreateError(error.message || "Unable to create the Kanban board.");
    }
  };

  const isCreateDisabled = !formData.pid.trim() || !formData.name.trim();

  return (
    <Layout>
      <div className="mx-auto flex h-[calc(100vh-12rem)] max-w-7xl flex-col gap-4 overflow-hidden px-4 py-3">
        <div className="rounded-[24px] border border-white bg-white/95 p-4 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by project ID or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-600 md:shrink-0"
            >
              <Plus className="h-4 w-4" />
              Create Board
            </button>
          </div>
        </div>

        {loading ? (
          <StateCard
            title="Loading projects..."
            message="Please wait while we fetch your Kanban boards."
          />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-white bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
            <div className="flex flex-col gap-1 border-b border-slate-100 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-950">
                  Project Boards
                </h3>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-[980px]">
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr>
                    <TableHead>Project ID</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead center>Action</TableHead>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                      <tr
                        key={project.pid}
                        className="transition hover:bg-indigo-50/40"
                      >
                        <td
                          className="px-6 py-4 text-sm font-black text-slate-900"
                          title={project.pid}
                        >
                          {project.pid || "-"}
                        </td>

                        <td className="px-6 py-4">
                          <p
                            className="max-w-[240px] truncate text-sm font-black text-slate-950"
                            title={project.name || "Untitled Board"}
                          >
                            {project.name || "Untitled Board"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={resolveProjectBoardStatus(project)} />
                        </td>

                        <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                          {formatDate(resolveProjectUpdatedAt(project))}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleView(project)}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-violet-600 hover:shadow-[0_10px_30px_rgba(99,102,241,0.45)]"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </button>

                            {canDeleteProject(userRole) && project.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDelete(project)}
                                className="rounded-xl bg-rose-50 p-2.5 text-rose-600 transition hover:bg-rose-100"
                                title="Delete board"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-8 py-12 text-center text-sm font-black text-slate-400"
                      >
                        No boards found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              onClick={closeCreateModal}
            />

            <div className="relative w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50 px-6 py-5">
                <div>
                  <h3 className="text-xl font-black text-slate-950">
                    Create Kanban Board
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Enter project details to create a new workflow board.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5 px-6 py-6">
                <InputField
                  label="Project ID"
                  value={formData.pid}
                  placeholder="e.g. 009 J"
                  onChange={(value) => {
                    setCreateError("");
                    setFormData((prev) => ({ ...prev, pid: value }));
                  }}
                />

                <InputField
                  label="Project Name"
                  value={formData.name}
                  placeholder="Name your board"
                  onChange={(value) => {
                    setCreateError("");
                    setFormData((prev) => ({ ...prev, name: value }));
                  }}
                />

                {createError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                    {createError}
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCreateBoard}
                  disabled={isCreateDisabled}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-100"
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
}

function TableHead({ children, center = false }) {
  return (
    <th
      className={`px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400 ${
        center ? "text-center" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function StatusBadge({ status }) {
  const value = String(status || "ACTIVE").toUpperCase();

  return (
    <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-black uppercase text-indigo-700">
      {value}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString();
}

function StateCard({ title, message }) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-[28px] border border-white bg-white/95 p-12 text-center shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
      <div>
        <p className="text-lg font-black text-slate-800">{title}</p>
        <p className="mt-2 text-sm font-medium text-slate-500">{message}</p>
      </div>
    </div>
  );
}

function InputField({ label, value, placeholder, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
      />
    </div>
  );
}
