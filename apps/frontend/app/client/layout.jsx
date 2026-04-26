/* eslint-disable react/prop-types */

"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import TopNavbar from "../../components/TopNavbar";
import AppSidebar from "../../components/AppSidebar";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  return (
    <div
      className="flex h-screen bg-[#f3f4f6] overflow-hidden"
      style={{
        "--nav-bg": "#F1F5F9",
        "--nav-border": "#CBD5E1",
        "--surface-muted": "#E2E8F0",
      }}
    >
      {desktopSidebarOpen && <AppSidebar section="client" />}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopNavbar
        section="client"
          pathname={pathname}
          desktopSidebarOpen={desktopSidebarOpen}
          setDesktopSidebarOpen={setDesktopSidebarOpen}
        />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
