import React, { useState } from "react";
const MOCK_TASKS = [
  {
    id: "1",
    crId: "CR-001",
    title: "Implement JWT Auth",
    column: "In Progress",
    priority: "High",
    description: "Set up JWT authentication",
    assignee: "John Doe",
  },
  {
    id: "2",
    crId: "CR-001",
    title: "Database Schema Update",
    column: "Done",
    priority: "Medium",
    description: "Update DB schema for auth",
    assignee: "Jane Smith",
  },
  {
    id: "3",
    crId: "CR-002",
    title: "Review API Documentation",
    column: "Backlog",
    priority: "Low",
    description: "Review and update API docs",
    assignee: "Unassigned",
  },
  {
    id: "4",
    crId: "CR-003",
    title: "Frontend Dashboard UI",
    column: "Review",
    priority: "High",
    description: "Build responsive dashboard",
    assignee: "Mike Johnson",
  },
];

const TaskViewerModal = ({ task, onClose }) => {
  if (!task) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-title"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[90vw] lg:max-w-2xl max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex justify-between items-center">
          <h2 id="task-title" className="text-white font-bold text-2xl">
            {task.title}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-xl">
              <p className="text-gray-600 text-sm font-bold">CR ID</p>
              <p className="text-lg font-bold text-purple-600 mt-1">
                {task.crId}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl">
              <p className="text-gray-600 text-sm font-bold">Priority</p>
              <p
                className={`text-lg font-bold mt-1 ${task.priority === "High" ? "text-red-600" : task.priority === "Medium" ? "text-yellow-600" : "text-green-600"}`}
              >
                {task.priority}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl">
              <p className="text-gray-600 text-sm font-bold">Status</p>
              <p className="text-lg font-bold text-blue-600 mt-1">
                {task.column}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl">
              <p className="text-gray-600 text-sm font-bold">Assignee</p>
              <p className="text-lg font-bold text-gray-700 mt-1">
                {task.assignee}
              </p>
            </div>
          </div>
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-gray-700">{task.description}</p>
          </div>
          <div className="flex gap-4">
            <button className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition">
              ✓ Mark Done
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddTaskModal = ({ column, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    crId: "",
    title: "",
    description: "",
    priority: "Medium",
    assignee: "",
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return;
    onAdd({ ...formData, column });
    onClose();
  };
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-task-title"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[90vw] lg:max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
          <h2 id="add-task-title" className="text-white font-bold text-2xl">
            Add Task to {column}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label
              htmlFor="task-title"
              className="block text-gray-700 font-bold mb-2"
            >
              Task Title *
            </label>
            <input
              id="task-title"
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="e.g., Implement feature"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="cr-id"
                className="block text-gray-700 font-bold mb-2"
              >
                CR ID
              </label>
              <input
                id="cr-id"
                type="text"
                value={formData.crId}
                onChange={(e) =>
                  setFormData({ ...formData, crId: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="CR-001"
              />
            </div>
            <div>
              <label
                htmlFor="assignee"
                className="block text-gray-700 font-bold mb-2"
              >
                Assignee
              </label>
              <input
                id="assignee"
                type="text"
                value={formData.assignee}
                onChange={(e) =>
                  setFormData({ ...formData, assignee: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Name"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-gray-700 font-bold mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none min-h-24"
              placeholder="Task description..."
            />
          </div>
          <div>
            <label
              htmlFor="priority"
              className="block text-gray-700 font-bold mb-2"
            >
              Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition"
            >
              Add Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Kanban = () => {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeColumn, setActiveColumn] = useState(null);
  const columns = ["Backlog", "In Progress", "Review", "Done"];

  const handleAddTask = (newTask) => {
    setTasks([...tasks, { ...newTask, id: String(tasks.length + 1) }]);
  };

  const downloadKanban = () => {
    const content = `KANBAN BOARD EXPORT\n\n${columns
      .map(
        (col) =>
          `${col}:\n${tasks
            .filter((t) => t.column === col)
            .map((t) => `- ${t.title} (${t.crId}) [${t.priority}]`)
            .join("\n")}`,
      )
      .join("\n\n")}`;
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`,
    );
    element.setAttribute("download", "kanban-export.txt");
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 px-4">
        <h2 className="text-3xl font-black text-gray-900">
          Project Kanban Board
        </h2>
        <button
          onClick={downloadKanban}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
          aria-label="Export kanban board"
        >
          ⬇️ Export Board
        </button>
      </div>
      <div className="flex space-x-6 overflow-x-auto pb-6 flex-1 px-4">
        {columns.map((col) => (
          <div
            key={col}
            className="bg-gray-100/50 rounded-2xl w-72 xl:w-80 shrink-0 flex flex-col p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">
                {col}
              </h3>
              <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-gray-500 shadow-sm">
                {tasks.filter((t) => t.column === col).length}
              </span>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto">
              {tasks
                .filter((t) => t.column === col)
                .map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${task.title}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {task.crId}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          task.priority === "High"
                            ? "bg-red-50 text-red-600"
                            : task.priority === "Medium"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-green-50 text-green-600"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 leading-snug mb-2">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {task.assignee || "Unassigned"}
                    </p>
                  </div>
                ))}

              <button
                onClick={() => {
                  setShowAddModal(true);
                  setActiveColumn(col);
                }}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 text-sm font-medium hover:border-indigo-400 hover:text-indigo-400 transition-colors"
                aria-label={`Add new task to ${col}`}
              >
                + Add Task
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <TaskViewerModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
      {showAddModal && activeColumn && (
        <AddTaskModal
          column={activeColumn}
          onClose={() => {
            setShowAddModal(false);
            setActiveColumn(null);
          }}
          onAdd={handleAddTask}
        />
      )}
    </div>
  );
};

export default Kanban;
