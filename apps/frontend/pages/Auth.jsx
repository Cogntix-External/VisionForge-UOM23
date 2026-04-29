"use client";

import React, { useState } from "react";
import { API_BASE } from "../constants";
import {
  validateEmail,
  validatePassword,
  getPasswordError,
} from "../utils/validators";

const normalizeRole = (rawRole) => {
  if (!rawRole) return "";
  const role = String(rawRole).trim().toUpperCase();
  if (role === "ROLE_CLIENT") return "CLIENT";
  if (role === "ROLE_COMPANY") return "COMPANY";
  return role;
};

const Auth = ({ onLogin }) => {
  const [view, setView] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "CLIENT",
  });

  const [otpForm, setOtpForm] = useState({ email: "", otp: "" });
  const [forgotEmail, setForgotEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const switchView = (nextView) => {
    setView(nextView);
    setError("");
    setSuccess("");
  };

  const redirectByRole = (role) => {
    if (role === "CLIENT") window.location.href = "/client/dashboard";
    else if (role === "COMPANY") window.location.href = "/company/DashboardSection";
    else window.location.href = "/";
  };

  const storeSessionAndRedirect = (data, fallbackEmail = "") => {
    const token = data?.token;
    const resolvedRole = normalizeRole(data?.role);
    const resolvedEmail = data?.email || fallbackEmail;
    const resolvedName =
      data?.fullName ||
      data?.name ||
      (resolvedEmail ? resolvedEmail.split("@")[0] : "User");

    if (token) localStorage.setItem("crms_token", token);

    localStorage.setItem("crms_role", resolvedRole || "");
    localStorage.setItem(
      "crms_user",
      JSON.stringify({
        ...data,
        email: resolvedEmail,
        fullName: resolvedName,
        role: resolvedRole,
      })
    );

    if (resolvedRole === "COMPANY" && data?.id) {
      localStorage.setItem("companyId", data.id);
    }

    if (resolvedRole === "CLIENT" && data?.id) {
      localStorage.setItem("clientId", data.id);
    }

    onLogin?.({
      ...data,
      email: resolvedEmail,
      fullName: resolvedName,
      role: resolvedRole,
    });

    setTimeout(() => redirectByRole(resolvedRole), 500);
  };

  const readResponse = async (response, fallbackMessage) => {
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    const text = await response.text();
    if (!response.ok) throw new Error(text || fallbackMessage);
    return { message: text };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateEmail(loginForm.email.trim())) {
      setError("Enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginForm.email.trim(),
          password: loginForm.password,
        }),
      });

      const data = await readResponse(response, "Login failed");

      if (!response.ok) throw new Error(data?.message || "Login failed");

      setSuccess("Logged in successfully");
      storeSessionAndRedirect(data, loginForm.email.trim());
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!signupForm.fullName.trim()) {
      setError("Full name is required");
      setLoading(false);
      return;
    }

    if (!validateEmail(signupForm.email.trim())) {
      setError("Enter a valid email address");
      setLoading(false);
      return;
    }

    if (!validatePassword(signupForm.password)) {
      setError(getPasswordError(signupForm.password));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupForm.fullName.trim(),
          email: signupForm.email.trim(),
          password: signupForm.password,
          role: signupForm.role,
        }),
      });

      const data = await readResponse(response, "Signup failed");

      if (!response.ok) {
        throw new Error(
          data?.message || data?.detail || data?.error || "Signup failed"
        );
      }

      const signupEmail = signupForm.email.trim();

      setOtpForm({ email: signupEmail, otp: "" });
      localStorage.setItem("otp_email", signupEmail);
      localStorage.setItem("otp_role", signupForm.role);

      setSuccess(data?.message || "OTP sent to your email");
      setError("");
      setView("verifyOtp");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateEmail(otpForm.email.trim())) {
      setError("Enter a valid email address");
      setLoading(false);
      return;
    }

    if (!otpForm.otp.trim()) {
      setError("Enter OTP");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: otpForm.email.trim(),
          otp: otpForm.otp.trim(),
        }),
      });

      const data = await readResponse(response, "OTP verification failed");

      if (!response.ok) {
        throw new Error(data?.message || "OTP verification failed");
      }

      localStorage.removeItem("otp_email");
      localStorage.removeItem("otp_role");

      setSuccess("Email verified successfully");
      storeSessionAndRedirect(data, otpForm.email.trim());
    } catch (err) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateEmail(forgotEmail.trim())) {
      setError("Enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      const data = await readResponse(response, "Failed to send reset link");

      if (!response.ok) {
        throw new Error(data?.message || "Failed to send reset link");
      }

      setSuccess(data?.message || "Reset link sent successfully");
      setForgotEmail("");
    } catch (err) {
      setError(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f0ff]">
      <div className="flex min-h-screen">
        <section
          className="relative hidden w-1/2 overflow-hidden bg-cover bg-center lg:block"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80")',
          }}
        >
          <div className="absolute inset-0 bg-slate-950/25" />

          <div className="absolute left-10 top-10 z-10 rounded-3xl border border-white/20 bg-white/15 px-6 py-5 text-white backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-white/70">
              CRMS
            </p>
            <h1 className="mt-2 text-2xl font-black">
              Change & Requirement Management
            </h1>
          </div>

          <svg
            className="absolute right-[-1px] top-0 h-full w-32"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,0 C72,22 72,78 0,100 L100,100 L100,0 Z"
              fill="#f4f0ff"
            />
          </svg>
        </section>

        <section className="flex w-full items-center justify-center px-5 py-10 lg:w-1/2">
          <div className="w-full max-w-md rounded-[32px] border border-white/70 bg-white/95 p-8 shadow-[0_28px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl">
            <div className="mb-7 text-center lg:hidden">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg">
                <span className="text-xl font-black">CR</span>
              </div>
              <p className="text-sm font-semibold text-slate-500">
                Change & Requirement Management System
              </p>
            </div>

            {view !== "forgot" && view !== "verifyOtp" && (
              <div className="mb-7 flex rounded-full bg-violet-100 p-1">
                <button
                  type="button"
                  onClick={() => switchView("login")}
                  className={`flex-1 rounded-full py-3 text-sm font-black transition ${
                    view === "login"
                      ? "bg-white text-violet-700 shadow-sm"
                      : "text-violet-500 hover:text-violet-700"
                  }`}
                >
                  Log in
                </button>

                <button
                  type="button"
                  onClick={() => switchView("signup")}
                  className={`flex-1 rounded-full py-3 text-sm font-black transition ${
                    view === "signup"
                      ? "bg-white text-violet-700 shadow-sm"
                      : "text-violet-500 hover:text-violet-700"
                  }`}
                >
                  Sign up
                </button>
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                {success}
              </div>
            )}

            {view === "login" && (
              <form onSubmit={handleLogin} className="space-y-5">
                <Title
                  title="Welcome"
                  subtitle="Login with your registered email"
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="name@email.com"
                  value={loginForm.email}
                  onChange={(value) =>
                    setLoginForm({ ...loginForm, email: value })
                  }
                />

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-black text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => switchView("forgot")}
                      className="text-sm font-black text-violet-600 hover:text-violet-700"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Input
                    hideLabel
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(value) =>
                      setLoginForm({ ...loginForm, password: value })
                    }
                  />
                </div>

                <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  Remember me
                </label>

                <PrimaryButton loading={loading}>
                  {loading ? "Signing in..." : "Login"}
                </PrimaryButton>

                <p className="text-center text-sm font-medium text-slate-500">
                  Do not have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchView("signup")}
                    className="font-black text-violet-600 hover:text-violet-700"
                  >
                    Register now
                  </button>
                </p>
              </form>
            )}

            {view === "signup" && (
              <form onSubmit={handleSignup} className="space-y-5">
                <Title
                  title="Create an account"
                  subtitle="Enter your information to get started"
                />

                <Input
                  label="Full name"
                  type="text"
                  placeholder="Enter your full name"
                  value={signupForm.fullName}
                  onChange={(value) =>
                    setSignupForm({ ...signupForm, fullName: value })
                  }
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="name@email.com"
                  value={signupForm.email}
                  onChange={(value) =>
                    setSignupForm({ ...signupForm, email: value })
                  }
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Create a password"
                  value={signupForm.password}
                  onChange={(value) =>
                    setSignupForm({ ...signupForm, password: value })
                  }
                />

                {signupForm.password &&
                  !validatePassword(signupForm.password) && (
                    <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
                      {getPasswordError(signupForm.password)}
                    </p>
                  )}

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700">
                    Sign up as
                  </label>
                  <select
                    value={signupForm.role}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, role: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  >
                    <option value="CLIENT">Client</option>
                    <option value="COMPANY">Company</option>
                  </select>
                </div>

                <PrimaryButton loading={loading}>
                  {loading ? "Creating account..." : "Sign up"}
                </PrimaryButton>

                <p className="text-center text-sm font-medium text-slate-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchView("login")}
                    className="font-black text-violet-600 hover:text-violet-700"
                  >
                    Login
                  </button>
                </p>
              </form>
            )}

            {view === "verifyOtp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <Title
                  title="Verify OTP"
                  subtitle="Enter the OTP sent to your email"
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="name@email.com"
                  value={otpForm.email}
                  onChange={(value) => setOtpForm({ ...otpForm, email: value })}
                />

                <Input
                  label="OTP"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otpForm.otp}
                  onChange={(value) => setOtpForm({ ...otpForm, otp: value })}
                />

                <PrimaryButton loading={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </PrimaryButton>

                <BackButton onClick={() => switchView("signup")}>
                  Back to Sign up
                </BackButton>
              </form>
            )}

            {view === "forgot" && (
              <div className="space-y-5">
                <Title
                  title="Forgot Password"
                  subtitle="No worries, we will send reset instructions"
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={setForgotEmail}
                />

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-4 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <BackButton onClick={() => switchView("login")}>
                  Back to Login
                </BackButton>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

function Title({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-3xl font-black tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
    </div>
  );
}

function Input({ label, hideLabel = false, value, onChange, ...props }) {
  return (
    <div>
      {!hideLabel && (
        <label className="mb-2 block text-sm font-black text-slate-700">
          {label}
        </label>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        {...props}
      />
    </div>
  );
}

function PrimaryButton({ children, loading }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-4 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function BackButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-sm font-black text-violet-600 hover:text-violet-700"
    >
      {children}
    </button>
  );
}

export default Auth;