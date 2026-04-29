"use client";

import React, { useEffect, useState } from "react";
import { Camera, X } from "lucide-react";
import { Camera, Info, SquareCheckBig } from "lucide-react";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "../services/api";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () =>
      reject(new Error("Failed to read the selected image"));

    reader.readAsDataURL(file);
  });

const EditProfileModal = ({ isOpen, onClose, userData, onSave }) => {
  const [formData, setFormData] = useState({
    username: "",
    userId: "",
    profileImage: null,
    previewImage: "",
    assignedTasks: [],
    assignedProjects: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!userData) return;

    setFormData((prev) => ({
      ...prev,
      username: userData.username || userData.fullName || userData.name || "",
      userId: userData.userId || userData.id || "",
      profileImage: null,
      previewImage: userData.profileImage || "",
      assignedTasks: Array.isArray(userData.assignedTasks)
        ? userData.assignedTasks
        : [],
      assignedProjects: Array.isArray(userData.assignedProjects)
        ? userData.assignedProjects
        : [],
    }));
  }, [userData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setSaveError("");
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      profileImage: file,
      previewImage: preview,
    }));
  };

  const handleSave = () => {
    if (!formData.username.trim()) {
      setErrors({ username: "Name required" });
      return;
    }

    onSave({
      ...userData,
      ...formData,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/*  HEADER */}
        <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <h2 className="font-bold text-lg">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
            <X size={18} />
          </button>
        </div>

        {/*  BODY */}
        <div className="p-6 space-y-6 text-center">

          {/* PROFILE IMAGE */}
          <div className="relative mx-auto w-fit">
            {formData.previewImage ? (
              <img
                src={formData.previewImage}
                className="w-28 h-28 rounded-full object-cover shadow-md"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-indigo-500 text-white flex items-center justify-center text-2xl font-bold">
                {formData.username?.[0] || "U"}
              </div>
            )}

            <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow cursor-pointer hover:bg-gray-100">
              <Camera size={16} />
              <input type="file" hidden onChange={handleImageChange} />
            </label>
          </div>

          {/* FORM */}
          <Input label="Name">
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input"
            />
            {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}
          </Input>

          <Input label="Role">
            <input
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input"
            />
          </Input>

          <Input label="User ID">
            <input
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="input"
            />
          </Input>

          <Input label="Email">
            <input value={formData.email} readOnly className="input bg-gray-100" />
          </Input>

        </div>

        {/*  FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={handleSave} className="btn-main">Save</button>
  const initials =
    formData.username
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="fixed inset-0 z-[100] bg-white">
      <div className="flex h-full w-full flex-col bg-white">
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex w-full max-w-[1180px] items-start justify-between gap-4 px-6 py-5 sm:px-8">
            <div>
              <p className="text-sm font-medium text-slate-500">People</p>
              <h2 className="mt-1 text-[34px] font-semibold tracking-tight text-slate-950">
                Edit profile
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Keep your profile clean and your recent work easy to scan.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex h-10 items-center justify-center border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || isLoadingProfile}
                className="inline-flex h-10 items-center justify-center bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <section className="space-y-6">
              <div className="flex flex-col items-start gap-5">
                <div className="relative">
                  {formData.previewImage ? (
                    <img
                      src={formData.previewImage}
                      alt="Profile preview"
                      className="h-28 w-28 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-900 text-[40px] font-semibold text-white shadow-sm">
                      {initials}
                    </div>
                  )}

                  <label
                    className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                    title="Change profile image"
                  >
                    <Camera size={14} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {saveError ? (
                  <div className="w-full border-y border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {saveError}
                  </div>
                ) : null}

                {isLoadingProfile ? (
                  <div className="w-full border-y border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    Loading profile...
                  </div>
                ) : null}

                <div className="w-full bg-white py-5">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                    Profile details
                  </p>
                  <div className="mt-5 space-y-4">
                    <FieldCard
                      label="Display name"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      error={errors.username}
                    />
                    <FieldCard
                      label="User ID"
                      name="userId"
                      value={formData.userId}
                      error={errors.userId}
                      readOnly
                    />
                  </div>
                </div>

              </div>
            </section>

            <section className="space-y-6 lg:border-l lg:border-slate-200 lg:pl-10">
              <PanelSection
                title="Recent work"
                countLabel={`${formData.assignedTasks.length} tasks`}
                icon={<Info className="h-3.5 w-3.5" />}
              >
                {formData.assignedTasks.length > 0 ? (
                  <div className="space-y-6">
                    {formData.assignedTasks.map((task) => (
                      <RecentWorkItem
                        key={task.id}
                        icon={<SquareCheckBig className="h-4 w-4" />}
                        title={task.title}
                        badge={task.status}
                        projectName={task.projectName}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState text="No recent work items found." />
                )}
              </PanelSection>
            </section>
          </div>
        </div>

      </div>
const FieldCard = ({
  label,
  name,
  value,
  onChange,
  readOnly = false,
  error = "",
}) => (
  <div className="pb-4 last:pb-0">
    <label className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`mt-2 w-full border-0 bg-transparent px-0 py-0 text-[16px] font-medium outline-none ${
        readOnly ? "cursor-default text-slate-500" : "text-slate-900"
      }`}
    />
    {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
  </div>
);

const PanelSection = ({ title, countLabel, description, icon = null, children }) => (
  <div className="bg-white py-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-[20px] font-semibold tracking-tight text-slate-950">
            {title}
          </h3>
          {icon ? <span className="text-slate-400">{icon}</span> : null}
        </div>
        {description ? (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      <span className="border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
        {countLabel}
      </span>
    </div>
    <div className="mt-5">{children}</div>
  </div>
);

const RecentWorkItem = ({ icon, title, badge, projectName }) => (
  <div className="py-1">
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold text-slate-900">
              {title || "Untitled task"}
            </p>
            {projectName ? (
              <p className="mt-1 text-sm text-slate-500">{projectName}</p>
            ) : null}
          </div>
          {badge ? (
            <span className="inline-flex border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600">
              {badge.replaceAll("_", " ")}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="border-y border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
    {text}
  </div>
);

const Input = ({ label, children }) => (
  <div className="text-left">
    <label className="text-sm font-semibold">{label}</label>
    {children}
  </div>
);

/*  STYLES */
const styles = `
.input { width:100%; padding:10px; border-radius:12px; border:1px solid #ddd }
.btn-main { background:#4f46e5; color:white; padding:10px 18px; border-radius:12px }
.btn-outline { border:1px solid #ddd; padding:10px 18px; border-radius:12px }
`;

if (typeof window !== "undefined") {
  const s = document.createElement("style");
  s.innerHTML = styles;
  document.head.appendChild(s);
}

export default EditProfileModal;