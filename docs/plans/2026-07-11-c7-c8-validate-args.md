# C7 + C8: ValidateArgs Usage Fixes

**Goal:** Fix two issues: (C7) use validated return value from `validateArgs()` instead of raw `args`, and (C8) add Zod validation for `*_list` handlers.

**Architecture:** Each `src/tools/*.ts` file has handlers that call `validateArgs()` but ignore the return value, and `*_list` handlers that skip validation entirely. Fix is mechanical per-file.

**Tech Stack:** TypeScript, Zod

---

### Task 1: products.ts — C7 + C8

**Files:** `src/tools/products.ts`

**C7 changes (use validated return value):**
Every handler that calls `validateArgs()` must use its return value instead of raw `args`:

- `products_get`: `const v = validateArgs(...); ... \`products/${v.id}\``
- `products_create`: `const v = validateArgs(...); ... client.post('products', v)`
- `products_update`: `const v = validateArgs(...); const { id, ...data } = v; ... client.put(\`products/${id}\`, data)`
- `products_delete`: `const v = validateArgs(...); const params: ... if (v.force !== undefined) ... client.delete(\`products/${v.id}\`, params)`
- `products_batch`: `const v = validateArgs(...); ... client.post('products/batch', v)`
- `products_variations_list`: `const v = validateArgs(...); const { product_id, ...params } = v`
- `products_variations_get`: `const v = validateArgs(...); ... \`products/${v.product_id}/variations/${v.variation_id}\``
- `products_variations_create`: `const v = validateArgs(...); const { product_id, ...data } = v`
- `products_variations_update`: `const v = validateArgs(...); const { product_id, variation_id, ...data } = v`
- `products_variations_delete`: `const v = validateArgs(...); ... if (v.force !== undefined) ... client.delete(\`products/${v.product_id}/variations/${v.variation_id}\`, params)`
- `products_categories_get`: `const v = validateArgs(...); ... \`products/categories/${v.id}\``
- `products_categories_create`: `const v = validateArgs(...); ... client.post('products/categories', v)`
- `products_categories_update`: `const v = validateArgs(...); const { id, ...data } = v`
- `products_categories_delete`: `const v = validateArgs(...); ... if (v.force !== undefined) ...`
- `products_tags_get`: `const v = validateArgs(...); ... \`products/tags/${v.id}\``
- `products_tags_create`: `const v = validateArgs(...); ... client.post('products/tags', v)`
- `products_tags_update`: `const v = validateArgs(...); const { id, ...data } = v`
- `products_tags_delete`: `const v = validateArgs(...); ... if (v.force !== undefined) ...`
- `products_attributes_get`: `const v = validateArgs(...); ... \`products/attributes/${v.id}\``
- `products_attributes_create`: `const v = validateArgs(...); ... client.post('products/attributes', v)`
- `products_attributes_update`: `const v = validateArgs(...); const { id, ...data } = v`
- `products_attributes_delete`: `const v = validateArgs(...); ... if (v.force !== undefined) ...`
- `products_attributes_terms_list`: `const v = validateArgs(...); const { attribute_id, ...params } = v`
- `products_attributes_terms_create`: `const v = validateArgs(...); const { attribute_id, ...data } = v`
- `products_reviews_get`: `const v = validateArgs(...); ... \`products/reviews/${v.id}\``
- `products_reviews_create`: `const v = validateArgs(...); ... client.post('products/reviews', v)`

**C8 changes (add Zod schemas for list handlers):**

- `products_list`: Add Zod schema for page, per_page, search, status, category, tag, sku, orderby, order, min_price, max_price, on_sale, stock_status. Use validated in params.
- `products_categories_list`: Add Zod schema for page, per_page, search, hide_empty.
- `products_tags_list`: Add Zod schema for page, per_page, search, orderby, order, hide_empty.
- `products_attributes_list`: Add Zod schema for page, per_page, search, orderby, order.
- `products_reviews_list`: Add Zod schema for page, per_page, search, product, status, orderby, order.

**Run after changes:** `npm run lint && npm run type-check`

---

### Task 2: orders.ts — C7 + C8

**Files:** `src/tools/orders.ts`

**C7 changes:** Same pattern — `validateArgs(...)` → `const v = validateArgs(...)` and use `v` instead of `args` in:

- `orders_get`, `orders_create`, `orders_update`, `orders_delete`, `orders_batch`, `orders_notes_list`, `orders_notes_create`, `orders_refunds_list`, `orders_refunds_get`, `orders_refunds_create`

**C8 changes:**

- `orders_list`: Add Zod schema for page, per_page, search, after, before, status, customer, product, orderby, order.

**Run after changes:** `npm run lint && npm run type-check`

---

### Task 3: customers.ts + coupons.ts — C7 + C8

**Files:** `src/tools/customers.ts`, `src/tools/coupons.ts`

Same patterns as above. Add list schemas for `customers_list` and `coupons_list`.

**Run after changes:** `npm run lint && npm run type-check`

---

### Task 4: shipping.ts + taxes.ts — C7 + C8

**Files:** `src/tools/shipping.ts`, `src/tools/taxes.ts`

Same patterns. `taxes_rates_list` needs a list schema. Note: `shipping_zones_list` has no params so no C8 needed.

**Run after changes:** `npm run lint && npm run type-check`

---

### Task 5: email.ts + reports.ts — C7 + C8

**Files:** `src/tools/email.ts`, `src/tools/reports.ts`

- `email_send`: Replace args with validated.
- All report handlers need Zod validation schemas for their params.

**Run after changes:** `npm run lint && npm run type-check`
