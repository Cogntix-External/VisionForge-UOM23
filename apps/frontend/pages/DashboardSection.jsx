"use client";

import React from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  LayoutDashboard,
  Plus,
  Search
} from "lucide-react";
import { cn } from "../utils/cn.js";

export default function DashboardSection({ projects, onCreate }) {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome to your Dashboard!
        </h1>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">Total Projects</p>
            <p className="text-2xl font-bold">125</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-purple-700" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">
              Pending Approvals
            </p>
            <p className="text-2xl font-bold">20</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">
              Task Due This Week
            </p>
            <p className="text-2xl font-bold text-slate-700">
              4 <span className="text-sm font-normal">days</span>
            </p>
          </div>
        </div>
        <button
          onClick={onCreate}
          className="bg-[#000066] text-white p-6 rounded-3xl shadow-lg hover:bg-blue-900 transition-all flex items-center justify-center font-bold text-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Project Proposal
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-teal-800">
            Recent Project Activity
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Sort by :</span>
            <span className="font-bold text-slate-600">Newest</span>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-300 text-xs uppercase tracking-wider border-b border-slate-50">
              <th className="pb-4 font-bold">Project Name</th>
              <th className="pb-4 font-bold">Status</th>
              <th className="pb-4 font-bold">Owner</th>
              <th className="pb-4 font-bold">Last Updated</th>
              <th className="pb-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {projects.map((proj) => (
              <tr key={proj.id} className="border-b border-slate-50 last:border-0">
                <td className="py-4 font-medium text-slate-700">{proj.title}</td>
                <td className="py-4">
                  <span
                    className={cn(
                      "font-bold",
                      proj.status === "Accepted" && "text-green-500",
                      proj.status === "Completed" && "text-slate-800",
                      proj.status === "Rejected" && "text-red-500"
                    )}
                  >
                    {proj.status}
                  </span>
                </td>
                <td className="py-4 text-slate-600">{proj.owner}</td>
                <td className="py-4 text-slate-400">{proj.lastUpdated}</td>
                <td className="py-4">
                  <span
                    className={cn(
                      "font-bold",
                      proj.state === "Active" && "text-green-600",
                      proj.state === "Draft" && "text-teal-500",
                      proj.state === "Inactive" && "text-red-500"
                    )}
                  >
                    {proj.state}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end gap-2">
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
          <span className="px-2 self-center">...</span>
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
