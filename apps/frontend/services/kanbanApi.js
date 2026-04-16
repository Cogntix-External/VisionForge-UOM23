import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const kanbanApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("crms_token") || localStorage.getItem("token");
};

const getStoredUser = () => {
  if (typeof window === "undefined") return null;

  try {
    const rawUser = localStorage.getItem("crms_user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (err) {
    console.error("Failed to read current user for kanban requests:", err);
    return null;
  }
};

const normalizeUserRole = (userRole) => {
  const normalizedRole = String(userRole || "").trim().toUpperCase();
  return normalizedRole === "CLIENT" || normalizedRole === "ROLE_CLIENT"
    ? "client"
    : "company";
};

const isFormDataPayload = (data) =>
  typeof FormData !== "undefined" && data instanceof FormData;

const buildDirectRequestHeaders = (endpoint) => {
  const headers = {};
  const token = getAuthToken();
  const user = getStoredUser();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (user?.id && endpoint.includes("/company/")) {
    headers["X-Company-Id"] = user.id;
  }

  if (user?.id && endpoint.includes("/client/")) {
    headers["X-Client-Id"] = user.id;
  }

  return headers;
};

const parseDirectResponse = async (response) => {
  if (!response.ok) {
    const error = new Error(`Request failed with status code ${response.status}`);
    error.response = {
      status: response.status,
      data: await response.text().catch(() => ""),
    };
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
};

const sendMultipartRequest = async (method, endpoint, data) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    body: data,
    credentials: "include",
    headers: buildDirectRequestHeaders(endpoint),
  });

  return parseDirectResponse(response);
};

kanbanApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  const user = getStoredUser();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (user?.id) {
    config.headers = config.headers || {};

    if (config.url?.includes("/company/")) {
      config.headers["X-Company-Id"] = user.id;
    }

    if (config.url?.includes("/client/")) {
      config.headers["X-Client-Id"] = user.id;
    }
  }

  return config;
});

// ==================== BOARD OPERATIONS ====================

export const createKanbanBoard = async (projectId, data, userRole) => {
  const isCompany = normalizeUserRole(userRole) === "company";

  const primary = isCompany
    ? `/company/projects/${projectId}/kanban/board`
    : `/client/projects/${projectId}/kanban/board`;

  const fallback = isCompany
    ? `/client/projects/${projectId}/kanban/board`
    : `/company/projects/${projectId}/kanban/board`;

  try {
    const response = await kanbanApi.post(primary, data);
    return response.data;
  } catch (err) {
    if (err?.response?.status === 404) {
      try {
        const response = await kanbanApi.post(fallback, data);
        return response.data;
      } catch (err2) {
        const status = err2?.response?.status;
        const msg = `Failed to create kanban board (tried ${primary} and ${fallback}) - status ${status}`;
        console.error(msg, err2?.response || err2);
        throw new Error(msg);
      }
    }

    throw err;
  }
};

export const getKanbanBoard = async (projectId, userRole) => {
  const endpoint =
    normalizeUserRole(userRole) === "company"
      ? `/company/projects/${projectId}/kanban`
      : `/client/projects/${projectId}/kanban`;

  try {
    const response = await kanbanApi.get(endpoint);
    return response.data;
  } catch (err) {
    if (err?.response?.status === 404) {
      return { tasksByStatus: [] };
    }
    throw err;
  }
};

// IMPORTANT: this export is required by KanbanBoardPage.jsx
export const getKanbanBoardWithTasks = async (projectId, userRole) => {
  return getKanbanBoard(projectId, userRole);
};

// ==================== TASK OPERATIONS ====================

export const createTask = async (projectId, boardId, data, userRole) => {
  if (!projectId) throw new Error("Project ID is missing");
  if (!boardId) throw new Error("Board ID is missing");

  const isCompany = normalizeUserRole(userRole) === "company";

  const primary = isCompany
    ? `/company/projects/${projectId}/kanban/tasks?boardId=${boardId}`
    : `/client/projects/${projectId}/kanban/tasks?boardId=${boardId}`;

  const fallback = isCompany
    ? `/client/projects/${projectId}/kanban/tasks?boardId=${boardId}`
    : `/company/projects/${projectId}/kanban/tasks?boardId=${boardId}`;

  try {
    if (isFormDataPayload(data)) {
      return await sendMultipartRequest("POST", primary, data);
    }

    const response = await kanbanApi.post(primary, data);
    return response.data;
  } catch (err) {
    if (err?.response?.status === 404) {
      if (isFormDataPayload(data)) {
        return await sendMultipartRequest("POST", fallback, data);
      }

      const response = await kanbanApi.post(fallback, data);
      return response.data;
    }
    throw err;
  }
};

export const uploadTaskAttachments = async (
  projectId,
  taskId,
  files,
  userRole = "company"
) => {
  if (!Array.isArray(files) || files.length === 0) return null;

  const endpoint =
    normalizeUserRole(userRole) === "company"
      ? `/company/projects/${projectId}/kanban/tasks/${taskId}/attachments`
      : `/client/projects/${projectId}/kanban/tasks/${taskId}/attachments`;

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  return sendMultipartRequest("POST", endpoint, formData);
};

export const getTasksByBoard = async (projectId, boardId, userRole) => {
  const endpoint =
    normalizeUserRole(userRole) === "company"
      ? `/company/projects/${projectId}/kanban/tasks?boardId=${boardId}`
      : `/client/projects/${projectId}/kanban/tasks?boardId=${boardId}`;

  const response = await kanbanApi.get(endpoint);
  return response.data;
};

export const getTasksByStatus = async (projectId, boardId, status, userRole) => {
  const endpoint =
    normalizeUserRole(userRole) === "company"
      ? `/company/projects/${projectId}/kanban/tasks/status/${status}?boardId=${boardId}`
      : `/client/projects/${projectId}/kanban/tasks/status/${status}?boardId=${boardId}`;

  const response = await kanbanApi.get(endpoint);
  return response.data;
};

export const getTask = async (projectId, taskId, userRole) => {
  const endpoint =
    normalizeUserRole(userRole) === "company"
      ? `/company/projects/${projectId}/kanban/tasks/${taskId}`
      : `/client/projects/${projectId}/kanban/tasks/${taskId}`;

  const response = await kanbanApi.get(endpoint);
  return response.data;
};

export const updateTaskStatus = async (projectId, taskId, data, userRole = "company") => {
  const endpoint =
    normalizeUserRole(userRole) === "company"
      ? `/company/projects/${projectId}/kanban/tasks/${taskId}/status`
      : `/client/projects/${projectId}/kanban/tasks/${taskId}/status`;

  const response = await kanbanApi.put(endpoint, data);
  return response.data;
};

export const updateTask = async (projectId, taskId, data, userRole = "company") => {
  const endpoint =
    normalizeUserRole(userRole) === "company"
      ? `/company/projects/${projectId}/kanban/tasks/${taskId}`
      : `/client/projects/${projectId}/kanban/tasks/${taskId}`;

  if (isFormDataPayload(data)) {
    return sendMultipartRequest("PUT", endpoint, data);
  }

  const response = await kanbanApi.put(endpoint, data);
  return response.data;
};

export const assignTask = async (projectId, taskId, userId, userRole = "company") => {
  const endpoint =
    normalizeUserRole(userRole) === "company"
      ? `/company/projects/${projectId}/kanban/tasks/${taskId}/assign?userId=${userId}`
      : `/client/projects/${projectId}/kanban/tasks/${taskId}/assign?userId=${userId}`;

  const response = await kanbanApi.put(endpoint);
  return response.data;
};

export const addTaskComment = async (projectId, taskId, comment, userRole = "company") => {
  const endpoint =
    normalizeUserRole(userRole) === "company"
      ? `/company/projects/${projectId}/kanban/tasks/${taskId}/comments?comment=${encodeURIComponent(comment)}`
      : `/client/projects/${projectId}/kanban/tasks/${taskId}/comments?comment=${encodeURIComponent(comment)}`;

  const response = await kanbanApi.post(endpoint);
  return response.data;
};

export const deleteTask = async (projectId, taskId, userRole = "company") => {
  const endpoint =
    normalizeUserRole(userRole) === "company"
      ? `/company/projects/${projectId}/kanban/tasks/${taskId}`
      : `/client/projects/${projectId}/kanban/tasks/${taskId}`;

  const response = await kanbanApi.delete(endpoint);
  return response.data;
};

export const getKanbanStatistics = async (projectId, userRole = "company") => {
  const endpoint =
    normalizeUserRole(userRole) === "company"
      ? `/company/projects/${projectId}/kanban/statistics`
      : `/client/projects/${projectId}/kanban/statistics`;

  const response = await kanbanApi.get(endpoint);
  return response.data;
};

export const getMyTasks = async (userRole = "company") => {
  const endpoint =
    normalizeUserRole(userRole) === "company"
      ? "/company/kanban/my-tasks"
      : "/client/kanban/my-tasks";

  const response = await kanbanApi.get(endpoint);
  return response.data;
};

export default kanbanApi;
