# Rozszerzenia WooCommerce MCP Server

Lista narzędzi rozszerzających serwer MCP o brakującą integrację z custom pluginem `panel-configurator-bridge` i zarządzanie mediami. Nie duplikuje istniejących funkcji (produkty, zamówienia, klienci, kupony, wysyłka, podatki, raporty, email).

## 1. Plugin API — Konfigurator

Endpoints pod `panel/v1` dla zarządzania danymi konfiguratora.

| Narzędzie                  | Opis                                                                      |
| -------------------------- | ------------------------------------------------------------------------- |
| `product_schema_get`       | Schemat konfiguratora dla produktu (parametry, dostępne narzędzia) po SKU |
| `configurator_data_get`    | Parametry konfiguratora (formatowanie, wymiary, narzędzia) dla produktu   |
| `tools_list`               | Lista aktywnych narzędzi CNC AlphaCAM (z cache)                           |
| `edge_type_tools_list`     | Mapowanie narzędzi do profili krawędzi                                    |
| `tool_lists_list`          | Nazwane listy narzędzi                                                    |
| `additional_services_list` | Lista usług dodatkowych (wykończenia)                                     |

## 2. Plugin API — Produkty sklepu

| Narzędzie              | Opis                                                                   |
| ---------------------- | ---------------------------------------------------------------------- |
| `products_lite_list`   | Lekka lista produktów (id, sku, slug, name, price_per_m2, image)       |
| `products_popular_get` | Popularne produkty z wagami (sprzedaż, oceny, recenzje, boost, pinned) |

## 3. Plugin API — Opinie i Pytania (admin)

| Narzędzie                       | Opis                                                 |
| ------------------------------- | ---------------------------------------------------- |
| `products_reviews_admin_list`   | Lista opinii z panelu admina (wszystkie, z filtrami) |
| `products_reviews_moderate`     | Moderacja opinii (approve/hold/spam/trash)           |
| `products_questions_admin_list` | Lista pytań (admin — wszystkie, pending)             |
| `products_questions_answer`     | Odpowiadanie jako oficjalny (admin) na pytanie       |
| `products_answers_mark_best`    | Oznaczanie odpowiedzi jako najlepsza                 |
| `faq_list`                      | Lista FAQ dla produktu + globalne                    |
| `faq_categories_list`           | Kategorie FAQ                                        |
| `faq_create`                    | Utwórz FAQ                                           |
| `faq_update`                    | Aktualizuj FAQ                                       |
| `faq_delete`                    | Usuń FAQ                                             |

## 4. Plugin API — Produkcja

| Narzędzie                   | Opis                                          |
| --------------------------- | --------------------------------------------- |
| `production_csv_generate`   | Generowanie pliku CSV z wymiarów do produkcji |
| `production_csv_status_get` | Status wygenerowanego CSV dla zamówienia      |

## 5. Plugin API — Ustawienia sklepu

| Narzędzie                    | Opis                                                |
| ---------------------------- | --------------------------------------------------- |
| `company_info_get`           | Dane firmy (nazwa, adres, NIP, email, telefon)      |
| `features_get`               | Feature flagi (FAQ, QA, reviews włączone/wyłączone) |
| `popularity_settings_get`    | Ustawienia algorytmu popularności (wagi, cache)     |
| `popularity_settings_update` | Modyfikacja wag popularności + boost/pin produktów  |

## 6. Media / Obrazy

| Narzędzie             | Opis                                                 |
| --------------------- | ---------------------------------------------------- |
| `media_list`          | Lista plików w bibliotece mediów (z filtrami)        |
| `media_upload`        | Upload obrazka do biblioteki mediów (URL lub base64) |
| `media_delete`        | Usuń plik z biblioteki                               |
| `product_images_set`  | Ustaw główne zdjęcie produktu                        |
| `product_gallery_set` | Ustaw galerię zdjęć produktu                         |

## 7. Produkty — rozszerzenia

| Narzędzie                  | Opis                                            |
| -------------------------- | ----------------------------------------------- |
| `products_cross_sells_set` | Ustaw produkty powiązane (cross-sell / up-sell) |

> **Uwaga:** `products_shipping_classes_list`, `create`, `update`, `delete` zostały zaimplementowane w core (grupa `products`, 37 narzędzi). Nie wymagają custom pluginu WordPress.

---

**Razem: ~31 narzędzi** w 7 grupach.
