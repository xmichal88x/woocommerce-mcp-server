# Architektura WooCommerce MCP Server

## 1. Executive Summary

WooCommerce MCP Server to serwer implementujący protokół MCP (Model Context Protocol, specyfikacja `@modelcontextprotocol/sdk`), który umożliwia AI agentom zarządzanie sklepem WooCommerce za pośrednictwem zestandaryzowanych narzędzi. Projekt jest napisany w TypeScript/Node.js (ES2022, moduły ESM) i komunikuje się z WooCommerce REST API (wc/v3) przez oficjalne SDK `@woocommerce/woocommerce-rest-api`.

**Główne cechy:**

- ~154 narzędzi MCP zgrupowanych w 12 kategoriach (produkty, zamówienia, klienci, kupony, wysyłka, podatki, raporty, system, email, konfigurator, panel, media)
- W pełni typowany — TypeScript strict mode, interfejsy dla wszystkich encji WooCommerce
- Walidacja każdego inputu przez Zod
- Wielowarstwowe zabezpieczenia: wymuszony HTTPS, SSRF protection, tryb read-only, lista dozwolonych domen
- Proxy API z retry logic (exponential backoff)
- Cache'owany klient WordPress REST API (media) i Panel API (konfigurator, panel)
- Generyczny handler listowania z automatyczną paginacją
- System logowania strukturalnego (JSONL na stderr)
- Selektywne włączanie/wyłączanie grup narzędzi przez zmienną środowiskową

---

## 2. Architecture Overview

### Diagram komponentów

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AI Agent (MCP Host/Client)                      │
│              (Claude Desktop, Cursor, inny host MCP)               │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ JSON-RPC over stdio (MCP Protocol)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     WooCommerce MCP Server                          │
│                                                                     │
│  ┌──────────┐   ┌──────────┐   ┌────────────────────────────────┐  │
│  │ index.ts │──▶│ server   │──▶│ Tool Registry (groups.ts)      │  │
│  │ (entry)  │   │ (MCP)   │   │  ├─ products (59 tools)        │  │
│  └──────────┘   └──────────┘   │  ├─ orders (11 tools)         │  │
│                                │  ├─ customers (7 tools)       │  │
│  ┌──────────┐   ┌──────────┐   │  ├─ coupons (7 tools)        │  │
│  │ config   │──▶│ client   │──▶│  ├─ shipping (10 tools)      │  │
│  │ .ts      │   │ (proxy)  │   │  ├─ taxes (8 tools)          │  │
│  └──────────┘   └────┬─────┘   │  ├─ reports (8 tools)       │  │
│                      │         │  ├─ system (9 tools)         │  │
│  ┌──────────┐        │         │  ├─ email (1 tool)           │  │
│  │ errors.ts│◀───────┤         │  ├─ configurator (5 tools)   │  │
│  └──────────┘        │         │  ├─ panel (8 tools)          │  │
│                      │         │  └─ media (3 tools)          │  │
│  ┌──────────┐        │         └────────────────────────────────┘  │
│  │ types.ts │        │                 ▲                           │
│  └──────────┘        │                 │                           │
│                      │       ┌──────────────────┐                  │
│  ┌──────────┐        │       │ plugin-client.ts │                  │
│  │schemas.ts│        │       │ getWpClient()    │                  │
│  └──────────┘        │       │ getPanelClient() │                  │
│                      │       └──────────────────┘                  │
│         ┌──────────┐ │                                              │
│         │ utils.ts │ │                                              │
│         │(validate,│ │                                              │
│         │ handler  │ │                                              │
│         │ helpers) │ │                                              │
│         └──────────┘ │                                              │
└──────────────────────┼──────────────────────────────────────────────┘
                       │ HTTPS (WooCommerce REST API v3)
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   WooCommerce Store (PHP/MySQL)                     │
│              (docelowy sklep z zainstalowanym WooCommerce)          │
└─────────────────────────────────────────────────────────────────────┘
```

### Przepływ danych (high-level)

1. **AI Agent** → wysyła `CallTool` (JSON-RPC) przez stdio
2. **server.ts** → odbiera żądanie, loguje, znajduje narzędzie w registry
3. **Tool handler** → waliduje argumenty przez `validateArgs()` (Zod)
4. **Helpery** (`withErrorHandling`) → otaczają wykonanie
5. **client.ts** → wysyła zapytanie HTTP(S) do WooCommerce API przez axios proxy z retry. **plugin-client.ts** (getWpClient()/getPanelClient()) jako alternatywny klient dla narzędzi media, panel i configurator
6. **WooCommerce** → zwraca odpowiedź JSON
7. **Server** → formatuje odpowiedź jako `content: [{ type: 'text', text: ... }]` i zwraca przez stdio

---

## 3. Core Components

### 3.1 `src/index.ts` — Punkt wejścia

**Linie: 1–24**

Rola: ładuje konfigurację, importuje wszystkie grupy narzędzi (przez side-effect import), startuje serwer.

```typescript
import { startServer } from './server.js';
import { getConfig } from './config.js';
import { safeError } from './errors.js';
import './tools/products.js'; // side-effect: registerGroup()
// ... pozostałe grupy
```

Kluczowa cecha: grupy narzędzi są **rejestrowane przez side-effect** — sam import pliku `tools/products.ts` wywołuje `registerGroup()` w globalnym registry (`groups.ts`).

### 3.2 `src/server.ts` — Serwer MCP

**Linie: 1–120**

Implementacja serwera MCP z użyciem `@modelcontextprotocol/sdk`:

- **Transport:** `StdioServerTransport` — komunikacja przez stdin/stdout w formacie JSON-RPC
- **Request Handlers:**
  - `ListToolsRequestSchema` — zwraca listę aktywnych narzędzi (filtrowanych przez `getActiveTools()`)
  - `CallToolRequestSchema` — znajduje narzędzie po nazwie, wywołuje handler, obsługuje błędy
- **Logowanie:** strukturalne logi JSON przez `console.error()` na stderr
- **Poziomy logowania:** `WC_LOG_LEVEL` (debug/info/error)
- **Obsługa błędów:** każdy błąd przechodzi przez `safeError()` → zwracany jako `{isError: true, content: [{type: 'text', text: '[CODE] message'}]}`

### 3.3 `src/config.ts` — Konfiguracja

**Linie: 1–131**

Waliduje zmienne środowiskowe i zwraca obiekt `Config`:

| Zmienna                       | Wymagana | Domyślnie | Opis                         |
| ----------------------------- | -------- | --------- | ---------------------------- |
| `WOOCOMMERCE_URL`             | **Tak**  | —         | URL sklepu (tylko HTTPS)     |
| `WOOCOMMERCE_CONSUMER_KEY`    | **Tak**  | —         | Klucz API WooCommerce        |
| `WOOCOMMERCE_CONSUMER_SECRET` | **Tak**  | —         | Sekret API WooCommerce       |
| `WC_READ_ONLY`                | Nie      | `false`   | Tryb read-only               |
| `WC_TIMEOUT_MS`               | Nie      | `15000`   | Timeout zapytań (ms)         |
| `WC_RETRY_COUNT`              | Nie      | `3`       | Liczba retry                 |
| `WC_BLOCK_PRIVATE_IPS`        | Nie      | `true`    | Blokada prywatnych IP (SSRF) |
| `WC_ALLOWED_DOMAINS`          | Nie      | —         | Lista dozwolonych domen      |
| `WC_TOOL_GROUPS`              | Nie      | `all`     | Które grupy narzędzi włączyć |
| `WC_LOG_LEVEL`                | Nie      | `info`    | Poziom logowania             |

**SSRF Protection (`src/config.ts:73-106`):**

- Blokada IPv4 prywatnych: 127.0.0.1, 10.x.x.x, 172.16-31.x.x, 192.168.x.x, 0.0.0.0
- Blokada IPv6 prywatnych: ::1, fc00::/7, fe80::/10
- Opcjonalna lista dozwolonych domen (`WC_ALLOWED_DOMAINS`)

### 3.4 `src/client.ts` — Klient WooCommerce API

**Linie: 1–111**

Singleton opakowujący `@woocommerce/woocommerce-rest-api` z **Proxy Pattern** dla retry logic.

**Retry Logic (`src/client.ts:60-86`):**

- Proxy JavaScript przechwytuje każde wywołanie metody (`get`, `post`, `put`, `delete`)
- Dla każdego błędu sprawdza status HTTP: błędy 4xx są **rzucane od razu** (nie są retry)
- Błędy sieciowe i 5xx są retry z exponential backoff: `timeout = 2^attempt * 500ms`
- Maksymalna liczba prób: `WC_RETRY_COUNT` (domyślnie 3)

> **Uwaga:** identyczny wzorzec retry z `withRetry()` istnieje w `src/plugin-client.ts` dla obu klientów (panel i WP REST API).

**Read-only (`src/client.ts:101-106`):**

- `isReadOnly()` — sprawdza `WC_READ_ONLY`
- Cache'uje wynik, resetowany przez `resetClient()`

### 3.5 `src/errors.ts` — Obsługa błędów

**Linie: 1–82**

Bezpieczna, scentralizowana obsługa błędów — **żadne szczegóły odpowiedzi WooCommerce nie wyciekają**.

```typescript
interface SafeError {
  code: string; // "VALIDATION_ERROR" | "HTTP_404" | "NETWORK_ERROR" | itp.
  message: string; // Ogólny, bezpieczny komunikat
  actionable: boolean; // Czy błąd może być naprawiony przez zmianę inputu
}
```

**Mapowanie kodów HTTP (`src/config.ts:9-17`):**

- 400 → `Invalid request. Check the parameters and try again.`
- 401 → `Authentication failed. Check WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET.`
- 403 → `Access denied. Your API credentials lack permission for this action.`
- 404 → `Resource not found. The requested item does not exist.`
- 429 → `Too many requests. Please wait and try again.`
- 500 → `WooCommerce server error. The store might be experiencing issues.`
- 503 → `Service unavailable. The store might be in maintenance mode.`

**Obsługiwane typy błędów:**

1. `ZodError` → `VALIDATION_ERROR` (actionable: true)
2. HTTP errors z mapy → `HTTP_{status}` (actionable: 4xx = true, 5xx = false)
3. Network errors: `ENOTFOUND`/`ECONNREFUSED` → `NETWORK_ERROR`
4. Timeout: `ECONNABORTED` → `TIMEOUT`
5. Wszystko inne → `UNKNOWN_ERROR`

### 3.6 `src/groups.ts` — Registry narzędzi

**Linie: 1–35**

Centralny rejestr grup narzędzi oparty na `Map<ToolGroup, ToolGroupDefinition>`.

```typescript
interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>; // JSON Schema dla MCP
  handler: (args: Record<string, unknown>) => Promise<MCPResponse>;
}

interface ToolGroupDefinition {
  name: ToolGroup; // 'products' | 'orders' | ...
  tools: ToolDefinition[];
}
```

**Funkcje:**

- `registerGroup(group)` — dodaje grupę do rejestru
- `getActiveTools()` — zwraca tylko narzędzia z włączonych grup (filtrowane przez `WC_TOOL_GROUPS`)

### 3.7 `src/utils.ts` — Helpery

**Linie: 1–74**

Zestaw funkcji pomocniczych używanych przez wszystkie grupy narzędzi:

| Funkcja                                      | Opis                                                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `validateArgs(schema, args)`                 | Walidacja args przez Zod, rzuca `ZodError`                                                              |
| `readOnlyError()`                            | Zwraca standardową odpowiedź błędu dla trybu read-only                                                  |
| `withErrorHandling(fn)`                      | Wrapuje async funkcję, łapie wyjątki i zwraca bezpieczny `SafeError`                                    |
| `makeListHandler(endpoint, schema, dataKey)` | **Generyczny handler listowania** — tworzy handler dla endpointu z walidacją, paginacją i formatowaniem |

**`makeListHandler` w szczegółach:**

```typescript
makeListHandler('products', z.object({...}), 'products')
// Tworzy handler który:
// 1. Waliduje args przez Zod schema
// 2. Wywołuje client.get(endpoint, params)
// 3. Wyciąga paginację z nagłówków (x-wp-total, x-wp-totalpages)
// 4. Zwraca { [dataKey]: data, total, totalPages }
```

### 3.8 `src/schemas.ts` — Współdzielone schematy Zod

**Linie: 1–32**

Współdzielone schematy dla struktur powtarzalnych w WooCommerce API:

- `billingSchema` — adres rozliczeniowy (first_name, last_name, company, address_1/2, city, state, postcode, country, email, phone)
- `shippingSchema` — adres wysyłki (j.w. bez email/phone)
- `metaDataSchema` — meta_data (key + value)

### 3.9 `src/types.ts` — Typy TypeScript

**Linie: 1–229**

Pełne typy dla odpowiedzi WooCommerce REST API:

| Interfejs           | Opis                                                                   |
| ------------------- | ---------------------------------------------------------------------- |
| `WooProduct`        | Produkt (67 pól: id, name, type, status, price, images, attributes...) |
| `WooOrder`          | Zamówienie (25+ pól: status, total, billing, line_items...)            |
| `WooAddress`        | Adres                                                                  |
| `WooLineItem`       | Pozycja zamówienia                                                     |
| `WooShippingLine`   | Linia wysyłki                                                          |
| `WooTaxLine`        | Linia podatku                                                          |
| `WooFeeLine`        | Opłata                                                                 |
| `WooCouponLine`     | Kupon na zamówieniu                                                    |
| `WooCustomer`       | Klient                                                                 |
| `WooCoupon`         | Kupon rabatowy                                                         |
| `WooShippingZone`   | Strefa wysyłki                                                         |
| `WooShippingMethod` | Metoda wysyłki                                                         |
| `WooTaxRate`        | Stawka podatku                                                         |
| `PaginationInfo`    | `{ total, totalPages }`                                                |

**`extractPagination()`** (`src/types.ts:249-263`):

- Wyciąga `x-wp-total` i `x-wp-totalpages` z nagłówków odpowiedzi
- Obsługuje zarówno string jak i string[] (w zależności od wersji axios)

### 3.10 `src/plugin-client.ts` — Klient Panel API i WordPress REST API

**Linie: 1–128**

Singleton opakowujący axios dla dwóch niezależnych API: panel/v1/ (niestandardowe rozszerzenie WooCommerce) i wp/v2/ (oficjalne WordPress REST API).

**Klient Panel API:**

- `getPanelClient()` — zwraca cache'owanego axios z bazowym URL `{site}/wp-json/panel/v1/`, timeoutem i nagłówkiem `X-PANEL-KEY`
- `resetPanelClient()` — resetuje cache singletona
- `pluginGet/Post/Put/Delete` — helpery używające `getPanelClient()`

**Klient WordPress REST API:**

- `getWpClient()` — zwraca cache'owanego axios z bazowym URL `{site}/wp-json/wp/v2/`, timeoutem i basic auth (`WP_APP_USERNAME` / `WP_APP_PASSWORD`)
- `resetWpClient()` — resetuje cache singletona

**Retry Logic (`src/plugin-client.ts:4-35`):**

- `withRetry(instance)` — Proxy JavaScript identyczny ze wzorcem z `client.ts`
- Dla każdego błędu sprawdza status HTTP: 4xx są rzucane od razu (nie retry)
- Błędy sieciowe i 5xx retry z exponential backoff: `timeout = 2^attempt * 500ms`
- Maksymalna liczba prób: `WC_RETRY_COUNT` (domyślnie 3)

**Używane przez:**

- `src/tools/media.ts` — używa `getWpClient()` dla operacji na mediach
- `src/tools/panel.ts` — używa `pluginGet/pluginPost` dla panel API
- `src/tools/configurator.ts` — używa `pluginGet` dla configurator API

---

## 4. Tool Groups Architecture

### 4.1 Wzorzec rejestracji

Każda grupa narzędzi to osobny plik w `src/tools/`, który:

1. Definiuje schematy Zod dla parametrów
2. Tworzy tablicę obiektów `ToolDefinition`
3. Wywołuje `registerGroup({ name, tools })` — to dzieje się przy imporcie (side-effect)

```typescript
// src/tools/products.ts (wzór)
import { registerGroup } from '../groups.js';
// ... definicje narzędzi ...

registerGroup({
  name: 'products',
  tools: [
    {
      name: 'products_list',
      description: '...',
      inputSchema: { type: 'object', properties: { ... } },
      handler: makeListHandler('products', z.object({...}), 'products'),
    },
    // ... więcej narzędzi ...
  ],
});
```

### 4.2 Grupy narzędzi

| Grupa            | Plik                        | Narzędzia | Opis                                                                                               |
| ---------------- | --------------------------- | --------- | -------------------------------------------------------------------------------------------------- |
| **products**     | `src/tools/products.ts`     | 59        | CRUD produktów, wariacji, kategorii, tagów, atrybutów, terminów atrybutów, recenzji + batch        |
| **orders**       | `src/tools/orders.ts`       | 11        | CRUD zamówień, notatki, zwroty + batch                                                             |
| **customers**    | `src/tools/customers.ts`    | 7         | CRUD klientów + batch                                                                              |
| **coupons**      | `src/tools/coupons.ts`      | 7         | CRUD kuponów + batch                                                                               |
| **shipping**     | `src/tools/shipping.ts`     | 10        | CRUD stref wysyłki, metod, lokalizacji                                                             |
| **taxes**        | `src/tools/taxes.ts`        | 8         | CRUD klas podatkowych, stawek podatkowych                                                          |
| **reports**      | `src/tools/reports.ts`      | 8         | Raporty sprzedaży, top sellerów, produkty, zamówienia, klienci, kupony, stan magazynowy, przychody |
| **system**       | `src/tools/system.ts`       | 9         | Status systemu, narzędzia, dane, kontynenty, kraje, waluty, ustawienia, bramki płatności           |
| **email**        | `src/tools/email.ts`        | 1         | Wysyłanie emaili przez SMTP                                                                        |
| **configurator** | `src/tools/configurator.ts` | 5         | Schematy konfiguratora, narzędzia CNC AlphaCAM, usługi dodatkowe                                   |
| **panel**        | `src/tools/panel.ts`        | 8         | Opinie, ranking popularności, FAQ, CSV, dane firmy, feature flags                                  |
| **media**        | `src/tools/media.ts`        | 3         | Lista, upload, delete mediów przez WordPress REST API (wp/v2/)                                     |

### 4.3 Wzorce handlerów

W projekcie występują 3 wzorce handlerów:

**1. `makeListHandler`** — dla narzędzi listujących z paginacją:

- Automatyczna walidacja, wywołanie GET, ekstrakcja paginacji z nagłówków
- Przykład: `products_list`, `orders_list`, `coupons_list`, `customers_list`

**2. `withErrorHandling(fn)` z inline handlerem** — dla prostych operacji GET:

```typescript
handler: async (args) =>
  withErrorHandling(async () => {
    const v = validateArgs(z.object({ id: z.number().int().positive() }), args);
    const { data } = await client.get(`products/${v.id}`, {});
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });
```

**3. Read-only guard + `withErrorHandling`** — dla operacji modyfikujących:

```typescript
handler: async (args) => {
  if (isReadOnly()) return readOnlyError();
  return withErrorHandling(async () => {
    // ... mutation logic ...
  });
};
```

### 4.4 Selektywne włączanie grup

Zmienna `WC_TOOL_GROUPS` kontroluje które grupy są aktywne:

- `WC_TOOL_GROUPS=all` — wszystkie grupy (domyślnie)
- `WC_TOOL_GROUPS=products,orders` — tylko produkty i zamówienia
- `WC_TOOL_GROUPS=products` — tylko produkty

Nieużywane grupy nie są zwracane przez `ListTools` i ich handlery nie mogą być wywołane.

---

## 5. Data Flow

### Sekwencja wywołania narzędzia MCP

```
AI Agent                     MCP Server                    WooCommerce API
    │                            │                              │
    │  CallTool {                │                              │
    │    name: "products_list",  │                              │
    │    args: { page: 1 }       │                              │
    │  }                         │                              │
    │ ─────────────────────────▶ │                              │
    │                            │                              │
    │                            │ server.ts:72                 │
    │                            │ log('debug', { status:       │
    │                            │   'started', tool:           │
    │                            │   'products_list' })         │
    │                            │                              │
    │                            │ groups.ts: getActiveTools()  │
    │                            │ → finds tool by name         │
    │                            │                              │
    │                            │ utils.ts: validateArgs()     │
    │                            │ → Zod schema validation      │
    │                            │ → throws ZodError if invalid │
    │                            │                              │
    │                            │ client.ts: getClient()       │
    │                            │ → returns singleton proxy    │
    │                            │                              │
    │                            │  GET /wc/v3/products?page=1  │
    │                            │ ──────────────────────────▶  │
    │                            │                              │
    │                            │  { data: [...],              │
    │                            │    headers: {                │
    │                            │      x-wp-total: "42",       │
    │                            │      x-wp-totalpages: "5"    │
    │                            │    }                         │
    │                            │ ◀──────────────────────────  │
    │                            │                              │
    │                            │ types.ts: extractPagination()│
    │                            │ → { total: 42,               │
    │                            │     totalPages: 5 }          │
    │                            │                              │
    │                            │ server.ts:80                 │
    │                            │ log('info', { status:        │
    │                            │   'success', duration: 123 })│
    │                            │                              │
    │  { content: [{             │                              │
    │    type: 'text',           │                              │
    │    text: JSON.stringify({  │                              │
    │      products: [...],      │                              │
    │      total: 42,            │                              │
    │      totalPages: 5         │                              │
    │    })                      │                              │
    │  }]                        │                              │
    │ ◀───────────────────────── │                              │
```

### Sekwencja dla narzędzi używających plugin-client.ts (media_list)

```
AI Agent                     MCP Server                    WordPress REST API
    │                            │                              │
    │  CallTool {                │                              │
    │    name: "media_list",     │                              │
    │    args: { page: 1 }       │                              │
    │  }                         │                              │
    │ ─────────────────────────▶ │                              │
    │                            │                              │
    │                            │ server.ts:72                 │
    │                            │ log('debug', { status:       │
    │                            │   'started', tool:           │
    │                            │   'media_list' })            │
    │                            │                              │
    │                            │ groups.ts: getActiveTools()  │
    │                            │ → finds tool by name         │
    │                            │                              │
    │                            │ utils.ts: validateArgs()     │
    │                            │ → Zod schema validation      │
    │                            │                              │
    │                            │ plugin-client.ts:            │
    │                            │ getWpClient()                │
    │                            │ → returns singleton proxy    │
    │                            │                              │
    │                            │  GET /wp/v2/media?page=1     │
    │                            │ ──────────────────────────▶  │
    │                            │                              │
    │                            │  { data: [...],              │
    │                            │    headers: {                │
    │                            │      x-wp-total: "10",       │
    │                            │      x-wp-totalpages: "1"    │
    │                            │    }                         │
    │                            │ ◀──────────────────────────  │
    │                            │                              │
    │                            │ return { media: data,        │
    │                            │         total: 10,           │
    │                            │         totalPages: 1 }      │
    │                            │                              │
    │  { content: [{ type:       │                              │
    │    'text', text: ... }]    │                              │
    │ ◀───────────────────────── │                              │
```

### Obsługa błędów (przepływ)

```
Tool handler rzuca błąd
    │
    ▼
server.ts:87 — catch (error)
    │
    ▼
errors.ts: safeError(error)
    │
    ├─ ZodError       → VALIDATION_ERROR
    ├─ HTTP 404       → HTTP_404 ("Resource not found...")
    ├─ ENOTFOUND      → NETWORK_ERROR ("Cannot connect...")
    ├─ ECONNABORTED   → TIMEOUT ("Request timed out...")
    └─ inne           → UNKNOWN_ERROR
    │
    ▼
server.ts:97 — return { content: [{ type: 'text', text: `[${code}] ${message}` }], isError: true }
```

---

## 6. Security Model

### 6.1 Wymuszony HTTPS (`src/config.ts:69-71`)

Adres URL WooCommerce jest walidowany podczas startu serwera. Jeśli protokół nie jest `https:`, serwer rzuca błąd i nie uruchamia się.

### 6.2 SSRF Protection (`src/config.ts:73-106`)

Domyślnie włączona (`WC_BLOCK_PRIVATE_IPS`, domyślnie `true`):

**IPv4 — blokowane:**

- `127.0.0.1` (localhost)
- `0.0.0.0`
- `10.x.x.x` (RFC 1918 Class A)
- `172.16.x.x` — `172.31.x.x` (RFC 1918 Class B)
- `192.168.x.x` (RFC 1918 Class C)

**IPv6 — blokowane:**

- `::1` (localhost)
- `fc00::/7` (Unique Local Addresses)
- `fe80::/10` (Link-Local Addresses)

### 6.3 Lista dozwolonych domen (`src/config.ts:109-120`)

Opcjonalna, przez `WC_ALLOWED_DOMAINS` (lista domen oddzielona przecinkami):

```bash
WC_ALLOWED_DOMAINS=mystore.com,api.mystore.com
```

Jeśli ustawiona, serwer sprawdza hostname URL z listy i odrzuca jeśli nie ma matcha.

### 6.4 Tryb read-only (`src/client.ts:101-106`)

`WC_READ_ONLY=true` blokuje wszystkie operacje modyfikujące:

- Każde narzędzie typu create/update/delete/ batch sprawdza `isReadOnly()` na początku handlera
- Zwraca `READ_ONLY` error z kodem błędu i komunikatem

### 6.5 Walidacja Zod

Każde narzędzie ma dedykowany schemat Zod walidujący argumenty:

- Typy (string, number, boolean, array, object)
- Ograniczenia (`.min()`, `.max()`, `.positive()`, `.int()`, `.email()`)
- Enumy dla zamkniętych zestawów wartości

Błędne argumenty zwracają `VALIDATION_ERROR` z listą błędów (ścieżka + komunikat).

### 6.6 Bezpieczne błędy

`errors.ts` gwarantuje, że **żadne szczegóły odpowiedzi WooCommerce nie wyciekają**:

- `error.response?.data` jest **ignorowane** — nie jest zwracane w komunikacie błędu
- Komunikaty są ogólne, nie zawierają ścieżek, stack trace'ów, ani danych wrażliwych
- Kod błędu (`HTTP_404`, `VALIDATION_ERROR`) pozwala AI agentowi na podjęcie akcji bez leakowania informacji

---

## 7. Email System

### 7.1 Moduł email (`src/tools/email.ts`)

Osobna grupa narzędzi `email` z jednym narzędziem `email_send`, wykraczająca poza standardowe WooCommerce API. Wysyła emaile przez SMTP za pomocą `nodemailer`.

### 7.2 Konfiguracja SMTP

| Zmienna               | Wymagana               | Domyślnie   | Opis                                  |
| --------------------- | ---------------------- | ----------- | ------------------------------------- |
| `SMTP_HOST`           | Tak (gdy użycie email) | —           | Serwer SMTP                           |
| `SMTP_PORT`           | Nie                    | `587`       | Port SMTP                             |
| `SMTP_USER`           | Tak (gdy użycie email) | —           | Nazwa użytkownika SMTP                |
| `SMTP_PASS`           | Tak (gdy użycie email) | —           | Hasło SMTP                            |
| `SMTP_FROM`           | Nie                    | `SMTP_USER` | Adres nadawcy                         |
| `SMTP_RETRY_AFTER_MS` | Nie                    | `30000`     | Czas oczekiwania po failed connection |

### 7.3 Connection Management

- **Singleton transporter** — `nodemailer.createTransport()` z lazy initialization
- **TLS required** — `requireTLS: true`, port 465 = secure, port 587 = STARTTLS
- **Connection verification** — `transporter.verify()` przy pierwszym użyciu
- **Circuit breaker** (`src/tools/email.ts:9-40`):
  - Jeśli `verify()` failuje, transporter jest resetowany do `null`
  - `lastFailedAt` rejestruje timestamp faila
  - Kolejne wywołania sprawdzają `Date.now() - lastFailedAt < SMTP_RETRY_AFTER_MS`
  - W czasie retry okna zwracany jest błąd "SMTP connection unavailable, retry later"

### 7.4 Read-only

Email jest blokowany w trybie read-only — `isReadOnly()` sprawdzane przed wysłaniem.

---

## 8. Deployment Architecture

### 8.1 Wymagania

- Node.js 20+
- Dostęp do WooCommerce Store z włączonymi API (REST API, wc/v3)
- Konsument API z odpowiednimi uprawnieniami

### 8.2 Zmienne środowiskowe

```bash
# Wymagane
WOOCOMMERCE_URL=https://mystore.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxx

# Opcjonalne
WC_READ_ONLY=false              # Tryb tylko do odczytu
WC_TIMEOUT_MS=15000             # Timeout zapytań
WC_RETRY_COUNT=3                # Liczba ponownych prób
WC_BLOCK_PRIVATE_IPS=true       # SSRF ochrona
WC_ALLOWED_DOMAINS=mystore.com  # Dozwolone domeny
WC_TOOL_GROUPS=all              # Aktywne grupy (products,orders,...)
WC_LOG_LEVEL=info               # debug | info | error

# Email (opcjonalne)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=secret
SMTP_FROM=noreply@example.com
SMTP_RETRY_AFTER_MS=30000
```

### 8.3 Uruchomienie

```bash
# Development (z hot-reload przez tsx watch)
npm run dev

# Production build
npm run build
npm start

# Linting i type checking
npm run lint
npm run type-check
```

### 8.4 Transport

Serwer używa `StdioServerTransport` — komunikacja odbywa się przez stdin/stdout w formacie JSON-RPC. Logi diagnostyczne są wypisywane na stderr (nie mieszają się z komunikacją MCP).

To oznacza, że serwer jest uruchamiany jako **subproces** przez host MCP (np. Claude Desktop, Cursor), który komunikuje się przez pipe'y.

### 8.5 Konfiguracja MCP hosta (przykład dla Claude Desktop)

```json
{
  "mcpServers": {
    "woocommerce": {
      "command": "node",
      "args": ["/path/to/woocommerce-mcp-server/build/index.js"],
      "env": {
        "WOOCOMMERCE_URL": "https://mystore.com",
        "WOOCOMMERCE_CONSUMER_KEY": "ck_xxxx",
        "WOOCOMMERCE_CONSUMER_SECRET": "cs_xxxx"
      }
    }
  }
}
```

---

## 9. Design Decisions

### 9.1 Dlaczego `@modelcontextprotocol/sdk`?

Oficjalne MCP SDK zapewnia:

- Poprawną implementację protokołu MCP (JSON-RPC, schematy żądań)
- Gotowe handlery `ListToolsRequestSchema` i `CallToolRequestSchema`
- Wsparcie dla różnych transportów (stdio, SSE, streamable HTTP)
- Kompatybilność z wszystkimi hostami MCP (Claude Desktop, Cursor, itp.)

### 9.2 Osobne pliki dla grup narzędzi

Każda grupa w osobnym pliku `src/tools/{group}.ts`:

- **Separacja odpowiedzialności** — zmiana w produktach nie wpływa na zamówienia
- **Łatwość rozszerzania** — nowa grupa = nowy plik + import w `index.ts`
- **Selektywne ładowanie** — przez `WC_TOOL_GROUPS` można wyłączyć grupy bez zmian w kodzie
- **Side-effect registration** — import pliku automatycznie rejestruje grupę w globalnym registry

### 9.3 Proxy z retry logic

Wybór Proxy Pattern zamiast dekoratora lub osobnej warstwy:

- Przezroczyste dla handlerów — nie wiedzą o retry
- Automatyczne dla wszystkich metod HTTP
- Exponential backoff zapobiega przeciążeniu serwera
- Błędy 4xx NIE są retry — nie ma sensu powtarzać błędnych żądań

### 9.4 `makeListHandler` — generyczny handler listowania

Zamiast powtarzać ten sam wzorzec dla każdego list endpointu:

```typescript
// Zamiast pisać to dla każdego endpointu:
const v = validateArgs(schema, args);
const client = getClient();
const { data, headers } = await client.get(endpoint, params);
const { total, totalPages } = extractPagination(headers);
return { content: [{ type: 'text', text: JSON.stringify({ [key]: data, total, totalPages })] };
```

`makeListHandler` enkapsuluje ten wzorzec i jest używany przez wszystkie grupy.

### 9.5 Bezpieczeństwo przed funkcjonalnością

- Wymuszony HTTPS (config.ts:69)
- Blokada prywatnych IP (config.ts:73-106)
- Brak leakowania `error.response?.data` w komunikatach błędów (errors.ts)
- Walidacja Zod każdego inputu przed wysłaniem do WooCommerce
- Tryb read-only domyślnie wyłączony, ale łatwy do włączenia

### 9.6 Singleton pattern dla klienta i konfiguracji

`getConfig()`, `getClient()`, `getEnabledGroups()` — wszystkie używają cache'owania:

- Konfiguracja ładowana raz przy starcie
- Klient WooCommerce tworzony raz (z Proxy jesli retry > 0)
- Grupy narzędzi cache'owane po pierwszym odczycie

Ułatwia to testowanie przez funkcje `reset*()` (`resetClient`, `resetEnabledGroups`).

### 9.7 Strukturalne logowanie przez stderr

Logi w formacie JSON wypisywane na `console.error()`:

- Nie mieszają się z komunikacją MCP na stdout
- Poziomy: debug, info, error — kontrolowane przez `WC_LOG_LEVEL`
- Każdy log zawiera timestamp, tool name, duration, status
- Ułatwia debugowanie i monitoring przez zewnętrzne narzędzia (jq, log aggregators)

---

## 10. Testy

### 10.1 Framework

Projekt używa **Vitest** jako frameworka testowego (zgodne z `package.json`).

### 10.2 Struktura testów

| Plik                   | Opis                                                   |
| ---------------------- | ------------------------------------------------------ |
| `tests/client.test.ts` | Testy klienta API (mock axios, retry logic, read-only) |
| `tests/config.test.ts` | Testy walidacji konfiguracji (HTTPS, SSRF, env vars)   |
| `tests/errors.test.ts` | Testy safeError (Zod, HTTP, network)                   |
| `tests/groups.test.ts` | Testy rejestracji i filtrowania grup                   |
| `tests/types.test.ts`  | Testy typów i extractPagination                        |
| `tests/tools/`         | Testy poszczególnych narzędzi                          |

### 10.3 Uruchamianie

```bash
npm test              # vitest run
npm run test:watch    # vitest watch mode
```

---

## 11. Diagram ER (encji WooCommerce)

```
Product ────1:N──▶ Variation
  │
  ├──N:N── Category
  ├──N:N── Tag
  ├──N:N── Attribute ──1:N── Term
  └──1:N── Review

Order ────1:N── LineItem
  │         └──N:1── Product
  │
  ├──1:N── ShippingLine
  ├──1:N── TaxLine
  ├──1:N── FeeLine
  ├──1:N── CouponLine ──N:1── Coupon
  ├──1:N── OrderNote
  ├──1:N── Refund
  └──N:1── Customer

ShippingZone ──1:N── ShippingMethod
       └──1:N── Location

TaxClass ──1:N── TaxRate
```

---

## 12. Podsumowanie

WooCommerce MCP Server to w pełni typowany, bezpieczny i modularny serwer MCP, który udostępnia ~154 narzędzia do zarządzania sklepem WooCommerce przez AI agentów (119 core + 35 rozszerzeń). Architektura oparta na:

- **Side-effect registration** dla grup narzędzi (łatwe rozszerzanie)
- **Proxy pattern** dla retry z exponential backoff
- **Generycznych handlerach** (`makeListHandler`) redukujących boilerplate
- **Wielowarstwowym bezpieczeństwie**: HTTPS, SSRF, Zod, read-only, bezpieczne błędy
- **Strukturalnym logowaniu** przez stderr

Projekt jest gotowy do deploy'u jako subproces hosta MCP przez stdio transport, z opcjonalnym wsparciem dla wysyłki emaili przez SMTP.
