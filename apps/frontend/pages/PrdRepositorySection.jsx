"use client";

import React from "react";
import { FileEdit, FileText, History, Plus, Search } from "lucide-react";
import { cn } from "../utils/cn.js";

export default function PrdRepositorySection({ prdList, onCreate, onReview }) {
  const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 flex-1 min-w-[200px]">
      <div className={cn("p-3 rounded-2xl", color)}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-6 items-center">
        <StatCard label="Total PRDs" value="55" icon={FileText} color="bg-green-500" />
        <StatCard
          label="PRDs in review"
          value="20"
          icon={FileEdit}
          color="bg-orange-400"
        />
        <StatCard
          label="Avg. Review Time"
          value="4s"
          icon={History}
          color="bg-blue-400"
        />
        <button
          onClick={onCreate}
          className="bg-[#000080] text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus size={20} />
          Create New PRD
        </button>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <div className="relative mb-8">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            size={20}
          />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[#F8F9FE] border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#5D57A3]/20 transition-all"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-sm uppercase tracking-wider border-b border-gray-50">
                <th className="pb-4 font-semibold px-4">PID</th>
                <th className="pb-4 font-semibold px-4">Title</th>
                <th className="pb-4 font-semibold px-4">Status</th>
                <th className="pb-4 font-semibold px-4">Created Date</th>
                <th className="pb-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {prdList.map((prd) => (
                <tr key={prd.pid} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-6 px-4 font-bold text-gray-700">{prd.pid}</td>
                  <td className="py-6 px-4 font-bold text-gray-800 max-w-xs">
                    {prd.title}
                  </td>
                  <td className="py-6 px-4">
                    <span className="font-medium text-gray-800">{prd.status}</span>
                  </td>
                  <td className="py-6 px-4 text-gray-500 font-medium">
                    {prd.createdDate || prd.lastModified}
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex gap-3 justify-center">
                      <button className="bg-[#A39ED1] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#8e88c7] transition-colors">
                        View
                      </button>
                      <button
                        onClick={() => onReview(prd)}
                        className="bg-[#B2EBF2] text-[#00838F] px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#80DEEA] transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50">
            &lt;
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#5D57A3] text-white">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">
            4
          </button>
          <span className="flex items-center text-gray-400 px-1">...</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">
            40
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50">
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
