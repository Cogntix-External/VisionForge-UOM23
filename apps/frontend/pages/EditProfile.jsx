"use client";

import React, { useEffect, useState } from "react";
import {
  Camera,
} from "lucide-react";

const EditProfileModal = ({ isOpen, onClose, userData, onSave }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
    userId: "",
    profileImage: null,
    previewImage: "",
  });

  const [errors, setErrors] = useState({});
  const canEditSensitiveFields = true;

  useEffect(() => {
    if (userData) {
      setFormData({
        username: userData.username || "",
        email: userData.email || "",
        role: userData.role || "",
        userId: userData.userId || "",
        profileImage: null,
        previewImage: userData.profileImage || "",
      });
    }
  }, [userData]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      profileImage: file,
      previewImage: imageUrl,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Full name is required";
    }

    if (canEditSensitiveFields && !formData.role.trim()) {
      newErrors.role = "Role is required";
    }

    if (canEditSensitiveFields && !formData.userId.trim()) {
      newErrors.userId = "User ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const updatedUser = {
      ...userData,
      username: formData.username,
      email: formData.email,
      role: canEditSensitiveFields ? formData.role : userData.role,
      userId: canEditSensitiveFields ? formData.userId : userData.userId,
      profileImage: formData.previewImage || userData.profileImage,
    };

    onSave?.(updatedUser);
    handleClose();
  };

  const handleCancel = () => {
    setFormData((prev) => ({
      ...prev,
      username: userData.username || "",
      email: userData.email || "",
      role: userData.role || "",
      userId: userData.userId || "",
      previewImage: userData.profileImage || "",
      profileImage: null,
    }));
    setErrors({});
    handleClose();
  };

  if (!isOpen) return null;

  const inputClass =
    "mt-1 w-full border-0 bg-transparent px-0 py-0 text-[15px] font-semibold text-slate-900 outline-none";

  const readOnlyClass =
    "mt-1 w-full border-0 bg-transparent px-0 py-0 text-[15px] font-semibold text-slate-900 outline-none";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-4 py-4 backdrop-blur-[2px]"
      onMouseDown={handleClose}
    >
      <div
        className="w-full max-w-[470px] rounded-[18px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <h2 className="text-[20px] font-medium text-slate-900">
            Edit profile
          </h2>

          <div className="mt-8 flex flex-col items-center text-center">
            <div className="relative">
                  {formData.previewImage ? (
                    <img
                      src={formData.previewImage}
                      alt="Profile Preview"
                      className="h-[160px] w-[160px] rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-[160px] w-[160px] items-center justify-center rounded-full bg-emerald-500 text-[56px] font-medium text-white">
                      {formData.username
                        ?.split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() || "U"}
                    </div>
                  )}

                  <label
                    className="absolute bottom-1 right-1 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
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

            <div className="mt-8 w-full space-y-3">
              <FieldCard
                label="Display name"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={inputClass}
                error={errors.username}
              />
              <FieldCard
                label="User ID"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className={canEditSensitiveFields ? inputClass : readOnlyClass}
                readOnly={!canEditSensitiveFields}
                error={canEditSensitiveFields ? errors.userId : ""}
              />
              <FieldCard
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={canEditSensitiveFields ? inputClass : readOnlyClass}
                readOnly={!canEditSensitiveFields}
                error={canEditSensitiveFields ? errors.role : ""}
              />
              <FieldCard
                label="Email Address"
                name="email"
                value={formData.email}
                className={readOnlyClass}
                readOnly
              />
            </div>

            <div className="mt-8 flex w-full justify-end gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-[15px] font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-full bg-slate-900 px-6 py-3 text-[15px] font-medium text-white transition hover:bg-slate-800"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FieldCard = ({
  label,
  name,
  value,
  onChange,
  className,
  readOnly = false,
  error = "",
}) => {
  return (
    <div className="rounded-[12px] border border-slate-200 px-4 py-3 text-left">
      <label className="block text-[13px] text-slate-500">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className={className}
        readOnly={readOnly}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default EditProfileModal;
