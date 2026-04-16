"use client";

import { Calendar, MessageSquare, MoreHorizontal, Paperclip, Send } from "lucide-react";

const TaskCard = ({
  card,
  columnId,
  isCompleted,
  isPrivilegedUser,
  onOpenComments,
  onOpenAttachments,
  onOpenMenu,
  onSendToClient,
}) => {
  return (
    <div className="kanban-card rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(15,23,42,0.10)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${card.statusTone}`}>
              {card.statusLabel}
            </span>
            {!isCompleted && (
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${card.tagColor}`}>
                {card.tag}
              </span>
            )}
          </div>
          <h4 className="mt-3 text-[15px] font-semibold leading-6 text-slate-900">
            {card.title}
          </h4>
        </div>

        <button
          type="button"
          className="menu-btn rounded-full p-2 text-slate-400 transition hover:bg-slate-100"
          onClick={onOpenMenu}
          title="More"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-semibold ${card.assigneeAccent}`}
        >
          {card.assigneeInitials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">{card.assignee}</p>
          <p className="truncate text-xs text-slate-500">{card.assigneeRole}</p>
        </div>
      </div>

      {isCompleted && (
        <div className="mt-4 rounded-2xl bg-emerald-50 px-3 py-3">
          <p className="text-xs font-medium text-emerald-700">
            Completed by {card.completedBy}
          </p>
          <p className="mt-1 text-xs text-emerald-700/80">{card.completedOn}</p>
          {isPrivilegedUser && !card.clientNotified && (
            <button
              type="button"
              onClick={onSendToClient}
              className="mt-3 inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1.5 text-[11px] font-semibold text-blue-700 transition hover:bg-blue-200"
            >
              <Send className="h-3.5 w-3.5" />
              Send to Client
            </button>
          )}
        </div>
      )}

      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{card.dateLabel || "No due date"}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenComments}
              className="flex items-center gap-1 transition hover:text-blue-600"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{card.comments}</span>
            </button>
            <button
              type="button"
              onClick={onOpenAttachments}
              className="flex items-center gap-1 transition hover:text-blue-600"
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span>{card.attachments}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;