import {
  Bell,
  CheckCircle2,
  FileEdit,
  FileText,
  XCircle,
} from "lucide-react";

/**
 *  Notification UI Config
 * Central place for all notification styles
 */
const TYPE_META = {
  NEW_PROPOSAL: {
    label: "New Proposal",
    Icon: FileText,
    panelClass: "bg-blue-50 border-blue-200",
    unreadDotClass: "bg-blue-500",
    toastClass: "border-blue-200",
    iconClass: "text-blue-600",
  },

  PROPOSAL_ACCEPTED: {
    label: "Proposal Accepted",
    Icon: CheckCircle2,
    panelClass: "bg-emerald-50 border-emerald-200",
    unreadDotClass: "bg-emerald-500",
    toastClass: "border-emerald-200",
    iconClass: "text-emerald-600",
  },

  PROPOSAL_REJECTED: {
    label: "Proposal Rejected",
    Icon: XCircle,
    panelClass: "bg-rose-50 border-rose-200",
    unreadDotClass: "bg-rose-500",
    toastClass: "border-rose-200",
    iconClass: "text-rose-600",
  },

  NEW_CHANGE_REQUEST: {
    label: "New Change Request",
    Icon: FileEdit,
    panelClass: "bg-amber-50 border-amber-200",
    unreadDotClass: "bg-amber-500",
    toastClass: "border-amber-200",
    iconClass: "text-amber-600",
  },

  CHANGE_REQUEST_ACCEPTED: {
    label: "Change Request Accepted",
    Icon: CheckCircle2,
    panelClass: "bg-emerald-50 border-emerald-200",
    unreadDotClass: "bg-emerald-500",
    toastClass: "border-emerald-200",
    iconClass: "text-emerald-600",
  },

  CHANGE_REQUEST_REJECTED: {
    label: "Change Request Rejected",
    Icon: XCircle,
    panelClass: "bg-rose-50 border-rose-200",
    unreadDotClass: "bg-rose-500",
    toastClass: "border-rose-200",
    iconClass: "text-rose-600",
  },

  PRD_UPLOADED: {
    label: "PRD Uploaded",
    Icon: FileText,
    panelClass: "bg-indigo-50 border-indigo-200",
    unreadDotClass: "bg-indigo-500",
    toastClass: "border-indigo-200",
    iconClass: "text-indigo-600",
  },
};

/**
 *  Default fallback (VERY IMPORTANT)
 */
const DEFAULT_META = {
  label: "Notification",
  Icon: Bell,
  panelClass: "bg-slate-50 border-slate-200",
  unreadDotClass: "bg-slate-500",
  toastClass: "border-slate-200",
  iconClass: "text-slate-600",
};

/**
 *  MAIN FUNCTION
 */
export function getNotificationMeta(type) {
  if (!type) return DEFAULT_META;

  const key = String(type).trim().toUpperCase();

  return TYPE_META[key] || DEFAULT_META;
}