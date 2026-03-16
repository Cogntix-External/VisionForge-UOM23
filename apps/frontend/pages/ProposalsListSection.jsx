"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default function ProposalsListSection({ projects, onCreate, onSelect }) {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Proposals</h1>
        <button
          onClick={onCreate}
          className="px-6 py-3 bg-[#000066] text-white rounded hover:bg-blue-900 font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Project Proposal
        </button>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-6">
          All Created Projects Proposals
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-slate-400 uppercase border-b border-slate-200">
                <th className="pb-4 font-bold">PID</th>
                <th className="pb-4 font-bold">Proposal name</th>
                <th className="pb-4 font-bold">Client Name</th>
                <th className="pb-4 font-bold">Budget</th>
                <th className="pb-4 font-bold">Duration</th>
                <th className="pb-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((proj) => (
                <tr
                  key={proj.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="py-4 font-bold text-slate-700">{proj.id}</td>
                  <td className="py-4 text-slate-600">{proj.title}</td>
                  <td className="py-4 text-slate-600">
                    {proj.client || "John Doe"}
                  </td>
                  <td className="py-4 text-slate-600">{proj.budget}</td>
                  <td className="py-4 text-slate-600">{proj.duration}</td>
                  <td className="py-4">
                    <button
                      onClick={() => onSelect(proj)}
                      className="text-blue-600 font-bold hover:text-blue-800"
                    >
                      More details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 flex justify-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 text-slate-400 hover:bg-slate-200">
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded bg-[#5D57C9] text-white">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-50 text-slate-400">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-50 text-slate-400">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-50 text-slate-400">
            4
          </button>
          <span className="px-2 self-center text-slate-400">...</span>
          <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-50 text-slate-400">
            40
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 text-slate-400 hover:bg-slate-200">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
