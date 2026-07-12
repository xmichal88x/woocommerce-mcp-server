# Zamówienia i Klienci

**Cel:** Nauczyć się zarządzać zamówieniami i klientami WooCommerce przez MCP — od tworzenia zamówień po zwroty i notatki.

**Czego się nauczysz:**

- Listowania zamówień z zaawansowanymi filtrami
- Tworzenia zamówień z liniami, wysyłką i kuponami
- Zarządzania statusami i notatkami
- Tworzenia zwrotów (refundów)
- Zarządzania klientami (CRUD)
- Łączenia zamówień z klientami

**Wymagania wstępne:**

- Serwer uruchomiony (`npm run dev`)
- `WC_READ_ONLY=false`
- Kilka produktów w sklepie (dla tworzenia zamówień)

---

## 1. Listowanie zamówień

### Podstawowe listowanie

```json
{
  "name": "orders_list",
  "arguments": {}
}
```

### Filtrowanie po statusie

```json
{
  "name": "orders_list",
  "arguments": {
    "status": "processing",
    "per_page": 20
  }
}
```

### Filtrowanie po dacie

```json
{
  "name": "orders_list",
  "arguments": {
    "after": "2025-01-01T00:00:00",
    "before": "2025-12-31T23:59:59",
    "orderby": "date",
    "order": "desc"
  }
}
```

### Filtrowanie po kliencie i produkcie

```json
{
  "name": "orders_list",
  "arguments": {
    "customer": 42,
    "per_page": 50
  }
}
```

```json
{
  "name": "orders_list",
  "arguments": {
    "product": 123
  }
}
```

**Oczekiwany rezultat:**

```json
{
  "orders": [
    {
      "id": 1001,
      "status": "processing",
      "currency": "PLN",
      "total": "299.00",
      "customer_id": 42,
      "billing": {
        "first_name": "Jan",
        "last_name": "Kowalski",
        "email": "jan@example.com"
      },
      "line_items": [
        {
          "product_id": 123,
          "name": "Buty sportowe",
          "quantity": 1,
          "total": "299.00"
        }
      ],
      "date_created": "2025-06-15T10:30:00"
    }
  ],
  "total": 1,
  "totalPages": 1
}
```

---

## 2. Pobieranie zamówienia

```json
{
  "name": "orders_get",
  "arguments": {
    "id": 1001
  }
}
```

Zwraca pełne zamówienie — wszystkie linie, płatności, wysyłkę, metadane, notatki.

---

## 3. Tworzenie zamówienia

### Zamówienie z liniami produktów

```json
{
  "name": "orders_create",
  "arguments": {
    "payment_method": "transfer",
    "payment_method_title": "Przelew bankowy",
    "set_paid": false,
    "status": "pending",
    "currency": "PLN",
    "customer_note": "Proszę o dostawę w godzinach popołudniowych",
    "billing": {
      "first_name": "Anna",
      "last_name": "Nowak",
      "address_1": "ul. Główna 15",
      "city": "Warszawa",
      "state": "mazowieckie",
      "postcode": "00-001",
      "country": "PL",
      "email": "anna@example.com",
      "phone": "+48123456789"
    },
    "shipping": {
      "first_name": "Anna",
      "last_name": "Nowak",
      "address_1": "ul. Główna 15",
      "city": "Warszawa",
      "state": "mazowieckie",
      "postcode": "00-001",
      "country": "PL"
    },
    "line_items": [
      {
        "product_id": 123,
        "quantity": 2,
        "price": "89.00"
      },
      {
        "product_id": 456,
        "quantity": 1,
        "price": "399.00"
      }
    ],
    "shipping_lines": [
      {
        "method_id": "flat_rate",
        "method_title": "Kurier",
        "total": "15.00"
      }
    ]
  }
}
```

### Zamówienie z kuponem rabatowym

Upewnij się, że kupon istnieje w sklepie:

```json
{
  "name": "coupons_create",
  "arguments": {
    "code": "WELCOME10",
    "discount_type": "percent",
    "amount": "10",
    "individual_use": true,
    "free_shipping": false
  }
}
```

Następnie utwórz zamówienie z kuponem:

```json
{
  "name": "orders_create",
  "arguments": {
    "payment_method": "cod",
    "payment_method_title": "Za pobraniem",
    "status": "pending",
    "billing": {
      "first_name": "Piotr",
      "last_name": "Wiśniewski",
      "email": "piotr@example.com",
      "country": "PL"
    },
    "line_items": [
      {
        "product_id": 789,
        "quantity": 3,
        "price": "49.00"
      }
    ],
    "coupon_lines": [
      {
        "code": "WELCOME10"
      }
    ],
    "shipping_lines": [
      {
        "method_id": "free_shipping",
        "method_title": "Darmowa dostawa",
        "total": "0.00"
      }
    ]
  }
}
```

### Zamówienie od istniejącego klienta

```json
{
  "name": "orders_create",
  "arguments": {
    "customer_id": 42,
    "status": "pending",
    "line_items": [
      {
        "product_id": 123,
        "quantity": 1
      }
    ]
  }
}
```

> **Uwaga:** Gdy podajesz `customer_id`, dane billingowe i shippingowe zostaną pobrane automatycznie z profilu klienta.

---

## 4. Aktualizacja zamówienia

### Zmiana statusu

```json
{
  "name": "orders_update",
  "arguments": {
    "id": 1001,
    "status": "processing",
    "customer_note": "Zamówienie w realizacji"
  }
}
```

### Aktualizacja danych wysyłki

```json
{
  "name": "orders_update",
  "arguments": {
    "id": 1001,
    "shipping": {
      "address_1": "ul. Nowa 22",
      "city": "Kraków",
      "postcode": "30-001"
    }
  }
}
```

---

## 5. Zarządzanie notatkami

### Listowanie notatek

```json
{
  "name": "orders_notes_list",
  "arguments": {
    "order_id": 1001
  }
}
```

### Dodawanie notatki (prywatnej)

```json
{
  "name": "orders_notes_create",
  "arguments": {
    "order_id": 1001,
    "note": "Zamówienie przekazane do magazynu do kompletacji"
  }
}
```

### Dodawanie notatki widocznej dla klienta

```json
{
  "name": "orders_notes_create",
  "arguments": {
    "order_id": 1001,
    "note": "Twoje zamówienie zostało wysłane. Numer przesyłki: XYZ123",
    "customer_note": true
  }
}
```

---

## 6. Zarządzanie zwrotami (refundami)

### Listowanie zwrotów

```json
{
  "name": "orders_refunds_list",
  "arguments": {
    "order_id": 1001
  }
}
```

### Tworzenie zwrotu pełnej kwoty

```json
{
  "name": "orders_refunds_create",
  "arguments": {
    "order_id": 1002,
    "amount": "299.00",
    "reason": "Klient zwrócił towar - niezgodny z zamówieniem",
    "refund_payment": true
  }
}
```

### Zwrot częściowy (wybrane linie)

```json
{
  "name": "orders_refunds_create",
  "arguments": {
    "order_id": 1002,
    "amount": "89.00",
    "reason": "Zwrot jednego produktu",
    "line_items": [
      {
        "id": 1,
        "quantity": 1,
        "refund_total": "89.00"
      }
    ]
  }
}
```

### Pobieranie pojedynczego zwrotu

```json
{
  "name": "orders_refunds_get",
  "arguments": {
    "order_id": 1002,
    "refund_id": 50
  }
}
```

---

## 7. Zarządzanie klientami

### Listowanie klientów

```json
{
  "name": "customers_list",
  "arguments": {
    "per_page": 50
  }
}
```

### Wyszukiwanie klienta

```json
{
  "name": "customers_list",
  "arguments": {
    "search": "jan@example.com",
    "role": "all"
  }
}
```

### Tworzenie klienta

```json
{
  "name": "customers_create",
  "arguments": {
    "email": "tomasz@example.com",
    "first_name": "Tomasz",
    "last_name": "Adamczyk",
    "username": "tadamczyk",
    "billing": {
      "first_name": "Tomasz",
      "last_name": "Adamczyk",
      "address_1": "ul. Polna 5",
      "city": "Poznań",
      "postcode": "60-001",
      "country": "PL",
      "email": "tomasz@example.com",
      "phone": "+48111222333"
    }
  }
}
```

### Pobieranie klienta

```json
{
  "name": "customers_get",
  "arguments": {
    "id": 42
  }
}
```

### Aktualizacja klienta

```json
{
  "name": "customers_update",
  "arguments": {
    "id": 42,
    "first_name": "Janusz",
    "billing": {
      "phone": "+48999888777"
    }
  }
}
```

### Usuwanie klienta

```json
{
  "name": "customers_delete",
  "arguments": {
    "id": 99
  }
}
```

### Batch operations na klientach

```json
{
  "name": "customers_batch",
  "arguments": {
    "create": [
      { "email": "k1@example.com", "first_name": "Klient1" },
      { "email": "k2@example.com", "first_name": "Klient2" }
    ]
  }
}
```

---

## 8. Operacje batch na zamówieniach

```json
{
  "name": "orders_batch",
  "arguments": {
    "update": [
      { "id": 1001, "status": "completed" },
      { "id": 1002, "status": "cancelled" }
    ],
    "delete": [1003]
  }
}
```

---

## 9. Łączenie zamówień z klientami — praktyczny przepływ

1. **Utwórz klienta** → zapamiętaj `id`
2. **Utwórz zamówienie** z `customer_id` ustawionym na ten `id`
3. **Dodaj notatkę** do zamówienia
4. **Zmień status** na `processing`
5. **Gdy opłacone** → zmień na `completed`
6. **W razie zwrotu** → utwórz refund

---

## Ćwiczenie: utwórz zamówienie dla istniejącego klienta

Wykonaj sekwencyjnie:

1. **Znajdź klienta** — użyj `customers_list` z `search: "jan@example.com"` (lub innego emaila)
2. **Sprawdź produkty** — użyj `products_list`, znajdź 2 produkty o różnych cenach
3. **Utwórz zamówienie** z:
   - `customer_id` istniejącego klienta
   - 2 linie produktów (różne ilości)
   - Metoda płatności: "Przelew"
   - Jeden kupon rabatowy (percent, 10%)
   - Wysyłka: "Kurier" za 15.00
4. **Dodaj notatkę** "Nowe zamówienie od stałego klienta"
5. **Zmień status** na `processing`
6. **Zweryfikuj** — pobierz zamówienie przez `orders_get`

---

## Podsumowanie

| Narzędzie          | Zastosowanie                                   |
| ------------------ | ---------------------------------------------- |
| `orders_list`      | Listowanie i filtrowanie zamówień              |
| `orders_get`       | Szczegóły zamówienia                           |
| `orders_create`    | Nowe zamówienie (z liniami, wysyłką, kuponami) |
| `orders_update`    | Zmiana statusu, danych                         |
| `orders_delete`    | Usuwanie                                       |
| `orders_notes_*`   | Notatki (prywatne / dla klienta)               |
| `orders_refunds_*` | Zwroty (pełne / częściowe)                     |
| `customers_list`   | Listowanie i wyszukiwanie klientów             |
| `customers_create` | Nowy klient                                    |
| `customers_update` | Aktualizacja danych                            |
| `customers_delete` | Usuwanie                                       |
| `coupons_create`   | Tworzenie kuponów rabatowych                   |

## Następne kroki

- [Tutorial 4: Raporty i Narzędzia Systemowe](04-reports-and-system.md) — analiza sklepu
