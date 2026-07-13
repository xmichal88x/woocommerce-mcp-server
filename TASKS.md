# Tasks

## Sesja 2026-07-13 — wszystkie 7 zadań wykonane

### X7 — Split products.ts na 4 moduły

- [x] completed: products-crud.ts (6 tooli CRUD)
- [x] completed: products-taxonomy.ts (19 tooli taksonomii)
- [x] completed: products-misc.ts (12 tooli misc)
- [x] completed: products.ts jako index aggregator
- Verification: lint ✅ type-check ✅ testy 51/51 ✅

### X10 — email.ts SMTP check → throw SmtpNotConfiguredError

- [x] completed: SmtpNotConfiguredError w errors.ts + safeError case
- [x] completed: throw w email.ts zamiast return {isError: true}

### X5 — Usunięcie `: Record<string, unknown>` z handlerów

- [x] completed: panel.ts (4), system.ts (8), configurator.ts (4), shipping.ts (1)

### X3 — Rename `limit` → `per_page` w products_lite_list

- [x] completed: rename + `.strict()` w panel.ts

### X8 — HTTPS localhost exception + WC_ALLOW_HTTP

- [x] completed: isLoopbackHost + auto-wyjątek w config.ts

### X9 — taxes_rates_list → makeListHandler

- [x] completed: makeListHandler('taxes/rates', ..., 'tax_rates') w taxes.ts

### X6 — Ekstrakcja ApiResponse<T> do types.ts

- [x] completed: ApiResponse w types.ts, użyte w client.ts i plugin-client.ts

### Pre-existing fixes (code-review)

- [x] completed: `config.ts` — SSRF loopback check rozszerzony na `firstOctet === 127` (całe 127.x.x.x)
- [x] completed: `products-crud.ts` — `.positive()` na `categories.id`, `tags.id`, `delete` w batch
- [x] completed: `products-taxonomy.ts` — `.positive()` na `parent` w categories_create/update
- [x] completed: `utils.ts` — `makeListHandler` filter undefined values przed wysłaniem params

## Pre-existing (złożone — do rozważenia)

- `products-crud.ts` — `products_batch` create/update używa `.passthrough()` bez walidacji pól. Świadoma decyzja (batch API potrzebuje elastyczności), ale warto rozważyć dodanie minimalnej walidacji w przyszłości.
