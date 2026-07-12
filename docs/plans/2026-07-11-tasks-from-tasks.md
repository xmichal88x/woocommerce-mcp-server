# Tasks from TASKS.md - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task.

**Goal:** Execute 3 pending tasks from TASKS.md: DRY readOnlyError, Zod runtime validation, SSRF protection.

**Architecture:** Tasks are independent but touch overlapping files. Execute sequentially. Each task: implement → lint → type-check → test → verify.

**Tech Stack:** Node.js + TypeScript, Zod, vitest

---

## Task List

### Task 1: DRY — Przenieś `readOnlyError()` do współdzielonego modułu

**Pliki:**

- Create: `src/utils.ts`
- Modify: `src/tools/products.ts`, `src/tools/orders.ts`, `src/tools/customers.ts`, `src/tools/coupons.ts`, `src/tools/shipping.ts`, `src/tools/taxes.ts`

**Opis:** Funkcja `readOnlyError()` jest zdefiniowana w 6 plikach z identyczną implementacją. Przenieś do `src/utils.ts` i zaimportuj we wszystkich plikach.

**Kroki:**

1. Utwórz `src/utils.ts` z `readOnlyError()` (export)
2. W każdym z 6 plików: usuń lokalną definicję, dodaj import z `../utils.js`
3. Uruchom `npm run type-check` i `npm test`

### Task 2: Zod runtime validation na inputach tooli

**Pliki:** Wszystkie `src/tools/*.ts`

**Opis:** `inputSchema` jest metadane dla klienta AI — MCP SDK nie waliduje runtime. Dodaj Zod do walidacji parametrów w każdym handlerze.

**Kroki:**

1. Utwórz helper w `src/utils.ts` — funkcję `validateWithZod(schema: z.ZodType, args: unknown)` która rzuca czytelny błąd przy nieprawidłowych danych
2. Dla każdego toola z `required` params: dodaj Zod schema do handlera
3. Uruchom `npm run type-check` i `npm test`

### Task 3: SSRF protection — lista dozwolonych domen

**Plik:** `src/config.ts`

**Opis:** Tylko HTTPS jest wymuszane. Adres URL może wskazywać na dowolny wewnętrzny serwer HTTPS. Dodaj opcjonalną listę dozwolonych domen w env `WC_ALLOWED_DOMAINS`.

**Kroki:**

1. W `getConfig()`: odczytaj `WC_ALLOWED_DOMAINS` z env
2. Jeśli ustawione: sparsuj URL, sprawdź czy hostname znajduje się na liście
3. Zaktualizuj `Config` interface i `.env.example`
4. Uruchom `npm run type-check` i `npm test`

---

## Verification

After all tasks:

1. `npm run format:check && npm run lint && npm run type-check && npm test`
2. Sprawdź pre-existing errors
3. Zaktualizuj TASKS.md
