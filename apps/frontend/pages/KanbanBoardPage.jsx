"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import {
  Calendar,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Plus,
  X,
  Send,
  Trash2,
  Pencil,
  ArrowRightLeft,
} from "lucide-react";
import Layout from "./Layout";
import AddCardModal from "./AddCardModal";
import { projects as allProjects } from "@/lib/projects";
import { getUser, normalizeRole } from "@/utils/auth";
import {
  addTaskComment,
  createKanbanBoard,
  createTask,
  deleteTask,
  downloadTaskAttachment,
  getCompanyUsers,
  getKanbanBoardWithTasks,
  getKanbanProjectById,
  uploadTaskAttachments,
  updateTask,
  updateTaskStatus,
} from "@/services/api";

const createEmptyColumns = () => [
  { id: "todo", title: "To Do", count: 0, cards: [] },
  { id: "inprogress", title: "In Progress", count: 0, cards: [] },
  { id: "review", title: "Review", count: 0, cards: [] },
  { id: "done", title: "Done", count: 0, cards: [] },
];

const columnToStatusMap = {
  todo: "TODO",
  inprogress: "IN_PROGRESS",
  review: "IN_REVIEW",
  done: "DONE",
};

const resolveTaskStatus = (statusColumnId, currentStatus) => {
  if (statusColumnId && columnToStatusMap[statusColumnId]) {
    return columnToStatusMap[statusColumnId];
  }

  const normalizedCurrentStatus = String(currentStatus || "")
    .trim()
    .toLowerCase();

  if (columnToStatusMap[normalizedCurrentStatus]) {
    return columnToStatusMap[normalizedCurrentStatus];
  }

  const upperStatus = String(currentStatus || "").trim().toUpperCase();
  if (Object.values(columnToStatusMap).includes(upperStatus)) {
    return upperStatus;
  }

  return "TODO";
};

const sanitizeStoredColumns = (storedColumns) => {
  if (!Array.isArray(storedColumns)) return null;

  return storedColumns.map((column) => ({
    ...column,
    cards: Array.isArray(column?.cards) ? column.cards : [],
    count: Array.isArray(column?.cards) ? column.cards.length : 0,
  }));
};

const getSavedColumns = (storageKey) => {
  if (typeof window === "undefined") return null;

  try {
    const savedColumns = localStorage.getItem(storageKey);
    if (!savedColumns) return null;
    return sanitizeStoredColumns(JSON.parse(savedColumns));
  } catch (err) {
    console.error("Error reading saved kanban board:", err);
    return null;
  }
};

const getDeletedTaskIds = (storageKey) => {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (err) {
    console.error("Error reading deleted kanban tasks:", err);
    return [];
  }
};

const saveDeletedTaskIds = (storageKey, ids) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey, JSON.stringify(ids));
};

const formatDate = (dateStr) => {
  if (!dateStr) {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const getTagColorByPriority = (priority) => {
  if (priority === "HIGH" || priority === "High") {
    return "bg-red-100 text-red-700";
  }
  if (priority === "LOW" || priority === "Low") {
    return "bg-green-100 text-green-700";
  }
  return "bg-yellow-100 text-yellow-700";
};

const getAttachmentName = (attachment) => {
  if (typeof attachment === "string") return attachment;
  return attachment?.fileName || attachment?.name || "Attachment";
};

const getAttachmentId = (attachment) =>
  attachment?.fileId || attachment?.id || attachment?.attachmentId || "";

const normalizeAttachments = (attachments) =>
  Array.isArray(attachments)
    ? attachments.map((attachment) =>
        typeof attachment === "string"
          ? { fileName: attachment }
          : {
              ...attachment,
              fileId: getAttachmentId(attachment),
              fileName: getAttachmentName(attachment),
            }
      )
    : [];

const normalizeAssigneeId = (value) => String(value || "").trim();

const getProjects = () => allProjects;
const canViewProject = () => true;

const normalizeBoardTitle = (value) => {
  const title = String(value || "").trim();
  if (!title) return "";
  if (title === "Project Board" || title === "Kanban Board") return "";
  if (title === "Project Kanban Board") return "";
  return title.replace(/\s+Board$/i, "").trim();
};

const KanbanBoardPage = () => {
  const params = useParams();
  const pid = decodeURIComponent((params?.pid || "").toString());
  const [projects, setProjects] = useState(allProjects);

  const sessionUser = useMemo(() => {
    const storedUser = getUser();
    const role = normalizeRole(storedUser?.role) || "CLIENT";

    return {
      name:
        storedUser?.fullName ||
        storedUser?.name ||
        storedUser?.email ||
        "Current User",
      role,
    };
  }, []);

  const isPrivilegedUser = ["ADMIN", "MANAGER", "COMPANY"].includes(
    sessionUser.role
  );

  const project = useMemo(
    () =>
      projects.find(
        (item) => item.pid === pid && canViewProject(item, sessionUser.role)
      ),
    [pid, projects, sessionUser.role]
  );

  const [columns, setColumns] = useState(createEmptyColumns());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [boardData, setBoardData] = useState(null);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [remoteProject, setRemoteProject] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

  const storageKey = `kanban_columns_${pid || "default"}`;
  const deletedTasksStorageKey = `kanban_deleted_tasks_${pid || "default"}`;
  const todayISO = new Date().toISOString().split("T")[0];

  const resolvedProject = useMemo(() => {
    if (project) return project;

    if (remoteProject) {
      return {
        pid,
        name: remoteProject.name || "Project",
        description: remoteProject.description || "",
      };
    }

    if (!pid) return null;

    if (boardData?.projectId || boardData?.id) {
      return {
        pid,
        name:
          normalizeBoardTitle(boardData?.name) ||
          normalizeBoardTitle(boardData?.title) ||
          "Project",
        description: boardData?.description || "",
      };
    }

    return null;
  }, [boardData, pid, project, remoteProject]);

  const resolvedCompanyId = useMemo(
    () =>
      boardData?.companyId ||
      remoteProject?.companyId ||
      project?.companyId ||
      null,
    [boardData?.companyId, project?.companyId, remoteProject?.companyId]
  );

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadProject = async () => {
      if (!pid) {
        if (mounted) setRemoteProject(null);
        return;
      }

      try {
        const response = await getKanbanProjectById(pid, sessionUser.role);
        if (mounted) setRemoteProject(response || null);
      } catch {
        if (mounted) setRemoteProject(null);
      }
    };

    loadProject();

    return () => {
      mounted = false;
    };
  }, [pid, sessionUser.role]);

  useEffect(() => {
    let mounted = true;

    const loadCompanyUsers = async () => {
      try {
        const users = await getCompanyUsers();
        if (mounted) setCompanyUsers(Array.isArray(users) ? users : []);
      } catch {
        if (mounted) setCompanyUsers([]);
        const users = await getCompanyUsers(resolvedCompanyId);
        if (mounted) {
          setCompanyUsers(Array.isArray(users) ? users : []);
        }
      } catch (err) {
        if (mounted) {
          setCompanyUsers([]);
        }
      }
    };

    loadCompanyUsers();

    return () => {
      mounted = false;
    };
  }, [resolvedCompanyId]);

  const assigneeNameById = useMemo(() => {
    const entries = (Array.isArray(companyUsers) ? companyUsers : [])
      .map((user) => {
        const id = normalizeAssigneeId(user?.id || user?._id || user?.userId);
        const name = user?.name || user?.fullName || user?.email || id;
        return id ? [id, name] : null;
      })
      .filter(Boolean);

    return new Map(entries);
  }, [companyUsers]);

  const buildColumnsFromResponse = (response) => {
    const newColumns = createEmptyColumns();
    const deletedTaskIds = response?.id
      ? new Set()
      : new Set(getDeletedTaskIds(deletedTasksStorageKey));

    response?.tasksByStatus?.forEach((statusGroup) => {
      const columnId = {
        TODO: "todo",
        IN_PROGRESS: "inprogress",
        IN_REVIEW: "review",
        DONE: "done",
      }[statusGroup.status];

      const column = newColumns.find((item) => item.id === columnId);

      if (!column || !statusGroup.tasks) return;

      column.cards = statusGroup.tasks
        .filter((task) => !deletedTaskIds.has(String(task?.id || "")))
        .map((task) => ({
          id: task.id,
          title: task.title,
          tag: task.priority || "Medium",
          tagColor: getTagColorByPriority(task.priority || "Medium"),
          date: formatDate(task.dueDate),
          comments: task.comments?.length || 0,
          commentsData: (task.comments || []).map((comment) => ({
            id: comment.id,
            user: comment.userName || comment.userId || "Unknown",
            text: comment.comment || "",
            time: comment.createdAt
              ? new Date(comment.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
          })),
          attachments: normalizeAttachments(task.attachments).length,
          attachmentsData: normalizeAttachments(task.attachments),
          assigneeId: normalizeAssigneeId(task.assignedTo),
          assignee:
            assigneeNameById.get(normalizeAssigneeId(task.assignedTo)) ||
            task.assignedTo ||
            "Unassigned",
          completionPercentage: task.completionPercentage || 0,
          statusLabel: task.status === "DONE" ? "Completed" : undefined,
        }));

      column.count = column.cards.length;
    });

    return newColumns;
  };

  const refreshKanbanBoard = async () => {
    const response = await getKanbanBoardWithTasks(pid, sessionUser.role);
    setBoardData(response);

    if (response?.id) {
      saveDeletedTaskIds(deletedTasksStorageKey, []);
    }

    const savedColumns = response?.id ? null : getSavedColumns(storageKey);
    setColumns(savedColumns || buildColumnsFromResponse(response));
    return response;
  };

  useEffect(() => {
    const loadKanbanBoard = async () => {
      try {
        setLoading(true);
        await refreshKanbanBoard();
        setError(null);
      } catch (err) {
        console.error("Error loading kanban board:", err);
        setError("Failed to load kanban board");
        const savedColumns = getSavedColumns(storageKey);
        setColumns(savedColumns || createEmptyColumns());
      } finally {
        setLoading(false);
      }
    };

    if (pid) loadKanbanBoard();
  }, [pid, storageKey]);

  const [openFormColumnId, setOpenFormColumnId] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [newCardData, setNewCardData] = useState({
    title: "",
    tag: "High",
    date: todayISO,
    attachments: [],
    assignee: "",
  });

  const [mounted, setMounted] = useState(false);

  const [openMenu, setOpenMenu] = useState({
    columnId: null,
    cardId: null,
    top: 0,
    left: 0,
  });

  const [moveDropdown, setMoveDropdown] = useState({
    columnId: null,
    cardId: null,
    top: 0,
    left: 0,
  });

  const boardRef = useRef(null);
  const menuRef = useRef(null);
  const moveRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return todayISO;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

    const md = dateStr.match(/^([A-Za-z]+)\s+(\d{1,2})$/);
    if (md) {
      const monthName = md[1];
      const day = parseInt(md[2], 10);
      const year = new Date().getFullYear();
      const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();

      if (!Number.isNaN(monthIndex)) {
        const d = new Date(year, monthIndex, day);
        if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      }
    }

    const parsed = new Date(dateStr);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);

    return todayISO;
  };

  const normalizeInputDate = (dateValue) => {
    if (!dateValue) return todayISO;
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return todayISO;
    return parsed.toISOString().split("T")[0];
  };

  const isPastDate = (dateValue) => normalizeInputDate(dateValue) < todayISO;

  const getPriorityBarColor = (tag) => {
    if (tag === "High") return "bg-red-500";
    if (tag === "Low") return "bg-green-500";
    return "bg-yellow-500";
  };

  const getCardBorderStyle = () =>
    "border-slate-200 bg-white hover:border-slate-300";

  const getColumnBorder = (id) => {
    switch (id) {
      case "todo":
        return "border-slate-300";
      case "inprogress":
        return "border-amber-200";
      case "review":
        return "border-blue-200";
      case "done":
        return "border-green-200";
      default:
        return "border-slate-200";
    }
  };

  const getColumnDotClass = (colId) => {
    switch (colId) {
      case "todo":
        return "bg-slate-400";
      case "inprogress":
        return "bg-amber-400";
      case "review":
        return "bg-blue-400";
      case "done":
        return "bg-emerald-500";
      default:
        return "bg-slate-300";
    }
  };

  const getAssigneeInitials = (name = "") => {
    if (!name || name === "Unassigned") return "U";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const getAllowedMoveTargets = (columnId) => {
    if (isPrivilegedUser) {
      return columns
        .map((column) => column.id)
        .filter((targetId) => targetId !== columnId);
    }

    if (columnId === "todo") return ["inprogress"];
    if (columnId === "inprogress") return ["review"];
    return [];
  };

  const canMoveCard = (columnId) => getAllowedMoveTargets(columnId).length > 0;
  const canEditCard = isPrivilegedUser;
  const canDeleteCard = isPrivilegedUser;

  const getActionMenuHeight = (columnId) => {
    const actionCount =
      (canEditCard ? 1 : 0) +
      (canMoveCard(columnId) ? 1 : 0) +
      (canDeleteCard ? 1 : 0);

    const hasDivider = canDeleteCard && (canEditCard || canMoveCard(columnId));
    return 12 + actionCount * 42 + (hasDivider ? 1 : 0);
  };

  const openForm = (columnId) => {
    setEditingCard(null);
    setOpenFormColumnId(columnId);
    setNewCardData({
      title: "",
      tag: "High",
      date: todayISO,
      attachments: [],
      status: columnId,
      assignee: "",
    });
  };

  const handleEditCard = (columnId, card) => {
    const formattedDate = formatDateForInput(card.date);
    const safeDate = formattedDate < todayISO ? todayISO : formattedDate;

    setEditingCard({ columnId, cardId: card.id });
    setOpenFormColumnId(columnId);
    setNewCardData({
      title: card.title || "",
      tag: card.tag || "Medium",
      date: safeDate,
      attachments: card.attachmentsData || [],
      status: columnId,
      assignee: card.assigneeId || card.assignee || "",
    });

    setOpenMenu({ columnId: null, cardId: null, top: 0, left: 0 });
    setMoveDropdown({ columnId: null, cardId: null, top: 0, left: 0 });
  };

  const closeForm = () => {
    setOpenFormColumnId(null);
    setEditingCard(null);
    setNewCardData({
      title: "",
      tag: "High",
      date: todayISO,
      attachments: [],
      assignee: "",
    });
  };

  const ensureBoardId = async () => {
    if (boardData?.id) return boardData.id;

    const refreshedBoard = await refreshKanbanBoard();
    if (refreshedBoard?.id) return refreshedBoard.id;

    const createdBoard = await createKanbanBoard(
      pid,
      {
        name: resolvedProject?.name || "Project",
        description: resolvedProject?.description || "Kanban board",
      },
      sessionUser.role
    );

    if (createdBoard?.id) {
      setBoardData((prev) => ({
        ...(prev || {}),
        ...createdBoard,
        tasksByStatus: prev?.tasksByStatus || [],
      }));
      return createdBoard.id;
    }

    throw new Error("Kanban board could not be initialized.");
  };

  const buildTaskPayload = (data, safeDate, statusColumnId = null) => ({
    title: data.title.trim(),
    assignedTo:
      data.assignee && data.assignee !== "unassigned" ? data.assignee : null,
    status: resolveTaskStatus(statusColumnId, data.status),
    dueDate: safeDate ? `${safeDate}T00:00:00` : null,
    priority: String(data.tag || "Medium").toUpperCase(),
    attachments: Array.isArray(data.attachments)
      ? data.attachments
          .map((attachment) =>
            typeof attachment === "string" ? attachment : attachment?.name || null
          )
          .filter(Boolean)
      : [],
    ...(statusColumnId
      ? {
          completionPercentage:
            columnToStatusMap[statusColumnId] === "DONE" ? 100 : 0,
        }
      : {}),
  });

  const getUploadedFiles = (attachments) =>
    Array.isArray(attachments)
      ? attachments.filter(
          (attachment) =>
            typeof File !== "undefined" && attachment instanceof File
        )
      : [];

  const uploadAttachmentsIfPossible = async (taskId, files) => {
    if (!taskId || !Array.isArray(files) || files.length === 0) return false;

    try {
      const result = await uploadTaskAttachments(
        pid,
        taskId,
        files,
        sessionUser.role
      );

      if (result?.attachments) {
        const nextAttachments = normalizeAttachments(result.attachments);
        setColumns((prev) =>
          prev.map((column) => ({
            ...column,
            cards: column.cards.map((card) =>
              card.id === taskId
                ? {
                    ...card,
                    attachments: nextAttachments.length,
                    attachmentsData: nextAttachments,
                  }
                : card
            ),
          }))
        );
      }

      return Boolean(result);
    } catch (err) {
      console.warn("Attachment upload skipped:", err);
      setSaveMessage("Task saved, but attachments could not be uploaded.");
      return false;
    }
  };

  const rememberDeletedTask = (taskId) => {
    const nextIds = Array.from(
      new Set([...getDeletedTaskIds(deletedTasksStorageKey), String(taskId)])
    );
    saveDeletedTaskIds(deletedTasksStorageKey, nextIds);
  };

  const removeDeletedTaskMarker = (taskId) => {
    const nextIds = getDeletedTaskIds(deletedTasksStorageKey).filter(
      (id) => id !== String(taskId)
    );
    saveDeletedTaskIds(deletedTasksStorageKey, nextIds);
  };

  const handleDownloadAttachment = async (taskId, attachment) => {
    const attachmentId = getAttachmentId(attachment);

    if (!attachmentId) {
      alert("This attachment does not have a downloadable file.");
      return;
    }

    try {
      await downloadTaskAttachment(
        pid,
        taskId,
        attachmentId,
        getAttachmentName(attachment),
        sessionUser.role
      );
    } catch (err) {
      console.error("Error downloading attachment:", err);
      alert("Failed to download attachment.");
    }
  };

  const handleSaveChanges = () => {
    try {
      const normalizedColumns =
        sanitizeStoredColumns(columns) || createEmptyColumns();

      localStorage.setItem(storageKey, JSON.stringify(normalizedColumns));
      setColumns(normalizedColumns);

      setSaveMessage(
        `Saved changes at ${new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );
    } catch (err) {
      console.error("Error saving kanban board:", err);
      setSaveMessage("Failed to save changes");
    }
  };

  const handleFormSubmit = async (columnId, formData) => {
    const data = formData || newCardData;

    if (!data.title?.trim()) return;

    if (data.date && isPastDate(data.date)) {
      alert("Past dates are not allowed. Please select today or a future date.");
      return;
    }

    const safeDate = data.date ? normalizeInputDate(data.date) : todayISO;

    try {
      setLoading(true);
      setError(null);

      if (editingCard) {
        const uploadedFiles = getUploadedFiles(data.attachments);

        await updateTask(
          pid,
          editingCard.cardId,
          buildTaskPayload(data, safeDate),
          sessionUser.role
        );

        if (uploadedFiles.length > 0) {
          await uploadAttachmentsIfPossible(editingCard.cardId, uploadedFiles);
        }

        await refreshKanbanBoard();
        closeForm();
        return;
      }

      const boardId = await ensureBoardId();
      const uploadedFiles = getUploadedFiles(data.attachments);

      const createdTask = await createTask(
        pid,
        boardId,
        buildTaskPayload(data, safeDate, columnId),
        sessionUser.role
      );

      if (createdTask?.id) {
        removeDeletedTaskMarker(createdTask.id);
      }

      if (uploadedFiles.length > 0 && createdTask?.id) {
        await uploadAttachmentsIfPossible(createdTask.id, uploadedFiles);
      }

      if (
        columnToStatusMap[columnId] &&
        columnToStatusMap[columnId] !== "TODO" &&
        createdTask?.id
      ) {
        await updateTaskStatus(
          pid,
          createdTask.id,
          {
            status: columnToStatusMap[columnId],
            completionPercentage:
              columnToStatusMap[columnId] === "DONE" ? 100 : 50,
          },
          sessionUser.role
        );
      }

      await refreshKanbanBoard();
      closeForm();
    } catch (err) {
      console.error("Error saving task:", err);
      setError("Failed to save task");
      alert("Failed to save task to the database.");
    } finally {
      setLoading(false);
    }
  };

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    if (
      e.target.closest(".kanban-card") ||
      e.target.closest("button") ||
      e.target.closest("input") ||
      e.target.closest("textarea") ||
      e.target.closest("select")
    ) {
      return;
    }

    setIsDragging(true);
    setStartX(e.pageX - boardRef.current.offsetLeft);
    setScrollLeft(boardRef.current.scrollLeft);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - boardRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    boardRef.current.scrollLeft = scrollLeft - walk;
  };

  const closeAllMenus = () => {
    setOpenMenu({ columnId: null, cardId: null, top: 0, left: 0 });
    setMoveDropdown({ columnId: null, cardId: null, top: 0, left: 0 });
  };

  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      const clickedMenuButton = e.target.closest(".menu-btn");
      if (clickedMenuButton) return;

      const insideMenu = menuRef.current?.contains(e.target);
      const insideMove = moveRef.current?.contains(e.target);

      if (!insideMenu && !insideMove) closeAllMenus();
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    const handleViewportChange = () => closeAllMenus();

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, []);

  const openActionMenu = (e, columnId, cardId) => {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 198;
    const menuHeight = getActionMenuHeight(columnId);
    const gap = 6;

    let left = rect.right - menuWidth;
    let top = rect.bottom + gap;

    if (left < 12) left = 12;
    if (left + menuWidth > window.innerWidth - 12) {
      left = window.innerWidth - menuWidth - 12;
    }
    if (top + menuHeight > window.innerHeight - 12) {
      top = rect.top - menuHeight - gap;
    }

    setMoveDropdown({ columnId: null, cardId: null, top: 0, left: 0 });

    setOpenMenu((prev) =>
      prev.cardId === cardId && prev.columnId === columnId
        ? { columnId: null, cardId: null, top: 0, left: 0 }
        : { columnId, cardId, top, left }
    );
  };

  const openMoveMenu = (e, columnId, cardId) => {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 180;
    const estimatedHeight = Math.max(
      56,
      getAllowedMoveTargets(columnId).length * 46 + 12
    );
    const gap = 6;

    let left = rect.right + gap;
    let top = rect.top;

    if (left + menuWidth > window.innerWidth - 12) {
      left = rect.left - menuWidth - gap;
    }

    if (top + estimatedHeight > window.innerHeight - 12) {
      top = Math.max(12, window.innerHeight - estimatedHeight - 12);
    }

    setMoveDropdown((prev) =>
      prev.cardId === cardId && prev.columnId === columnId
        ? { columnId: null, cardId: null, top: 0, left: 0 }
        : { columnId, cardId, top, left }
    );
  };

  const handleMoveToColumn = async (srcColumnId, cardId, targetColumnId) => {
    const statusMap = {
      todo: "TODO",
      inprogress: "IN_PROGRESS",
      review: "IN_REVIEW",
      done: "DONE",
    };

    try {
      await updateTaskStatus(
        pid,
        cardId,
        {
          status: statusMap[targetColumnId],
          completionPercentage: targetColumnId === "done" ? 100 : 50,
        },
        sessionUser.role
      );

      setColumns((cols) => {
        const srcIndex = cols.findIndex((c) => c.id === srcColumnId);
        const tgtIndex = cols.findIndex((c) => c.id === targetColumnId);

        if (srcIndex === -1 || tgtIndex === -1) return cols;

        const card = cols[srcIndex].cards.find((c) => c.id === cardId);

        if (!card) return cols;

        const movedCard =
          isPrivilegedUser && targetColumnId === "done"
            ? {
                ...card,
                statusLabel: "Completed",
                completedBy: sessionUser.name || sessionUser.role,
                completedOn: new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                clientNotified: Boolean(card.clientNotified),
              }
            : targetColumnId !== "done"
            ? {
                ...card,
                statusLabel: undefined,
                completedBy: undefined,
                completedOn: undefined,
                clientNotified: false,
              }
            : card;

        return cols.map((col, idx) => {
          if (idx === srcIndex) {
            return {
              ...col,
              cards: col.cards.filter((c) => c.id !== cardId),
              count: Math.max(0, (col.cards?.length || 1) - 1),
            };
          }

          if (idx === tgtIndex) {
            return {
              ...col,
              cards: [...col.cards, movedCard],
              count: (col.cards?.length || 0) + 1,
            };
          }

          return col;
        });
      });

      closeAllMenus();
    } catch (err) {
      console.error("Error moving card:", err);
      alert("Failed to move task");
    }
  };

  const handleDeleteCard = async (columnId, cardId) => {
    try {
      const isServerBackedTask = Boolean(boardData?.id);

      if (isServerBackedTask) {
        await deleteTask(pid, cardId, sessionUser.role);
      } else {
        rememberDeletedTask(cardId);
      }

      setColumns((cols) =>
        cols.map((col) =>
          col.id === columnId
            ? {
                ...col,
                cards: col.cards.filter((c) => c.id !== cardId),
                count: Math.max(0, (col.cards?.length || 1) - 1),
              }
            : col
        )
      );

      setSaveMessage("Task deleted.");
    } catch (err) {
      console.error("Error deleting card:", err);
      alert("Failed to delete task");
    }
  };

  const handleSendToClient = (columnId, cardId) => {
    if (!isPrivilegedUser) return;

    const confirmed = window.confirm(
      "Are you sure you want to send this update to the client?"
    );

    if (!confirmed) return;

    setColumns((cols) =>
      cols.map((col) => {
        if (col.id !== columnId) return col;

        return {
          ...col,
          cards: col.cards.map((card) =>
            card.id === cardId ? { ...card, clientNotified: true } : card
          ),
        };
      })
    );
  };

  const [openComments, setOpenComments] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [openAttachments, setOpenAttachments] = useState(null);
  const [openCompletedCard, setOpenCompletedCard] = useState(null);

  const getCardByIds = (columnId, cardId) => {
    const col = columns.find((c) => c.id === columnId);
    if (!col) return null;
    return col.cards.find((c) => c.id === cardId) || null;
  };

  const hasCardActions = (columnId) =>
    canEditCard || canDeleteCard || canMoveCard(columnId);

  const openCommentsModal = (columnId, cardId) => {
    setOpenComments({ columnId, cardId });
    setCommentText("");
  };

  const closeCommentsModal = () => {
    setOpenComments(null);
    setCommentText("");
  };

  const openAttachmentsModal = (columnId, cardId) =>
    setOpenAttachments({ columnId, cardId });

  const closeAttachmentsModal = () => setOpenAttachments(null);

  const openCompletedCardModal = (columnId, cardId) =>
    setOpenCompletedCard({ columnId, cardId });

  const closeCompletedCardModal = () => setOpenCompletedCard(null);

  const handleSendComment = async () => {
    const text = commentText.trim();

    if (!text || !openComments) return;

    const { cardId } = openComments;

    try {
      await addTaskComment(pid, cardId, text, sessionUser.role);
      await refreshKanbanBoard();
      setCommentText("");
    } catch (err) {
      console.error("Error saving comment:", err);
      alert("Failed to save message.");
    }
  };

  const openedCard = openComments
    ? getCardByIds(openComments.columnId, openComments.cardId)
    : null;

  const openedAttachmentCard = openAttachments
    ? getCardByIds(openAttachments.columnId, openAttachments.cardId)
    : null;

  const openedCompletedCard = openCompletedCard
    ? getCardByIds(openCompletedCard.columnId, openCompletedCard.cardId)
    : null;

  const renderFloatingMenus = () => {
    if (!mounted) return null;

    return createPortal(
      <>
        {openMenu.cardId && (
          <div
            ref={menuRef}
            className="fixed z-[1000] w-[198px] overflow-hidden rounded-[14px] border border-slate-200/90 bg-white p-1.5 shadow-[0_18px_36px_rgba(15,23,42,0.14)]"
            style={{ top: openMenu.top, left: openMenu.left }}
          >
            <div className="space-y-0.5">
              {canEditCard && (
                <button
                  type="button"
                  onClick={() => {
                    const card = getCardByIds(
                      openMenu.columnId,
                      openMenu.cardId
                    );
                    if (card) handleEditCard(openMenu.columnId, card);
                  }}
                  className="flex w-full items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-left transition hover:bg-slate-50"
                >
                  <Pencil className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-800">
                    Edit
                  </span>
                </button>
              )}

              {canMoveCard(openMenu.columnId) && (
                <button
                  type="button"
                  onClick={(e) =>
                    openMoveMenu(e, openMenu.columnId, openMenu.cardId)
                  }
                  className="flex w-full items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-left transition hover:bg-slate-50"
                >
                  <ArrowRightLeft className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-800">
                    {isPrivilegedUser ? "Move" : "Submit"}
                  </span>
                </button>
              )}
            </div>

            {canDeleteCard && (
              <div className="mt-1.5 border-t border-slate-200 pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Delete this card?")) {
                      handleDeleteCard(openMenu.columnId, openMenu.cardId);
                    }
                    closeAllMenus();
                  }}
                  className="flex w-full items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-left transition hover:bg-slate-50"
                >
                  <Trash2 className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-800">
                    Delete
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {moveDropdown.cardId && (
          <div
            ref={moveRef}
            className="fixed z-[1001] w-[180px] overflow-hidden rounded-[12px] border border-slate-200/90 bg-white p-1.5 shadow-[0_18px_36px_rgba(15,23,42,0.14)]"
            style={{ top: moveDropdown.top, left: moveDropdown.left }}
          >
            {columns
              .filter((col) =>
                getAllowedMoveTargets(moveDropdown.columnId).includes(col.id)
              )
              .map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => {
                    handleMoveToColumn(
                      moveDropdown.columnId,
                      moveDropdown.cardId,
                      col.id
                    );
                  }}
                  className="flex w-full items-center gap-3 rounded-[10px] bg-white px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50"
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${getColumnDotClass(
                      col.id
                    )}`}
                  />
                  <span className="flex-1 text-sm font-semibold">
                    {col.title}
                  </span>
                </button>
              ))}
          </div>
        )}
      </>,
      document.body
    );
  };

  return (
    <Layout title={resolvedProject?.name || "Kanban"}>
      {resolvedProject && (
        <div className="mb-5 flex justify-end">
          <button
            type="button"
            onClick={handleSaveChanges}
            className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl active:scale-95"
          >
            Save Board
          </button>
        </div>
      )}

      {saveMessage && (
        <p className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {saveMessage}
        </p>
      )}

      {loading ? (
        <div className="rounded-[28px] border border-white bg-white/90 px-6 py-14 text-center shadow-xl">
          <p className="text-xl font-black text-slate-900">
            Loading Kanban Board...
          </p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Please wait while we fetch your tasks.
          </p>
        </div>
      ) : error ? (
        <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-14 text-center shadow-xl">
          <p className="text-xl font-black text-red-700">{error}</p>
          <p className="mt-2 text-sm font-medium text-red-500">
            Failed to load kanban board. Please refresh the page.
          </p>
        </div>
      ) : !resolvedProject ? (
        <div className="rounded-[28px] border border-white bg-white/90 px-6 py-14 text-center shadow-xl">
          <p className="text-xl font-black text-slate-900">Access Restricted</p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            This Kanban board is not available for your current role.
          </p>
        </div>
      ) : (
        <div
          ref={boardRef}
          className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className="flex h-full min-w-max items-start gap-6 pb-4">
            {columns.map((column) => (
              <div
                key={column.id}
                className={`flex max-h-[calc(100vh-235px)] min-h-[calc(100vh-235px)] w-[20rem] flex-shrink-0 flex-col self-start rounded-[28px] border bg-white/90 shadow-[0_20px_55px_rgba(15,23,42,0.10)] backdrop-blur-xl transition hover:shadow-[0_24px_70px_rgba(15,23,42,0.14)] ${getColumnBorder(
                  column.id
                )}`}
              >
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full shadow ${getColumnDotClass(
                        column.id
                      )}`}
                    />

                    <h3 className="text-sm font-black text-slate-900">
                      {column.title}
                    </h3>
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-800">
              Loading Kanban Board...
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Please wait while we fetch your tasks.
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-red-800">{error}</p>
            <p className="mt-2 text-sm text-red-600">
              Failed to load kanban board. Please refresh the page.
            </p>
          </div>
        ) : !resolvedProject ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-800">
              Access Restricted
            </p>
            <p className="mt-2 text-sm text-slate-500">
              This Kanban board is not available for your current role.
            </p>
          </div>
        ) : (
          <div
            ref={boardRef}
            className="kanban-scroll-shell flex-1 min-h-0 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <div className="flex h-full min-w-max items-start gap-5 pb-3">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className={`flex max-h-full min-h-0 w-[18rem] flex-shrink-0 flex-col self-start rounded-[24px] border bg-slate-50/80 ${getColumnBorder(
                    column.id
                  )}`}
                >
                  <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${getColumnDotClass(
                          column.id
                        )}`}
                      />
                      <h3 className="text-sm font-semibold text-slate-800">
                        {column.title}
                      </h3>
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {column.count}
                      </span>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-500">
                      {column.count}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openForm(column.id);
                    }}
                    className="rounded-xl bg-indigo-50 p-2 text-indigo-600 transition hover:bg-indigo-100"
                    title="Add ticket"
                  <div
                    className={`kanban-scroll-column space-y-4 p-3.5 ${
                      column.cards.length === ""
                        ? ""
                        : column.cards.length > 0
                        ? "flex-1 min-h-0 overflow-y-auto"
                        : ""
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="custom-kanban-scroll min-h-0 flex-1 space-y-4 overflow-y-auto p-4 pr-2">
                  {column.cards.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
                      <p className="text-sm font-bold text-slate-400">
                        No tasks here yet
                      </p>
                    </div>
                  ) : (
                    column.cards.map((card) => (
                      <div
                        key={card.id}
                        className={`kanban-card relative flex min-h-[140px] cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white px-4 pb-4 pt-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${getCardBorderStyle()}`}
                        onClick={() => closeAllMenus()}
                      >
                        <span
                          className={`absolute left-0 top-0 h-full w-[6px] ${getPriorityBarColor(
                            card.tag
                          )}`}
                        />

                        <div className="mb-4 flex items-start justify-between gap-3 pl-2">
                          <h4 className="text-[15px] font-black leading-5 text-slate-900">
                            {card.title}
                          </h4>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black ${card.tagColor}`}
                          >
                            {card.tag}
                          </span>
                        </div>

                        <div className="mb-4 flex items-center gap-3 pl-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-black text-white shadow">
                            {getAssigneeInitials(card.assignee)}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[11rem] truncate text-xs font-black text-slate-700">
                              {card.assignee || "Unassigned"}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400">
                              Assignee
                            </p>
                          </div>
                        </div>

                        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 pl-2">
                          <div className="flex items-center gap-3 text-slate-400">
                            <div className="flex items-center gap-1 text-[11px] font-bold">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{card.date}</span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCommentsModal(column.id, card.id);
                              }}
                              className="flex items-center gap-1 text-[11px] font-bold transition hover:text-indigo-600"
                              title="Ticket messages"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>{card.comments || 0}</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openAttachmentsModal(column.id, card.id);
                              }}
                              className="flex items-center gap-1 text-[11px] font-bold transition hover:text-indigo-600"
                              title="Attachments"
                            >
                              <Paperclip className="h-3.5 w-3.5" />
                              <span>{card.attachments || 0}</span>
                            </button>
                          </div>

                          {hasCardActions(column.id) && (
                            <button
                              type="button"
                              className="menu-btn rounded-full p-2 transition hover:bg-slate-100"
                              onClick={(e) =>
                                openActionMenu(e, column.id, card.id)
                              }
                              title="More"
                            >
                              <MoreHorizontal className="h-4 w-4 text-slate-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {renderFloatingMenus()}

      <AddCardModal
        show={openFormColumnId !== null}
        initialData={newCardData}
        onCancel={closeForm}
        onSave={(data) => handleFormSubmit(openFormColumnId, data)}
        isEditMode={!!editingCard}
        minDate={todayISO}
        companyId={boardData?.companyId || null}
      />

      {openComments && openedCard && (
        <ModalWrapper>
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Ticket Messages
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  {openedCard.title}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCommentsModal}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[320px] space-y-3 overflow-y-auto px-6 py-5">
              {(openedCard.commentsData || []).length === 0 ? (
                <p className="text-sm font-medium text-slate-500">
                  No messages yet.
                </p>
              ) : (
                openedCard.commentsData.map((message) => (
                  <div
                    key={message.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="text-sm font-black text-slate-800">
                        {message.user}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {message.time}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{message.text}</p>
                  </div>
                ))
              )}
            </div>
        {renderFloatingMenus()}

        <AddCardModal
          show={openFormColumnId !== null}
          initialData={newCardData}
          onCancel={closeForm}
          onSave={(data) => handleFormSubmit(openFormColumnId, data)}
          isEditMode={!!editingCard}
          minDate={todayISO}
          companyId={resolvedCompanyId}
          assignees={companyUsers}
        />

        {openComments && openedCard && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Ticket Messages
                  </h3>
                  <p className="text-sm text-slate-500">{openedCard.title}</p>
                </div>

            <div className="border-t border-slate-100 px-6 py-5">
              <div className="flex items-end gap-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  placeholder="Write a message..."
                  className="min-h-[92px] flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={handleSendComment}
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-black text-white transition hover:bg-indigo-700"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </ModalWrapper>
      )}

      {openAttachments && openedAttachmentCard && (
        <ModalWrapper>
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Attachments
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  {openedAttachmentCard.title}
                </p>
              </div>

              <button
                type="button"
                onClick={closeAttachmentsModal}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[320px] space-y-3 overflow-y-auto px-6 py-5">
              {(openedAttachmentCard.attachmentsData || []).length === 0 ? (
                <p className="text-sm font-medium text-slate-500">
                  No attachments yet.
                </p>
              ) : (
                openedAttachmentCard.attachmentsData.map(
                  (attachment, index) => (
                    <div
                      key={`${
                        getAttachmentId(attachment) ||
                        getAttachmentName(attachment)
                      }-${index}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Paperclip className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">
                          {getAttachmentName(attachment)}
                        </span>
                      </div>

                      {getAttachmentId(attachment) && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadAttachment(
                              openedAttachmentCard.id,
                              attachment
                            )
                          }
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-100"
                        >
                          Download
                        </button>
                      )}
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </ModalWrapper>
      )}

      {openCompletedCard && openedCompletedCard && (
        <ModalWrapper>
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h3 className="text-lg font-black text-slate-900">
                Completed Ticket
              </h3>

              <button
                type="button"
                onClick={closeCompletedCardModal}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
                  Completed
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${openedCompletedCard.tagColor}`}
                >
                  {openedCompletedCard.tag}
                </span>

                {openedCompletedCard.clientNotified && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                    Sent to Client
                  </span>
                )}
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-sm text-slate-600">
                  Completed by{" "}
                  <span className="font-black text-slate-900">
                    {openedCompletedCard.completedBy}
                  </span>
                </p>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {openedCompletedCard.completedOn}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoBox label="Assignee" value={openedCompletedCard.assignee} />
                <InfoBox label="Due Date" value={openedCompletedCard.date} />
              </div>

              {isPrivilegedUser && !openedCompletedCard.clientNotified && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      handleSendToClient(
                        openCompletedCard.columnId,
                        openCompletedCard.cardId
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                    Send to Client
                  </button>
                </div>
              )}
            </div>
          </div>
        </ModalWrapper>
      )}

      <style jsx global>{`
        .custom-kanban-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .custom-kanban-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 999px;
        }

        .custom-kanban-scroll::-webkit-scrollbar-thumb {
          background: #c4b5fd;
          border-radius: 999px;
        }

        .custom-kanban-scroll::-webkit-scrollbar-thumb:hover {
          background: #8b5cf6;
                {isPrivilegedUser && !openedCompletedCard.clientNotified && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        handleSendToClient(
                          openCompletedCard.columnId,
                          openCompletedCard.cardId
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4" />
                      Send to Client
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        .kanban-scroll-shell,
        .kanban-scroll-column {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.55) rgba(241, 245, 249, 0.65);
        }

        .kanban-scroll-shell::-webkit-scrollbar,
        .kanban-scroll-column::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .kanban-scroll-shell::-webkit-scrollbar-track,
        .kanban-scroll-column::-webkit-scrollbar-track {
          background: rgba(241, 245, 249, 0.7);
          border-radius: 999px;
        }

        .kanban-scroll-shell::-webkit-scrollbar-thumb,
        .kanban-scroll-column::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.6);
          border-radius: 999px;
          border: 2px solid rgba(241, 245, 249, 0.85);
        }

        .kanban-scroll-shell::-webkit-scrollbar-thumb:hover,
        .kanban-scroll-column::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.8);
        }
      `}</style>
    </Layout>
  );
};

function ModalWrapper({ children }) {
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      {children}
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 px-4 py-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold text-slate-800">
        {value || "N/A"}
      </p>
    </div>
  );
}

export default KanbanBoardPage;