import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, CustomerNote, Product, StockMovementLog, Challan } from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_NOTES,
  INITIAL_PRODUCTS,
  INITIAL_STOCK_LOGS,
  INITIAL_CHALLANS,
} from '../data/mockData';
import { customerApi, productApi, challanApi } from '../services/api';
import { useAuth } from './AuthContext';

interface DataContextType {
  customers: Customer[];
  customerNotes: CustomerNote[];
  products: Product[];
  stockLogs: StockMovementLog[];
  challans: Challan[];
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // Customer Actions
  addCustomer: (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Customer>;
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<void>;
  addCustomerNote: (customerId: string, noteText: string) => Promise<void>;

  // Product Actions
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
  adjustStock: (
    productId: string,
    quantity: number,
    movementType: 'IN' | 'OUT',
    reason: string
  ) => Promise<{ success: boolean; error?: string }>;

  // Challan Actions
  createChallan: (
    customerId: string,
    items: { productId: string; quantity: number }[],
    status: 'DRAFT' | 'CONFIRMED'
  ) => Promise<{ success: boolean; challan?: Challan; error?: string }>;
  confirmChallan: (challanId: string) => Promise<{ success: boolean; error?: string }>;
  cancelChallan: (challanId: string) => Promise<void>;

  // Computed metrics
  lowStockCount: number;
  outOfStockCount: number;
  totalCustomers: number;
  pendingChallansCount: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>(INITIAL_NOTES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [stockLogs, setStockLogs] = useState<StockMovementLog[]>(INITIAL_STOCK_LOGS);
  const [challans, setChallans] = useState<Challan[]>(INITIAL_CHALLANS);

  // Load data from live Backend API if connected
  const refreshData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [custRes, prodRes, chalRes, logsRes] = await Promise.allSettled([
        customerApi.getCustomers({ limit: 100 }),
        productApi.getProducts({ limit: 100 }),
        challanApi.getChallans({ limit: 100 }),
        productApi.getStockLogs({ limit: 100 }),
      ]);

      if (custRes.status === 'fulfilled' && custRes.value?.data) {
        setCustomers(custRes.value.data);
      }
      if (prodRes.status === 'fulfilled' && prodRes.value?.data) {
        // Parse Decimal strings to numbers for UI calculations
        const parsedProds = prodRes.value.data.map((p: any) => ({
          ...p,
          unitPrice: Number(p.unitPrice),
        }));
        setProducts(parsedProds);
      }
      if (chalRes.status === 'fulfilled' && chalRes.value?.data) {
        const parsedChallans = chalRes.value.data.map((c: any) => ({
          ...c,
          totalAmount: Number(c.totalAmount),
          customerName: c.customer?.customerName || c.customerName,
          customerBusiness: c.customer?.businessName || c.customerBusiness,
          createdByName: c.createdBy?.name || c.createdByName,
          items: (c.items || []).map((i: any) => ({
            ...i,
            snapshotUnitPrice: Number(i.snapshotUnitPrice),
            subtotal: Number(i.subtotal),
          })),
        }));
        setChallans(parsedChallans);
      }
      if (logsRes.status === 'fulfilled' && logsRes.value?.data) {
        const parsedLogs = logsRes.value.data.map((l: any) => ({
          ...l,
          productName: l.product?.name || l.productName || 'Product',
          userName: l.createdBy?.name || l.userName || 'System User',
        }));
        setStockLogs(parsedLogs);
      }
    } catch (err) {
      console.warn('Backend API refresh failed, using local in-memory store:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [token, user?.role]);

  // Customer handlers
  const addCustomer = async (
    customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Customer> => {
    try {
      const created = await customerApi.createCustomer(customerData);
      setCustomers((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      const fallback: Customer = {
        ...customerData,
        id: `cust-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCustomers((prev) => [fallback, ...prev]);
      return fallback;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      const updated = await customerApi.updateCustomer(id, customerData);
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    } catch (err) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...customerData, updatedAt: new Date().toISOString() } : c))
      );
    }
  };

  const addCustomerNote = async (customerId: string, noteText: string) => {
    try {
      const note = await customerApi.addNote(customerId, noteText);
      const parsedNote: CustomerNote = {
        id: note.id,
        customerId: note.customerId,
        userId: note.userId,
        userName: note.user?.name || user?.name || 'Current User',
        noteText: note.noteText,
        createdAt: note.createdAt,
      };
      setCustomerNotes((prev) => [parsedNote, ...prev]);
    } catch (err) {
      const fallbackNote: CustomerNote = {
        id: `note-${Date.now()}`,
        customerId,
        userId: user?.id || 'usr-anon',
        userName: user?.name || 'Current User',
        noteText,
        createdAt: new Date().toISOString(),
      };
      setCustomerNotes((prev) => [fallbackNote, ...prev]);
    }
  };

  // Product handlers
  const addProduct = async (
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Product> => {
    try {
      const created = await productApi.createProduct(productData);
      const parsed: Product = { ...created, unitPrice: Number(created.unitPrice) };
      setProducts((prev) => [parsed, ...prev]);
      await refreshData();
      return parsed;
    } catch (err) {
      const fallback: Product = {
        ...productData,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProducts((prev) => [fallback, ...prev]);
      return fallback;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const updated = await productApi.updateProduct(id, productData);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated, unitPrice: Number(updated.unitPrice) } : p))
      );
    } catch (err) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...productData, updatedAt: new Date().toISOString() } : p))
      );
    }
  };

  const adjustStock = async (
    productId: string,
    quantity: number,
    movementType: 'IN' | 'OUT',
    reason: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await productApi.adjustStock(productId, { quantity, movementType, reason });
      await refreshData();
      return { success: true };
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        `Insufficient stock! Cannot deduct ${quantity} units. Stock must not go negative.`;
      return { success: false, error: errorMsg };
    }
  };

  // Challan handlers with ACID backend execution
  const createChallan = async (
    customerId: string,
    items: { productId: string; quantity: number }[],
    status: 'DRAFT' | 'CONFIRMED'
  ): Promise<{ success: boolean; challan?: Challan; error?: string }> => {
    try {
      const res = await challanApi.createChallan({ customerId, items, status });
      const parsed: Challan = {
        ...res,
        totalAmount: Number(res.totalAmount),
        customerName: res.customer?.customerName || 'Customer',
        customerBusiness: res.customer?.businessName || '',
        createdByName: user?.name || 'Sales Staff',
        items: (res.items || []).map((i: any) => ({
          ...i,
          snapshotUnitPrice: Number(i.snapshotUnitPrice),
          subtotal: Number(i.subtotal),
        })),
      };
      setChallans((prev) => [parsed, ...prev]);
      await refreshData();
      return { success: true, challan: parsed };
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error || err.message || 'Failed to create sales challan';
      return { success: false, error: errorMsg };
    }
  };

  const confirmChallan = async (challanId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await challanApi.confirmChallan(challanId);
      await refreshData();
      return { success: true };
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error || err.message || 'Failed to confirm sales challan';
      return { success: false, error: errorMsg };
    }
  };

  const cancelChallan = async (challanId: string): Promise<void> => {
    try {
      await challanApi.cancelChallan(challanId);
      await refreshData();
    } catch (err) {
      setChallans((prev) =>
        prev.map((c) => (c.id === challanId ? { ...c, status: 'CANCELLED' } : c))
      );
    }
  };

  // Computed metrics
  const lowStockCount = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStockAlert).length;
  const outOfStockCount = products.filter((p) => p.currentStock === 0).length;
  const pendingChallansCount = challans.filter((c) => c.status === 'DRAFT').length;

  return (
    <DataContext.Provider
      value={{
        customers,
        customerNotes,
        products,
        stockLogs,
        challans,
        isLoading,
        refreshData,
        addCustomer,
        updateCustomer,
        addCustomerNote,
        addProduct,
        updateProduct,
        adjustStock,
        createChallan,
        confirmChallan,
        cancelChallan,
        lowStockCount,
        outOfStockCount,
        totalCustomers: customers.length,
        pendingChallansCount,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};