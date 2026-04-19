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

  const [otpForm, setOtpForm] = useState({
    email: "",
    otp: "",
  });

  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const redirectByRole = (role) => {
    if (role === "CLIENT") {
      window.location.href = "/client/dashboard";
    } else if (role === "COMPANY") {
      window.location.href = "/company/DashboardSection";
    } else {
      window.location.href = "/";
    }
  };

  const storeSessionAndRedirect = (data, fallbackEmail = "") => {
    const token = data?.token;
    const resolvedRole = normalizeRole(data?.role);
    const resolvedEmail = data?.email || fallbackEmail;
    const resolvedName =
      data?.fullName ||
      data?.name ||
      (resolvedEmail ? resolvedEmail.split("@")[0] : "User");

    if (token) {
      localStorage.setItem("crms_token", token);
    }

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

    setTimeout(() => {
      redirectByRole(resolvedRole);
    }, 500);
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

      let data = null;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || "Login failed");
      }

      if (!response.ok) {
        throw new Error(data?.message || "Login failed");
      }

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

      let data = null;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text || "Signup failed" };
      }

      if (!response.ok) {
        throw new Error(
          data?.message || data?.detail || data?.error || "Signup failed"
        );
      }

      const signupEmail = signupForm.email.trim();

      setOtpForm({
        email: signupEmail,
        otp: "",
      });

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

      let data = null;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || "OTP verification failed");
      }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotEmail.trim(),
        }),
      });

      let data = null;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || "Failed to send reset link");
      }

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
    <div className="min-h-screen flex bg-[#f5f2ff]">
      <div
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-white"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <svg
          className="absolute right-0 top-0 h-full w-24"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,0 C70,20 70,80 0,100 L100,100 L100,0 Z" fill="#f5f2ff" />
        </svg>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-600 mt-1">
              Change & Requirement Management System
            </p>
          </div>

          {view !== "forgot" && view !== "verifyOtp" && (
            <div className="bg-[#ede9ff] p-1 rounded-full flex mb-6 overflow-hidden">
              <button
                onClick={() => {
                  setView("login");
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-3 text-base font-semibold rounded-full transition-all ${
                  view === "login"
                    ? "bg-white shadow-sm text-purple-800"
                    : "text-purple-600"
                }`}
              >
                Log in
              </button>
              <button
                onClick={() => {
                  setView("signup");
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-3 text-base font-semibold rounded-full transition-all ${
                  view === "signup"
                    ? "bg-white shadow-sm text-purple-800"
                    : "text-purple-600"
                }`}
              >
                Sign up
              </button>
            </div>
          )}

          <div>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm font-medium border border-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm font-medium border border-green-200">
                {success}
              </div>
            )}

            {view === "login" && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Welcome
                  </h2>
                  <p className="text-gray-600 text-sm">Login with email</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      placeholder="name@email.com"
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setView("forgot");
                          setError("");
                          setSuccess("");
                        }}
                        className="text-purple-600 text-sm font-medium hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    id="remember"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing in..." : "Login"}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Do not have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setView("signup");
                        setError("");
                        setSuccess("");
                      }}
                      className="text-purple-600 font-semibold hover:underline"
                    >
                      Register now
                    </button>
                  </p>
                </div>
              </form>
            )}

            {view === "signup" && (
              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Create an account
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Enter your information to get started
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter your full name"
                      value={signupForm.fullName}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          fullName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      placeholder="name@email.com"
                      value={signupForm.email}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      placeholder="Create a password"
                      value={signupForm.password}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                    {signupForm.password &&
                      !validatePassword(signupForm.password) && (
                        <p className="text-red-500 text-sm mt-2">
                          {getPasswordError(signupForm.password)}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Sign up as
                    </label>
                    <select
                      value={signupForm.role}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, role: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-700"
                    >
                      <option value="CLIENT">Client</option>
                      <option value="COMPANY">Company</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating account..." : "Sign up"}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setView("login");
                        setError("");
                        setSuccess("");
                      }}
                      className="text-purple-600 font-semibold hover:underline"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </form>
            )}

            {view === "verifyOtp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Verify OTP
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Enter the OTP generated for your email to activate your
                    account.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg outline-none"
                      value={otpForm.email}
                      onChange={(e) =>
                        setOtpForm({ ...otpForm, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      OTP
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter 6-digit OTP"
                      value={otpForm.otp}
                      onChange={(e) =>
                        setOtpForm({ ...otpForm, otp: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setView("signup");
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full text-purple-600 font-semibold hover:underline"
                >
                  Back to Sign up
                </button>
              </form>
            )}

            {view === "forgot" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Forgot Password
                  </h2>
                  <p className="text-gray-600 text-sm">
                    No worries, we&apos;ll send you reset instructions
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full text-purple-600 font-semibold hover:underline"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;