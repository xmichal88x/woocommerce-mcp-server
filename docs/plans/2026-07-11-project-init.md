# Project Init Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Initialize Node.js + TypeScript project structure for WooCommerce MCP Server

**Architecture:** Greenfield project — create package.json, tsconfig.json, .env.example, src/index.ts, update .gitignore, install all deps, verify compilation

**Tech Stack:** Node.js, TypeScript, MCP SDK, Zod, Vitest, ESLint

---

### Task 1: Init projektu

**Files:**

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.env.example`
- Create: `src/index.ts`
- Modify: `.gitignore`

**Step 1: Create all config files**

Create `package.json` with all dependencies listed in the task spec.

Create `tsconfig.json` with strict ES2022/NodeNext config.

Create `.env.example` with WooCommerce connection vars and security settings.

Create `src/index.ts` with placeholder entry point.

Update `.gitignore` to ignore `node_modules/`, `build/`, `.env`, `dist/`.

**Step 2: Install dependencies**

Run: `npm install`

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: exit code 0, no errors

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: initialize project structure"
```

### Verification

1. `npx tsc --noEmit` — exit code 0
2. All files present: package.json, tsconfig.json, .env.example, src/index.ts
3. `.gitignore` contains node_modules, build, .env, dist
