import React from 'react';

const MOCK_TASKS = [
  { id: '1', crId: 'CR-001', title: 'Implement JWT Auth', column: 'In Progress', priority: 'High' },
  { id: '2', crId: 'CR-001', title: 'Database Schema Update', column: 'Done', priority: 'Medium' },
  { id: '3', crId: 'CR-002', title: 'Review API Documentation', column: 'Backlog', priority: 'Low' },
  { id: '4', crId: 'CR-003', title: 'Frontend Dashboard UI', column: 'Review', priority: 'High' },
];

const Kanban = () => {
  const columns = ['Backlog', 'In Progress', 'Review', 'Done'];

  return (
    <div className="h-full flex flex-col">
      <div className="flex space-x-6 overflow-x-auto pb-6 flex-1">
        {columns.map((col) => (
          <div key={col} className="bg-gray-100/50 rounded-2xl w-80 shrink-0 flex flex-col p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">{col}</h3>
              <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-gray-500 shadow-sm">
                {MOCK_TASKS.filter(t => t.column === col).length}
              </span>
            </div>
            
            <div className="space-y-4 flex-1 overflow-y-auto">
              {MOCK_TASKS.filter(t => t.column === col).map((task) => (
                <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-grab">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {task.crId}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      task.priority === 'High' ? 'bg-red-50 text-red-600' :
                      task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 leading-snug">{task.title}</p>
                </div>
              ))}
              
              <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 text-sm font-medium hover:border-indigo-400 hover:text-indigo-400 transition-colors">
                + Add Task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Kanban;
