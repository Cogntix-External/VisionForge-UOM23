"use client";

import React, { useEffect, useRef, useState } from "react";
import { LogOut, X, Pencil, Check, Undo2, Copy } from "lucide-react";

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Mock user data (later replace with backend)
  const [userData, setUserData] = useState({
    userId: "234148X",
    username: "Shake william",
    email: "nuhamnf.23@uom.lk",
    role: "Project Manager",
  });

  // Username edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(userData.username);

  // Small toast message (optional)
  const [toast, setToast] = useState("");

  const closeAll = () => {
    setIsOpen(false);
    setIsEditingName(false);
    setNameDraft(userData.username);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeAll();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData.username]);

  // Keep draft synced when open
  useEffect(() => {
    if (isOpen) setNameDraft(userData.username);
  }, [isOpen, userData.username]);

  const handleLogout = () => {
    console.log("Logging out...");
    closeAll();
  };

  const startEdit = () => {
    setIsEditingName(true);
    setNameDraft(userData.username);
  };

  const cancelEdit = () => {
    setIsEditingName(false);
    setNameDraft(userData.username);
  };

  const saveUsername = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setToast("Username cannot be empty");
      setTimeout(() => setToast(""), 1800);
      return;
    }

    // update local state
    setUserData((prev) => ({ ...prev, username: trimmed }));
    setIsEditingName(false);

    // Later: call backend API here
    // await fetch("http://localhost:8080/api/users/me", {
    //   method: "PUT",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ username: trimmed }),
    // });
  };

  const copyUserId = async () => {
    try {
      await navigator.clipboard.writeText(userData.userId);
      setToast("User ID copied");
      setTimeout(() => setToast(""), 1500);
    } catch {
      setToast("Copy failed");
      setTimeout(() => setToast(""), 1500);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-[var(--surface-muted)] transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#8b7bff] flex items-center justify-center text-white font-semibold text-sm">
          {userData.username?.charAt(0)?.toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-[var(--surface)] rounded-xl shadow-2xl border border-[var(--border-soft)] z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-[var(--surface-muted)] border-b border-[var(--border-soft)]">
            <h3 className="font-semibold text-gray-800">User Profile</h3>
            <button
              type="button"
              onClick={closeAll}
              className="p-1 hover:bg-white rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Top identity */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#8b7bff] flex items-center justify-center text-white font-bold text-xl">
                {userData.username?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{userData.username}</p>
                <p className="text-sm text-gray-500">{userData.role}</p>
              </div>
            </div>

            {/* Optional toast */}
            {toast && (
              <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                {toast}
              </div>
            )}

            {/* Professional fields */}
            <div className="space-y-3">
              {/* User ID (read-only + copy) */}
              <div className="bg-[var(--surface-muted)] rounded-lg p-3 border border-[var(--border-soft)]">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">User ID</p>
                  <button
                    type="button"
                    onClick={copyUserId}
                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                    title="Copy User ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                </div>
                <p className="mt-1 text-gray-800 font-medium text-sm">{userData.userId}</p>
              </div>

              {/* Username (editable only) */}
              <div className="rounded-lg border border-[var(--border-soft)] bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Username</p>

                  {!isEditingName ? (
                    <button
                      type="button"
                      onClick={startEdit}
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveUsername}
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Save
                      </button>
                    </div>
                  )}
                </div>

                {!isEditingName ? (
                  <p className="mt-1 text-sm font-medium text-gray-800">{userData.username}</p>
                ) : (
                  <input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    className="mt-2 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Enter username"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveUsername();
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                )}
              </div>

              {/* Email (read-only) */}
              <div className="bg-[var(--surface-muted)] rounded-lg p-3 border border-[var(--border-soft)]">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-gray-800 font-medium text-sm">{userData.email}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-600)] text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;

