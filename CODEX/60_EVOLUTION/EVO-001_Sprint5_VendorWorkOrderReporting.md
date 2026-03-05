---
id: EVO-001
title: "Sprint 5: Vendor Management, Work Orders CRUD & Portfolio Reporting"
type: evolution
status: PROPOSED
owner: "Architect"
agents: [all]
tags: [sprint, vendors, work-orders, crud, reporting, firestore]
related: [SPR-004, BLU-002]
created: "2026-03-05"
updated: "2026-03-05"
version: "1.0.0"
---

> **BLUF:** Sprint 5 promotes Vendors and Work Orders from scaffold placeholders to fully interactive CRUD modules backed by Firestore, adds a Tenant CRUD page, and introduces a Portfolio Reporting dashboard with revenue breakdowns, occupancy trends, and maintenance cost tracking.

## Sprint 5 — Scope

---

### 1. Vendor Management CRUD

Build a complete vendor lifecycle management module.

#### Data Model: `Vendor`

| Field | Type | Description |
|:------|:-----|:------------|
| `id` | `string` | Firestore Document ID |
| `ownerId` | `string` | FK → `users.id` (data isolation) |
| `companyName` | `string` | Legal business name |
| `contactName` | `string` | Primary POC |
| `email` | `string` | Contact email |
| `phone` | `string` | Contact phone |
| `category` | `enum` | `plumbing` · `electrical` · `hvac` · `landscaping` · `general` · `roofing` · `painting` · `cleaning` · `other` |
| `licenseNumber` | `string?` | State license / contractor ID |
| `insuranceExpiry` | `Date?` | COI expiration date |
| `w9OnFile` | `boolean` | Whether W-9 has been received |
| `hourlyRate` | `number?` | Standard hourly rate (cents) |
| `notes` | `string?` | Free-form notes |
| `status` | `enum` | `active` · `inactive` · `suspended` |
| `rating` | `number?` | 1–5 star performance rating |
| `createdAt` | `Timestamp` | Auto-set |
| `updatedAt` | `Timestamp` | Auto-set |

#### UI Deliverables
- [ ] **Vendors List Page** (`/vendors`) — Data table with search/filter by category and status
- [ ] **Add Vendor Modal** — Form with all fields, validation on required fields
- [ ] **Edit Vendor** — Pre-populated modal, inline save
- [ ] **Delete Vendor** — Confirmation dialog before removal
- [ ] **Vendor Detail View** — Summary card showing contact info, license, insurance status, and linked work orders

#### API Layer
- [ ] `lib/api/vendors.ts` — `createVendor`, `getVendor`, `listVendorsByOwner`, `updateVendor`, `deleteVendor`
- [ ] Firestore security rules for `vendors` collection (owner-isolated)

---

### 2. Work Orders CRUD

Build a maintenance ticket pipeline from submission to resolution.

#### Data Model: `WorkOrder`

| Field | Type | Description |
|:------|:-----|:------------|
| `id` | `string` | Firestore Document ID |
| `ownerId` | `string` | FK → `users.id` |
| `propertyId` | `string` | FK → `properties.id` |
| `tenantId` | `string?` | FK → `tenants.id` (if tenant-submitted) |
| `vendorId` | `string?` | FK → `vendors.id` (assigned vendor) |
| `title` | `string` | Short description |
| `description` | `string` | Detailed issue description |
| `category` | `enum` | `plumbing` · `electrical` · `hvac` · `appliance` · `structural` · `pest` · `general` |
| `priority` | `enum` | `low` · `medium` · `high` · `emergency` |
| `status` | `enum` | `open` · `in-progress` · `on-hold` · `completed` · `cancelled` |
| `scheduledDate` | `Date?` | When the work is scheduled |
| `completedDate` | `Date?` | When the work was finished |
| `estimatedCost` | `number?` | Budget estimate (cents) |
| `actualCost` | `number?` | Final invoice amount (cents) |
| `photoUrls` | `string[]` | Cloud Storage URIs for issue photos |
| `notes` | `string?` | Internal notes / resolution summary |
| `createdAt` | `Timestamp` | Auto-set |
| `updatedAt` | `Timestamp` | Auto-set |

#### UI Deliverables
- [ ] **Work Orders List** (`/work-orders`) — Table with status pills, priority badges, filter by status/priority/property
- [ ] **Create Work Order Modal** — Property selector, category, priority, description, optional vendor assignment
- [ ] **Edit Work Order** — Update status, reassign vendor, add costs, add notes
- [ ] **Delete Work Order** — Confirmation dialog
- [ ] **Status Pipeline View** — Kanban-style columns: Open → In Progress → Completed (stretch goal)

#### API Layer
- [ ] `lib/api/work-orders.ts` — `createWorkOrder`, `getWorkOrder`, `listWorkOrdersByOwner`, `listWorkOrdersByProperty`, `updateWorkOrder`, `deleteWorkOrder`
- [ ] Firestore security rules for `work_orders` collection

---

### 3. Tenant Management CRUD

Wire existing Tenant model to a dedicated management page.

#### UI Deliverables
- [ ] **Tenants List** (`/tenants`) — Table showing name, property, lease dates, rent amount, status
- [ ] **Add Tenant Modal** — Property selector, lease details, contact info
- [ ] **Edit Tenant** — Update lease terms, contact info
- [ ] **Delete Tenant** — Confirmation dialog
- [ ] Add `Tenants` link to sidebar navigation

#### API Layer
- [ ] `lib/api/tenants.ts` — `createTenant`, `getTenant`, `listTenantsByOwner`, `listTenantsByProperty`, `updateTenant`, `deleteTenant`

---

### 4. Portfolio Reporting Dashboard

Replace the "Chart Component Pending" and "Ledger Component Pending" placeholders on the Dashboard with real visualizations.

#### Reports
- [ ] **Revenue Breakdown** — Bar chart showing monthly income by property (last 6 months)
- [ ] **Expense Breakdown** — Pie chart showing spend by category (maintenance, utilities, tax, other)
- [ ] **Occupancy Trend** — Line chart showing occupancy rate over time
- [ ] **Maintenance Summary** — Work orders by status (open/in-progress/completed), average resolution time
- [ ] **Vendor Spend** — Top 5 vendors by total cost across completed work orders

#### Implementation
- [ ] `components/reports/RevenueChart.tsx` — Uses seed data or Firestore aggregation
- [ ] `components/reports/ExpenseChart.tsx`
- [ ] `components/reports/OccupancyChart.tsx`
- [ ] `components/reports/MaintenanceSummary.tsx`
- [ ] `components/reports/VendorSpend.tsx`
- [ ] Chart library: lightweight client-side (e.g. `recharts` or pure SVG)

---

### 5. Infrastructure Updates

- [ ] Add `Vendor` and `WorkOrder` interfaces to `lib/models/types.ts`
- [ ] Update `CollectionName` type to include `vendors` and `work_orders`
- [ ] Add sidebar nav links for Tenants
- [ ] Seed data for all new collections for demo purposes
- [ ] Update Firestore security rules for new collections
- [ ] Build, deploy, and smoke test

---

## Acceptance Criteria

| # | Criterion | Verification |
|:--|:----------|:-------------|
| 1 | Vendor CRUD (Create, Read, Update, Delete) works end-to-end | Browser smoke test |
| 2 | Work Order CRUD works with status transitions | Browser smoke test |
| 3 | Tenant CRUD works with lease management | Browser smoke test |
| 4 | Dashboard charts render with seed data | Visual inspection |
| 5 | All pages accessible via sidebar navigation | Click-through test |
| 6 | Static export builds cleanly (`next build`) | CI/CD |
| 7 | Firebase Hosting deployment succeeds | Deploy log |

## Estimated Effort

| Component | Tasks | Estimate |
|:----------|:------|:---------|
| Vendor CRUD | Model + API + UI + Tests | 2–3 hours |
| Work Order CRUD | Model + API + UI + Tests | 2–3 hours |
| Tenant CRUD | API + UI (model exists) | 1–2 hours |
| Reporting Dashboard | 5 chart components + wiring | 2–3 hours |
| Infrastructure | Types, rules, sidebar, deploy | 1 hour |
| **Total** | | **8–12 hours** |
