/* eslint-disable react/prop-types */

"use client";

const pageMeta = {
  "/client/dashboard": {
    title: "Dashboard",
    subtitle: "Welcome back! Here is what is happening with your projects.",
  },
  "/client/Project": {
    title: "Projects",
    subtitle: "View and manage all your projects in one place.",
  },
  "/client/ChangeRequest": {
    title: "Change Requests",
    subtitle: "Track and manage change requests across your projects.",
  },
  "/client/Proposal": {
    title: "Project Proposals",
    subtitle: "Create and review proposal submissions.",
  },
  "/client/Document": {
    title: "Documents",
    subtitle: "Access all project documents, PRDs, and change request files.",
  },
  "/client/Kanban": {
    title: "Kanban",
    subtitle: "Visualize project workflow and task progress.",
  },
  "/company/DashboardSection": {
    title: "Company Dashboard",
    subtitle: "Overview of company-level execution and delivery.",
  },
  "/company/PrdRepository": {
    title: "PRD Repository",
    subtitle: "Centralized repository for product requirement documents.",
  },
  "/company/ProposalsListSection": {
    title: "Project Proposals",
    subtitle: "Review and manage proposal decisions.",
  },
  "/company/CreateProposalSection": {
    title: "Create Proposal",
    subtitle: "Draft and submit a new proposal.",
  },
  "/company/ProposalDetailsSection": {
    title: "Proposal Details",
    subtitle: "Inspect proposal content and decision history.",
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
