"use client";

import React from "react";
import { cn } from "../utils/cn.js";

export default function VersionHistorySection({ versions }) {
  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Version History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-sm uppercase tracking-wider border-b border-gray-50">
                <th className="pb-6 px-4">Version</th>
                <th className="pb-6 px-4">Date</th>
                <th className="pb-6 px-4">Description</th>
                <th className="pb-6 px-4">Author</th>
                <th className="pb-6 px-4">Reviewer</th>
                <th className="pb-6 px-4">Approval</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((version, idx) => (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="py-4 px-4 font-semibold text-gray-700">
                    {version.version}
                  </td>
                  <td className="py-4 px-4 text-gray-600">{version.date}</td>
                  <td className="py-4 px-4 text-gray-600">
                    {version.description}
                  </td>
                  <td className="py-4 px-4 text-gray-600">{version.author}</td>
                  <td className="py-4 px-4 text-gray-600">{version.reviewer}</td>
                  <td className="py-4 px-4">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        version.approval === "Approved"
                          ? "text-emerald-600"
                          : "text-amber-600"
                      )}
                    >
                      {version.approval}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
