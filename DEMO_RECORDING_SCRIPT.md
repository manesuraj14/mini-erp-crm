# 🎙️ Video Demo Recording Script & Walkthrough Guide
## Project: Mini ERP + CRM Operations Portal
**Target Video Length:** 5 to 7 Minutes  
**Recommended Recording Tools:** [Loom](https://www.loom.com) (Free, instant shareable link) or **OBS Studio** or **Windows Game Bar** (`Win + G`).

---

## 📋 Pre-Recording Checklist (2 Minutes Before Recording)

1. **Start Backend Server:**
   ```powershell
   cd D:\ERP_Project\backend
   npm run dev
   ```
   *(Verify it displays `🚀 Mini ERP + CRM Backend API Running on port 5000`)*

2. **Start Frontend Client:**
   ```powershell
   cd D:\ERP_Project\frontend
   npm run dev
   ```
   *(Open `http://localhost:5173` in Google Chrome or Edge)*

3. **Browser Setup:**
   - Maximize browser window (`F11` or full screen).
   - Keep `http://localhost:5173/login` ready on Tab 1.
   - Keep your GitHub repository `https://github.com/manesuraj14/mini-erp-crm` ready on Tab 2.
   - Keep VS Code open in background showing `D:\ERP_Project`.

---

## 🎬 Step-by-Step Recording Script (Click-by-Click)

---

### Segment 1: Introduction & Tech Stack (0:00 – 0:45)

#### 🖥️ What to show on screen:
Start on the **Login Page** (`http://localhost:5173/login`).

#### 🗣️ What to say:
> *"Hello everyone! My name is Suraj Mane, and today I am excited to present my submission for the Full Stack Developer Case Study: the **Mini ERP and CRM Operations Portal**.*
>
> *This portal is designed for a wholesale and distribution business to streamline daily operational workflows across four core departments: **Sales**, **Warehouse**, **Accounts**, and **Admin**.*
>
> *For the tech stack: On the backend, I built a robust REST API using **Node.js, Express, TypeScript, and Prisma ORM** connected to a **MySQL** database. On the frontend, I developed a clean, responsive admin dashboard using **React 19, TypeScript, Vite, and Tailwind CSS**.*
>
> *Let’s dive straight into the live application."*

---

### Segment 2: Authentication & Role-Based Access Control (0:45 – 1:30)

#### 🖥️ What to show on screen:
1. Hover over the **1-Click Demo Logins** box on the login screen.
2. Click on the **ADMIN** quick login button $\rightarrow$ Portal dashboard opens.
3. Point to the top navbar where it says **"Active Role: ADMIN"**.
4. Click the **Active Role** dropdown in the navbar and show the 4 roles with their descriptions:
   - Admin (Full Access)
   - Sales (CRM & Challans)
   - Warehouse (Inventory & Stock Logs)
   - Accounts (Invoices & Ledgers)

#### 🗣️ What to say:
> *"To make evaluation fast and seamless, I implemented both standard JWT authentication and convenient one-click demo login buttons for all four required roles.*
>
> *Let's log in as the **Administrator**. As you can see, the dashboard gives an instant operational overview: total active clients, real-time stock alert counters, sales challan statuses, and total invoiced revenue.*
>
> *Notice in the top navigation bar, I have included a live **Role Switcher**. When we switch between roles, the sidebar dynamically filters the modules to enforce strict Role-Based Access Control. Admin has full system access, Sales focuses on CRM and Challans, Warehouse manages inventory, and Accounts handles invoicing."*

---

### Segment 3: Customer CRM Module (1:30 – 2:45)

#### 🖥️ What to show on screen:
1. Click **Customer CRM** in the sidebar.
2. Type `Apollo` in the search bar $\rightarrow$ Show instant debounced search filtering.
3. Click the status dropdown and filter by **Active** and **Lead**.
4. Click the blue **"Add Customer"** button $\rightarrow$ Add Customer modal opens.
5. Fill in sample details:
   - Customer Name: `Apex Healthcare Hub`
   - Business Name: `Apex Pharma Solutions`
   - Mobile: `+91 98877 66554`
   - Email: `orders@apexpharma.com`
   - Type: `WHOLESALE`
   - Status: `ACTIVE`
   - Address: `MG Road, Pune, Maharashtra 411001`
6. Click **"Create Customer"** $\rightarrow$ Show it appears immediately in the table.
7. Click the **Eye icon** on any customer row $\rightarrow$ Customer Detail Drawer opens.
8. Scroll down to the **"Follow-up Notes & Interactions"** section.
9. Type: `Customer requested sample shipment of surgical gloves. Follow-up scheduled for next Tuesday.`
10. Click **"Log"** $\rightarrow$ Show the note added with your name and real-time timestamp.

#### 🗣️ What to say:
> *"Now let's explore the **Customer CRM Module**.*
>
> *The table displays customer contact details, business entity, GSTIN, customer type—such as Retail, Wholesale, or Distributor—and current lead status.*
>
> *We have real-time search across names, phone numbers, and emails, along with multi-parameter filter chips.*
>
> *Let’s create a new customer... [Fill form and submit]. It is instantly saved into our MySQL database.*
>
> *Next, let's open the Customer Detail Drawer. Here we have a dedicated **Follow-up Timeline**. Sales team members can log call summaries and meeting outcomes. Each note is saved with the operator’s name and an immutable timestamp, giving the company a complete interaction history."*

---

### Segment 4: Product & Inventory Module (2:45 – 4:00)

#### 🖥️ What to show on screen:
1. Click **Inventory & Stock** in the sidebar.
2. Point out the color-coded stock badges:
   - Red: `OUT OF STOCK`
   - Amber: `LOW STOCK ALERT` (e.g. Amoxicillin, Azithromycin)
   - Green: `Healthy`
3. Check the checkbox: **"Low Stock Alerts Only"** $\rightarrow$ Only critical items are displayed.
4. Uncheck it.
5. Click the **"Adjust Stock"** button on `Amoxicillin 250mg`.
6. Select **Stock IN (Receipt / Restock)**.
7. Enter Quantity: `30`, Reason: `Supplier batch delivery #PO-2026-92`.
8. Click **"Confirm Adjustment"** $\rightarrow$ Stock increases from 18 to 48 and badge turns green/healthy!
9. Click the **Clock/History icon** on that product $\rightarrow$ Show the audit trail modal displaying the inward restock.

#### 🗣️ What to say:
> *"Next is the **Product & Inventory Module**.*
>
> *Warehouse managers can track current stock levels, warehouse locations, and minimum threshold alert buffers.*
>
> *The system features visual stock badges: Green for healthy inventory, Amber for Low Stock Warnings, and Red for Out of Stock.*
>
> *We can toggle 'Low Stock Alerts Only' to immediately identify SKUs that need replenishment.*
>
> *Let's perform a stock adjustment for Amoxicillin... We will log a Stock IN movement of 30 units with a supplier batch reference. When confirmed, the inventory updates instantly, and an immutable entry is added to our Stock Movement Audit Trail."*

---

### Segment 5: Sales Challan Module & Crucial Business Logic (4:00 – 5:30)

> [!IMPORTANT]
> **This is the most critical section for evaluation! Emphasize the two key business rules:**
> 1. Product Snapshot Preservation
> 2. Atomic Stock Reduction & Negative Stock Prevention

#### 🖥️ What to show on screen:
1. Click **Sales Challans** in the sidebar.
2. Show the existing orders table with status badges (`CONFIRMED`, `DRAFT`).
3. Click **"Create Sales Challan"** button.
4. Select customer: `Apollo Healthcare Stores`.
5. Select a product: e.g. `Paracetamol 500mg`.
6. **DEMONSTRATE NEGATIVE STOCK PREVENTION:**
   - Put quantity: `999` (higher than available stock).
   - Click **"Confirm & Deduct Stock"**.
   - Show the error message banner:
     `"Insufficient stock for Paracetamol 500mg. Available: 450, Requested: 999. Stock cannot go negative!"`
7. Change the quantity to a valid number: `10`.
8. Click **"Add Product Row"** $\rightarrow$ Add `Omeprazole 20mg`, Quantity: `5`.
9. Point to the order calculation bar: Total line items, total quantity, and net amount.
10. Click **"Confirm & Deduct Stock"** $\rightarrow$ Order is created as `CONFIRMED`.
11. The **Challan View / Tax Invoice modal** automatically opens:
    - Point to the **Challan Number** (e.g. `CH-202609-0004`).
    - Point to the **Snapshot Items Table**: Highlight that unit prices and SKUs are **snapshot copies**.
    - Click **"Print / Export PDF"** button $\rightarrow$ Browser print preview opens formatted as a professional delivery challan / tax invoice! (Click cancel to return).
12. Quickly click **Inventory & Stock** in sidebar $\rightarrow$ Show Paracetamol stock dropped by exactly 10 units!

#### 🗣️ What to say:
> *"Now let's examine the heart of the system: the **Sales Challan Module**.*
>
> *Let’s click 'Create Sales Challan'. The system automatically generates a sequential order number.*
>
> *First, let's test our core business constraint: **Negative Stock Prevention**. If a sales representative attempts to order 999 units when only 450 are available... [Click Confirm] ...our backend transaction rejects the request with HTTP 400 Bad Request and rolls back, ensuring stock never goes negative.*
>
> *Now let's enter a valid quantity of 10 units and add a second product line item. When I click 'Confirm & Deduct Stock', the backend executes an **ACID transaction**: it decrements warehouse stock, logs an OUT stock movement, and confirms the order.*
>
> *Here in the invoice view, notice the **Product Snapshot Preservation**. The product name, SKU, and unit price are permanently snapshotted at the exact time of order. If an administrator later updates catalog prices, this historical invoice remains 100% immutable.*
>
> *We can also click 'Print / Export PDF' to generate a delivery challan ready for dispatch.*
>
> *And if we switch to the Inventory page, you can see that the stock was reduced by exactly 10 units in real-time."*

---

### Segment 6: Codebase, Docker & Postman (5:30 – 6:30)

#### 🖥️ What to show on screen:
1. Switch to **VS Code** (or your **GitHub Repository** tab: `https://github.com/manesuraj14/mini-erp-crm`).
2. Show:
   - `backend/prisma/schema.prisma` (clean relational models).
   - `backend/src/controllers/challan.controller.ts` (highlight the `prisma.$transaction`).
   - `docker-compose.yml` (multi-container setup).
   - `postman_collection.json`.
   - `.github/workflows/ci.yml` (CI pipeline).
   - `README.md` (detailed documentation).

#### 🗣️ What to say:
> *"Behind the scenes, the codebase is cleanly architected:*
> - *The database is structured in Prisma with full relational integrity and seeded test accounts.*
> - *Our challan confirmation logic runs in an atomic Prisma transaction to prevent race conditions.*
> - *For deployment, I have included a **docker-compose.yml** that boots MySQL, the backend API, and the React frontend in one command.*
> - *I have also provided a complete **Postman v2.1 collection** with automated Bearer token passing, a **GitHub Actions CI/CD workflow**, and comprehensive setup documentation in the **README.md**."*

---

### Segment 7: Conclusion & Wrap-up (6:30 – 7:00)

#### 🖥️ What to show on screen:
Return to the browser showing the GitHub repository or the Dashboard.

#### 🗣️ What to say:
> *"To summarize: We have implemented all four core modules—Authentication with RBAC, Customer CRM with follow-up history, Product Inventory with low-stock alerts, and Sales Challans with atomic stock reduction and price snapshots—plus bonus containerization and CI/CD.*
>
> *The code is pushed and publicly accessible on my GitHub at `github.com/manesuraj14/mini-erp-crm`.*
>
> *Thank you very much for reviewing my case study submission!"*

---

## 💡 Top Tips for a Flawless Recording
1. **Speak at a steady, confident pace.** Don't rush.
2. **Move your mouse smoothly.** Hover for 1 second over buttons before clicking so viewers can follow easily.
3. **If you make a small speaking mistake, just pause for 2 seconds and repeat that sentence.** You don't need to restart the entire recording.
4. **Free Recording Option:** If using **Loom** (loom.com), it records your screen and mic simultaneously and gives you a shareable link immediately upon finishing!
