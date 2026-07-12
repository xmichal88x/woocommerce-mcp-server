# WooCommerce MCP Server — Dokumentacja

Serwer MCP (Model Context Protocol) do zarządzania sklepem WooCommerce przez AI agentów.

## Spis dokumentów

| Dokument                                | Opis                                                                                |
| --------------------------------------- | ----------------------------------------------------------------------------------- |
| [Architektura systemu](architecture.md) | Architektura, komponenty, przepływ danych, decyzje projektowe, model bezpieczeństwa |
| [Referencja API](plugin-api.md)         | Pełna referencja wszystkich ~154 narzędzi MCP, konfiguracja, typy, kody błędów      |
| [Tutoriale](tutorials/)                 | Przewodniki krok po kroku                                                           |

### Tutoriale

| #   | Tutorial                                                     | Opis                                                     |
| --- | ------------------------------------------------------------ | -------------------------------------------------------- |
| 1   | [Szybki Start](tutorials/01-quick-start.md)                  | Konfiguracja i pierwsze połączenie z WooCommerce (5 min) |
| 2   | [Zarządzanie Produktami](tutorials/02-manage-products.md)    | CRUD produktów, kategorii, tagów, wariacji               |
| 3   | [Zamówienia i Klienci](tutorials/03-orders-and-customers.md) | Obsługa zamówień, notatek, zwrotów i klientów            |
| 4   | [Raporty i System](tutorials/04-reports-and-system.md)       | Raporty sprzedaży, stan magazynowy, dane systemowe       |

## Szybki start

```bash
# 1. Instalacja
npm install

# 2. Konfiguracja (cp .env.example .env i uzupełnij)
WOOCOMMERCE_URL=https://twoj-sklep.pl
WOOCOMMERCE_CONSUMER_KEY=ck_xxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxx

# 3. Uruchomienie
npm run dev
```

## Grupy narzędzi

| Grupa        | Liczba narzędzi | Opis                                                    |
| ------------ | --------------- | ------------------------------------------------------- |
| Products     | 59              | Produkty, wariacje, kategorie, tagi, atrybuty, recenzje |
| Orders       | 11              | Zamówienia, notatki, zwroty                             |
| Customers    | 7               | Klienci                                                 |
| Coupons      | 7               | Kupony rabatowe                                         |
| Shipping     | 10              | Strefy wysyłki, metody, lokalizacje                     |
| Taxes        | 8               | Klasy podatkowe, stawki                                 |
| Reports      | 8               | Raporty sprzedaży, stanów, przychodów                   |
| System       | 9               | Status, ustawienia, geo, bramki płatności               |
| Email        | 1               | Wysyłka emaili przez SMTP                               |
| Configurator | 11              | Konfigurator produktu, klasy wysyłki, cross-sell        |
| Panel        | 20              | Opinie, FAQ, produkcja, ustawienia, popularność         |
| Media        | 3               | Zarządzanie biblioteką mediów WordPress                 |
| **Razem**    | **~154**        |                                                         |

## Komendy

| Komenda              | Opis                       |
| -------------------- | -------------------------- |
| `npm run dev`        | Uruchom z hot-reload       |
| `npm run build`      | Kompilacja TypeScript      |
| `npm start`          | Uruchom serwer (produkcja) |
| `npm test`           | Uruchom testy              |
| `npm run lint`       | Sprawdź kod                |
| `npm run type-check` | Sprawdź typy               |

## Zobacz też

- [Rozszerzenia](extensions.md) — narzędzia configurator, panel, media
- [Architektura](architecture.md) — szczegółowy opis architektury
- [Referencja API](plugin-api.md) — pełna lista narzędzi i parametrów
- [Tutorial: Szybki Start](tutorials/01-quick-start.md) — pierwsze kroki
- [WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/) — oficjalna dokumentacja
- [Model Context Protocol](https://modelcontextprotocol.io) — protokół MCP
