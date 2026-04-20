import React, { useState } from "react";
import { API_BASE } from "../constants";
import { validateEmail } from "../utils/validators";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!validateEmail(email.trim())) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      let data = null;
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }

      if (!res.ok) {
        throw new Error(data?.message || "Request failed");
      }

      setMessage(data?.message || "Password reset link sent successfully");
      setEmail("");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f2ff] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Forgot Password
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Enter your email to receive reset instructions
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {error && (
          <p className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-200">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}