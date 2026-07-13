# X4 — readOnlyError vs withErrorHandling — Plan Naprawy

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unified error pipeline — wszystkie błędy przechodzą przez `safeError()` w `withErrorHandling`

**Architecture:** Dodanie `ReadOnlyError extends Error`, obsługa w `safeError()`, dodanie `assertWriteAccess()` w utils.ts, usunięcie `readOnlyError()`, zmiana ~60 handlerów z early return na throw wewnątrz callbacka.

**Root cause:** Guard read-only jest pre-conditionem PRZED `withErrorHandling` zamiast być integralną częścią pipeline'a błędów.

---

### Task 1: ReadOnlyError class + safeError update

**Files:**

- Modify: `src/errors.ts`

**Step 1: Add `class ReadOnlyError extends Error`**

Dodać przed definicją `safeError()`:

```typescript
export class ReadOnlyError extends Error {
  constructor() {
    super('Server is in read-only mode. This operation is not allowed.');
    this.name = 'ReadOnlyError';
  }
}
```

**Step 2: Add `instanceof ReadOnlyError` check in `safeError()`**

Przed ogólnym `error instanceof Error` catch-all dodać:

```typescript
if (error instanceof ReadOnlyError) {
  return { code: 'READ_ONLY', message: error.message, actionable: false };
}
```

**Step 3: Verify**

Run: `npm run lint && npm run type-check`
Expected: ✅ No errors

---

### Task 2: assertWriteAccess() + remove readOnlyError()

**Files:**

- Modify: `src/utils.ts`

**Step 1: Add `import { ReadOnlyError } from './errors.js'`**

**Step 2: Add `assertWriteAccess()`**

```typescript
export function assertWriteAccess(): void {
  if (isReadOnly()) throw new ReadOnlyError();
}
```

Import `isReadOnly` z `./client.js` jeśli jeszcze nie zaimportowany.

**Step 3: Remove `readOnlyError()` function** — usuń całą funkcję (linie 17-35).

**Step 4: Remove import `readOnlyError` from exports** — upewnij się że nie jest eksportowane.

**Step 5: Verify**

Run: `npm run lint && npm run type-check`
Expected: ✅ No errors

---

### Task 3-11: Update all 9 tool files (~60 handlers)

**Files to modify (each is a separate task if needed):**

- `src/tools/products.ts` (~24 handlers)
- `src/tools/orders.ts` (~6 handlers)
- `src/tools/customers.ts` (~4 handlers)
- `src/tools/coupons.ts` (~4 handlers)
- `src/tools/shipping.ts` (~6 handlers)
- `src/tools/taxes.ts` (~5 handlers)
- `src/tools/panel.ts` (~7 handlers)
- `src/tools/media.ts` (~2 handlers)
- `src/tools/email.ts` (~1 handler)

**Pattern change (for ALL mutation handlers):**

Before:

```typescript
handler: async (args) => {
  if (isReadOnly()) return readOnlyError();
  return withErrorHandling(async () => {
    // ... handler logic
  });
},
```

After:

```typescript
handler: async (args) =>
  withErrorHandling(async () => {
    assertWriteAccess();
    // ... handler logic
  }),
```

Note:

- If the handler was a single-expression arrow function `(args) => withErrorHandling(...)`, and had NO readOnly check, leave it unchanged.
- If the handler had `{ if (isReadOnly()) return readOnlyError(); return withErrorHandling(...) }`, change to `withErrorHandling(async () => { assertWriteAccess(); ... })`
- Remove `readOnlyError` from imports if no longer used
- Keep `isReadOnly` import only if used elsewhere in the file
- Add `assertWriteAccess` to imports

**Step per file: Verify**

Run: `npm run lint && npm run type-check`
Expected: ✅ No errors

---

### Task 12: Final verification

**Step 1: Run all checks**

```bash
npm run lint && npm run type-check && npm test
```

Expected: ✅ All pass

**Step 2: Update TASKS.md** — mark X4 as `completed`

---

### Verification

After all tasks:

1. **Format & Lint** — `npm run lint && npm run type-check`
2. **Tests** — `npm test` (all pass)
3. **No leftover `readOnlyError()` calls** — grep for `readOnlyError()` should return 0 (unless in test files that verify old behavior)
4. **No leftover `if (isReadOnly()) return readOnlyError()`** — grep should return 0
