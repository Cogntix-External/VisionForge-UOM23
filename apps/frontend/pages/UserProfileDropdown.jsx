"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  User,
  Settings,
  ChevronRight,
  Palette,
  Compass,
  Users,
} from "lucide-react";
import EditProfileModal from "./EditProfile";

const THEME_OPTIONS = [
  {
    id: "light",
    label: "Light",
    previewClassName:
      "bg-white border border-slate-200 before:absolute before:inset-x-2 before:top-2 before:h-1.5 before:rounded-full before:bg-slate-200 after:absolute after:left-2 after:right-6 after:top-6 after:h-1 after:rounded-full after:bg-slate-300",
  },
  {
    id: "dark",
    label: "Dark",
    previewClassName:
      "bg-slate-900 border border-slate-700 before:absolute before:inset-x-2 before:top-2 before:h-1.5 before:rounded-full before:bg-slate-700 after:absolute after:left-2 after:right-6 after:top-6 after:h-1 after:rounded-full after:bg-slate-600",
  },
  {
    id: "system",
    label: "Match browser",
    previewClassName:
      "border border-slate-200 bg-[linear-gradient(90deg,#111827_0%,#111827_50%,#ffffff_50%,#ffffff_100%)] before:absolute before:left-2 before:right-[calc(50%+0.5rem)] before:top-2 before:h-1.5 before:rounded-full before:bg-slate-600 after:absolute after:left-[calc(50%+0.5rem)] after:right-2 after:top-2 after:h-1.5 after:rounded-full after:bg-slate-200",
  },
];

const UserProfileDropdown = () => {
  const router = useRouter();
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [activePanel, setActivePanel] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState("light");

  const [userData, setUserData] = useState({
    userId: "234148X",
    username: "Fathima Nuha",
    email: "nuhamnf.23@uom.lk",
    role: "Project Manager",
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setActivePanel(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToastMessage = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1500);
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    setIsOpen(false);
    setActivePanel(null);
  };

  const handleThemeClick = () => {
    setActivePanel((prev) => (prev === "theme" ? null : "theme"));
  };

  const menuItemClass =
    "flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-[15px] font-medium text-slate-700 transition hover:bg-slate-50";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => {
          setIsOpen((prev) => {
            const next = !prev;
            if (!next) setActivePanel(null);
            return next;
          });
        }}
        className="rounded-full p-1.5 transition hover:bg-slate-100"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(15,23,42,0.18)]">
          {userData.username.charAt(0)}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-3">
          <div className="relative w-[340px] overflow-visible rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
            {activePanel === "theme" && (
              <div className="absolute left-0 top-[255px] z-10 h-[180px] w-[260px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
                <div className="p-1.5">
                    {THEME_OPTIONS.map((option) => {
                      const isSelected = selectedTheme === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setSelectedTheme(option.id);
                            showToastMessage(`${option.label} theme selected`);
                          }}
                          className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition ${
                            isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                              isSelected ? "border-blue-600" : "border-slate-400"
                            }`}
                          >
                            {isSelected && (
                              <span className="h-2 w-2 rounded-full bg-blue-600" />
                            )}
                          </span>
                          <span
                            className={`relative h-9 w-12 shrink-0 overflow-hidden rounded-md ${option.previewClassName}`}
                          />
                          <span className="text-[14px] font-medium text-slate-700">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            <div className="p-3.5">
              {/* Header */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#5b4cc4] text-[28px] font-semibold text-white">
                    {userData.username
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[18px] font-semibold text-slate-900">
                      {userData.username}
                    </p>
                    <p className="mt-0.5 truncate text-[13px] text-slate-500">
                      {userData.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Toast */}
              {toast && (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-medium text-emerald-700">
                  {toast}
                </div>
              )}

              {/* Main Menu */}
              <div className="mt-4 space-y-1">
                <button
                  onClick={() => {
                    setIsEditOpen(true);
                    setIsOpen(false);
                    setActivePanel(null);
                  }}
                  className={menuItemClass}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-slate-700">
                      <User size={16} />
                    </div>
                    <span>Profile</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    setActivePanel(null);
                    router.push("/account-settings");
                  }}
                  className={menuItemClass}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-slate-700">
                      <Settings size={16} />
                    </div>
                    <span>Account settings</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>

                <button
                  onClick={handleThemeClick}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-[15px] font-medium transition ${
                    activePanel === "theme"
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={
                        activePanel === "theme" ? "text-blue-700" : "text-slate-700"
                      }
                    >
                      <Palette size={16} />
                    </div>
                    <span>Theme</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    setActivePanel(null);
                    showToastMessage("Quickstart will open soon");
                  }}
                  className={menuItemClass}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-slate-700">
                      <Compass size={16} />
                    </div>
                    <span>Open Quickstart</span>
                  </div>
                </button>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-3">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setActivePanel(null);
                    showToastMessage("Switch account will open soon");
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-medium text-slate-900 transition hover:bg-slate-50"
                >
                  <div className="text-slate-700">
                    <Users size={16} />
                  </div>
                  <span>Switch account</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-medium text-slate-900 transition hover:bg-rose-50 hover:text-rose-700"
                >
                  <div className="text-slate-700 transition-colors group-hover:text-rose-600">
                    <LogOut size={16} />
                  </div>
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        userData={userData}
        onSave={(updatedUser) => {
          setUserData(updatedUser);
          showToastMessage("Profile updated!");
        }}
      />
    </div>
  );
};

export default UserProfileDropdown;

