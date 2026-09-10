import { PrismaClient, Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with test roles, catalog, and customers...');

  await prisma.challanItem.deleteMany({});
  await prisma.challan.deleteMany({});
  await prisma.stockMovementLog.deleteMany({});
  await prisma.customerNote.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Users with hashed passwords
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const salesHash = await bcrypt.hash('Sales@123', 10);
  const warehouseHash = await bcrypt.hash('Warehouse@123', 10);
  const accountsHash = await bcrypt.hash('Accounts@123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@minierp.com',
      passwordHash,
      name: 'System Administrator',
      role: Role.ADMIN,
    },
  });

  const sales = await prisma.user.create({
    data: {
      email: 'sales@minierp.com',
      passwordHash: salesHash,
      name: 'Sarah Jenkins (Sales)',
      role: Role.SALES,
    },
  });

  const warehouse = await prisma.user.create({
    data: {
      email: 'warehouse@minierp.com',
      passwordHash: warehouseHash,
      name: 'Mike Rodriguez (Warehouse)',
      role: Role.WAREHOUSE,
    },
  });

  const accounts = await prisma.user.create({
    data: {
      email: 'accounts@minierp.com',
      passwordHash: accountsHash,
      name: 'David Chen (Accounts)',
      role: Role.ACCOUNTS,
    },
  });

  console.log('Created 4 system users (Admin, Sales, Warehouse, Accounts)');

  // 2. Create Products
  const prod1 = await prisma.product.create({
    data: {
      name: 'Paracetamol 500mg (Strip of 10)',
      sku: 'MED-PARA-500',
      category: 'Analgesics',
      unitPrice: 18.50,
      currentStock: 450,
      minStockAlert: 100,
      locationWarehouse: 'Warehouse A - Bay 04',
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      name: 'Amoxicillin 250mg Capsules (Box of 100)',
      sku: 'MED-AMOX-250',
      category: 'Antibiotics',
      unitPrice: 240.00,
      currentStock: 18,
      minStockAlert: 25,
      locationWarehouse: 'Warehouse A - Bay 09',
    },
  });

  const prod3 = await prisma.product.create({
    data: {
      name: 'Azithromycin 500mg (Box of 30)',
      sku: 'MED-AZITH-500',
      category: 'Antibiotics',
      unitPrice: 185.00,
      currentStock: 8,
      minStockAlert: 20,
      locationWarehouse: 'Warehouse B - Cold Rack 02',
    },
  });

  const prod4 = await prisma.product.create({
    data: {
      name: 'Cetirizine 10mg (Strip of 10)',
      sku: 'MED-CETI-010',
      category: 'Antihistamines',
      unitPrice: 14.00,
      currentStock: 620,
      minStockAlert: 150,
      locationWarehouse: 'Warehouse A - Bay 12',
    },
  });

  const prod5 = await prisma.product.create({
    data: {
      name: 'Omeprazole 20mg Capsules (Strip of 15)',
      sku: 'MED-OMEP-020',
      category: 'Antacids',
      unitPrice: 42.00,
      currentStock: 310,
      minStockAlert: 80,
      locationWarehouse: 'Warehouse A - Bay 07',
    },
  });

  const prod6 = await prisma.product.create({
    data: {
      name: 'Medical Nitrile Gloves Medium (Box of 100)',
      sku: 'DISP-GLOV-MED',
      category: 'Disposables',
      unitPrice: 310.00,
      currentStock: 0,
      minStockAlert: 30,
      locationWarehouse: 'Warehouse C - Shelf 03',
    },
  });

  console.log('Created 6 catalog products with stock thresholds');

  // 3. Create Customers
  const cust1 = await prisma.customer.create({
    data: {
      customerName: 'Apollo Healthcare Stores',
      mobileNumber: '+91 98765 43210',
      email: 'procurement@apollohealth.com',
      businessName: 'Apollo Health Retailers Pvt Ltd',
      gstNumber: '29ABCDE1234F1Z5',
      customerType: CustomerType.WHOLESALE,
      address: '42 Commercial Street, Bangalore, Karnataka 560001',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date('2026-09-15'),
      notes: 'Key wholesale client. Prefers bulk monthly shipments.',
    },
  });

  const cust2 = await prisma.customer.create({
    data: {
      customerName: 'MediLife Pharma Distributors',
      mobileNumber: '+91 98111 22334',
      email: 'orders@medilife.in',
      businessName: 'MediLife Distribution Logistics',
      gstNumber: '27AABCM9876Q1Z2',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Plot 18, Industrial Area Ph-2, Mumbai, Maharashtra 400072',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date('2026-09-12'),
      notes: 'Handles Western Region distribution network.',
    },
  });

  const cust3 = await prisma.customer.create({
    data: {
      customerName: 'Dr. Sharma Clinic & Meds',
      mobileNumber: '+91 97234 56789',
      email: 'contact@sharmaclinic.org',
      businessName: 'Sharma Wellness Clinics',
      gstNumber: '07AAACS1122D1Z9',
      customerType: CustomerType.RETAIL,
      address: '15 Ring Road, Lajpat Nagar, New Delhi 110024',
      status: CustomerStatus.LEAD,
      followUpDate: new Date('2026-09-11'),
      notes: 'Inquired about OTC pain relief and fever medications bulk discount.',
    },
  });

  // 4. Create Customer Notes
  await prisma.customerNote.create({
    data: {
      customerId: cust1.id,
      userId: sales.id,
      noteText: 'Spoke with Mr. Apollo regarding Q3 bulk order. Requested price list for antibiotics and analgesics.',
    },
  });

  await prisma.customerNote.create({
    data: {
      customerId: cust2.id,
      userId: sales.id,
      noteText: 'Delivery challan #CH-202609-0001 delivered successfully to warehouse hub.',
    },
  });

  // 5. Create Initial Stock Movement Logs
  await prisma.stockMovementLog.create({
    data: {
      productId: prod1.id,
      quantityChanged: 500,
      movementType: MovementType.IN,
      reason: 'Initial Factory Batch Receipt #PO-2026-881',
      createdById: warehouse.id,
    },
  });

  await prisma.stockMovementLog.create({
    data: {
      productId: prod1.id,
      quantityChanged: 50,
      movementType: MovementType.OUT,
      reason: 'Sales Challan Confirmation #CH-202609-0001',
      createdById: sales.id,
    },
  });

  // 6. Create Initial Challans with Snapshot Line Items
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-202609-0001',
      customerId: cust2.id,
      totalQuantity: 82,
      totalAmount: 8605.00,
      status: ChallanStatus.CONFIRMED,
      createdById: sales.id,
      confirmedAt: new Date(),
      items: {
        create: [
          {
            productId: prod1.id,
            snapshotProductName: prod1.name,
            snapshotSku: prod1.sku,
            snapshotUnitPrice: prod1.unitPrice,
            quantity: 50,
            subtotal: 925.00,
          },
          {
            productId: prod2.id,
            snapshotProductName: prod2.name,
            snapshotSku: prod2.sku,
            snapshotUnitPrice: prod2.unitPrice,
            quantity: 32,
            subtotal: 7680.00,
          },
        ],
      },
    },
  });

  await prisma.challan.create({
    data: {
      challanNumber: 'CH-202609-0002',
      customerId: cust1.id,
      totalQuantity: 140,
      totalAmount: 3080.00,
      status: ChallanStatus.DRAFT,
      createdById: sales.id,
      items: {
        create: [
          {
            productId: prod5.id,
            snapshotProductName: prod5.name,
            snapshotSku: prod5.sku,
            snapshotUnitPrice: prod5.unitPrice,
            quantity: 40,
            subtotal: 1680.00,
          },
          {
            productId: prod4.id,
            snapshotProductName: prod4.name,
            snapshotSku: prod4.sku,
            snapshotUnitPrice: prod4.unitPrice,
            quantity: 100,
            subtotal: 1400.00,
          },
        ],
      },
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });