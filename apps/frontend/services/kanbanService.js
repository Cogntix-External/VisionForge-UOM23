// ─────────────────────────────────────────────────────────
// kanbanService.js  —  Kanban Board & Task API calls
// ─────────────────────────────────────────────────────────

import {
  API_BASE,
  request,
  getCompanyId,
  getAuthToken,
} from "./http.js";

import { getClientProjects, getCompanyProjects } from "./projectService.js";

// ── Internal Kanban Helpers ───────────────────────────────

function normalizeKanbanUserRole(userRole) {
  const normalizedRole = String(userRole || "").trim().toUpperCase();
  return normalizedRole === "CLIENT" || normalizedRole === "ROLE_CLIENT"
    ? "client"
    : "company";
}

function buildKanbanRequestHeaders(endpoint) {
  const headers = {};
  const token = getAuthToken();
  const companyId = getCompanyId();

  if (token) headers.Authorization = `Bearer ${token}`;
  if (companyId && endpoint.includes("/company/"))
    headers["X-Company-Id"] = companyId;

  return headers;
}

async function parseKanbanResponse(response) {
  if (!response.ok) {
    const error = new Error(
      `Request failed with status code ${response.status}`
    );
    error.response = {
      status: response.status,
      data: await response.text().catch(() => ""),
    };
    throw error;
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json")
    ? response.json()
    : response.text();
}

async function sendKanbanRequest(method, endpoint, data) {
  const headers = buildKanbanRequestHeaders(endpoint);
  const options = { method, credentials: "include", headers };

  if (data !== undefined) {
    options.body = JSON.stringify(data);
    options.headers = { ...headers, "Content-Type": "application/json" };
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  return parseKanbanResponse(response);
}

async function sendKanbanMultipartRequest(method, endpoint, formData) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    body: formData,
    credentials: "include",
    headers: buildKanbanRequestHeaders(endpoint),
  });
  return parseKanbanResponse(response);
}

function normalizeTaskStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  if (normalized === "INPROGRESS") return "IN_PROGRESS";
  if (normalized === "REVIEW") return "IN_REVIEW";
  if (normalized === "COMPLETE" || normalized === "COMPLETED") return "DONE";
  if (
    normalized === "TODO" ||
    normalized === "IN_PROGRESS" ||
    normalized === "IN_REVIEW" ||
    normalized === "DONE"
  )
    return normalized;
  return "TODO";
}

function projectIdMatches(project, projectId) {
  const normalizedProjectId = String(projectId || "").trim();
  const candidateId = String(project?.id || project?.pid || "").trim();
  return Boolean(normalizedProjectId) && candidateId === normalizedProjectId;
}

// ── Kanban Exports ────────────────────────────────────────

export async function getCompanyUsers(companyId) {
  const resolvedCompanyId = getCompanyId(companyId);
  const endpoint = "/company/kanban/assignees";

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "GET",
    credentials: "include",
    headers: {
      ...buildKanbanRequestHeaders(endpoint),
      ...(resolvedCompanyId ? { "X-Company-Id": resolvedCompanyId } : {}),
    },
  });

  if (response.status === 404 || !response.ok) return [];
  return (await parseKanbanResponse(response)) || [];
}

export async function getAssignedKanbanProjects() {
  try {
    return await sendKanbanRequest("GET", "/company/kanban/assigned-projects");
  } catch {
    return [];
  }
}

export async function getKanbanProjectById(projectId, userRole) {
  if (!projectId) throw new Error("Project ID is required");

  const role = normalizeKanbanUserRole(userRole);
  const loaders =
    role === "client"
      ? [() => getClientProjects(), () => getAssignedKanbanProjects()]
      : [() => getCompanyProjects(), () => getAssignedKanbanProjects()];

  for (const loadProjects of loaders) {
    try {
      const projects = await loadProjects();
      const matched = Array.isArray(projects)
        ? projects.find((p) => projectIdMatches(p, projectId))
        : null;
      if (matched) return matched;
    } catch {
      // Best-effort lookup
    }
  }

  return null;
}

export function getClientProjectKanban(projectId) {
  return request(`/client/projects/${projectId}/kanban`, { method: "GET" });
}

export async function createKanbanBoard(projectId, data) {
  try {
    return await sendKanbanRequest(
      "POST",
      `/company/kanban/${projectId}/board`,
      data
    );
  } catch (error) {
    if (error?.response?.status === 404) return getKanbanBoard(projectId);
    throw error;
  }
}

export async function getKanbanBoard(projectId) {
  try {
    return await sendKanbanRequest("GET", `/company/kanban/${projectId}`);
  } catch (error) {
    if (error?.response?.status === 404) return { tasksByStatus: [] };
    throw error;
  }
}

export async function getTasksByBoard(projectId) {
  try {
    return await sendKanbanRequest("GET", `/company/kanban/${projectId}/tasks`);
  } catch (error) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
}

export async function getKanbanBoardWithTasks(projectId) {
  const [board, tasks] = await Promise.all([
    getKanbanBoard(projectId),
    getTasksByBoard(projectId),
  ]);

  const groupedTasks = { TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] };

  (Array.isArray(tasks) ? tasks : []).forEach((task) => {
    const normalizedStatus = normalizeTaskStatus(task?.status);
    groupedTasks[normalizedStatus].push({ ...task, status: normalizedStatus });
  });

  return {
    ...(board || {}),
    name: board?.name || board?.title || "Kanban Board",
    tasksByStatus: Object.entries(groupedTasks).map(([status, taskList]) => ({
      status,
      tasks: taskList,
    })),
  };
}

export async function createTask(projectId, boardId, data) {
  if (!projectId) throw new Error("Project ID is missing");
  return sendKanbanRequest("POST", `/company/kanban/${projectId}/tasks`, data);
}

export async function updateTask(projectId, taskId, data) {
  if (!projectId) throw new Error("Project ID is missing");
  if (!taskId) throw new Error("Task ID is missing");
  return sendKanbanRequest(
    "PUT",
    `/company/kanban/${projectId}/tasks/${taskId}`,
    data
  );
}

export async function updateTaskStatus(projectId, taskId, data) {
  if (!taskId) throw new Error("Task ID is missing");
  return sendKanbanRequest("PUT", `/company/kanban/tasks/${taskId}/status`, data);
}

export async function deleteTask(projectId, taskId) {
  if (!projectId) throw new Error("Project ID is missing");
  if (!taskId) throw new Error("Task ID is missing");
  return sendKanbanRequest(
    "DELETE",
    `/company/kanban/${projectId}/tasks/${taskId}`
  );
}

export async function addTaskComment(projectId, taskId, comment) {
  if (!projectId) throw new Error("Project ID is missing");
  if (!taskId) throw new Error("Task ID is missing");
  return sendKanbanRequest(
    "POST",
    `/company/kanban/${projectId}/tasks/${taskId}/comments?comment=${encodeURIComponent(comment)}`
  );
}

export async function uploadTaskAttachments(projectId, taskId, files) {
  if (!Array.isArray(files) || files.length === 0) return null;
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return sendKanbanMultipartRequest(
    "POST",
    `/company/kanban/${projectId}/tasks/${taskId}/attachments`,
    formData
  );
}

export async function downloadTaskAttachment(
  projectId,
  taskId,
  attachmentId,
  fileName
) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("crms_token") : null;
  const companyId = getCompanyId();

  const downloadUrl = `${API_BASE}/company/kanban/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}/attachments/${encodeURIComponent(attachmentId)}`;

  const response = await fetch(downloadUrl, {
    method: "GET",
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(companyId ? { "X-Company-Id": companyId } : {}),
    },
  });

  if (!response.ok) {
    if (response.status === 404) return false;
    throw new Error(`Request failed with status code ${response.status}`);
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition") || "";
  const matchedFileName = contentDisposition.match(
    /filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i
  );
  const resolvedFileName =
    fileName ||
    (matchedFileName?.[1] ? decodeURIComponent(matchedFileName[1]) : "") ||
    "attachment";

  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = resolvedFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
  return true;
}
