"use client";

const BoardToolbar = ({
  filters,
  assignees,
  onFilterChange,
  activities,
}) => {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_30px_rgba(15,23,42,0.06)]">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            placeholder="Search task title or assignee"
            className="h-11 rounded-2xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:col-span-2"
          />
          <select
            value={filters.assignee}
            onChange={(e) => onFilterChange("assignee", e.target.value)}
            className="h-11 rounded-2xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Assignees</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.name}>
                {assignee.name}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="h-11 rounded-2xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="Review">Review</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange("priority", e.target.value)}
            className="h-11 rounded-2xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_30px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Notifications
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Latest task changes across this board
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {activities.length}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {activities.length ? (
            activities.slice(0, 4).map((activity) => (
              <div
                key={activity.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <p className="text-sm text-slate-700">{activity.message}</p>
                <p className="mt-1 text-xs text-slate-400">{activity.time}</p>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-400">
              No updates yet. Task changes and approvals will appear here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardToolbar;