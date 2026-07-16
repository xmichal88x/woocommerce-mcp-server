# AGENTS.md — WooCommerce MCP Server

Obowiązują **globalne reguły** z `~/.config/opencode/AGENTS.md`. Główny agent tylko analizuje i deleguje, nigdy nie pisze kodu.

---

## 1. Technologie

- Framework: Node.js + TypeScript
- Główne biblioteki: @modelcontextprotocol/sdk, Zod, axios
- Cel: MCP server do zarządzania sklepem WooCommerce przez AI agenta

## 2. Źródła odniesienia (kod źródłowy do analizy przed implementacją)

### techspawn/woocommerce-mcp-server

- URL: https://github.com/techspawn/woocommerce-mcp-server
- Cel: inspiracja architektury, lista tooli MCP (produkty, zamówienia, klienci, płatności)
- Co przejąć: listę endpointów WooCommerce API, strukturę tooli, env vars
- Co pominąć: brak walidacji (Zod), brak MCP SDK, leak sekretów w params

### @modelcontextprotocol/sdk

- URL: https://github.com/modelcontextprotocol/typescript-sdk
- Cel: oficjalne MCP SDK — Server, tool definitions, transport
- Co przejąć: implementacja Server, McpServer, tool rejestracja

### mvanhorn/cli-printing-press

- URL: https://github.com/mvanhorn/cli-printing-Press
- Cel: generator CLI + MCP server z OpenAPI spec — koncepcja generowania MCP z istniejącej specyfikacji WooCommerce REST API
- Co przejąć: podejście do generowania narzędzi z API, SQLite cache (warstwa offline), compound commands (stale/health/trends), compact output dla agentów

### iOSDevSK/mcp-for-woocommerce

- URL: https://github.com/iOSDevSK/mcp-for-woocommerce
- Cel: wtyczka WP jako MCP — architektura read-only, JWT auth, dual transport
- Co przejąć: koncepcja Streamable HTTP, JWT authentication pattern

## 3. Komendy

```bash
npm run dev
npm run build
npm test
npm run lint
npm run type-check
```

## 4. Agent Architecture — Reguły Postępowania

### 4.1 Główny agent

Główny agent **NIGDY** nie pisze kodu ani nie edytuje plików. Jego rola:

1. **Analizuje** — rozumie zadanie, czyta kod, identyfikuje co trzeba zrobić
2. **Dzieli** — rozbija pracę na niezależne, atomowe zadania (1 zadanie = 1 konkretna zmiana)
3. **Zapisuje** — tworzy listę zadań przez `todowrite` (status: pending)
4. **Deleguje** — KAŻDE zadanie do osobnego subagenta przez `Task` tool
5. **Weryfikuje** — odbiera wyniki, sprawdza jakość, aktualizuje `todowrite` na `completed`

### 4.2 Subagenci

- **1 subagent = 1 atomowe zadanie.** Nigdy więcej.
- Jeśli zadanie wymaga 10 kroków → to znaczy, że wymaga 10 subagentów.
- **Implementacja ≠ Debugowanie:**
  - **Implementacja** — zadania wykonuj SEKWENCYJNIE (1 subagent naraz), bo zmiany w tej samej bazie kodu konfliktują.
  - **Debugowanie/testy** — niezależne problemy badaj RÓWNOLEGLE (wielu subagentów naraz).
- Subagent wykonuje zadanie i zwraca wynik. Główny agent przekazuje subagentowi tylko jego zadanie + kontekst (subagent NIE ma dostępu do todo głównego agenta).

### 4.3 Workflow dla kodu

1. Subagent czyta istniejący kod, rozumie kontekst
2. Subagent wprowadza zmianę (edytuje lub tworzy pliki)
3. Subagent uruchamia: linter → type checker → testy (jeśli dostępne)
4. Subagent zgłasza wynik agentowi głównemu
5. Agent główny weryfikuje (`verification-before-completion`), aktualizuje `todowrite`
6. Po wszystkich zadaniach → `code-reviewer` dla całościowego przeglądu

## 5. System śledzenia zadań

**`todowrite`** — główny system śledzenia zadań podczas sesji.

**`TASKS.md`** — persistent storage między sesjami. Na początku sesji odczytaj TASKS.md i przenieś do `todowrite`. Na koniec sesji zaktualizuj TASKS.md na podstawie stanu z `todowrite`.

Stany: `pending` → `in_progress` → `completed` / `cancelled`.

## 6. Kaizen — Oportunistyczna Poprawa Kodu

Podczas pracy zawsze wypatruj okazji do poprawy jakości kodu:

- Każda znaleziona okazja → OSOBNE zadanie na `todowrite`
- Poprawki deleguj przez `code-refactoring-refactor-clean`
- **1 zadanie = 1 poprawka.** Nie łącz poprawy jakości z głównym zadaniem.
- Subagent widzący okazję zgłasza ją agentowi głównemu (nie robi tego sam).

## 7. Skills Activation

Przy każdej sesji aktywuj skille pasujące do zadania:

**Obowiązkowe:**

- `writing-plans` — plan przed implementacją
- `subagent-driven-development` — wykonanie przez subagentów
- `verification-before-completion` — weryfikacja przed zakończeniem
- `kaizen` — ciągłe ulepszanie

**Opcjonalne (gdy pasują):**

- `code-reviewer` — przegląd kodu
- `debugger` / `systematic-debugging` — debugowanie
- `dispatching-parallel-agents` — wielu subagentów równolegle dla debugowania/testów
- `code-refactoring-refactor-clean` — poprawa jakości kodu przez subagenta
- `executing-plans` — wykonanie planu w osobnej sesji

## 8. Verification Gate

Przed uznaniem zadania za zakończone:

1. Uruchom linter
2. Uruchom type checker (jeśli dostępny dla języka)
3. Uruchom testy (jednostkowe i integracyjne)
4. Sprawdź czy nie ma regresji
5. **DOPIERO WTEDY** zmień status `todowrite` na `completed`

## 9. Uwagi architektoniczne

### Bezpieczeństwo — ZASADY

1. Żadne sekrety (consumer_key, consumer_secret, hasła) NIGDY nie są akceptowane w `params` JSON-RPC — tylko env vars
2. Każdy tool wymaga walidacji inputu przez Zod
3. `siteUrl` ograniczony do dozwolonych domen (brak SSRF)
4. Błędy NIGDY nie zwracają `error.response?.data` — tylko ogólny komunikat
5. Domyślnie tryb read-only dla niezaufanych klientów
6. Wymuszony HTTPS dla WooCommerce API

### Tool design

- Każdy tool ma osobny plik w `src/tools/*.ts`
- Tool = Zod schema + handler + error handling
- Grupowanie: products, orders, customers, coupons, shipping, taxes, reports, system, email

### Email — funkcjonalność wykraczająca poza oryginał

- Wysyłanie emaili przez `wp_mail` lub SMTP
- Osobny tool: `send_email`, `send_order_email`, `send_custom_email`

### Testy

- Testy jednostkowe dla walidacji (Zod schemas)
- Testy integracyjne z mockiem WooCommerce API (axios mock adapter)
- Testy bezpieczeństwa: SSRF, input validation, secret leak
