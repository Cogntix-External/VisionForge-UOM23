"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Layout from "./Layout";

const ChangePasswordPage = () => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleContinue = () => {
    if (!newPassword || !confirmPassword) {
      alert("Please fill both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    alert("Password changed successfully");
    router.push("/account-settings");
  };

  return (
    <Layout title="Change Password">
      <div className="flex h-full min-h-0 items-center justify-center overflow-y-auto">
        <div className="w-full max-w-[430px] px-4 py-8 text-center">
          <h2 className="text-[34px] font-medium tracking-tight text-slate-900">
            Change your password
          </h2>
          <p className="mx-auto mt-5 max-w-[360px] text-[16px] leading-8 text-slate-600">
            Enter a new password below to change your password
          </p>

          <div className="mt-8 space-y-3">
            <PasswordField
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              visible={showNewPassword}
              onToggle={() => setShowNewPassword((prev) => !prev)}
            />
            <PasswordField
              label="Re-enter new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((prev) => !prev)}
            />
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="mt-7 inline-flex h-[58px] w-full max-w-[390px] items-center justify-center rounded-full bg-slate-900 px-6 text-[17px] font-medium text-white transition hover:bg-slate-800"
          >
            Continue
          </button>
        </div>
      </div>
    </Layout>
  );
};

const PasswordField = ({
  label,
  value,
  onChange,
  visible,
  onToggle,
}) => {
  return (
    <div className="mx-auto max-w-[390px] text-left">
      <label className="mb-2 block px-4 text-[13px] font-medium text-blue-600">
        {label}
      </label>
      <div className="flex h-[58px] items-center rounded-full border border-slate-300 bg-white px-5 focus-within:border-blue-500">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border-0 bg-transparent text-[15px] text-slate-900 outline-none"
        />
        <button
          type="button"
          onClick={onToggle}
          className="text-slate-700 transition hover:text-slate-900"
        >
          {visible ? (
            <EyeOff className="h-6 w-6" />
          ) : (
            <Eye className="h-6 w-6" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordPage;