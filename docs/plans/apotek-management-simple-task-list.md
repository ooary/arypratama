# Core Managed Pharmacy — Simplified AI Task List

> Source: BRD `/brd/apotek-management/` and ERD `/erd/apotek-management/`.
>
> Main principle: inventory-first. Stock must come from `stock_batches` + `stock_movements`, not `products.stock`.

---

## Task 0 — Setup Project

### 0.1 Setup environment
- Set up the backend and frontend repositories.
- Set up package manager, formatter, linter, and test runner.
- Set up env file: database URL, app secret, timezone, and storage config.
- Set up local database.
- Set up migration command.
- Set up seed command.
- Set up dev commands for backend and frontend.

### 0.2 Setup backend foundation
- Create folder/module structure.
- Create database connection.
- Create migration runner.
- Create health check endpoint.
- Create standard API response.
- Create standard error handler.
- Create validation helper.
- Create pagination helper.

### 0.3 Setup frontend foundation
- Create app shell.
- Create routing.
- Create login layout and app layout.
- Create sidebar menu.
- Create topbar.
- Create API client.
- Create shared UI components: button, input, select, table, modal, toast, badge, empty state.

### 0.4 Setup CI/basic verification
- Add test command.
- Add build command.
- Add sample seed data.
- Make sure backend and frontend can run locally.

---

## Task 1 — Auth, User, Role, Outlet

### 1.1 Create organization, outlet, warehouse
- Create table `organizations`.
- Create table `outlets`.
- Create table `warehouses`.
- Create table `pharmacy_profiles`.
- Seed one organization, one outlet, display warehouse, and quarantine warehouse.

### 1.2 Create user, role, permission
- Create table `users`.
- Create table `roles`.
- Create table `permissions`.
- Create table pivot `user_roles`.
- Create table pivot `role_permissions`.
- Seed roles: Owner, Admin/Pharmacist, Cashier, Warehouse.
- Seed demo users for each role.

### 1.3 Build login API
- Create login endpoint.
- Create logout endpoint if needed.
- Create current-user endpoint.
- Create auth middleware.
- Create permission middleware.

### 1.4 Build login UI
- Create login page.
- Store session/token.
- Redirect to dashboard after login.
- Redirect to login when token is invalid.
- Add logout.

### 1.5 Build basic settings UI
- Pharmacy profile page.
- Outlet and warehouse page.
- Simple user and role page.

---

## Task 2 — Master Data

### 2.1 Create reference master data
- Create table `product_categories`.
- Create table `drug_classes`.
- Create table `manufacturers`.
- Create table `customers`.
- Create table `customer_groups`.
- Create table `sales_note_templates`.

### 2.2 Build reference master data API
- CRUD product category.
- CRUD product class.
- CRUD manufacturer.
- CRUD customers.
- CRUD customer groups.
- CRUD sales note templates.
- Add search and pagination.

### 2.3 Build reference master data UI
- Page product category.
- Page product class.
- Page manufacturer.
- Customer page.
- Customer group page.
- Sales note template page.

### 2.4 Create product and supplier schema
- Create table `products`.
- Create table `product_units`.
- Create table `product_unit_conversions`.
- Create table `product_prices`.
- Create table `product_locations`.
- Create table `suppliers`.
- Create table `supplier_products`.

### 2.5 Build product API
- CRUD products.
- CRUD product units.
- CRUD unit conversions.
- CRUD product prices.
- CRUD product rack locations.
- Map supplier products.

### 2.6 Build supplier API
- CRUD suppliers/PBF.
- Search suppliers.
- Map products usually purchased from each supplier.

### 2.7 Build unit conversion service
- Convert selling/purchase units into base units.
- Validate multipliers.
- Test example: 1 box = 10 strips, 1 strip = 10 tablets.

### 2.8 Build product UI
- Product list page.
- Create/edit product form.
- Product units section.
- Unit conversion section.
- Pricing section.
- Rack/location section.
- Default supplier section.

### 2.9 Build supplier UI
- Supplier list page.
- Create/edit supplier form.
- Supplier-product mapping.

---

## Task 3 — Inventory Ledger Core

### 3.1 Create inventory ledger schema
- Create table `stock_batches`.
- Create table `stock_movements`.
- Add movement types:
  - opening_stock
  - purchase_receive
  - sale
  - sale_return
  - purchase_return
  - stock_take_adjustment
  - mutation_in
  - mutation_out
  - expired_quarantine
  - destruction

### 3.2 Build stock posting service
- Inbound stock function.
- Outbound stock function.
- Stock adjustment function.
- All postings must run inside a database transaction.
- Update `stock_batches.qty_available_base_unit`.
- Insert `stock_movements`.
- Prevent negative stock.
- Prevent duplicate posting with an idempotency key.

### 3.3 Build FEFO service
- Fetch available batches by nearest expiry date.
- Skip batch expired/quarantine/destroyed.
- Allow deductions to be split across multiple batches.
- Return allocation preview.

### 3.4 Build stock query API
- API stock summary.
- API to list batches per product.
- Stock card API.
- API low stock.
- API near expired.

### 3.5 Build inventory UI
- Page stock summary.
- Product batch detail.
- Stock card page.
- Filter by outlet, warehouse, product, category, low stock, and near-expiry status.

---

## Task 4 — Opening Stock

### 4.1 Build opening stock API
- Input product, warehouse, batch number, expiry date, unit, quantity, and cost.
- Convert quantity to base unit.
- Create `stock_batches`.
- Create `stock_movements` with type `opening_stock`.

### 4.2 Build opening stock UI
- Opening stock input page.
- Multi-row item form.
- Product search.
- Unit select.
- Qty, batch, expiry, warehouse, HPP.
- Preview base unit.
- Submit/post.

### 4.3 Verify opening stock
- Stock summary increases.
- Stock card shows opening stock.
- Batch appears in product detail.

---

## Task 5 — Procurement: Defecta, PO, Goods Receipt

### 5.1 Build defecta schema and API
- Create table `defecta_items`.
- Generate suggestion from low stock.
- Manual create defecta.
- Status: suggested, reviewed, converted_to_po, ignored, fulfilled.

### 5.2 Build defecta UI
- Defecta page.
- List suggested item.
- Review/ignore item.
- Convert selected item to PO.

### 5.3 Build purchase order schema and API
- Create table `purchase_orders`.
- Create table `purchase_order_items`.
- Create/edit PO draft.
- Add item product, unit, qty, estimated price.
- Status: draft, sent, partially_received, received, cancelled.
- Support partial receive.

### 5.4 Build purchase order UI
- Page list PO.
- Form create/edit PO.
- Detail PO.
- Action receive PO.
- Progress qty ordered vs received.

### 5.5 Build goods receipt schema and API
- Create table `goods_receipts`.
- Create table `goods_receipt_items`.
- Input supplier, invoice no, tanggal terima, warehouse.
- Input item: product, unit, qty, purchase price, discount, tax, batch, expiry.
- Posting receipt creates `stock_batches` and `stock_movements` with type `purchase_receive`.

### 5.6 Build goods receipt UI
- Page list goods receipt.
- Form draft goods receipt.
- Item table.
- Post receipt.
- Detail receipt read-only setelah posted.

### 5.7 Build supplier invoice/payment
- Create table `supplier_invoices`.
- Create table `supplier_payments`.
- Invoice dibuat from goods receipt payable/tempo.
- Payment can full atau partial.
- Status invoice: unpaid, partial, paid, overdue.

### 5.8 Build supplier invoice/payment UI
- Page payable supplier.
- Detail invoice.
- Record payment modal.
- Filter overdue.

---

## Task 6 — Stock Control

### 6.1 Build stock take schema and API
- Create table `stock_opnames`.
- Create table `stock_opname_items`.
- Create stock take session.
- Snapshot system stock per batch.
- Input physical stock.
- Calculate the difference.
- Reason required for variance.
- Posting creates `stock_movements` with type `stock_take_adjustment`.

### 6.2 Build stock take UI
- Page list stock take.
- Wizard create stock take.
- Table: product, batch, expiry, system stock, physical stock, variance, reason.
- Post stock take.

### 6.3 Build stock mutation schema and API
- Create table `stock_mutations`.
- Create table `stock_mutation_items`.
- Create mutation draft.
- Select source warehouse and destination warehouse.
- Posting creates `mutation_out` and `mutation_in` movements.

### 6.4 Build stock mutation UI
- Page transfer stock.
- Form transfer.
- Product/batch selector.
- Post mutation.
- Detail movement result.

### 6.5 Build expired handling API
- Create table `expired_actions`.
- Query near expired: H-90, H-60, H-30, H-7.
- Action quarantine.
- Supplier return action.
- Action destruction.
- Destruction creates a `destruction` movement.

### 6.6 Build expired handling UI
- Page expired queue.
- Filter near expired/expired.
- Action modal: quarantine, return supplier, musnah.
- History action per batch.

---

## Task 7 — POS and Shift

### 7.1 Build shift schema and API
- Create table `shift_schedules`.
- Create table `shifts`.
- Open shift.
- Get active shift.
- Close shift.
- Calculate system cash from cash payments.
- Store physical cash and cash difference.

### 7.2 Build shift UI
- Modal buka shift.
- Panel active shift.
- Modal tutup shift.
- Show system cash, physical cash, and variance.

### 7.3 Build sales schema and API
- Create table `sales`.
- Create table `sale_items`.
- Create table `payments`.
- Create sale draft.
- Add/remove item.
- Product search/barcode search.
- Preview price.
- Preview FEFO allocation.
- Calculate subtotal, discount, tax, grand total.

### 7.4 Build post sale API
- Validasi active shift.
- Validasi stock available.
- Validasi payment.
- Allocate batch via FEFO.
- Create sale items with batch id.
- Create payment.
- Create movement `sale`.
- Mark sale as posted.
- Generate receipt payload.

### 7.5 Build POS UI
- Page POS.
- Product/barcode search.
- Cart item with unit, qty, price, discount.
- Stock indicator.
- Payment panel cash/QRIS/transfer.
- Post sale.
- Receipt preview/print.

### 7.6 Build sale return API
- Create table `sale_returns`.
- Create table `sale_return_items`.
- Search sale by receipt no.
- Select item to return.
- Wajib pilih disposition: available, quarantine, damaged, destroyed.
- Return posting creates movements only according to disposition.

### 7.7 Build sale return UI
- Page return sale.
- Search receipt.
- Select item.
- Choose disposition.
- Refund summary.
- Post return.

---

## Task 8 — Customer Management and Sales Notes

### 8.1 Build customer sales-note schema and API
- Create table `sale_notes`.
- Create table `sale_note_templates`.
- Create sale note.
- Add optional customer and notes.
- Add sales note templates.
- Link customer/sale note to sale.

### 8.2 Build sales note API
- Generate sales note payload from sale/customer.
- Fetch sales note template.
- Include pharmacy profile/footer.

### 8.3 Build customer sales-note UI
- Page customer notes.
- Form customer note.
- Select optional customer.
- Add product item.
- Add dosage instruction.
- Attach customer note to POS sale.

### 8.4 Build sales note print UI
- Preview sales note/usage guiandce.
- Print sales note/usage guiandce when needed.

---

## Task 9 — Purchase Returnn

### 9.1 Build purchase return API
- Create table `purchase_returns`.
- Create table `purchase_return_items`.
- Create return from goods receipt/supplier/batch.
- Validasi stock available.
- Posting creates a `purchase_return` movement.
- Update invoice/refund note if needed.

### 9.2 Build purchase return UI
- Page return supplier.
- Form create return.
- Select supplier/goods receipt.
- Select product batch and qty.
- Post return.

---

## Task 10 — Reports

### 10.1 Build sales report API
- Sales harian.
- Sales per cashier.
- Sales per shift.
- Sales per product/category/supplier.
- Payment method summary.
- Return sale summary.

### 10.2 Build sales report UI
- Page sales report.
- Date range filter.
- Summary cards.
- Table sales by product.
- Table sales by cashier.
- Table payment method.

### 10.3 Build stock report API
- Current stock.
- Low stock.
- Near expired.
- Expired.
- Stock card.
- Stock valuation by HPP.
- Stock Tato variance.

### 10.4 Build stock report UI
- Page stock report.
- Current stock table.
- Low stock tab.
- Near expired tab.
- Stock valuation summary.

### 10.5 Build purchase report API
- Purchase by supplier.
- Outstanding PO.
- Partial receiving.
- Supplier debt.
- Purchase return summary.

### 10.6 Build purchase report UI
- Page purchase report.
- Supplier summary.
- Outstanding PO table.
- Supplier debt aging.

### 10.7 Build performance report API
- Top selling product.
- Slow moving product.
- Dead stock.
- Gross profit estimate.
- Margin per item.
- Pareto A/B/C.
- Stock turnover.

### 10.8 Build performance report UI
- Page performance report.
- Top selling table.
- Slow/dead stock table.
- Gross profit cards.
- Pareto list/chart.

---

## Task 11 — Dashboard

### 11.1 Build owner dashboard API
- Omzet hari ini.
- Gross profit estimate.
- Jumlah transaksi.
- Top products.
- Stock kritis.
- Near expired.
- Payable jatuh tempo.
- Selisih kas shift.

### 11.2 Build cashier dashboard API
- Active shift.
- Transaksi hari ini.
- Shortcut POS.
- Return pending.
- Quick stock search.

### 11.3 Build admin/pharmacyer dashboard API
- Resep hari ini.
- Near expired.
- Pending stock take.
- Defecta list.

### 11.4 Build warehouse dashboard API
- Goods entered into hari ini.
- PO pending receive.
- Transfer pending.
- Stock habis.
- Expired queue.

### 11.5 Build dashboard UI by role
- Owner dashboard.
- Cashier dashboard.
- Admin/pharmacyer dashboard.
- Warehouse dashboard.
- Redirect user to the dashboard based on role.

---

## Task 12 — Audit Trail and Data Safety

### 12.1 Build audit log schema and service
- Create table `audit_logs`.
- Create audit service.
- Store actor, action, entity type, entity ID, before snapshot, after snapshot, and timestamp.

### 12.2 Add audit log to important actions
- Product create/update/delete.
- Price update.
- Stock posting.
- Goods receipt post.
- Sale post/cancel.
- Returnn post.
- Stock Tato post.
- Mutation post.
- Shift open/close.
- Config update.
- User/role update.

### 12.3 Build audit log UI
- Page audit logs.
- Filter actor.
- Filter action.
- Filter entity.
- Filter date range.
- Detail before/after.

### 12.4 Build cancellation/reversal rules
- Posted sale cannot diedit langsung.
- Cancel sale must reversal movement.
- Posted goods receipt cannot diedit langsung.
- Posted stock take cannot be edited directly.
- Posted mutation cannot diedit langsung.

### 12.5 Add domain integrity tests
- Test stock tidak minus.
- Test duplicate posting tidak double movement.
- Test FEFO allocation.
- Test unit conversion.
- Test goods receipt creates batch and movement.
- Test sale reduces correct batch.
- Test return disposition.
- Test stock take adjustment.

---

## Task 13 — Import, Export, Print, Polish

### 13.1 Build CSV import API
- Import product preview.
- Import supplier preview.
- Row-level validation errors.
- Confirm import.

### 13.2 Build CSV import UI
- Upload CSV.
- Preview data.
- Show validation error per row.
- Confirm import.

### 13.3 Build export API
- Export product CSV.
- Export stock CSV.
- Export sales report CSV.
- Export purchase report CSV.

### 13.4 Build export UI
- Export button di list product.
- Export button di stock report.
- Export button di sales report.
- Export button di purchase report.

### 13.5 Build print layouts
- Print receipt.
- Print sales note/usage guiandce when needed.
- Print PO.
- Print goods receipt.

### 13.6 Polish UX
- Loading state.
- Error state.
- Empty state.
- Confirm destructive actions.
- Keyboard shortcut POS.
- Responsive layout.

### 13.7 Add observability basics
- Request ID.
- Structured logs.
- Error logging.
- Backup checklist.
- Staging seed reset.

---

## Task 14 — End-to-End Product Verification

### 14.1 Verify master data flow
- Login admin.
- Create supplier.
- Create product.
- Add units: tablet, strip, box.
- Add conversion.
- Add price.

### 14.2 Verify inventory flow
- Input opening stock.
- Check stock summary.
- Check batch detail.
- Check stock card.

### 14.3 Verify procurement flow
- Generate defecta.
- Convert defecta to PO.
- Receive PO partially.
- Receive remaining PO.
- Check supplier invoice.
- Record supplier payment.

### 14.4 Verify stock control flow
- Run stock take.
- Post adjustment.
- Run stock mutation.
- Quarantine near expired batch.
- Destroy expired batch.

### 14.5 Verify POS flow
- Login cashier.
- Open shift.
- Search product.
- Add item to cart.
- Post sale.
- Print receipt.
- Check stock decreased via FEFO.
- Returnn sale item with disposition.
- Close shift.

### 14.6 Verify customer note flow
- Create customer.
- Create customer group.
- Create sale note.
- Attach customer note to POS sale.
- Print sales note/usage guiandce when needed.

### 14.7 Verify reports and dashboard
- Owner dashboard shows sales today.
- Stock report shows current stock and valuation.
- Sales report shows POS transaction.
- Purchase report shows supplier debt.
- Performance report shows top selling item.

### 14.8 Verify audit trail
- Check product update log.
- Check price update log.
- Check stock movement log.
- Check sale post log.
- Check shift close log.

### 14.9 Final production readiness check
- All tests pass.
- Build passes.
- Migration works on fresh database.
- Seed works.
- Demo flow works end-to-end.
- Backup checklist exists.
- No stock mutation happens outside stock posting service.

---

## MVP Demo Path

Kalau butuh versi paling cepat yang tetap benar:

1. Setup app.
2. Login.
3. Create product + unit conversion.
4. Input opening stock.
5. Show stock card.
6. Open shift.
7. Sell product via POS.
8. Stock decreases from correct batch.
9. Close shift.
10. Owner dashboard shows sales and remaining stock.

---

## Product Done Criteria

Product dianggap jadi kalau:

- User can login berdasarkan role.
- Admin can kelola master data pharmacy.
- Admin can kelola product, unit, price, supplier.
- Stock can entered into lewat opening stock and goods receipt.
- All stock changes go into the ledger.
- Stock card can diaudit.
- Defecta and PO can diuse for procurement.
- Stock stock take, transfer, expired handling berjalan.
- Cashier can jualan lewat POS.
- Shift cashier can buka/tutup.
- Return sale and return supplier berjalan.
- Customer opsional and sales note/usage guiandce can dibuat.
- Owner can view reports and dashboard.
- Audit trail tersedia for action penting.
- Import/export and print basic tersedia.
- End-to-end demo path berhasil without data manual di database.
