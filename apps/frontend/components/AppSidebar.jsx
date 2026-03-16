/* eslint-disable react/prop-types */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CRMSLogo from "../assets/CRMSLogo";
import { clearSession } from "../utils/auth";

const clientItems = [
  { href: "/client/dashboard", label: "Dashboard" },
  { href: "/client/Project", label: "Projects" },
  { href: "/client/ChangeRequest", label: "Change Requests" },
  { href: "/client/Proposal", label: "Proposals" },
  { href: "/client/Document", label: "Documents" },
  { href: "/client/Kanban", label: "Kanban" },
];

const companyItems = [
  { href: "/company/DashboardSection", label: "Dashboard" },
  { href: "/company/PrdRepository", label: "PRD Repository" },
  { href: "/company/ProposalsListSection", label: "Proposals" },
  { href: "/company/CreateProposalSection", label: "Create Proposal" },
  { href: "/company/ProposalDetailsSection", label: "Proposal Details" },
];

function isActivePath(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppSidebar({ section = "client" }) {
  const pathname = usePathname();
  const router = useRouter();
  const menuItems = section === "company" ? companyItems : clientItems;

  return (
    <aside className="h-full bg-[#111827] text-white flex flex-col shrink-0 border-r border-white/5 w-[280px]">
      <div className="p-8 flex items-center space-x-4">
        <CRMSLogo className="w-14 h-14 shrink-0" />
        <div>
          <h1 className="font-black text-xl leading-none uppercase tracking-tighter text-white">
            CRMS
          </h1>
          <p className="text-[#9ca3af] text-[10px] font-bold mt-1 uppercase tracking-widest">
            Client Portal
          </p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col py-4 space-y-3 px-4">
        {menuItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full px-6 py-4 rounded-xl font-bold text-base transition-all ${
                active
                  ? "bg-[#1f2937] text-white border border-white/10"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-8 border-t border-white/5 mt-auto">
        <button
          onClick={() => {
            clearSession();
            router.push("/login");
          }}
          className="w-full bg-[#1f2937] p-3 rounded-xl border border-white/10 shadow-lg font-bold hover:border-purple-400 transition-all"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
