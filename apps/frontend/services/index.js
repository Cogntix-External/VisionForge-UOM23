// ─────────────────────────────────────────────────────────
// index.js  —  Barrel re-export (backward compatibility)
//
// Existing imports like:
//   import { login, getCompanyProjects } from "../services/api"
// will keep working if updated to:
//   import { login, getCompanyProjects } from "../services"
//
// Or individual modules can be imported directly:
//   import { login } from "../services/authService"
// ─────────────────────────────────────────────────────────

export { API_BASE, request, getCompanyId, getStoredUser, getAuthToken } from "./http.js";

export {
  login,
  register,
  forgotPassword,
  resetPassword,
  changePassword,
} from "./authService.js";

export {
  getClientDashboard,
  getCompanyDashboard,
} from "./dashboardService.js";

export {
  getClientProposals,
  getClientProposalById,
  acceptProposal,
  rejectProposal,
  getRegisteredClients,
  getCompanyProposals,
  createCompanyProposal,
} from "./proposalService.js";

export {
  getClientProjects,
  getClientProjectById,
  getCompanyProjects,
  getCompanyProjectById,
  getProjectById,
} from "./projectService.js";

export {
  getClientProjectPrd,
  getAllPrds,
  fetchPrds,
  fetchPrdById,
  createPrd,
  updatePrd,
  downloadDocument,
} from "./prdService.js";

export {
  createClientChangeRequest,
  getClientChangeRequests,
  downloadClientChangeRequestAttachment,
  getCompanyChangeRequests,
  getCompanyChangeRequestsByProject,
  getCompanyChangeRequestsByProjectAndPrd,
  decideCompanyChangeRequest,
  markCompanyChangeRequestImplemented,
  downloadCompanyChangeRequest,
} from "./changeRequestService.js";

export {
  getCompanyVersionHistory,
  getCompanyVersionHistoryEntries,
} from "./versionHistoryService.js";

export {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  getClientNotifications,
  getClientUnreadNotificationCount,
} from "./notificationService.js";

export {
  getCompanyUsers,
  getAssignedKanbanProjects,
  getKanbanProjectById,
  getClientProjectKanban,
  createKanbanBoard,
  getKanbanBoard,
  getTasksByBoard,
  getKanbanBoardWithTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addTaskComment,
  uploadTaskAttachments,
  downloadTaskAttachment,
} from "./kanbanService.js";

export {
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "./userProfileService.js";
