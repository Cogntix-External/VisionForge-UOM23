"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { projects as allProjects } from "@/lib/projects";

const ITEMS_PER_PAGE = 4;

const KanbanOverviewPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return allProjects;

    // allow searching "001A" to match "001 A"
    const termNoSpace = term.replace(/\s+/g, "");

    return allProjects.filter((project) => {
      const pid = (project.pid || "").toLowerCase();
      const pidNoSpace = pid.replace(/\s+/g, "");
      const name = (project.name || "").toLowerCase();
      const desc = (project.description || "").toLowerCase();

      return (
        pid.includes(term) ||
        pidNoSpace.includes(termNoSpace) ||
        name.includes(term) ||
        desc.includes(term)
      );
    });
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handleView = (project) => {
    router.push(`/kanban-board/${encodeURIComponent(project.pid)}`);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i += 1) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 3; i <= totalPages; i += 1) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i += 1) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by PID or proposal name"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 bg-[var(--surface-muted)] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border-soft)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--surface-muted)] border-b border-[var(--border-soft)]">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    PID
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Projects
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    For more
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginatedProjects.map((project) => (
                  <tr
                    key={project.pid}
                    className="hover:bg-[var(--surface-muted)] transition-colors"
                  >
                    <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                      {project.pid}
                    </td>

                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {project.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {project.description}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleView(project)}
                        className="inline-flex items-center px-4 py-2 bg-[var(--accent-purple-200)] hover:bg-[var(--accent-purple)] text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedProjects.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500">
                No projects found matching your search.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--border-soft)] bg-[var(--surface-muted)]">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-[var(--surface)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {getPageNumbers().map((page, index) => (
              <button
                key={`${page}-${index}`}
                onClick={() =>
                  typeof page === "number" && handlePageChange(page)
                }
                disabled={page === "..."}
                className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-[var(--primary)] text-white"
                    : page === "..."
                      ? "cursor-default text-gray-400"
                      : "hover:bg-[var(--surface)] text-gray-600"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-[var(--surface)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanOverviewPage;
