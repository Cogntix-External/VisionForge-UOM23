/* eslint-disable react/prop-types */

"use client";

import { usePathname } from "next/navigation";
import Navbar from "../../components/Navbar";
import AppSidebar from "../../components/AppSidebar";

export default function CompanyLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[#f3f4f6] overflow-hidden">
      <AppSidebar section="company" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar pathname={pathname} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
