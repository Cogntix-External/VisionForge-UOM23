
import React, { useState } from 'react';
import { Icons } from '../constants';
import { ChangeRequest, CRStatus } from '../types';

const MOCK_CRS: ChangeRequest[] = [
  { id: 'CR-2025-001', projectId: '1', projectName: 'SmartCore', title: 'Add dark mode', description: 'Enable theme switching', status: CRStatus.APPROVED, budget: 1500, timeline: '2 weeks', createdAt: 'Feb 15, 2025' },
  { id: 'CR-2025-002', projectId: '2', projectName: 'AppNest', title: 'Stripe Integration', description: 'Support multi-currency payments', status: CRStatus.PROPOSED, budget: 3000, timeline: '4 weeks', createdAt: 'Mar 01, 2025' },
  { id: 'CR-2025-003', projectId: '1', projectName: 'SmartCore', title: 'Social Auth', description: 'Add Google login', status: CRStatus.PENDING, createdAt: 'Mar 05, 2025' },
];

const ChangeRequests: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-8 -mt-6 relative z-10 px-4 pb-10">
      {/* Controls Bar */}
      <div className="flex justify-between items-center gap-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400">
            <Icons.Search />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-6 py-4 border border-transparent rounded-2xl bg-[#e5e7eb]/60 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-sm"
            placeholder="Search change requests...."
          />
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-4 px-10 py-4 bg-[#7c3aed] text-white font-bold rounded-2xl hover:bg-[#6d28d9] transition-all shadow-lg shadow-purple-200"
        >
          <span className="text-2xl leading-none">+</span>
          <span>Raise New CR</span>
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-[#f9fafb]">
            <tr>
              <th className="px-10 py-8 text-left text-xl font-medium text-gray-900">ID / Date</th>
              <th className="px-10 py-8 text-left text-xl font-medium text-gray-900">Title & Project</th>
              <th className="px-10 py-8 text-left text-xl font-medium text-gray-900">Status</th>
              <th className="px-10 py-8 text-right text-xl font-medium text-gray-900">Budget</th>
              <th className="px-10 py-8 text-center text-xl font-medium text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {MOCK_CRS.map((cr) => (
              <tr key={cr.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-10 py-10 whitespace-nowrap">
                   <div className="flex flex-col">
                      <span className="text-gray-900 text-lg font-bold">{cr.id}</span>
                      <span className="text-gray-400 text-sm font-bold">{cr.createdAt}</span>
                   </div>
                </td>
                <td className="px-10 py-10 whitespace-nowrap">
                   <div className="flex flex-col">
                      <span className="text-gray-900 text-lg font-bold">{cr.title}</span>
                      <span className="text-[#7c3aed] text-sm font-extrabold uppercase">{cr.projectName}</span>
                   </div>
                </td>
                <td className="px-10 py-10 whitespace-nowrap">
                   <span className={`px-6 py-2 rounded-full text-base font-bold ${
                    cr.status === CRStatus.APPROVED ? 'bg-green-100 text-green-700' :
                    cr.status === CRStatus.PROPOSED ? 'bg-blue-100 text-blue-700' :
                    cr.status === CRStatus.PENDING ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {cr.status}
                  </span>
                </td>
                <td className="px-10 py-10 whitespace-nowrap text-right">
                  <span className="text-gray-900 text-2xl font-black">${cr.budget?.toLocaleString() || '-'}</span>
                </td>
                <td className="px-10 py-10 whitespace-nowrap text-center">
                  <button className="px-10 py-2.5 bg-gray-900 text-white text-lg font-bold rounded-full hover:bg-gray-800 transition-all shadow-md">
                    view
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination bar consistent across all pages */}
        <div className="flex justify-center p-8 bg-white border-t border-gray-50">
          <div className="bg-[#111827] text-white rounded-full flex items-center px-6 py-3 shadow-2xl">
            <button className="p-2 hover:text-amber-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="mx-8 flex items-center space-x-2">
               <span className="text-lg font-bold tracking-widest px-2">1 / 3</span>
            </div>
            <button className="p-2 hover:text-amber-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Raise New CR Modal Refinement */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/60 backdrop-blur-md p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 cursor-default"
          >
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <div>
                 <h3 className="text-3xl font-black text-gray-900">New Requirement</h3>
                 <p className="text-gray-500 font-bold mt-1 text-lg">Modify existing project scope</p>
               </div>
               <button onClick={() => setShowModal(false)} className="bg-white p-3 rounded-full shadow-lg border border-gray-100 hover:scale-110 transition-transform">
                 <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l18 18" /></svg>
               </button>
            </div>
            <div className="p-12 space-y-10">
               <div className="grid grid-cols-2 gap-10">
                 <div>
                    <label className="block text-xl font-bold text-gray-900 mb-4">Project</label>
                    <select className="w-full px-6 py-5 bg-[#e5e7eb]/40 border-none rounded-2xl focus:ring-4 focus:ring-purple-200 text-lg font-bold">
                       <option>SmartCore</option>
                       <option>AppNest</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xl font-bold text-gray-900 mb-4">Title</label>
                    <input type="text" className="w-full px-6 py-5 bg-[#e5e7eb]/40 border-none rounded-2xl focus:ring-4 focus:ring-purple-200 text-lg font-bold" placeholder="e.g. Dark Mode Support" />
                 </div>
               </div>
               <div>
                  <label className="block text-xl font-bold text-gray-900 mb-4">Description</label>
                  <textarea rows={4} className="w-full px-6 py-5 bg-[#e5e7eb]/40 border-none rounded-2xl focus:ring-4 focus:ring-purple-200 text-lg font-bold" placeholder="Please detail the modifications required..."></textarea>
               </div>
               <button className="w-full py-6 bg-[#7c3aed] text-white text-2xl font-black rounded-[24px] hover:bg-[#6d28d9] transition-all shadow-2xl shadow-purple-300 transform active:scale-[0.98]">
                  Submit Requirement
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeRequests;
