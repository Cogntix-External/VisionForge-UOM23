import React from 'react';
import { Icons } from '../constants';

const Dashboard = () => {
  return (
    <div className="space-y-10 -mt-6 relative z-10 px-4 pb-10">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Total Projects" value="4" icon={<Icons.Projects />} color="from-blue-500 to-blue-600" />
        <StatCard title="Requirements" value="24" icon={<Icons.Documents />} color="from-purple-500 to-purple-600" />
        <StatCard title="Active CRs" value="3" icon={<Icons.ChangeRequests />} color="from-amber-500 to-amber-600" />
        <StatCard title="Kanban Tasks" value="156" icon={<Icons.Kanban />} color="from-emerald-500 to-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main List Adaptation */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-10 shadow-xl border border-gray-100">
           <div className="flex justify-between items-center mb-8">
             <h3 className="text-2xl font-bold text-gray-900">Ongoing Activity</h3>
             <button className="text-[#7c3aed] font-bold hover:underline">View All</button>
           </div>
           <div className="space-y-6">
              <ActivityItem title="PRD v2.1 Uploaded" desc="E-commerce Platform document update" time="2h ago" />
              <ActivityItem title="Change Request Approved" desc="Budget for CR-2025-001 finalized" time="5h ago" />
              <ActivityItem title="UI/UX Milestone" desc="Dashboard wireframes signed off" time="1d ago" />
              <ActivityItem title="New Task Added" desc="User management module drafted" time="2d ago" />
           </div>
        </div>

        {/* Project Health Section */}
        <div className="bg-white rounded-[32px] p-10 shadow-xl border border-gray-100 flex flex-col">
           <h3 className="text-2xl font-bold text-gray-900 mb-8">Project Health</h3>
           <div className="space-y-8 flex-1">
              <HealthItem name="SmartCore" progress={85} />
              <HealthItem name="AppNest" progress={45} />
              <HealthItem name="WebNexus" progress={62} />
              <HealthItem name="SecureGate" progress={12} />
           </div>
           <button className="w-full mt-10 py-4 bg-[#7c3aed] text-white font-bold rounded-2xl hover:bg-[#6d28d9] transition-all shadow-lg shadow-purple-200">
              Download Full Report
           </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color, icon }) => (
  <div className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-100 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-5 -mr-10 -mt-10 rounded-full transition-transform group-hover:scale-110`} />
    <div className="flex justify-between items-start relative">
      <div>
        <p className="text-gray-500 text-lg font-semibold">{title}</p>
        <p className="text-4xl font-extrabold mt-2 text-gray-900">{value}</p>
      </div>
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

const ActivityItem = ({ title, desc, time }) => (
  <div className="flex items-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all cursor-pointer">
    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mr-6">
      <Icons.Documents />
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-gray-900 text-lg">{title}</h4>
      <p className="text-gray-500 font-medium">{desc}</p>
    </div>
    <span className="text-gray-400 font-bold ml-6 whitespace-nowrap">{time}</span>
  </div>
);

const HealthItem = ({ name, progress }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <span className="font-bold text-gray-700 text-lg">{name}</span>
      <span className="font-extrabold text-[#7c3aed] text-lg">{progress}%</span>
    </div>
    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
      <div className="bg-gradient-to-r from-[#7c3aed] to-[#c084fc] h-full rounded-full" style={{width: `${progress}%`}} />
    </div>
  </div>
);

export default Dashboard;
