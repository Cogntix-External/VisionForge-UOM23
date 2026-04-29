"use client";

import React, { useEffect, useState } from "react";
import { Camera, X } from "lucide-react";

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

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
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

        {/* 🔥 HEADER */}
        <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <h2 className="font-bold text-lg">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
            <X size={18} />
          </button>
        </div>

        {/* 🔥 BODY */}
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

        {/* 🔥 FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={handleSave} className="btn-main">Save</button>
        </div>

      </div>
    </div>
  );
};

const Input = ({ label, children }) => (
  <div className="text-left">
    <label className="text-sm font-semibold">{label}</label>
    {children}
  </div>
);

/* 🔥 STYLES */
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