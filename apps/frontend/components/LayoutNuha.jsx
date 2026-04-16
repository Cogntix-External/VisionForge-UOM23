"use client";

import AppSidebar from "./AppSidebar";
import Navbar from "./Navbar";

const LayoutNuha = ({ children, pathname, section = "company" }) => {
  return (
    <div className="h-screen overflow-hidden bg-[#f3f4f6]">
      <div className="flex h-full min-h-0 overflow-hidden">
        <AppSidebar section={section} />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Navbar pathname={pathname} />

          <main className="flex-1 min-h-0 overflow-y-auto bg-[#f3f4f6] p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default LayoutNuha;
