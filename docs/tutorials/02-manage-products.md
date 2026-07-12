# Zarządzanie Produktami

**Cel:** Opanować CRUD operacje na produktach WooCommerce przez MCP — od listowania po tworzenie produktów zmiennych z wariacjami.

**Czego się nauczysz:**

- Listowania, filtrowania i wyszukiwania produktów
- Tworzenia produktów prostych i zmiennych
- Aktualizacji cen, stanów magazynowych i innych pól
- Zarządzania kategoriami i tagami
- Zarządzania wariacjami produktów

**Wymagania wstępne:**

- Serwer uruchomiony (`npm run dev`)
- Skonfigurowany `.env` z `WC_READ_ONLY=false`
- Znajomość tutoriala 1 (Szybki Start)

---

## 1. Listowanie produktów

### Podstawowe listowanie

```json
{
  "name": "products_list",
  "arguments": {}
}
```

### Filtrowanie i wyszukiwanie

```json
{
  "name": "products_list",
  "arguments": {
    "per_page": 20,
    "status": "publish",
    "orderby": "date",
    "order": "desc"
  }
}
```

### Zaawansowane filtry

```json
{
  "name": "products_list",
  "arguments": {
    "search": "buty",
    "min_price": "50",
    "max_price": "500",
    "stock_status": "instock",
    "category": 15,
    "on_sale": true
  }
}
```

**Oczekiwany rezultat:**

```json
{
  "products": [
    {
      "id": 123,
      "name": "Buty sportowe XYZ",
      "type": "simple",
      "status": "publish",
      "regular_price": "299.00",
      "sale_price": "249.00",
      "stock_status": "instock",
      "stock_quantity": 50,
      "categories": [{ "id": 15, "name": "Obuwie" }]
    }
  ],
  "total": 1,
  "totalPages": 1
}
```

---

## 2. Pobieranie pojedynczego produktu

```json
{
  "name": "products_get",
  "arguments": {
    "id": 123
  }
}
```

Zwraca pełny obiekt produktu — wszystkie meta-dane, atrybuty, obrazy, powiązania.

---

## 3. Tworzenie produktu

### Produkt prosty

```json
{
  "name": "products_create",
  "arguments": {
    "name": "Koszulka Bawełniana Premium",
    "type": "simple",
    "regular_price": "89.00",
    "sale_price": "69.00",
    "description": "<p>Wygodna koszulka z wysokiej jakości bawełny.</p>",
    "short_description": "Koszulka bawełniana premium",
    "sku": "TSH-001",
    "stock_quantity": 100,
    "stock_status": "instock",
    "categories": [{ "id": 9 }],
    "tags": [{ "id": 5 }, { "id": 12 }],
    "weight": "0.2",
    "dimensions": {
      "length": "30",
      "width": "20",
      "height": "1"
    }
  }
}
```

### Produkt zmienny (z atrybutami)

Najpierw upewnij się, że istnieją atrybuty (rozmiar, kolor). Jeśli nie — utwórz je:

```json
{
  "name": "products_attributes_create",
  "arguments": {
    "name": "Rozmiar",
    "slug": "rozmiar",
    "type": "select",
    "order_by": "menu_order",
    "has_archives": true
  }
}
```

```json
{
  "name": "products_attributes_terms_create",
  "arguments": {
    "attribute_id": 1,
    "name": "S"
  }
}
```

Następnie utwórz produkt zmienny:

```json
{
  "name": "products_create",
  "arguments": {
    "name": "Kurtka Zimowa",
    "type": "variable",
    "regular_price": "399.00",
    "description": "Ciepła kurtka zimowa w kilku rozmiarach",
    "sku": "JKT-001",
    "attributes": [
      {
        "name": "Rozmiar",
        "visible": true,
        "variation": true,
        "options": ["S", "M", "L", "XL"]
      }
    ]
  }
}
```

Zapamiętaj `id` zwróconego produktu — będzie potrzebny do tworzenia wariacji.

---

## 4. Zarządzanie wariacjami

### Tworzenie wariacji

Dla produktu zmiennego (załóżmy, że `id = 456`):

```json
{
  "name": "products_variations_create",
  "arguments": {
    "product_id": 456,
    "regular_price": "399.00",
    "sku": "JKT-001-S",
    "stock_quantity": 10,
    "stock_status": "instock",
    "attributes": [
      {
        "name": "Rozmiar",
        "option": "S"
      }
    ]
  }
}
```

Powtórz dla pozostałych rozmiarów (M, L, XL).

### Listowanie wariacji

```json
{
  "name": "products_variations_list",
  "arguments": {
    "product_id": 456
  }
}
```

### Pobieranie pojedynczej wariacji

```json
{
  "name": "products_variations_get",
  "arguments": {
    "product_id": 456,
    "variation_id": 789
  }
}
```

### Aktualizacja wariacji

```json
{
  "name": "products_variations_update",
  "arguments": {
    "product_id": 456,
    "variation_id": 789,
    "regular_price": "419.00",
    "stock_quantity": 5
  }
}
```

### Usuwanie wariacji

```json
{
  "name": "products_variations_delete",
  "arguments": {
    "product_id": 456,
    "variation_id": 789
  }
}
```

---

## 5. Aktualizacja produktu

### Zmiana ceny i stanu magazynowego

```json
{
  "name": "products_update",
  "arguments": {
    "id": 123,
    "regular_price": "99.00",
    "sale_price": "79.00",
    "stock_quantity": 150
  }
}
```

### Zmiana kategorii i tagów

```json
{
  "name": "products_update",
  "arguments": {
    "id": 123,
    "categories": [{ "id": 10 }, { "id": 15 }],
    "tags": [{ "id": 3 }]
  }
}
```

---

## 6. Zarządzanie kategoriami

### Listowanie kategorii

```json
{
  "name": "products_categories_list",
  "arguments": {
    "hide_empty": true
  }
}
```

### Tworzenie kategorii

```json
{
  "name": "products_categories_create",
  "arguments": {
    "name": "Odzież Sportowa",
    "slug": "odziez-sportowa",
    "description": "Kategoria dla odzieży sportowej",
    "parent": 0
  }
}
```

### Aktualizacja kategorii

```json
{
  "name": "products_categories_update",
  "arguments": {
    "id": 20,
    "description": "Kategoria dla odzieży sportowej i akcesoriów"
  }
}
```

---

## 7. Zarządzanie tagami

```json
{
  "name": "products_tags_create",
  "arguments": {
    "name": "nowość",
    "slug": "nowosc"
  }
}
```

```json
{
  "name": "products_tags_list",
  "arguments": {
    "search": "nowość"
  }
}
```

---

## 8. Zarządzanie atrybutami i terminami

### Listowanie atrybutów

```json
{
  "name": "products_attributes_list",
  "arguments": {}
}
```

### Tworzenie atrybutu

```json
{
  "name": "products_attributes_create",
  "arguments": {
    "name": "Kolor",
    "slug": "kolor",
    "type": "select",
    "order_by": "name"
  }
}
```

### Tworzenie terminu atrybutu

```json
{
  "name": "products_attributes_terms_create",
  "arguments": {
    "attribute_id": 2,
    "name": "Czerwony",
    "slug": "czerwony"
  }
}
```

---

## 9. Batch operations

### Masowe tworzenie

```json
{
  "name": "products_batch",
  "arguments": {
    "create": [
      { "name": "Produkt A", "regular_price": "10.00", "type": "simple" },
      { "name": "Produkt B", "regular_price": "20.00", "type": "simple" },
      { "name": "Produkt C", "regular_price": "30.00", "type": "simple" }
    ]
  }
}
```

---

## 10. Product reviews

### Listowanie opinii

```json
{
  "name": "products_reviews_list",
  "arguments": {
    "product": 123,
    "status": "approved"
  }
}
```

### Dodawanie opinii

```json
{
  "name": "products_reviews_create",
  "arguments": {
    "product_id": 123,
    "rating": 5,
    "review": "Świetny produkt, polecam!",
    "reviewer": "Jan Kowalski",
    "reviewer_email": "jan@example.com"
  }
}
```

---

## Ćwiczenie: utwórz produkt z 3 wariacjami

Wykonaj sekwencyjnie:

1. **Utwórz atrybut** `Kolor` (jeśli nie istnieje)
2. **Dodaj terminy**: `Czerwony`, `Niebieski`, `Zielony`
3. **Utwórz produkt zmienny** "Plecak Turystyczny" z atrybutem Kolor
4. **Dodaj 3 wariacje** — po jednej dla każdego koloru:
   - Czerwony: `regular_price = "149.00"`, `stock_quantity = 20`
   - Niebieski: `regular_price = "159.00"`, `stock_quantity = 15`
   - Zielony: `regular_price = "139.00"`, `stock_quantity = 25`
5. **Sprawdź** listując wariacje dla tego produktu
6. **Zaktualizuj** cenę czerwonej wariacji na `"139.00"` (promocja)
7. **Usuń** zieloną wariację

---

## ⚠️ Ograniczenia przy tworzeniu opisów produktów

Podczas używania `products_create` / `products_update` do ustawiania pól `description` i `short_description`, agent musi uwzględniać następujące ograniczenia:

### Czego NIE robić

| Czynność                                                                            | Dlaczego?                                                                                                                  |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| ❌ Wstawianie `<svg>...</svg>` bezpośrednio w `description` lub `short_description` | WooCommerce REST API przepuszcza dane przez `wp_kses_post()` — **stripuje wszystkie tagi SVG**. SVG nie zostanie zapisany. |
| ❌ Wstawianie `<style>` w `description`                                             | `wp_kses_post()` usuwa `<style>`. Dodatkowo `wc_format_content()` (wptexturize) zamienia `--` na `–`, psując zmienne CSS.  |
| ❌ Używanie atrybutów `on*` (onclick, onload) w opisie                              | Są usuwane przez `wp_kses_post()` i frontendową sanitizację.                                                               |
| ❌ Wstawianie `<script>` w opisie                                                   | Usuwane przez wszystkie warstwy bezpieczeństwa.                                                                            |

### Jak to robić prawidłowo

Projekt używa **meta pól pluginowych** (`_pcb_*`) do przechowywania treści, które nie mogą przejść przez standardową ścieżkę opisu WooCommerce:

| Czego potrzebujesz                                      | Użyj                                         | Przykład                                                                                 |
| ------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **SVG w opisie** (ikony, diagramy, grafiki dekoracyjne) | `meta_data` z kluczem `_pcb_description_svg` | `meta_data: [{ key: "_pcb_description_svg", value: "<svg>...</svg>" }]`                  |
| **CSS/animacje w opisie**                               | `meta_data` z kluczem `_pcb_description_css` | `meta_data: [{ key: "_pcb_description_css", value: ".cls-1 { animation: pulse 2s; }" }]` |

**Jak to działa:**

1. Agent ustawia `meta_data` w `products_create` / `products_update`
2. Plugin `panel-configurator-bridge` przy odczycie przez Store API injectuje SVG przed opisem (kolejność: SVG → CSS → description body)
3. Frontend (Next.js) ma 3-warstwową sanitizację: PHP regex → sanitize-html → DOMPurify

**Przykład poprawnego wywołania `products_update` dla produktu z SVG:**

```json
{
  "id": 123,
  "description": "<p>Panel ryflowany z MDF, precyzyjnie frezowany CNC.</p>",
  "short_description": "Panel dekoracyjny MDF",
  "meta_data": [
    {
      "key": "_pcb_description_svg",
      "value": "<svg viewBox=\"0 0 100 50\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"100\" height=\"50\" fill=\"#f0f0f0\" rx=\"5\"/><text x=\"50\" y=\"30\" text-anchor=\"middle\" font-size=\"12\">Wymiar: 2750×1200 mm</text></svg>"
    }
  ]
}
```

### Uwagi

- `_pcb_description_svg` jest **dodawany przed** opisem, więc nie powtarzaj treści opisu w SVG
- `_pcb_description_css` (CSS) jest dodawany za SVG a przed opisem (`<style>`)
- Oba meta pola są injectowane **tylko** w Store API (`wc/store/v1/products`) — nie w REST API (`wc/v3/products`)
- Frontend automatycznie scopuje CSS do `.wysiwyg-content` (zapobiega globalnym wyciekom)
- Sanityzacja po stronie serwera (PHP): strip `<script>`, `on*`, `javascript:` w href, limit 100KB

---

## Podsumowanie

Opanowałeś pełen CRUD produktów WooCommerce przez MCP. Najważniejsze narzędzia:

| Narzędzie               | Zastosowanie                    |
| ----------------------- | ------------------------------- |
| `products_list`         | Listowanie i filtrowanie        |
| `products_get`          | Pojedynczy produkt              |
| `products_create`       | Nowy produkt (prosty / zmienny) |
| `products_update`       | Aktualizacja pól                |
| `products_delete`       | Usuwanie                        |
| `products_variations_*` | Zarządzanie wariacjami          |
| `products_categories_*` | Zarządzanie kategoriami         |
| `products_tags_*`       | Zarządzanie tagami              |
| `products_attributes_*` | Zarządzanie atrybutami          |
| `products_batch`        | Operacje masowe                 |

## Następne kroki

- [Tutorial 3: Zamówienia i Klienci](03-orders-and-customers.md)
- [Tutorial 4: Raporty i Narzędzia Systemowe](04-reports-and-system.md)
