# Orders Tools Implementation Plan

**Goal:** Add complete order management tools (CRUD, notes, refunds) to the WooCommerce MCP Server

**Architecture:** Single file `src/tools/orders.ts` registered via `registerGroup('orders', ...)`, following the exact pattern from `src/tools/products.ts`. One import line added to `src/index.ts`.

**Tech Stack:** Node.js + TypeScript + @woocommerce/woocommerce-rest-api

---

### Task 1: Create `src/tools/orders.ts`

**Files:**
- Create: `src/tools/orders.ts`
- Modify: `src/index.ts` (add import)

**Pattern to follow exactly (from products.ts):**
- Import `registerGroup` from `../groups.js`
- Import `getClient`, `isReadOnly` from `../client.js`
- Import `safeError` from `../errors.js`
- Import `extractPagination` from `../types.js`
- Local `readOnlyError()` helper function
- `registerGroup({ name: 'orders', tools: [...] })`

**Tools to implement:**

1. `orders_list` — GET `orders` (params: page, per_page, search, after, before, status, customer, product, orderby, order)
2. `orders_get` — GET `orders/{id}`
3. `orders_create` — POST `orders` (params: customer_id, payment_method, billing, shipping, line_items, shipping_lines, coupon_lines, meta_data, status, currency, customer_note, set_paid)
4. `orders_update` — PUT `orders/{id}` (same as create, all optional, id required)
5. `orders_delete` — DELETE `orders/{id}` (params: id, force)
6. `orders_batch` — POST `orders/batch`
7. `orders_notes_list` — GET `orders/{id}/notes` (params: order_id, page, per_page)
8. `orders_notes_create` — POST `orders/{id}/notes` (params: order_id, note, customer_note)
9. `orders_refunds_list` — GET `orders/{id}/refunds`
10. `orders_refunds_get` — GET `orders/{id}/refunds/{refund_id}`
11. `orders_refunds_create` — POST `orders/{id}/refunds` (params: order_id, amount, reason, line_items, refund_payment, api_refund, meta_data)

**Implementation details:**
- All mutation tools (create/update/delete/batch/refund) guarded by `if (isReadOnly()) return readOnlyError()`
- All handlers wrapped in try/catch with `safeError()`
- JSON.stringify with null, 2 indent
- Descriptions on all JSON Schema properties
- List tools use `extractPagination` for pagination info

**Modify `src/index.ts`:**
- Add `import './tools/orders.js';` after the products import

**Verification:**
1. `npx tsc --noEmit` — must exit 0
2. `git add -A && git commit -m "feat: add order tools (CRUD, notes, refunds)"`
