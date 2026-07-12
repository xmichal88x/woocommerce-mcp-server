# Rozszerzenia WooCommerce MCP Server — Plan Implementacji

> **For Claude:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task.

**Goal:** Dodanie ~35 narzędzi MCP w 7 grupach: custom plugin API (`panel-configurator-bridge`), media/obrazy, oraz rozszerzenia produktów.

**Architektura:** 2 rodzaje endpointów: (1) custom plugin WordPress REST API pod `panel/v1` (grupy 1-5) i (2) standardowe WooCommerce/WordPress REST API (grupy 6-7). Dla (1) potrzebny osobny klient API z wersją `panel/v1`. Dla (2) wykorzystanie istniejącego klienta WooCommerce (`wc/v3`) oraz dodatkowego z wersją `wp/v2` dla mediów.

**Tech Stack:** TypeScript, Zod, @woocommerce/woocommerce-rest-api, MCP SDK

---

## Zadania infrastrukturalne (wykonać jako pierwsze)

### Task 0a: Rozszerzenie ALL_GROUPS w config.ts + plugin-client.ts

**Files:**

- Modify: `src/config.ts:10-20`
- Create: `src/plugin-client.ts`

**Step 1: Dodaj nowe grupy do `ALL_GROUPS` w config.ts**

Nowe grupy do dodania:

- `configurator` — plugin API: konfigurator CNC
- `store_products` — plugin API: produkty sklepu
- `reviews_admin` — plugin API: opinie i pytania (admin)
- `production` — plugin API: produkcja CSV
- `store_settings` — plugin API: ustawienia sklepu
- `media` — WordPress media library
- `products_extras` — rozszerzenia produktów (shipping classes, cross-sells)

Dodaj do `ALL_GROUPS` po istniejących grupach:

```typescript
const ALL_GROUPS = [
  'products',
  'orders',
  'customers',
  'coupons',
  'shipping',
  'taxes',
  'reports',
  'system',
  'email',
  'configurator',
  'store_products',
  'reviews_admin',
  'production',
  'store_settings',
  'media',
  'products_extras',
] as const;
```

**Step 2: Utwórz `src/plugin-client.ts`**

Klient dla niestandardowych wersji WordPress REST API. Wykorzystuje tę samą autoryzację OAuth 1.0a co WooCommerce API.

```typescript
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { getConfig } from './config.js';

interface PluginClient {
  get(
    endpoint: string,
    params?: Record<string, unknown>,
  ): Promise<{
    data: unknown;
    headers: Record<string, string | string[] | undefined>;
    status: number;
  }>;
  post(
    endpoint: string,
    data: Record<string, unknown>,
    params?: Record<string, unknown>,
  ): Promise<{
    data: unknown;
    headers: Record<string, string | string[] | undefined>;
    status: number;
  }>;
  put(
    endpoint: string,
    data: Record<string, unknown>,
    params?: Record<string, unknown>,
  ): Promise<{
    data: unknown;
    headers: Record<string, string | string[] | undefined>;
    status: number;
  }>;
  delete(
    endpoint: string,
    params?: Record<string, unknown>,
  ): Promise<{
    data: unknown;
    headers: Record<string, string | string[] | undefined>;
    status: number;
  }>;
}

const clients = new Map<string, PluginClient>();

function createVersionedClient(version: string): PluginClient {
  const config = getConfig();
  const WooCommerceRestApiCtor = WooCommerceRestApi as unknown as new (
    opt: Record<string, unknown>,
  ) => PluginClient;
  return new WooCommerceRestApiCtor({
    url: config.url,
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
    version,
    timeout: config.timeout,
  });
}

export function getPluginClient(version: string): PluginClient {
  if (!clients.has(version)) {
    clients.set(version, createVersionedClient(version));
  }
  return clients.get(version)!;
}

export function getPanelClient(): PluginClient {
  return getPluginClient('panel/v1');
}

export function getWpClient(): PluginClient {
  return getPluginClient('wp/v2');
}
```

**Step 3: Zaimportuj nowe pliki tooli w `src/index.ts`**

```typescript
import './tools/configurator.js';
import './tools/store_products.js';
import './tools/reviews_admin.js';
import './tools/production.js';
import './tools/store_settings.js';
import './tools/media.js';
import './tools/products_extras.js';
```

### Verification

1. **Build** — `npm run build` (kompilacja TypeScript)
2. **Lint** — `npm run lint`
3. **Type-check** — `npm run type-check`

---

## Grupa 1: Plugin API — Konfigurator (6 tooli)

### Task 1: Plik `src/tools/configurator.ts`

**Files:**

- Create: `src/tools/configurator.ts`

**8 tooli (wszystkie read-only, GET):**

| Tool                       | Endpoint panel/v1             | Opis                               |
| -------------------------- | ----------------------------- | ---------------------------------- |
| `product_schema_get`       | `product-schema?sku={sku}`    | Schemat konfiguratora dla produktu |
| `configurator_data_get`    | `configurator-data?sku={sku}` | Parametry konfiguratora            |
| `tools_list`               | `tools`                       | Lista aktywnych narzędzi CNC       |
| `edge_type_tools_list`     | `edge-type-tools`             | Mapowanie narzędzi do profili      |
| `tool_lists_list`          | `tool-lists`                  | Nazwane listy narzędzi             |
| `additional_services_list` | `additional-services`         | Usługi dodatkowe                   |

Wzór handlera (dla każdego toola):

```typescript
import { z } from 'zod';
import { registerGroup } from '../groups.js';
import { getPanelClient } from '../plugin-client.js';
import { validateArgs, withErrorHandling } from '../utils.js';

registerGroup({
  name: 'configurator',
  tools: [
    {
      name: 'product_schema_get',
      description: 'Get configurator schema for a product by SKU',
      inputSchema: {
        type: 'object',
        properties: {
          sku: { type: 'string', description: 'Product SKU' },
        },
        required: ['sku'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const v = validateArgs(z.object({ sku: z.string().min(1) }), args);
          const client = getPanelClient();
          const { data } = await client.get('product-schema', { sku: v.sku });
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    // ... pozostałe 5 tooli analogicznie
  ],
});
```

### Verification

1. **Build** — `npm run build`
2. **Lint** — `npm run lint`

---

## Grupa 2: Plugin API — Produkty sklepu (2 tooli)

### Task 2: Plik `src/tools/store_products.ts`

**Files:**

- Create: `src/tools/store_products.ts`

**2 tooli (read-only):**

| Tool                   | Endpoint panel/v1  | Opis                  |
| ---------------------- | ------------------ | --------------------- |
| `products_lite_list`   | `products-lite`    | Lekka lista produktów |
| `products_popular_get` | `products-popular` | Popularne produkty    |

### Verification

1. **Build** — `npm run build`
2. **Lint** — `npm run lint`

---

## Grupa 3: Plugin API — Opinie i Pytania (admin) (10 tooli)

### Task 3: Plik `src/tools/reviews_admin.ts`

**Files:**

- Create: `src/tools/reviews_admin.ts`

**10 tooli:**

| Tool                            | Endpoint panel/v1            | Metoda | Opis                    |
| ------------------------------- | ---------------------------- | ------ | ----------------------- |
| `products_reviews_admin_list`   | `products-reviews-admin`     | GET    | Lista opinii (admin)    |
| `products_reviews_moderate`     | `products-reviews-moderate`  | POST   | Moderacja opinii        |
| `products_questions_admin_list` | `products-questions-admin`   | GET    | Lista pytań (admin)     |
| `products_questions_answer`     | `products-questions-answer`  | POST   | Odpowiadanie jako admin |
| `products_answers_mark_best`    | `products-answers-mark-best` | POST   | Oznacz jako najlepsza   |
| `faq_list`                      | `faq`                        | GET    | Lista FAQ               |
| `faq_categories_list`           | `faq-categories`             | GET    | Kategorie FAQ           |
| `faq_create`                    | `faq`                        | POST   | Utwórz FAQ              |
| `faq_update`                    | `faq/{id}`                   | PUT    | Aktualizuj FAQ          |
| `faq_delete`                    | `faq/{id}`                   | DELETE | Usuń FAQ                |

Narz warnings:

- `products_reviews_moderate`, `products_questions_answer`, `products_answers_mark_best`, `faq_create`, `faq_update`, `faq_delete` — wymagają `isReadOnly()` guard

### Verification

1. **Build** — `npm run build`
2. **Lint** — `npm run lint`

---

## Grupa 4: Plugin API — Produkcja (2 tooli)

### Task 4: Plik `src/tools/production.ts`

**Files:**

- Create: `src/tools/production.ts`

**2 tooli:**

| Tool                        | Endpoint panel/v1                     | Metoda | Opis                  |
| --------------------------- | ------------------------------------- | ------ | --------------------- |
| `production_csv_generate`   | `production-csv/generate`             | POST   | Generuj CSV produkcji |
| `production_csv_status_get` | `production-csv/status?order_id={id}` | GET    | Status CSV            |

### Verification

1. **Build** — `npm run build`
2. **Lint** — `npm run lint`

---

## Grupa 5: Plugin API — Ustawienia sklepu (4 tooli)

### Task 5: Plik `src/tools/store_settings.ts`

**Files:**

- Create: `src/tools/store_settings.ts`

**4 tooli:**

| Tool                         | Endpoint panel/v1     | Metoda | Opis                    |
| ---------------------------- | --------------------- | ------ | ----------------------- |
| `company_info_get`           | `company-info`        | GET    | Dane firmy              |
| `features_get`               | `features`            | GET    | Feature flagi           |
| `popularity_settings_get`    | `popularity-settings` | GET    | Ustawienia popularności |
| `popularity_settings_update` | `popularity-settings` | PUT    | Modyfikacja wag         |

### Verification

1. **Build** — `npm run build`
2. **Lint** — `npm run lint`

---

## Grupa 6: Media/Obrazy (5 tooli)

### Task 6: Plik `src/tools/media.ts`

**Files:**

- Create: `src/tools/media.ts`

**5 tooli:**

| Tool                  | Endpoint                                           | Metoda | Opis                 |
| --------------------- | -------------------------------------------------- | ------ | -------------------- |
| `media_list`          | `GET /wp/v2/media` (przez `getWpClient()`)         | GET    | Lista plików mediów  |
| `media_upload`        | `POST /wp/v2/media` (przez `getWpClient()`)        | POST   | Upload obrazka       |
| `media_delete`        | `DELETE /wp/v2/media/{id}` (przez `getWpClient()`) | DELETE | Usuń plik            |
| `product_images_set`  | `PUT /wc/v3/products/{id}` (przez `getClient()`)   | PUT    | Ustaw główne zdjęcie |
| `product_gallery_set` | `PUT /wc/v3/products/{id}` (przez `getClient()`)   | PUT    | Ustaw galerię        |

**Uwagi:**

- `media_upload` — akceptuje URL lub base64, ustawia `Content-Disposition: attachment` przez axios
- `product_images_set` — przyjmuje `product_id` + `image_id` (ID z biblioteki mediów)
- `product_gallery_set` — przyjmuje `product_id` + `image_ids` (array ID)

### Verification

1. **Build** — `npm run build`
2. **Lint** — `npm run lint`

---

## Grupa 7: Produkty — rozszerzenia (5 tooli)

### Task 7: Plik `src/tools/products_extras.ts`

**Files:**

- Create: `src/tools/products_extras.ts`

**5 tooli:**

| Tool                               | Endpoint wc/v3                   | Metoda | Opis                     |
| ---------------------------------- | -------------------------------- | ------ | ------------------------ |
| `products_shipping_classes_list`   | `products/shipping_classes`      | GET    | Lista klas wysyłki       |
| `products_shipping_classes_create` | `products/shipping_classes`      | POST   | Utwórz klasę             |
| `products_shipping_classes_update` | `products/shipping_classes/{id}` | PUT    | Aktualizuj klasę         |
| `products_shipping_classes_delete` | `products/shipping_classes/{id}` | DELETE | Usuń klasę               |
| `products_cross_sells_set`         | `products/{id}`                  | PUT    | Ustaw cross-sell/up-sell |

Wszystkie używają istniejącego `getClient()` (wc/v3).

### Verification

1. **Build** — `npm run build`
2. **Lint** — `npm run lint`

---

## Task 8: Końcowa weryfikacja

**Po zaimplementowaniu wszystkich zadań:**

1. **Format & Lint** — `npm run lint`
2. **Type-check** — `npm run type-check`
3. **Build** — `npm run build`
4. **Testy** — `npm test`
5. **Code review** — wszystkie nowe pliki pod kątem:
   - Bezpieczeństwo: brak secretów w outputach, walidacja inputów
   - Obsługa błędów: try/catch, read-only guard
   - Spójność nazewnictwa
   - Zgodność z istniejącymi wzorcami

### Co zgłosić głównemu agentowi

- Lista utworzonych plików
- Wyniki lintera, type-checka, builda, testów
- Wszelkie pre-existing errors znalezione w modyfikowanych plikach
- Wszelkie nowe issues wprowadzone
- Concerns bezpieczeństwa/obsługi błędów
