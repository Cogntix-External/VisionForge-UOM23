import { getUser, normalizeRole } from "@/utils/auth";

const PROJECTS_STORAGE_KEY = "crms_projects";

// No seed/mock projects — data should come from backend
const seedProjects = [];

export const projects = [];

function isBrowser() {
  return typeof window !== "undefined";
}

function cloneProject(project) {
  return {
    ...project,
    accessRoles: Array.isArray(project.accessRoles)
      ? [...project.accessRoles]
      : undefined,
  };
}

function syncProjects(nextProjects) {
  projects.splice(0, projects.length, ...nextProjects.map(cloneProject));
  return projects;
}

function getStoredProjects() {
  if (!isBrowser()) {
    return syncProjects(seedProjects);
  }

  const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);

  if (!raw) {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([]));
    return syncProjects([]);
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid projects payload");
    }

    return syncProjects(parsed);
  } catch {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(seedProjects));
    return syncProjects(seedProjects);
  }
}

function persistProjects(nextProjects) {
  const synced = syncProjects(nextProjects);

  if (isBrowser()) {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(synced));
  }

  return synced;
}

function normalizeProjectInput(project) {
  return {
    pid: String(project.pid || "").trim(),
    name: String(project.name || "").trim(),
    description: String(project.description || "").trim(),
    status: project.status || "active",
    accessRoles: Array.isArray(project.accessRoles) && project.accessRoles.length
      ? project.accessRoles.map((role) => normalizeRole(role))
      : ["COMPANY", "CLIENT"],
  };
}

export function getProjects() {
  return getStoredProjects().map(cloneProject);
}

export function createProject(project) {
  const normalized = normalizeProjectInput(project || {});

  if (!normalized.pid) {
    throw new Error("Project ID is required.");
  }

  if (!normalized.name) {
    throw new Error("Project name is required.");
  }

  const existingProjects = getStoredProjects();
  const duplicate = existingProjects.some(
    (item) => item.pid.toLowerCase() === normalized.pid.toLowerCase()
  );

  if (duplicate) {
    throw new Error("A project with this ID already exists.");
  }

  persistProjects([...existingProjects, normalized]);

  return cloneProject(normalized);
}

export function deleteProject(pid) {
  const normalizedPid = String(pid || "").trim().toLowerCase();
  const existingProjects = getStoredProjects();
  const nextProjects = existingProjects.filter(
    (project) => project.pid.toLowerCase() !== normalizedPid
  );

  persistProjects(nextProjects);
}

export function canViewProject(project, role) {
  const normalizedRole = normalizeRole(role);
  const accessRoles = Array.isArray(project?.accessRoles)
    ? project.accessRoles.map((item) => normalizeRole(item))
    : [];

  if (!normalizedRole) return true;
  if (accessRoles.length === 0) return true;

  return accessRoles.includes(normalizedRole);
}

export function canDeleteProject(role) {
  return normalizeRole(role) === "COMPANY";
}

function getCurrentUser() {
  const storedUser = getUser();
  const role = normalizeRole(storedUser?.role) || "COMPANY";

  return {
    name: storedUser?.name || "Current User",
    role,
  };
}

export const currentUser = getCurrentUser();
