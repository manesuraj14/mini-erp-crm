# Walkthrough: Subtask 2 - Backend REST API & Database (Prisma + MySQL)

**Status:** Completed & Fully Verified  
**Location:** `D:\ERP_Project\backend`  
**Tech Stack:** Node.js 22 + Express 5 + TypeScript + Prisma ORM 5.22 + MySQL 9.5 + Zod + JWT + Bcrypt  

---

## 🎯 What Was Built

### 1. Database Schema & Data Modeling (`prisma/schema.prisma`)
- Synchronized with local MySQL database `erp_db`:
  - `User`: Roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`), Bcrypt password hashes, active status.
  - `Customer`: Full CRM fields (`customerName`, `mobileNumber`, `email`, `businessName`, `gstNumber`, `customerType`, `address`, `status`, `followUpDate`, `notes`).
  - `CustomerNote`: Timestamped follow-up note history linked to customer and author.
  - `Product`: Catalog attributes (`name`, `sku`, `category`, `unitPrice`, `currentStock`, `minStockAlert`, `locationWarehouse`).
  - `StockMovementLog`: Audits inward/outward adjustments (`productId`, `quantityChanged`, `movementType`, `reason`, `createdById`, `createdAt`).
  - `Challan`: Auto-sequenced orders (`challanNumber`, `customerId`, `totalQuantity`, `totalAmount`, `status`, `createdById`, `confirmedAt`).
  - `ChallanItem`: Stores **immutable product snapshot fields** (`snapshotProductName`, `snapshotSku`, `snapshotUnitPrice`, `quantity`, `subtotal`).

### 2. Database Seed Script (`prisma/seed.ts`)
- Pre-seeded 4 system users with hashed passwords:
  - **Admin**: `admin@minierp.com` / `Admin@123`
  - **Sales**: `sales@minierp.com` / `Sales@123`
  - **Warehouse**: `warehouse@minierp.com` / `Warehouse@123`
  - **Accounts**: `accounts@minierp.com` / `Accounts@123`
- Pre-seeded 6 products (including healthy, low-stock, and out-of-stock items).
- Pre-seeded 3 customers across wholesale, distributor, and retail channels.
- Pre-seeded initial challans (Confirmed and Draft).

### 3. Core REST API Endpoints & RBAC Matrix
| Endpoint | Method | Allowed Roles | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/login` | POST | Public | Validates credentials, returns JWT & user profile |
| `/api/auth/me` | GET | Authenticated | Returns current user session info |
| `/api/customers` | GET | Admin, Sales, Accounts | Paginated & multi-field search (`name`, `email`, `phone`, `business`) |
| `/api/customers/:id` | GET | Admin, Sales, Accounts | Returns customer profile + follow-up notes + past challans |
| `/api/customers` | POST | Admin, Sales | Zod-validated customer creation |
| `/api/customers/:id` | PUT | Admin, Sales | Updates customer attributes |
| `/api/customers/:id/notes` | POST | Admin, Sales | Logs follow-up note with operator attribution |
| `/api/products` | GET | All Roles | Paginated product catalog with `lowStock=true` query |
| `/api/products/stock-logs` | GET | Admin, Warehouse, Accounts | Complete inventory movement audit trail |
| `/api/products` | POST | Admin, Warehouse | Creates new SKU in catalog |
| `/api/products/:id` | PUT | Admin, Warehouse | Updates product details |
| `/api/products/:id/stock-movement` | POST | Admin, Warehouse | Manual stock inward/outward adjustments with reason tracking |
| `/api/challans` | GET | Admin, Sales, Accounts | List sales challans with status filters |
| `/api/challans/:id` | GET | Admin, Sales, Accounts | Full order view with snapshot details |
| `/api/challans` | POST | Admin, Sales | Creates Draft or Confirmed Challan with snapshot locking |
| `/api/challans/:id/confirm` | PUT | Admin, Sales | Executes atomic stock reduction with negative stock prevention |
| `/api/challans/:id/cancel` | PUT | Admin, Sales | Cancels unconfirmed draft orders |

---

## 🧪 Automated Verification Test Suite (`test_api.js`)

An automated integration test script was executed against the live running backend API.

### Test Results:
```text
=============================================
🚀 Mini ERP + CRM Backend API Running
📡 URL: http://localhost:5000
🏥 Health Check: http://localhost:5000/api/health
=============================================

--- 1. Testing Sales Login ---
Status: 200 User Role: SALES

--- 2. Fetching Customers & Products ---
Customer: Dr. Sharma Clinic & Meds
Product: Amoxicillin 250mg Capsules (Box of 100) Stock: 18

--- 3. Testing Insufficient Stock Error (Negative Stock Prevention) ---
[API Error]: {
  statusCode: 400,
  message: 'Insufficient stock for "Amoxicillin 250mg Capsules (Box of 100)" (SKU: MED-AMOX-250). Available: 18, Requested: 518. Stock cannot go negative!'
}
Expected 400 Status: 400
Error Message: Insufficient stock for "Amoxicillin 250mg Capsules (Box of 100)" (SKU: MED-AMOX-250). Available: 18, Requested: 518. Stock cannot go negative!

--- 4. Testing Valid Challan Creation with Snapshot Data ---
Status: 201
Challan No: CH-202609-0003
Snapshot Items: [
  {
    name: 'Amoxicillin 250mg Capsules (Box of 100)',
    price: '240',
    qty: 2
  }
]

--- 5. Testing RBAC Guard (Sales blocked from Warehouse action) ---
Expected 403 Status: 403
RBAC Error: Access denied. Role SALES does not have required permissions: [ADMIN, WAREHOUSE]

✅ ALL BACKEND BUSINESS LOGIC TESTS PASSED!
```

---

## ⏭️ Next Subtask
**Subtask 3: Frontend-to-Backend Full Stack Integration**
- Configure Axios API service layer in `frontend/src/services/api.ts`.
- Connect React views (`Customers`, `Products`, `Challans`, `Dashboard`) to consume live backend REST APIs.
- Verify live cross-module transactions between React UI and MySQL database.
