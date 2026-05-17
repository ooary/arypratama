# Core Managed Pharmacy — AI Implementation Task List

> For AI implementers: use BRD `/brd/apotek-management/` and ERD `/erd/apotek-management/` as the source of truth.
>
> Domain stance: inventory-first pharmacy operations. POS is one transaction channel, not the center of the domain. Stock source of truth is `stock_batches` + append-only `stock_movements`, not `products.stock`.

## Global Rules

- Do not create `products.stock` as the source of truth.
- Store every stock quantity in the product base unit.
- Convert purchase and selling units into base units before posting to the ledger.
- Posted movements are append-only. Corrections use reversal or adjustment movements.
- Every stock-changing transaction must write `stock_movements` with `reference_type` + `reference_id` for idempotency.
- Every sensitive action must write an `audit_logs` row.
- Frontend must read stock from backend projections/queries, not calculate operational stock from UI state.
- Keep customer data optional for retail sales. Use `customers`, `customer_groups`, `sale_notes`, and `sales_note_templates` only for segmentation, notes, B2B/member behavior, and reporting.

---

## Phase 0 — Project Foundation

### BE-001 — Bootstrap backend

**Objective:** Create the backend foundation.

**Tasks:**
- Create backend folders: `src/modules`, `src/shared`, `src/database`, `tests`.
- Configure environment: database URL, app secret, timezone, pagination default, storage config.
- Add migration runner.
- Add seed command.
- Add test runner.
- Add `GET /health`.

**Acceptance criteria:**
- Health endpoint returns OK.
- Fresh database migration succeeds.
- Test command runs.

### FE-001 — Bootstrap frontend

**Objective:** Create the internal dashboard shell.

**Tasks:**
- Create app shell, auth layout, app layout, routing, sidebar, and topbar.
- Create API client with auth token and error handling.
- Create shared UI components: button, input, select, table, modal, toast, badge, empty state, confirm dialog.

**Acceptance criteria:**
- Login route and app shell render.
- API errors surface as readable messages.
- App layout works on desktop and basic mobile widths.

---

## Phase 1 — Auth, Organization, Outlet, Warehouse

### BE-002 — Organization and location schema

**Objective:** Support tenant, outlet, and warehouse scoping.

**Tasks:**
- Create `organizations`.
- Create `outlets`.
- Create `warehouses`.
- Create `pharmacy_profiles`.
- Seed one organization, one outlet, one display warehouse, and one quarantine warehouse.

**Acceptance criteria:**
- Every operational table can later scope data by organization/outlet/warehouse.

### BE-003 — User, role, permission

**Objective:** Add basic access control.

**Tasks:**
- Create `users`, `roles`, `permissions`, `user_roles`, and `role_permissions`.
- Seed roles: Owner, Admin/Pharmacist, Cashier, Warehouse.
- Seed demo users for each role.
- Add login, logout if needed, and current-user endpoints.
- Add auth middleware and permission middleware.

**Acceptance criteria:**
- Demo users can log in.
- Protected endpoints reject anonymous access.
- Permission middleware can gate a route.

### FE-002 — Auth and settings UI

**Objective:** Let users log in and manage basic settings.

**Tasks:**
- Build login page.
- Store session/token safely.
- Redirect to dashboard after login.
- Redirect to login when token is invalid.
- Add logout.
- Build pharmacy profile page.
- Build outlet and warehouse page.
- Build simple user and role page.

---

## Phase 2 — Master Data

### BE-004 — Reference master data

**Objective:** Create supporting master data.

**Tasks:**
- Create `product_categories`.
- Create `drug_classes`.
- Create `manufacturers`.
- Create `customers`.
- Create `customer_groups`.
- Create `sales_note_templates`.
- Add CRUD, search, pagination, active/inactive status.

**Acceptance criteria:**
- Admin can manage references without touching raw database records.

### BE-005 — Product and supplier schema

**Objective:** Model products, units, prices, locations, and suppliers.

**Tasks:**
- Create `products`.
- Create `product_units`.
- Create `product_unit_conversions`.
- Create `product_prices`.
- Create `product_locations`.
- Create `suppliers`.
- Create `supplier_products`.
- Add CRUD APIs.

**Acceptance criteria:**
- A product can have base unit, purchase unit, selling unit, conversions, prices, default location, and preferred supplier.

### BE-006 — Unit conversion service

**Objective:** Make unit conversion safe and reusable.

**Tasks:**
- Convert purchase/selling unit quantities into base-unit quantities.
- Validate conversion multiplier.
- Support multi-level conversion such as `1 box = 10 strips`, `1 strip = 10 tablets`.
- Add tests for valid conversion, missing conversion, invalid multiplier, and rounding behavior.

### FE-003 — Master data UI

**Objective:** Build admin screens for master data.

**Tasks:**
- Build product category page.
- Build product class page.
- Build manufacturer page.
- Build customer page.
- Build customer group page.
- Build sales note template page.
- Build supplier page.
- Build product list and product create/edit form.
- Add sections for units, conversions, pricing, rack location, and default supplier.

---

## Phase 3 — Inventory Ledger Core

### BE-007 — Ledger schema

**Objective:** Create the stock source of truth.

**Tasks:**
- Create `stock_batches`.
- Create `stock_movements`.
- Add movement types:
  - `opening_stock`
  - `purchase_receive`
  - `sale`
  - `sale_return`
  - `purchase_return`
  - `stock_take_adjustment`
  - `mutation_in`
  - `mutation_out`
  - `expired_quarantine`
  - `destruction`

**Acceptance criteria:**
- Stock can be represented by batch and by append-only movement history.

### BE-008 — Stock posting service

**Objective:** Centralize all stock writes.

**Tasks:**
- Add inbound posting.
- Add outbound posting.
- Add adjustment posting.
- Run every posting inside a database transaction.
- Update `stock_batches.qty_available_base_unit`.
- Insert `stock_movements`.
- Prevent negative stock.
- Prevent duplicate posting with idempotency key.

**Acceptance criteria:**
- No stock-changing feature writes directly to stock tables outside this service.

### BE-009 — FEFO allocation service

**Objective:** Deduct stock from the correct batches.

**Tasks:**
- Fetch available batches by nearest expiry date.
- Skip expired, quarantined, and destroyed batches.
- Split deductions across multiple batches when needed.
- Return allocation preview.
- Support explicit batch override for manual selection.

**Acceptance criteria:**
- Sale of 15 tablets can allocate 10 from batch A and 5 from batch B.
- Insufficient stock returns a clear error before posting.

### BE-010 — Stock query API

**Objective:** Expose stock projections.

**Tasks:**
- Stock summary API.
- Batch list per product API.
- Stock card API.
- Low-stock API.
- Near-expiry API.

### FE-004 — Inventory UI

**Objective:** Make stock visible and auditable.

**Tasks:**
- Stock summary page.
- Product batch detail page.
- Stock card page.
- Filters: outlet, warehouse, product, category, batch, low stock, near expiry.
- Basic CSV export.

---

## Phase 4 — Opening Stock

### BE-011 — Opening stock

**Objective:** Seed initial physical stock correctly.

**Tasks:**
- Accept product, warehouse, batch number, expiry date, unit, quantity, and cost.
- Convert quantity into base unit.
- Create `stock_batches`.
- Create `stock_movements` with type `opening_stock`.

### FE-005 — Opening stock UI

**Objective:** Let admin input opening stock.

**Tasks:**
- Multi-row opening stock form.
- Product search.
- Unit selector.
- Batch, expiry, warehouse, quantity, and cost fields.
- Base-unit preview.
- Post action and stock-card link.

---

## Phase 5 — Procurement

### BE-012 — Defecta

**Objective:** Track purchase needs.

**Tasks:**
- Create `defecta_items`.
- Generate suggestions from low stock.
- Allow manual creation.
- Statuses: suggested, reviewed, converted_to_po, ignored, fulfilled.
- Convert selected defecta items into purchase order items.

### BE-013 — Purchase order

**Objective:** Create and manage supplier orders.

**Tasks:**
- Create `purchase_orders` and `purchase_order_items`.
- Add create/edit/approve/cancel flows.
- Track ordered quantity, base quantity, estimated price, and received quantity.

### BE-014 — Goods receipt and supplier invoice

**Objective:** Receive stock into the ledger.

**Tasks:**
- Create `goods_receipts` and `goods_receipt_items`.
- Create `supplier_invoices`.
- Receive goods from PO or without PO.
- Input batch number, expiry date, purchase price, discount, tax, and target warehouse.
- Create stock batches.
- Post `purchase_receive` movements.

### FE-006 — Procurement UI

**Objective:** Build procurement screens.

**Tasks:**
- Defecta page.
- PO list and detail pages.
- Goods receipt page.
- Supplier invoice page.
- Supplier payment page if finance-lite is enabled.

---

## Phase 6 — Stock Control

### BE-015 — Stock take

**Objective:** Reconcile system stock with physical count.

**Tasks:**
- Create `stock_opnames` and `stock_opname_items`.
- Capture physical quantity.
- Calculate system-vs-physical difference.
- Require reason for adjustment.
- Post `stock_take_adjustment` movements.

### BE-016 — Stock transfer

**Objective:** Move stock between warehouses or outlets.

**Tasks:**
- Create `stock_mutations` and `stock_mutation_items`.
- Select source and destination warehouse/outlet.
- Post `mutation_out` from source.
- Post `mutation_in` to destination.

### BE-017 — Expiry handling

**Objective:** Control near-expiry and expired stock.

**Tasks:**
- Create near-expiry report.
- Create quarantine action.
- Create disposal action.
- Post `expired_quarantine` and `destruction` movements.
- Record loss amount when stock is disposed.

### FE-007 — Stock control UI

**Objective:** Build operational stock-control screens.

**Tasks:**
- Stock take page.
- Stock transfer page.
- Expiry handling page.
- Quarantine/disposal confirmation flow.

---

## Phase 7 — POS and Shift

### BE-018 — Shift management

**Objective:** Track cashier accountability.

**Tasks:**
- Create `shift_schedules` and `shifts`.
- Open shift with opening cash.
- Close shift with physical cash.
- Calculate expected cash and cash variance.

### BE-019 — Sale posting

**Objective:** Sell items and deduct stock correctly.

**Tasks:**
- Create `sales`, `sale_items`, and `payments`.
- Add sale draft flow.
- Add/update/remove sale items.
- Calculate subtotal, discount, tax, and grand total.
- Allocate batches through FEFO.
- Post `sale` movements.
- Record cash/non-cash payments.

### BE-020 — Sale return

**Objective:** Return sold items safely.

**Tasks:**
- Create `sale_returns` and `sale_return_items`.
- Validate returned items against original sale.
- Support stock disposition: `return_to_stock`, `quarantine`, `discard`.
- Post `sale_return` movement only when disposition returns stock.

### FE-008 — POS UI

**Objective:** Build cashier flow.

**Tasks:**
- Product search and barcode input.
- Cart with unit, quantity, price, discount.
- Optional customer selector.
- Sales note section.
- Payment modal.
- Receipt preview.
- Shift open/close UI.

---

## Phase 8 — Customer Management and Sales Notes

### BE-021 — Customer and sales notes

**Objective:** Support optional customer identity and sale-level notes.

**Tasks:**
- CRUD customers.
- CRUD customer groups.
- CRUD sales note templates.
- Attach `sale_notes` to a sale.
- Print or export sales note when needed.

### FE-009 — Customer and notes UI

**Objective:** Build supporting customer screens.

**Tasks:**
- Customer page.
- Customer group page.
- Sales note template page.
- Sales note section inside POS.

---

## Phase 9 — Purchase Return

### BE-022 — Purchase return

**Objective:** Return goods to supplier.

**Tasks:**
- Create `purchase_returns` and `purchase_return_items`.
- Select supplier, goods receipt, product, batch, unit, and quantity.
- Validate available stock.
- Post `purchase_return` movement.
- Update supplier invoice/refund note when needed.

### FE-010 — Purchase return UI

**Objective:** Build supplier-return screen.

**Tasks:**
- Purchase return list and detail.
- Product/batch selector.
- Reason field.
- Posting confirmation.

---

## Phase 10 — Reports and Dashboard

### BE-023 — Reports API

**Objective:** Expose business reports.

**Tasks:**
- Sales by date, product, cashier, payment method, and customer group.
- Stock on hand by outlet, warehouse, product, batch, and expiry date.
- Critical stock, near-expiry stock, fast-moving items, slow-moving items, and dead stock.
- Purchase by supplier and product.
- Supplier payable report.
- Gross margin and cash variance report.
- CSV/PDF export basics.

### BE-024 — Dashboard API

**Objective:** Provide role-based dashboard data.

**Tasks:**
- Owner dashboard: revenue, gross margin, stock risk, payables, cash variance.
- Cashier dashboard: current shift, sales today, pending return reminders.
- Admin/Pharmacist dashboard: near expiry, low stock, pending stock take.
- Warehouse dashboard: defecta, incoming goods, transfer queue.
- Keep queries optimized; use views or projections when needed.

### FE-011 — Reports and dashboard UI

**Objective:** Build report and dashboard screens.

**Tasks:**
- Report filters and export actions.
- Owner dashboard.
- Cashier dashboard.
- Admin/Pharmacist dashboard.
- Warehouse dashboard.
- Role-based menu and redirect.

---

## Phase 11 — Audit Trail and Data Safety

### BE-025 — Audit log

**Objective:** Make sensitive actions traceable.

**Tasks:**
- Create `audit_logs`.
- Log login/logout.
- Log sensitive master-data changes.
- Log price changes.
- Log stock postings.
- Log void/cancel actions.
- Store actor, action, entity type, entity ID, before snapshot, after snapshot, IP address, and timestamp.

### BE-026 — Posted transaction protection

**Objective:** Prevent silent data corruption.

**Tasks:**
- Block direct edit of posted transactions.
- Use reversal or adjustment for corrections.
- Require correction reason.
- Add regression tests for ledger invariants.

### FE-012 — Audit UI

**Objective:** Let owner/admin inspect changes.

**Tasks:**
- Audit log page.
- Filters by actor, action, entity, date range.
- Detail modal with before/after data.

---

## Phase 12 — Import, Export, Print, Polish

### BE-027 — Import/export

**Objective:** Reduce setup friction.

**Tasks:**
- Import products from CSV/Excel.
- Import opening stock.
- Validate rows and return error report.
- Export reports.

### FE-013 — Print and polish

**Objective:** Make operational output usable.

**Tasks:**
- Print receipt.
- Print purchase order.
- Print stock card.
- Polish loading, empty, error, and validation states.
- Polish responsive layout.

---

## Phase 13 — End-to-End Verification

### E2E-001 — Demo seed

**Objective:** Create a realistic demo environment.

**Tasks:**
- Seed roles and users.
- Seed products with box/strip/tablet unit conversion.
- Seed suppliers.
- Seed opening stock with multiple batches and expiry dates.
- Seed a few sales, returns, and purchase flows.

### E2E-002 — Minimum vertical slice

**Objective:** Prove the core product works end to end.

**Scenario:**
1. Login as Owner.
2. Create Paracetamol product with tablet/strip/box units.
3. Create supplier.
4. Post opening stock.
5. View stock summary and stock card.
6. Create purchase order.
7. Receive goods with batch and expiry date.
8. Open cashier shift.
9. Sell product via POS.
10. Verify FEFO deduction.
11. View sale movement in stock card.
12. Close shift.
13. View sales, stock, and margin reports.
14. Verify audit log entries.

### E2E-003 — Definition of done

- Backend tests pass.
- Frontend build passes.
- Migration works from a fresh database.
- Seed data creates a usable demo.
- Minimum vertical slice passes manually or through automated E2E.
- No core workflow depends on `products.stock` as source of truth.
- All stock changes enter the ledger.
- Posted transactions cannot be silently edited.
- Owner can view reports and dashboard.
