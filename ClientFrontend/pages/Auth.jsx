import React, { useState } from 'react';
import { API_BASE } from '../constants';

const Auth = ({ onLogin }) => {
  const [view, setView] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email.trim(),
          passwordHash: loginForm.password,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Login failed');
      }

      const data = await response.json();
      setSuccess('Logged in successfully');
      onLogin?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: signupForm.fullName.trim(),
          email: signupForm.email.trim(),
          passwordHash: signupForm.password,
          role: 'CLIENT',
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Signup failed');
      }

      const data = await response.json();
      setSuccess('Account created successfully');
      onLogin?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-6">
      <div className="mb-10 text-center">
        <div className="bg-[#111827] w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/10">
          <span className="text-amber-500 font-bold text-2xl leading-none">€</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome to CRMS</h1>
        <p className="text-xl font-medium text-gray-600">Change & Requirement Management System</p>
      </div>

      <div className="w-full max-w-2xl">
        {view !== 'forgot' && (
          <div className="bg-[#e5e7eb] p-2 rounded-2xl flex mb-6 shadow-sm">
            <button
              onClick={() => setView('login')}
              className={`flex-1 py-4 text-xl font-bold rounded-xl transition-all ${view === 'login' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500'}`}
            >
              Log in
            </button>
            <button
              onClick={() => setView('signup')}
              className={`flex-1 py-4 text-xl font-bold rounded-xl transition-all ${view === 'signup' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500'}`}
            >
              Sign up
            </button>
          </div>
        )}

        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 p-12">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 font-bold border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 font-bold border border-green-200">
              {success}
            </div>
          )}

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Sign in to your account</h3>
                <p className="text-gray-500 font-bold text-lg">Enter your credentials to access the portal</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xl font-bold text-gray-900 mb-3">Email</label>
                  <input
                    type="email"
                    className="w-full px-6 py-5 bg-[#e5e7eb]/40 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 text-lg font-bold outline-none"
                    placeholder="Enter your email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xl font-bold text-gray-900">Password</label>
                    <button type="button" onClick={() => setView('forgot')} className="text-blue-500 font-bold text-lg hover:underline">Forgot password ?</button>
                  </div>
                  <input
                    type="password"
                    className="w-full px-6 py-5 bg-[#e5e7eb]/40 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 text-lg font-bold outline-none"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input type="checkbox" className="w-8 h-8 rounded-lg border-2 border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer" id="remember" />
                <label htmlFor="remember" className="ml-4 text-xl font-bold text-gray-900 cursor-pointer">Remember me</label>
              </div>

              <div className="pt-4 space-y-6 text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 bg-[#7c3aed] text-white text-2xl font-black rounded-3xl hover:bg-[#6d28d9] transition-all shadow-2xl shadow-purple-300 active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? 'Signing in...' : 'Log in'}
                </button>
                <div className="text-xl font-black text-gray-900 py-2">OR</div>
                <button type="button" className="w-full py-6 bg-[#7c3aed] text-white text-2xl font-black rounded-3xl hover:bg-[#6d28d9] transition-all shadow-2xl shadow-purple-300 active:scale-[0.98]">
                   Log in with Google
                </button>
              </div>
            </form>
          )}

          {view === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Create an account</h3>
                <p className="text-gray-500 font-bold text-lg">Enter your information to get started</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xl font-bold text-gray-900 mb-3">Full name</label>
                  <input
                    type="text"
                    className="w-full px-6 py-5 bg-[#e5e7eb]/40 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 text-lg font-bold outline-none"
                    placeholder="Enter your full name"
                    value={signupForm.fullName}
                    onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-900 mb-3">Email</label>
                  <input
                    type="email"
                    className="w-full px-6 py-5 bg-[#e5e7eb]/40 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 text-lg font-bold outline-none"
                    placeholder="Enter your email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-900 mb-3">Password</label>
                  <input
                    type="password"
                    className="w-full px-6 py-5 bg-[#e5e7eb]/40 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 text-lg font-bold outline-none"
                    placeholder="Create a password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-6 bg-[#7c3aed] text-white text-2xl font-black rounded-3xl hover:bg-[#6d28d9] transition-all shadow-2xl shadow-purple-300 disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </form>
          )}

          {view === 'forgot' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 text-center">
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Forgot Password</h3>
                <p className="text-gray-500 font-bold text-lg">No worries, we'll send you reset instructions</p>
              </div>
              <input type="email" className="w-full px-6 py-5 bg-[#e5e7eb]/40 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 text-lg font-bold outline-none text-center" placeholder="Enter your email" />
              <button className="w-full py-6 bg-[#7c3aed] text-white text-2xl font-black rounded-3xl hover:bg-[#6d28d9] transition-all shadow-2xl shadow-purple-300">
                 Send Reset Link
              </button>
              <button onClick={() => setView('login')} className="text-xl font-bold text-[#7c3aed] hover:underline">Back to Login</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
