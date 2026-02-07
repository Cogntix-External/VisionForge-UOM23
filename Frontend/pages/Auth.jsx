import React, { useState } from "react";
import { API_BASE } from "../constants";

const Auth = ({ onLogin }) => {
  const [view, setView] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginForm.email.trim(),
          passwordHash: loginForm.password,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Login failed");
      }

      const data = await response.json();
      const normalizedUser = data?.user ?? data;
      const resolvedEmail = normalizedUser?.email || loginForm.email.trim();
      const resolvedName =
        normalizedUser?.fullName ||
        normalizedUser?.name ||
        (resolvedEmail ? resolvedEmail.split("@")[0] : "User");
      setSuccess("Logged in successfully");
      onLogin?.({
        ...normalizedUser,
        email: resolvedEmail,
        fullName: resolvedName,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: signupForm.fullName.trim(),
          email: signupForm.email.trim(),
          passwordHash: signupForm.password,
          role: "CLIENT",
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Signup failed");
      }

      const data = await response.json();
      const normalizedUser = data?.user ?? data;
      const resolvedEmail = normalizedUser?.email || signupForm.email.trim();
      const resolvedName =
        normalizedUser?.fullName ||
        normalizedUser?.name ||
        (resolvedEmail ? resolvedEmail.split("@")[0] : "User");
      setSuccess("Account created successfully");
      onLogin?.({
        ...normalizedUser,
        email: resolvedEmail,
        fullName: resolvedName,
      });
    } catch (err) {
      setError(err.message);
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

          {view !== "forgot" && (
            <div className="bg-[#ede9ff] p-1 rounded-full flex mb-6 overflow-hidden">
              <button
                onClick={() => setView("login")}
                className={`flex-1 py-3 text-base font-semibold rounded-full transition-all ${
                  view === "login"
                    ? "bg-white shadow-sm text-purple-800"
                    : "text-purple-600"
                }`}
              >
                Log in
              </button>
              <button
                onClick={() => setView("signup")}
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
                        onClick={() => setView("forgot")}
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
                      onClick={() => setView("signup")}
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
                      onClick={() => setView("login")}
                      className="text-purple-600 font-semibold hover:underline"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </form>
            )}

            {view === "forgot" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Forgot Password
                  </h2>
                  <p className="text-gray-600 text-sm">
                    No worries, we'll send you reset instructions
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
                  />
                </div>
                <button className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-200">
                  Send Reset Link
                </button>
                <button
                  onClick={() => setView("login")}
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
