"use client";

import React, { useEffect, useState } from "react";
import { getClientProjects, getClientProjectKanban } from "../services/api";

const priorityStyles = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const Kanban = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [board, setBoard] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      setError("");

      const data = await getClientProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Projects could not be loaded.");
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleProjectChange = async (e) => {
    const projectId = e.target.value;
    setSelectedProjectId(projectId);
    setBoard(null);
    setError("");

    if (!projectId) return;

    try {
      setLoadingBoard(true);
      const data = await getClientProjectKanban(projectId);
      setBoard(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Kanban board could not be loaded.");
    } finally {
      setLoadingBoard(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-[#f4f5f7] px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[28px] bg-white p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
          <p className="mt-2 text-gray-500">
            Select a project to view its kanban board.
          </p>
        </div>

        <div className="rounded-[28px] bg-white p-8 shadow-xl">
          <label className="mb-3 block text-lg font-bold text-gray-800">
            Select Project
          </label>

          <select
            value={selectedProjectId}
            onChange={handleProjectChange}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-lg outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
          >
            <option value="">-- Choose a project --</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name || project.title || project.id}
              </option>
            ))}
          </select>

          {loadingProjects && (
            <p className="mt-4 text-sm font-semibold text-gray-500">
              Loading projects...
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-600 font-semibold">
            {error}
          </div>
        )}

        {loadingBoard && (
          <div className="rounded-[28px] bg-white p-8 text-center shadow-xl">
            <p className="text-lg font-semibold text-gray-500">
              Loading kanban board...
            </p>
          </div>
        )}

        {!loadingBoard && selectedProjectId && board && (
          <div className="space-y-6">
            <div className="rounded-[28px] bg-white p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedProject?.name || "Selected Project"}
              </h2>
              <p className="mt-1 text-gray-500">
                View-only kanban board for this project.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {(board.columns || []).map((column) => (
                <div
                  key={column.id}
                  className="rounded-[24px] bg-white p-5 shadow-xl"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">
                      {column.title}
                    </h3>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-600">
                      {column.tasks?.length || 0}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {column.tasks && column.tasks.length > 0 ? (
                      column.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-bold text-gray-900">
                              {task.title}
                            </h4>

                            {task.priority && (
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-bold ${
                                  priorityStyles[task.priority] ||
                                  "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {task.priority}
                              </span>
                            )}
                          </div>

                          {task.description && (
                            <p className="mt-2 text-sm leading-relaxed text-gray-600">
                              {task.description}
                            </p>
                          )}

                          {task.assignedTo && (
                            <p className="mt-3 text-xs font-semibold text-gray-400">
                              Assigned to: {task.assignedTo}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm font-semibold text-gray-400">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!selectedProjectId && !loadingBoard && (
          <div className="rounded-[28px] bg-white p-10 text-center shadow-xl">
            <p className="text-lg font-semibold text-gray-400">
              Please select a project to view kanban board.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Kanban;