"use client";

import React from "react";

export default function AuditTrailSection({ auditRequests, onOpenReview, onShowVersionHistory }) {
  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <select className="bg-white border-none rounded-xl px-4 py-3 text-sm font-semibold shadow-sm focus:ring-2 focus:ring-[#5D57A3]/20">
          <option>Project onboarding flow: Newest</option>
        </select>
        <select className="bg-white border-none rounded-xl px-4 py-3 text-sm font-semibold shadow-sm focus:ring-2 focus:ring-[#5D57A3]/20">
          <option>Sort by date: Newest</option>
        </select>
        <select className="bg-white border-none rounded-xl px-4 py-3 text-sm font-semibold shadow-sm focus:ring-2 focus:ring-[#5D57A3]/20">
          <option>Sort by name: Newest</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onShowVersionHistory}
          className="bg-[#1A1A40] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg"
        >
          Document Version History
        </button>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Change Request Review</h2>
          <select className="bg-[#F8F9FE] border-none rounded-lg px-4 py-2 text-xs font-semibold">
            <option>Short by: Newest</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-300 text-xs uppercase tracking-wider">
                <th className="pb-4 font-semibold px-4">PID</th>
                <th className="pb-4 font-semibold px-4">CR ID</th>
                <th className="pb-4 font-semibold px-4">Requester</th>
                <th className="pb-4 font-semibold px-4 text-center">Date submitted</th>
                <th className="pb-4 font-semibold text-center">Status</th>
                <th className="pb-4 font-semibold text-center">Proposed change summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {auditRequests.map((item) => (
                <tr key={item.crid} className="group">
                  <td className="py-6 px-4 font-bold text-gray-600 text-sm">{item.pid}</td>
                  <td className="py-6 px-4 font-bold text-gray-700 text-sm">{item.crid}</td>
                  <td className="py-6 px-4 font-bold text-gray-800 text-sm">{item.requester}</td>
                  <td className="py-6 px-4 text-gray-500 font-medium text-sm text-center">
                    {item.date}
                  </td>
                  <td className="py-6 px-4 text-center">
                    <span className="font-bold text-sm text-gray-800">{item.status}</span>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={onShowVersionHistory}
                        className="border border-[#B2EBF2] text-gray-400 px-6 py-2 rounded-lg text-xs font-semibold hover:bg-cyan-50 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onOpenReview(item)}
                        className="border border-[#B2EBF2] text-teal-600 px-6 py-2 rounded-lg text-xs font-semibold hover:bg-cyan-50 transition-colors"
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
