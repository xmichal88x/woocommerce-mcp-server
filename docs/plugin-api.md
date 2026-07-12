# WooCommerce MCP Server — Referencja API

## Spis treści

1. [Overview](#1-overview)
2. [Quick Reference](#2-quick-reference)
3. [Configuration Reference](#3-configuration-reference)
4. [Detailed Tool Reference](#4-detailed-tool-reference)
   - [Products](#41-products)
   - [Orders](#42-orders)
   - [Customers](#43-customers)
   - [Coupons](#44-coupons)
   - [Shipping](#45-shipping)
   - [Taxes](#46-taxes)
   - [Reports](#47-reports)
   - [System](#48-system)
   - [Email](#49-email)
   - [Media](#410-media)
5. [Error Reference](#5-error-reference)
6. [Type Reference](#6-type-reference)

---

## 1. Overview

WooCommerce MCP Server to serwer implementujący protokół MCP (Model Context Protocol), który udostępnia narzędzia do zarządzania sklepem WooCommerce przez API REST (wc/v3). Serwer działa jako warstwa pośrednicząca między AI agentem a WooCommerce REST API.

**Transport:** Standardowy transport MCP (stdio), możliwy do rozszerzenia o Streamable HTTP.

**Protokół:** Wszystkie narzędzia komunikują się przez JSON-RPC 2.0 za pomocą MCP SDK.

**Zabezpieczenia:**

- Wymuszony HTTPS dla połączeń z WooCommerce
- Blokada adresów prywatnych (SSRF protection)
- Opcjonalna lista dozwolonych domen
- Walidacja wejścia przez Zod
- Tryb read-only blokujący operacje modyfikujące

---

## 2. Quick Reference

| Narzędzie                          | Grupa        | Opis                       |
| ---------------------------------- | ------------ | -------------------------- |
| `products_list`                    | Products     | Lista produktów            |
| `products_get`                     | Products     | Pojedynczy produkt         |
| `products_create`                  | Products     | Utwórz produkt             |
| `products_update`                  | Products     | Aktualizuj produkt         |
| `products_delete`                  | Products     | Usuń produkt               |
| `products_batch`                   | Products     | Operacje wsadowe           |
| `products_variations_list`         | Products     | Lista wariantów            |
| `products_variations_get`          | Products     | Pojedynczy wariant         |
| `products_variations_create`       | Products     | Utwórz wariant             |
| `products_variations_update`       | Products     | Aktualizuj wariant         |
| `products_variations_delete`       | Products     | Usuń wariant               |
| `products_categories_list`         | Products     | Lista kategorii            |
| `products_categories_get`          | Products     | Pojedyncza kategoria       |
| `products_categories_create`       | Products     | Utwórz kategorię           |
| `products_categories_update`       | Products     | Aktualizuj kategorię       |
| `products_categories_delete`       | Products     | Usuń kategorię             |
| `products_tags_list`               | Products     | Lista tagów                |
| `products_tags_get`                | Products     | Pojedynczy tag             |
| `products_tags_create`             | Products     | Utwórz tag                 |
| `products_tags_update`             | Products     | Aktualizuj tag             |
| `products_tags_delete`             | Products     | Usuń tag                   |
| `products_attributes_list`         | Products     | Lista atrybutów            |
| `products_attributes_get`          | Products     | Pojedynczy atrybut         |
| `products_attributes_create`       | Products     | Utwórz atrybut             |
| `products_attributes_update`       | Products     | Aktualizuj atrybut         |
| `products_attributes_delete`       | Products     | Usuń atrybut               |
| `products_attributes_terms_list`   | Products     | Lista terminów atrybutu    |
| `products_attributes_terms_create` | Products     | Utwórz termin atrybutu     |
| `products_reviews_list`            | Products     | Lista opinii               |
| `products_reviews_get`             | Products     | Pojedyncza opinia          |
| `products_reviews_create`          | Products     | Utwórz opinię              |
| `orders_list`                      | Orders       | Lista zamówień             |
| `orders_get`                       | Orders       | Pojedyncze zamówienie      |
| `orders_create`                    | Orders       | Utwórz zamówienie          |
| `orders_update`                    | Orders       | Aktualizuj zamówienie      |
| `orders_delete`                    | Orders       | Usuń zamówienie            |
| `orders_batch`                     | Orders       | Operacje wsadowe           |
| `orders_notes_list`                | Orders       | Lista notatek              |
| `orders_notes_create`              | Orders       | Utwórz notatkę             |
| `orders_refunds_list`              | Orders       | Lista zwrotów              |
| `orders_refunds_get`               | Orders       | Pojedynczy zwrot           |
| `orders_refunds_create`            | Orders       | Utwórz zwrot               |
| `customers_list`                   | Customers    | Lista klientów             |
| `customers_get`                    | Customers    | Pojedynczy klient          |
| `customers_create`                 | Customers    | Utwórz klienta             |
| `customers_update`                 | Customers    | Aktualizuj klienta         |
| `customers_delete`                 | Customers    | Usuń klienta               |
| `customers_batch`                  | Customers    | Operacje wsadowe           |
| `coupons_list`                     | Coupons      | Lista kuponów              |
| `coupons_get`                      | Coupons      | Pojedynczy kupon           |
| `coupons_create`                   | Coupons      | Utwórz kupon               |
| `coupons_update`                   | Coupons      | Aktualizuj kupon           |
| `coupons_delete`                   | Coupons      | Usuń kupon                 |
| `coupons_batch`                    | Coupons      | Operacje wsadowe           |
| `shipping_zones_list`              | Shipping     | Lista stref                |
| `shipping_zones_get`               | Shipping     | Pojedyncza strefa          |
| `shipping_zones_create`            | Shipping     | Utwórz strefę              |
| `shipping_zones_update`            | Shipping     | Aktualizuj strefę          |
| `shipping_zones_delete`            | Shipping     | Usuń strefę                |
| `shipping_zone_methods_list`       | Shipping     | Lista metod                |
| `shipping_zone_methods_get`        | Shipping     | Pojedyncza metoda          |
| `shipping_zone_methods_create`     | Shipping     | Dodaj metodę               |
| `shipping_zone_methods_update`     | Shipping     | Aktualizuj metodę          |
| `shipping_zone_methods_delete`     | Shipping     | Usuń metodę                |
| `shipping_zone_locations_list`     | Shipping     | Lista lokalizacji          |
| `taxes_classes_list`               | Taxes        | Lista klas podatkowych     |
| `taxes_classes_create`             | Taxes        | Utwórz klasę               |
| `taxes_classes_delete`             | Taxes        | Usuń klasę                 |
| `taxes_rates_list`                 | Taxes        | Lista stawek               |
| `taxes_rates_get`                  | Taxes        | Pojedyncza stawka          |
| `taxes_rates_create`               | Taxes        | Utwórz stawkę              |
| `taxes_rates_update`               | Taxes        | Aktualizuj stawkę          |
| `taxes_rates_delete`               | Taxes        | Usuń stawkę                |
| `reports_sales`                    | Reports      | Raport sprzedaży           |
| `reports_top_sellers`              | Reports      | Najlepiej sprzedające się  |
| `reports_products`                 | Reports      | Raport produktów           |
| `reports_orders`                   | Reports      | Raport zamówień            |
| `reports_customers`                | Reports      | Raport klientów            |
| `reports_coupons`                  | Reports      | Raport kuponów             |
| `reports_stock`                    | Reports      | Raport stanów              |
| `reports_revenue`                  | Reports      | Przychody                  |
| `system_status`                    | System       | Status systemu             |
| `system_status_tools`              | System       | Narzędzia statusu          |
| `system_data`                      | System       | Dane sklepu                |
| `system_continents`                | System       | Kontynenty                 |
| `system_countries`                 | System       | Kraje                      |
| `system_currencies`                | System       | Waluty                     |
| `system_current_currency`          | System       | Bieżąca waluta             |
| `system_settings`                  | System       | Ustawienia sklepu          |
| `system_payment_gateways`          | System       | Bramki płatności           |
| `email_send`                       | Email        | Wyślij email               |
| `additional_services_list`         | Configurator | Usługi dodatkowe           |
| `configurator_data_get`            | Configurator | Parametry konfiguratora    |
| `edge_type_tools_list`             | Configurator | Narzędzia do profili       |
| `product_schema_get`               | Configurator | Schemat konfiguratora      |
| `tool_lists_list`                  | Configurator | Listy narzędzi             |
| `tools_list`                       | Configurator | Lista narzędzi CNC         |
| `media_delete`                     | Media        | Usuń media                 |
| `media_list`                       | Media        | Lista mediów               |
| `media_upload`                     | Media        | Upload obrazka             |
| `company_info_get`                 | Panel        | Dane firmy                 |
| `faq_categories_list`              | Panel        | Kategorie FAQ              |
| `faq_create`                       | Panel        | Utwórz FAQ                 |
| `faq_delete`                       | Panel        | Usuń FAQ                   |
| `faq_list`                         | Panel        | Lista FAQ                  |
| `faq_update`                       | Panel        | Aktualizuj FAQ             |
| `features_get`                     | Panel        | Feature flagi              |
| `popularity_settings_get`          | Panel        | Ustawienia popularności    |
| `popularity_settings_update`       | Panel        | Aktualizuj popularność     |
| `production_csv_generate`          | Panel        | Generuj CSV produkcji      |
| `production_csv_status_get`        | Panel        | Status CSV                 |
| `products_answers_mark_best`       | Panel        | Oznacz najlepszą odpowiedź |
| `products_lite_list`               | Panel        | Lekka lista produktów      |
| `products_popular_get`             | Panel        | Popularne produkty         |
| `products_questions_admin_list`    | Panel        | Pytania (admin)            |
| `products_questions_answer`        | Panel        | Odpowiadanie na pytania    |
| `products_reviews_admin_list`      | Panel        | Opinie (admin)             |
| `products_reviews_moderate`        | Panel        | Moderacja opinii           |
| `product_gallery_set`              | Products-ext | Ustaw galerię zdjęć        |
| `product_images_set`               | Products-ext | Ustaw główne zdjęcie       |
| `products_cross_sells_set`         | Products-ext | Ustaw produkty powiązane   |
| `products_shipping_classes_create` | Products-ext | Utwórz klasę wysyłki       |
| `products_shipping_classes_delete` | Products-ext | Usuń klasę wysyłki         |
| `products_shipping_classes_list`   | Products-ext | Lista klas wysyłki         |
| `products_shipping_classes_update` | Products-ext | Aktualizuj klasę wysyłki   |

---

## 3. Configuration Reference

### Zmienne środowiskowe — WooCommerce API

| Zmienna                       | Typ      | Domyślnie | Wymagane | Opis                           |
| ----------------------------- | -------- | --------- | -------- | ------------------------------ |
| `WOOCOMMERCE_URL`             | `string` | —         | Tak      | URL sklepu WooCommerce (HTTPS) |
| `WOOCOMMERCE_CONSUMER_KEY`    | `string` | —         | Tak      | Klucz konsumenta REST API      |
| `WOOCOMMERCE_CONSUMER_SECRET` | `string` | —         | Tak      | Sekret konsumenta REST API     |

### Zmienne środowiskowe — konfiguracja serwera

| Zmienna                | Typ       | Domyślnie | Opis                                                                                                  |
| ---------------------- | --------- | --------- | ----------------------------------------------------------------------------------------------------- |
| `WC_TOOL_GROUPS`       | `string`  | `all`     | Grupy narzędzi do włączenia. `all` lub lista oddzielona przecinkami (np. `products,orders,customers`) |
| `WC_READ_ONLY`         | `boolean` | `false`   | Tryb tylko do odczytu — blokuje operacje modyfikujące (create, update, delete, batch)                 |
| `WC_TIMEOUT_MS`        | `integer` | `15000`   | Timeout żądań API w milisekundach (minimum 1)                                                         |
| `WC_RETRY_COUNT`       | `integer` | `3`       | Liczba ponownych prób przy błędach sieciowych i 5xx (minimum 0)                                       |
| `WC_BLOCK_PRIVATE_IPS` | `boolean` | `true`    | Blokada adresów prywatnych (SSRF protection). Ustaw `false` aby wyłączyć                              |
| `WC_ALLOWED_DOMAINS`   | `string`  | —         | Lista dozwolonych domen oddzielona przecinkami. Pusta = wszystkie dozwolone                           |
| `WC_LOG_LEVEL`         | `string`  | `info`    | Poziom logowania: `debug` \| `info` \| `error`                                                        |

### Zmienne środowiskowe — SMTP (email)

| Zmienna               | Typ       | Domyślnie   | Wymagane  | Opis                                                 |
| --------------------- | --------- | ----------- | --------- | ---------------------------------------------------- |
| `SMTP_HOST`           | `string`  | —           | Dla email | Host serwera SMTP                                    |
| `SMTP_PORT`           | `integer` | `587`       | Dla email | Port SMTP                                            |
| `SMTP_USER`           | `string`  | —           | Dla email | Nazwa użytkownika SMTP                               |
| `SMTP_PASS`           | `string`  | —           | Dla email | Hasło SMTP                                           |
| `SMTP_FROM`           | `string`  | `SMTP_USER` | Nie       | Adres nadawcy                                        |
| `SMTP_RETRY_AFTER_MS` | `integer` | `30000`     | Nie       | Czas oczekiwania przed ponowną próbą po błędzie SMTP |

---

## 4. Detailed Tool Reference

### 4.1 Products

Grupa `products` — 31 narzędzi do zarządzania produktami, wariantami, kategoriami, tagami, atrybutami i opiniami.

---

#### `products_list`

Lista produktów z opcjonalnym filtrowaniem.

**Endpoint WooCommerce:** `GET /wc/v3/products`

**Parametry:**

| Parametr       | Typ       | Wymagane | Domyślnie | Opis                                                                       |
| -------------- | --------- | -------- | --------- | -------------------------------------------------------------------------- |
| `page`         | `integer` | Nie      | —         | Numer strony                                                               |
| `per_page`     | `integer` | Nie      | `10`      | Elementów na stronę (max 100)                                              |
| `search`       | `string`  | Nie      | —         | Fraza wyszukiwania                                                         |
| `status`       | `string`  | Nie      | —         | Status produktu: `draft`, `pending`, `private`, `publish`, `any`           |
| `category`     | `integer` | Nie      | —         | ID kategorii                                                               |
| `tag`          | `integer` | Nie      | —         | ID taga                                                                    |
| `sku`          | `string`  | Nie      | —         | SKU produktu                                                               |
| `orderby`      | `string`  | Nie      | —         | Sortowanie: `date`, `id`, `title`, `slug`, `price`, `popularity`, `rating` |
| `order`        | `string`  | Nie      | —         | Kierunek: `asc`, `desc`                                                    |
| `min_price`    | `string`  | Nie      | —         | Cena minimalna                                                             |
| `max_price`    | `string`  | Nie      | —         | Cena maksymalna                                                            |
| `on_sale`      | `boolean` | Nie      | —         | Filtruj po promocji                                                        |
| `stock_status` | `string`  | Nie      | —         | Status magazynu: `instock`, `outofstock`, `onbackorder`                    |

**Odpowiedź:**

```json
{
  "products": [ { "id": 1, "name": "Product", ... } ],
  "total": 50,
  "totalPages": 5
}
```

---

#### `products_get`

Pojedynczy produkt po ID.

**Endpoint WooCommerce:** `GET /wc/v3/products/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane | Opis        |
| -------- | --------- | -------- | ----------- |
| `id`     | `integer` | Tak      | ID produktu |

**Odpowiedź:** Obiekt `WooProduct` w JSON.

---

#### `products_create`

Utwórz nowy produkt.

**Endpoint WooCommerce:** `POST /wc/v3/products`

**Parametry:**

| Parametr            | Typ       | Wymagane | Domyślnie | Opis                                             |
| ------------------- | --------- | -------- | --------- | ------------------------------------------------ |
| `name`              | `string`  | **Tak**  | —         | Nazwa produktu                                   |
| `type`              | `string`  | Nie      | `simple`  | Typ: `simple`, `grouped`, `external`, `variable` |
| `regular_price`     | `string`  | Nie      | —         | Cena regularna                                   |
| `sale_price`        | `string`  | Nie      | —         | Cena promocyjna                                  |
| `description`       | `string`  | Nie      | —         | Opis produktu (HTML)                             |
| `short_description` | `string`  | Nie      | —         | Krótki opis (HTML)                               |
| `sku`               | `string`  | Nie      | —         | SKU                                              |
| `stock_quantity`    | `integer` | Nie      | —         | Stan magazynowy                                  |
| `stock_status`      | `string`  | Nie      | —         | Status: `instock`, `outofstock`, `onbackorder`   |
| `categories`        | `array`   | Nie      | —         | `[{ id: integer }]`                              |
| `tags`              | `array`   | Nie      | —         | `[{ id: integer }]`                              |
| `images`            | `array`   | Nie      | —         | `[{ src: string }]`                              |
| `attributes`        | `array`   | Nie      | —         | Atrybuty produktu                                |
| `weight`            | `string`  | Nie      | —         | Waga                                             |
| `dimensions`        | `object`  | Nie      | —         | `{ length, width, height }`                      |
| `meta_data`         | `array`   | Nie      | —         | `[{ key: string, value: any }]`                  |

**Odpowiedź:** Obiekt `WooProduct` w JSON.

**Błąd:** `READ_ONLY` w trybie read-only.

---

#### `products_update`

Aktualizuj istniejący produkt.

**Endpoint WooCommerce:** `PUT /wc/v3/products/{id}`

**Parametry:** Jak w `products_create`, plus wymagane `id`.

| Parametr | Typ       | Wymagane | Opis        |
| -------- | --------- | -------- | ----------- |
| `id`     | `integer` | **Tak**  | ID produktu |

**Odpowiedź:** Obiekt `WooProduct` w JSON.

**Błąd:** `READ_ONLY` w trybie read-only.

---

#### `products_delete`

Usuń produkt.

**Endpoint WooCommerce:** `DELETE /wc/v3/products/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane | Domyślnie | Opis                      |
| -------- | --------- | -------- | --------- | ------------------------- |
| `id`     | `integer` | **Tak**  | —         | ID produktu               |
| `force`  | `boolean` | Nie      | `true`    | Force delete (pomiń kosz) |

**Odpowiedź:** Obiekt `WooProduct` (usunięty) w JSON.

**Błąd:** `READ_ONLY` w trybie read-only.

---

#### `products_batch`

Operacje wsadowe na produktach.

**Endpoint WooCommerce:** `POST /wc/v3/products/batch`

**Parametry:**

| Parametr | Typ     | Wymagane | Opis                             |
| -------- | ------- | -------- | -------------------------------- |
| `create` | `array` | Nie      | `[{ name, regular_price, ... }]` |
| `update` | `array` | Nie      | `[{ id, name, ... }]`            |
| `delete` | `array` | Nie      | `[id1, id2, ...]`                |

**Odpowiedź:** `{ create: [...], update: [...], delete: [...] }`

**Błąd:** `READ_ONLY` w trybie read-only.

---

#### `products_variations_list`

Lista wariantów produktu.

**Endpoint WooCommerce:** `GET /wc/v3/products/{product_id}/variations`

**Parametry:**

| Parametr     | Typ       | Wymagane | Domyślnie | Opis                          |
| ------------ | --------- | -------- | --------- | ----------------------------- |
| `product_id` | `integer` | **Tak**  | —         | ID produktu nadrzędnego       |
| `page`       | `integer` | Nie      | —         | Numer strony                  |
| `per_page`   | `integer` | Nie      | `10`      | Elementów na stronę (max 100) |

**Odpowiedź:**

```json
{
  "variations": [ { "id": 1, "regular_price": "10.00", ... } ],
  "total": 10,
  "totalPages": 1
}
```

---

#### `products_variations_get`

Pojedynczy wariant produktu.

**Endpoint WooCommerce:** `GET /wc/v3/products/{product_id}/variations/{variation_id}`

**Parametry:**

| Parametr       | Typ       | Wymagane | Opis                    |
| -------------- | --------- | -------- | ----------------------- |
| `product_id`   | `integer` | **Tak**  | ID produktu nadrzędnego |
| `variation_id` | `integer` | **Tak**  | ID wariantu             |

---

#### `products_variations_create`

Utwórz wariant produktu.

**Endpoint WooCommerce:** `POST /wc/v3/products/{product_id}/variations`

**Parametry:**

| Parametr         | Typ       | Wymagane | Opis                                   |
| ---------------- | --------- | -------- | -------------------------------------- |
| `product_id`     | `integer` | **Tak**  | ID produktu nadrzędnego                |
| `regular_price`  | `string`  | Nie      | Cena regularna                         |
| `sale_price`     | `string`  | Nie      | Cena promocyjna                        |
| `sku`            | `string`  | Nie      | SKU wariantu                           |
| `stock_quantity` | `integer` | Nie      | Stan magazynowy                        |
| `stock_status`   | `string`  | Nie      | `instock`, `outofstock`, `onbackorder` |
| `weight`         | `string`  | Nie      | Waga wariantu                          |
| `dimensions`     | `object`  | Nie      | `{ length, width, height }`            |
| `attributes`     | `array`   | Nie      | Atrybuty wariantu                      |
| `image`          | `object`  | Nie      | `{ src, alt, name }`                   |
| `meta_data`      | `array`   | Nie      | `[{ key, value }]`                     |

---

#### `products_variations_update`

Aktualizuj wariant produktu.

**Endpoint WooCommerce:** `PUT /wc/v3/products/{product_id}/variations/{variation_id}`

**Parametry:** Jak w `products_variations_create`, plus wymagane `variation_id`.

| Parametr       | Typ       | Wymagane |
| -------------- | --------- | -------- |
| `product_id`   | `integer` | **Tak**  |
| `variation_id` | `integer` | **Tak**  |

---

#### `products_variations_delete`

Usuń wariant produktu.

**Endpoint WooCommerce:** `DELETE /wc/v3/products/{product_id}/variations/{variation_id}`

**Parametry:**

| Parametr       | Typ       | Wymagane | Domyślnie | Opis                    |
| -------------- | --------- | -------- | --------- | ----------------------- |
| `product_id`   | `integer` | **Tak**  | —         | ID produktu nadrzędnego |
| `variation_id` | `integer` | **Tak**  | —         | ID wariantu             |
| `force`        | `boolean` | Nie      | `true`    | Force delete            |

---

#### `products_categories_list`

Lista kategorii produktów.

**Endpoint WooCommerce:** `GET /wc/v3/products/categories`

**Parametry:**

| Parametr     | Typ       | Wymagane | Domyślnie | Opis                          |
| ------------ | --------- | -------- | --------- | ----------------------------- |
| `page`       | `integer` | Nie      | —         | Numer strony                  |
| `per_page`   | `integer` | Nie      | `10`      | Elementów na stronę (max 100) |
| `search`     | `string`  | Nie      | —         | Fraza wyszukiwania            |
| `hide_empty` | `boolean` | Nie      | —         | Ukryj puste kategorie         |

**Odpowiedź:**

```json
{
  "categories": [ { "id": 1, "name": "Clothing", ... } ],
  "total": 5,
  "totalPages": 1
}
```

---

#### `products_categories_get`

Pojedyncza kategoria.

**Endpoint WooCommerce:** `GET /wc/v3/products/categories/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane |
| -------- | --------- | -------- |
| `id`     | `integer` | **Tak**  |

---

#### `products_categories_create`

Utwórz kategorię.

**Endpoint WooCommerce:** `POST /wc/v3/products/categories`

**Parametry:**

| Parametr      | Typ       | Wymagane | Opis                    |
| ------------- | --------- | -------- | ----------------------- |
| `name`        | `string`  | **Tak**  | Nazwa kategorii         |
| `slug`        | `string`  | Nie      | Slug kategorii          |
| `description` | `string`  | Nie      | Opis                    |
| `parent`      | `integer` | Nie      | ID kategorii nadrzędnej |
| `image`       | `object`  | Nie      | `{ src, alt }`          |

---

#### `products_categories_update`

Aktualizuj kategorię.

**Endpoint WooCommerce:** `PUT /wc/v3/products/categories/{id}`

**Parametry:** Jak w `products_categories_create`, plus wymagane `id`.

---

#### `products_categories_delete`

Usuń kategorię.

**Endpoint WooCommerce:** `DELETE /wc/v3/products/categories/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane | Domyślnie | Opis         |
| -------- | --------- | -------- | --------- | ------------ |
| `id`     | `integer` | **Tak**  | —         | ID kategorii |
| `force`  | `boolean` | Nie      | `true`    | Force delete |

---

#### `products_tags_list`

Lista tagów produktów.

**Endpoint WooCommerce:** `GET /wc/v3/products/tags`

**Parametry:**

| Parametr     | Typ       | Wymagane | Domyślnie | Opis                          |
| ------------ | --------- | -------- | --------- | ----------------------------- |
| `page`       | `integer` | Nie      | —         | Numer strony                  |
| `per_page`   | `integer` | Nie      | `10`      | Elementów na stronę (max 100) |
| `search`     | `string`  | Nie      | —         | Fraza wyszukiwania            |
| `orderby`    | `string`  | Nie      | —         | `id`, `name`, `slug`, `count` |
| `order`      | `string`  | Nie      | —         | `asc`, `desc`                 |
| `hide_empty` | `boolean` | Nie      | —         | Ukryj puste tagi              |

---

#### `products_tags_get`

Pojedynczy tag.

**Endpoint WooCommerce:** `GET /wc/v3/products/tags/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane |
| -------- | --------- | -------- |
| `id`     | `integer` | **Tak**  |

---

#### `products_tags_create`

Utwórz tag.

**Endpoint WooCommerce:** `POST /wc/v3/products/tags`

**Parametry:**

| Parametr      | Typ      | Wymagane | Opis       |
| ------------- | -------- | -------- | ---------- |
| `name`        | `string` | **Tak**  | Nazwa taga |
| `slug`        | `string` | Nie      | Slug       |
| `description` | `string` | Nie      | Opis       |

---

#### `products_tags_update`

Aktualizuj tag.

**Endpoint WooCommerce:** `PUT /wc/v3/products/tags/{id}`

**Parametry:** Jak w `products_tags_create`, plus wymagane `id`.

---

#### `products_tags_delete`

Usuń tag.

**Endpoint WooCommerce:** `DELETE /wc/v3/products/tags/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane | Domyślnie | Opis         |
| -------- | --------- | -------- | --------- | ------------ |
| `id`     | `integer` | **Tak**  | —         | ID taga      |
| `force`  | `boolean` | Nie      | `true`    | Force delete |

---

#### `products_attributes_list`

Lista atrybutów produktów.

**Endpoint WooCommerce:** `GET /wc/v3/products/attributes`

**Parametry:**

| Parametr   | Typ       | Wymagane | Domyślnie | Opis                          |
| ---------- | --------- | -------- | --------- | ----------------------------- |
| `page`     | `integer` | Nie      | —         | Numer strony                  |
| `per_page` | `integer` | Nie      | `10`      | Elementów na stronę (max 100) |
| `search`   | `string`  | Nie      | —         | Fraza wyszukiwania            |
| `orderby`  | `string`  | Nie      | —         | `id`, `name`, `slug`, `count` |
| `order`    | `string`  | Nie      | —         | `asc`, `desc`                 |

---

#### `products_attributes_get`

Pojedynczy atrybut.

**Endpoint WooCommerce:** `GET /wc/v3/products/attributes/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane |
| -------- | --------- | -------- |
| `id`     | `integer` | **Tak**  |

---

#### `products_attributes_create`

Utwórz atrybut.

**Endpoint WooCommerce:** `POST /wc/v3/products/attributes`

**Parametry:**

| Parametr       | Typ       | Wymagane | Domyślnie | Opis                                   |
| -------------- | --------- | -------- | --------- | -------------------------------------- |
| `name`         | `string`  | **Tak**  | —         | Nazwa atrybutu                         |
| `slug`         | `string`  | Nie      | —         | Slug                                   |
| `type`         | `string`  | Nie      | `select`  | `select` \| `text`                     |
| `order_by`     | `string`  | Nie      | —         | `menu_order`, `name`, `name_num`, `id` |
| `has_archives` | `boolean` | Nie      | —         | Włącz archiwa atrybutu                 |

---

#### `products_attributes_update`

Aktualizuj atrybut.

**Endpoint WooCommerce:** `PUT /wc/v3/products/attributes/{id}`

**Parametry:** Jak w `products_attributes_create`, plus wymagane `id`.

---

#### `products_attributes_delete`

Usuń atrybut.

**Endpoint WooCommerce:** `DELETE /wc/v3/products/attributes/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane | Domyślnie | Opis         |
| -------- | --------- | -------- | --------- | ------------ |
| `id`     | `integer` | **Tak**  | —         | ID atrybutu  |
| `force`  | `boolean` | Nie      | `true`    | Force delete |

---

#### `products_attributes_terms_list`

Lista terminów atrybutu.

**Endpoint WooCommerce:** `GET /wc/v3/products/attributes/{attribute_id}/terms`

**Parametry:**

| Parametr       | Typ       | Wymagane | Domyślnie | Opis                          |
| -------------- | --------- | -------- | --------- | ----------------------------- |
| `attribute_id` | `integer` | **Tak**  | —         | ID atrybutu                   |
| `page`         | `integer` | Nie      | —         | Numer strony                  |
| `per_page`     | `integer` | Nie      | `10`      | Elementów na stronę (max 100) |
| `search`       | `string`  | Nie      | —         | Fraza wyszukiwania            |
| `orderby`      | `string`  | Nie      | —         | `id`, `name`, `slug`, `count` |
| `order`        | `string`  | Nie      | —         | `asc`, `desc`                 |
| `hide_empty`   | `boolean` | Nie      | —         | Ukryj puste terminy           |

**Odpowiedź:**

```json
{
  "terms": [ { "id": 1, "name": "Red", ... } ],
  "total": 5,
  "totalPages": 1
}
```

---

#### `products_attributes_terms_create`

Utwórz termin atrybutu.

**Endpoint WooCommerce:** `POST /wc/v3/products/attributes/{attribute_id}/terms`

**Parametry:**

| Parametr       | Typ       | Wymagane | Opis          |
| -------------- | --------- | -------- | ------------- |
| `attribute_id` | `integer` | **Tak**  | ID atrybutu   |
| `name`         | `string`  | **Tak**  | Nazwa terminu |
| `slug`         | `string`  | Nie      | Slug          |
| `description`  | `string`  | Nie      | Opis          |

---

#### `products_reviews_list`

Lista opinii produktów.

**Endpoint WooCommerce:** `GET /wc/v3/products/reviews`

**Parametry:**

| Parametr   | Typ       | Wymagane | Domyślnie | Opis                                                 |
| ---------- | --------- | -------- | --------- | ---------------------------------------------------- |
| `page`     | `integer` | Nie      | —         | Numer strony                                         |
| `per_page` | `integer` | Nie      | `10`      | Elementów na stronę (max 100)                        |
| `search`   | `string`  | Nie      | —         | Fraza wyszukiwania                                   |
| `product`  | `integer` | Nie      | —         | ID produktu                                          |
| `status`   | `string`  | Nie      | —         | `approved`, `hold`, `spam`, `unspam`, `trash`, `all` |
| `orderby`  | `string`  | Nie      | —         | `date`, `id`, `product`, `rating`                    |
| `order`    | `string`  | Nie      | —         | `asc`, `desc`                                        |

**Odpowiedź:**

```json
{
  "reviews": [ { "id": 1, "reviewer": "John", ... } ],
  "total": 20,
  "totalPages": 2
}
```

---

#### `products_reviews_get`

Pojedyncza opinia.

**Endpoint WooCommerce:** `GET /wc/v3/products/reviews/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane |
| -------- | --------- | -------- |
| `id`     | `integer` | **Tak**  |

---

#### `products_reviews_create`

Utwórz opinię.

**Endpoint WooCommerce:** `POST /wc/v3/products/reviews`

**Parametry:**

| Parametr         | Typ              | Wymagane | Opis             |
| ---------------- | ---------------- | -------- | ---------------- |
| `product_id`     | `integer`        | **Tak**  | ID produktu      |
| `review`         | `string`         | **Tak**  | Treść opinii     |
| `reviewer`       | `string`         | **Tak**  | Nazwa recenzenta |
| `reviewer_email` | `string` (email) | **Tak**  | Email recenzenta |
| `rating`         | `integer`        | Nie      | Ocena (1–5)      |

---

### 4.2 Orders

Grupa `orders` — 11 narzędzi do zarządzania zamówieniami, notatkami i zwrotami.

---

#### `orders_list`

Lista zamówień z opcjonalnym filtrowaniem.

**Endpoint WooCommerce:** `GET /wc/v3/orders`

**Parametry:**

| Parametr   | Typ       | Wymagane | Domyślnie | Opis                                                         |
| ---------- | --------- | -------- | --------- | ------------------------------------------------------------ |
| `page`     | `integer` | Nie      | —         | Numer strony                                                 |
| `per_page` | `integer` | Nie      | `10`      | Elementów na stronę (max 100)                                |
| `search`   | `string`  | Nie      | —         | Fraza wyszukiwania                                           |
| `after`    | `string`  | Nie      | —         | Data od (ISO 8601)                                           |
| `before`   | `string`  | Nie      | —         | Data do (ISO 8601)                                           |
| `status`   | `string`  | Nie      | —         | Status zamówienia (np. `pending`, `processing`, `completed`) |
| `customer` | `integer` | Nie      | —         | ID klienta                                                   |
| `product`  | `integer` | Nie      | —         | ID produktu                                                  |
| `orderby`  | `string`  | Nie      | —         | `date`, `id`, `title`, `slug`, `total`                       |
| `order`    | `string`  | Nie      | —         | `asc`, `desc`                                                |

---

#### `orders_get`

Pojedyncze zamówienie.

**Endpoint WooCommerce:** `GET /wc/v3/orders/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane |
| -------- | --------- | -------- |
| `id`     | `integer` | **Tak**  |

---

#### `orders_create`

Utwórz nowe zamówienie.

**Endpoint WooCommerce:** `POST /wc/v3/orders`

**Parametry:**

| Parametr               | Typ       | Wymagane | Opis                                              |
| ---------------------- | --------- | -------- | ------------------------------------------------- |
| `customer_id`          | `integer` | Nie      | ID klienta                                        |
| `payment_method`       | `string`  | Nie      | ID metody płatności                               |
| `payment_method_title` | `string`  | Nie      | Nazwa metody płatności                            |
| `set_paid`             | `boolean` | Nie      | Oznacz jako opłacone                              |
| `status`               | `string`  | Nie      | Status zamówienia                                 |
| `currency`             | `string`  | Nie      | Kod waluty (np. `USD`, `EUR`, `PLN`)              |
| `customer_note`        | `string`  | Nie      | Notatka klienta                                   |
| `billing`              | `object`  | Nie      | Adres rozliczeniowy (WooAddress)                  |
| `shipping`             | `object`  | Nie      | Adres wysyłki (WooAddress)                        |
| `line_items`           | `array`   | Nie      | `[{ product_id, variation_id, quantity, price }]` |
| `shipping_lines`       | `array`   | Nie      | `[{ method_id, method_title, total }]`            |
| `coupon_lines`         | `array`   | Nie      | `[{ code }]`                                      |
| `meta_data`            | `array`   | Nie      | `[{ key, value }]`                                |

---

#### `orders_update`

Aktualizuj zamówienie.

**Endpoint WooCommerce:** `PUT /wc/v3/orders/{id}`

**Parametry:** Jak w `orders_create`, plus wymagane `id`.

---

#### `orders_delete`

Usuń zamówienie.

**Endpoint WooCommerce:** `DELETE /wc/v3/orders/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane | Domyślnie | Opis          |
| -------- | --------- | -------- | --------- | ------------- |
| `id`     | `integer` | **Tak**  | —         | ID zamówienia |
| `force`  | `boolean` | Nie      | `true`    | Force delete  |

---

#### `orders_batch`

Operacje wsadowe na zamówieniach.

**Endpoint WooCommerce:** `POST /wc/v3/orders/batch`

**Parametry:**

| Parametr | Typ     | Wymagane | Opis                                 |
| -------- | ------- | -------- | ------------------------------------ |
| `create` | `array` | Nie      | `[{ customer_id, line_items, ... }]` |
| `update` | `array` | Nie      | `[{ id, status, ... }]`              |
| `delete` | `array` | Nie      | `[id1, id2, ...]`                    |

---

#### `orders_notes_list`

Lista notatek zamówienia.

**Endpoint WooCommerce:** `GET /wc/v3/orders/{order_id}/notes`

**Parametry:**

| Parametr   | Typ       | Wymagane | Domyślnie | Opis                          |
| ---------- | --------- | -------- | --------- | ----------------------------- |
| `order_id` | `integer` | **Tak**  | —         | ID zamówienia                 |
| `page`     | `integer` | Nie      | —         | Numer strony                  |
| `per_page` | `integer` | Nie      | `10`      | Elementów na stronę (max 100) |

**Odpowiedź:**

```json
{
  "notes": [ { "id": 1, "note": "Payment received", ... } ],
  "total": 3,
  "totalPages": 1
}
```

---

#### `orders_notes_create`

Utwórz notatkę dla zamówienia.

**Endpoint WooCommerce:** `POST /wc/v3/orders/{order_id}/notes`

**Parametry:**

| Parametr        | Typ       | Wymagane | Domyślnie | Opis                    |
| --------------- | --------- | -------- | --------- | ----------------------- |
| `order_id`      | `integer` | **Tak**  | —         | ID zamówienia           |
| `note`          | `string`  | **Tak**  | —         | Treść notatki           |
| `customer_note` | `boolean` | Nie      | `false`   | Pokaż notatkę klientowi |

---

#### `orders_refunds_list`

Lista zwrotów zamówienia.

**Endpoint WooCommerce:** `GET /wc/v3/orders/{order_id}/refunds`

**Parametry:**

| Parametr   | Typ       | Wymagane | Domyślnie | Opis                          |
| ---------- | --------- | -------- | --------- | ----------------------------- |
| `order_id` | `integer` | **Tak**  | —         | ID zamówienia                 |
| `page`     | `integer` | Nie      | —         | Numer strony                  |
| `per_page` | `integer` | Nie      | `10`      | Elementów na stronę (max 100) |

**Odpowiedź:**

```json
{
  "refunds": [ { "id": 1, "amount": "-10.00", ... } ],
  "total": 1,
  "totalPages": 1
}
```

---

#### `orders_refunds_get`

Pojedynczy zwrot.

**Endpoint WooCommerce:** `GET /wc/v3/orders/{order_id}/refunds/{refund_id}`

**Parametry:**

| Parametr    | Typ       | Wymagane |
| ----------- | --------- | -------- |
| `order_id`  | `integer` | **Tak**  |
| `refund_id` | `integer` | **Tak**  |

---

#### `orders_refunds_create`

Utwórz zwrot.

**Endpoint WooCommerce:** `POST /wc/v3/orders/{order_id}/refunds`

**Parametry:**

| Parametr         | Typ       | Wymagane | Domyślnie | Opis                                           |
| ---------------- | --------- | -------- | --------- | ---------------------------------------------- |
| `order_id`       | `integer` | **Tak**  | —         | ID zamówienia                                  |
| `amount`         | `string`  | **Tak**  | —         | Kwota zwrotu                                   |
| `reason`         | `string`  | Nie      | —         | Powód zwrotu                                   |
| `refund_payment` | `boolean` | Nie      | `false`   | Próba zwrotu przez bramkę                      |
| `api_refund`     | `boolean` | Nie      | `true`    | Zwrot przez API bramki                         |
| `line_items`     | `array`   | Nie      | —         | `[{ id, quantity, refund_total, refund_tax }]` |
| `meta_data`      | `array`   | Nie      | —         | `[{ key, value }]`                             |

---

### 4.3 Customers

Grupa `customers` — 7 narzędzi do zarządzania klientami.

---

#### `customers_list`

Lista klientów z opcjonalnym filtrowaniem.

**Endpoint WooCommerce:** `GET /wc/v3/customers`

**Parametry:**

| Parametr   | Typ       | Wymagane | Domyślnie | Opis                                      |
| ---------- | --------- | -------- | --------- | ----------------------------------------- |
| `page`     | `integer` | Nie      | —         | Numer strony                              |
| `per_page` | `integer` | Nie      | `10`      | Elementów na stronę (max 100)             |
| `search`   | `string`  | Nie      | —         | Fraza wyszukiwania                        |
| `email`    | `string`  | Nie      | —         | Filtruj po emailu                         |
| `role`     | `string`  | Nie      | —         | Rola (np. `all`, `customer`)              |
| `orderby`  | `string`  | Nie      | —         | `id`, `email`, `name`, `username`, `role` |
| `order`    | `string`  | Nie      | —         | `asc`, `desc`                             |

---

#### `customers_get`

Pojedynczy klient.

**Endpoint WooCommerce:** `GET /wc/v3/customers/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane |
| -------- | --------- | -------- |
| `id`     | `integer` | **Tak**  |

---

#### `customers_create`

Utwórz klienta.

**Endpoint WooCommerce:** `POST /wc/v3/customers`

**Parametry:**

| Parametr     | Typ              | Wymagane | Opis                |
| ------------ | ---------------- | -------- | ------------------- |
| `email`      | `string` (email) | **Tak**  | Email klienta       |
| `first_name` | `string`         | Nie      | Imię                |
| `last_name`  | `string`         | Nie      | Nazwisko            |
| `username`   | `string`         | Nie      | Nazwa użytkownika   |
| `password`   | `string`         | Nie      | Hasło               |
| `billing`    | `object`         | Nie      | Adres rozliczeniowy |
| `shipping`   | `object`         | Nie      | Adres wysyłki       |
| `meta_data`  | `array`          | Nie      | `[{ key, value }]`  |

---

#### `customers_update`

Aktualizuj klienta.

**Endpoint WooCommerce:** `PUT /wc/v3/customers/{id}`

**Parametry:** Jak w `customers_create`, plus wymagane `id`.

---

#### `customers_delete`

Usuń klienta.

**Endpoint WooCommerce:** `DELETE /wc/v3/customers/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane | Domyślnie | Opis         |
| -------- | --------- | -------- | --------- | ------------ |
| `id`     | `integer` | **Tak**  | —         | ID klienta   |
| `force`  | `boolean` | Nie      | `true`    | Force delete |

---

#### `customers_batch`

Operacje wsadowe na klientach.

**Endpoint WooCommerce:** `POST /wc/v3/customers/batch`

**Parametry:**

| Parametr | Typ     | Wymagane |
| -------- | ------- | -------- |
| `create` | `array` | Nie      |
| `update` | `array` | Nie      |
| `delete` | `array` | Nie      |

---

### 4.4 Coupons

Grupa `coupons` — 7 narzędzi do zarządzania kuponami rabatowymi.

---

#### `coupons_list`

Lista kuponów z opcjonalnym filtrowaniem.

**Endpoint WooCommerce:** `GET /wc/v3/coupons`

**Parametry:**

| Parametr   | Typ       | Wymagane | Domyślnie | Opis                                   |
| ---------- | --------- | -------- | --------- | -------------------------------------- |
| `page`     | `integer` | Nie      | —         | Numer strony                           |
| `per_page` | `integer` | Nie      | `10`      | Elementów na stronę (max 100)          |
| `search`   | `string`  | Nie      | —         | Fraza wyszukiwania                     |
| `code`     | `string`  | Nie      | —         | Kod kuponu                             |
| `exclude`  | `array`   | Nie      | —         | `[integer]` — wykluczone ID            |
| `include`  | `array`   | Nie      | —         | `[integer]` — uwzględnione ID          |
| `after`    | `string`  | Nie      | —         | Data od (ISO 8601)                     |
| `before`   | `string`  | Nie      | —         | Data do (ISO 8601)                     |
| `orderby`  | `string`  | Nie      | —         | `date`, `id`, `code`, `amount`, `type` |
| `order`    | `string`  | Nie      | —         | `asc`, `desc`                          |

---

#### `coupons_get`

Pojedynczy kupon.

**Endpoint WooCommerce:** `GET /wc/v3/coupons/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane |
| -------- | --------- | -------- |
| `id`     | `integer` | **Tak**  |

---

#### `coupons_create`

Utwórz kupon.

**Endpoint WooCommerce:** `POST /wc/v3/coupons`

**Parametry:**

| Parametr                      | Typ       | Wymagane | Domyślnie    | Opis                                     |
| ----------------------------- | --------- | -------- | ------------ | ---------------------------------------- |
| `code`                        | `string`  | **Tak**  | —            | Kod kuponu                               |
| `discount_type`               | `string`  | Nie      | `fixed_cart` | `percent`, `fixed_cart`, `fixed_product` |
| `amount`                      | `string`  | Nie      | —            | Kwota rabatu                             |
| `minimum_amount`              | `string`  | Nie      | —            | Minimalna kwota zamówienia               |
| `maximum_amount`              | `string`  | Nie      | —            | Maksymalna kwota zamówienia              |
| `individual_use`              | `boolean` | Nie      | —            | Tylko indywidualny użytek                |
| `exclude_sale_items`          | `boolean` | Nie      | —            | Wyklucz promowane produkty               |
| `product_ids`                 | `array`   | Nie      | —            | `[integer]` — ID produktów               |
| `excluded_product_ids`        | `array`   | Nie      | —            | `[integer]` — wykluczone produkty        |
| `product_categories`          | `array`   | Nie      | —            | `[integer]` — ID kategorii               |
| `excluded_product_categories` | `array`   | Nie      | —            | `[integer]` — wykluczone kategorie       |
| `usage_limit`                 | `integer` | Nie      | —            | Limit użyć                               |
| `usage_limit_per_user`        | `integer` | Nie      | —            | Limit na użytkownika                     |
| `limit_usage_to_x_items`      | `integer` | Nie      | —            | Limit na liczbę produktów                |
| `free_shipping`               | `boolean` | Nie      | —            | Darmowa wysyłka                          |
| `email_restrictions`          | `array`   | Nie      | —            | `[string]` — ograniczenia email          |
| `date_expires`                | `string`  | Nie      | —            | Data wygaśnięcia (ISO 8601)              |
| `description`                 | `string`  | Nie      | —            | Opis kuponu                              |
| `meta_data`                   | `array`   | Nie      | —            | `[{ key, value }]`                       |

---

#### `coupons_update`

Aktualizuj kupon.

**Endpoint WooCommerce:** `PUT /wc/v3/coupons/{id}`

**Parametry:** Jak w `coupons_create`, plus wymagane `id`.

---

#### `coupons_delete`

Usuń kupon.

**Endpoint WooCommerce:** `DELETE /wc/v3/coupons/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane | Domyślnie | Opis         |
| -------- | --------- | -------- | --------- | ------------ |
| `id`     | `integer` | **Tak**  | —         | ID kuponu    |
| `force`  | `boolean` | Nie      | `true`    | Force delete |

---

#### `coupons_batch`

Operacje wsadowe na kuponach.

**Endpoint WooCommerce:** `POST /wc/v3/coupons/batch`

**Parametry:**

| Parametr | Typ     | Wymagane |
| -------- | ------- | -------- |
| `create` | `array` | Nie      |
| `update` | `array` | Nie      |
| `delete` | `array` | Nie      |

---

### 4.5 Shipping

Grupa `shipping` — 11 narzędzi do zarządzania strefami wysyłki, metodami i lokalizacjami.

---

#### `shipping_zones_list`

Lista stref wysyłki.

**Endpoint WooCommerce:** `GET /wc/v3/shipping/zones`

**Brak parametrów.**

**Odpowiedź:**

```json
{
  "zones": [{ "id": 1, "name": "Poland", "order": 0 }]
}
```

---

#### `shipping_zones_get`

Pojedyncza strefa wysyłki.

**Endpoint WooCommerce:** `GET /wc/v3/shipping/zones/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane |
| -------- | --------- | -------- |
| `id`     | `integer` | **Tak**  |

---

#### `shipping_zones_create`

Utwórz strefę wysyłki.

**Endpoint WooCommerce:** `POST /wc/v3/shipping/zones`

**Parametry:**

| Parametr | Typ       | Wymagane | Opis                          |
| -------- | --------- | -------- | ----------------------------- |
| `name`   | `string`  | **Tak**  | Nazwa strefy                  |
| `order`  | `integer` | Nie      | Kolejność (niższa = pierwsza) |

---

#### `shipping_zones_update`

Aktualizuj strefę wysyłki.

**Endpoint WooCommerce:** `PUT /wc/v3/shipping/zones/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane | Opis         |
| -------- | --------- | -------- | ------------ |
| `id`     | `integer` | **Tak**  | ID strefy    |
| `name`   | `string`  | Nie      | Nazwa strefy |
| `order`  | `integer` | Nie      | Kolejność    |

---

#### `shipping_zones_delete`

Usuń strefę wysyłki.

**Endpoint WooCommerce:** `DELETE /wc/v3/shipping/zones/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane |
| -------- | --------- | -------- |
| `id`     | `integer` | **Tak**  |

---

#### `shipping_zone_methods_list`

Lista metod wysyłki dla strefy.

**Endpoint WooCommerce:** `GET /wc/v3/shipping/zones/{zone_id}/methods`

**Parametry:**

| Parametr  | Typ       | Wymagane |
| --------- | --------- | -------- |
| `zone_id` | `integer` | **Tak**  |

**Odpowiedź:**

```json
{
  "methods": [{ "id": 1, "method_id": "free_shipping", "title": "Free Shipping" }]
}
```

---

#### `shipping_zone_methods_get`

Pojedyncza metoda wysyłki.

**Endpoint WooCommerce:** `GET /wc/v3/shipping/zones/{zone_id}/methods/{method_id}`

**Parametry:**

| Parametr    | Typ       | Wymagane |
| ----------- | --------- | -------- |
| `zone_id`   | `integer` | **Tak**  |
| `method_id` | `integer` | **Tak**  |

---

#### `shipping_zone_methods_create`

Dodaj metodę wysyłki do strefy.

**Endpoint WooCommerce:** `POST /wc/v3/shipping/zones/{zone_id}/methods`

**Parametry:**

| Parametr    | Typ       | Wymagane | Domyślnie | Opis                                                          |
| ----------- | --------- | -------- | --------- | ------------------------------------------------------------- |
| `zone_id`   | `integer` | **Tak**  | —         | ID strefy                                                     |
| `method_id` | `string`  | **Tak**  | —         | Typ metody (np. `free_shipping`, `flat_rate`, `local_pickup`) |
| `title`     | `string`  | Nie      | —         | Nazwa metody                                                  |
| `order`     | `integer` | Nie      | —         | Kolejność                                                     |
| `enabled`   | `boolean` | Nie      | `true`    | Włączona                                                      |
| `settings`  | `object`  | Nie      | —         | Ustawienia (zależne od metody)                                |

---

#### `shipping_zone_methods_update`

Aktualizuj metodę wysyłki.

**Endpoint WooCommerce:** `PUT /wc/v3/shipping/zones/{zone_id}/methods/{method_id}`

**Parametry:**

| Parametr    | Typ       | Wymagane | Opis                |
| ----------- | --------- | -------- | ------------------- |
| `zone_id`   | `integer` | **Tak**  | ID strefy           |
| `method_id` | `integer` | **Tak**  | ID instancji metody |
| `title`     | `string`  | Nie      | Nazwa metody        |
| `order`     | `integer` | Nie      | Kolejność           |
| `enabled`   | `boolean` | Nie      | Włączona            |
| `settings`  | `object`  | Nie      | Ustawienia          |

---

#### `shipping_zone_methods_delete`

Usuń metodę wysyłki.

**Endpoint WooCommerce:** `DELETE /wc/v3/shipping/zones/{zone_id}/methods/{method_id}`

**Parametry:**

| Parametr    | Typ       | Wymagane |
| ----------- | --------- | -------- |
| `zone_id`   | `integer` | **Tak**  |
| `method_id` | `integer` | **Tak**  |

---

#### `shipping_zone_locations_list`

Lista lokalizacji dla strefy wysyłki.

**Endpoint WooCommerce:** `GET /wc/v3/shipping/zones/{zone_id}/locations`

**Parametry:**

| Parametr  | Typ       | Wymagane |
| --------- | --------- | -------- |
| `zone_id` | `integer` | **Tak**  |

**Odpowiedź:**

```json
{
  "locations": [{ "code": "PL", "type": "country" }]
}
```

---

### 4.6 Taxes

Grupa `taxes` — 8 narzędzi do zarządzania klasami i stawkami podatkowymi.

---

#### `taxes_classes_list`

Lista klas podatkowych.

**Endpoint WooCommerce:** `GET /wc/v3/taxes/classes`

**Brak parametrów.**

**Odpowiedź:**

```json
{
  "tax_classes": [{ "slug": "standard", "name": "Standard Rate" }]
}
```

---

#### `taxes_classes_create`

Utwórz klasę podatkową.

**Endpoint WooCommerce:** `POST /wc/v3/taxes/classes`

**Parametry:**

| Parametr | Typ      | Wymagane |
| -------- | -------- | -------- |
| `name`   | `string` | **Tak**  |

---

#### `taxes_classes_delete`

Usuń klasę podatkową po slugu.

**Endpoint WooCommerce:** `DELETE /wc/v3/taxes/classes/{slug}`

**Parametry:**

| Parametr | Typ      | Wymagane |
| -------- | -------- | -------- |
| `slug`   | `string` | **Tak**  |

---

#### `taxes_rates_list`

Lista stawek podatkowych.

**Endpoint WooCommerce:** `GET /wc/v3/taxes/rates`

**Parametry:**

| Parametr   | Typ       | Wymagane | Domyślnie | Opis                          |
| ---------- | --------- | -------- | --------- | ----------------------------- |
| `page`     | `integer` | Nie      | —         | Numer strony                  |
| `per_page` | `integer` | Nie      | `10`      | Elementów na stronę (max 100) |
| `class`    | `string`  | Nie      | —         | Slug klasy podatkowej         |
| `orderby`  | `string`  | Nie      | —         | `id`, `order`, `name`         |
| `order`    | `string`  | Nie      | —         | `asc`, `desc`                 |

**Odpowiedź:**

```json
{
  "tax_rates": [ { "id": 1, "country": "PL", "rate": "23.0000", ... } ],
  "total": 3,
  "totalPages": 1
}
```

---

#### `taxes_rates_get`

Pojedyncza stawka podatkowa.

**Endpoint WooCommerce:** `GET /wc/v3/taxes/rates/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane |
| -------- | --------- | -------- |
| `id`     | `integer` | **Tak**  |

---

#### `taxes_rates_create`

Utwórz stawkę podatkową.

**Endpoint WooCommerce:** `POST /wc/v3/taxes/rates`

**Parametry:**

| Parametr    | Typ       | Wymagane | Opis                                |
| ----------- | --------- | -------- | ----------------------------------- |
| `country`   | `string`  | **Tak**  | Kod kraju (ISO 3166-1 alpha-2)      |
| `rate`      | `string`  | **Tak**  | Procent stawki                      |
| `name`      | `string`  | **Tak**  | Nazwa stawki                        |
| `state`     | `string`  | Nie      | Kod stanu                           |
| `postcode`  | `string`  | Nie      | Kod pocztowy                        |
| `city`      | `string`  | Nie      | Miasto                              |
| `priority`  | `integer` | Nie      | Priorytet (1-based)                 |
| `compound`  | `boolean` | Nie      | Podatek złożony                     |
| `shipping`  | `boolean` | Nie      | Dotyczy wysyłki                     |
| `class`     | `string`  | Nie      | Slug klasy podatkowej               |
| `postcodes` | `array`   | Nie      | `[string]` — lista kodów pocztowych |
| `cities`    | `array`   | Nie      | `[string]` — lista miast            |

---

#### `taxes_rates_update`

Aktualizuj stawkę podatkową.

**Endpoint WooCommerce:** `PUT /wc/v3/taxes/rates/{id}`

**Parametry:** Jak w `taxes_rates_create`, plus wymagane `id` (wszystkie pola opcjonalne poza `id`).

---

#### `taxes_rates_delete`

Usuń stawkę podatkową.

**Endpoint WooCommerce:** `DELETE /wc/v3/taxes/rates/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane |
| -------- | --------- | -------- |
| `id`     | `integer` | **Tak**  |

---

### 4.7 Reports

Grupa `reports` — 8 narzędzi raportujących.

---

#### `reports_sales`

Raport podsumowania sprzedaży.

**Endpoint WooCommerce:** `GET /wc/v3/reports/sales`

**Parametry:**

| Parametr       | Typ      | Wymagane | Opis                                                                          |
| -------------- | -------- | -------- | ----------------------------------------------------------------------------- |
| `date_min`     | `string` | Nie      | Data początkowa (YYYY-MM-DD)                                                  |
| `date_max`     | `string` | Nie      | Data końcowa (YYYY-MM-DD)                                                     |
| `period`       | `string` | Nie      | `year`, `last_month`, `this_month`, `last_week`, `this_week`, `7day`, `30day` |
| `date_context` | `string` | Nie      | Kontekst daty do porównania                                                   |

---

#### `reports_top_sellers`

Najlepiej sprzedające się produkty.

**Endpoint WooCommerce:** `GET /wc/v3/reports/top_sellers`

**Parametry:**

| Parametr   | Typ       | Wymagane | Domyślnie | Opis                                                                          |
| ---------- | --------- | -------- | --------- | ----------------------------------------------------------------------------- |
| `period`   | `string`  | Nie      | —         | `year`, `last_month`, `this_month`, `last_week`, `this_week`, `7day`, `30day` |
| `date_min` | `string`  | Nie      | —         | Data początkowa                                                               |
| `date_max` | `string`  | Nie      | —         | Data końcowa                                                                  |
| `limit`    | `integer` | Nie      | `10`      | Maksymalna liczba wyników                                                     |

---

#### `reports_products`

Raport produktów.

**Endpoint WooCommerce:** `GET /wc/v3/reports/products`

**Parametry:**

| Parametr   | Typ      | Wymagane |
| ---------- | -------- | -------- |
| `period`   | `string` | Nie      |
| `date_min` | `string` | Nie      |
| `date_max` | `string` | Nie      |

---

#### `reports_orders`

Raport zamówień.

**Endpoint WooCommerce:** `GET /wc/v3/reports/orders`

**Parametry:** Jak w `reports_products`.

---

#### `reports_customers`

Raport klientów.

**Endpoint WooCommerce:** `GET /wc/v3/reports/customers`

**Parametry:** Jak w `reports_products`.

---

#### `reports_coupons`

Raport kuponów.

**Endpoint WooCommerce:** `GET /wc/v3/reports/coupons`

**Parametry:**

| Parametr   | Typ      | Wymagane | Opis                                     |
| ---------- | -------- | -------- | ---------------------------------------- |
| `period`   | `string` | Nie      | —                                        |
| `date_min` | `string` | Nie      | —                                        |
| `date_max` | `string` | Nie      | —                                        |
| `coupon`   | `array`  | Nie      | `[string]` — kody kuponów do filtrowania |

---

#### `reports_stock`

Raport stanów magazynowych.

**Endpoint WooCommerce:** `GET /wc/v3/reports/stock`

**Parametry:**

| Parametr | Typ      | Wymagane | Domyślnie | Opis                                  |
| -------- | -------- | -------- | --------- | ------------------------------------- |
| `type`   | `string` | Nie      | `all`     | `all`, `low`, `outofstock`, `instock` |

---

#### `reports_revenue`

Statystyki przychodów (total_sales, net_revenue itd.).

**Endpoint WooCommerce:** `GET /wc/v3/reports/revenue/stats`

**Parametry:** Jak w `reports_products`.

---

### 4.8 System

Grupa `system` — 9 narzędzi do odczytu informacji systemowych i konfiguracyjnych sklepu.

---

#### `system_status`

Status systemu WooCommerce (informacje o sklepie, środowisku, bazie danych itd.).

**Endpoint WooCommerce:** `GET /wc/v3/system_status`

**Brak parametrów.**

---

#### `system_status_tools`

Narzędzia statusu systemu.

**Endpoint WooCommerce:** `GET /wc/v3/system_status/tools`

**Brak parametrów.**

---

#### `system_data`

Przegląd danych WooCommerce (liczba produktów, zamówień, klientów itd.).

**Endpoint WooCommerce:** `GET /wc/v3/data`

**Brak parametrów.**

---

#### `system_continents`

Lista kontynentów z krajami.

**Endpoint WooCommerce:** `GET /wc/v3/data/continents`

**Brak parametrów.**

---

#### `system_countries`

Lista krajów i stanów.

**Endpoint WooCommerce:** `GET /wc/v3/data/countries`

**Brak parametrów.**

---

#### `system_currencies`

Lista dostępnych walut.

**Endpoint WooCommerce:** `GET /wc/v3/data/currencies`

**Brak parametrów.**

---

#### `system_current_currency`

Szczegóły bieżącej waluty sklepu.

**Endpoint WooCommerce:** `GET /wc/v3/data/currencies/current`

**Brak parametrów.**

---

#### `system_settings`

Ustawienia ogólne sklepu.

**Endpoint WooCommerce:** `GET /wc/v3/settings/general`

**Parametry:**

| Parametr   | Typ       | Wymagane | Domyślnie | Opis                          |
| ---------- | --------- | -------- | --------- | ----------------------------- |
| `page`     | `integer` | Nie      | —         | Numer strony                  |
| `per_page` | `integer` | Nie      | `10`      | Elementów na stronę (max 100) |

**Odpowiedź:**

```json
{
  "settings": [ { "id": "woocommerce_currency", "value": "USD", ... } ],
  "total": 50,
  "totalPages": 5
}
```

---

#### `system_payment_gateways`

Lista bramek płatności.

**Endpoint WooCommerce:** `GET /wc/v3/payment_gateways`

**Brak parametrów.**

---

### 4.9 Email

Grupa `email` — 1 narzędzie do wysyłki emaili przez SMTP.

---

#### `email_send`

Wyślij niestandardowy email przez SMTP.

**Parametry:**

| Parametr   | Typ      | Wymagane | Opis                                      |
| ---------- | -------- | -------- | ----------------------------------------- |
| `to`       | `string` | **Tak**  | Adres(y) odbiorcy, oddzielone przecinkami |
| `subject`  | `string` | **Tak**  | Temat wiadomości                          |
| `body`     | `string` | **Tak**  | Treść (obsługuje HTML)                    |
| `cc`       | `string` | Nie      | DW, oddzielone przecinkami                |
| `bcc`      | `string` | Nie      | UDW, oddzielone przecinkami               |
| `reply_to` | `string` | Nie      | Adres Reply-To                            |

**Odpowiedź (sukces):**

```json
{
  "success": true,
  "messageId": "<abc123@example.com>"
}
```

**Błędy:**

- `READ_ONLY` — serwer w trybie read-only
- `SMTP_NOT_CONFIGURED` — brak konfiguracji SMTP
- Błąd SMTP — jeśli połączenie nie jest możliwe

---

### 4.10 Media

Grupa `media` — 3 narzędzia do zarządzania biblioteką mediów WordPress.

---

#### `media_list`

Lista plików multimedialnych.

**Endpoint WordPress REST API:** `GET /wp/v2/media`

**Parametry:**

| Parametr     | Typ       | Wymagane | Opis                                     |
| ------------ | --------- | -------- | ---------------------------------------- |
| `page`       | `integer` | Nie      | Numer strony                             |
| `per_page`   | `integer` | Nie      | Elementów na stronę (max 100)            |
| `search`     | `string`  | Nie      | Fraza wyszukiwania                       |
| `media_type` | `string`  | Nie      | `image`, `video`, `audio`, `application` |

**Odpowiedź:**

```json
{
  "media": [ { "id": 1, "source_url": "...", ... } ],
  "total": 50,
  "totalPages": 5
}
```

---

#### `media_upload`

Upload obrazka z URL do biblioteki mediów.

**Endpoint WordPress REST API:** `POST /wp/v2/media`

**Parametry:**

| Parametr   | Typ      | Wymagane | Opis                    |
| ---------- | -------- | -------- | ----------------------- |
| `source`   | `string` | **Tak**  | URL obrazka do pobrania |
| `name`     | `string` | Nie      | Nazwa pliku             |
| `alt_text` | `string` | Nie      | Tekst alternatywny      |

**Odpowiedź:** Obiekt media w JSON.

**Błąd:** `READ_ONLY` w trybie read-only.

---

#### `media_delete`

Usuń plik z biblioteki mediów.

**Endpoint WordPress REST API:** `DELETE /wp/v2/media/{id}`

**Parametry:**

| Parametr | Typ       | Wymagane | Domyślnie | Opis                      |
| -------- | --------- | -------- | --------- | ------------------------- |
| `id`     | `integer` | **Tak**  | —         | ID pliku                  |
| `force`  | `boolean` | Nie      | `true`    | Force delete (pomiń kosz) |

**Odpowiedź:** Obiekt media w JSON.

**Błąd:** `READ_ONLY` w trybie read-only.

---

## 5. Error Reference

Wszystkie błędy są zwracane jako obiekty JSON z polami `code`, `message` i `actionable`.

### Struktura błędu

```json
{
  "code": "HTTP_404",
  "message": "Resource not found. The requested item does not exist.",
  "actionable": true
}
```

| Pole         | Typ       | Opis                                      |
| ------------ | --------- | ----------------------------------------- |
| `code`       | `string`  | Kod błędu                                 |
| `message`    | `string`  | Opis błędu                                |
| `actionable` | `boolean` | Czy błąd można naprawić zmianą parametrów |

### Kody błędów

| Kod                   | Przyczyna                               | Actionable      | Opis                                                               |
| --------------------- | --------------------------------------- | --------------- | ------------------------------------------------------------------ |
| `VALIDATION_ERROR`    | Nieprawidłowe parametry wejściowe (Zod) | Tak             | Błąd walidacji — lista błędnych pól                                |
| `HTTP_400`            | Nieprawidłowe żądanie                   | Tak             | Sprawdź parametry                                                  |
| `HTTP_401`            | Autoryzacja nieudana                    | Tak             | Sprawdź `WOOCOMMERCE_CONSUMER_KEY` i `WOOCOMMERCE_CONSUMER_SECRET` |
| `HTTP_403`            | Brak uprawnień                          | Tak             | Klucz API nie ma uprawnień do tej akcji                            |
| `HTTP_404`            | Zasób nie znaleziony                    | Tak             | Podany element nie istnieje                                        |
| `HTTP_429`            | Zbyt wiele żądań                        | Tak             | Odczekaj i spróbuj ponownie                                        |
| `HTTP_500`            | Błąd serwera WooCommerce                | Nie             | Sklep może mieć problemy                                           |
| `HTTP_503`            | Serwer niedostępny                      | Nie             | Sklep może być w trybie konserwacji                                |
| `HTTP_*`              | Inny kod HTTP                           | Zależny od kodu | Nieznany błąd HTTP                                                 |
| `NETWORK_ERROR`       | Brak połączenia z WooCommerce           | Tak             | Sprawdź URL i łączność sieciową                                    |
| `TIMEOUT`             | Przekroczony czas oczekiwania           | Tak             | Sklep może być wolny lub nieosiągalny                              |
| `UNKNOWN_ERROR`       | Nieoczekiwany błąd                      | Nie             | Spróbuj ponownie                                                   |
| `READ_ONLY`           | Próba modyfikacji w trybie read-only    | Nie             | Włącz `WC_READ_ONLY=false`                                         |
| `SMTP_NOT_CONFIGURED` | SMTP nie skonfigurowane                 | Tak             | Ustaw `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`                        |

### Mapowanie statusów HTTP WooCommerce

Serwer mapuje błędy HTTP z WooCommerce API na czytelne komunikaty. Błędy 4xx są oznaczone jako `actionable: true` (można naprawić), błędy 5xx jako `actionable: false`.

---

## 6. Type Reference

### WooProduct

```typescript
interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: 'simple' | 'grouped' | 'external' | 'variable';
  status: 'draft' | 'pending' | 'private' | 'publish';
  featured: boolean;
  catalog_visibility: 'visible' | 'catalog' | 'search' | 'hidden';
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  price_html: string;
  on_sale: boolean;
  date_on_sale_from: string | null;
  date_on_sale_to: string | null;
  purchasable: boolean;
  tax_status: 'taxable' | 'shipping' | 'none';
  tax_class: string;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: { id: string; name: string; file: string }[];
  purchase_note: string;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
    unit: string;
  };
  shipping_class: string;
  shipping_class_id: number;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  backorders: 'no' | 'notify' | 'yes';
  backorders_allowed: boolean;
  backordered: boolean;
  sold_individually: boolean;
  in_stock: boolean;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  parent_id: number;
  menu_order: number;
  categories: { id: number; name: string; slug: string }[];
  tags: { id: number; name: string; slug: string }[];
  images: { id: number; src: string; name: string; alt: string }[];
  attributes: {
    id: number;
    name: string;
    position: number;
    visible: boolean;
    variation: boolean;
    options: string[];
  }[];
  default_attributes: { id: number; name: string; option: string }[];
  variations: number[];
  grouped_products: number[];
  meta_data: { id: number; key: string; value: unknown }[];
  date_created: string;
  date_modified: string;
  _links: Record<string, { href: string }[]>;
}
```

### WooOrder

```typescript
interface WooOrder {
  id: number;
  number: string;
  order_key: string;
  status: string;
  currency: string;
  total: string;
  subtotal: string;
  total_tax: string;
  prices_include_tax: boolean;
  customer_id: number;
  customer_note: string;
  billing: WooAddress;
  shipping: WooAddress;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  date_created: string;
  date_modified: string;
  line_items: WooLineItem[];
  shipping_lines: WooShippingLine[];
  tax_lines: WooTaxLine[];
  fee_lines: WooFeeLine[];
  coupon_lines: WooCouponLine[];
  refunds: { id: number; total: string }[];
  meta_data: { id: number; key: string; value: unknown }[];
}
```

### WooCustomer

```typescript
interface WooCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  username: string;
  billing: Partial<WooAddress>;
  shipping: Partial<WooAddress>;
  is_paying_customer: boolean;
  avatar_url: string;
  meta_data: { id: number; key: string; value: unknown }[];
  date_created: string;
  date_modified: string;
}
```

### WooCoupon

```typescript
interface WooCoupon {
  id: number;
  code: string;
  amount: string;
  date_created: string;
  date_modified: string;
  discount_type: 'percent' | 'fixed_cart' | 'fixed_product';
  description: string;
  date_expires: string | null;
  usage_count: number;
  individual_use: boolean;
  product_ids: number[];
  excluded_product_ids: number[];
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  limit_usage_to_x_items: number | null;
  free_shipping: boolean;
  product_categories: number[];
  excluded_product_categories: number[];
  exclude_sale_items: boolean;
  minimum_amount: string;
  maximum_amount: string;
  email_restrictions: string[];
  used_by: string[];
  meta_data: { id: number; key: string; value: unknown }[];
}
```

### WooShippingZone

```typescript
interface WooShippingZone {
  id: number;
  name: string;
  order: number;
  slug: string;
}
```

### WooShippingMethod

```typescript
interface WooShippingMethod {
  id: number;
  method_id: string;
  title: string;
  order: number;
  enabled: boolean;
  settings: Record<string, unknown>;
}
```

### WooTaxRate

```typescript
interface WooTaxRate {
  id: number;
  country: string;
  state: string;
  postcode: string;
  city: string;
  postcodes: string[];
  cities: string[];
  rate: string;
  name: string;
  priority: number;
  compound: boolean;
  shipping: boolean;
  order: number;
  class: string;
}
```

### WooAddress

```typescript
interface WooAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}
```

### WooLineItem

```typescript
interface WooLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  price: string;
  subtotal: string;
  total: string;
  meta_data: { id: number; key: string; value: unknown }[];
}
```

### WooShippingLine

```typescript
interface WooShippingLine {
  id: number;
  method_title: string;
  method_id: string;
  total: string;
  meta_data: { id: number; key: string; value: unknown }[];
}
```

### WooTaxLine

```typescript
interface WooTaxLine {
  id: number;
  rate_code: string;
  rate_id: number;
  label: string;
  compound: boolean;
  tax_total: string;
  shipping_tax_total: string;
  meta_data: { id: number; key: string; value: unknown }[];
}
```

### WooFeeLine

```typescript
interface WooFeeLine {
  id: number;
  name: string;
  total: string;
  meta_data: { id: number; key: string; value: unknown }[];
}
```

### WooCouponLine

```typescript
interface WooCouponLine {
  id: number;
  code: string;
  discount: string;
  discount_tax: string;
  meta_data: { id: number; key: string; value: unknown }[];
}
```

### PaginationInfo

```typescript
interface PaginationInfo {
  total: number; // Całkowita liczba elementów (z nagłówka x-wp-total)
  totalPages: number; // Całkowita liczba stron (z nagłówka x-wp-totalpages)
}
```

### SafeError

```typescript
interface SafeError {
  code: string; // Kod błędu (np. "VALIDATION_ERROR", "HTTP_404")
  message: string; // Opis błędu
  actionable: boolean; // Czy błąd można naprawić
}
```
