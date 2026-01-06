
import React, { useState } from 'react';
import { Icons } from '../constants';
import { DocumentRecord } from '../types';

const MOCK_DOCS: DocumentRecord[] = [
  { id: '1', projectName: 'NexaFlow', title: 'PRD', version: '3.0', startDate: '15/01/2024' },
  { id: '2', projectName: 'SmartCore', title: 'CR', version: '2.5', startDate: 'Mar 3, 2025' },
  { id: '3', projectName: 'AppNest', title: 'CR', version: '1.0', startDate: 'Jan 14, 2025' },
  { id: '4', projectName: 'SecureGate', title: 'CR', version: '1.5', startDate: 'Aug 28, 2025' },
  { id: '5', projectName: 'AIFlow', title: 'PRD', version: '2.0', startDate: 'Jan 15, 2025' },
];

const Documents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Documents');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);

  const filterOptions = [
    'All Documents',
    'Type: PRD',
    'Type: CR',
    'Version: v3.0+',
    'Recent Uploads'
  ];

  const filteredDocs = MOCK_DOCS.filter(doc => {
    const matchesSearch = doc.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = true;

    if (activeFilter === 'Type: PRD') matchesFilter = doc.title === 'PRD';
    else if (activeFilter === 'Type: CR') matchesFilter = doc.title === 'CR';
    else if (activeFilter === 'Version: v3.0+') matchesFilter = parseFloat(doc.version) >= 3.0;
    else if (activeFilter === 'Recent Uploads') matchesFilter = doc.startDate.includes('2025') || doc.startDate.includes('Mar');

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 -mt-6 relative z-10 px-4 pb-10">
      <div className="flex items-center gap-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400">
            <Icons.Search />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-6 py-4 border border-transparent rounded-2xl bg-[#e5e7eb]/60 text-gray-900 placeholder-gray-500 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-sm"
            placeholder="Search documents by project or title...."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center space-x-4 px-8 py-4 bg-[#e5e7eb]/60 text-gray-900 font-bold rounded-2xl hover:bg-gray-200 transition-all shadow-sm min-w-[220px] justify-between"
          >
            <div className="flex items-center space-x-3">
              <Icons.Filter />
              <span>{activeFilter}</span>
            </div>
            <svg className={`w-5 h-5 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showFilterDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setActiveFilter(option);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-6 py-3 text-lg font-bold hover:bg-gray-50 transition-colors ${activeFilter === option ? 'text-[#7c3aed] bg-purple-50' : 'text-gray-600'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative min-h-[400px]">
        <table className="min-w-full">
          <thead className="bg-[#f9fafb]">
            <tr>
              <th className="px-10 py-8 text-left text-xl font-medium text-gray-900">Project name</th>
              <th className="px-10 py-8 text-left text-xl font-medium text-gray-900">Title</th>
              <th className="px-10 py-8 text-left text-xl font-medium text-gray-900 text-center">Version</th>
              <th className="px-10 py-8 text-left text-xl font-medium text-gray-900">Start Date</th>
              <th className="px-10 py-8 text-center text-xl font-medium text-gray-900">View</th>
              <th className="px-10 py-8 text-center text-xl font-medium text-gray-900">Download</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-10 py-10 whitespace-nowrap">
                  <span className="text-gray-600 text-lg font-medium">{doc.projectName}</span>
                </td>
                <td className="px-10 py-10 whitespace-nowrap">
                  <span className="text-gray-900 text-lg font-bold">{doc.title}</span>
                </td>
                <td className="px-10 py-10 whitespace-nowrap text-center">
                  <span className="text-gray-500 text-lg font-medium">{doc.version}</span>
                </td>
                <td className="px-10 py-10 whitespace-nowrap">
                  <span className="text-gray-900 text-lg font-bold">{doc.startDate}</span>
                </td>
                <td className="px-10 py-10 whitespace-nowrap text-center">
                  <button 
                    onClick={() => setSelectedDoc(doc)}
                    className="px-10 py-2.5 bg-[#4ade80] text-white text-lg font-bold rounded-full hover:bg-green-500 transition-all shadow-sm"
                  >
                    view
                  </button>
                </td>
                <td className="px-10 py-10 whitespace-nowrap text-center">
                  <button className="px-10 py-2.5 bg-[#dbeafe] text-[#1e40af] text-lg font-bold rounded-full border-[2.5px] border-[#1e40af]/30 hover:border-[#1e40af] hover:bg-[#bfdbfe] transition-all shadow-sm">
                    Download
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-10 py-32 text-center text-2xl font-bold text-gray-400">
                  No documents found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedDoc && (
        <div 
          onClick={() => setSelectedDoc(null)}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 relative cursor-default"
          >
            <button onClick={() => setSelectedDoc(null)} className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full transition-all">
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l18 18" /></svg>
            </button>
            <div className="p-12">
               <h3 className="text-3xl font-black text-gray-900 mb-2">{selectedDoc.projectName} - {selectedDoc.title}</h3>
               <p className="text-xl font-bold text-gray-500 mb-10">A Change request for implementing new authentication system</p>
               
               <div className="bg-[#e5e7eb]/80 rounded-[32px] p-10 flex justify-between items-center mb-10 border border-gray-200 shadow-sm">
                  <div className="text-center flex-1 border-r border-gray-300">
                    <p className="text-lg font-black text-gray-900">Version</p>
                    <p className="text-xl font-bold text-gray-700">{selectedDoc.version}</p>
                  </div>
                  <div className="text-center flex-1 border-r border-gray-300 px-6">
                    <p className="text-lg font-black text-gray-900">Start date</p>
                    <p className="text-xl font-bold text-gray-700">{selectedDoc.startDate}</p>
                  </div>
                  <div className="text-center flex-1 px-6">
                    <p className="text-lg font-black text-gray-900">Project</p>
                    <p className="text-xl font-bold text-gray-700">{selectedDoc.projectName}</p>
                  </div>
               </div>

               <div className="space-y-6 text-xl text-gray-900 leading-relaxed font-medium">
                 <p>This change request outlines the requirements for implementing new OAuth 2.0 based authentication system. The current basic authentication needs to be replaced with a more secure and flexible solution.</p>
                 <div>
                   <p className="font-bold mb-2">Key Requirements:</p>
                   <ul className="list-decimal list-inside space-y-2">
                     <li>OAuth 2.0 implementation</li>
                     <li>Support for Google and Microsoft providers</li>
                     <li>JWT token management</li>
                     <li>Refresh token handling</li>
                     <li>Session management improvements</li>
                   </ul>
                 </div>
                 <p>Timeline: 6 weeks</p>
                 <p>Priority: High</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
