# Walkthrough: Subtask 1 - Frontend Architecture & Admin Shell

**Status:** Completed  
**Location:** `D:\ERP_Project\frontend`  
**Tech Stack:** React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + Lucide Icons + React Router 7  

---

## 🎯 What Was Built

### 1. Enterprise Admin Portal Shell
- **Responsive Admin Layout (`src/components/Layout.tsx`):**
  - Collapsible sidebar with role-aware navigation.
  - Sticky top navbar with profile badge, quick sign-out, and a **Role Switcher Dropdown** that enables reviewers to switch between **Admin**, **Sales**, **Warehouse**, and **Accounts** roles with 1 click.
- **Route Protection (`src/components/ProtectedRoute.tsx`):**
  - Enforces authentication and checks role authorization matrix with clean feedback cards.

### 2. Authentication & 1-Click Evaluation Mode (`src/pages/Login.tsx`)
- Standard credential inputs for custom users.
- **1-Click Quick Demo Login Buttons** for all 4 roles required by the specification:
  - **Admin**: `admin@minierp.com` (Full system access)
  - **Sales**: `sales@minierp.com` (Customer CRM & Challans)
  - **Warehouse**: `warehouse@minierp.com` (Inventory & Stock Logs)
  - **Accounts**: `accounts@minierp.com` (Invoices, Customers, Challans)

### 3. Customer CRM Module (`src/pages/Customers.tsx`)
- **Fields:** Customer Name, Mobile, Email, Business Name, GSTIN, Customer Type (`Retail`, `Wholesale`, `Distributor`), Address, Status (`Lead`, `Active`, `Inactive`), Follow-up Date, Notes.
- **Interactive Capabilities:**
  - Multi-parameter search (Name, Phone, Email, Business).
  - Status & Type filter chips.
  - Add Customer & Edit Customer modals with full field validation.
  - **Customer Detail Drawer:** Displays complete customer dossier alongside an **Interactive Follow-up Notes Timeline** where users can log timestamped sales notes with operator attribution.

### 4. Product & Inventory Module (`src/pages/Products.tsx`)
- **Fields:** Name, SKU, Category, Unit Price, Current Stock, Minimum Stock Alert Buffer, Location / Warehouse Bay.
- **Stock Alert Engine:**
  - Red badge for `OUT OF STOCK` (0 units).
  - Amber badge with warning icon for `LOW STOCK ALERT` (`currentStock <= minStockAlert`).
  - Green badge for healthy buffer.
  - "Low Stock Alerts Only" filter toggle.
- **Inventory Actions:**
  - Add / Edit product details.
  - **Stock Adjustment Modal (IN / OUT):** Adjust stock with reason tracking, preventing negative inventory.
  - **Stock Movement Log Modal:** Audits all inward/outward events for each SKU.

### 5. Sales Challan Studio (`src/pages/Challans.tsx`)
- **Auto Numbering:** Automatic generation of sequence codes (e.g. `CH-202609-0001`).
- **Dynamic Line Items:** Add/remove items with live stock indicator and unit pricing.
- **Crucial Business Logic:**
  - **Atomic Stock Validation:** Validates that requested quantity does not exceed current warehouse stock. If insufficient, blocks confirmation with a clear error.
  - **Product Snapshot Preservation:** Locks `snapshotProductName`, `snapshotSku`, `snapshotUnitPrice`, and `subtotal` into the order record so future catalog price updates never alter historical bills.
  - **Draft vs. Confirmed Actions:** Save as draft for later review, or confirm immediately to deduct warehouse stock and record `OUT` stock movement logs.
  - **Printable Tax Invoice / Delivery Challan:** Formatted printable invoice sheet with company GSTIN, bill-to address, snapshot items table, and print dialog integration.

### 6. Stock Movement Audit Trail (`src/pages/StockLogs.tsx`)
- Dedicated audit screen logging all movements (`IN` or `OUT`), quantity changed, reason, author, and timestamp.

---

## 🧪 Verification & Build Results

Production build executed via `tsc -b && vite build`:
```text
✓ 1871 modules transformed.
dist/index.html                   0.45 kB │ gzip:   0.29 kB
dist/assets/index-DNBipZwN.css   40.39 kB │ gzip:   7.44 kB
dist/assets/index-CnebZ3BY.js   365.02 kB │ gzip: 103.20 kB
✓ built in 1.27s
```

All components build with **0 errors and 0 warnings**.

---

## ⏭️ Next Subtask
**Subtask 2: Backend REST API & Database Setup**  
- Initialize Express + TypeScript server in `D:\ERP_Project\backend`.
- Configure Prisma schema with MySQL/PostgreSQL.
- Implement seed script with hashed passwords for all 4 roles.
- Set up JWT authentication and RBAC middleware.
