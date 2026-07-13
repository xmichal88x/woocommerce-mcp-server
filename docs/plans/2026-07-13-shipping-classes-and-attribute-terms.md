# Shipping Classes & Attribute Terms — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task.

**Goal:** Add 6 missing WooCommerce REST API tools: shipping classes CRUD + attribute terms update/delete.

**Architecture:** All tools added to existing `products` group in `src/tools/products.ts`, use `getClient()` (WooCommerce REST API v3), mutations guarded by `isReadOnly()`.

**Tech Stack:** TypeScript, Zod, @woocommerce/woocommerce-rest-api, Vitest

---

### Task 1: `products_shipping_classes_list`

**Endpoint:** `GET /wc/v3/products/shipping_classes`

**Files:**

- Modify: `src/tools/products.ts` — append to `tools` array
- Test: `tests/tools/products.test.ts` — add test

**Pattern:** `makeListHandler`

**Verification:** `npm run lint && npm run type-check && npm test`

---

### Task 2: `products_shipping_classes_create`

**Endpoint:** `POST /wc/v3/products/shipping_classes`

**Pattern:** inline handler + `isReadOnly()` guard

**Zod params:** `name` (required), `slug`, `description`

---

### Task 3: `products_shipping_classes_update`

**Endpoint:** `PUT /wc/v3/products/shipping_classes/{id}`

**Zod params:** `id` (required), `name`, `slug`, `description`

---

### Task 4: `products_shipping_classes_delete`

**Endpoint:** `DELETE /wc/v3/products/shipping_classes/{id}`

**Zod params:** `id` (required), `force` (optional)

---

### Task 5: `products_attributes_terms_update`

**Endpoint:** `PUT /wc/v3/products/attributes/{attribute_id}/terms/{term_id}`

**Pattern:** identyczny jak `products_attributes_terms_create` ale PUT

**Zod params:** `attribute_id` (required), `term_id` (required), `name`, `slug`, `description`

---

### Task 6: `products_attributes_terms_delete`

**Endpoint:** `DELETE /wc/v3/products/attributes/{attribute_id}/terms/{term_id}`

**Zod params:** `attribute_id` (required), `term_id` (required), `force` (optional)
