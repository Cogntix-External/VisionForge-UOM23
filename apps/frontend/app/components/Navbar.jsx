/* eslint-disable react/prop-types */

"use client";

const pageMeta = {
  "/client/dashboard": {
    title: "Dashboard",
    subtitle: "Welcome back! Here is what is happening with your projects.",
  },
  "/client/projects": {
    title: "My projects",
    subtitle: "View and manage all your projects in one place",
  },
  "/client/documents": {
    title: "Documents",
    subtitle: "Access all project documents, PRDs, and change request files.",
  },
  "/company/dashboard": {
    title: "Company Dashboard",
    subtitle: "Overview of company-level execution and delivery.",
  },
  "/company/kanban": {
    title: "Kanban",
    subtitle: "Visual progress of your change requests and tasks.",
  },
  "/company/proposals": {
    title: "Project Proposals",
    subtitle: "Review and manage proposal decisions.",
  },
};

export default function Navbar({ pathname }) {
  const current = pageMeta[pathname] || {
    title: "CRMS",
    subtitle: "Change & Requirement Management System",
  };

  return (
    <header className="bg-gradient-to-r from-[#7c3aed] via-[#a78bfa] to-[#c084fc] h-[120px] flex items-center px-10 text-white shrink-0 shadow-md">
      <div>
        <h2 className="text-3xl font-black tracking-tight mb-0.5">
          {current.title}
        </h2>
        <p className="text-white/90 text-lg font-medium opacity-90">
          {current.subtitle}
        </p>
      </div>
    </header>
  );
}
