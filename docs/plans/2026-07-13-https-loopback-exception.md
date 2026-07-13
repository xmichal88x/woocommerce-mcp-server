# HTTPS Loopback Exception Implementation Plan

**Goal:** Add auto-exception for loopback hosts (localhost, 127.0.0.1, ::1) and optional `WC_ALLOW_HTTP` flag to HTTPS enforcement

**Architecture:** Single file change in `src/config.ts` — add loopback detection helper, modify HTTPS check, SSRF block, and allowed domains check to skip enforcement for loopback hosts.

**Tech Stack:** Node.js + TypeScript

---

### Task 1: Add loopback helper + modify HTTPS/SSRF/domain checks

**Files:**

- Modify: `src/config.ts` (4 locations)

**Changes:**

1. After imports, before interfaces — add `LOOPBACK_HOSTS` Set and `isLoopbackHost()` helper
2. Lines 79-81 — HTTPS check: allow loopback + `WC_ALLOW_HTTP` flag
3. Line 85 — SSRF block: skip for loopback hosts
4. Line 120 — allowed domains check: skip for loopback hosts
