# Plugin REST Tools — Plan Implementacji (bez modyfikacji wtyczki)

> **For Claude:** REQUIRED SUB-SKILL: Użyj `subagent-driven-development` do wykonania tego planu zadanie po zadaniu.
> Wszystkie 43 endpointy istnieją w wtyczce `panel-configurator-bridge` — MCP server tylko dodaje warstwę proxy.
> Żadna zmiana w PHP nie jest wymagana.

**Cel:** Dodanie ~41 nowych narzędzi MCP (7 X-PANEL-KEY + 34 Bearer token) które proxy istniejące endpointy pluginu
**Architektura:** Nowe pliki w `src/tools/` + rozszerzenie `src/plugin-client.ts` o Bearer token
**Tech Stack:** TypeScript, Zod, axios

---

## Zmiany w `src/plugin-client.ts` — Faza 0 (BAZA)

**Plik:** `src/plugin-client.ts`

### Zmiana 0.1: Bearer token support

Dodać do `getPanelClient()` warunkowe dodawanie `Authorization: Bearer`:

```ts
let panelAuthToken: string | null = null;

export function setPanelToken(token: string | null): void {
  panelAuthToken = token;
  resetPanelClient(); // ← KLUCZOWE: resetuje singletona
  // Po resecie następne getPanelClient() utworzy nową instancję z tokenem
}
```

W `getPanelClient()`:

```ts
const headers: Record<string, string> = {};
if (config.pcbApiSecret) headers['X-PANEL-KEY'] = config.pcbApiSecret;
if (panelAuthToken) {
  headers['Authorization'] = `Bearer ${panelAuthToken}`;
  // Gdy jest Bearer token, nie wysyłaj X-PANEL-KEY (plugin rozstrzyga priorytet)
  delete headers['X-PANEL-KEY'];
}
```

### Zmiana 0.2: Helper logowania

```ts
export async function pluginLogin(credentials: {
  email: string;
  password: string;
}): Promise<string> {
  const resp = await pluginPost('auth/login', credentials);
  const data = resp.data as { token?: string };
  if (!data.token) throw new Error('Login succeeded but no token returned');
  setPanelToken(data.token);
  return data.token;
}
```

### Zmiana 0.3: Helper multipart

```ts
export async function pluginPostFormData<T = unknown>(
  endpoint: string,
  formData: FormData,
): Promise<ApiResponse<T>> {
  const client = getPanelClient();
  // Retry wyłączone dla uploadu (ryzyko duplikacji)
  const response = await client.post<T>(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    maxContentLength: 5 * 1024 * 1024, // 5MB
  });
  return {
    data: response.data,
    headers: response.headers as Record<string, string | string[] | undefined>,
    status: response.status,
  };
}
```

### Zmiana 0.4: Export nowych funkcji

Dodać do exportów: `setPanelToken`, `pluginLogin`.

### Weryfikacja

```bash
npm run build && npm run type-check && npm test
```

---

## Narzędzia — Faza 1 (X-PANEL-KEY / public, 7 tooli)

**Plik docelowy:** `src/tools/panel.ts` (rozszerzenie istniejącej grupy)

### Tool 1.1: `auth_login`

| Aspekt   | Opis                                                |
| -------- | --------------------------------------------------- |
| Endpoint | `POST /auth/login`                                  |
| Auth     | `check_api_key` (X-PANEL-KEY)                       |
| Input    | `{ email: string, password: string }`               |
| Output   | `{ token: string, user: {...} }`                    |
| Mutacja  | TAK (zmienia stan serwera + ustawia token lokalnie) |

**Handler:** woła `pluginLogin(credentials)` z 0.2

### Tool 1.2: `auth_register`

| Aspekt   | Opis                                           |
| -------- | ---------------------------------------------- |
| Endpoint | `POST /auth/register`                          |
| Auth     | `check_api_key` (X-PANEL-KEY)                  |
| Input    | `{ email, password, first_name?, last_name? }` |
| Mutacja  | TAK                                            |

### Tool 1.3: `auth_lost_password`

| Aspekt   | Opis                       |
| -------- | -------------------------- |
| Endpoint | `POST /auth/lost-password` |
| Input    | `{ email }`                |
| Mutacja  | TAK                        |

### Tool 1.4: `contact_send`

| Aspekt   | Opis                                 |
| -------- | ------------------------------------ |
| Endpoint | `POST /contact`                      |
| Input    | `{ name, email, subject?, message }` |
| Mutacja  | TAK                                  |

### Tool 1.5: `site_status_get`

| Aspekt   | Opis                     |
| -------- | ------------------------ |
| Endpoint | `GET /site-status`       |
| Auth     | `__return_true` (public) |
| Input    | `{ preview_token? }`     |
| Mutacja  | NIE                      |

### Tool 1.6: `cart_add_items`

| Aspekt   | Opis                                                                  |
| -------- | --------------------------------------------------------------------- |
| Endpoint | `POST /add-items-from-configurator`                                   |
| Auth     | `check_api_key` (X-PANEL-KEY)                                         |
| Input    | `{ items: Array<{ sku, qty?, width_mm?, height_mm?, notes?, ... }> }` |
| Mutacja  | TAK                                                                   |

### Tool 1.7: `configurator_data_get` — ale to wymaga Bearer token...

Wait, `/configurator-data/{id}` uses `check_bearer_token`. So it can't be in Phase 1. Move to Phase 2.

**Razem Faza 1:** 6 tooli (wszystkie w `panel.ts`)

---

## Narzędzia — Faza 2 (Bearer token)

### Grupa A: Profile (`panel.ts`)

| Tool               | Endpoint                | Input                                              |
| ------------------ | ----------------------- | -------------------------------------------------- |
| `auth_me_get`      | `GET /auth/me`          | —                                                  |
| `auth_me_update`   | `PUT /auth/me`          | `{ first_name?, last_name?, billing?, shipping? }` |
| `auth_orders_list` | `GET /auth/orders`      | `{ page?, per_page? }`                             |
| `auth_orders_get`  | `GET /auth/orders/{id}` | `{ id }`                                           |
| `auth_logout`      | `POST /auth/logout`     | — (czyści token lokalnie)                          |

**Razem: 5 tooli**

### Grupa B: Wzory (patterns) — nowy plik `src/tools/patterns.ts`

| Tool             | Endpoint                | Input                               |
| ---------------- | ----------------------- | ----------------------------------- |
| `patterns_list`  | `GET /patterns`         | —                                   |
| `pattern_create` | `POST /patterns`        | `{ product_id, name, config_data }` |
| `pattern_get`    | `GET /patterns/{id}`    | `{ id }`                            |
| `pattern_delete` | `DELETE /patterns/{id}` | `{ id }`                            |

**Razem: 4 tooli**

### Grupa C: Ulubione — nowy plik `src/tools/favorites.ts`

| Tool              | Endpoint                 | Input            |
| ----------------- | ------------------------ | ---------------- |
| `favorites_list`  | `GET /favorites`         | —                |
| `favorite_add`    | `POST /favorites`        | `{ product_id }` |
| `favorite_remove` | `DELETE /favorites/{id}` | `{ product_id }` |

**Razem: 3 tooli**

### Grupa D: Projekty — nowy plik `src/tools/projects.ts`

| Tool             | Endpoint                | Input                        |
| ---------------- | ----------------------- | ---------------------------- |
| `projects_list`  | `GET /projects`         | —                            |
| `project_create` | `POST /projects`        | `{ name, project_data }`     |
| `project_get`    | `GET /projects/{id}`    | `{ id }`                     |
| `project_update` | `PUT /projects/{id}`    | `{ id, name, project_data }` |
| `project_delete` | `DELETE /projects/{id}` | `{ id }`                     |

**Razem: 5 tooli**

### Grupa E: Produkcja — nowy plik `src/tools/production.ts`

| Tool                      | Endpoint                        | Input                                            |
| ------------------------- | ------------------------------- | ------------------------------------------------ |
| `production_csv_generate` | `POST /generate-production-csv` | `{ product_id, dimensions: [...], pattern_id? }` |

**Razem: 1 tool**

### Grupa F: Konfigurator — nowy plik `src/tools/configurator-extra.ts`

| Tool                            | Endpoint                      | Input    |
| ------------------------------- | ----------------------------- | -------- |
| `product_configurator_data_get` | `GET /configurator-data/{id}` | `{ id }` |

**Razem: 1 tool**

### Grupa G: Opinie (extra) — rozszerzenie `src/tools/products-misc.ts`

| Tool                     | Endpoint                                   | Input                      |
| ------------------------ | ------------------------------------------ | -------------------------- |
| `reviews_check_purchase` | `GET /check-purchase/{id}`                 | `{ product_id }`           |
| `reviews_helpful`        | `POST /reviews/{id}/helpful`               | `{ review_id }`            |
| `reviews_data_get`       | `GET /review-data/{order_id}/{product_id}` | `{ order_id, product_id }` |

**Razem: 3 tooli**

### Grupa H: Q&A — nowy plik `src/tools/questions.ts`

| Tool                  | Endpoint                        | Input                                                                      |
| --------------------- | ------------------------------- | -------------------------------------------------------------------------- |
| `qa_questions_list`   | `GET /products/{id}/questions`  | `{ product_id, page?, per_page?, sort?, filter? }`                         |
| `qa_question_create`  | `POST /products/{id}/questions` | `{ product_id, content }`                                                  |
| `qa_question_update`  | `PUT /questions/{id}`           | `{ id, content }`                                                          |
| `qa_question_delete`  | `DELETE /questions/{id}`        | `{ id }`                                                                   |
| `qa_question_vote`    | `POST /questions/{id}/vote`     | `{ id, vote: -1\|0\|1 }`                                                   |
| `qa_answers_list`     | `GET /questions/{id}/answers`   | `{ question_id }`                                                          |
| `qa_answer_create`    | `POST /questions/{id}/answers`  | `{ question_id, content }`                                                 |
| `qa_answer_update`    | `PUT /answers/{id}`             | `{ id, content }`                                                          |
| `qa_answer_delete`    | `DELETE /answers/{id}`          | `{ id }`                                                                   |
| `qa_answer_vote`      | `POST /answers/{id}/vote`       | `{ id, vote: -1\|0\|1 }`                                                   |
| `qa_answer_mark_best` | `POST /answers/{id}/best`       | `(istniejący answers_mark_best → przenieś tutaj jako qa_answer_mark_best)` |

**Uwaga:** Istniejące `answers_mark_best` w `panel.ts` → **przemianować na `qa_answer_mark_best`** i przenieść do `questions.ts`, żeby uniknąć duplikacji.

**Razem: 10 tooli** (+1 rename)

### Grupa I: Powiadomienia — nowy plik `src/tools/notifications.ts`

| Tool                         | Endpoint                          | Input                         |
| ---------------------------- | --------------------------------- | ----------------------------- |
| `notifications_list`         | `GET /notifications`              | `{ page?, per_page?, type? }` |
| `notifications_unread_count` | `GET /notifications/unread-count` | —                             |
| `notification_read`          | `PUT /notifications/{id}/read`    | `{ id }`                      |
| `notifications_read_all`     | `PUT /notifications/read-all`     | `{ type? }`                   |

**Razem: 4 tooli**

---

## Narzędzia — Faza 3 (Multipart)

### Grupa J: CSV — nowy plik `src/tools/csv.ts`

| Tool        | Endpoint          | Input                                       |
| ----------- | ----------------- | ------------------------------------------- |
| `csv_parse` | `POST /parse-csv` | `{ file_base64: string, filename: string }` |

**Tylko parse-csv.** `import-csv` wymaga Cart-Token (WC Store API) — poza zakresem.

**Razem: 1 tool**

---

## Podsumowanie — wszystkie nowe narzędzia

| Grupa              | Plik                    | Liczba         | Auth          |
| ------------------ | ----------------------- | -------------- | ------------- |
| Faza 0             | `plugin-client.ts`      | (infra)        | —             |
| Auth login         | `panel.ts`              | 6              | X-PANEL-KEY   |
| Profile            | `panel.ts`              | 5              | Bearer        |
| Patterns           | `patterns.ts`           | 4              | Bearer        |
| Favorites          | `favorites.ts`          | 3              | Bearer        |
| Projects           | `projects.ts`           | 5              | Bearer        |
| Production         | `production.ts`         | 1              | Bearer        |
| Configurator extra | `configurator-extra.ts` | 1              | Bearer        |
| Reviews extra      | `products-misc.ts`      | 3              | Bearer        |
| Q&A                | `questions.ts`          | 10 (+1 rename) | Bearer/public |
| Notifications      | `notifications.ts`      | 4              | Bearer        |
| CSV                | `csv.ts`                | 1              | X-PANEL-KEY   |
| **Razem**          |                         | **~43**        |               |

---

## Kolejność implementacji

```
Faza 0 (plugin-client.ts)
  │
  ├──▶ Faza 1 (6 tooli, panel.ts)
  │       └── auth_login   ──dostarcza token──▶
  │                                              ▼
  │                                   Faza 2 (34 tooli, 8 plików)
  │                                   └── równolegle między plikami
  │
  └──▶ Faza 3 (1 tool, csv.ts)
```

1. **Faza 0** → `plugin-client.ts` — sekwencyjnie (bloker)
2. **Fazy 1+3** → `panel.ts` + `csv.ts` — równolegle (różne pliki, oba X-PANEL-KEY)
3. **Faza 2** → 8 plików — **równolegle** (niezależne pliki)

---

## Ryzyka i mitygacje

| Ryzyko                                                             | Mitygacja                                                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Bearer token w `getPanelClient()` zepsuje istniejące narzędzia     | Użyć `delete headers['X-PANEL-KEY']` gdy Bearer obecny; testy regresji                           |
| `setPanelToken()` nie wpływa na istniejący singleton               | Zawsze wołać `resetPanelClient()` wewnątrz `setPanelToken()`                                     |
| Token wygasa (401) w trakcie sesji                                 | Na razie: błąd propaguje do agenta, agent woła ponownie `auth_login`. Później: axios interceptor |
| Konflikt nazw `answers_mark_best`                                  | Przemianować istniejące → `qa_answer_mark_best`                                                  |
| Brak `.strict()` na Zod schemas                                    | Dodać `.strict()` do WSZYSTKICH nowych i istniejących tooli                                      |
| Hasło w params JSON-RPC (security)                                 | Świadome ryzyko — udokumentowane w AGENTS.md                                                     |
| Duplikacja z `orders_list` (WC API) vs `auth_orders_list` (plugin) | Osobne prefiksy: `orders_list` (WC) vs `auth_orders_list` (plugin)                               |

---

## Weryfikacja

Po każdej fazie:

```bash
npm run build        # TypeScript compilation
npm run type-check   # tsc --noEmit
npm run lint         # ESLint
npm test             # Vitest
```

Przed mergem: sprawdzić czy wszystkie 122 istniejące + 43 nowe = ~165 tooli jest zarejestrowanych.
