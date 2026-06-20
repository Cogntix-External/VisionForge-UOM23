// ─────────────────────────────────────────────────────────
// api.js  —  Legacy re-export wrapper
//
// This file keeps existing imports working:
//   import { login } from "../services/api"
//
// All actual logic has been moved to individual service files.
// Prefer importing from specific modules:
//   import { login } from "../services/authService"
//   import { getCompanyProjects } from "../services/projectService"
//   import { ... } from "../services"  (barrel)
// ─────────────────────────────────────────────────────────

export * from "./index.js";
