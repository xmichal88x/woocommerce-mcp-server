# Raporty i Narzędzia Systemowe

**Cel:** Nauczyć się analizować sklep WooCommerce przez raporty oraz korzystać z narzędzi systemowych do diagnozy stanu sklepu i danych geo.

**Czego się nauczysz:**

- Generowania raportów sprzedażowych
- Analizy top sellerów i przychodów
- Raportów stanów magazynowych
- Sprawdzania statusu systemu i ustawień sklepu
- Pobierania danych geo (kraje, waluty, kontynenty)
- Łączenia raportów z innymi narzędziami

**Wymagania wstępne:**

- Serwer uruchomiony (`npm run dev`)
- Sklep z danymi (zamówienia, produkty)

---

## 1. Raporty sprzedażowe

### Raport sprzedaży (podstawowy)

```json
{
  "name": "reports_sales",
  "arguments": {}
}
```

**Oczekiwany rezultat:**

```json
{
  "total_sales": "45200.00",
  "net_sales": "38900.00",
  "average_sales": "1230.00",
  "total_orders": 45,
  "total_items": 120,
  "total_tax": "3200.00",
  "total_shipping": "1800.00",
  "total_refunds": 0,
  "total_discount": "1300.00",
  "totals_gross": "45200.00",
  "totals_net": "38900.00"
}
```

### Raport za konkretny okres

```json
{
  "name": "reports_sales",
  "arguments": {
    "date_min": "2025-06-01",
    "date_max": "2025-06-30"
  }
}
```

### Raport z predefiniowanym okresem

```json
{
  "name": "reports_sales",
  "arguments": {
    "period": "last_month"
  }
}
```

Dostępne okresy: `year`, `last_month`, `this_month`, `last_week`, `this_week`, `7day`, `30day`.

### Raport z porównaniem

```json
{
  "name": "reports_sales",
  "arguments": {
    "period": "this_month",
    "date_context": "before"
  }
}
```

---

## 2. Top sellerzy

### Najlepiej sprzedające się produkty

```json
{
  "name": "reports_top_sellers",
  "arguments": {
    "period": "this_month",
    "limit": 10
  }
}
```

**Oczekiwany rezultat:**

```json
{
  "data": [
    {
      "product_id": 123,
      "name": "Buty sportowe XYZ",
      "quantity": 25,
      "total_sales": "7475.00"
    },
    {
      "product_id": 456,
      "name": "Kurtka Zimowa",
      "quantity": 18,
      "total_sales": "7182.00"
    }
  ]
}
```

### Top sellerzy z własnym zakresem dat

```json
{
  "name": "reports_top_sellers",
  "arguments": {
    "date_min": "2025-01-01",
    "date_max": "2025-06-30",
    "limit": 5
  }
}
```

---

## 3. Raporty przychodów (revenue stats)

```json
{
  "name": "reports_revenue",
  "arguments": {
    "period": "last_month"
  }
}
```

```json
{
  "name": "reports_revenue",
  "arguments": {
    "date_min": "2025-01-01",
    "date_max": "2025-12-31"
  }
}
```

Zwraca szczegółowe statystyki przychodów: `total_sales`, `net_revenue`, `coupons`, `taxes`, `shipping`, `refunds`.

---

## 4. Raporty produktowe

```json
{
  "name": "reports_products",
  "arguments": {
    "period": "this_month"
  }
}
```

```json
{
  "name": "reports_products",
  "arguments": {
    "date_min": "2025-01-01",
    "date_max": "2025-03-31"
  }
}
```

Pokazuje statystyki dotyczące produktów: liczba sprzedanych sztuk, przychód na produkt, średnia cena.

---

## 5. Raporty zamówień

```json
{
  "name": "reports_orders",
  "arguments": {
    "period": "this_month"
  }
}
```

Zwraca zagregowane dane o zamówieniach: liczba zamówień, średnia wartość, liczba pozycji.

---

## 6. Raporty klientów

```json
{
  "name": "reports_customers",
  "arguments": {
    "period": "last_month"
  }
}
```

Pokazuje liczbę nowych klientów, łączną liczbę klientów, średnią wartość zamówienia na klienta.

---

## 7. Raporty kuponów

```json
{
  "name": "reports_coupons",
  "arguments": {
    "period": "this_month"
  }
}
```

Z filtrowaniem po konkretnych kuponach:

```json
{
  "name": "reports_coupons",
  "arguments": {
    "period": "year",
    "coupon": ["WELCOME10", "SUMMER2025"]
  }
}
```

---

## 8. Raporty stanów magazynowych

### Wszystkie produkty z informacją o stanie

```json
{
  "name": "reports_stock",
  "arguments": {
    "type": "all"
  }
}
```

### Produkty z niskim stanem magazynowym

```json
{
  "name": "reports_stock",
  "arguments": {
    "type": "low"
  }
}
```

### Produkty których brakuje na stanie

```json
{
  "name": "reports_stock",
  "arguments": {
    "type": "outofstock"
  }
}
```

### Produkty dostępne

```json
{
  "name": "reports_stock",
  "arguments": {
    "type": "instock"
  }
}
```

**Oczekiwany rezultat (dla `type: "low"`):**

```json
{
  "products": [
    {
      "id": 123,
      "name": "Buty sportowe XYZ",
      "stock_quantity": 3,
      "stock_status": "instock",
      "type": "simple"
    }
  ]
}
```

---

## 9. Status systemu

### Pełny status systemu WooCommerce

```json
{
  "name": "system_status",
  "arguments": {}
}
```

Zwraca kompleksowe informacje o:

- Środowisku (PHP, MySQL, WordPress)
- Aktywnych wtyczkach
- Theme
- Konfiguracji bazy danych
- Beaconach (Webhooki, Cron)

### Narzędzia systemowe (diagnostyczne)

```json
{
  "name": "system_status_tools",
  "arguments": {}
}
```

---

## 10. Ustawienia sklepu

### Ogólne ustawienia

```json
{
  "name": "system_settings",
  "arguments": {
    "per_page": 50
  }
}
```

**Oczekiwany rezultat:**

```json
{
  "settings": [
    {
      "id": "woocommerce_store_address",
      "label": "Adres sklepu",
      "value": "ul. Główna 1"
    },
    {
      "id": "woocommerce_default_country",
      "label": "Domyślny kraj",
      "value": "PL"
    },
    {
      "id": "woocommerce_currency",
      "label": "Waluta",
      "value": "PLN"
    }
  ],
  "total": 25,
  "totalPages": 1
}
```

### Bramki płatności

```json
{
  "name": "system_payment_gateways",
  "arguments": {}
}
```

---

## 11. Dane geo (kraje, waluty, kontynenty)

### Lista kontynentów z krajami

```json
{
  "name": "system_continents",
  "arguments": {}
}
```

### Lista krajów i stanów

```json
{
  "name": "system_countries",
  "arguments": {}
}
```

### Lista dostępnych walut

```json
{
  "name": "system_currencies",
  "arguments": {}
}
```

### Aktualna waluta sklepu

```json
{
  "name": "system_current_currency",
  "arguments": {}
}
```

### Przegląd danych WooCommerce

```json
{
  "name": "system_data",
  "arguments": {}
}
```

Zwraca zwięzłe podsumowanie: liczby produktów, zamówień, klientów, kuponów.

---

## 12. Łączenie raportów — analiza wielowymiarowa

Możesz łączyć wyniki wielu zapytań, aby uzyskać pełny obraz sklepu:

**Przykład: Analiza miesięczna**

1. `reports_sales` z `period: "last_month"` → całkowita sprzedaż
2. `reports_top_sellers` z `period: "last_month"` → które produkty
3. `reports_orders` z `period: "last_month"` → liczba zamówień
4. `reports_coupons` z `period: "last_month"` → użycie kuponów
5. `reports_customers` z `period: "last_month"` → nowi klienci

**Przykład: Analiza stanów magazynowych**

1. `reports_stock` z `type: "low"` → co trzeba uzupełnić
2. `reports_stock` z `type: "outofstock"` → czego brakuje
3. Dla każdego produktu: `products_list` z `include: [id]` → szczegóły
4. `products_update` → uzupełnij stany

---

## Ćwiczenie: wygeneruj raport miesięcznej sprzedaży

Wykonaj sekwencyjnie, aby uzyskać pełny obraz ostatniego miesiąca:

1. **Raport sprzedaży** — `reports_sales` z `period: "last_month"` — zanotuj `total_sales`, `total_orders`, `average_sales`
2. **Top sellerzy** — `reports_top_sellers` z `period: "last_month"`, `limit: 5` — znajdź 5 najlepszych produktów
3. **Raport zamówień** — `reports_orders` z `period: "last_month"`
4. **Raport kuponów** — `reports_coupons` z `period: "last_month"` — sprawdź które kupony były używane
5. **Raport klientów** — `reports_customers` z `period: "last_month"` — ilu nowych klientów?
6. **Stan magazynowy** — `reports_stock` z `type: "low"` — czy top sellerzy mają wystarczające stany?

**Dodatkowo (dla chętnych):**

7. Dla każdego top sellera sprawdź `products_get` i zanotuj jego stan magazynowy
8. Sprawdź `system_data` aby zobaczyć ogólne statystyki sklepu
9. Sprawdź aktualną walutę sklepu przez `system_current_currency`

---

## Podsumowanie

Raporty i narzędzia systemowe dają pełny wgląd w stan sklepu:

| Narzędzie                                    | Zastosowanie                                   |
| -------------------------------------------- | ---------------------------------------------- |
| `reports_sales`                              | Przychody, zamówienia, podatki, wysyłka        |
| `reports_top_sellers`                        | Najlepiej sprzedające się produkty             |
| `reports_revenue`                            | Szczegółowe statystyki przychodów              |
| `reports_products`                           | Statystyki produktów                           |
| `reports_orders`                             | Statystyki zamówień                            |
| `reports_customers`                          | Statystyki klientów                            |
| `reports_coupons`                            | Użycie kuponów                                 |
| `reports_stock`                              | Stany magazynowe (niskie, brakujące, dostępne) |
| `system_status`                              | Diagnoza systemu WooCommerce                   |
| `system_settings`                            | Ustawienia sklepu                              |
| `system_*` (continents/countries/currencies) | Dane geo                                       |

## Następne kroki

- Wróć do [Tutorial 1: Szybki Start](01-quick-start.md) aby odświeżyć konfigurację
- Wróć do [Tutorial 2: Zarządzanie Produktami](02-manage-products.md)
- Wróć do [Tutorial 3: Zamówienia i Klienci](03-orders-and-customers.md)
