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

**Status:** pending
**Priority:** low

### Opis

Logika retry w `withRetry()` (`src/plugin-client.ts`) jest kopią kodu z `client.ts:59-87`. Wydzielić do wspólnego pliku `src/retry.ts`, zaimportować w obu miejscach. Uwaga: `client.ts` używa `WooCommerceClient` interface, a `plugin-client.ts` używa `AxiosInstance` — funkcja powinna być generyczna (accept `T`, zwraca `T` z wrapped metodami).

### Pliki

- `src/retry.ts` (nowy)
- `src/client.ts` (refactor)
- `src/plugin-client.ts` (refactor)
