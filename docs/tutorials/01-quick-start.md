# Szybki Start — pierwsze połączenie z WooCommerce

**Cel:** Skonfigurować i uruchomić WooCommerce MCP Server w 5 minut, wykonać pierwsze zapytanie do sklepu.

**Czego się nauczysz:**

- Klonowania repozytorium i instalacji zależności
- Konfiguracji połączenia przez zmienne środowiskowe
- Uruchamiania serwera w trybie deweloperskim
- Testowania połączenia przez MCP client (stdio)
- Wykonywania pierwszego narzędzia MCP

**Wymagania wstępne:**

- Node.js >= 18
- npm >= 9
- Działający sklep WooCommerce (wersja 3+) z kluczami API (Consumer Key i Consumer Secret)
- Klucze API WooCommerce z uprawnieniami **Read/Write**

---

## Krok 1: Klonowanie i instalacja

Sklonuj repozytorium i zainstaluj zależności:

```bash
git clone https://github.com/twoje-konto/woocommerce-mcp-server.git
cd woocommerce-mcp-server
npm install
```

Po instalacji sprawdź, czy wszystko jest gotowe:

```bash
npm run build
```

Jeśli kompilacja przejdzie bez błędów — możesz iść dalej. Jeśli pojawią się błędy, upewnij się, że masz odpowiednią wersję Node.js.

---

## Krok 2: Konfiguracja .env

Skopiuj przykładowy plik konfiguracyjny:

```bash
cp .env.example .env
```

Otwórz plik `.env` i uzupełnij dane swojego sklepu WooCommerce:

```env
# WooCommerce Connection
WOOCOMMERCE_URL=https://twoj-sklep.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Tool Group Configuration
WC_TOOL_GROUPS=all

# Security
WC_READ_ONLY=false

# Server
WC_TIMEOUT_MS=15000
WC_RETRY_COUNT=3
```

> **Uwaga:** `WOOCOMMERCE_URL` **musi** używać HTTPS. Jeśli używasz localhosta w rozwoju, rozważ użycie tunelu SSL (ngrok).

---

## Krok 3: Uruchomienie serwera

Serwer można uruchomić w trybie deweloperskim (z auto-restartem przy zmianach):

```bash
npm run dev
```

Powinieneś zobaczyć:

```
WooCommerce MCP Server started on stdio
```

Serwer nasłuchuje teraz na `stdin` i odpowiada przez `stdout` — to standardowy transport MCP (stdio).

---

## Krok 4: Test połączenia przez MCP client

W osobnym terminalu możesz przetestować serwer, wysyłając ręczne zapytanie JSON-RPC przez `echo`:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | nc -U /dev/null 2>/dev/null || \
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node build/index.js
```

Alternatywnie, skonfiguruj **Claude Desktop** lub inny MCP host, dodając do swojej konfiguracji MCP:

```json
{
  "mcpServers": {
    "woocommerce": {
      "command": "node",
      "args": ["/sciezka/do/woocommerce-mcp-server/build/index.js"],
      "env": {
        "WOOCOMMERCE_URL": "https://twoj-sklep.com",
        "WOOCOMMERCE_CONSUMER_KEY": "ck_xxxxxxxxxxxxxxxx",
        "WOOCOMMERCE_CONSUMER_SECRET": "cs_xxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

Po połączeniu, MCP host wywoła `tools/list` i zobaczysz listę wszystkich dostępnych narzędzi, pogrupowanych w kategorie:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      { "name": "products_list", "description": "List products with optional filtering" },
      { "name": "products_get", "description": "Get a single product by ID" },
      { "name": "products_create", "description": "Create a new product" },
      { "name": "orders_list", "description": "List orders with optional filtering" },
      { "name": "customers_list", "description": "List customers with optional filtering" },
      { "name": "reports_sales", "description": "Get sales report summary" },
      { "name": "system_status", "description": "Get WooCommerce system status" },
      { "name": "email_send", "description": "Send a custom email via SMTP" }
    ]
  }
}
```

---

## Krok 5: Pierwsze narzędzie — lista produktów

Wywołaj `products_list`, aby pobrać pierwsze 10 produktów ze sklepu:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "products_list",
    "arguments": {
      "per_page": 5,
      "orderby": "date",
      "order": "desc"
    }
  }
}
```

Oczekiwana odpowiedź (przykład):

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"products\": [...],\n  \"total\": 25,\n  \"totalPages\": 5\n}"
      }
    ]
  }
}
```

Gratulacje! Właśnie wykonałeś pierwsze zapytanie do WooCommerce przez MCP. Możesz teraz filtrować — dodaj `"search": "koszulka"` lub `"status": "publish"`.

---

## ✅ Checkpoint — weryfikacja działania

| Co powinno działać       | Jak sprawdzić                             |
| ------------------------ | ----------------------------------------- |
| Serwer uruchomiony       | `npm run dev` wypisuje "started on stdio" |
| Połączenie z WooCommerce | `products_list` zwraca dane (nie błąd)    |
| Narzędzia dostępne       | `tools/list` zwraca listę narzędzi        |

**Jeśli widzisz błędy:**

- **"Invalid URL"** → sprawdź `WOOCOMMERCE_URL` — musi zaczynać się od `https://`
- **"Invalid consumer key"** → sprawdź klucze API w WooCommerce Admin
- **"Connection refused"** → czy sklep WooCommerce jest dostępny?

---

## Ćwiczenie

1. Zmień `WC_READ_ONLY=true` w `.env` i uruchom ponownie serwer
2. Spróbuj wywołać `products_create` z dowolną nazwą produktu
3. Zaobserwuj, że serwer zwraca błąd read-only
4. Zmień z powrotem na `false` i uruchom ponownie

---

## Podsumowanie

Uruchomiłeś WooCommerce MCP Server, skonfigurowałeś połączenie ze sklepem i wykonałeś pierwsze zapytanie. Serwer działa przez stdio i jest gotowy do integracji z dowolnym MCP hostem (Claude Desktop, Cursor, własne aplikacje).

## Następne kroki

- [Tutorial 2: Zarządzanie Produktami](02-manage-products.md) — CRUD, kategorie, tagi, wariacje
- [Tutorial 3: Zamówienia i Klienci](03-orders-and-customers.md) — zamówienia, zwroty, klienci
- [Tutorial 4: Raporty i Narzędzia Systemowe](04-reports-and-system.md) — analiza sklepu
