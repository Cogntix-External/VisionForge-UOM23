"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen overflow-hidden bg-[#0b0f1f] text-white">
      
      {/* NAVBAR */}
      <nav className="border-b border-white/10 bg-[#12172a]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#22d3ee] text-lg font-black text-white shadow-lg">
              CRMS
            </div>

            <div>
              <h1 className="text-3xl font-black text-[#a78bfa]">CRMS</h1>
              <p className="text-sm text-slate-400">
                Change & Requirement Management System
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push("/login")}
              className="rounded-2xl border border-white/15 bg-white/5 px-7 py-3 font-bold text-white hover:bg-white/10"
            >
              Login
            </button>

            <button
              onClick={() => router.push("/login")}
              className="rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#22d3ee] px-7 py-3 font-black text-white hover:opacity-90"
            >
              Get Started
            </button>
          </div>

        </div>
      </nav>

      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-6 py-24 text-center">
        
        {/* SOFT GLOW */}
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#22d3ee]/10 blur-3xl" />
        <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-[#8b5cf6]/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl">
          
          <p className="mb-6 tracking-[0.45em] text-[#c4b5fd]">
            PROJECT DELIVERY PLATFORM
          </p>

          <h2 className="text-5xl font-black leading-tight md:text-7xl">
            Manage Every{" "}
            <span className="bg-gradient-to-r from-[#8b5cf6] to-[#22d3ee] bg-clip-text text-transparent">
              Requirement
            </span>{" "}
            Clearly
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-xl leading-9 text-slate-400">
            A secure platform to manage PRDs, change requests, approvals, and
            project progress between companies and clients.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <button
              onClick={() => router.push("/login")}
              className="rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#22d3ee] px-8 py-4 text-lg font-black text-white hover:opacity-90"
            >
              Start Project Flow
              <ArrowRight className="ml-2 inline h-5 w-5" />
            </button>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-[32px] border border-white/10 bg-[#141a2e] p-12 text-center shadow-xl">
          
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8b5cf6]/20 text-[#22d3ee]">
            <LockKeyhole className="h-8 w-8" />
          </div>

          <h2 className="text-4xl font-black">Ready to get started?</h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-400">
            Login and manage your requirement workflow professionally.
          </p>

          <div className="mt-9 flex justify-center gap-4">
            <button
              onClick={() => router.push("/login")}
              className="rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#22d3ee] px-9 py-4 text-lg font-black text-white hover:opacity-90"
            >
              Go to Login
            </button>

            <button
              onClick={() => router.push("/login")}
              className="rounded-2xl border border-white/15 bg-white/5 px-9 py-4 text-lg font-black text-white hover:bg-white/10"
            >
              Go to Register
            </button>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#12172a] py-8 text-center text-slate-500">
        © 2026 CRMS · VisionForge
      </footer>

    </main>
  );
}