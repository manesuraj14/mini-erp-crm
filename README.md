# 🏢 Mini ERP + CRM Operations Portal
> A lightweight, production-ready Wholesale & Distribution Operations Management System built with **React 19**, **Node.js 22**, **TypeScript**, **Express 5**, **Prisma ORM**, and **MySQL / PostgreSQL**.

---

## 🌟 Executive Summary & Submission Overview

This project was developed for the **Full Stack Developer Case Study (Mini ERP + CRM Operations Portal)**. It coordinates operations across 4 core business departments: **Sales**, **Warehouse**, **Accounts**, and **Admin**.

### 🔗 Submission Details
- **Frontend Live URL:** *(Deployable to Vercel / Netlify)*
- **Backend API Live URL:** *(Deployable to Render / Railway / AWS EC2)*
- **GitHub Repository:** *(Your GitHub Repository URL)*
- **Postman Collection:** [`postman_collection.json`](./postman_collection.json)

---

## 🔑 Test Login Credentials (All 4 Roles)

The system enforces strict Role-Based Access Control (RBAC). You can log in using any of the following accounts or use the **1-Click Quick Demo Login** buttons on the login page:

| Role | Email | Password | Permissions & Dashboard Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@minierp.com` | `Admin@123` | Full access across all modules, configuration, and audit logs |
| **Sales** | `sales@minierp.com` | `Sales@123` | Customer CRM, lead follow-ups, draft/confirmed sales challans |
| **Warehouse** | `warehouse@minierp.com` | `Warehouse@123` | Products, inventory levels, stock IN/OUT adjustments, movement logs |
| **Accounts** | `accounts@minierp.com` | `Accounts@123` | Challan verification, invoice generation, customer history review |

---

## 🏗️ Architecture & Business Logic Highlights

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 19 + TypeScript + Vite 8 + Tailwind 4)"]
        UI[Admin Dashboard UI]
        AuthContext[Auth Context / Role Switcher]
        Services[Axios API Client + JWT Interceptors]
    end

    subgraph Server ["Backend (Node.js 22 + Express 5 + TypeScript)"]
        AuthMW[JWT & RBAC Middleware]
        Validation[Zod Request Validation]
        Controllers[Modular REST Controllers]
        Transactions[ACID Stock Deduction Engine]
    end

    subgraph Database ["Database Layer"]
        Prisma[Prisma ORM 5.22]
        MySQL[(MySQL 9.5 / PostgreSQL)]
    end

    Client -->|HTTPS REST API| AuthMW
    AuthMW --> Validation --> Controllers --> Transactions
    Transactions -->|Atomic Commit| Prisma --> MySQL
```

### 1. Product Snapshot Preservation (Core Requirement)
In wholesale distribution, catalog prices fluctuate over time. Historical delivery challans and tax invoices must remain immutable.  
- Each `ChallanItem` locks **`snapshotProductName`**, **`snapshotSku`**, and **`snapshotUnitPrice`** at the exact time of order placement.
- Even if a product's price is subsequently updated in the catalog, historical challan records and totals remain 100% accurate.

### 2. Atomic Stock Decrement & Negative Stock Prevention
When a Sales Challan is confirmed (`status: CONFIRMED`):
1. Runs inside an **ACID database transaction** (`prisma.$transaction`).
2. Validates that `currentStock >= requested_quantity` for every item.
3. If stock is insufficient, the transaction immediately rolls back and returns **HTTP 400 Bad Request** with a descriptive message (e.g. `Insufficient stock for "Amoxicillin". Available: 18, Requested: 50. Stock cannot go negative!`).
4. Atomically decrements the inventory level for each line item.
5. Automatically creates a `StockMovementLog` record of type `OUT` with reason `Sales Challan Confirmation #CH-XXXX` attributed to the logged-in sales user.

---

## 🚀 How to Run the Project Locally

### Prerequisites
- **Node.js:** v18 or higher (v22 recommended)
- **Database:** MySQL 8.0+ / 9.5+ running locally on port `3306` (or Docker)

---

### Option A: Manual Setup (Recommended for Development)

#### 1. Backend Setup:
```bash
cd backend
npm install

# Configure environment in backend/.env:
# DATABASE_URL="mysql://root:root@localhost:3306/erp_db"
# PORT=5000
# JWT_SECRET="mini_erp_crm_super_secure_jwt_secret_key_2026"

# Push schema to MySQL database and seed test accounts:
npx prisma db push
npx prisma db seed

# Start development server:
npm run dev
```
Backend API will start at **`http://localhost:5000`** with health check at `http://localhost:5000/api/health`.

#### 2. Frontend Setup:
```bash
cd ../frontend
npm install

# Start Vite dev server:
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

### Option B: Docker Compose (1-Click Startup)

If you have Docker installed:
```bash
docker-compose up --build
```
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000`
- **MySQL:** `localhost:3306`

---

## ☁️ Deployment Guide

### 1. Free-Tier Deployment (Vercel + Render + Neon)

#### Backend Deployment on Render:
1. Create a new Web Service on [Render.com](https://render.com) connected to your GitHub repo.
2. Root Directory: `backend`
3. Build Command: `npm install && npx prisma generate && npm run build`
4. Start Command: `npm start`
5. Environment Variables:
   - `DATABASE_URL`: Your cloud PostgreSQL (Neon.tech / Supabase) or cloud MySQL URL
   - `JWT_SECRET`: Secure 32+ character random string
   - `PORT`: `5000`
   - `CLIENT_URL`: `https://your-app.vercel.app`

#### Frontend Deployment on Vercel:
1. Import the project on [Vercel.com](https://vercel.com).
2. Root Directory: `frontend`
3. Framework Preset: `Vite`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variable:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`

---

### 2. AWS Deployment (EC2 + RDS + S3)
1. **EC2 (t2.micro - Free Tier):** Deploy Node.js server via PM2 behind an Nginx reverse proxy forwarding port 80 to `http://localhost:5000`.
2. **RDS (db.t3.micro - Free Tier):** Managed MySQL / PostgreSQL in a private VPC with security group access on port 3306/5432.
3. **AWS S3 + CloudFront:** Static SPA hosting with global HTTPS edge delivery.

---

## 📁 Repository Structure

```text
D:\ERP_Project/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema definition
│   │   └── seed.ts             # Pre-seeded users, products, customers
│   ├── src/
│   │   ├── config/prisma.ts    # Singleton Prisma client
│   │   ├── controllers/        # Auth, Customer, Product, Challan handlers
│   │   ├── middlewares/        # JWT auth, RBAC guard, Zod validation
│   │   ├── routes/             # REST API endpoint definitions
│   │   └── index.ts            # Express server entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Layout, Navbar, Sidebar, ProtectedRoute
│   │   ├── context/            # AuthContext (with 1-click role switcher), DataContext
│   │   ├── pages/              # Dashboard, Customers, Products, Challans, StockLogs
│   │   ├── services/api.ts     # Axios REST client with JWT interceptor
│   │   └── types/              # TypeScript models
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── .github/workflows/ci.yml     # Automated build & test pipeline
├── docker-compose.yml           # Multi-container orchestration
├── postman_collection.json      # Complete Postman v2.1 test suite
└── README.md
```

---

## 📌 Assumptions & Known Limitations

1. **Tax Rates & Currency:** Currency defaults to Indian Rupee (INR / ₹) with standard 2-decimal formatting suitable for wholesale operations.
2. **Inventory Locks:** Concurrency is handled through ACID database transactions. For enterprise scale with thousands of simultaneous checkouts per second, a distributed Redis lock can be added in v2.
3. **GSTIN Validation:** Input allows 15-character alphanumeric GSTIN format; live government GST portal validation API is treated as a v2 feature.

---

*Project developed and verified for Full Stack Developer Case Study.*