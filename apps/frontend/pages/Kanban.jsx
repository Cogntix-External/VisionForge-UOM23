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
      const data = await getClientProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Projects could not be loaded.");
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleProjectChange = async (e) => {
    const projectId = e.target.value;
    setSelectedProjectId(projectId);
    setBoard(null);

    if (!projectId) return;

    try {
      setLoadingBoard(true);
      const data = await getClientProjectKanban(projectId);
      setBoard(data);
    } catch (err) {
      setError("Kanban board could not be loaded.");
    } finally {
      setLoadingBoard(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-8">
     

        {/* 🔥 PROJECT SELECT */}
        <div className="rounded-3xl bg-white p-6 shadow-md border border-slate-100">
          <label className="block text-lg font-bold text-slate-800 mb-3">
            Select Project
          </label>

          <select
            value={selectedProjectId}
            onChange={handleProjectChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">Choose a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name || project.title}
              </option>
            ))}
          </select>

          {loadingProjects && (
            <p className="mt-3 text-sm text-slate-500">
              Loading projects...
            </p>
          )}
        

        {/* ERROR */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-600 font-semibold">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loadingBoard && (
          <div className="bg-white p-8 rounded-3xl text-center shadow">
            <p className="text-slate-500 font-semibold">
              Loading board...
            </p>
          </div>
        )}

        {/* BOARD */}
        {!loadingBoard && selectedProjectId && board && (
          <>
            <div className="rounded-3xl bg-white p-6 shadow border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedProject?.name}
              </h2>
              <p className="text-sm text-slate-500">
                Project Kanban overview
              </p>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4">
              {(board.columns || []).map((column) => (
                <div
                  key={column.id}
                  className="min-w-[280px] bg-white rounded-2xl shadow border border-slate-100 p-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">
                      {column.title}
                    </h3>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded-full font-bold">
                      {column.tasks?.length || 0}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {column.tasks?.length > 0 ? (
                      column.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition"
                        >
                          <div className="flex justify-between">
                            <h4 className="font-semibold text-slate-900">
                              {task.title}
                            </h4>

                            {task.priority && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-bold ${
                                  priorityStyles[task.priority]
                                }`}
                              >
                                {task.priority}
                              </span>
                            )}
                          </div>

                          {task.description && (
                            <p className="text-sm text-slate-600 mt-2">
                              {task.description}
                            </p>
                          )}

                          {task.assignedTo && (
                            <p className="text-xs text-slate-400 mt-3">
                              {task.assignedTo}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-sm text-slate-400 py-6 border border-dashed rounded-xl">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* EMPTY */}
        {!selectedProjectId && (
          <div className="rounded-3xl bg-white p-10 text-center shadow">
            <p className="text-slate-400 font-semibold">
              Select a project to view board
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Kanban;