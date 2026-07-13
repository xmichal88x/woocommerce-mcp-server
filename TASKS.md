# Tasks

## E1 — Cache'owanie klienta WordPress REST API (getWpClient)

**Status:** completed
**Priority:** medium

### Opis

Dodano `getWpClient()` i `resetWpClient()` do `src/plugin-client.ts` (wzór: `getPanelClient()`). Zaktualizowano `src/tools/media.ts` — 3 wystąpienia `axios.create()` zastąpione `getWpClient()`.

### Pliki

- `src/plugin-client.ts`
- `src/tools/media.ts`

### Verification

- `npm run lint && npm run type-check`

---

## E2 — Dodanie retry/backoff do src/plugin-client.ts

**Status:** completed
**Priority:** high

### Opis

Dodano funkcję `withRetry()` do `src/plugin-client.ts` (wzorowaną na `client.ts:59-87`), która wrapuje axios instancję w Proxy z exponential backoff retry. Zastosowano w `getPanelClient()` i `getWpClient()`.

### Pliki

- `src/plugin-client.ts`

### Verification

- `npm run lint && npm run type-check`

---

## E3 — Brakujące pola WooProduct

**Status:** completed
**Priority:** low

### Opis

Dodano 29 brakujących pól do interfejsu `WooProduct` w `src/types.ts` (`featured`, `catalog_visibility`, `reviews_allowed`, `average_rating`, `rating_count`, `manage_stock`, `backorders`, `backorders_allowed`, `backordered`, `sold_individually`, `shipping_class`, `shipping_class_id`, `downloadable`, `downloads`, `price_html`, `menu_order`, `parent_id`, `related_ids`, `date_on_sale_from`, `date_on_sale_to`, `virtual`, `weight`, `dimensions`, `tax_status`, `tax_class`, `purchase_note`, `in_stock`).

### Pliki

- `src/types.ts`

### Verification

- `npm run lint && npm run type-check`

---

## C15 — DRY: wydzielenie wspólnej funkcji retry/Proxy

**Status:** completed
**Priority:** low

### Opis

Utworzono `src/retry.ts` z generyczną `withRetry<T extends object>(instance: T): T`. Zaktualizowano `src/client.ts` (zastąpiono inline Proxy wywołaniem `withRetry(api)`) i `src/plugin-client.ts` (usunięto lokalną `withRetry`, dodano import).

### Pliki

- `src/retry.ts` (nowy)
- `src/client.ts` (refactor)
- `src/plugin-client.ts` (refactor)

### Verification

- `npm run lint && npm run type-check` ✅
- `npm run build` ✅
- `npm test` — 38/38 passed ✅

---

## C16 — Fix TypeScript errors: `Record<string, unknown>` type assertion

**Status:** completed
**Priority:** medium

### Opis

3 błędy TS w rzutowaniu typów na `Record<string, unknown>` — brak index signature, wymagane `unknown` pośrednie:

1. `src/client.ts:7` — `typeof WooCommerceRestApi` → `Record<string, unknown>` (CJS/ESM compat)
2. `tests/errors.test.ts:7` — `Error` → `Record<string, unknown>`
3. `tests/errors.test.ts:96` — `Error` → `Record<string, unknown>`

### Fix

W każdym przypadku dodać `as unknown` pośrednie:

```typescript
// Before:
WooCommerceRestApiModule as Record<string, unknown>;
// After:
WooCommerceRestApiModule as unknown as Record<string, unknown>;
```

### Pliki

- `src/client.ts`
- `tests/errors.test.ts`

### Verification

- `npm run lint && npm run type-check`

---

## C17 — Fix ESLint warnings

**Status:** completed
**Priority:** low

### Opis

3 warningi ESLint:

1. `build/config.d.ts:5` — `ALL_GROUPS` zdefiniowany ale tylko jako typ, powinien mieć prefix `_` lub zostać usunięty (build artifact — sprawdzić czy potrzebny)
2. `eslint.config.js:4` — anonimowy default export tablicy, przypisać do zmiennej
3. `tests/tools/products.test.ts:28` — `mockReadOnlyClient` zdefiniowany ale nieużywany, dodać prefix `_`

### Pliki

- `build/config.d.ts`
- `eslint.config.js`
- `tests/tools/products.test.ts`

### Verification

- `npm run lint`

---

## X1 — Stabilizacja CJS/ESM compat w src/client.ts

**Status:** pending
**Priority:** low

### Opis

Podwójne `as unknown as Record<string, unknown>` przy imporcie `@woocommerce/woocommerce-rest-api` (linia 7-9) jest kruche i traci bezpieczeństwo typów. Przy upgrade paczki może cicho przestać działać.

### Sugestia

Rozważyć użycie `// @ts-expect-error` z opisem lub dedykowanego wrappera z testem runtime sprawdzającym `typeof WooCommerceRestApi === 'function'`.

### Pliki

- `src/client.ts`

---

## X2 — Walidacja duplikatów nazw tooli w src/groups.ts

**Status:** pending
**Priority:** low

### Opis

Jeśli dwie grupy zarejestrują tool o tej samej nazwie, druga nadpisuje pierwszą bez ostrzeżenia. Np. grupa `panel` i inna grupa mają tool `faq_list` — jeden zostanie zgubiony.

### Sugestia

Dodać warning w `registerGroup()` gdy nazwa toola już istnieje w registry.

### Pliki

- `src/groups.ts`
